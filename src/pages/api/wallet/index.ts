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
    console.error('Wallet API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Handle GET requests for wallets
async function handleGetRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { walletId } = req.query;
  
  // Get a specific wallet
  if (walletId && typeof walletId === 'string') {
    const wallet = await financeService.getWallet(walletId);
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    // Check if user is authorized to view this wallet
    if (wallet.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    return res.status(200).json(wallet);
  }
  
  // Get all wallets for the user
  const wallets = await financeService.getWalletsByUserId(userId);
  return res.status(200).json(wallets);
}

// Handle POST requests for creating wallets
async function handlePostRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const walletData = req.body;
  
  // Validate required fields
  if (!walletData.type || !walletData.currency) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Ensure the user ID is set
  walletData.userId = userId;
  
  // If this is set as default, unset other default wallets
  if (walletData.isDefault) {
    const defaultWallet = await financeService.getDefaultWallet(userId);
    if (defaultWallet) {
      await financeService.updateWallet(defaultWallet.$id, { isDefault: false });
    }
  }
  
  // Create the wallet
  const newWallet = await financeService.createWallet(walletData);
  
  if (!newWallet) {
    return res.status(500).json({ error: 'Failed to create wallet' });
  }
  
  return res.status(201).json(newWallet);
}

// Handle PUT requests for updating wallets
async function handlePutRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { walletId } = req.query;
  const walletData = req.body;
  
  if (!walletId || typeof walletId !== 'string') {
    return res.status(400).json({ error: 'Wallet ID is required' });
  }
  
  // Get the current wallet to check permissions
  const existingWallet = await financeService.getWallet(walletId);
  
  if (!existingWallet) {
    return res.status(404).json({ error: 'Wallet not found' });
  }
  
  // Check if user is authorized to update this wallet
  if (existingWallet.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // If setting as default, unset other default wallets
  if (walletData.isDefault && !existingWallet.isDefault) {
    const defaultWallet = await financeService.getDefaultWallet(userId);
    if (defaultWallet && defaultWallet.$id !== walletId) {
      await financeService.updateWallet(defaultWallet.$id, { isDefault: false });
    }
  }
  
  // Update the wallet
  const updatedWallet = await financeService.updateWallet(walletId, walletData);
  
  if (!updatedWallet) {
    return res.status(500).json({ error: 'Failed to update wallet' });
  }
  
  return res.status(200).json(updatedWallet);
}

// Handle DELETE requests for wallets
async function handleDeleteRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { walletId } = req.query;
  
  if (!walletId || typeof walletId !== 'string') {
    return res.status(400).json({ error: 'Wallet ID is required' });
  }
  
  // Get the current wallet to check permissions
  const existingWallet = await financeService.getWallet(walletId);
  
  if (!existingWallet) {
    return res.status(404).json({ error: 'Wallet not found' });
  }
  
  // Check if user is authorized to delete this wallet
  if (existingWallet.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // Don't allow deleting the default wallet
  if (existingWallet.isDefault) {
    return res.status(400).json({ error: 'Cannot delete the default wallet. Set another wallet as default first.' });
  }
  
  // Delete the wallet
  const success = await financeService.deleteWallet(walletId);
  
  if (!success) {
    return res.status(500).json({ error: 'Failed to delete wallet' });
  }
  
  return res.status(200).json({ message: 'Wallet deleted successfully' });
}