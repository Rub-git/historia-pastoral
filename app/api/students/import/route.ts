import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

// POST - bulk import students
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { students: studentsData } = await request.json();

    if (!Array.isArray(studentsData) || studentsData.length === 0) {
      return NextResponse.json({ error: 'No students provided' }, { status: 400 });
    }

    // Check limit
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
    const remainingSlots = user.maxMembers - totalPeople;

    if (studentsData.length > remainingSlots) {
      return NextResponse.json(
        { 
          error: `Solo puedes agregar ${remainingSlots} estudiantes más. Tu plan permite ${user.maxMembers} personas en total.` 
        },
        { status: 403 }
      );
    }

    // Valid status values
    const validStatuses = ['INTEREST', 'STUDYING', 'PREPARING', 'BAPTIZED'];

    // Create students
    const createdStudents = await prisma.$transaction(
      studentsData.map((student: {
        firstName?: string;
        lastName?: string;
        name?: string;
        phone?: string;
        email?: string;
        address?: string;
        status?: string;
        currentLesson?: string;
        baptismCohort?: string;
        notes?: string;
      }) => {
        // Support both new format (firstName/lastName) and legacy format (name)
        let firstName = '';
        let lastName = '';
        if (student.firstName) {
          firstName = student.firstName.trim();
          lastName = (student.lastName || '').trim();
        } else if (student.name) {
          const nameParts = student.name.trim().split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        }
        
        // Validate and default status
        let status = (student.status || 'STUDYING').toUpperCase();
        if (!validStatuses.includes(status)) {
          status = 'STUDYING';
        }

        return prisma.student.create({
          data: {
            userId,
            firstName,
            lastName,
            phone: student.phone || null,
            email: student.email || null,
            address: student.address || null,
            discipleshipStatus: status,
            currentLesson: student.currentLesson || null,
            baptismCohort: student.baptismCohort || null,
            notes: student.notes || null,
          },
        });
      })
    );

    return NextResponse.json({ 
      success: true, 
      count: createdStudents.length 
    }, { status: 201 });
  } catch (error) {
    console.error('Error importing students:', error);
    return NextResponse.json({ error: 'Error importing students' }, { status: 500 });
  }
}
