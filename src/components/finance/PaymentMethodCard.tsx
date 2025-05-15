import React from 'react';
import { PaymentMethod } from '@/types';

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethod,
  onEdit,
  onDelete,
  onSetDefault
}) => {
  // Get icon based on payment method type
  const getIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'card':
        return (
          <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'bank_account':
        return (
          <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        );
      case 'crypto_wallet':
        return (
          <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'paypal':
        return (
          <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
    }
  };

  // Get description based on payment method type and details
  const getDescription = (paymentMethod: PaymentMethod) => {
    const { type, details } = paymentMethod;
    
    switch (type) {
      case 'card':
        return details.last4
          ? `${details.brand} ending in ${details.last4}`
          : 'Credit/Debit Card';
      case 'bank_account':
        return details.bankName 
          ? `${details.bankName} - ${details.accountType || 'Account'}`
          : 'Bank Account';
      case 'crypto_wallet':
        return details.walletAddress
          ? `Wallet: ${details.walletAddress.substring(0, 6)}...${details.walletAddress.substring(details.walletAddress.length - 4)}`
          : 'Crypto Wallet';
      case 'paypal':
        return details.email
          ? `PayPal: ${details.email}`
          : 'PayPal Account';
      default:
        return 'Payment Method';
    }
  };

  // Format type for display
  const formatType = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'card':
        return 'Credit/Debit Card';
      case 'bank_account':
        return 'Bank Account';
      case 'crypto_wallet':
        return 'Crypto Wallet';
      case 'paypal':
        return 'PayPal';
      default:
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border ${paymentMethod.isDefault ? 'border-blue-500' : 'border-gray-200'}`}>
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {getIcon(paymentMethod.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium text-gray-900 truncate">
                {paymentMethod.name}
              </p>
              {paymentMethod.isDefault && (
                <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                  Default
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {formatType(paymentMethod.type)}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {getDescription(paymentMethod)}
            </p>
            {paymentMethod.type === 'card' && paymentMethod.details.expiryMonth && paymentMethod.details.expiryYear && (
              <p className="mt-1 text-sm text-gray-500">
                Expires: {paymentMethod.details.expiryMonth}/{paymentMethod.details.expiryYear}
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex space-x-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Edit
            </button>
          )}
          {onDelete && !paymentMethod.isDefault && (
            <button
              onClick={onDelete}
              className="px-3 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Delete
            </button>
          )}
          {onSetDefault && !paymentMethod.isDefault && (
            <button
              onClick={onSetDefault}
              className="px-3 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
            >
              Set as Default
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodCard;