import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { _count: { select: { members: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { students } = await req.json();

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: 'No students provided' }, { status: 400 });
    }

    // Check member limit
    const currentCount = user._count.members;
    const maxAllowed = user.maxMembers;
    const newTotal = currentCount + students.length;

    if (newTotal > maxAllowed) {
      return NextResponse.json(
        { 
          error: 'Member limit exceeded',
          message: `Cannot import ${students.length} students. Current: ${currentCount}, Max: ${maxAllowed}`,
        },
        { status: 400 }
      );
    }

    // Process and create members
    const created = [];
    const errors = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      // Validate required fields
      if (!student.name || !student.phone) {
        errors.push({ row: i + 1, error: 'Name and phone are required' });
        continue;
      }

      // Parse name into firstName and lastName
      const nameParts = student.name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      try {
        const member = await prisma.member.create({
          data: {
            userId: user.id,
            firstName,
            lastName,
            phone: student.phone,
            email: student.email || null,
            discipleshipStatus: student.status || 'STUDYING',
            currentLesson: student.currentLesson || null,
            lessonsCompleted: parseInt(student.lessonsCompleted) || 0,
            mentorAssigned: student.mentorAssigned || null,
          },
        });
        created.push(member);
      } catch (err) {
        errors.push({ row: i + 1, error: 'Failed to create member' });
      }
    }

    return NextResponse.json({
      success: true,
      imported: created.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error importing students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
