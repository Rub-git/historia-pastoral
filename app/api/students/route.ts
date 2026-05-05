import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { getOwnerUserId } from '@/lib/get-owner-id';

export const runtime = 'nodejs';

// GET all students for the current user (or team owner)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sessionUserId = (session.user as any).id;
    const userId = await getOwnerUserId(sessionUserId);

    const students = await prisma.student.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Error fetching students' }, { status: 500 });
  }
}

// POST - create a new student
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const data = await request.json();

    // Check student limit based on subscription (using same maxMembers limit)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { students: true, members: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const totalPeople = user._count.students + user._count.members;
    if (totalPeople >= user.maxMembers) {
      return NextResponse.json(
        { error: 'Has alcanzado el límite de tu plan. Actualiza tu suscripción para agregar más personas.' },
        { status: 403 }
      );
    }

    const student = await prisma.student.create({
      data: {
        userId,
        firstName: data.firstName,
        lastName: data.lastName || '',
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        discipleshipStatus: data.discipleshipStatus || 'INTEREST',
        currentLesson: data.currentLesson || null,
        lessonsCompleted: data.lessonsCompleted || 0,
        mentorAssigned: data.mentorAssigned || null,
        baptismCohort: data.baptismCohort || null,
        notes: data.notes || null,
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Error creating student' }, { status: 500 });
  }
}

// PUT - update a student
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.student.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Auto-set baptism date, consolidation stage, and retention fields when status changes to BAPTIZED
    if (updateData.discipleshipStatus === 'BAPTIZED' && existing.discipleshipStatus !== 'BAPTIZED') {
      const baptismDate = new Date();
      const retention90DueDate = new Date(baptismDate);
      retention90DueDate.setDate(retention90DueDate.getDate() + 90);
      
      updateData.baptismDate = baptismDate;
      updateData.consolidationStage = '30_DAYS';
      updateData.retention90Status = 'PENDING';
      updateData.retention90DueDate = retention90DueDate;
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email: updateData.email || null,
        phone: updateData.phone || null,
        address: updateData.address !== undefined ? (updateData.address || null) : existing.address,
        discipleshipStatus: updateData.discipleshipStatus,
        currentLesson: updateData.currentLesson || null,
        lessonsCompleted: updateData.lessonsCompleted ?? existing.lessonsCompleted,
        mentorAssigned: updateData.mentorAssigned || null,
        baptismCohort: updateData.baptismCohort || null,
        consolidationStage: updateData.consolidationStage || existing.consolidationStage,
        baptismDate: updateData.baptismDate || existing.baptismDate,
        notes: updateData.notes || null,
        // Retention fields
        retention90Status: updateData.retention90Status || existing.retention90Status,
        retention90DueDate: updateData.retention90DueDate || existing.retention90DueDate,
        integrationConfirmedAt: updateData.integrationConfirmedAt || existing.integrationConfirmedAt,
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ error: 'Error updating student' }, { status: 500 });
  }
}
