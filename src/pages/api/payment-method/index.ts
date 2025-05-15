import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import financeService from '@/services/financeService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get user session for authentication
    const session = await getSession({ req });
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = session.user.id;
    
    switch (req.method) {
      case 'GET':
        return handleGetRequest(req, res, userId);
      case 'POST':
        return handlePostRequest(req, res, userId);
      case 'PUT':
        return handlePutRequest(req, res, userId);
      case 'DELETE':
        return handleDeleteRequest(req, res, userId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Payment method API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Handle GET requests for payment methods
async function handleGetRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { paymentMethodId } = req.query;
  
  // Get a specific payment method
  if (paymentMethodId && typeof paymentMethodId === 'string') {
    const paymentMethod = await financeService.getPaymentMethod(paymentMethodId);
    
    if (!paymentMethod) {
      return res.status(404).json({ error: 'Payment method not found' });
    }
    
    // Check if user is authorized to view this payment method
    if (paymentMethod.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    return res.status(200).json(paymentMethod);
  }
  
  // Get all payment methods for the user
  const paymentMethods = await financeService.getPaymentMethodsByUserId(userId);
  return res.status(200).json(paymentMethods);
}

// Handle POST requests for creating payment methods
async function handlePostRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const paymentMethodData = req.body;
  
  // Validate required fields
  if (!paymentMethodData.type || !paymentMethodData.name || !paymentMethodData.details) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Ensure the user ID is set
  paymentMethodData.userId = userId;
  
  // If this is set as default, unset other default payment methods
  if (paymentMethodData.isDefault) {
    const defaultPaymentMethod = await financeService.getDefaultPaymentMethod(userId);
    if (defaultPaymentMethod) {
      await financeService.updatePaymentMethod(defaultPaymentMethod.$id, { isDefault: false });
    }
  }
  
  // Create the payment method
  const newPaymentMethod = await financeService.addPaymentMethod(paymentMethodData);
  
  if (!newPaymentMethod) {
    return res.status(500).json({ error: 'Failed to create payment method' });
  }
  
  return res.status(201).json(newPaymentMethod);
}

// Handle PUT requests for updating payment methods
async function handlePutRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { paymentMethodId } = req.query;
  const paymentMethodData = req.body;
  
  if (!paymentMethodId || typeof paymentMethodId !== 'string') {
    return res.status(400).json({ error: 'Payment method ID is required' });
  }
  
  // Get the current payment method to check permissions
  const existingPaymentMethod = await financeService.getPaymentMethod(paymentMethodId);
  
  if (!existingPaymentMethod) {
    return res.status(404).json({ error: 'Payment method not found' });
  }
  
  // Check if user is authorized to update this payment method
  if (existingPaymentMethod.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // If setting as default, unset other default payment methods
  if (paymentMethodData.isDefault && !existingPaymentMethod.isDefault) {
    const defaultPaymentMethod = await financeService.getDefaultPaymentMethod(userId);
    if (defaultPaymentMethod && defaultPaymentMethod.$id !== paymentMethodId) {
      await financeService.updatePaymentMethod(defaultPaymentMethod.$id, { isDefault: false });
    }
  }
  
  // Update the payment method
  const updatedPaymentMethod = await financeService.updatePaymentMethod(paymentMethodId, paymentMethodData);
  
  if (!updatedPaymentMethod) {
    return res.status(500).json({ error: 'Failed to update payment method' });
  }
  
  return res.status(200).json(updatedPaymentMethod);
}

// Handle DELETE requests for payment methods
async function handleDeleteRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { paymentMethodId } = req.query;
  
  if (!paymentMethodId || typeof paymentMethodId !== 'string') {
    return res.status(400).json({ error: 'Payment method ID is required' });
  }
  
  // Get the current payment method to check permissions
  const existingPaymentMethod = await financeService.getPaymentMethod(paymentMethodId);
  
  if (!existingPaymentMethod) {
    return res.status(404).json({ error: 'Payment method not found' });
  }
  
  // Check if user is authorized to delete this payment method
  if (existingPaymentMethod.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // Don't allow deleting the default payment method
  if (existingPaymentMethod.isDefault) {
    return res.status(400).json({ 
      error: 'Cannot delete the default payment method. Set another payment method as default first.' 
    });
  }
  
  // Delete the payment method
  const success = await financeService.deletePaymentMethod(paymentMethodId);
  
  if (!success) {
    return res.status(500).json({ error: 'Failed to delete payment method' });
  }
  
  return res.status(200).json({ message: 'Payment method deleted successfully' });
}