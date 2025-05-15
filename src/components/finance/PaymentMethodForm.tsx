import React, { useState, useEffect } from 'react';
import { PaymentMethod } from '@/types';

interface PaymentMethodFormProps {
  paymentMethod?: Partial<PaymentMethod>;
  onSubmit: (data: Partial<PaymentMethod>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  paymentMethod,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const initialDetails = {
    last4: '',
    brand: '',
    expiryMonth: '',
    expiryYear: '',
    bankName: '',
    accountType: '',
    walletAddress: '',
    email: '',
    ...(paymentMethod?.details || {})
  };

  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    type: 'card',
    name: '',
    isDefault: false,
    isActive: true,
    details: initialDetails,
    ...paymentMethod
  });

  useEffect(() => {
    // Update form data when paymentMethod prop changes
    if (paymentMethod) {
      setFormData({
        ...formData,
        ...paymentMethod,
        details: { ...initialDetails, ...(paymentMethod.details || {}) }
      });
    }
  }, [paymentMethod]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      details: {
        ...formData.details,
        [name]: value
      }
    });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      type: e.target.value as PaymentMethod['type'],
      // Reset name to something appropriate
      name: getDefaultName(e.target.value as PaymentMethod['type'])
    });
  };

  const getDefaultName = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'card':
        return 'My Card';
      case 'bank_account':
        return 'My Bank Account';
      case 'crypto_wallet':
        return 'My Crypto Wallet';
      case 'paypal':
        return 'My PayPal';
      default:
        return 'New Payment Method';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Remove unnecessary fields for API
    const { $id, createdAt, updatedAt, ...submitData } = formData;
    
    onSubmit(submitData);
  };

  const renderFormFields = () => {
    switch (formData.type) {
      case 'card':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Card Brand</label>
                <select
                  id="brand"
                  name="brand"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={formData.details?.brand || ''}
                  onChange={handleDetailsChange}
                >
                  <option value="">Select Brand</option>
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="amex">American Express</option>
                  <option value="discover">Discover</option>
                </select>
              </div>
              <div>
                <label htmlFor="last4" className="block text-sm font-medium text-gray-700">Last 4 Digits</label>
                <input
                  type="text"
                  name="last4"
                  id="last4"
                  maxLength={4}
                  placeholder="1234"
                  value={formData.details?.last4 || ''}
                  onChange={handleDetailsChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700">Expiry Month</label>
                <select
                  id="expiryMonth"
                  name="expiryMonth"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={formData.details?.expiryMonth || ''}
                  onChange={handleDetailsChange}
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = (i + 1).toString().padStart(2, '0');
                    return <option key={month} value={month}>{month}</option>;
                  })}
                </select>
              </div>
              <div>
                <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700">Expiry Year</label>
                <select
                  id="expiryYear"
                  name="expiryYear"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={formData.details?.expiryYear || ''}
                  onChange={handleDetailsChange}
                >
                  <option value="">YYYY</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = (new Date().getFullYear() + i).toString();
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
            </div>
          </>
        );
      case 'bank_account':
        return (
          <>
            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Bank Name</label>
              <input
                type="text"
                name="bankName"
                id="bankName"
                placeholder="Bank of Example"
                value={formData.details?.bankName || ''}
                onChange={handleDetailsChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">Account Type</label>
              <select
                id="accountType"
                name="accountType"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={formData.details?.accountType || ''}
                onChange={handleDetailsChange}
              >
                <option value="">Select Account Type</option>
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="business">Business</option>
              </select>
            </div>
          </>
        );
      case 'crypto_wallet':
        return (
          <div>
            <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700">Wallet Address</label>
            <input
              type="text"
              name="walletAddress"
              id="walletAddress"
              placeholder="0x..."
              value={formData.details?.walletAddress || ''}
              onChange={handleDetailsChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        );
      case 'paypal':
        return (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">PayPal Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="you@example.com"
              value={formData.details?.email || ''}
              onChange={handleDetailsChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Payment Method Type</label>
          <select
            id="type"
            name="type"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={formData.type}
            onChange={handleTypeChange}
          >
            <option value="card">Credit/Debit Card</option>
            <option value="bank_account">Bank Account</option>
            <option value="crypto_wallet">Crypto Wallet</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="My Payment Method"
          />
        </div>
      </div>

      {renderFormFields()}

      <div className="flex items-center">
        <input
          id="isDefault"
          name="isDefault"
          type="checkbox"
          checked={formData.isDefault}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
          Set as default payment method
        </label>
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
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isSubmitting ? 'Saving...' : paymentMethod?.$id ? 'Update Payment Method' : 'Add Payment Method'}
        </button>
      </div>
    </form>
  );
};

export default PaymentMethodForm;