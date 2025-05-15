"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
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
        ]);
        
        setClientProfile(clientData);
        setFreelancerProfile(freelancerData);
        
        // Fetch reviews for the project
        if (contractData.projectId) {
          const projectReviews = await profileService.getProjectReviews(contractData.projectId);
          setReviews(projectReviews);
          
          // Fetch reviewer profiles
          const reviewerIds = [...new Set(projectReviews.map(r => r.reviewerId))];
          const profiles: Record<string, Profile> = {};
          
          await Promise.all(
            reviewerIds.map(async (id) => {
              const profile = await profileService.getProfileByUserId(id);
              if (profile) {
                profiles[id] = profile;
              }
            })
          );
          
          setReviewerProfiles(profiles);
        }
      } catch (err) {
        console.error('Error fetching contract details:', err);
        setError('Failed to load contract details');
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.userId) {
      fetchContractDetails();
    }
  }, [contractId, user?.userId]);
  
  // Handle contract update
  const handleContractUpdate = (updatedContract: Contract) => {
    setContract(updatedContract);
  };
  
  // Handle review submission
  const handleReviewSubmitted = (review: Review) => {
    setReviews(prev => [review, ...prev]);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }
  
  if (!contract || !user?.userId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md">
          Contract not found or you're not authorized to view it.
        </div>
        <div className="mt-4">
          <button
            onClick={() => router.push('/contracts')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Back to Contracts
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <button
          onClick={() => router.push('/contracts')}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          ← Back to Contracts
        </button>
      </div>
      
      <ContractDetails
        contract={contract}
        clientProfile={clientProfile || undefined}
        freelancerProfile={freelancerProfile || undefined}
        currentUserId={user.userId}
        onContractUpdate={handleContractUpdate}
      />
      
      {canAddMilestone && (
        <div className="mt-6">
          <AddMilestoneForm
            contractId={contract.$id}
            onMilestoneAdded={handleContractUpdate}
          />
        </div>
      )}
      
      {contract.status === 'completed' && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Reviews
          </h2>
          
          {canSubmitReview && (
            <div className="mb-6">
              {isClient && freelancerProfile && (
                <ReviewForm
                  projectId={contract.projectId}
                  reviewerId={user.userId}
                  recipientId={contract.freelancerId}
                  recipientName={freelancerProfile.displayName}
                  onReviewSubmitted={handleReviewSubmitted}
                />
              )}
              
              {isFreelancer && clientProfile && (
                <ReviewForm
                  projectId={contract.projectId}
                  reviewerId={user.userId}
                  recipientId={contract.clientId}
                  recipientName={clientProfile.displayName}
                  onReviewSubmitted={handleReviewSubmitted}
                />
              )}
            </div>
          )}
          
          <ReviewList reviews={reviews} reviewerProfiles={reviewerProfiles} />
        </div>
      )}
    </div>
  );
}