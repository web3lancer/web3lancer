'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { contractService } from '@/services/contract.service';
import { profileService } from '@/services/profile.service';
import { Contract, Profile, Review } from '@/types';
import { ContractDetails } from '@/components/contracts/ContractDetails';
import { AddMilestoneForm } from '@/components/contracts/AddMilestoneForm';
import { ReviewForm } from '@/components/contracts/ReviewForm';
import { ReviewList } from '@/components/contracts/ReviewList';
import { Spinner } from '@/components/ui/spinner';
import { useParams, useRouter } from 'next/navigation';

export default function ContractDetailsPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const contractId = params.contractId as string;
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [clientProfile, setClientProfile] = useState<Profile | null>(null);
  const [freelancerProfile, setFreelancerProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewerProfiles, setReviewerProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if the current user is the client or freelancer of the contract
  const isClient = user?.userId === contract?.clientId;
  const isFreelancer = user?.userId === contract?.freelancerId;
  const canSubmitReview = (isClient || isFreelancer) && contract?.status === 'completed';
  const canAddMilestone = isClient && contract?.status === 'active';
  
  useEffect(() => {
    const fetchContractDetails = async () => {
      if (!contractId) {
        setError('Invalid contract ID');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Fetch contract
        const contractData = await contractService.getContract(contractId);
        if (!contractData) {
          setError('Contract not found');
          setLoading(false);
          return;
        }
        
        setContract(contractData);
        
        // Fetch profiles
        const [clientData, freelancerData] = await Promise.all([
          contractData.clientProfileId ? profileService.getProfileById(contractData.clientProfileId) : null,
          contractData.freelancerProfileId ? profileService.getProfileById(contractData.freelancerProfileId) : null
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