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
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Transaction API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Handle GET requests for transactions
async function handleGetRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { transactionId, limit, offset } = req.query;
  
  // Get a specific transaction
  if (transactionId && typeof transactionId === 'string') {
    const transaction = await financeService.getTransaction(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Check if user is authorized to view this transaction
    if (transaction.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    return res.status(200).json(transaction);
  }
  
  // Get all transactions for the user with pagination
  const limitNum = typeof limit === 'string' ? parseInt(limit) : 20;
  const offsetNum = typeof offset === 'string' ? parseInt(offset) : 0;
  
  const transactions = await financeService.getTransactionsByUserId(
    userId, 
    limitNum, 
    offsetNum
  );
  
  return res.status(200).json(transactions);
}

// Handle POST requests for creating transactions
async function handlePostRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const transactionData = req.body;
  
  // Validate required fields
  if (!transactionData.amount || !transactionData.walletId || !transactionData.type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Ensure the user ID is set
  transactionData.userId = userId;
  
  // Get the wallet to validate it belongs to the user
  const wallet = await financeService.getWallet(transactionData.walletId);
  
  if (!wallet) {
    return res.status(404).json({ error: 'Wallet not found' });
  }
  
  if (wallet.userId !== userId) {
    return res.status(403).json({ error: 'You do not have permission to use this wallet' });
  }
  
  // Create the transaction
  const newTransaction = await financeService.createTransaction(transactionData);
  
  if (!newTransaction) {
    return res.status(500).json({ error: 'Failed to create transaction' });
  }
  
  // If transaction is deposit or withdrawal, update wallet balance
  if (newTransaction.status === 'completed') {
    const newBalance = newTransaction.type === 'deposit' || newTransaction.type === 'refund'
      ? wallet.balance + newTransaction.amount
      : wallet.balance - newTransaction.amount;
    
    await financeService.updateWallet(wallet.$id, { balance: newBalance });
  }
  
  return res.status(201).json(newTransaction);
}

// Handle PUT requests for updating transaction status
async function handlePutRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { transactionId } = req.query;
  const { status } = req.body;
  
  if (!transactionId || typeof transactionId !== 'string') {
    return res.status(400).json({ error: 'Transaction ID is required' });
  }
  
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  
  // Get the current transaction to check permissions
  const existingTransaction = await financeService.getTransaction(transactionId);
  
  if (!existingTransaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  
  // Check if user is authorized to update this transaction
  // For regular users, they can only view their own transactions
  // In a real app, admin roles would be checked here too
  if (existingTransaction.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // Don't allow updating completed or failed transactions
  if (existingTransaction.status === 'completed' || existingTransaction.status === 'failed') {
    return res.status(400).json({ error: `Cannot update a transaction that is already ${existingTransaction.status}` });
  }
  
  // Update the transaction status
  const updatedTransaction = await financeService.updateTransactionStatus(transactionId, status);
  
  if (!updatedTransaction) {
    return res.status(500).json({ error: 'Failed to update transaction' });
  }
  
  // If transaction is now completed, update wallet balance
  if (updatedTransaction.status === 'completed' && existingTransaction.status !== 'completed') {
    const wallet = await financeService.getWallet(updatedTransaction.walletId);
    
    if (wallet) {
      const newBalance = updatedTransaction.type === 'deposit' || updatedTransaction.type === 'refund'
        ? wallet.balance + updatedTransaction.amount
        : wallet.balance - updatedTransaction.amount;
      
      await financeService.updateWallet(wallet.$id, { balance: newBalance });
    }
  }
  
  return res.status(200).json(updatedTransaction);
}