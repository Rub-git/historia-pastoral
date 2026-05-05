import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

// POST - Create or update assignment
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const data = await request.json();
    const { positionId, year, personName, phone, email, notes } = data;

    if (!positionId || !year || !personName) {
      return NextResponse.json(
        { error: 'Position ID, year, and person name are required' },
        { status: 400 }
      );
    }

    // Verify position belongs to user
    const position = await prisma.ministryPosition.findFirst({
      where: { id: positionId, userId },
    });

    if (!position) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 });
    }

    const assignment = await prisma.ministryAssignment.create({
      data: {
        positionId,
        year,
        personName: personName.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: 'Error creating assignment' }, { status: 500 });
  }
}

// PUT - Update assignment
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const data = await request.json();
    const { id, personName, phone, email, notes } = data;

    if (!id) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    // Verify assignment belongs to user (via position)
    const assignment = await prisma.ministryAssignment.findFirst({
      where: { id },
      include: { position: true },
    });

    if (!assignment || assignment.position.userId !== userId) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const updated = await prisma.ministryAssignment.update({
      where: { id },
      data: {
        personName: personName?.trim() || assignment.personName,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json({ error: 'Error updating assignment' }, { status: 500 });
  }
}

// DELETE - Remove assignment
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    // Verify assignment belongs to user
    const assignment = await prisma.ministryAssignment.findFirst({
      where: { id },
      include: { position: true },
    });

    if (!assignment || assignment.position.userId !== userId) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    await prisma.ministryAssignment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json({ error: 'Error deleting assignment' }, { status: 500 });
  }
}
