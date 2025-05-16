import React, { useState, useEffect } from 'react';
import { Dispute } from '@/types/governance';
import { format } from 'date-fns';
import Link from 'next/link';

interface DisputeStatusBadgeProps {
  status: Dispute['status'];
}

const DisputeStatusBadge: React.FC<DisputeStatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'mediation':
        return 'bg-purple-100 text-purple-800';
      case 'voting':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'escalated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'under_review':
        return 'Under Review';
      case 'mediation':
        return 'In Mediation';
      case 'voting':
        return 'Voting';
      case 'resolved':
        return 'Resolved';
      case 'closed':
        return 'Closed';
      case 'escalated':
        return 'Escalated';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`}>
      {getStatusLabel()}
    </span>
  );
};

interface DisputeCardProps {
  dispute: Dispute;
  isUserClaimant?: boolean;
  isUserDefendant?: boolean;
  isUserModerator?: boolean;
  displayMode?: 'compact' | 'full';
}

const DisputeCard: React.FC<DisputeCardProps> = ({
  dispute,
  isUserClaimant = false,
  isUserDefendant = false,
  isUserModerator = false,
  displayMode = 'compact'
}) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <Link href={`/disputes/${dispute.$id}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
              Dispute for Contract #{dispute.contractId.substring(0, 8)}
            </h3>
          </Link>
          <DisputeStatusBadge status={dispute.status} />
        </div>
        
        <div className="mt-2 text-sm text-gray-500">
          <span>Filed: {format(new Date(dispute.$createdAt), 'PPP')}</span>
          {dispute.resolvedAt && (
            <span className="ml-4">Resolved: {format(new Date(dispute.resolvedAt), 'PPP')}</span>
          )}
        </div>
        
        {displayMode === 'full' ? (
          <>
            <div className="mt-4">
              <h4 className="text-md font-medium text-gray-900">Reason</h4>
              <p className="mt-1 text-gray-600">{dispute.reason}</p>
            </div>
            
            {dispute.preferredOutcome && (
              <div className="mt-4">
                <h4 className="text-md font-medium text-gray-900">Preferred Outcome</h4>
                <p className="mt-1 text-gray-600">{dispute.preferredOutcome}</p>
              </div>
            )}
            
            {dispute.resolutionDetails && dispute.status === 'resolved' && (
              <div className="mt-4">
                <h4 className="text-md font-medium text-gray-900">Resolution</h4>
                <p className="mt-1 text-gray-600">{dispute.resolutionDetails}</p>
              </div>
            )}
            
            {dispute.evidenceFileIds && dispute.evidenceFileIds.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-medium text-gray-900">Evidence</h4>
                <div className="mt-1 flex flex-wrap gap-2">
                  {dispute.evidenceFileIds.map((fileId, index) => (
                    <span 
                      key={fileId}
                      className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      Attachment {index + 1}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="mt-3">
            <p className="text-gray-600 line-clamp-2">{dispute.reason}</p>
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <div className="flex space-x-4">
            {isUserClaimant && (
              <span className="text-xs text-gray-500">You filed this dispute</span>
            )}
            {isUserDefendant && (
              <span className="text-xs text-gray-500">This dispute was filed against you</span>
            )}
            {isUserModerator && (
              <span className="text-xs text-gray-500">You are moderating this dispute</span>
            )}
          </div>
          {displayMode === 'compact' && (
            <Link 
              href={`/disputes/${dispute.$id}`}
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

export default DisputeCard;