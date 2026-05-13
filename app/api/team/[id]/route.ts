import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PUT - Update team member role
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const data = await request.json();
    const { role } = data;
    const memberId = params.id;

    const validRoles = ['admin', 'leader'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Verify ownership
    const member = await prisma.user.findFirst({
      where: {
        id: memberId,
        teamOwnerId: userId,
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: memberId },
      data: { role },
    });

    return NextResponse.json({ success: true, member: updated });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({ error: 'Error updating team member' }, { status: 500 });
  }
}

// DELETE - Remove team member
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const memberId = params.id;

    // Verify ownership
    const member = await prisma.user.findFirst({
      where: {
        id: memberId,
        teamOwnerId: userId,
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    // Remove from team (don't delete the user, just unlink)
    await prisma.user.update({
      where: { id: memberId },
      data: {
        teamOwnerId: null,
        role: 'owner', // Reset to owner of their own account
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json({ error: 'Error removing team member' }, { status: 500 });
  }
}
