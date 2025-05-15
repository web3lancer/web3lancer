import React from 'react';
import Link from 'next/link';
import { 
  WalletIcon, 
  CreditCardIcon, 
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';

export default function FinancePage() {
  const features = [
    {
      name: 'Wallets',
      description: 'Manage your fiat and crypto wallets. Fund your wallets to pay for services or receive payments from clients.',
      icon: WalletIcon,
      href: '/wallet'
    },
    {
      name: 'Payment Methods',
      description: 'Add and manage your payment methods for easy deposits and withdrawals.',
      icon: CreditCardIcon,
      href: '/payment-methods'
    },
    {
      name: 'Deposits',
      description: 'Add funds to your wallets for paying freelancers or platform fees.',
      icon: ArrowDownTrayIcon,
      href: '/wallet' // Will open wallet page with deposit modal
    },
    {
      name: 'Withdrawals',
      description: 'Withdraw your earnings to your bank account or crypto wallet.',
      icon: ArrowUpTrayIcon,
      href: '/wallet' // Will open wallet page with withdrawal modal
    },
    {
      name: 'Transaction History',
      description: 'View all your past transactions including payments, deposits, and withdrawals.',
      icon: ArrowPathIcon,
      href: '/wallet?tab=transactions'
    },
    {
      name: 'Escrow Services',
      description: 'Secure payments through our escrow service for all contracts.',
      icon: ShieldCheckIcon,
      href: '/contracts'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Financial Management
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
          Manage your funds, payments, and transactions in one place.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link href={feature.href} key={feature.name}>
            <div className="relative p-6 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-full transition-transform hover:shadow-md hover:-translate-y-1">
              <div>
                <span className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                <p className="mt-2 text-base text-gray-500">{feature.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg mt-12 p-6 divide-y divide-gray-200">
        <div className="pb-6">
          <h2 className="text-xl font-semibold text-gray-900">Learn More About Financial Services</h2>
          <p className="mt-2 text-gray-600">
            Our financial system provides secure and efficient ways to manage payments for your freelance work or client projects.
          </p>
        </div>
        
        <div className="pt-6">
          <h3 className="text-lg font-medium text-gray-900">Escrow Protection</h3>
          <p className="mt-2 text-gray-600">
            All payments between clients and freelancers are protected by our escrow service, ensuring that funds are only released when both parties are satisfied with the work completed.
          </p>
        </div>
        
        <div className="pt-6">
          <h3 className="text-lg font-medium text-gray-900">Multiple Payment Options</h3>
          <p className="mt-2 text-gray-600">
            We support various payment methods including credit/debit cards, bank transfers, and cryptocurrencies, making it easy for everyone to participate in the platform.
          </p>
        </div>
        
        <div className="pt-6">
          <h3 className="text-lg font-medium text-gray-900">Transaction Security</h3>
          <p className="mt-2 text-gray-600">
            All transactions are processed securely and your financial data is encrypted and protected according to industry standards.
          </p>
        </div>
      </div>
    </div>
  );
}