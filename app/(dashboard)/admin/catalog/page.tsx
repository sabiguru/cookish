import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';

async function getCatalogData() {
  try {
    const [cuisines, dietTags, occasions] = await Promise.all([
      prisma.cuisine.findMany({
        include: {
          _count: {
            select: {
              chefs: true,
              menus: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.dietTag.findMany({
        include: {
          _count: {
            select: {
              menus: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.occasion.findMany({
        orderBy: { name: 'asc' },
      }),
    ]);

    return { cuisines, dietTags, occasions };
  } catch (error) {
    console.error('Error fetching catalog data:', error);
    return { cuisines: [], dietTags: [], occasions: [] };
  }
}

export default async function AdminCatalogPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  const data = await getCatalogData();

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Catalog Management</h1>
        <p className="text-gray-600 mt-1">Manage cuisines, dietary tags, and occasions</p>
      </div>

      <Tabs defaultValue="cuisines" className="space-y-6">
        <TabsList className="rounded-xl">
          <TabsTrigger value="cuisines" className="rounded-lg">
            Cuisines ({data.cuisines.length})
          </TabsTrigger>
          <TabsTrigger value="diettags" className="rounded-lg">
            Diet Tags ({data.dietTags.length})
          </TabsTrigger>
          <TabsTrigger value="occasions" className="rounded-lg">
            Occasions ({data.occasions.length})
          </TabsTrigger>
        </TabsList>

        {/* Cuisines Tab */}
        <TabsContent value="cuisines">
          <Card className="rounded-2xl shadow-md">
            <CardHeader className="border-b flex flex-row items-center justify-between">
              <CardTitle>Cuisines</CardTitle>
              <Button size="sm" className="rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Add Cuisine
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Slug
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Chefs
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Menus
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.cuisines.map((cuisine) => (
                      <tr key={cuisine.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{cuisine.name}</div>
                          {cuisine.description && (
                            <div className="text-sm text-gray-500">{cuisine.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {cuisine.slug}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {cuisine._count.chefs}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {cuisine._count.menus}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="rounded-lg">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-lg text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diet Tags Tab */}
        <TabsContent value="diettags">
          <Card className="rounded-2xl shadow-md">
            <CardHeader className="border-b flex flex-row items-center justify-between">
              <CardTitle>Dietary Tags</CardTitle>
              <Button size="sm" className="rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Add Tag
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                {data.dietTags.map((tag) => (
                  <Card key={tag.id} className="rounded-xl shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="rounded-full">
                          {tag.name}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {tag._count.menus} menus
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Occasions Tab */}
        <TabsContent value="occasions">
          <Card className="rounded-2xl shadow-md">
            <CardHeader className="border-b flex flex-row items-center justify-between">
              <CardTitle>Occasions</CardTitle>
              <Button size="sm" className="rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Add Occasion
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.occasions.map((occasion) => (
                  <Card key={occasion.id} className="rounded-xl shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{occasion.name}</h4>
                          {occasion.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {occasion.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
