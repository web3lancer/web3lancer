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
    console.error('Withdrawal API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Handle withdrawal requests
async function handlePostRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { walletId, amount, paymentMethodId } = req.body;
  
  // Validate required fields
  if (!walletId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid withdrawal data' });
  }
  
  // Get the wallet to validate it belongs to the user
  const wallet = await financeService.getWallet(walletId);
  
  if (!wallet) {
    return res.status(404).json({ error: 'Wallet not found' });
  }
  
  if (wallet.userId !== userId) {
    return res.status(403).json({ error: 'You do not have permission to withdraw from this wallet' });
  }
  
  // Check if wallet has sufficient balance
  if (wallet.balance < amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  
  // Validate payment method
  if (paymentMethodId) {
    const paymentMethod = await financeService.getPaymentMethod(paymentMethodId);
    
    if (!paymentMethod) {
      return res.status(404).json({ error: 'Payment method not found' });
    }
    
    if (paymentMethod.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to use this payment method' });
    }
  }
  
  // Create a withdrawal transaction
  const transaction = await financeService.createTransaction({
    userId,
    walletId,
    amount,
    currency: wallet.currency,
    type: 'withdrawal',
    status: 'pending', // Withdrawals typically need review or processing time
    description: `Withdrawal from ${wallet.type === 'fiat' ? 'fiat' : 'crypto'} wallet`,
    paymentMethodId,
    createdAt: new Date().toISOString()
  });
  
  if (!transaction) {
    return res.status(500).json({ error: 'Failed to create withdrawal transaction' });
  }
  
  // Update wallet balance (reduce the balance immediately, even though the withdrawal is pending)
  const updatedWallet = await financeService.updateWallet(walletId, {
    balance: wallet.balance - amount,
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