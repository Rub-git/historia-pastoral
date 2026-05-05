export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        fullName: true,
        email: true,
        language: true,
        inactiveThresholdDays: true,
        emailNotifications: true,
        role: true,
        teamOwnerId: true,
        subscriptionPlan: true,
        maxTeamMembers: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const data = await request.json();

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        language: data.language,
        inactiveThresholdDays: data.inactiveThresholdDays,
        emailNotifications: data.emailNotifications,
      },
      select: {
        fullName: true,
        email: true,
        language: true,
        inactiveThresholdDays: true,
        emailNotifications: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}