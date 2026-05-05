import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

// GET - Get invitation details
export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const invitation = await prisma.teamInvitation.findUnique({
      where: { token: params.token },
      include: {
        owner: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: 'Invitation already used' }, { status: 400 });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invitation expired' }, { status: 400 });
    }

    return NextResponse.json({
      email: invitation.email,
      role: invitation.role,
      ownerName: invitation.owner.fullName,
      ownerEmail: invitation.owner.email,
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json({ error: 'Error fetching invitation' }, { status: 500 });
  }
}

// POST - Accept invitation
export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const userEmail = (session.user as any).email;

    const invitation = await prisma.teamInvitation.findUnique({
      where: { token: params.token },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: 'Invitation already used' }, { status: 400 });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invitation expired' }, { status: 400 });
    }

    // Verify email matches
    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'Esta invitación es para otro correo electrónico' },
        { status: 403 }
      );
    }

    // Check if user is already in a team
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.teamOwnerId) {
      return NextResponse.json(
        { error: 'Ya eres parte de otro equipo' },
        { status: 400 }
      );
    }

    // Accept invitation
    await prisma.$transaction([
      prisma.teamInvitation.update({
        where: { id: invitation.id },
        data: { status: 'accepted' },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          teamOwnerId: invitation.ownerId,
          role: invitation.role,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({ error: 'Error accepting invitation' }, { status: 500 });
  }
}
