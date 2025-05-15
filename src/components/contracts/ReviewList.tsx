import { Review, Profile } from '@/types';
import { formatDate } from '@/lib/utils';

interface ReviewListProps {
  reviews: Review[];
  reviewerProfiles?: Record<string, Profile>;
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg 
          key={star}
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 ${
            star <= rating 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300 dark:text-gray-600'
          }`}
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

export const ReviewList = ({ reviews, reviewerProfiles }: ReviewListProps) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div 
          key={review.$id} 
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
                {/* User avatar could go here */}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {reviewerProfiles?.[review.reviewerId]?.displayName || 'Anonymous User'}
                </p>
                <div className="flex items-center mt-1">
                  <StarRating rating={review.rating} />
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    {review.rating} star{review.rating !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(review.createdAt)}
            </p>
          </div>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            {review.comment}
          </p>
        </div>
      ))}
    </div>
  );
};