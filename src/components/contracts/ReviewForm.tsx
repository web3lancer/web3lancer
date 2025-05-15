import React, { useState } from 'react';
import { Review } from "@/types";

interface ReviewFormProps {
  contractId: string;
  projectId: string;
  revieweeId: string;
  revieweeProfileId: string;
  existingReview?: Review;
  onSubmit: (reviewData: Partial<Review>) => Promise<void>;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  contractId,
  projectId,
  revieweeId,
  revieweeProfileId,
  existingReview,
  onSubmit,
  onCancel
}) => {
  const [rating, setRating] = useState<number>(existingReview?.rating || 5);
  const [comment, setComment] = useState<string>(existingReview?.comment || '');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(existingReview?.isAnonymous || false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const reviewData: Partial<Review> = {
        contractId,
        projectId,
        revieweeId,
        revieweeProfileId,
        rating,
        comment,
        isAnonymous
      };
      
      // If we're editing an existing review, keep the ID
      if (existingReview) {
        reviewData.$id = existingReview.$id;
      }
      
      await onSubmit(reviewData);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">
            {existingReview ? 'Edit Review' : 'Leave a Review'}
          </h3>
        </div>
        
        <div className="space-y-4 mb-4">
          {/* Rating Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Rating
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="focus:outline-none"
                >
                  <svg 
                    className={`h-8 w-8 ${value <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500">
                {rating} out of 5
              </span>
            </div>
          </div>
          
          {/* Comment Input */}
          <div>
            <label 
              htmlFor="comment" 
              className="block text-sm font-medium mb-2"
            >
              Review Comment
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="Share your experience working on this project..."
              required
            />
          </div>
          
          {/* Anonymous Option */}
          <div className="flex items-center">
            <input
              id="anonymous"
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label 
              htmlFor="anonymous" 
              className="ml-2 block text-sm text-gray-500"
            >
              Post anonymously
            </label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;