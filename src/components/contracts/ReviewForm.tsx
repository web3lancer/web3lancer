import { useState } from 'react';
import { contractService } from '@/services/contract.service';
import { Contract, Review } from '@/types';
import { toast } from 'react-hot-toast';

interface ReviewFormProps {
  projectId: string;
  reviewerId: string;
  recipientId: string;
  recipientName: string;
  onReviewSubmitted?: (review: Review) => void;
}

export const ReviewForm = ({ 
  projectId, 
  reviewerId, 
  recipientId, 
  recipientName,
  onReviewSubmitted 
}: ReviewFormProps) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Please provide a comment');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const reviewData = {
        projectId,
        reviewerId,
        recipientId,
        rating,
        comment: comment.trim()
      };
      
      const review = await contractService.createReview(reviewData);
      
      if (review) {
        toast.success('Review submitted successfully');
        setRating(0);
        setComment('');
        
        if (onReviewSubmitted) {
          onReviewSubmitted(review);
        }
      } else {
        toast.error('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('An error occurred while submitting the review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Rate your experience with {recipientName}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rating*
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                className="focus:outline-none"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-8 w-8 ${
                    star <= rating 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select a rating'}
            </span>
          </div>
        </div>
        
        <div>
          <label 
            htmlFor="comment" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Comment*
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Share your experience working with this person"
          />
        </div>
        
        <div>
          <button
            type="submit"
            disabled={submitting || rating === 0 || !comment.trim()}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};