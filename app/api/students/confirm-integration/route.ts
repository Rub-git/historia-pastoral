import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST - confirm integration for a student
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    // Verify ownership and that student is baptized
    const student = await prisma.student.findFirst({
      where: { 
        id: studentId, 
        userId,
        discipleshipStatus: 'BAPTIZED'
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Baptized student not found' }, { status: 404 });
    }

    // If already confirmed, just return success
    if (student.integrationConfirmedAt) {
      return NextResponse.json({ 
        success: true, 
        alreadyConfirmed: true,
        confirmedAt: student.integrationConfirmedAt 
      });
    }

    // Confirm integration
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        integrationConfirmedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      confirmedAt: updatedStudent.integrationConfirmedAt 
    });
  } catch (error) {
    console.error('Error confirming integration:', error);
    return NextResponse.json({ error: 'Error confirming integration' }, { status: 500 });
  }
}
