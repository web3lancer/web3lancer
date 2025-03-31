import React, { useEffect, useState } from 'react';
import { Box, Typography, Rating, Skeleton, Tooltip, Paper } from '@mui/material';
import { useStellarContract } from '@/hooks/useStellarContract';

interface ReputationDisplayProps {
  userId: string;
  showReviews?: boolean;
}

export default function ReputationDisplay({ userId, showReviews = false }: ReputationDisplayProps) {
  const { loading, error, getReputationScore, getUserReviews } = useStellarContract();
  const [score, setScore] = useState<number | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  
  useEffect(() => {
    if (!userId) return;
    
    // Fetch reputation score
    const fetchScore = async () => {
      try {
        const reputationScore = await getReputationScore(userId);
        setScore(reputationScore);
        
        // Fetch reviews if requested
        if (showReviews) {
          const userReviews = await getUserReviews(userId);
          setReviews(userReviews);
        }
      } catch (err) {
        console.error('Error fetching reputation data:', err);
      }
    };
    
    fetchScore();
  }, [userId, showReviews, getReputationScore, getUserReviews]);
  
  if (loading && score === null) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Skeleton variant="text" width={120} height={24} />
        <Skeleton variant="rectangular" width={120} height={24} sx={{ ml: 1 }} />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Tooltip title={error}>
        <Typography color="error" variant="body2">
          Error loading reputation
        </Typography>
      </Tooltip>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="subtitle2" sx={{ mr: 1 }}>
          Reputation:
        </Typography>
        <Rating 
          value={score || 0} 
          precision={0.5} 
          readOnly 
          size="small"
        />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          ({score?.toFixed(1) || '0.0'})
        </Typography>
      </Box>
      
      {showReviews && reviews.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Recent Reviews:
          </Typography>
          {reviews.map((review, index) => (
            <Paper key={index} sx={{ p: 1.5, mb: 1, bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Rating value={review.rating} readOnly size="small" />
                <Typography variant="caption" color="text.secondary">
                  {new Date(review.timestamp).toLocaleDateString()}
                </Typography>
              </Box>
              <Typography variant="body2">{review.comment}</Typography>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}
