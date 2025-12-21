import { z } from 'zod';

// Create review schema
export const CreateReviewSchema = z.object({
  bookingId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(2000).optional(),
  photos: z.array(z.string().url()).max(4).optional(),
}).refine(
  (data) => {
    // Require comment for ratings <= 3 stars
    if (data.rating <= 3 && (!data.comment || data.comment.trim().length === 0)) {
      return false;
    }
    return true;
  },
  {
    message: 'Please provide a comment explaining what went wrong for ratings of 3 stars or below.',
    path: ['comment'],
  }
);

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

// Create review reply schema
export const CreateReviewReplySchema = z.object({
  reviewId: z.string().cuid(),
  body: z.string().min(10).max(1000),
});

export type CreateReviewReplyInput = z.infer<typeof CreateReviewReplySchema>;

// Profanity filter stub (placeholder for future implementation)
export function containsProfanity(text: string): boolean {
  // TODO: Implement actual profanity detection
  // For now, just a simple blacklist check
  const profanityList = ['badword1', 'badword2']; // Placeholder
  const lowerText = text.toLowerCase();

  return profanityList.some(word => lowerText.includes(word));
}

// Sanitize review text
export function sanitizeReviewText(text: string): string {
  // Remove HTML tags and excessive whitespace
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Validate photo URL
export function isValidPhotoUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const pathname = urlObj.pathname.toLowerCase();

    return validExtensions.some(ext => pathname.endsWith(ext));
  } catch {
    return false;
  }
}

// Rating statistics helper
export interface RatingStats {
  average: number;
  total: number;
  distribution: {
    [key: number]: number; // 1-5 stars
  };
}

export function calculateRatingStats(reviews: Array<{ rating: number }>): RatingStats {
  const distribution: { [key: number]: number } = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating]++;
    }
  });

  const total = reviews.length;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  const average = total > 0 ? sum / total : 0;

  return {
    average: Math.round(average * 10) / 10, // Round to 1 decimal
    total,
    distribution,
  };
}
