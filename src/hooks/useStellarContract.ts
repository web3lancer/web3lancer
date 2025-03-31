import { useState } from 'react';
import { contractClient } from '@/utils/stellar/contractClient';

export function useStellarContract() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Submit a review for a user
   */
  const submitReview = async (
    reviewerId: string,
    targetId: string,
    projectId: string,
    rating: number,
    comment: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await contractClient.submitReview(
        reviewerId,
        targetId,
        projectId,
        rating,
        comment
      );
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get the reputation score for a user
   */
  const getReputationScore = async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      return await contractClient.getReputationScore(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get reputation score');
      return 0;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Dispute a review
   */
  const disputeReview = async (
    disputerId: string,
    reviewId: string,
    reason: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await contractClient.disputeReview(disputerId, reviewId, reason);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dispute review');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get reviews for a user
   */
  const getUserReviews = async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      return await contractClient.getUserReviews(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user reviews');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    submitReview,
    getReputationScore,
    disputeReview,
    getUserReviews
  };
}
