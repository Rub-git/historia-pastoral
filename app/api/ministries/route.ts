import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { getOwnerUserId } from '@/lib/get-owner-id';

export const runtime = 'nodejs';

// Default ministry positions
const DEFAULT_POSITIONS = [
  'El Anciano de Iglesia',
  'El Secretario de la Iglesia',
  'Tesorero de la Iglesia',
  'Miembro de la Junta de la Iglesia',
  'Miembros de la Junta de Nombramientos',
  'Director General de la Escuela Sabática',
  'Secretario de la Escuela Sabática',
  'Director de la Escuela Sabática de Jóvenes',
  'Asistente de la Escuela Sabática de Jóvenes',
  'Director de la Escuela Sabática de Jóvenes Adultos',
  'Asistente de la Escuela Sabática de Jóvenes Adultos',
  'Director de la Escuela Sabática de Niños',
  'Asistente de la Escuela Sabática de los Niños',
  'Maestro de Escuela Sabática de Adultos',
  'Maestro de la Escuela Sabática de los Niños',
  'Director de la Escuela Cristiana de Vacaciones',
  'Coordinador de Ministerios Juveniles',
  'Coordinador de los Ministerios de Jóvenes Adultos',
  'Coordinador del Ministerio de los Niños',
  'Líder de la Iglesia de los Niños',
  'Director del Club de Conquistadores',
  'Director del Club de Aventureros',
  'El Director de Ministerios de la Familia',
  'Directora Ministerios de la Mujer',
  'Director de la Sociedad de Hombres Adventistas',
  'Coordinador del Ministerios de Adultos',
  'Diáconos',
  'Diaconisas',
  'Director de Grupos Pequeños',
  'Coordinador de la Obra Misionera',
  'El Coordinador de las Misiones Mundiales',
  'Coordinador de Interesados',
  'El Instructor Bíblico Laico',
  'Evangelista Laico',
  'Pastor Laico',
  'Coordinador de Seminarios',
  'Director del Ministerios de Salud',
  'Director de Servicios a la Comunidad',
  'Voluntario de Servicios a la Comunidad',
  'Coordinator de Ministerios Urbanos',
  'Director de Asuntos Públicos y Libertad Religiosa',
  'Director del Departamento de Comunicación',
  'Ministerio de la Música',
  'Ministerio de la Hospitalidad',
  'Recepcionistas',
  'Ujieres',
  'Equipos de Visitación',
  'Director de Mayordomía',
  'Secretario del Fondo de Inversión',
  'Comisión de Planificación',
  'Director de la Comisión Social de la Iglesia',
  'Asociación Hogar y Escuela',
  'Presidente de la Comisión Escolar de la Iglesia',
  'Miembro de la Junta Escolar',
  'Secretario de Educación de la Iglesia',
  'Coordinador del Ministerio en Favor de Personas Discapacitadas',
  'Coordinador del ministerio de publicaciones',
];

// GET all ministry positions with assignments
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sessionUserId = (session.user as any).id;
    const userId = await getOwnerUserId(sessionUserId);

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();

    // Get all positions with assignments for the specified year
    const positions = await prisma.ministryPosition.findMany({
      where: { userId },
      include: {
        assignments: {
          where: { year },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ positions, year });
  } catch (error) {
    console.error('Error fetching ministries:', error);
    return NextResponse.json({ error: 'Error fetching ministries' }, { status: 500 });
  }
}

// POST - Create position or initialize defaults
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sessionUserId = (session.user as any).id;
    const userId = await getOwnerUserId(sessionUserId);

    const data = await request.json();

    // If action is 'initialize', create all default positions
    if (data.action === 'initialize') {
      const existingCount = await prisma.ministryPosition.count({ where: { userId } });
      
      if (existingCount > 0) {
        return NextResponse.json({ message: 'Positions already initialized' });
      }

      // Create all default positions
      await prisma.ministryPosition.createMany({
        data: DEFAULT_POSITIONS.map((name, index) => ({
          userId,
          name,
          sortOrder: index,
        })),
      });

      return NextResponse.json({ message: 'Positions initialized', count: DEFAULT_POSITIONS.length });
    }

    // Create a single new position
    if (data.name) {
      const position = await prisma.ministryPosition.create({
        data: {
          userId,
          name: data.name,
          category: data.category || null,
          sortOrder: data.sortOrder || 999,
        },
      });
      return NextResponse.json(position, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error creating position:', error);
    return NextResponse.json({ error: 'Error creating position' }, { status: 500 });
  }
}
