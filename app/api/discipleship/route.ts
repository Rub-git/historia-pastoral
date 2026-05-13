import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Fetch all members with discipleship data
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

    // Get all members with discipleship status != NONE
    const members = await prisma.member.findMany({
      where: {
        userId: user.id,
        discipleshipStatus: { not: 'NONE' },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        discipleshipStatus: true,
        currentLesson: true,
        lessonsCompleted: true,
        discipleBaptismDate: true,
        mentorAssigned: true,
        consolidationStage: true,
      },
      orderBy: { firstName: 'asc' },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching discipleship data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update member's discipleship status
export async function PUT(req: NextRequest) {
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

    const { memberId, discipleshipStatus, currentLesson, lessonsCompleted, mentorAssigned, consolidationStage, discipleBaptismDate } = await req.json();

    // Verify member belongs to user
    const member = await prisma.member.findFirst({
      where: { id: memberId, userId: user.id },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};
    
    if (discipleshipStatus !== undefined) {
      updateData.discipleshipStatus = discipleshipStatus;
      
      // Auto-set baptism date and consolidation when status changes to BAPTIZED
      if (discipleshipStatus === 'BAPTIZED' && member.discipleshipStatus !== 'BAPTIZED') {
        updateData.discipleBaptismDate = new Date();
        updateData.consolidationStage = '30_DAYS';
      }
    }
    
    if (currentLesson !== undefined) updateData.currentLesson = currentLesson;
    if (lessonsCompleted !== undefined) updateData.lessonsCompleted = lessonsCompleted;
    if (mentorAssigned !== undefined) updateData.mentorAssigned = mentorAssigned;
    if (consolidationStage !== undefined) updateData.consolidationStage = consolidationStage;
    if (discipleBaptismDate !== undefined) updateData.discipleBaptismDate = discipleBaptismDate ? new Date(discipleBaptismDate) : null;

    const updated = await prisma.member.update({
      where: { id: memberId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating discipleship status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
