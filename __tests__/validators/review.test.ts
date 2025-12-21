import { describe, it, expect } from '@jest/globals';
import {
  CreateReviewSchema,
  CreateReviewReplySchema,
  sanitizeReviewText,
  calculateRatingStats,
  containsProfanity,
} from '@/lib/validators/review';

describe('Review Validators', () => {
  describe('CreateReviewSchema', () => {
    it('should validate a 5-star review without comment', () => {
      const validData = {
        bookingId: 'booking123',
        rating: 5,
      };

      const result = CreateReviewSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate a 4-star review with comment', () => {
      const validData = {
        bookingId: 'booking123',
        rating: 4,
        comment: 'Great experience!',
      };

      const result = CreateReviewSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require comment for ratings <= 3 stars', () => {
      const invalidData = {
        bookingId: 'booking123',
        rating: 3,
      };

      const result = CreateReviewSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept comment for low ratings', () => {
      const validData = {
        bookingId: 'booking123',
        rating: 2,
        comment: 'The service was not great. Food was cold and chef arrived late.',
      };

      const result = CreateReviewSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept up to 4 photos', () => {
      const validData = {
        bookingId: 'booking123',
        rating: 5,
        photos: [
          'https://example.com/photo1.jpg',
          'https://example.com/photo2.jpg',
          'https://example.com/photo3.jpg',
          'https://example.com/photo4.jpg',
        ],
      };

      const result = CreateReviewSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject more than 4 photos', () => {
      const invalidData = {
        bookingId: 'booking123',
        rating: 5,
        photos: Array(5).fill('https://example.com/photo.jpg'),
      };

      const result = CreateReviewSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject ratings outside 1-5 range', () => {
      const invalidData1 = {
        bookingId: 'booking123',
        rating: 0,
      };

      const invalidData2 = {
        bookingId: 'booking123',
        rating: 6,
      };

      expect(CreateReviewSchema.safeParse(invalidData1).success).toBe(false);
      expect(CreateReviewSchema.safeParse(invalidData2).success).toBe(false);
    });

    it('should reject comment longer than 2000 characters', () => {
      const invalidData = {
        bookingId: 'booking123',
        rating: 5,
        comment: 'a'.repeat(2001),
      };

      const result = CreateReviewSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('CreateReviewReplySchema', () => {
    it('should validate a valid reply', () => {
      const validData = {
        reviewId: 'review123',
        body: 'Thank you for your feedback!',
      };

      const result = CreateReviewReplySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require minimum 10 characters', () => {
      const invalidData = {
        reviewId: 'review123',
        body: 'Thanks',
      };

      const result = CreateReviewReplySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject replies longer than 1000 characters', () => {
      const invalidData = {
        reviewId: 'review123',
        body: 'a'.repeat(1001),
      };

      const result = CreateReviewReplySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('sanitizeReviewText', () => {
    it('should remove script tags', () => {
      const input = 'Great food! <script>alert("XSS")</script>';
      const result = sanitizeReviewText(input);

      expect(result).toBe('Great food!');
      expect(result).not.toContain('<script>');
    });

    it('should remove style tags', () => {
      const input = 'Amazing! <style>body { color: red; }</style>';
      const result = sanitizeReviewText(input);

      expect(result).toBe('Amazing!');
      expect(result).not.toContain('<style>');
    });

    it('should remove HTML tags', () => {
      const input = 'The <b>food</b> was <i>excellent</i>!';
      const result = sanitizeReviewText(input);

      expect(result).toBe('The food was excellent!');
    });

    it('should normalize whitespace', () => {
      const input = 'Great   food!\n\n\nAmazing    service!';
      const result = sanitizeReviewText(input);

      expect(result).toBe('Great food! Amazing service!');
    });

    it('should preserve plain text', () => {
      const input = 'Wonderful experience! Highly recommend.';
      const result = sanitizeReviewText(input);

      expect(result).toBe(input);
    });
  });

  describe('calculateRatingStats', () => {
    it('should calculate average rating correctly', () => {
      const reviews = [
        { rating: 5 },
        { rating: 4 },
        { rating: 5 },
        { rating: 3 },
        { rating: 4 },
      ];

      const stats = calculateRatingStats(reviews);

      expect(stats.average).toBe(4.2);
      expect(stats.total).toBe(5);
    });

    it('should calculate rating distribution correctly', () => {
      const reviews = [
        { rating: 5 },
        { rating: 5 },
        { rating: 4 },
        { rating: 3 },
        { rating: 5 },
      ];

      const stats = calculateRatingStats(reviews);

      expect(stats.distribution[5]).toBe(3);
      expect(stats.distribution[4]).toBe(1);
      expect(stats.distribution[3]).toBe(1);
      expect(stats.distribution[2]).toBe(0);
      expect(stats.distribution[1]).toBe(0);
    });

    it('should handle empty reviews array', () => {
      const reviews: Array<{ rating: number }> = [];
      const stats = calculateRatingStats(reviews);

      expect(stats.average).toBe(0);
      expect(stats.total).toBe(0);
      expect(stats.distribution[5]).toBe(0);
    });

    it('should handle single review', () => {
      const reviews = [{ rating: 5 }];
      const stats = calculateRatingStats(reviews);

      expect(stats.average).toBe(5);
      expect(stats.total).toBe(1);
      expect(stats.distribution[5]).toBe(1);
    });

    it('should round average to 1 decimal place', () => {
      const reviews = [
        { rating: 5 },
        { rating: 4 },
        { rating: 4 },
      ];

      const stats = calculateRatingStats(reviews);

      // Average is 4.333... which should round to 4.3
      expect(stats.average).toBe(4.3);
    });
  });

  describe('containsProfanity', () => {
    it('should detect profanity (placeholder implementation)', () => {
      // This is a stub implementation with placeholder words
      const cleanText = 'This is a great chef!';
      const profaneText = 'This contains badword1';

      expect(containsProfanity(cleanText)).toBe(false);
      expect(containsProfanity(profaneText)).toBe(true);
    });

    it('should be case-insensitive', () => {
      const text = 'This contains BADWORD1';
      expect(containsProfanity(text)).toBe(true);
    });
  });
});
