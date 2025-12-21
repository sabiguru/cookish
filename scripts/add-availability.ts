import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addAvailability() {
  console.log('Adding availability data...');

  // Get the chefs
  const maria = await prisma.chefProfile.findFirst({
    where: { user: { email: 'chef.maria@example.com' } }
  });

  const james = await prisma.chefProfile.findFirst({
    where: { user: { email: 'chef.james@example.com' } }
  });

  if (!maria || !james) {
    console.log('Chefs not found');
    return;
  }

  console.log('Found chefs:', maria.id, james.id);

  // Add availability for Maria
  const today = new Date();

  // Maria - Available next week
  await prisma.availability.createMany({
    data: [
      {
        chefId: maria.id,
        type: 'AVAILABLE',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 18, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 23, 0),
        note: 'Available for dinner service',
      },
      {
        chefId: maria.id,
        type: 'AVAILABLE',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10, 12, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10, 22, 0),
        note: 'Full day availability - perfect for events',
      },
      {
        chefId: maria.id,
        type: 'AVAILABLE',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14, 19, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14, 23, 0),
      },
      {
        chefId: maria.id,
        type: 'UNAVAILABLE',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 21, 0, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 28, 23, 59),
        note: 'Family vacation',
      },
    ],
  });

  console.log('✓ Availability added for Maria');

  // James - Available next few weekends
  await prisma.availability.createMany({
    data: [
      {
        chefId: james.id,
        type: 'AVAILABLE',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 11, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 20, 0),
        note: 'Perfect for BBQ parties - bring the smoker!',
      },
      {
        chefId: james.id,
        type: 'AVAILABLE',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, 12, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, 21, 0),
        note: 'Weekend BBQ special',
      },
      {
        chefId: james.id,
        type: 'AVAILABLE',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12, 10, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12, 22, 0),
        note: 'Full day - great for large events',
      },
      {
        chefId: james.id,
        type: 'AVAILABLE',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 13, 11, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 13, 20, 0),
      },
    ],
  });

  console.log('✓ Availability added for James');
  console.log('\nAll done! Chefs now have availability schedules.');

  await prisma.$disconnect();
}

addAvailability()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
