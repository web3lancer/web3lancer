"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import contractService from '@/services/contractService';
import { Contract, Review } from '@/types';
import { formatDate } from '@/lib/utils';
import ReviewForm from '@/components/contracts/ReviewForm';
import ReviewCard from '@/components/contracts/ReviewCard';

interface ContractPageProps {
  params: {
    contractId: string;
  };
}

export default function ContractPage({ params }: ContractPageProps) {
  const { contractId } = params;
  const router = useRouter();
  const { user } = useAuth();
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContractData() {
      if (!user || !contractId) return;
      
      try {
        setLoading(true);
        
        // Fetch contract details
        const contractData = await contractService.getContract(contractId);
        
        if (!contractData) {
          setError('Contract not found.');
          return;
        }
        
        // Check if user is part of this contract
        if (contractData.clientId !== user.userId && contractData.freelancerId !== user.userId) {
          setError('You do not have permission to view this contract.');
          return;
        }
        
        setContract(contractData);
        
        // Fetch reviews for this contract
        const contractReviews = await contractService.getReviewsByContractId(contractId);
        setReviews(contractReviews);
        
      } catch (error) {
        console.error('Error fetching contract details:', error);
        setError('Failed to fetch contract details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchContractData();
  }, [contractId, user]);

  const handleUpdateContractStatus = async (status: Contract['status']) => {
    if (!contract) return;
    
    try {
      const updatedContract = await contractService.updateContractStatus(contract.$id, status);
      
      if (updatedContract) {
        setContract(updatedContract);
      }
    } catch (error) {
      console.error('Error updating contract status:', error);
      alert('Failed to update contract status. Please try again.');
    }
  };

  const handleSubmitReview = async (reviewData: Partial<Review>) => {
    try {
      if (editingReview) {
        // Update existing review
        const updatedReview = await contractService.updateReview(
          editingReview.$id,
          reviewData
        );
        
        if (updatedReview) {
          setReviews(reviews.map(review => 
            review.$id === updatedReview.$id ? updatedReview : review
          ));
          setEditingReview(null);
        }
      } else {
        // Create new review
        const newReview = await contractService.createReview(reviewData);
        
        if (newReview) {
          setReviews([...reviews, newReview]);
        }
      }
      
      setShowReviewForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleEditReview = (reviewId: string) => {
    const reviewToEdit = reviews.find(review => review.$id === reviewId);
    
    if (reviewToEdit) {
      setEditingReview(reviewToEdit);
      setShowReviewForm(true);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const success = await contractService.deleteReview(reviewId);
      
      if (success) {
        setReviews(reviews.filter(review => review.$id !== reviewId));
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    }
  };

  const canLeaveReview = () => {
    if (!contract || !user) return false;
    
    // Check if user is part of this contract
    if (contract.clientId !== user.userId && contract.freelancerId !== user.userId) {
      return false;
    }
    
    // Check if contract is completed
    if (contract.status !== 'completed') {
      return false;
    }
    
    // Check if user has already left a review
    return !reviews.some(review => review.reviewerId === user.userId);
  };

  const renderContractStatus = (status: Contract['status']) => {
    const statusColors = {
      draft: "bg-gray-100 text-gray-800",
      active: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      disputed: "bg-yellow-100 text-yellow-800",
    };
    
    return (
      <span className={`px-2 py-1 text-sm font-medium rounded-full ${statusColors[status] || "bg-gray-100"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10">Loading contract details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10 text-red-500">{error}</div>
        <div className="text-center">
          <Link href="/contracts" className="text-blue-600 hover:underline">
            Return to Contracts
          </Link>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10">Contract not found.</div>
        <div className="text-center">
          <Link href="/contracts" className="text-blue-600 hover:underline">
            Return to Contracts
          </Link>
        </div>
      </div>
    );
  }

  const isClient = contract.clientId === user?.userId;
  const userRole = isClient ? 'client' : 'freelancer';
  const otherPartyId = isClient ? contract.freelancerId : contract.clientId;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/contracts" className="text-blue-600 hover:underline">
          ← Back to Contracts
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">{contract.title}</h1>
            <p className="text-gray-500">Contract ID: {contract.$id}</p>
          </div>
          <div>
            {renderContractStatus(contract.status)}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Contract Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Project ID:</span> {contract.projectId}</p>
              <p><span className="font-medium">Budget:</span> ${contract.budget.toFixed(2)}</p>
              {contract.duration && (
                <p>
                  <span className="font-medium">Duration:</span> {contract.duration.value} {contract.duration.unit}
                </p>
              )}
              <p>
                <span className="font-medium">Start Date:</span> {contract.startDate ? formatDate(contract.startDate) : 'Not started'}
              </p>
              <p>
                <span className="font-medium">End Date:</span> {contract.endDate ? formatDate(contract.endDate) : 'Not completed'}
              </p>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Parties</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Client ID:</span> {contract.clientId} 
                {isClient && ' (You)'}
              </p>
              <p>
                <span className="font-medium">Freelancer ID:</span> {contract.freelancerId} 
                {!isClient && ' (You)'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{contract.description}</p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Terms & Conditions</h2>
          <p className="text-gray-700 whitespace-pre-line">{contract.terms}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Link 
            href={`/contracts/${contract.$id}/milestones`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            View Milestones
          </Link>
          
          {/* Status Update Buttons */}
          {isClient && contract.status === 'draft' && (
            <>
              <button
                onClick={() => handleUpdateContractStatus('active')}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
              >
                Activate Contract
              </button>
              <button
                onClick={() => handleUpdateContractStatus('cancelled')}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Cancel Contract
              </button>
            </>
          )}
          
          {isClient && contract.status === 'active' && (
            <>
              <button
                onClick={() => handleUpdateContractStatus('completed')}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
              >
                Mark as Completed
              </button>
              <button
                onClick={() => handleUpdateContractStatus('cancelled')}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Cancel Contract
              </button>
            </>
          )}
          
          {contract.status === 'active' && (
            <button
              onClick={() => handleUpdateContractStatus('disputed')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700"
            >
              Raise Dispute
            </button>
          )}
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Reviews</h2>
        
        {/* Review Form */}
        {canLeaveReview() && !showReviewForm && (
          <div className="mb-4">
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Leave a Review
            </button>
          </div>
        )}
        
        {showReviewForm && (
          <div className="mb-6">
            <ReviewForm
              contractId={contract.$id}
              projectId={contract.projectId}
              revieweeId={isClient ? contract.freelancerId : contract.clientId}
              revieweeProfileId={isClient ? contract.freelancerProfileId : contract.clientProfileId}
              existingReview={editingReview || undefined}
              onSubmit={handleSubmitReview}
              onCancel={() => {
                setShowReviewForm(false);
                setEditingReview(null);
              }}
            />
          </div>
        )}
        
        {/* Reviews List */}
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <ReviewCard
                key={review.$id}
                review={review}
                isOwnReview={review.reviewerId === user?.userId}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}