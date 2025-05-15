import React from 'react';
import { Transaction } from '@/types';
import { 
  formatCurrency, 
  formatTransactionDate, 
  getTransactionTypeText, 
  getTransactionStatusClasses,
  isTransactionCredit
} from '@/utils/financeUtils';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  emptyMessage?: string;
  showWalletInfo?: boolean;
  walletId?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isLoading = false,
  emptyMessage = 'No transactions found.',
  showWalletInfo = false,
  walletId
}) => {
  // Filter by wallet if walletId is provided
  const filteredTransactions = walletId
    ? transactions.filter(tx => tx.walletId === walletId)
    : transactions;
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="h-14 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  if (sortedTransactions.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            {showWalletInfo && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wallet
              </th>
            )}
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedTransactions.map((transaction) => {
            const statusClasses = getTransactionStatusClasses(transaction.status);
            const isCredit = isTransactionCredit(transaction.type);
            
            return (
              <tr key={transaction.$id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatTransactionDate(transaction.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {getTransactionTypeText(transaction.type)}
                  </span>
                </td>
                {showWalletInfo && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.walletId.substring(0, 8)}...
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.description || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses.bgColor} ${statusClasses.textColor}`}>
                    {statusClasses.text}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                  {isCredit ? '+' : '-'} {formatCurrency(transaction.amount, transaction.currency)}
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