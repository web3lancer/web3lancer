import { NextApiRequest, NextApiResponse } from 'next';
import financeService from '@/services/financeService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Only handle POST requests for deposits
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // In a real implementation, would verify authentication here
    // For demo purposes, we'll use the user ID from the request
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }
    
    const { 
      walletId,
      amount,
      currency,
      paymentMethodId,
      description 
    } = req.body;
    
    // Validate required fields
    if (!walletId || !amount || amount <= 0 || !currency) {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }
    
    // Get the wallet to ensure it belongs to the user
    const wallet = await financeService.getWallet(walletId);
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    if (wallet.userId !== userId) {
      return res.status(403).json({ error: 'You do not own this wallet' });
    }
    
    // Validate the payment method if provided
    if (paymentMethodId) {
      const paymentMethod = await financeService.getPaymentMethod(paymentMethodId);
      
      if (!paymentMethod) {
        return res.status(404).json({ error: 'Payment method not found' });
      }
      
      if (paymentMethod.userId !== userId) {
        return res.status(403).json({ error: 'You do not own this payment method' });
      }
    }
    
    // Create a pending deposit transaction
    const transaction = await financeService.createTransaction({
      userId,
      walletId,
      amount,
      currency,
      type: 'deposit',
      status: 'pending',
      description: description || 'Wallet deposit',
      paymentMethodId
    });
    
    if (!transaction) {
      return res.status(500).json({ error: 'Failed to create deposit transaction' });
    }
    
    // In a real app, you would initiate a payment process here
    // For demo purposes, we'll just simulate a successful deposit
    
    // Update transaction to completed status
    const updatedTransaction = await financeService.updateTransactionStatus(
      transaction.$id,
      'completed'
    );
    
    // Update wallet balance
    const newBalance = wallet.balance + amount;
    await financeService.updateWallet(walletId, { balance: newBalance });
    
    return res.status(200).json(updatedTransaction);
  } catch (error) {
    console.error('Deposit API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}