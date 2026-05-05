import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { getOwnerUserId } from '@/lib/get-owner-id';

export const runtime = 'nodejs';

// POST - Add member to a group
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sessionUserId = (session.user as any).id;
    const userId = await getOwnerUserId(sessionUserId);

    const data = await request.json();

    if (!data.groupId || !data.fullName) {
      return NextResponse.json({ error: 'Group ID and name are required' }, { status: 400 });
    }

    // Verify group ownership
    const group = await prisma.ministryGroup.findFirst({
      where: { id: data.groupId, userId },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const member = await prisma.ministryGroupMember.create({
      data: {
        groupId: data.groupId,
        fullName: data.fullName,
        phone: data.phone || null,
        email: data.email || null,
        role: data.role || null,
        notes: data.notes || null,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json({ error: 'Error adding member' }, { status: 500 });
  }
}

// PUT - Update a member
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sessionUserId = (session.user as any).id;
    const userId = await getOwnerUserId(sessionUserId);

    const data = await request.json();

    if (!data.id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    // Verify ownership through group
    const existing = await prisma.ministryGroupMember.findUnique({
      where: { id: data.id },
      include: { group: true },
    });

    if (!existing || existing.group.userId !== userId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const member = await prisma.ministryGroupMember.update({
      where: { id: data.id },
      data: {
        fullName: data.fullName || existing.fullName,
        phone: data.phone,
        email: data.email,
        role: data.role,
        notes: data.notes,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'Error updating member' }, { status: 500 });
  }
}

// DELETE - Remove a member
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sessionUserId = (session.user as any).id;
    const userId = await getOwnerUserId(sessionUserId);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    // Verify ownership through group
    const existing = await prisma.ministryGroupMember.findUnique({
      where: { id },
      include: { group: true },
    });

    if (!existing || existing.group.userId !== userId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    await prisma.ministryGroupMember.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json({ error: 'Error deleting member' }, { status: 500 });
  }
}
