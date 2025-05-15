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
    
    // Only handle POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    return handlePostRequest(req, res, userId);
  } catch (error) {
    console.error('Deposit API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Handle deposit requests
async function handlePostRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { walletId, amount, paymentMethodId } = req.body;
  
  // Validate required fields
  if (!walletId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid deposit data' });
  }
  
  // Get the wallet to validate it belongs to the user
  const wallet = await financeService.getWallet(walletId);
  
  if (!wallet) {
    return res.status(404).json({ error: 'Wallet not found' });
  }
  
  if (wallet.userId !== userId) {
    return res.status(403).json({ error: 'You do not have permission to deposit to this wallet' });
  }
  
  // Validate payment method if provided
  if (paymentMethodId) {
    const paymentMethod = await financeService.getPaymentMethod(paymentMethodId);
    
    if (!paymentMethod) {
      return res.status(404).json({ error: 'Payment method not found' });
    }
    
    if (paymentMethod.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to use this payment method' });
    }
  }
  
  // Create a deposit transaction
  const transaction = await financeService.createTransaction({
    userId,
    walletId,
    amount,
    currency: wallet.currency,
    type: 'deposit',
    status: 'completed', // For simplicity, we're marking it as completed immediately
    description: `Deposit to ${wallet.type === 'fiat' ? 'fiat' : 'crypto'} wallet`,
    paymentMethodId,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString()
  });
  
  if (!transaction) {
    return res.status(500).json({ error: 'Failed to create deposit transaction' });
  }
  
  // Update wallet balance
  const updatedWallet = await financeService.updateWallet(walletId, {
    balance: wallet.balance + amount,
    updatedAt: new Date().toISOString()
  });
  
  if (!updatedWallet) {
    return res.status(500).json({ error: 'Failed to update wallet balance' });
  }
  
  return res.status(200).json({
    success: true,
    transaction,
    wallet: updatedWallet
  });
}