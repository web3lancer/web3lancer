import React from 'react';
import { useWallet } from '@/hooks/useWallet';

interface WalletCardProps {
  userId: string;
}

export function WalletCard({ userId }: WalletCardProps) {
  const { wallet, balances, loading, error, sendCrypto, addFunds } = useWallet(userId);

  if (loading) {
    return <div className="p-4 border rounded shadow-sm">Loading wallet...</div>;
  }

  if (error) {
    return <div className="p-4 border rounded shadow-sm text-red-500">Error: {error}</div>;
  }

  if (!wallet) {
    return <div className="p-4 border rounded shadow-sm">No wallet found</div>;
  }

  return (
    <div className="border rounded-lg shadow-sm p-4">
      <h2 className="text-xl font-semibold mb-4">Crypto Wallet</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500">Wallet Address</p>
        <p className="font-mono text-sm bg-gray-100 p-2 rounded overflow-x-auto">
          {wallet.walletAddress}
        </p>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Balances</h3>
        <div className="space-y-2">
          {balances.map((balance) => (
            <div key={balance.$id} className="flex justify-between p-2 bg-gray-50 rounded">
              <span>{balance.currency}</span>
              <span className="font-medium">{balance.amount}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <button 
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          onClick={() => {
            // This would typically open a modal or navigate to a page
            console.log('Add funds');
          }}
        >
          Add Funds
        </button>
        <button 
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          onClick={() => {
            // This would typically open a modal or navigate to a page
            console.log('Send crypto');
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
