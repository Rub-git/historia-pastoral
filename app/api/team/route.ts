import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - List team members and pending invitations
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
        id: true,
        role: true,
        teamOwnerId: true,
        subscriptionPlan: true,
        maxTeamMembers: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only owners can manage team
    if (user.role !== 'owner') {
      return NextResponse.json({ error: 'Only the owner can manage the team' }, { status: 403 });
    }

    // Get team members
    const teamMembers = await prisma.user.findMany({
      where: { teamOwnerId: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get pending invitations
    const pendingInvitations = await prisma.teamInvitation.findMany({
      where: {
        ownerId: userId,
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      teamMembers,
      pendingInvitations,
      maxTeamMembers: user.maxTeamMembers,
      currentCount: teamMembers.length,
      plan: user.subscriptionPlan,
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ error: 'Error fetching team' }, { status: 500 });
  }
}

// POST - Invite a new team member
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const data = await request.json();
    const { email, role } = data;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const validRoles = ['admin', 'leader'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: { select: { teamMembers: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'owner') {
      return NextResponse.json({ error: 'Only the owner can invite team members' }, { status: 403 });
    }

    // Check plan limits
    if (user.maxTeamMembers <= 0) {
      return NextResponse.json(
        { error: 'Tu plan no incluye miembros de equipo. Actualiza a Team o Church.' },
        { status: 403 }
      );
    }

    if (user._count.teamMembers >= user.maxTeamMembers) {
      return NextResponse.json(
        { error: `Has alcanzado el límite de ${user.maxTeamMembers} miembros de equipo.` },
        { status: 403 }
      );
    }

    // Check if email already exists as team member
    const existingMember = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        teamOwnerId: userId,
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'Esta persona ya es parte de tu equipo' }, { status: 400 });
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.teamInvitation.findFirst({
      where: {
        ownerId: userId,
        email: email.toLowerCase(),
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvitation) {
      return NextResponse.json({ error: 'Ya existe una invitación pendiente para este correo' }, { status: 400 });
    }

    // Create invitation
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invitation = await prisma.teamInvitation.create({
      data: {
        ownerId: userId,
        email: email.toLowerCase(),
        role: role || 'leader',
        token,
        expiresAt,
      },
    });

    // In production, send email with invitation link
    const inviteUrl = `${process.env.NEXTAUTH_URL}/join-team?token=${token}`;
    console.log('Team invitation link:', inviteUrl);

    return NextResponse.json({
      success: true,
      invitation,
      // For development, return the link
      inviteUrl,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json({ error: 'Error creating invitation' }, { status: 500 });
  }
}
