import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CreateMessageSchema, sanitizeMessageBody } from '@/lib/validators/message';
import { notify } from '@/lib/notify';
import { sseManager } from '../events/route';

// Rate limiting: 10 messages per 30 seconds per conversation
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(conversationId: string, userId: string): boolean {
  const key = `${conversationId}:${userId}`;
  const now = Date.now();
  const limit = rateLimitMap.get(key);

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 30000 });
    return true;
  }

  if (limit.count >= 10) {
    return false;
  }

  limit.count++;
  return true;
}

/**
 * GET /api/messages/[conversationId]
 * Fetch messages for a conversation
 */
export async function GET(
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
      // Check if user is admin/staff (read-only access for booking-linked conversations)
      const userRoles = (session.user as any).roles || [];
      if (userRoles.includes('ADMIN') || userRoles.includes('STAFF')) {
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          select: { bookingId: true },
        });

        if (!conversation?.bookingId) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Fetch messages with pagination
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const cursor = searchParams.get('cursor');

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        readBy: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
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

    const nextCursor = messages.length === limit ? messages[messages.length - 1].id : null;

    return NextResponse.json({
      messages: messages.reverse(),
      nextCursor,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages/[conversationId]
 * Send a message to a conversation
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

    // Rate limiting
    if (!checkRateLimit(conversationId, userId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 10 messages per 30 seconds.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validatedData = CreateMessageSchema.parse({
      ...body,
      conversationId,
    });

    // Validate that either body or attachments are provided
    if (!validatedData.body && (!validatedData.attachments || validatedData.attachments.length === 0)) {
      return NextResponse.json(
        { error: 'Message must contain either text or attachments' },
        { status: 400 }
      );
    }

    // Sanitize message body
    const sanitizedBody = validatedData.body ? sanitizeMessageBody(validatedData.body) : undefined;

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        body: sanitizedBody,
        attachments: validatedData.attachments || [],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Get other participants
    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: {
          not: userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Send notifications to other participants
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { bookingId: true },
    });

    await Promise.all(
      otherParticipants.map((participant) =>
        notify({
          userId: participant.userId,
          type: 'NEW_MESSAGE',
          title: `New message from ${session.user.name || 'Someone'}`,
          body: sanitizedBody ? sanitizedBody.substring(0, 100) : 'Sent an attachment',
          data: {
            conversationId,
            messageId: message.id,
            senderId: userId,
            senderName: session.user.name || 'Someone',
            bookingId: conversation?.bookingId,
          },
          sendEmail: true,
          emailTemplate: 'new-message',
        })
      )
    );

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CREATE',
        entity: 'Message',
        entityId: message.id,
        details: {
          conversationId,
          hasAttachments: (validatedData.attachments?.length || 0) > 0,
        },
      },
    });

    // Broadcast new message to other participants via SSE
    otherParticipants.forEach((participant) => {
      sseManager.broadcast(participant.userId, 'new_message', {
        conversationId,
        message: {
          id: message.id,
          body: message.body,
          attachments: message.attachments,
          senderId: message.senderId,
          sender: message.sender,
          createdAt: message.createdAt,
        },
      });
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating message:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
