import React, { useState, useEffect } from 'react';
import { Wallet } from '@/types';

interface WalletFormProps {
  wallet?: Partial<Wallet>;
  onSubmit: (data: Partial<Wallet>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const WalletForm: React.FC<WalletFormProps> = ({
  wallet,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<Partial<Wallet>>({
    type: 'fiat',
    currency: 'USD',
    isDefault: false,
    isActive: true,
    ...wallet
  });

  useEffect(() => {
    // Update form data when wallet prop changes
    if (wallet) {
      setFormData({ ...formData, ...wallet });
    }
  }, [wallet]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Remove unnecessary fields for API
    const { $id, createdAt, updatedAt, ...submitData } = formData;
    
    onSubmit(submitData);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'fiat' | 'crypto';
    setFormData({
      ...formData,
      type: newType,
      // Reset fields when changing type
      address: newType === 'crypto' ? formData.address || '' : undefined,
      network: newType === 'crypto' ? formData.network || '' : undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Wallet Type</label>
          <select
            id="type"
            name="type"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={formData.type}
            onChange={handleTypeChange}
          >
            <option value="fiat">Fiat Wallet</option>
            <option value="crypto">Crypto Wallet</option>
          </select>
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
          {formData.type === 'fiat' ? (
            <select
              id="currency"
              name="currency"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="GBP">British Pound (GBP)</option>
              <option value="JPY">Japanese Yen (JPY)</option>
              <option value="AUD">Australian Dollar (AUD)</option>
              <option value="CAD">Canadian Dollar (CAD)</option>
            </select>
          ) : (
            <select
              id="currency"
              name="currency"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="SOL">Solana (SOL)</option>
              <option value="USDT">Tether (USDT)</option>
              <option value="USDC">USD Coin (USDC)</option>
            </select>
          )}
        </div>
      </div>

      {formData.type === 'crypto' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Wallet Address</label>
            <input
              type="text"
              name="address"
              id="address"
              value={formData.address || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="network" className="block text-sm font-medium text-gray-700">Network</label>
            <select
              id="network"
              name="network"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={formData.network || ''}
              onChange={handleChange}
            >
              <option value="">Select Network</option>
              <option value="mainnet">Mainnet</option>
              <option value="testnet">Testnet</option>
              <option value="ethereum">Ethereum</option>
              <option value="polygon">Polygon</option>
              <option value="solana">Solana</option>
              <option value="bitcoin">Bitcoin</option>
            </select>
          </div>
        </div>
      )}

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
          Set as default wallet
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
          {isSubmitting ? 'Saving...' : wallet?.$id ? 'Update Wallet' : 'Add Wallet'}
        </button>
      </div>
    </form>
  );
};

export default WalletForm;