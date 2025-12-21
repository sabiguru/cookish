import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react';

async function getChefs() {
  try {
    const [applications, allChefs] = await Promise.all([
      // Applications (new chefs without email verification)
      prisma.chef.findMany({
        where: {
          user: {
            emailVerified: null,
          },
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
              createdAt: true,
            },
          },
          cuisines: true,
          certifications: true,
          _count: {
            select: {
              menus: true,
              reviews: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),

      // All verified chefs
      prisma.chef.findMany({
        where: {
          user: {
            emailVerified: {
              not: null,
            },
          },
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
              emailVerified: true,
            },
          },
          cuisines: true,
          certifications: true,
          _count: {
            select: {
              menus: true,
              reviews: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      }),
    ]);

    // Calculate average ratings
    const chefsWithRatings = await Promise.all(
      allChefs.map(async (chef) => {
        const avgRating = await prisma.review.aggregate({
          where: { chefId: chef.id },
          _avg: { rating: true },
        });
        return {
          ...chef,
          avgRating: avgRating._avg.rating || 0,
        };
      })
    );

    return {
      applications,
      allChefs: chefsWithRatings,
    };
  } catch (error) {
    console.error('Error fetching chefs:', error);
    return {
      applications: [],
      allChefs: [],
    };
  }
}

function ChefRow({ chef, showApprovalActions = false }: any) {
  const expiringCerts = chef.certifications.filter((cert: any) => {
    if (!cert.expiryDate) return false;
    const daysUntilExpiry = Math.floor(
      (new Date(cert.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
  });

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={chef.user.image || undefined} />
            <AvatarFallback>
              {chef.user.name?.charAt(0) || 'C'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-gray-900">{chef.user.name}</p>
            <p className="text-sm text-gray-600">{chef.user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        {chef.user.emailVerified ? (
          <Badge variant="default" className="rounded-full">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        ) : (
          <Badge variant="secondary" className="rounded-full">
            Pending
          </Badge>
        )}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {chef._count.menus}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {chef.avgRating > 0 ? chef.avgRating.toFixed(1) : 'N/A'}
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-900">
            {chef.certifications.length} total
          </span>
          {expiringCerts.length > 0 && (
            <Badge variant="destructive" className="text-xs rounded-full w-fit">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {expiringCerts.length} expiring
            </Badge>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-lg">
            <Link href={`/chef/${chef.id}`}>
              <Eye className="h-3 w-3 mr-1" />
              View
            </Link>
          </Button>
          {showApprovalActions && (
            <>
              <Button size="sm" className="rounded-lg bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Approve
              </Button>
              <Button size="sm" variant="destructive" className="rounded-lg">
                <XCircle className="h-3 w-3 mr-1" />
                Reject
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export default async function AdminChefsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  const data = await getChefs();

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chef Management</h1>
        <p className="text-gray-600 mt-1">Review applications and manage chef accounts</p>
      </div>

      <Tabs defaultValue="applications" className="space-y-6">
        <TabsList className="rounded-xl">
          <TabsTrigger value="applications" className="rounded-lg">
            Applications ({data.applications.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-lg">
            All Chefs ({data.allChefs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <Card className="rounded-2xl shadow-md">
            <CardHeader className="border-b">
              <CardTitle>Pending Applications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.applications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Chef
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Menus
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Rating
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Certs
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.applications.map((chef: any) => (
                        <ChefRow key={chef.id} chef={chef} showApprovalActions />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No pending applications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card className="rounded-2xl shadow-md">
            <CardHeader className="border-b">
              <CardTitle>All Chefs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.allChefs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Chef
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Menus
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Rating
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Certs
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.allChefs.map((chef: any) => (
                        <ChefRow key={chef.id} chef={chef} />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No chefs found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
