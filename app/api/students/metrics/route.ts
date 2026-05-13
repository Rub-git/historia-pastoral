import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);

    // Count active students (INTEREST, STUDYING, PREPARING)
    const activeStudents = await prisma.student.count({
      where: {
        userId,
        discipleshipStatus: { in: ['INTEREST', 'STUDYING', 'PREPARING'] }
      }
    });

    // Count preparing for baptism
    const preparingBaptism = await prisma.student.count({
      where: {
        userId,
        discipleshipStatus: 'PREPARING'
      }
    });

    // Count baptisms this year
    const baptismsThisYear = await prisma.student.count({
      where: {
        userId,
        discipleshipStatus: 'BAPTIZED',
        baptismDate: { gte: yearStart }
      }
    });

    // Count 90-day consolidations completed
    const consolidationsCompleted = await prisma.student.count({
      where: {
        userId,
        consolidationStage: 'COMPLETED'
      }
    });

    // 90-Day Retention Metrics (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const retained12Months = await prisma.student.count({
      where: {
        userId,
        retention90Status: 'RETAINED',
        retention90EvaluatedAt: { gte: twelveMonthsAgo }
      }
    });

    const notRetained12Months = await prisma.student.count({
      where: {
        userId,
        retention90Status: 'NOT_RETAINED',
        retention90EvaluatedAt: { gte: twelveMonthsAgo }
      }
    });

    const totalEvaluated12Months = retained12Months + notRetained12Months;
    const retentionRate = totalEvaluated12Months > 0 
      ? Math.round((retained12Months / totalEvaluated12Months) * 100) 
      : null;

    // Pending 90-day evaluations
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingRetentionEvaluations = await prisma.student.count({
      where: {
        userId,
        discipleshipStatus: 'BAPTIZED',
        retention90Status: 'PENDING'
      }
    });

    // Total evaluated this year
    const totalEvaluatedThisYear = await prisma.student.count({
      where: {
        userId,
        retention90Status: { in: ['RETAINED', 'NOT_RETAINED'] },
        retention90EvaluatedAt: { gte: yearStart }
      }
    });

    return NextResponse.json({
      activeStudents,
      preparingBaptism,
      baptismsThisYear,
      consolidationsCompleted,
      // Retention metrics
      retentionRate,
      retained12Months,
      notRetained12Months,
      pendingRetentionEvaluations,
      totalEvaluatedThisYear
    });
  } catch (error) {
    console.error('Error fetching student metrics:', error);
    return NextResponse.json({ error: 'Error fetching metrics' }, { status: 500 });
  }
}
