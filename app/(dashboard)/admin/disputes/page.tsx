import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Eye, UserPlus, CheckCircle, Clock } from 'lucide-react';

async function getDisputes() {
  try {
    const disputes = await prisma.dispute.findMany({
      include: {
        booking: {
          include: {
            customer: {
              select: { name: true, email: true, image: true },
            },
            chef: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
        },
        assignedTo: {
          select: { name: true, email: true },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return disputes;
  } catch (error) {
    console.error('Error fetching disputes:', error);
    return [];
  }
}

function getSLAStatus(createdAt: Date, status: string) {
  if (status === 'RESOLVED') return null;

  const hoursElapsed = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  const slaHours = 48; // 48 hour SLA

  if (hoursElapsed > slaHours) {
    return { text: 'Overdue', color: 'destructive' as const };
  } else if (hoursElapsed > slaHours * 0.75) {
    return { text: `${Math.round(slaHours - hoursElapsed)}h left`, color: 'secondary' as const };
  }
  return { text: `${Math.round(slaHours - hoursElapsed)}h left`, color: 'outline' as const };
}

export default async function AdminDisputesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  const disputes = await getDisputes();

  const stats = {
    open: disputes.filter((d) => d.status === 'OPEN').length,
    underReview: disputes.filter((d) => d.status === 'UNDER_REVIEW').length,
    resolved: disputes.filter((d) => d.status === 'RESOLVED').length,
    unassigned: disputes.filter((d) => !d.assignedToId).length,
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Disputes Center</h1>
        <p className="text-gray-600 mt-1">Manage and resolve customer disputes</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.underReview}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unassigned</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unassigned}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <UserPlus className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disputes Table */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="border-b">
          <CardTitle>All Disputes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {disputes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Booking
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Opened By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Assignee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      SLA
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Messages
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Last Activity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {disputes.map((dispute) => {
                    const sla = getSLAStatus(dispute.createdAt, dispute.status);
                    return (
                      <tr key={dispute.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            Booking #{dispute.bookingId.slice(0, 8)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {dispute.booking.customer.name} → {dispute.booking.chef.user.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={dispute.booking.customer.image || undefined} />
                              <AvatarFallback>
                                {dispute.booking.customer.name?.charAt(0) || 'C'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm text-gray-900">
                                {dispute.booking.customer.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {dispute.openedBy}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {dispute.assignedTo ? (
                            <div className="text-sm text-gray-900">
                              {dispute.assignedTo.name}
                            </div>
                          ) : (
                            <Badge variant="outline" className="rounded-full">
                              Unassigned
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              dispute.status === 'RESOLVED'
                                ? 'default'
                                : dispute.status === 'UNDER_REVIEW'
                                ? 'secondary'
                                : 'outline'
                            }
                            className="rounded-full"
                          >
                            {dispute.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {sla && (
                            <Badge variant={sla.color} className="rounded-full text-xs">
                              {sla.text}
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {dispute._count.messages}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(dispute.updatedAt, 'PP')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                            >
                              <Link href={`/dashboard/admin/disputes/${dispute.id}`}>
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Link>
                            </Button>
                            {!dispute.assignedToId && (
                              <Button size="sm" className="rounded-lg">
                                <UserPlus className="h-3 w-3 mr-1" />
                                Assign
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No disputes to display</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
