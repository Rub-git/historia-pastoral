export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';

    const members = await prisma.member.findMany({
      where: {
        userId,
        isActive: true,
        OR: search ? [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ] : undefined,
      },
      include: {
        spiritualHistory: true,
        accompaniments: {
          orderBy: { encounterDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastName: 'asc' },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const data = await request.json();

    const member = await prisma.member.create({
      data: {
        userId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        notes: data.notes || null,
        // Personal and family context
        maritalStatus: data.maritalStatus || null,
        employmentStatus: data.employmentStatus || null,
        occupation: data.occupation || null,
        hasChildren: data.hasChildren || null,
        previousChurch: data.previousChurch || null,
        countryOfOrigin: data.countryOfOrigin || null,
        // Flags
        isSensitive: data.isSensitive || false,
        underObservation: data.underObservation || false,
        // Discipleship Pipeline
        discipleshipStatus: data.discipleshipStatus || 'NONE',
        currentLesson: data.currentLesson || null,
        lessonsCompleted: data.lessonsCompleted || 0,
        mentorAssigned: data.mentorAssigned || null,
        baptismCohort: data.baptismCohort || null,
        spiritualHistory: {
          create: {
            conversionDate: data.conversionDate ? new Date(data.conversionDate) : null,
            baptismDate: data.baptismDate ? new Date(data.baptismDate) : null,
            spiritualState: data.spiritualState || 'active',
            growthStage: data.growthStage || '',
            spiritualGifts: data.spiritualGifts || null,
            growthAreas: data.growthAreas || null,
            confidentialObs: data.confidentialObs || null,
          },
        },
      },
      include: { spiritualHistory: true },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}