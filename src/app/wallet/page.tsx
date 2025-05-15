import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import WalletCard from '@/components/finance/WalletCard';
import WalletForm from '@/components/finance/WalletForm';
import DepositForm from '@/components/finance/DepositForm';
import WithdrawalForm from '@/components/finance/WithdrawalForm';
import TransactionList from '@/components/finance/TransactionList';
import Modal from '@/components/Modal';
import { Wallet, Transaction, PaymentMethod } from '@/types';

export default function WalletsPage() {
  const { user } = useAuthContext();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [currentWallet, setCurrentWallet] = useState<Partial<Wallet> | null>(null);
  const [activeTab, setActiveTab] = useState<'wallets' | 'transactions'>('wallets');

  useEffect(() => {
    if (user) {
      fetchWallets();
      fetchTransactions();
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchWallets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/wallet');
      if (!response.ok) throw new Error('Failed to fetch wallets');
      const data = await response.json();
      setWallets(data);
    } catch (error) {
      console.error('Error fetching wallets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transaction');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payment-method');
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const data = await response.json();
      setPaymentMethods(data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };
  
  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payment-method');
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const data = await response.json();
      setPaymentMethods(data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const handleOpenModal = (wallet?: Wallet) => {
    setCurrentWallet(wallet || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentWallet(null);
  };

  const handleSubmitWallet = async (data: Partial<Wallet>) => {
    setIsSubmitting(true);
    try {
      let response;
      
      // If editing existing wallet
      if (currentWallet?.$id) {
        response = await fetch(`/api/wallet?walletId=${currentWallet.$id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } else {
        // If creating new wallet
        response = await fetch('/api/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }
      
      if (!response.ok) throw new Error('Failed to save wallet');
      
      // Refresh wallets list
      fetchWallets();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving wallet:', error);
      alert('Failed to save wallet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWallet = async (walletId: string) => {
    if (!confirm('Are you sure you want to delete this wallet?')) return;
    
    try {
      const response = await fetch(`/api/wallet?walletId=${walletId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete wallet');
      
      // Refresh wallets list
      fetchWallets();
    } catch (error) {
      console.error('Error deleting wallet:', error);
      alert('Failed to delete wallet. Please try again.');
    }
  };

  const handleSetDefault = async (walletId: string) => {
    try {
      const response = await fetch(`/api/wallet?walletId=${walletId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true })
      });
      
      if (!response.ok) throw new Error('Failed to set default wallet');
      
      // Refresh wallets list
      fetchWallets();
    } catch (error) {
      console.error('Error setting default wallet:', error);
      alert('Failed to set default wallet. Please try again.');
    }
  };

  const handleOpenDepositModal = (wallet: Wallet) => {
    setCurrentWallet(wallet);
    setIsDepositModalOpen(true);
  };

  const handleOpenWithdrawModal = (wallet: Wallet) => {
    setCurrentWallet(wallet);
    setIsWithdrawModalOpen(true);
  };

  const handleCloseDepositModal = () => {
    setIsDepositModalOpen(false);
    setCurrentWallet(null);
  };

  const handleCloseWithdrawModal = () => {
    setIsWithdrawModalOpen(false);
    setCurrentWallet(null);
  };

  const handleDeposit = async (data: {
    amount: number;
    walletId: string;
    paymentMethodId?: string;
    currency: string;
    description?: string;
  }) => {
    setIsSubmitting(true);
    try {
      // In a real app, we would get userId from auth context
      // For demo, we'll assume the user ID is available
      const userId = user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch('/api/transaction/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process deposit');
      }
      
      // Refresh data
      fetchWallets();
      fetchTransactions();
      handleCloseDepositModal();
      
      // Show success message
      alert('Deposit successful!');
    } catch (error) {
      console.error('Error processing deposit:', error);
      alert(error instanceof Error ? error.message : 'Failed to process deposit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async (data: {
    amount: number;
    walletId: string;
    paymentMethodId?: string;
    currency: string;
    description?: string;
  }) => {
    setIsSubmitting(true);
    try {
      // In a real app, we would get userId from auth context
      // For demo, we'll assume the user ID is available
      const userId = user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch('/api/transaction/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process withdrawal');
      }
      
      // Refresh data
      fetchWallets();
      fetchTransactions();
      handleCloseWithdrawModal();
      
      // Show success message
      alert('Withdrawal successful!');
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert(error instanceof Error ? error.message : 'Failed to process withdrawal');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get recent transactions for a specific wallet
  const getWalletTransactions = (walletId: string) => {
    return transactions
      .filter(tx => tx.walletId === walletId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Please log in to view your wallets.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financial Management</h1>
        {activeTab === 'wallets' && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Wallet
          </button>
        )}
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('wallets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'wallets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Wallets
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Transaction History
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'wallets' && (
        <div>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2].map((item) => (
                <div key={item} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : wallets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wallets.map((wallet) => (
                <WalletCard
                  key={wallet.$id}
                  wallet={wallet}
                  recentTransactions={getWalletTransactions(wallet.$id)}
                  onEdit={() => handleOpenModal(wallet)}
                  onDelete={() => handleDeleteWallet(wallet.$id)}
                  onSetDefault={() => handleSetDefault(wallet.$id)}
                  onDeposit={(wallet) => handleOpenDepositModal(wallet)}
                  onWithdraw={(wallet) => handleOpenWithdrawModal(wallet)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">No wallets found</h3>
              <p className="mt-2 text-sm text-gray-500">
                You haven't added any wallets yet. Add a wallet to get started.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => handleOpenModal()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Your First Wallet
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
          <TransactionList
            transactions={transactions}
            isLoading={isLoading}
            emptyMessage="No transactions found. Transactions will appear here once you start using your wallets."
          />
        </div>
      )}

      {/* Wallet Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={currentWallet?.$id ? 'Edit Wallet' : 'Add New Wallet'}
      >
        <WalletForm
          wallet={currentWallet || undefined}
          onSubmit={handleSubmitWallet}
          onCancel={handleCloseModal}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Deposit Modal */}
      <Modal
        isOpen={isDepositModalOpen}
        onClose={handleCloseDepositModal}
        title="Deposit Funds"
      >
        <DepositForm
          wallets={currentWallet ? [currentWallet as Wallet] : wallets}
          paymentMethods={paymentMethods}
          onSubmit={handleDeposit}
          onCancel={handleCloseDepositModal}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Withdrawal Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={handleCloseWithdrawModal}
        title="Withdraw Funds"
      >
        <WithdrawalForm
          wallets={currentWallet ? [currentWallet as Wallet] : wallets}
          paymentMethods={paymentMethods}
          onSubmit={handleWithdraw}
          onCancel={handleCloseWithdrawModal}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}
