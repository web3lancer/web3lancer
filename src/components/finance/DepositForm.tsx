import React, { useState, useEffect } from 'react';
import { Wallet, PaymentMethod } from '@/types';

interface DepositFormProps {
  wallet: Wallet;
  paymentMethods?: PaymentMethod[];
  onSubmit: (data: { amount: number, walletId: string, paymentMethodId?: string }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const DepositForm: React.FC<DepositFormProps> = ({
  wallet,
  paymentMethods = [],
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethodId, setPaymentMethodId] = useState<string>('');

  // Format currency for display
  const formatCurrency = (currency: string) => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'BTC':
        return '₿';
      case 'ETH':
        return 'Ξ';
      default:
        return '';
    }
  };

  // Filter payment methods based on wallet type
  const filteredPaymentMethods = paymentMethods.filter(method => {
    if (wallet.type === 'fiat') {
      return method.type !== 'crypto_wallet';
    } else {
      return method.type === 'crypto_wallet';
    }
  });

  // Set default payment method if available
  useEffect(() => {
    const defaultMethod = filteredPaymentMethods.find(method => method.isDefault);
    if (defaultMethod) {
      setPaymentMethodId(defaultMethod.$id);
    } else if (filteredPaymentMethods.length > 0) {
      setPaymentMethodId(filteredPaymentMethods[0].$id);
    }
  }, [paymentMethods]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    onSubmit({
      amount,
      walletId: wallet.$id,
      paymentMethodId: paymentMethodId || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">
              {formatCurrency(wallet.currency)}
            </span>
          </div>
          <input
            type="number"
            name="amount"
            id="amount"
            min="0"
            step={wallet.type === 'crypto' ? '0.00000001' : '0.01'}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 pr-12 sm:text-sm border-gray-300 rounded-md"
            placeholder="0.00"
            required
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{wallet.currency}</span>
          </div>
        </div>
      </div>

      {filteredPaymentMethods.length > 0 && (
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
            Payment Method
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={paymentMethodId}
            onChange={(e) => setPaymentMethodId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            required
          >
            <option value="">Select Payment Method</option>
            {filteredPaymentMethods.map((method) => (
              <option key={method.$id} value={method.$id}>
                {method.name} {method.isDefault ? '(Default)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-gray-700">Summary</h3>
        <div className="mt-2 bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Deposit Amount</span>
            <span className="text-sm font-medium">{formatCurrency(wallet.currency)}{amount.toFixed(wallet.type === 'crypto' ? 8 : 2)} {wallet.currency}</span>
          </div>
          <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
            <span className="text-sm font-medium text-gray-700">Total</span>
            <span className="text-sm font-bold">{formatCurrency(wallet.currency)}{amount.toFixed(wallet.type === 'crypto' ? 8 : 2)} {wallet.currency}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || amount <= 0}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isSubmitting ? 'Processing...' : 'Deposit Funds'}
        </button>
      </div>
    </form>
  );
};

export default DepositForm;