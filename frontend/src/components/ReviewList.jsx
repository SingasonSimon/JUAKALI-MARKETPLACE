import React, { useState } from 'react';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { reviewService } from '../services/reviewService';
import { useToast } from '../context/ToastContext';
import ConfirmationDialog from './ConfirmationDialog';

export default function ReviewList({ reviews, onUpdate, canEdit = false, readonly = false }) {
  const { showToast } = useToast();
  const [deleteReviewId, setDeleteReviewId] = useState(null);
  const [editingReview, setEditingReview] = useState(null);

  const handleDelete = async () => {
    if (!deleteReviewId) return;
    
    try {
      await reviewService.deleteReview(deleteReviewId);
      showToast('Review deleted successfully', 'success');
      setDeleteReviewId(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to delete review';
      showToast(errorMsg, 'error');
    }
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-gray-800 border border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {review.seeker_details?.first_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-white font-medium">
                    {review.seeker_details?.first_name} {review.seeker_details?.last_name}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <StarRating rating={review.rating} readonly size="sm" />
            </div>
            
            {!readonly && canEdit && review.seeker === review.seeker_details?.id && (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingReview(review)}
                  className="p-2 text-blue-400 hover:text-blue-300 transition"
                  title="Edit review"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteReviewId(review.id)}
                  className="p-2 text-red-400 hover:text-red-300 transition"
                  title="Delete review"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          {review.comment && (
            <p className="text-gray-300 mt-2">{review.comment}</p>
          )}
        </div>
      ))}
      
      <ConfirmationDialog
        isOpen={!!deleteReviewId}
        onClose={() => setDeleteReviewId(null)}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
      
      {!readonly && editingReview && (
        <div className="mt-4">
          <ReviewForm
            serviceId={editingReview.service}
            existingReview={editingReview}
            onSuccess={() => {
              setEditingReview(null);
              if (onUpdate) onUpdate();
            }}
            onCancel={() => setEditingReview(null)}
          />
        </div>
      )}
    </div>
  );
}

