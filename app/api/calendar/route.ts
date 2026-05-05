import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

// GET - Fetch all events
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get userId (team owner's id if part of a team)
    const userId = user.teamOwnerId || user.id;

    // Get query params for filtering
    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const whereClause: any = {
      userId,
      isActive: true,
    };

    if (start && end) {
      whereClause.startDate = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Error fetching events' }, { status: 500 });
  }
}

// POST - Create new event
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only owner and admin can create events
    if (user.role === 'leader') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const userId = user.teamOwnerId || user.id;
    const data = await req.json();

    const event = await prisma.calendarEvent.create({
      data: {
        userId,
        title: data.title,
        description: data.description || null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        allDay: data.allDay || false,
        eventType: data.eventType || 'general',
        location: data.location || null,
        isRecurring: data.isRecurring || false,
        recurrenceRule: data.recurrenceRule || null,
        reminderEnabled: data.reminderEnabled || false,
        reminderMinutes: data.reminderMinutes || null,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Error creating event' }, { status: 500 });
  }
}

// PUT - Update event
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'leader') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const userId = user.teamOwnerId || user.id;
    const data = await req.json();

    // Verify event belongs to user
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: { id: data.id, userId },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const event = await prisma.calendarEvent.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description || null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        allDay: data.allDay || false,
        eventType: data.eventType || 'general',
        location: data.location || null,
        isRecurring: data.isRecurring || false,
        recurrenceRule: data.recurrenceRule || null,
        reminderEnabled: data.reminderEnabled || false,
        reminderMinutes: data.reminderMinutes || null,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Error updating event' }, { status: 500 });
  }
}

// DELETE - Delete event
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'leader') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const userId = user.teamOwnerId || user.id;
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    // Verify event belongs to user
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: { id: eventId, userId },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    await prisma.calendarEvent.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Error deleting event' }, { status: 500 });
  }
}
