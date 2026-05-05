import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

// This endpoint should be called daily by a cron job
// It evaluates 90-day retention for baptized students
export async function POST(request: Request) {
  try {
    // Verify cron secret (optional security measure)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all students due for retention evaluation
    const studentsToEvaluate = await prisma.student.findMany({
      where: {
        discipleshipStatus: 'BAPTIZED',
        retention90Status: 'PENDING',
        retention90DueDate: {
          lte: today
        }
      }
    });

    const results = {
      evaluated: 0,
      retained: 0,
      notRetained: 0,
      errors: [] as string[]
    };

    for (const student of studentsToEvaluate) {
      try {
        // Evaluation criteria:
        // 1. integrationConfirmedAt is set (manual confirmation by pastor)
        // This indicates active pastoral follow-up and integration
        
        const isRetained = student.integrationConfirmedAt !== null;

        await prisma.student.update({
          where: { id: student.id },
          data: {
            retention90Status: isRetained ? 'RETAINED' : 'NOT_RETAINED',
            retention90EvaluatedAt: new Date()
          }
        });

        results.evaluated++;
        if (isRetained) {
          results.retained++;
        } else {
          results.notRetained++;
        }
      } catch (err) {
        results.errors.push(`Error evaluating student ${student.id}: ${err}`);
      }
    }

    console.log(`[Retention Cron] Evaluated: ${results.evaluated}, Retained: ${results.retained}, Not Retained: ${results.notRetained}`);

    return NextResponse.json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error('Error in retention evaluation cron:', error);
    return NextResponse.json({ error: 'Error evaluating retention' }, { status: 500 });
  }
}

// GET endpoint to check pending evaluations (for testing/monitoring)
export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingCount = await prisma.student.count({
      where: {
        discipleshipStatus: 'BAPTIZED',
        retention90Status: 'PENDING',
        retention90DueDate: {
          lte: today
        }
      }
    });

    const upcomingCount = await prisma.student.count({
      where: {
        discipleshipStatus: 'BAPTIZED',
        retention90Status: 'PENDING',
        retention90DueDate: {
          gt: today
        }
      }
    });

    return NextResponse.json({
      pendingEvaluations: pendingCount,
      upcomingEvaluations: upcomingCount
    });
  } catch (error) {
    console.error('Error checking pending evaluations:', error);
    return NextResponse.json({ error: 'Error checking evaluations' }, { status: 500 });
  }
}
