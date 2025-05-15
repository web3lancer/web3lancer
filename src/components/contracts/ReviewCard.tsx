import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Review } from "@/types";

interface ReviewCardProps {
  review: Review;
  isOwnReview?: boolean;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
}

// Component to render star ratings
const StarRating: React.FC<{ rating: number, maxRating?: number }> = ({ 
  rating, 
  maxRating = 5 
}) => {
  return (
    <div className="flex">
      {[...Array(maxRating)].map((_, i) => (
        <svg 
          key={i}
          className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const ReviewCard: React.FC<ReviewCardProps> = ({ 
  review,
  isOwnReview = false,
  onEdit,
  onDelete
}) => {
  // Calculate if the review is still editable (within 24 hours)
  const isEditable = () => {
    if (!isOwnReview) return false;
    
    const reviewDate = new Date(review.createdAt).getTime();
    const currentDate = new Date().getTime();
    const hoursDifference = (currentDate - reviewDate) / (1000 * 60 * 60);
    
    return hoursDifference <= 24;
  };

  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {review.isAnonymous ? 'Anonymous' : `Review by ${review.reviewerProfileId}`}
            </CardTitle>
            <div className="text-sm text-gray-500">
              {formatDate(review.createdAt)}
            </div>
          </div>
          <StarRating rating={review.rating} />
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm text-gray-500 whitespace-pre-line">
          {review.comment}
        </p>
      </CardContent>
      
      {isOwnReview && isEditable() && (
        <CardFooter>
          <div className="flex space-x-2 ml-auto">
            {onEdit && (
              <Button 
                size="sm"
                variant="outline" 
                onClick={() => onEdit(review.$id)}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button 
                size="sm"
                variant="destructive" 
                onClick={() => onDelete(review.$id)}
              >
                Delete
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ReviewCard;