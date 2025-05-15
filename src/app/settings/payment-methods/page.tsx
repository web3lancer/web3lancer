'use client';

import React, { useState, useEffect } from 'react';
import PaymentMethodCard from '@/components/finance/PaymentMethodCard';
import PaymentMethodForm from '@/components/finance/PaymentMethodForm';
import Modal from '@/components/Modal';
import { PaymentMethod } from '@/types';

export default function PaymentMethodsPage() {
  // Since we're using Next.js 'use client' components, we'd need to implement 
  // proper client-side authentication here. For now, we'll assume the user is logged in.
  const [user, setUser] = useState<any>({ isLoggedIn: true, id: 'mock-user-id' });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<Partial<PaymentMethod> | null>(null);

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payment-method');
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const data = await response.json();
      setPaymentMethods(data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (paymentMethod?: PaymentMethod) => {
    setCurrentPaymentMethod(paymentMethod || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPaymentMethod(null);
  };

  const handleSubmitPaymentMethod = async (data: Partial<PaymentMethod>) => {
    setIsSubmitting(true);
    try {
      let response;
      
      // If editing existing payment method
      if (currentPaymentMethod?.$id) {
        response = await fetch(`/api/payment-method?id=${currentPaymentMethod.$id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } else {
        // If creating new payment method
        response = await fetch('/api/payment-method', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }
      
      if (!response.ok) throw new Error('Failed to save payment method');
      
      // Refresh payment methods list
      fetchPaymentMethods();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving payment method:', error);
      alert('Failed to save payment method. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;
    
    try {
      const response = await fetch(`/api/payment-method?id=${paymentMethodId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete payment method');
      
      // Refresh payment methods list
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      alert('Failed to delete payment method. Please try again.');
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      const response = await fetch(`/api/payment-method?id=${paymentMethodId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true })
      });
      
      if (!response.ok) throw new Error('Failed to set default payment method');
      
      // Refresh payment methods list
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error setting default payment method:', error);
      alert('Failed to set default payment method. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Please log in to view your payment methods.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payment Methods</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Payment Method
        </button>
      </div>

      <div>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map((item) => (
              <div key={item} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : paymentMethods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paymentMethods.map((paymentMethod) => (
              <PaymentMethodCard
                key={paymentMethod.$id}
                paymentMethod={paymentMethod}
                onEdit={() => handleOpenModal(paymentMethod)}
                onDelete={() => handleDeletePaymentMethod(paymentMethod.$id)}
                onSetDefault={() => handleSetDefault(paymentMethod.$id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">No payment methods found</h3>
            <p className="mt-2 text-sm text-gray-500">
              You haven't added any payment methods yet. Add a payment method to get started.
            </p>
            <div className="mt-6">
              <button
                onClick={() => handleOpenModal()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Your First Payment Method
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Method Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={currentPaymentMethod?.$id ? 'Edit Payment Method' : 'Add New Payment Method'}
      >
        <PaymentMethodForm
          paymentMethod={currentPaymentMethod || undefined}
          onSubmit={handleSubmitPaymentMethod}
          onCancel={handleCloseModal}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}