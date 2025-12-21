'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Search } from 'lucide-react';

interface Message {
  id: string;
  body?: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image?: string;
  };
}

interface Conversation {
  id: string;
  type: string;
  unreadCount: number;
  updatedAt: string;
  lastMessage: Message | null;
  participants: Array<{
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
  }>;
  booking?: {
    id: string;
    eventDate: string;
    status: string;
  };
}

interface ConversationListProps {
  currentUserId: string;
  selectedId?: string;
}

export default function ConversationList({
  currentUserId,
  selectedId,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    const other = conversation.participants.find(
      (p) => p.user.id !== currentUserId
    );
    return other?.user;
  };

  const filteredConversations = conversations.filter((conv) => {
    const other = getOtherParticipant(conv);
    const searchLower = searchQuery.toLowerCase();
    return (
      other?.name?.toLowerCase().includes(searchLower) ||
      other?.email?.toLowerCase().includes(searchLower) ||
      conv.lastMessage?.body?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MessageCircle className="h-12 w-12 mb-2" />
            <p>No conversations yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conversation) => {
              const other = getOtherParticipant(conversation);
              const isSelected = conversation.id === selectedId;

              return (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.id}`}
                  className={`block p-4 hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {other?.image ? (
                        <img
                          src={other.image}
                          alt={other.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                          {other?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {other?.name || 'Unknown User'}
                        </h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatDistanceToNow(
                              new Date(conversation.lastMessage.createdAt),
                              { addSuffix: true }
                            )}
                          </span>
                        )}
                      </div>

                      {conversation.booking && (
                        <p className="text-xs text-gray-500 mb-1">
                          Booking: {new Date(conversation.booking.eventDate).toLocaleDateString()}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm truncate ${
                            conversation.unreadCount > 0
                              ? 'font-semibold text-gray-900'
                              : 'text-gray-600'
                          }`}
                        >
                          {conversation.lastMessage?.body ||
                            'No messages yet'}
                        </p>

                        {conversation.unreadCount > 0 && (
                          <span className="flex-shrink-0 ml-2 bg-black text-white text-xs font-bold rounded-full px-2 py-0.5">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
