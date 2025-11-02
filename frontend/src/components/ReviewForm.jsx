import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import StarRating from './StarRating';
import LoadingButton from './LoadingButton';
import { reviewService } from '../services/reviewService';
import { useToast } from '../context/ToastContext';

export default function ReviewForm({ serviceId, onSuccess, onCancel, existingReview = null }) {
  const { showToast } = useToast();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      showToast('Please select a rating', 'error');
      return;
    }

    setLoading(true);
    try {
      if (existingReview) {
        await reviewService.updateReview(existingReview.id, { rating, comment });
        showToast('Review updated successfully', 'success');
      } else {
        await reviewService.createReview({ service: serviceId, rating, comment });
        showToast('Review submitted successfully', 'success');
      }
      setRating(0);
      setComment('');
      if (onSuccess) onSuccess();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || error.message || 'Failed to submit review';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          {existingReview ? 'Edit Review' : 'Write a Review'}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Rating *
          </label>
          <StarRating rating={rating} onRatingChange={setRating} />
        </div>
        
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
            Comment
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            placeholder="Share your experience..."
          />
        </div>
        
        <div className="flex gap-2">
          <LoadingButton
            type="submit"
            loading={loading}
            className="px-4 py-2"
          >
            {existingReview ? 'Update Review' : 'Submit Review'}
          </LoadingButton>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

