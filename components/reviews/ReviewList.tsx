'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import StarRating from './StarRating';
import { BadgeCheck, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  photos: string[];
  createdAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  booking: {
    id: string;
    eventDate: string;
  };
  reply?: {
    id: string;
    body: string;
    createdAt: string;
    author: {
      id: true;
      name: string;
      image?: string;
    };
  };
}

interface ReviewListProps {
  chefId: string;
  currentUserId?: string;
  isChef?: boolean;
}

export default function ReviewList({
  chefId,
  currentUserId,
  isChef = false,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?chefId=${chefId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [chefId]);

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim() || replyText.trim().length < 10) {
      alert('Reply must be at least 10 characters long');
      return;
    }

    setSubmittingReply(true);

    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: replyText.trim(),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to submit reply');
      }

      const data = await res.json();

      // Update local state
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId ? { ...review, reply: data.reply } : review
        )
      );

      // Reset form
      setReplyingTo(null);
      setReplyText('');
    } catch (error: any) {
      console.error('Failed to submit reply:', error);
      alert(error.message || 'Failed to submit reply. Please try again.');
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
        >
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            {review.user.image ? (
              <img
                src={review.user.image}
                alt={review.user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-lg">
                {review.user.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* User info and rating */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">
                  {review.user.name}
                </h4>
                <BadgeCheck className="h-5 w-5 text-blue-500" title="Verified booking" />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <StarRating value={review.rating} readonly size="sm" />
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(review.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              <p className="text-xs text-gray-500">
                Event on {new Date(review.booking.eventDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="text-gray-700 mb-4 whitespace-pre-wrap">
              {review.comment}
            </p>
          )}

          {/* Photos */}
          {review.photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {review.photos.map((photo, index) => (
                <a
                  key={index}
                  href={photo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={photo}
                    alt={`Review photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity"
                  />
                </a>
              ))}
            </div>
          )}

          {/* Chef reply */}
          {review.reply && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-900">
                  {review.reply.author.name} (Chef)
                </span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(review.reply.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {review.reply.body}
              </p>
            </div>
          )}

          {/* Reply form (chef only) */}
          {isChef && !review.reply && (
            <div className="mt-4">
              {replyingTo === review.id ? (
                <div className="space-y-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your response..."
                    rows={3}
                    maxLength={1000}
                    className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReply(review.id)}
                      disabled={submittingReply || replyText.trim().length < 10}
                      className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {submittingReply ? 'Submitting...' : 'Submit Reply'}
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                      disabled={submittingReply}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setReplyingTo(review.id)}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Reply to this review
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
