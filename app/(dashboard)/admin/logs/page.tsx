import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Download, Search, Filter } from 'lucide-react';
import Link from 'next/link';

async function getActivityLogs(searchParams: any) {
  const where: any = {};

  // Filter by entity type
  if (searchParams.entityType) {
    where.entityType = searchParams.entityType;
  }

  // Filter by action
  if (searchParams.action) {
    where.action = searchParams.action;
  }

  // Filter by actor (userId)
  if (searchParams.actor) {
    where.userId = searchParams.actor;
  }

  // Filter by date range
  if (searchParams.dateFrom || searchParams.dateTo) {
    where.createdAt = {};
    if (searchParams.dateFrom) {
      where.createdAt.gte = new Date(searchParams.dateFrom);
    }
    if (searchParams.dateTo) {
      where.createdAt.lte = new Date(searchParams.dateTo);
    }
  }

  const [logs, totalCount, entityTypes, actions] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),

    // Total count for pagination
    prisma.activityLog.count({ where }),

    // Get distinct entity types
    prisma.activityLog.findMany({
      select: { entityType: true },
      distinct: ['entityType'],
    }),

    // Get distinct actions
    prisma.activityLog.findMany({
      select: { action: true },
      distinct: ['action'],
    }),
  ]);

  return {
    logs,
    totalCount,
    entityTypes: entityTypes.map((e) => e.entityType),
    actions: actions.map((a) => a.action),
  };
}

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: any;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  const data = await getActivityLogs(searchParams);

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'default';
    if (action.includes('UPDATE')) return 'secondary';
    if (action.includes('DELETE')) return 'destructive';
    if (action.includes('APPROVE') || action.includes('RESOLVE')) return 'default';
    if (action.includes('REJECT') || action.includes('CANCEL')) return 'destructive';
    return 'outline';
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600 mt-1">
            System audit trail and user activity monitoring
          </p>
        </div>
        <Button className="rounded-xl" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.totalCount}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Entity Types</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.entityTypes.length}
                </p>
              </div>
              <Filter className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Action Types</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.actions.length}
                </p>
              </div>
              <Search className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Showing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.logs.length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Entity Type Filter */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Entity Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                defaultValue={searchParams.entityType || ''}
              >
                <option value="">All Types</option>
                {data.entityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Filter */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Action
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                defaultValue={searchParams.action || ''}
              >
                <option value="">All Actions</option>
                {data.actions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Date From
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                defaultValue={searchParams.dateFrom || ''}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Date To
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                defaultValue={searchParams.dateTo || ''}
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(searchParams.entityType ||
            searchParams.action ||
            searchParams.dateFrom ||
            searchParams.dateTo) && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                asChild
              >
                <Link href="/dashboard/admin/logs">Clear Filters</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Logs Table */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="border-b">
          <CardTitle>Activity History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Actor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Action
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Entity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Entity ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(log.createdAt, 'PP')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(log.createdAt, 'p')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {log.user.name || 'Unknown User'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {log.user.email}
                            </div>
                            <Badge
                              variant="outline"
                              className="text-xs mt-1 rounded-full"
                            >
                              {log.user.role}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={getActionColor(log.action)}
                          className="text-xs rounded-full"
                        >
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {log.entityType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500 font-mono">
                          {log.entityId.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500 font-mono">
                          {log.ipAddress || 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No activity logs found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters or check back later
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="rounded-2xl shadow-md bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-2">
            About Activity Logs
          </h3>
          <p className="text-sm text-gray-600">
            Activity logs track all significant actions performed in the system
            including user actions, admin operations, and automated processes.
            Logs are retained for 90 days and can be exported for compliance
            purposes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
