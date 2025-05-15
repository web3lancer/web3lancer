import React from 'react';
import { Wallet, Transaction } from '@/types';

interface WalletCardProps {
  wallet: Wallet;
  recentTransactions?: Transaction[];
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
  onDeposit?: (wallet: Wallet) => void;
  onWithdraw?: (wallet: Wallet) => void;
}

const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  recentTransactions = [],
  onEdit,
  onDelete,
  onSetDefault,
  onDeposit,
  onWithdraw
}) => {
  // Format wallet balance with currency symbol
  const formatBalance = (amount: number, currency: string) => {
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

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border ${wallet.isDefault ? 'border-blue-500' : 'border-gray-200'}`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">{wallet.type === 'crypto' ? 'Crypto Wallet' : 'Fiat Wallet'}</h3>
            <p className="text-gray-500 text-sm">{wallet.currency}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-bold text-2xl">
              {formatBalance(wallet.balance, wallet.currency)}
            </span>
            {wallet.isDefault && (
              <span className="text-xs text-blue-500 font-medium mt-1 bg-blue-50 px-2 py-0.5 rounded-full">Default</span>
            )}
          </div>
        </div>

        {wallet.type === 'crypto' && wallet.address && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 truncate">
              Address: {wallet.address}
            </p>
            {wallet.network && (
              <p className="text-sm text-gray-500">
                Network: {wallet.network}
              </p>
            )}
          </div>
        )}

        <div className="flex space-x-2">
          {onDeposit && (
            <button
              onClick={() => onDeposit(wallet)}
              className="px-3 py-1 text-xs font-medium rounded bg-green-100 text-green-800 hover:bg-green-200"
            >
              Deposit
            </button>
          )}
          {onWithdraw && (
            <button
              onClick={() => onWithdraw(wallet)}
              className="px-3 py-1 text-xs font-medium rounded bg-red-100 text-red-800 hover:bg-red-200"
            >
              Withdraw
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Edit
            </button>
          )}
          {onDelete && !wallet.isDefault && (
            <button
              onClick={onDelete}
              className="px-3 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Delete
            </button>
          )}
          {onSetDefault && !wallet.isDefault && (
            <button
              onClick={onSetDefault}
              className="px-3 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
            >
              Set as Default
            </button>
          )}
        </div>
      </div>

      {recentTransactions.length > 0 && (
        <div className="border-t border-gray-200 px-6 py-4">
          <h4 className="text-sm font-semibold mb-2">Recent Transactions</h4>
          <div className="space-y-2">
            {recentTransactions.slice(0, 3).map((tx) => (
              <div key={tx.$id} className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${tx.type === 'deposit' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>{tx.description || tx.type}</span>
                </div>
                <div className="font-medium">
                  {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}
                  {formatBalance(tx.amount, tx.currency)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletCard;