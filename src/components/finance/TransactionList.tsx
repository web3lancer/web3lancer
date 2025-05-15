import React from 'react';
import { Transaction } from '@/types';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  emptyMessage?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isLoading = false,
  emptyMessage = 'No transactions yet'
}) => {
  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format amount with currency symbol
  const formatAmount = (amount: number, currency: string) => {
    switch (currency) {
      case 'USD':
        return `$${amount.toFixed(2)}`;
      case 'EUR':
        return `€${amount.toFixed(2)}`;
      case 'GBP':
        return `£${amount.toFixed(2)}`;
      case 'BTC':
        return `₿${amount.toFixed(8)}`;
      case 'ETH':
        return `Ξ${amount.toFixed(6)}`;
      default:
        return `${amount} ${currency}`;
    }
  };

  // Get type display text
  const getTypeText = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'payment':
        return 'Payment';
      case 'refund':
        return 'Refund';
      case 'fee':
        return 'Platform Fee';
      case 'escrow':
        return 'Escrow Funding';
      case 'release':
        return 'Escrow Release';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Get status display text and color
  const getStatusInfo = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
      case 'completed':
        return { text: 'Completed', color: 'bg-green-100 text-green-800' };
      case 'failed':
        return { text: 'Failed', color: 'bg-red-100 text-red-800' };
      case 'cancelled':
        return { text: 'Cancelled', color: 'bg-gray-100 text-gray-800' };
      default:
        return { text: status.charAt(0).toUpperCase() + status.slice(1), color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Determine if transaction is credit (positive) or debit (negative)
  const isCredit = (type: Transaction['type']) => {
    return ['deposit', 'refund', 'release'].includes(type);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded mb-3"></div>
        <div className="h-12 bg-gray-200 rounded mb-3"></div>
        <div className="h-12 bg-gray-200 rounded mb-3"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Type</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {transactions.map((transaction) => {
            const statusInfo = getStatusInfo(transaction.status);
            
            return (
              <tr key={transaction.$id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {getTypeText(transaction.type)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {transaction.description || '-'}
                </td>
                <td className={`whitespace-nowrap px-3 py-4 text-sm font-medium ${isCredit(transaction.type) ? 'text-green-600' : 'text-red-600'}`}>
                  {isCredit(transaction.type) ? '+' : '-'}
                  {formatAmount(transaction.amount, transaction.currency)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatDate(transaction.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;