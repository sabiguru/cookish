import { describe, it, expect } from '@jest/globals';
import {
  CreateConversationSchema,
  CreateMessageSchema,
  MarkAsReadSchema,
  TypingEventSchema,
  validateAttachment,
  sanitizeMessageBody,
  ALLOWED_ATTACHMENT_TYPES,
  MAX_ATTACHMENT_SIZE,
} from '@/lib/validators/message';

describe('Message Validators', () => {
  describe('CreateConversationSchema', () => {
    it('should validate a valid conversation creation', () => {
      const validData = {
        type: 'DIRECT',
        participantIds: ['user1', 'user2'],
      };

      const result = CreateConversationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require at least 2 participants', () => {
      const invalidData = {
        type: 'DIRECT',
        participantIds: ['user1'],
      };

      const result = CreateConversationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional initial message', () => {
      const validData = {
        type: 'DIRECT',
        participantIds: ['user1', 'user2'],
        initialMessage: 'Hello!',
      };

      const result = CreateConversationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('CreateMessageSchema', () => {
    it('should validate a message with body', () => {
      const validData = {
        conversationId: 'conv123',
        body: 'Hello, world!',
      };

      const result = CreateMessageSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate a message with attachments', () => {
      const validData = {
        conversationId: 'conv123',
        attachments: [
          {
            url: 'https://example.com/file.jpg',
            filename: 'file.jpg',
            mimetype: 'image/jpeg',
            size: 1024,
          },
        ],
      };

      const result = CreateMessageSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject more than 4 attachments', () => {
      const invalidData = {
        conversationId: 'conv123',
        attachments: Array(5).fill({
          url: 'https://example.com/file.jpg',
          filename: 'file.jpg',
          mimetype: 'image/jpeg',
          size: 1024,
        }),
      };

      const result = CreateMessageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject attachments larger than 10MB', () => {
      const invalidData = {
        conversationId: 'conv123',
        attachments: [
          {
            url: 'https://example.com/file.jpg',
            filename: 'file.jpg',
            mimetype: 'image/jpeg',
            size: 11 * 1024 * 1024, // 11MB
          },
        ],
      };

      const result = CreateMessageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('MarkAsReadSchema', () => {
    it('should validate mark as read request', () => {
      const validData = {
        conversationId: 'conv123',
        messageIds: ['msg1', 'msg2'],
      };

      const result = MarkAsReadSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept empty messageIds (mark all as read)', () => {
      const validData = {
        conversationId: 'conv123',
      };

      const result = MarkAsReadSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('TypingEventSchema', () => {
    it('should validate typing event', () => {
      const validData = {
        conversationId: 'conv123',
        isTyping: true,
      };

      const result = TypingEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('validateAttachment', () => {
    it('should accept valid image types', () => {
      ALLOWED_ATTACHMENT_TYPES.filter((type) => type.startsWith('image/')).forEach(
        (mimetype) => {
          const result = validateAttachment({
            mimetype,
            size: 1024,
          });

          expect(result.valid).toBe(true);
        }
      );
    });

    it('should accept PDF files', () => {
      const result = validateAttachment({
        mimetype: 'application/pdf',
        size: 1024,
      });

      expect(result.valid).toBe(true);
    });

    it('should reject invalid file types', () => {
      const result = validateAttachment({
        mimetype: 'application/zip',
        size: 1024,
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('should reject files larger than 10MB', () => {
      const result = validateAttachment({
        mimetype: 'image/jpeg',
        size: 11 * 1024 * 1024,
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum');
    });
  });

  describe('sanitizeMessageBody', () => {
    it('should remove script tags', () => {
      const input = 'Hello <script>alert("XSS")</script> world';
      const result = sanitizeMessageBody(input);

      expect(result).toBe('Hello  world');
      expect(result).not.toContain('<script>');
    });

    it('should remove style tags', () => {
      const input = 'Hello <style>body { color: red; }</style> world';
      const result = sanitizeMessageBody(input);

      expect(result).toBe('Hello  world');
      expect(result).not.toContain('<style>');
    });

    it('should remove all HTML tags', () => {
      const input = 'Hello <b>bold</b> and <i>italic</i> text';
      const result = sanitizeMessageBody(input);

      expect(result).toBe('Hello bold and italic text');
    });

    it('should preserve plain text', () => {
      const input = 'Hello, this is a plain text message!';
      const result = sanitizeMessageBody(input);

      expect(result).toBe(input);
    });
  });
});
