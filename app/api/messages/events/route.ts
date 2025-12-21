import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// SSE connection manager
class SSEManager {
  private connections = new Map<string, Set<ReadableStreamDefaultController>>();

  addConnection(userId: string, controller: ReadableStreamDefaultController) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(controller);
  }

  removeConnection(userId: string, controller: ReadableStreamDefaultController) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(controller);
      if (userConnections.size === 0) {
        this.connections.delete(userId);
      }
    }
  }

  broadcast(userId: string, event: string, data: any) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      const encoder = new TextEncoder();
      const encoded = encoder.encode(message);

      userConnections.forEach((controller) => {
        try {
          controller.enqueue(encoded);
        } catch (error) {
          console.error('Error sending SSE message:', error);
        }
      });
    }
  }

  getConnectionCount(userId: string): number {
    return this.connections.get(userId)?.size || 0;
  }
}

export const sseManager = new SSEManager();

/**
 * GET /api/messages/events
 * Server-Sent Events stream for real-time messaging updates
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;

    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        // Add connection
        sseManager.addConnection(userId, controller);

        // Send initial connection message
        const encoder = new TextEncoder();
        const welcome = encoder.encode(
          `event: connected\ndata: ${JSON.stringify({ userId, timestamp: new Date().toISOString() })}\n\n`
        );
        controller.enqueue(welcome);

        // Keep-alive ping every 30 seconds
        const pingInterval = setInterval(() => {
          try {
            const ping = encoder.encode(`:ping\n\n`);
            controller.enqueue(ping);
          } catch (error) {
            clearInterval(pingInterval);
          }
        }, 30000);

        // Cleanup on close
        req.signal.addEventListener('abort', () => {
          clearInterval(pingInterval);
          sseManager.removeConnection(userId, controller);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error('Error setting up SSE stream:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

/**
 * POST /api/messages/events
 * Broadcast events to connected clients (internal use)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { event, data, targetUserId } = body;

    if (!event || !data || !targetUserId) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Broadcast event to target user
    sseManager.broadcast(targetUserId, event, data);

    return new Response(
      JSON.stringify({
        success: true,
        connectionCount: sseManager.getConnectionCount(targetUserId),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error broadcasting event:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Export SSE manager for use in other API routes
export { sseManager as messageSSEManager };
