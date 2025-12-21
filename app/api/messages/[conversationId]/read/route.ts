import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MarkAsReadSchema } from '@/lib/validators/message';

/**
 * POST /api/messages/[conversationId]/read
 * Mark messages as read
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { conversationId } = params;

    // Check if user is a participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = MarkAsReadSchema.parse({
      ...body,
      conversationId,
    });

    // If specific messageIds provided, mark only those
    // Otherwise mark all unread messages in the conversation
    const messageQuery = validatedData.messageIds
      ? {
          id: {
            in: validatedData.messageIds,
          },
          conversationId,
        }
      : {
          conversationId,
          senderId: {
            not: userId,
          },
        };

    // Get messages that need to be marked as read
    const messages = await prisma.message.findMany({
      where: messageQuery,
      select: { id: true },
    });

    // Mark messages as read
    await Promise.all(
      messages.map((message) =>
        prisma.messageReadReceipt.upsert({
          where: {
            messageId_userId: {
              messageId: message.id,
              userId,
            },
          },
          create: {
            messageId: message.id,
            userId,
            readAt: new Date(),
          },
          update: {
            readAt: new Date(),
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      markedCount: messages.length,
    });
  } catch (error: any) {
    console.error('Error marking messages as read:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}
