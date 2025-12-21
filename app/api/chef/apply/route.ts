import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      fullName, phone, bio, experience, specialties,
      cuisineIds, dietTagIds, certifications, serviceRadius,
      avgPrice, languages, portfolioImages
    } = body;

    // Check if already has chef profile
    const existing = await prisma.chefProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (existing) {
      return NextResponse.json({ error: 'You already have a chef application' }, { status: 400 });
    }

    // Create chef profile
    const chefProfile = await prisma.chefProfile.create({
      data: {
        userId: session.user.id,
        bio,
        specialties: specialties || [],
        languages: languages || ['English'],
        travelRadiusKm: parseInt(serviceRadius || '10'),
        avgPricePerPerson: parseInt(avgPrice || '50'),
        verified: false,
      },
    });

    // Add cuisines
    if (cuisineIds?.length > 0) {
      await prisma.chefCuisine.createMany({
        data: cuisineIds.map((cuisineId: string) => ({
          chefId: chefProfile.id,
          cuisineId,
        })),
      });
    }

    // Add diet tags
    if (dietTagIds?.length > 0) {
      await prisma.chefDietTag.createMany({
        data: dietTagIds.map((dietId: string) => ({
          chefId: chefProfile.id,
          dietId,
        })),
      });
    }

    // Add certifications
    if (certifications?.length > 0) {
      await prisma.certification.createMany({
        data: certifications.map((cert: any) => ({
          chefId: chefProfile.id,
          name: cert.name,
          issuer: cert.issuer || null,
        })),
      });
    }

    // Update user and add CHEF role
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: fullName || session.user.name,
        roles: { push: 'CHEF' },
      },
    });

    return NextResponse.json({
      success: true,
      chefProfileId: chefProfile.id,
    });
  } catch (error) {
    console.error('Chef application error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
