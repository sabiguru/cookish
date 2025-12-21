import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CreateReviewSchema, sanitizeReviewText } from '@/lib/validators/review';
import { notify } from '@/lib/notify';

/**
 * POST /api/reviews
 * Create a new review for a completed booking
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const validatedData = CreateReviewSchema.parse(body);

    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: validatedData.bookingId },
      include: {
        chef: {
          select: {
            id: true,
            userId: true,
            businessName: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only review your own bookings' },
        { status: 403 }
      );
    }

    // Check if booking is completed
    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'You can only review completed bookings' },
        { status: 400 }
      );
    }

    // Check if review already exists for this booking
    const existingReview = await prisma.review.findUnique({
      where: { bookingId: validatedData.bookingId },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this booking' },
        { status: 400 }
      );
    }

    // Sanitize comment
    const sanitizedComment = validatedData.comment
      ? sanitizeReviewText(validatedData.comment)
      : undefined;

    // Create review
    const review = await prisma.review.create({
      data: {
        bookingId: validatedData.bookingId,
        userId,
        chefId: booking.chefId,
        rating: validatedData.rating,
        comment: sanitizedComment,
        photos: validatedData.photos || [],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update chef profile rating aggregation
    const allReviews = await prisma.review.findMany({
      where: { chefId: booking.chefId },
      select: { rating: true },
    });

    const totalReviews = allReviews.length;
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    await prisma.chefProfile.update({
      where: { id: booking.chefId },
      data: {
        avgRating: Math.round(avgRating * 10) / 10,
        reviewsCount: totalReviews,
      },
    });

    // Send notification to chef
    await notify({
      userId: booking.chef.userId,
      type: 'NEW_REVIEW',
      title: 'New Review Received',
      body: `${session.user.name || 'A customer'} gave you ${validatedData.rating} stars`,
      data: {
        reviewId: review.id,
        bookingId: booking.id,
        rating: validatedData.rating,
        reviewerName: session.user.name || 'A customer',
      },
      sendEmail: true,
      emailTemplate: 'new-review',
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CREATE',
        entity: 'Review',
        entityId: review.id,
        details: {
          bookingId: booking.id,
          chefId: booking.chefId,
          rating: validatedData.rating,
        },
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating review:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reviews?chefId=xxx
 * Fetch reviews for a chef
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const chefId = searchParams.get('chefId');
    const bookingId = searchParams.get('bookingId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const cursor = searchParams.get('cursor');

    if (!chefId && !bookingId) {
      return NextResponse.json(
        { error: 'Either chefId or bookingId is required' },
        { status: 400 }
      );
    }

    const where: any = {};
    if (chefId) where.chefId = chefId;
    if (bookingId) where.bookingId = bookingId;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        booking: {
          select: {
            id: true,
            eventDate: true,
          },
        },
        reply: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: {
          id: cursor,
        },
      }),
    });

    const nextCursor = reviews.length === limit ? reviews[reviews.length - 1].id : null;

    return NextResponse.json({
      reviews,
      nextCursor,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
