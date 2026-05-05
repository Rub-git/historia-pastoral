export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const now = new Date();

    // Get user settings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { inactiveThresholdDays: true },
    });

    const thresholdDays = user?.inactiveThresholdDays ?? 30;
    const thresholdDate = new Date(now.getTime() - thresholdDays * 24 * 60 * 60 * 1000);

    // Pending follow-ups (follow-up date is today or in the past, not completed)
    const pendingFollowUps = await prisma.accompanimentRecord.findMany({
      where: {
        member: { userId, isActive: true },
        followUpDate: { lte: now },
        followUpCompleted: false,
      },
      include: {
        member: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { followUpDate: 'asc' },
      take: 10,
    });

    // Inactive members (no accompaniment in threshold days)
    const allMembers = await prisma.member.findMany({
      where: { userId, isActive: true },
      include: {
        accompaniments: {
          orderBy: { encounterDate: 'desc' },
          take: 1,
        },
      },
    });

    const inactiveMembers = allMembers.filter((m: any) => {
      const lastContact = m.accompaniments?.[0]?.encounterDate;
      if (!lastContact) return true;
      return lastContact < thresholdDate;
    }).map((m: any) => ({
      id: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      lastContact: m.accompaniments?.[0]?.encounterDate || null,
    }));

    // Sensitive cases
    const sensitiveCases = await prisma.member.findMany({
      where: { userId, isActive: true, isSensitive: true },
      select: { id: true, firstName: true, lastName: true },
    });

    // Under observation
    const observationCases = await prisma.member.findMany({
      where: { userId, isActive: true, underObservation: true },
      select: { id: true, firstName: true, lastName: true },
    });

    // Total active members
    const totalMembers = await prisma.member.count({
      where: { userId, isActive: true },
    });

    return NextResponse.json({
      pendingFollowUps,
      inactiveMembers: inactiveMembers.slice(0, 10),
      sensitiveCases,
      observationCases,
      totalMembers,
      thresholdDays,
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}