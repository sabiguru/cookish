import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TypingEventSchema } from '@/lib/validators/message';
import { sseManager } from '../../events/route';

/**
 * POST /api/messages/[conversationId]/typing
 * Broadcast typing indicator to other participants
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
    const validatedData = TypingEventSchema.parse({
      ...body,
      conversationId,
    });

    // Get other participants
    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: {
          not: userId,
        },
      },
      select: {
        userId: true,
      },
    });

    // Broadcast typing event to other participants via SSE
    const typingData = {
      conversationId,
      userId,
      userName: session.user.name,
      isTyping: validatedData.isTyping,
      timestamp: new Date().toISOString(),
    };

    otherParticipants.forEach((participant) => {
      sseManager.broadcast(participant.userId, 'typing', typingData);
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error broadcasting typing event:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to broadcast typing event' },
      { status: 500 }
    );
  }
}
