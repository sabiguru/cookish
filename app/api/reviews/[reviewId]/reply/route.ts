import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CreateReviewReplySchema, sanitizeReviewText } from '@/lib/validators/review';
import { notify } from '@/lib/notify';

/**
 * POST /api/reviews/[reviewId]/reply
 * Chef replies to a review
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { reviewId } = await params;

    const body = await req.json();
    const validatedData = CreateReviewReplySchema.parse({
      ...body,
      reviewId,
    });

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        chef: {
          select: {
            id: true,
            userId: true,
            businessName: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        reply: true,
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user is the chef for this review
    if (review.chef.userId !== userId) {
      return NextResponse.json(
        { error: 'Only the chef can reply to their reviews' },
        { status: 403 }
      );
    }

    // Check if reply already exists
    if (review.reply) {
      return NextResponse.json(
        { error: 'You have already replied to this review' },
        { status: 400 }
      );
    }

    // Sanitize reply body
    const sanitizedBody = sanitizeReviewText(validatedData.body);

    // Create reply
    const reply = await prisma.reviewReply.create({
      data: {
        reviewId,
        authorId: userId,
        body: sanitizedBody,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Send notification to reviewer
    await notify({
      userId: review.userId,
      type: 'REVIEW_REPLY',
      title: 'Chef Replied to Your Review',
      body: `${session.user.name || review.chef.businessName} replied to your review`,
      data: {
        reviewId: review.id,
        replyId: reply.id,
        chefName: session.user.name || review.chef.businessName,
      },
      sendEmail: true,
      emailTemplate: 'review-reply',
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CREATE',
        entity: 'ReviewReply',
        entityId: reply.id,
        details: {
          reviewId: review.id,
        },
      },
    });

    return NextResponse.json({ reply }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating review reply:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create review reply' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/[reviewId]/reply
 * Delete a review reply (chef only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { reviewId } = await params;

    // Find the reply
    const reply = await prisma.reviewReply.findUnique({
      where: { reviewId },
    });

    if (!reply) {
      return NextResponse.json(
        { error: 'Reply not found' },
        { status: 404 }
      );
    }

    // Check if user is the author
    if (reply.authorId !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own replies' },
        { status: 403 }
      );
    }

    // Delete reply
    await prisma.reviewReply.delete({
      where: { reviewId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'DELETE',
        entity: 'ReviewReply',
        entityId: reply.id,
        details: {
          reviewId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review reply:', error);
    return NextResponse.json(
      { error: 'Failed to delete review reply' },
      { status: 500 }
    );
  }
}
