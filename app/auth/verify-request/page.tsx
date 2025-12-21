'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft } from 'lucide-react';

export default function VerifyRequestPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Check your email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              A sign-in link has been sent to:
            </p>
            <p className="font-semibold text-gray-900 text-lg break-all">
              {email}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
            <p className="text-sm text-blue-900 font-semibold">
              What to do next:
            </p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Check your inbox for an email from CookFort</li>
              <li>Click the secure sign-in link in the email</li>
              <li>You'll be automatically signed in</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-900">
              <strong>Important:</strong> The link will expire in 24 hours for security reasons.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              asChild
              variant="outline"
              className="w-full rounded-xl h-12 font-semibold"
            >
              <Link href="/auth/signin">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to sign in
              </Link>
            </Button>
          </div>

          {/* Help Section */}
          <div className="text-center pt-4 border-t border-gray-200 space-y-3">
            <p className="text-sm text-gray-600 font-semibold">
              Didn't receive the email?
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>• Check your spam or junk folder</p>
              <p>• Make sure you entered the correct email</p>
              <p>
                • Wait a few minutes - it may take time to arrive
              </p>
            </div>
            <p className="text-sm text-gray-600 pt-2">
              Need help?{' '}
              <Link
                href="/support"
                className="text-blue-600 hover:underline font-semibold"
              >
                Contact support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
