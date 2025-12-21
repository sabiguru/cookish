'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyPage() {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const typeParam = searchParams.get('type');

    if (emailParam && typeParam) {
      setEmail(emailParam);
      setType(typeParam);
    } else {
      // Redirect back to signup if no email or type
      router.push('/auth/signup');
    }
  }, [searchParams, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Use NextAuth's signIn with our OTP provider
      const result = await signIn('otp', {
        email,
        code: token,
        type,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid or expired verification code. Please try again.');
        setIsLoading(false);
      } else if (result?.ok) {
        // Successfully signed in - redirect to dashboard
        window.location.href = '/user';
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type,
        }),
      });

      if (response.ok) {
        alert('Verification code sent to your email!');
      } else {
        setError('Failed to resend code. Please try again.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setError('Something went wrong. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Enter verification code
          </h1>
          <p className="text-gray-600">
            We sent a {type} code to <span className="font-semibold">{email}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="mb-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
              className="w-full px-4 py-4 bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-400 text-2xl text-center tracking-widest rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Code expires in 5 minutes
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || token.length !== 6}
            className="w-full py-4 bg-black text-white font-semibold text-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        {/* Resend Code */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
          <button
            onClick={handleResendCode}
            disabled={isLoading}
            className="text-sm text-gray-900 font-semibold hover:underline disabled:opacity-50"
          >
            Resend Code
          </button>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/auth/signup"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
