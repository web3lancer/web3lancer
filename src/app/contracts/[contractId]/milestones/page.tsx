'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { contractService } from '@/services/contract.service';
import { Contract } from '@/types';
import { MilestoneList } from '@/components/contracts/MilestoneList';
import { AddMilestoneForm } from '@/components/contracts/AddMilestoneForm';
import { Spinner } from '@/components/ui/spinner';
import { useParams, useRouter } from 'next/navigation';

export default function ContractMilestonesPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const contractId = params.contractId as string;
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
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
  
  const isClient = user.userId === contract.clientId;
  const isFreelancer = user.userId === contract.freelancerId;
  const canAddMilestone = isClient && contract.status === 'active';
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/contracts/${contractId}`)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          ← Back to Contract
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Milestones for {contract.title}
          </h1>
        </div>
        
        <div className="p-6">
          {contract.milestones && contract.milestones.length > 0 ? (
            <MilestoneList 
              milestones={contract.milestones} 
              contractId={contract.$id || ''}
              isClient={isClient}
              isFreelancer={isFreelancer}
              contractStatus={contract.status}
              onMilestoneUpdate={handleContractUpdate}
            />
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No milestones defined for this contract.</p>
          )}
        </div>
      </div>
      
      {canAddMilestone && (
        <div className="mt-6">
          <AddMilestoneForm
            contractId={contract.$id}
            onMilestoneAdded={handleContractUpdate}
          />
        </div>
      )}
    </div>
  );
}