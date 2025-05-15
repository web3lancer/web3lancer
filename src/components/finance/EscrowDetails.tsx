import React from 'react';
import { EscrowTransaction, Contract, Milestone } from '@/types';
import { formatCurrency, getTransactionStatusClasses } from '@/utils/financeUtils';

interface EscrowDetailsProps {
  escrow: EscrowTransaction;
  contract?: Contract;
  milestone?: Milestone;
  onRelease?: () => void;
  onDispute?: () => void;
  onRefund?: () => void;
  isClient: boolean;
  isFreelancer: boolean;
}

const EscrowDetails: React.FC<EscrowDetailsProps> = ({
  escrow,
  contract,
  milestone,
  onRelease,
  onDispute,
  onRefund,
  isClient,
  isFreelancer
}) => {
  const statusInfo = getTransactionStatusClasses(escrow.status);
  
  // Format date to a readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Escrow Details</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {milestone?.title 
              ? `For milestone: ${milestone.title}` 
              : 'Milestone payment escrow'}
          </p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusInfo.bgColor} ${statusInfo.textColor}`}>
          {statusInfo.text}
        </span>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Amount</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-semibold">
              {formatCurrency(escrow.amount, escrow.currency)}
            </dd>
          </div>
          
          {escrow.platformFee && (
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Platform Fee</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatCurrency(escrow.platformFee, escrow.currency)}
              </dd>
            </div>
          )}
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Created Date</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatDate(escrow.createdAt)}
            </dd>
          </div>
          
          {escrow.status === 'released' && escrow.completedAt && (
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Released Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(escrow.completedAt)}
              </dd>
            </div>
          )}
          
          {escrow.txHash && (
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Transaction Hash</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 break-all">
                <a 
                  href={`https://etherscan.io/tx/${escrow.txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {escrow.txHash}
                </a>
              </dd>
            </div>
          )}
        </dl>
      </div>
      
      {/* Action buttons based on status and user role */}
      {escrow.status === 'funded' && (
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-3">
          {isClient && onRelease && milestone?.status === 'approved' && (
            <button
              onClick={onRelease}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Release Funds
            </button>
          )}
          
          {(isClient || isFreelancer) && onDispute && (
            <button
              onClick={onDispute}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Raise Dispute
            </button>
          )}
          
          {isClient && onRefund && (
            <button
              onClick={onRefund}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Request Refund
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EscrowDetails;