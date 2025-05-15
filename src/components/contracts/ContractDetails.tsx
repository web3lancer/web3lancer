import { Contract, Profile } from '@/types';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { MilestoneList } from './MilestoneList';
import { useState } from 'react';
import { contractService } from '@/services/contract.service';
import { toast } from 'react-hot-toast';

interface ContractDetailsProps {
  contract: Contract;
  clientProfile?: Profile;
  freelancerProfile?: Profile;
  currentUserId: string;
  onContractUpdate?: (updatedContract: Contract) => void;
}

export const ContractDetails = ({ 
  contract, 
  clientProfile, 
  freelancerProfile, 
  currentUserId,
  onContractUpdate
}: ContractDetailsProps) => {
  const [updating, setUpdating] = useState<boolean>(false);
  const isClient = currentUserId === contract.clientId;
  const isFreelancer = currentUserId === contract.freelancerId;
  
  if (!isClient && !isFreelancer) {
    return <div>You don't have permission to view this contract</div>;
  }

  const handleUpdateStatus = async (newStatus: Contract['status']) => {
    if (!contract.$id) return;
    
    setUpdating(true);
    try {
      const updatedContract = await contractService.updateContractStatus(contract.$id, newStatus);
      if (updatedContract && onContractUpdate) {
        onContractUpdate(updatedContract);
        toast.success(`Contract status updated to ${newStatus}`);
      } else {
        toast.error('Failed to update contract status');
      }
    } catch (error) {
      console.error('Error updating contract status:', error);
      toast.error('An error occurred while updating contract status');
    } finally {
      setUpdating(false);
    }
  };

  const renderStatusBadge = (status: Contract['status']) => {
    const statusColors = {
      draft: 'bg-gray-200 text-gray-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      disputed: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <Badge className={statusColors[status] || ''}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const renderActions = () => {
    if (updating) {
      return <p className="text-gray-500">Updating...</p>;
    }
    
    if (contract.status === 'active') {
      return (
        <div className="flex space-x-3">
          <button
            onClick={() => handleUpdateStatus('completed')}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
            disabled={updating}
          >
            Mark as Completed
          </button>
          {isClient && (
            <button
              onClick={() => handleUpdateStatus('cancelled')}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
              disabled={updating}
            >
              Cancel Contract
            </button>
          )}
          <button
            onClick={() => handleUpdateStatus('disputed')}
            className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
            disabled={updating}
          >
            Raise Dispute
          </button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{contract.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Contract ID: {contract.$id}
            </p>
          </div>
          {renderStatusBadge(contract.status)}
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Client</h3>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {clientProfile?.displayName || 'Unknown Client'}
            </p>
            {clientProfile && (
              <Link
                href={`/profile/${clientProfile.username}`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
              >
                View Profile
              </Link>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Freelancer</h3>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {freelancerProfile?.displayName || 'Unknown Freelancer'}
            </p>
            {freelancerProfile && (
              <Link
                href={`/profile/${freelancerProfile.username}`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
              >
                View Profile
              </Link>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Budget</h3>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              ${contract.budget.toFixed(2)} USD
            </p>
          </div>
          {contract.duration && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Duration</h3>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {contract.duration.value} {contract.duration.unit}
              </p>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Start Date</h3>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {contract.startDate ? formatDate(contract.startDate) : 'Not started'}
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Description</h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {contract.description}
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Terms</h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {contract.terms}
            </p>
          </div>
        </div>
        
        {contract.milestones && contract.milestones.length > 0 && (
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              Milestones
            </h3>
            <MilestoneList 
              milestones={contract.milestones} 
              contractId={contract.$id || ''}
              isClient={isClient}
              isFreelancer={isFreelancer}
              contractStatus={contract.status}
              onMilestoneUpdate={(updatedContract) => {
                if (onContractUpdate) {
                  onContractUpdate(updatedContract);
                }
              }}
            />
          </div>
        )}
        
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          {renderActions()}
        </div>
      </div>
    </div>
  );
};