import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current year start
    const yearStart = new Date(new Date().getFullYear(), 0, 1);

    // Active students (STUDYING status)
    const activeStudents = await prisma.member.count({
      where: {
        userId: user.id,
        discipleshipStatus: 'STUDYING',
      },
    });

    // Preparing for baptism
    const preparingBaptism = await prisma.member.count({
      where: {
        userId: user.id,
        discipleshipStatus: 'PREPARING',
      },
    });

    // Baptisms this year
    const baptismsThisYear = await prisma.member.count({
      where: {
        userId: user.id,
        discipleshipStatus: 'BAPTIZED',
        discipleBaptismDate: {
          gte: yearStart,
        },
      },
    });

    // 90-day consolidations completed
    const consolidationsCompleted = await prisma.member.count({
      where: {
        userId: user.id,
        consolidationStage: 'COMPLETED',
      },
    });

    // Interest count
    const interestCount = await prisma.member.count({
      where: {
        userId: user.id,
        discipleshipStatus: 'INTEREST',
      },
    });

    // Total in pipeline
    const totalInPipeline = await prisma.member.count({
      where: {
        userId: user.id,
        discipleshipStatus: { not: 'NONE' },
      },
    });

    return NextResponse.json({
      activeStudents,
      preparingBaptism,
      baptismsThisYear,
      consolidationsCompleted,
      interestCount,
      totalInPipeline,
    });
  } catch (error) {
    console.error('Error fetching discipleship metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
