import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { getOwnerUserId } from '@/lib/get-owner-id';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET all ministry groups
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sessionUserId = (session.user as any).id;
    const userId = await getOwnerUserId(sessionUserId);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const where: any = { userId };
    if (type && type !== 'all') {
      where.type = type;
    }

    const groups = await prisma.ministryGroup.findMany({
      where,
      include: {
        members: {
          orderBy: { fullName: 'asc' },
        },
      },
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Error fetching ministry groups:', error);
    return NextResponse.json({ error: 'Error fetching ministry groups' }, { status: 500 });
  }
}

// POST - Create a new ministry group
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sessionUserId = (session.user as any).id;
    const userId = await getOwnerUserId(sessionUserId);

    // Check role
    const user = await prisma.user.findUnique({ where: { id: sessionUserId } });
    if (user?.role === 'leader') {
      return NextResponse.json({ error: 'No tienes permiso' }, { status: 403 });
    }

    const data = await request.json();

    if (!data.name || !data.type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    const group = await prisma.ministryGroup.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        customName: data.customName || null,
        motto: data.motto || null,
        description: data.description || null,
        classNumber: data.classNumber || null,
        teacher: data.teacher || null,
        sortOrder: data.sortOrder || 0,
      },
      include: { members: true },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error('Error creating ministry group:', error);
    return NextResponse.json({ error: 'Error creating ministry group' }, { status: 500 });
  }
}

// PUT - Update a ministry group
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sessionUserId = (session.user as any).id;
    const userId = await getOwnerUserId(sessionUserId);

    const user = await prisma.user.findUnique({ where: { id: sessionUserId } });
    if (user?.role === 'leader') {
      return NextResponse.json({ error: 'No tienes permiso' }, { status: 403 });
    }

    const data = await request.json();

    if (!data.id) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.ministryGroup.findFirst({
      where: { id: data.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const group = await prisma.ministryGroup.update({
      where: { id: data.id },
      data: {
        name: data.name || existing.name,
        customName: data.customName,
        motto: data.motto,
        description: data.description,
        classNumber: data.classNumber,
        teacher: data.teacher,
        isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
      },
      include: { members: true },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error updating ministry group:', error);
    return NextResponse.json({ error: 'Error updating ministry group' }, { status: 500 });
  }
}

// DELETE - Delete a ministry group
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sessionUserId = (session.user as any).id;
    const userId = await getOwnerUserId(sessionUserId);

    const user = await prisma.user.findUnique({ where: { id: sessionUserId } });
    if (user?.role === 'leader') {
      return NextResponse.json({ error: 'No tienes permiso' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    const existing = await prisma.ministryGroup.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    await prisma.ministryGroup.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ministry group:', error);
    return NextResponse.json({ error: 'Error deleting ministry group' }, { status: 500 });
  }
}
