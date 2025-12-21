import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, FileText, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';

async function getChefCertifications(userId: string) {
  const chef = await prisma.chefProfile.findUnique({
    where: { userId },
  });

  if (!chef) {
    return null;
  }

  const certifications = await prisma.certification.findMany({
    where: { chefId: chef.id },
    orderBy: { expiryDate: 'asc' },
  });

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    certifications,
    expiringSoon: certifications.filter(
      (cert) =>
        cert.expiryDate &&
        new Date(cert.expiryDate) <= thirtyDaysFromNow &&
        new Date(cert.expiryDate) >= now
    ),
    expired: certifications.filter(
      (cert) => cert.expiryDate && new Date(cert.expiryDate) < now
    ),
  };
}

export default async function ChefCertificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  const data = await getChefCertifications(session.user.id);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Chef profile not found</p>
      </div>
    );
  }

  const getCertStatus = (cert: any) => {
    if (!cert.expiryDate) return 'valid';
    const now = new Date();
    const expiryDate = new Date(cert.expiryDate);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (expiryDate < now) return 'expired';
    if (expiryDate <= thirtyDaysFromNow) return 'expiring';
    return 'valid';
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Certifications & Credentials
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your professional certifications
          </p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/chef/certifications/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Certification
          </Link>
        </Button>
      </div>

      {/* Alerts */}
      {(data.expiringSoon.length > 0 || data.expired.length > 0) && (
        <div className="space-y-3">
          {data.expired.length > 0 && (
            <Card className="rounded-2xl shadow-md border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {data.expired.length} Expired Certification
                      {data.expired.length > 1 ? 's' : ''}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Please renew your expired certifications to maintain your
                      profile visibility
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {data.expiringSoon.length > 0 && (
            <Card className="rounded-2xl shadow-md border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {data.expiringSoon.length} Certification
                      {data.expiringSoon.length > 1 ? 's' : ''} Expiring Soon
                    </h3>
                    <p className="text-sm text-gray-600">
                      Some of your certifications will expire within 30 days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Certifications List */}
      {data.certifications.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {data.certifications.map((cert) => {
            const status = getCertStatus(cert);
            return (
              <Card
                key={cert.id}
                className={`rounded-2xl shadow-md ${
                  status === 'expired'
                    ? 'border-red-200'
                    : status === 'expiring'
                    ? 'border-yellow-200'
                    : ''
                }`}
              >
                <CardHeader className="border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">
                          {cert.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {cert.issuingOrganization}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        status === 'valid'
                          ? 'default'
                          : status === 'expiring'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className="text-xs rounded-full"
                    >
                      {status === 'valid' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      {status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {cert.certificationNumber && (
                      <div>
                        <p className="text-sm text-gray-600">Certificate Number</p>
                        <p className="text-sm font-mono text-gray-900">
                          {cert.certificationNumber}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Issue Date</p>
                        <p className="text-sm text-gray-900">
                          {formatDate(cert.issueDate, 'PP')}
                        </p>
                      </div>
                      {cert.expiryDate && (
                        <div>
                          <p className="text-sm text-gray-600">Expiry Date</p>
                          <p
                            className={`text-sm ${
                              status === 'expired'
                                ? 'text-red-600 font-semibold'
                                : status === 'expiring'
                                ? 'text-yellow-600 font-semibold'
                                : 'text-gray-900'
                            }`}
                          >
                            {formatDate(cert.expiryDate, 'PP')}
                          </p>
                        </div>
                      )}
                    </div>
                    {cert.documentUrl && (
                      <div>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full rounded-lg"
                        >
                          <a
                            href={cert.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            View Certificate
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No certifications yet
              </h3>
              <p className="text-gray-600 mb-6">
                Add your professional certifications to build trust with
                customers and stand out
              </p>
              <Button asChild className="rounded-xl">
                <Link href="/chef/certifications/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Certification
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="rounded-2xl shadow-md bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-2">
            Why Add Certifications?
          </h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Build trust and credibility with potential customers</li>
            <li>Highlight your professional qualifications</li>
            <li>Improve your profile ranking in search results</li>
            <li>Show your commitment to food safety and quality</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
