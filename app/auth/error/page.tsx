'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: 'Server Configuration Error',
    description:
      'There is a problem with the server configuration. Please contact support if this persists.',
  },
  AccessDenied: {
    title: 'Access Denied',
    description:
      'You do not have permission to sign in. Please contact support if you believe this is an error.',
  },
  Verification: {
    title: 'Verification Failed',
    description:
      'The verification token has expired or has already been used. Please request a new one.',
  },
  OAuthSignin: {
    title: 'OAuth Sign-In Error',
    description: 'An error occurred while trying to sign in with your OAuth provider.',
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    description: 'An error occurred during the OAuth callback process.',
  },
  OAuthCreateAccount: {
    title: 'Account Creation Failed',
    description: 'Could not create an account with your OAuth provider.',
  },
  EmailCreateAccount: {
    title: 'Email Account Creation Failed',
    description: 'Could not create an email account. The email may already be in use.',
  },
  Callback: {
    title: 'Callback Error',
    description: 'An error occurred during the authentication callback.',
  },
  OAuthAccountNotLinked: {
    title: 'Account Not Linked',
    description:
      'This email is already associated with another account. Please sign in using the method you originally used to create your account.',
  },
  EmailSignin: {
    title: 'Email Sign-In Failed',
    description: 'Failed to send the sign-in email. Please try again.',
  },
  CredentialsSignin: {
    title: 'Sign-In Failed',
    description: 'The provided credentials are incorrect. Please check and try again.',
  },
  SessionRequired: {
    title: 'Session Required',
    description: 'You must be signed in to access this page.',
  },
  Default: {
    title: 'Authentication Error',
    description: 'An unexpected error occurred during authentication. Please try again.',
  },
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Default';

  const errorInfo = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {errorInfo.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600 text-center">{errorInfo.description}</p>

          {/* Error Code */}
          <div className="bg-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
              Error Code
            </p>
            <p className="text-sm text-gray-900 font-mono">{error}</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              asChild
              className="w-full rounded-xl h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold"
            >
              <Link href="/auth/signin">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Try signing in again
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full rounded-xl h-12 font-semibold"
            >
              <Link href="/">
                <Home className="h-5 w-5 mr-2" />
                Go to homepage
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
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
