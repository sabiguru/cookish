import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import MenuForm from '@/components/dashboard/MenuForm';

async function getAvailableCuisines() {
  const cuisines = await prisma.cuisine.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return cuisines;
}

export default async function NewMenuPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  const cuisines = await getAvailableCuisines();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Menu</h1>
        <p className="text-gray-600 mt-1">
          Add a new menu to your culinary offerings
        </p>
      </div>

      <MenuForm availableCuisines={cuisines} />
    </div>
  );
}
