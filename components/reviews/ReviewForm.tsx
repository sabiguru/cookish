'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StarRating from './StarRating';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface ReviewFormProps {
  bookingId: string;
  chefName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  bookingId,
  chefName,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Validate number of photos
    if (photos.length + files.length > 4) {
      setError('You can only upload up to 4 photos');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const newPhotos: string[] = [];

      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError(`File ${file.name} is not an image`);
          continue;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        // TODO: Upload to storage (MinIO/S3)
        // For now, create a mock URL
        const mockUrl = URL.createObjectURL(file);
        newPhotos.push(mockUrl);
      }

      setPhotos((prev) => [...prev, ...newPhotos]);
    } catch (error) {
      console.error('Failed to upload photos:', error);
      setError('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (rating <= 3 && !comment.trim()) {
      setError('Please provide a comment explaining what went wrong for ratings of 3 stars or below.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          rating,
          comment: comment.trim() || undefined,
          photos: photos.length > 0 ? photos : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit review');
      }

      // Success
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/user/reviews');
      }
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      setError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Review {chefName}
      </h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating <span className="text-red-500">*</span>
        </label>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {rating > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            {rating === 5 && 'Excellent!'}
            {rating === 4 && 'Very good'}
            {rating === 3 && 'Good'}
            {rating === 2 && 'Fair'}
            {rating === 1 && 'Poor'}
          </p>
        )}
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comment {rating <= 3 && <span className="text-red-500">*</span>}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            rating <= 3
              ? 'Please tell us what went wrong...'
              : 'Share details about your experience...'
          }
          required={rating <= 3}
          rows={5}
          maxLength={2000}
          className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/2000 characters
        </p>
      </div>

      {/* Photos */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos (optional, up to 4)
        </label>

        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length < 4 && (
          <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              disabled={uploading}
              className="hidden"
            />
            <Upload className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {uploading ? 'Uploading...' : 'Upload Photos'}
            </span>
          </label>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting || uploading || rating === 0}
          className="flex-1 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
