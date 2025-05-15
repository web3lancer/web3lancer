import React, { useState, useEffect } from 'react';
import { EscrowTransaction, Wallet } from '@/types';
import { formatCurrency, formatTransactionDate, getTransactionStatusClasses } from '@/utils/financeUtils';

interface EscrowDetailsProps {
  contractId: string;
  escrowTransactions?: EscrowTransaction[];
  wallets?: Wallet[];
  onReleaseFunds?: (escrowId: string) => Promise<void>;
  isLoading?: boolean;
  isClient?: boolean; // Whether the current user is the client (payer) in this contract
}

const EscrowDetails: React.FC<EscrowDetailsProps> = ({
  contractId,
  escrowTransactions = [],
  wallets = [],
  onReleaseFunds,
  isLoading = false,
  isClient = false
}) => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // Filter escrow transactions for this contract
  const contractEscrows = escrowTransactions.filter(tx => tx.contractId === contractId);
  
  // Group by milestone if available
  const escrowsByMilestone: Record<string, EscrowTransaction[]> = {};
  const escrowsWithoutMilestone: EscrowTransaction[] = [];
  
  contractEscrows.forEach(escrow => {
    if (escrow.milestoneId) {
      if (!escrowsByMilestone[escrow.milestoneId]) {
        escrowsByMilestone[escrow.milestoneId] = [];
      }
      escrowsByMilestone[escrow.milestoneId].push(escrow);
    } else {
      escrowsWithoutMilestone.push(escrow);
    }
  });
  
  const handleRelease = async (escrowId: string) => {
    if (!onReleaseFunds) return;
    
    setIsProcessing(escrowId);
    try {
      await onReleaseFunds(escrowId);
    } catch (error) {
      console.error('Error releasing funds:', error);
      alert('Failed to release funds. Please try again.');
    } finally {
      setIsProcessing(null);
    }
  };
  
  const getWalletName = (walletId?: string) => {
    if (!walletId) return 'Unknown Wallet';
    const wallet = wallets.find(w => w.$id === walletId);
    return wallet ? `${wallet.name} (${wallet.currency})` : 'Unknown Wallet';
  };
  
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  if (contractEscrows.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Escrow Details</h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
            No escrow transactions found for this contract.
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Escrow Details</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Funds held in escrow for this contract
        </p>
      </div>
      
      <div className="border-t border-gray-200">
        {/* Escrows with milestones */}
        {Object.entries(escrowsByMilestone).map(([milestoneId, escrows]) => (
          <div key={milestoneId} className="border-b border-gray-200 last:border-b-0">
            <div className="px-4 py-3 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900">
                Milestone ID: {milestoneId}
              </h4>
            </div>
            
            <ul>
              {escrows.map(escrow => {
                const statusClasses = getTransactionStatusClasses(escrow.status);
                const isReleased = escrow.toWalletId != null;
                
                return (
                  <li key={escrow.$id} className="px-4 py-4 sm:px-6 border-t border-gray-200 first:border-t-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(escrow.amount, escrow.currency)}
                        </p>
                        <p className="text-sm text-gray-500">
                          From: {getWalletName(escrow.fromWalletId)}
                        </p>
                        {isReleased && (
                          <p className="text-sm text-gray-500">
                            To: {getWalletName(escrow.toWalletId)}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTransactionDate(escrow.createdAt)}
                        </p>
                      </div>
                      
                      <div className="flex items-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses.bgColor} ${statusClasses.textColor}`}>
                          {isReleased ? 'Released' : statusClasses.text}
                        </span>
                        
                        {!isReleased && escrow.status === 'completed' && isClient && onReleaseFunds && (
                          <button
                            onClick={() => handleRelease(escrow.$id)}
                            disabled={isProcessing === escrow.$id}
                            className="ml-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {isProcessing === escrow.$id ? 'Processing...' : 'Release Funds'}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {escrow.description && (
                      <p className="mt-2 text-sm text-gray-500">
                        {escrow.description}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        
        {/* Escrows without milestones */}
        {escrowsWithoutMilestone.length > 0 && (
          <div className="divide-y divide-gray-200">
            {escrowsWithoutMilestone.map(escrow => {
              const statusClasses = getTransactionStatusClasses(escrow.status);
              const isReleased = escrow.toWalletId != null;
              
              return (
                <div key={escrow.$id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(escrow.amount, escrow.currency)}
                      </p>
                      <p className="text-sm text-gray-500">
                        From: {getWalletName(escrow.fromWalletId)}
                      </p>
                      {isReleased && (
                        <p className="text-sm text-gray-500">
                          To: {getWalletName(escrow.toWalletId)}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTransactionDate(escrow.createdAt)}
                      </p>
                    </div>
                    
                    <div className="flex items-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses.bgColor} ${statusClasses.textColor}`}>
                        {isReleased ? 'Released' : statusClasses.text}
                      </span>
                      
                      {!isReleased && escrow.status === 'completed' && isClient && onReleaseFunds && (
                        <button
                          onClick={() => handleRelease(escrow.$id)}
                          disabled={isProcessing === escrow.$id}
                          className="ml-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {isProcessing === escrow.$id ? 'Processing...' : 'Release Funds'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {escrow.description && (
                    <p className="mt-2 text-sm text-gray-500">
                      {escrow.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EscrowDetails;