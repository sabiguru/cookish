import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addCuisineDescriptions() {
  console.log('Adding cuisine descriptions...');

  // Get Maria and James
  const maria = await prisma.chefProfile.findFirst({
    where: { user: { email: 'chef.maria@example.com' } },
    include: { cuisines: true }
  });

  const james = await prisma.chefProfile.findFirst({
    where: { user: { email: 'chef.james@example.com' } },
    include: { cuisines: true }
  });

  if (!maria || !james) {
    console.log('Chefs not found');
    return;
  }

  // Update Maria's cuisine descriptions
  for (const chefCuisine of maria.cuisines) {
    const cuisine = await prisma.cuisine.findUnique({ where: { id: chefCuisine.cuisineId } });

    let description = '';
    if (cuisine?.name === 'Italian') {
      description = 'Authentic Tuscan and Northern Italian cuisine. I specialize in handmade pasta, risotto, and traditional wood-fired dishes. My recipes have been passed down through three generations of my family.';
    } else if (cuisine?.name === 'Mediterranean') {
      description = 'Fresh, healthy Mediterranean flavors focusing on seasonal ingredients, olive oil, fresh herbs, and seafood. Perfect for those seeking lighter, heart-healthy options without compromising on taste.';
    }

    await prisma.chefCuisine.update({
      where: {
        chefId_cuisineId: {
          chefId: maria.id,
          cuisineId: chefCuisine.cuisineId
        }
      },
      data: { description }
    });
  }

  console.log('✓ Added descriptions for Maria');

  // Update James's cuisine descriptions
  for (const chefCuisine of james.cuisines) {
    const cuisine = await prisma.cuisine.findUnique({ where: { id: chefCuisine.cuisineId } });

    let description = '';
    if (cuisine?.name === 'Mexican') {
      description = 'Texas-style BBQ with Mexican influences - think slow-smoked brisket tacos, chipotle-rubbed ribs, and authentic street-style sides. I blend traditional BBQ techniques with bold Mexican spices and flavors for a unique fusion experience.';
    }

    await prisma.chefCuisine.update({
      where: {
        chefId_cuisineId: {
          chefId: james.id,
          cuisineId: chefCuisine.cuisineId
        }
      },
      data: { description }
    });
  }

  console.log('✓ Added descriptions for James');
  console.log('\nAll cuisine descriptions added!');

  await prisma.$disconnect();
}

addCuisineDescriptions()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
