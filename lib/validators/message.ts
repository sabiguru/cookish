import { z } from 'zod';
import { ConversationType } from '@prisma/client';

// Create conversation schema
export const CreateConversationSchema = z.object({
  type: z.nativeEnum(ConversationType).default('DIRECT'),
  participantIds: z.array(z.string().cuid()).min(2).max(10),
  bookingId: z.string().cuid().optional(),
  initialMessage: z.string().min(1).max(5000).optional(),
});

export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;

// Create message schema
export const CreateMessageSchema = z.object({
  conversationId: z.string().cuid(),
  body: z.string().min(1).max(5000).optional(),
  attachments: z
    .array(
      z.object({
        url: z.string().url(),
        filename: z.string(),
        mimetype: z.string(),
        size: z.number().max(10 * 1024 * 1024), // 10MB max
      })
    )
    .max(4)
    .optional(),
});

export type CreateMessageInput = z.infer<typeof CreateMessageSchema>;

// Typing event schema
export const TypingEventSchema = z.object({
  conversationId: z.string().cuid(),
  isTyping: z.boolean(),
});

export type TypingEventInput = z.infer<typeof TypingEventSchema>;

// Mark as read schema
export const MarkAsReadSchema = z.object({
  conversationId: z.string().cuid(),
  messageIds: z.array(z.string().cuid()).optional(), // If not provided, marks all as read
});

export type MarkAsReadInput = z.infer<typeof MarkAsReadSchema>;

// Attachment validation helper
export const ALLOWED_ATTACHMENT_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB

export function validateAttachment(file: { mimetype: string; size: number }): {
  valid: boolean;
  error?: string;
} {
  if (!ALLOWED_ATTACHMENT_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `File type ${file.mimetype} is not allowed. Allowed types: images (jpg, png, webp) and PDF.`,
    };
  }

  if (file.size > MAX_ATTACHMENT_SIZE) {
    return {
      valid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of 10MB.`,
    };
  }

  return { valid: true };
}

// Sanitize message body (strip HTML, allow basic markdown)
export function sanitizeMessageBody(body: string): string {
  // Remove HTML tags but preserve basic formatting
  return body
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}
