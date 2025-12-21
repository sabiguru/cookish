import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

async function getChefMenus(userId: string) {
  const chef = await prisma.chefProfile.findUnique({
    where: { userId },
  });

  if (!chef) {
    return null;
  }

  const menus = await prisma.menu.findMany({
    where: { chefId: chef.id },
    include: {
      items: true,
      _count: {
        select: {
          bookings: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return menus;
}

export default async function ChefMenusPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  const menus = await getChefMenus(session.user.id);

  if (!menus) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Chef profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600 mt-1">Create and manage your culinary offerings</p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/chef/menus/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Menu
          </Link>
        </Button>
      </div>

      {menus.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map((menu) => (
            <Card key={menu.id} className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{menu.title}</CardTitle>
                    <div className="flex flex-wrap gap-1">
                      {menu.cuisines.map((cuisine) => (
                        <Badge
                          key={cuisine.id}
                          variant="secondary"
                          className="text-xs rounded-full"
                        >
                          {cuisine.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {menu.description}
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Price per person</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(menu.pricePerPerson)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bookings</span>
                    <span className="font-semibold text-gray-900">
                      {menu._count.bookings}
                    </span>
                  </div>
                  {menu.servingSize && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Serving size</span>
                      <span className="text-sm text-gray-900">
                        {menu.servingSize}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1 rounded-lg">
                    <Link href={`/menu/${menu.id}`}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1 rounded-lg">
                    <Link href={`/chef/menus/${menu.id}/edit`}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No menus yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first menu to start receiving booking requests from customers
              </p>
              <Button asChild className="rounded-xl">
                <Link href="/chef/menus/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Menu
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
