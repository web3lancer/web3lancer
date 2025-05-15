import React, { useState, useEffect } from 'react';
import { Wallet, PaymentMethod } from '@/types';
import { formatCurrency } from '@/utils/financeUtils';

interface DepositFormProps {
  wallets: Wallet[];
  paymentMethods: PaymentMethod[];
  onSubmit: (data: {
    amount: number;
    walletId: string;
    paymentMethodId?: string;
    currency: string;
    description?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const DepositForm: React.FC<DepositFormProps> = ({
  wallets,
  paymentMethods,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [errors, setErrors] = useState<{
    wallet?: string;
    paymentMethod?: string;
    amount?: string;
  }>({});

  // Auto-select the default wallet if available
  useEffect(() => {
    if (wallets.length > 0) {
      const defaultWallet = wallets.find(wallet => wallet.isDefault);
      if (defaultWallet) {
        setSelectedWallet(defaultWallet.$id);
      } else {
        setSelectedWallet(wallets[0].$id);
      }
    }
  }, [wallets]);

  // Auto-select the default payment method if available
  useEffect(() => {
    if (paymentMethods.length > 0) {
      const defaultPaymentMethod = paymentMethods.find(pm => pm.isDefault);
      if (defaultPaymentMethod) {
        setSelectedPaymentMethod(defaultPaymentMethod.$id);
      } else if (paymentMethods.length > 0) {
        setSelectedPaymentMethod(paymentMethods[0].$id);
      }
    }
  }, [paymentMethods]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form
    const newErrors: {
      wallet?: string;
      paymentMethod?: string;
      amount?: string;
    } = {};
    
    if (!selectedWallet) {
      newErrors.wallet = 'Please select a wallet';
    }
    
    if (!selectedPaymentMethod && paymentMethods.length > 0) {
      newErrors.paymentMethod = 'Please select a payment method';
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }
    
    setErrors(newErrors);
    
    // If there are no errors, submit the form
    if (Object.keys(newErrors).length === 0) {
      const wallet = wallets.find(w => w.$id === selectedWallet);
      
      onSubmit({
        amount: Number(amount),
        walletId: selectedWallet,
        paymentMethodId: selectedPaymentMethod || undefined,
        currency: wallet?.currency || 'USD',
        description: description || 'Wallet deposit'
      });
    }
  };

  // Get selected wallet currency
  const getSelectedWalletCurrency = () => {
    const wallet = wallets.find(w => w.$id === selectedWallet);
    return wallet?.currency || 'USD';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="wallet" className="block text-sm font-medium text-gray-700">
          Select Wallet
        </label>
        <select
          id="wallet"
          name="wallet"
          className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
            errors.wallet ? 'border-red-300' : ''
          }`}
          value={selectedWallet}
          onChange={(e) => setSelectedWallet(e.target.value)}
          disabled={isSubmitting || wallets.length === 0}
        >
          {wallets.length === 0 ? (
            <option value="">No wallets available</option>
          ) : (
            <>
              <option value="">Select a wallet</option>
              {wallets.map((wallet) => (
                <option key={wallet.$id} value={wallet.$id}>
                  {wallet.type === 'crypto' ? 'Crypto' : 'Fiat'} Wallet ({wallet.currency})
                  {wallet.isDefault ? ' - Default' : ''}
                </option>
              ))}
            </>
          )}
        </select>
        {errors.wallet && (
          <p className="mt-1 text-sm text-red-600">{errors.wallet}</p>
        )}
      </div>

      {paymentMethods.length > 0 && (
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
            Payment Method
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
              errors.paymentMethod ? 'border-red-300' : ''
            }`}
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">Select a payment method</option>
            {paymentMethods.map((pm) => (
              <option key={pm.$id} value={pm.$id}>
                {pm.name} ({pm.type.replace('_', ' ')})
                {pm.isDefault ? ' - Default' : ''}
              </option>
            ))}
          </select>
          {errors.paymentMethod && (
            <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount ({getSelectedWalletCurrency()})
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">
              {getSelectedWalletCurrency() === 'USD' ? '$' : 
               getSelectedWalletCurrency() === 'EUR' ? '€' : 
               getSelectedWalletCurrency() === 'GBP' ? '£' : ''}
            </span>
          </div>
          <input
            type="number"
            name="amount"
            id="amount"
            className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md ${
              errors.amount ? 'border-red-300' : ''
            }`}
            placeholder="0.00"
            aria-describedby="price-currency"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
            disabled={isSubmitting}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm" id="price-currency">
              {getSelectedWalletCurrency()}
            </span>
          </div>
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description (Optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
          placeholder="Add a note about this deposit"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
        <button
          type="submit"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Deposit Funds'}
        </button>
        <button
          type="button"
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default DepositForm;