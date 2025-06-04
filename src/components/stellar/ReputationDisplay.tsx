import React, { useEffect, useState } from 'react';
import { Box, Typography, Rating, Skeleton, Tooltip, Paper, Chip } from '@mui/material';
import { useStellarContract } from '@/hooks/useStellarContract';
import { graphiteService } from '@/utils/graphite';

interface ReputationDisplayProps {
  userId: string;
  showReviews?: boolean;
}

export default function ReputationDisplay({ userId, showReviews = false }: ReputationDisplayProps) {
  const { loading, error, getReputationScore, getUserReviews } = useStellarContract();
  const [score, setScore] = useState<number | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [graphiteTrust, setGraphiteTrust] = useState<number | null>(null);
  const [kycVerified, setKycVerified] = useState<boolean>(false);
  
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
  
  useEffect(() => {
    // Add Graphite trust score fetch
    const fetchGraphiteData = async () => {
      if (userId) {
        const trustData = await graphiteService.getTrustScore(userId);
        if (trustData) {
          setGraphiteTrust(trustData.trustScore);
          setKycVerified(trustData.kycVerified);
        }
      }
    };
    
    fetchGraphiteData();
  }, [userId]);
  
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
      
      {/* Add Graphite Trust Score */}
      {graphiteTrust !== null && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Graphite Trust Score: {graphiteTrust}/100
            {kycVerified && (
              <Chip 
                label="KYC Verified" 
                size="small" 
                color="success" 
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
        </Box>
      )}
      
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
