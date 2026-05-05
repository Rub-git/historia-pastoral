import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create test user
  const hashedPassword = await bcrypt.hash('johndoe123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      fullName: 'Pastor Juan',
      language: 'es',
      inactiveThresholdDays: 30,
      emailNotifications: false,
    },
  });

  console.log('Created user:', user.email);

  // Create sample members
  const member1 = await prisma.member.upsert({
    where: { id: 'sample-member-1' },
    update: {},
    create: {
      id: 'sample-member-1',
      userId: user.id,
      firstName: 'María',
      lastName: 'González',
      email: 'maria@ejemplo.com',
      phone: '+1 555-0101',
      isSensitive: false,
      underObservation: false,
      spiritualHistory: {
        create: {
          spiritualState: 'active',
          growthStage: 'development',
          spiritualGifts: 'Servicio, hospitalidad',
          growthAreas: 'Estudio bíblico, oración personal',
        },
      },
    },
  });

  const member2 = await prisma.member.upsert({
    where: { id: 'sample-member-2' },
    update: {},
    create: {
      id: 'sample-member-2',
      userId: user.id,
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      email: 'carlos@ejemplo.com',
      phone: '+1 555-0102',
      isSensitive: true,
      underObservation: true,
      spiritualHistory: {
        create: {
          spiritualState: 'in_crisis',
          growthStage: 'initial',
          confidentialObs: 'Atravesando dificultades familiares. Requiere acompañamiento cercano.',
        },
      },
    },
  });

  // Create sample accompaniment records
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  await prisma.accompanimentRecord.create({
    data: {
      memberId: member1.id,
      encounterDate: thirtyDaysAgo,
      encounterType: 'visit',
      reason: 'Visita de bienvenida',
      observations: 'Buen encuentro, muestra interés en participar más activamente.',
      followUpDate: sevenDaysAgo,
      followUpCompleted: true,
    },
  });

  await prisma.accompanimentRecord.create({
    data: {
      memberId: member2.id,
      encounterDate: sevenDaysAgo,
      encounterType: 'counseling',
      reason: 'Consejería pastoral por situación familiar',
      observations: 'Escucha atenta. Se oró juntos. Necesita seguimiento cercano.',
      commitments: 'Orar diariamente, asistir al grupo de apoyo',
      nextSteps: 'Verificar asistencia al grupo',
      followUpDate: threeDaysFromNow,
      followUpCompleted: false,
    },
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });