import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CreateConversationSchema } from '@/lib/validators/message';
import { ConversationType } from '@prisma/client';

/**
 * GET /api/messages
 * List all conversations for authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        booking: {
          select: {
            id: true,
            eventDate: true,
            status: true,
            chef: {
              select: {
                id: true,
                businessName: true,
                user: {
                  select: {
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: {
              not: userId,
            },
            readBy: {
              none: {
                userId,
              },
            },
          },
        });

        return {
          ...conversation,
          unreadCount,
          lastMessage: conversation.messages[0] || null,
        };
      })
    );

    return NextResponse.json({ conversations: conversationsWithUnread });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages
 * Create a new conversation
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const validatedData = CreateConversationSchema.parse(body);

    // Check if user is included in participants
    if (!validatedData.participantIds.includes(userId)) {
      validatedData.participantIds.push(userId);
    }

    // Check for existing conversation with same participants (for DIRECT type)
    if (validatedData.type === 'DIRECT' && validatedData.participantIds.length === 2) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: 'DIRECT',
          AND: validatedData.participantIds.map((id) => ({
            participants: {
              some: {
                userId: id,
              },
            },
          })),
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
      });

      if (existingConversation) {
        return NextResponse.json({
          conversation: existingConversation,
          existed: true,
        });
      }
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        type: validatedData.type,
        bookingId: validatedData.bookingId,
        participants: {
          create: validatedData.participantIds.map((id) => ({
            userId: id,
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        booking: {
          select: {
            id: true,
            eventDate: true,
            status: true,
          },
        },
      },
    });

    // Send initial message if provided
    if (validatedData.initialMessage) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          body: validatedData.initialMessage,
        },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CREATE',
        entity: 'Conversation',
        entityId: conversation.id,
        details: {
          type: validatedData.type,
          participantCount: validatedData.participantIds.length,
        },
      },
    });

    return NextResponse.json({ conversation, existed: false }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating conversation:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
