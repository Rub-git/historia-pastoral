import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        subscriptionStatus: true,
        subscriptionPlan: true,
        subscriptionEndDate: true,
        trialEndsAt: true,
        maxMembers: true,
        _count: {
          select: { members: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionEndDate: user.subscriptionEndDate,
      trialEndsAt: user.trialEndsAt,
      maxMembers: user.maxMembers,
      currentMembers: user._count.members,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Error fetching subscription' },
      { status: 500 }
    );
  }
}
