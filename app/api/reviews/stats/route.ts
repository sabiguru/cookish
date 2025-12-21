import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateRatingStats } from '@/lib/validators/review';

/**
 * GET /api/reviews/stats?chefId=xxx
 * Fetch rating statistics for a chef
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const chefId = searchParams.get('chefId');

    if (!chefId) {
      return NextResponse.json(
        { error: 'chefId is required' },
        { status: 400 }
      );
    }

    // Fetch all reviews for the chef
    const reviews = await prisma.review.findMany({
      where: { chefId },
      select: {
        rating: true,
      },
    });

    // Calculate statistics
    const stats = calculateRatingStats(reviews);

    // Get chef profile for cached values
    const chefProfile = await prisma.chefProfile.findUnique({
      where: { id: chefId },
      select: {
        avgRating: true,
        reviewsCount: true,
      },
    });

    return NextResponse.json({
      stats,
      cached: {
        avgRating: chefProfile?.avgRating || 0,
        reviewsCount: chefProfile?.reviewsCount || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review stats' },
      { status: 500 }
    );
  }
}
