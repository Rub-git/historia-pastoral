import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { getOwnerUserId } from '@/lib/get-owner-id';

export const runtime = 'nodejs';

// GET all resources
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sessionUserId = (session.user as any).id;
    const userId = await getOwnerUserId(sessionUserId);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: any = { userId };
    if (category && category !== 'all') {
      where.category = category;
    }

    const resources = await prisma.resource.findMany({
      where,
      orderBy: [{ category: 'asc' }, { title: 'asc' }],
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json({ error: 'Error fetching resources' }, { status: 500 });
  }
}

// POST - Create a new resource
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sessionUserId = (session.user as any).id;
    const userId = await getOwnerUserId(sessionUserId);

    // Check role - only owner and admin can create resources
    const user = await prisma.user.findUnique({ where: { id: sessionUserId } });
    if (user?.role === 'leader') {
      return NextResponse.json({ error: 'No tienes permiso para crear recursos' }, { status: 403 });
    }

    const data = await request.json();

    if (!data.title || !data.category) {
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 });
    }

    const resource = await prisma.resource.create({
      data: {
        userId,
        title: data.title,
        description: data.description || null,
        category: data.category,
        resourceType: data.resourceType || 'link',
        externalUrl: data.externalUrl || null,
        cloud_storage_path: data.cloud_storage_path || null,
        fileName: data.fileName || null,
        fileSize: data.fileSize || null,
        isPublic: data.isPublic !== false,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json({ error: 'Error creating resource' }, { status: 500 });
  }
}

// PUT - Update a resource
export async function PUT(request: Request) {
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
      return NextResponse.json({ error: 'No tienes permiso para editar recursos' }, { status: 403 });
    }

    const data = await request.json();

    if (!data.id) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.resource.findFirst({
      where: { id: data.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const resource = await prisma.resource.update({
      where: { id: data.id },
      data: {
        title: data.title || existing.title,
        description: data.description,
        category: data.category || existing.category,
        resourceType: data.resourceType || existing.resourceType,
        externalUrl: data.externalUrl,
        cloud_storage_path: data.cloud_storage_path,
        fileName: data.fileName,
        fileSize: data.fileSize,
        isPublic: data.isPublic !== undefined ? data.isPublic : existing.isPublic,
      },
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json({ error: 'Error updating resource' }, { status: 500 });
  }
}

// DELETE - Delete a resource
export async function DELETE(request: Request) {
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
      return NextResponse.json({ error: 'No tienes permiso para eliminar recursos' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.resource.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    await prisma.resource.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json({ error: 'Error deleting resource' }, { status: 500 });
  }
}
