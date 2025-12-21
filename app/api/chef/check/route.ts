import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ hasProfile: false });
    }

    const chefProfile = await prisma.chefProfile.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      hasProfile: !!chefProfile,
      verified: chefProfile?.verified || false,
    });
  } catch (error) {
    return NextResponse.json({ hasProfile: false });
  }
}
