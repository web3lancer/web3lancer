import React from 'react';
import { PlatformProposal } from '@/types/governance';
import { format } from 'date-fns';
import Link from 'next/link';

interface ProposalStatusBadgeProps {
  status: PlatformProposal['status'];
}

const ProposalStatusBadge: React.FC<ProposalStatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'discussion':
        return 'bg-blue-100 text-blue-800';
      case 'voting':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'implemented':
        return 'bg-purple-100 text-purple-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = () => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`}>
      {getStatusLabel()}
    </span>
  );
};

interface ProposalCardProps {
  proposal: PlatformProposal;
  isUserProposer?: boolean;
  displayMode?: 'compact' | 'full';
}

const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  isUserProposer = false,
  displayMode = 'compact'
}) => {
  const calculateProgress = () => {
    const totalVotes = (proposal.yesVotes || 0) + (proposal.noVotes || 0) + (proposal.abstainVotes || 0);
    if (totalVotes === 0) return 0;
    return ((proposal.yesVotes || 0) / totalVotes) * 100;
  };

  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <Link href={`/proposals/${proposal.$id}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
              {proposal.title}
            </h3>
          </Link>
          <ProposalStatusBadge status={proposal.status} />
        </div>
        
        <div className="mt-2 text-sm text-gray-500 flex flex-wrap gap-x-4">
          <span>Created: {format(new Date(proposal.$createdAt), 'PPP')}</span>
          <span>Category: {formatCategory(proposal.category)}</span>
          {proposal.votingStartDate && proposal.status === 'voting' && (
            <span>Voting ends: {format(new Date(proposal.votingEndDate || ''), 'PPP')}</span>
          )}
        </div>
        
        {displayMode === 'full' ? (
          <div className="mt-4">
            <h4 className="text-md font-medium text-gray-900">Description</h4>
            <div className="mt-2 text-gray-600 prose max-w-none">
              {proposal.description}
            </div>
            
            {proposal.status === 'implemented' && proposal.implementationDetails && (
              <div className="mt-4">
                <h4 className="text-md font-medium text-gray-900">Implementation Details</h4>
                <p className="mt-1 text-gray-600">{proposal.implementationDetails}</p>
              </div>
            )}
            
            {proposal.status === 'voting' && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-2">Voting Progress</h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full" 
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {Math.round(calculateProgress())}% Yes
                  </span>
                </div>
                
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-green-600">{proposal.yesVotes || 0}</span>
                    <span className="text-gray-500 ml-1">Yes</span>
                  </div>
                  <div>
                    <span className="font-medium text-red-600">{proposal.noVotes || 0}</span>
                    <span className="text-gray-500 ml-1">No</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">{proposal.abstainVotes || 0}</span>
                    <span className="text-gray-500 ml-1">Abstain</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-gray-600 line-clamp-2">{proposal.description}</p>
            
            {proposal.status === 'voting' && (
              <div className="mt-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">
                    {Math.round(calculateProgress())}% Yes
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <div>
            {isUserProposer && (
              <span className="text-xs text-gray-500">You proposed this</span>
            )}
          </div>
          {displayMode === 'compact' && (
            <Link 
              href={`/proposals/${proposal.$id}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalCard;