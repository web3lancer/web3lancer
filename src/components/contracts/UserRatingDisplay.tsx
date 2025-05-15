import { useEffect, useState } from 'react';
import { contractService } from '@/services/contract.service';

interface UserRatingDisplayProps {
  userId: string;
}

export const UserRatingDisplay = ({ userId }: UserRatingDisplayProps) => {
  const [rating, setRating] = useState<{ average: number; count: number }>({
    average: 0,
    count: 0
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRating = async () => {
      setLoading(true);
      try {
        const userRating = await contractService.getUserRating(userId);
        setRating(userRating);
      } catch (error) {
        console.error('Error fetching user rating:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRating();
    }
  }, [userId]);

  if (loading) {
    return <div className="animate-pulse h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>;
  }

  if (rating.count === 0) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">No reviews yet</div>;
  }

  return (
    <div className="flex items-center">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg 
            key={star}
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 ${
              star <= Math.round(rating.average) 
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
      <div className="ml-2 text-sm text-gray-700 dark:text-gray-300">
        <span className="font-medium">{rating.average.toFixed(1)}</span>
        <span className="text-gray-500 dark:text-gray-400 ml-1">({rating.count} review{rating.count !== 1 ? 's' : ''})</span>
      </div>
    </div>
  );
};