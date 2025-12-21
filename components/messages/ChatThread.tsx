'use client';

import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Check, CheckCheck, FileText, Image as ImageIcon } from 'lucide-react';

interface MessageAttachment {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

interface Message {
  id: string;
  body?: string;
  attachments: MessageAttachment[];
  createdAt: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    image?: string;
  };
  readBy?: Array<{
    userId: string;
    readAt: string;
    user: {
      id: string;
      name: string;
    };
  }>;
}

interface ChatThreadProps {
  conversationId: string;
  currentUserId: string;
  onTyping?: (isTyping: boolean) => void;
}

export default function ChatThread({
  conversationId,
  currentUserId,
  onTyping,
}: ChatThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    fetchMessages();
    setupSSE();
    markAsRead();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSSE = () => {
    const eventSource = new EventSource('/api/messages/events');

    eventSource.addEventListener('new_message', (e) => {
      const data = JSON.parse(e.data);
      if (data.conversationId === conversationId) {
        setMessages((prev) => [...prev, data.message]);
        markAsRead();
      }
    });

    eventSource.addEventListener('typing', (e) => {
      const data = JSON.parse(e.data);
      if (data.conversationId === conversationId && data.userId !== currentUserId) {
        setOtherUserTyping(data.isTyping);
        if (data.isTyping) {
          setTimeout(() => setOtherUserTyping(false), 3000);
        }
      }
    });

    eventSourceRef.current = eventSource;
  };

  const markAsRead = async () => {
    try {
      await fetch(`/api/messages/${conversationId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderAttachment = (attachment: MessageAttachment) => {
    const isImage = attachment.mimetype.startsWith('image/');

    if (isImage) {
      return (
        <a
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg overflow-hidden max-w-xs"
        >
          <img
            src={attachment.url}
            alt={attachment.filename}
            className="w-full h-auto"
          />
        </a>
      );
    }

    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
      >
        <FileText className="h-5 w-5 text-gray-600" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {attachment.filename}
          </p>
          <p className="text-xs text-gray-500">
            {(attachment.size / 1024).toFixed(1)} KB
          </p>
        </div>
      </a>
    );
  };

  const isRead = (message: Message) => {
    return message.readBy?.some((r) => r.userId !== currentUserId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.senderId === currentUserId;
              const showAvatar =
                index === 0 ||
                messages[index - 1].senderId !== message.senderId;

              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {showAvatar ? (
                      message.sender.image ? (
                        <img
                          src={message.sender.image}
                          alt={message.sender.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-semibold">
                          {message.sender.name.charAt(0).toUpperCase()}
                        </div>
                      )
                    ) : (
                      <div className="w-8 h-8" />
                    )}
                  </div>

                  {/* Message bubble */}
                  <div className={`max-w-[70%] ${isOwn ? 'items-end' : ''}`}>
                    {showAvatar && !isOwn && (
                      <p className="text-xs text-gray-600 mb-1 ml-1">
                        {message.sender.name}
                      </p>
                    )}

                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.body && (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.body}
                        </p>
                      )}

                      {message.attachments.length > 0 && (
                        <div
                          className={`space-y-2 ${message.body ? 'mt-2' : ''}`}
                        >
                          {message.attachments.map((attachment, i) => (
                            <div key={i}>{renderAttachment(attachment)}</div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Timestamp and read status */}
                    <div
                      className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                        isOwn ? 'justify-end' : ''
                      }`}
                    >
                      <span>
                        {format(new Date(message.createdAt), 'p')}
                      </span>
                      {isOwn && (
                        <span>
                          {isRead(message) ? (
                            <CheckCheck className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {otherUserTyping && (
              <div className="flex gap-2">
                <div className="w-8 h-8" />
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
