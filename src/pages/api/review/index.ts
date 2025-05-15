import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import contractService from '@/services/contractService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get user session for authentication
    const session = await getSession({ req });
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = session.user.id;
    
    switch (req.method) {
      case 'GET':
        return handleGetRequest(req, res, userId);
      case 'POST':
        return handlePostRequest(req, res, userId);
      case 'PUT':
        return handlePutRequest(req, res, userId);
      case 'DELETE':
        return handleDeleteRequest(req, res, userId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Review API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Handle GET requests for reviews
async function handleGetRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { reviewId, contractId, profileId } = req.query;
  
  // Get a specific review
  if (reviewId && typeof reviewId === 'string') {
    const review = await contractService.getReview(reviewId);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    return res.status(200).json(review);
  }
  
  // Get reviews for a specific contract
  if (contractId && typeof contractId === 'string') {
    // Check if user is part of the contract
    const contract = await contractService.getContract(contractId);
    
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    // Check if user is authorized to view this contract's reviews
    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const reviews = await contractService.getReviewsByContractId(contractId);
    return res.status(200).json(reviews);
  }
  
  // Get reviews for a specific profile
  if (profileId && typeof profileId === 'string') {
    const reviews = await contractService.getReviewsForProfile(profileId);
    return res.status(200).json(reviews);
  }
  
  // Get reviews written by the user
  const reviews = await contractService.getReviewsByReviewerId(userId);
  return res.status(200).json(reviews);
}

// Handle POST requests for creating reviews
async function handlePostRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const reviewData = req.body;
  
  // Validate required fields
  if (!reviewData.contractId || !reviewData.rating || reviewData.comment === undefined || reviewData.revieweeId === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Get the contract to check permissions
  const contract = await contractService.getContract(reviewData.contractId);
  
  if (!contract) {
    return res.status(404).json({ error: 'Contract not found' });
  }
  
  // Check if the user is part of this contract
  if (contract.clientId !== userId && contract.freelancerId !== userId) {
    return res.status(403).json({ error: 'You are not authorized to review this contract' });
  }
  
  // Check if the user is trying to review the other party of the contract
  if (userId === contract.clientId && reviewData.revieweeId !== contract.freelancerId) {
    return res.status(400).json({ error: 'You can only review the freelancer of this contract' });
  }
  
  if (userId === contract.freelancerId && reviewData.revieweeId !== contract.clientId) {
    return res.status(400).json({ error: 'You can only review the client of this contract' });
  }
  
  // Set reviewer information
  reviewData.reviewerId = userId;
  reviewData.reviewerProfileId = userId === contract.clientId ? contract.clientProfileId : contract.freelancerProfileId;
  
  // Check if the user has already reviewed this contract
  const existingReviews = await contractService.getReviewsByContractId(reviewData.contractId);
  const userHasReviewed = existingReviews.some(review => review.reviewerId === userId);
  
  if (userHasReviewed) {
    return res.status(400).json({ error: 'You have already reviewed this contract' });
  }
  
  // Create the review
  const newReview = await contractService.createReview(reviewData);
  
  if (!newReview) {
    return res.status(500).json({ error: 'Failed to create review' });
  }
  
  return res.status(201).json(newReview);
}

// Handle PUT requests for updating reviews
async function handlePutRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { reviewId } = req.query;
  const reviewData = req.body;
  
  if (!reviewId || typeof reviewId !== 'string') {
    return res.status(400).json({ error: 'Review ID is required' });
  }
  
  // Get the current review
  const existingReview = await contractService.getReview(reviewId);
  
  if (!existingReview) {
    return res.status(404).json({ error: 'Review not found' });
  }
  
  // Only the reviewer can update their review
  if (existingReview.reviewerId !== userId) {
    return res.status(403).json({ error: 'You can only update your own reviews' });
  }
  
  // User can't change reviewee or contract
  delete reviewData.revieweeId;
  delete reviewData.revieweeProfileId;
  delete reviewData.contractId;
  delete reviewData.reviewerId;
  delete reviewData.reviewerProfileId;
  
  // Update the review
  const updatedReview = await contractService.updateReview(reviewId, reviewData);
  
  if (!updatedReview) {
    return res.status(500).json({ error: 'Failed to update review' });
  }
  
  return res.status(200).json(updatedReview);
}

// Handle DELETE requests for reviews
async function handleDeleteRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { reviewId } = req.query;
  
  if (!reviewId || typeof reviewId !== 'string') {
    return res.status(400).json({ error: 'Review ID is required' });
  }
  
  // Get the current review
  const existingReview = await contractService.getReview(reviewId);
  
  if (!existingReview) {
    return res.status(404).json({ error: 'Review not found' });
  }
  
  // Only the reviewer can delete their review
  if (existingReview.reviewerId !== userId) {
    return res.status(403).json({ error: 'You can only delete your own reviews' });
  }
  
  // Only allow deletion within 24 hours of creation
  const reviewCreatedAt = new Date(existingReview.createdAt).getTime();
  const currentTime = new Date().getTime();
  const timeDifferenceHours = (currentTime - reviewCreatedAt) / (1000 * 60 * 60);
  
  if (timeDifferenceHours > 24) {
    return res.status(400).json({ 
      error: 'Reviews can only be deleted within 24 hours of creation' 
    });
  }
  
  const success = await contractService.deleteReview(reviewId);
  
  if (!success) {
    return res.status(500).json({ error: 'Failed to delete review' });
  }
  
  return res.status(200).json({ message: 'Review deleted successfully' });
}