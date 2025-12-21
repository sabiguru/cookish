import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ConversationList from '@/components/messages/ConversationList';
import ChatThread from '@/components/messages/ChatThread';
import MessageInput from '@/components/messages/MessageInput';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { conversationId: string } }) {
  return {
    title: 'Conversation | CookFort',
    description: 'View and respond to messages',
  };
}

export default async function ConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const { conversationId } = params;

  // Check if user is a participant
  const participant = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId,
      userId: session.user.id,
    },
  });

  if (!participant) {
    // Check if admin/staff with booking access
    const userRoles = (session.user as any).roles || [];
    if (!userRoles.includes('ADMIN') && !userRoles.includes('STAFF')) {
      redirect('/messages');
    }
  }

  // Get conversation details
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
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

  if (!conversation) {
    redirect('/messages');
  }

  const otherParticipant = conversation.participants.find(
    (p) => p.user.id !== session.user.id
  )?.user;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Mobile back button */}
        <Link
          href="/messages"
          className="lg:hidden flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to messages</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            {/* Conversation list (desktop only) */}
            <div className="hidden lg:block lg:col-span-1 border-r h-full">
              <ConversationList
                currentUserId={session.user.id}
                selectedId={conversationId}
              />
            </div>

            {/* Chat area */}
            <div className="lg:col-span-2 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b bg-white">
                {otherParticipant?.image ? (
                  <img
                    src={otherParticipant.image}
                    alt={otherParticipant.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                    {otherParticipant?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}

                <div>
                  <h2 className="font-semibold text-gray-900">
                    {otherParticipant?.name || 'Unknown User'}
                  </h2>
                  {conversation.booking && (
                    <p className="text-xs text-gray-500">
                      Booking: {new Date(conversation.booking.eventDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-hidden">
                <ChatThread
                  conversationId={conversationId}
                  currentUserId={session.user.id}
                />
              </div>

              {/* Input */}
              <MessageInput conversationId={conversationId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
