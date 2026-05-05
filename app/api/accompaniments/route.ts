export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const data = await request.json();

    // Verify member belongs to user
    const member = await prisma.member.findFirst({
      where: { id: data.memberId, userId },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const record = await prisma.accompanimentRecord.create({
      data: {
        memberId: data.memberId,
        encounterDate: new Date(data.encounterDate),
        encounterType: data.encounterType,
        reason: data.reason || null,
        observations: data.observations || null,
        commitments: data.commitments || null,
        nextSteps: data.nextSteps || null,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error creating accompaniment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}