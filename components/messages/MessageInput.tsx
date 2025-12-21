'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, FileText } from 'lucide-react';

interface MessageAttachment {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

interface MessageInputProps {
  conversationId: string;
  onMessageSent?: () => void;
  onTyping?: (isTyping: boolean) => void;
}

export default function MessageInput({
  conversationId,
  onMessageSent,
  onTyping,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);

    // Notify typing status
    if (onTyping) {
      onTyping(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1000);
    }

    // Send typing event to server
    if (value.length > 0) {
      sendTypingIndicator(true);
    }
  };

  const sendTypingIndicator = async (isTyping: boolean) => {
    try {
      await fetch(`/api/messages/${conversationId}/typing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTyping }),
      });
    } catch (error) {
      console.error('Failed to send typing indicator:', error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Validate number of attachments
    if (attachments.length + files.length > 4) {
      alert('You can only attach up to 4 files per message');
      return;
    }

    setUploading(true);

    try {
      const newAttachments: MessageAttachment[] = [];

      for (const file of files) {
        // Validate file type
        const allowedTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'application/pdf',
        ];

        if (!allowedTypes.includes(file.type)) {
          alert(
            `File type ${file.type} is not allowed. Only images (jpg, png, webp) and PDF are supported.`
          );
          continue;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(
            `File ${file.name} is too large. Maximum size is 10MB.`
          );
          continue;
        }

        // TODO: Upload file to storage (MinIO/S3)
        // For now, create a mock URL
        const mockUrl = URL.createObjectURL(file);

        newAttachments.push({
          url: mockUrl,
          filename: file.name,
          mimetype: file.type,
          size: file.size,
        });
      }

      setAttachments((prev) => [...prev, ...newAttachments]);
    } catch (error) {
      console.error('Failed to upload files:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage && attachments.length === 0) {
      return;
    }

    setSending(true);

    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: trimmedMessage || undefined,
          attachments: attachments.length > 0 ? attachments : undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to send message');
      }

      // Clear input
      setMessage('');
      setAttachments([]);
      sendTypingIndicator(false);

      // Notify parent
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      alert(error.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white p-4">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment, index) => {
            const isImage = attachment.mimetype.startsWith('image/');

            return (
              <div
                key={index}
                className="relative group bg-gray-100 rounded-lg p-2 pr-8"
              >
                <div className="flex items-center gap-2">
                  {isImage ? (
                    <ImageIcon className="h-5 w-5 text-gray-600" />
                  ) : (
                    <FileText className="h-5 w-5 text-gray-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium truncate max-w-[150px]">
                      {attachment.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-white hover:bg-gray-200 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        {/* Attach button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || sending || attachments.length >= 4}
          className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Attach file"
        >
          <Paperclip className="h-5 w-5 text-gray-600" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Message textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={sending}
            rows={1}
            className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none disabled:opacity-50"
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={sending || uploading || (!message.trim() && attachments.length === 0)}
          className="flex-shrink-0 p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
}
