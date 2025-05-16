import { Contract } from '@/types';
import { useState } from 'react';
import contractService from '@/services/contractService';
import { toast } from 'react-hot-toast';

interface MilestoneListProps {
  milestones: Contract['milestones'];
  contractId: string;
  isClient: boolean;
  isFreelancer: boolean;
  contractStatus: Contract['status'];
  onMilestoneUpdate: (updatedContract: Contract) => void;
}

export const MilestoneList = ({ 
  milestones, 
  contractId, 
  isClient, 
  isFreelancer,
  contractStatus,
  onMilestoneUpdate 
}: MilestoneListProps) => {
  const [updatingIndex, setUpdatingIndex] = useState<number | null>(null);
  
  if (!milestones || milestones.length === 0) {
    return <p className="text-gray-500">No milestones defined for this contract.</p>;
  }

  const handleStatusUpdate = async (index: number, newStatus: 'pending' | 'in_progress' | 'completed' | 'approved' | 'paid') => {
    setUpdatingIndex(index);
    try {
      const updatedContract = await contractService.updateMilestoneStatus(contractId, index, newStatus);
      if (updatedContract) {
        onMilestoneUpdate(updatedContract);
        toast.success(`Milestone status updated to ${newStatus}`);
      } else {
        toast.error('Failed to update milestone status');
      }
    } catch (error) {
      console.error('Error updating milestone status:', error);
      toast.error('An error occurred while updating milestone status');
    } finally {
      setUpdatingIndex(null);
    }
  };

  const renderStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      paid: 'bg-purple-100 text-purple-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const getMilestoneActions = (milestone: typeof milestones[0], index: number) => {
    if (contractStatus !== 'active') {
      return null;
    }

    if (updatingIndex === index) {
      return <p className="text-xs text-gray-500">Updating...</p>;
    }

    if (isFreelancer) {
      if (milestone.status === 'pending') {
        return (
          <button
            onClick={() => handleStatusUpdate(index, 'in_progress')}
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Start Work
          </button>
        );
      } else if (milestone.status === 'in_progress') {
        return (
          <button
            onClick={() => handleStatusUpdate(index, 'completed')}
            className="text-xs px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
          >
            Submit for Review
          </button>
        );
      }
    }

    if (isClient && milestone.status === 'completed') {
      return (
        <div className="flex space-x-2">
          <button
            onClick={() => handleStatusUpdate(index, 'approved')}
            className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Approve
          </button>
          <button
            onClick={() => handleStatusUpdate(index, 'in_progress')}
            className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Request Changes
          </button>
        </div>
      );
    }

    if (isClient && milestone.status === 'approved') {
      return (
        <button
          onClick={() => handleStatusUpdate(index, 'paid')}
          className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
        >
          Mark as Paid
        </button>
      );
    }

    return null;
  };

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {milestones.map((milestone, index) => (
        <div key={index} className="py-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200">
                {milestone.title}
              </h4>
              {milestone.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {milestone.description}
                </p>
              )}
              {milestone.dueDate && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Due: {new Date(milestone.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end">
              <span className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                ${milestone.amount?.toFixed(2)}
              </span>
              {renderStatusBadge(milestone.status)}
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            {getMilestoneActions(milestone, index)}
          </div>
        </div>
      ))}
    </div>
  );
};