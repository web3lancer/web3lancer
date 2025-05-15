import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import financeService from '@/services/financeService';
import contractService from '@/services/contractService';

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
    console.error('Escrow API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Handle GET requests for escrow transactions
async function handleGetRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { escrowId, contractId, milestoneId } = req.query;
  
  // Get a specific escrow transaction
  if (escrowId && typeof escrowId === 'string') {
    const escrow = await financeService.getEscrowTransaction(escrowId);
    
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow transaction not found' });
    }
    
    // Check if user is authorized to view this escrow
    const contract = await contractService.getContract(escrow.contractId);
    
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    // Only client and freelancer can view escrow
    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    return res.status(200).json(escrow);
  }
  
  // Get escrow for a specific milestone
  if (milestoneId && typeof milestoneId === 'string') {
    const milestone = await contractService.getMilestone(milestoneId);
    
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    
    const contract = await contractService.getContract(milestone.contractId);
    
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    // Only client and freelancer can view escrow
    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const escrow = await financeService.getEscrowByMilestoneId(milestoneId);
    
    if (!escrow) {
      return res.status(404).json({ error: 'No escrow found for this milestone' });
    }
    
    return res.status(200).json(escrow);
  }
  
  // Get escrows for a specific contract
  if (contractId && typeof contractId === 'string') {
    const contract = await contractService.getContract(contractId);
    
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    // Only client and freelancer can view escrow
    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const escrows = await financeService.getEscrowsByContractId(contractId);
    return res.status(200).json(escrows);
  }
  
  // If none of the above, return 400
  return res.status(400).json({ error: 'Missing required query parameters' });
}

// Handle POST requests for creating escrow transactions
async function handlePostRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const escrowData = req.body;
  
  // Validate required fields
  if (!escrowData.contractId || !escrowData.milestoneId || !escrowData.fromWalletId || !escrowData.amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Get the contract to validate permissions
  const contract = await contractService.getContract(escrowData.contractId);
  
  if (!contract) {
    return res.status(404).json({ error: 'Contract not found' });
  }
  
  // Only the client can create escrow
  if (contract.clientId !== userId) {
    return res.status(403).json({ error: 'Only the client can create an escrow' });
  }
  
  // Get the milestone to validate it belongs to the contract
  const milestone = await contractService.getMilestone(escrowData.milestoneId);
  
  if (!milestone) {
    return res.status(404).json({ error: 'Milestone not found' });
  }
  
  if (milestone.contractId !== escrowData.contractId) {
    return res.status(400).json({ error: 'Milestone does not belong to this contract' });
  }
  
  // Check if an escrow already exists for this milestone
  const existingEscrow = await financeService.getEscrowByMilestoneId(escrowData.milestoneId);
  
  if (existingEscrow) {
    return res.status(400).json({ error: 'An escrow already exists for this milestone' });
  }
  
  // Get the wallet to validate it belongs to the user
  const wallet = await financeService.getWallet(escrowData.fromWalletId);
  
  if (!wallet) {
    return res.status(404).json({ error: 'Wallet not found' });
  }
  
  if (wallet.userId !== userId) {
    return res.status(403).json({ error: 'You do not have permission to use this wallet' });
  }
  
  // Check if wallet has sufficient balance
  if (wallet.balance < escrowData.amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  
  // Create the escrow transaction
  const newEscrow = await financeService.createEscrowTransaction(escrowData);
  
  if (!newEscrow) {
    return res.status(500).json({ error: 'Failed to create escrow transaction' });
  }
  
  // Update the wallet balance
  await financeService.updateWallet(wallet.$id, { balance: wallet.balance - escrowData.amount });
  
  // Record a transaction for this escrow
  await financeService.createTransaction({
    userId,
    walletId: escrowData.fromWalletId,
    amount: escrowData.amount,
    currency: escrowData.currency || wallet.currency,
    type: 'escrow',
    status: 'completed',
    description: `Escrow payment for milestone "${milestone.title}" in contract "${contract.title}"`,
    contractId: escrowData.contractId,
    milestoneId: escrowData.milestoneId
  });
  
  // Update milestone status to reflect escrow funding
  await contractService.updateMilestoneStatus(milestone.$id, 'in_progress');
  
  return res.status(201).json(newEscrow);
}

// Handle PUT requests for updating escrow status
async function handlePutRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { escrowId } = req.query;
  const { status, toWalletId } = req.body;
  
  if (!escrowId || typeof escrowId !== 'string') {
    return res.status(400).json({ error: 'Escrow ID is required' });
  }
  
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  
  // Get the current escrow to check permissions
  const existingEscrow = await financeService.getEscrowTransaction(escrowId);
  
  if (!existingEscrow) {
    return res.status(404).json({ error: 'Escrow transaction not found' });
  }
  
  // Get the contract to check permissions
  const contract = await contractService.getContract(existingEscrow.contractId);
  
  if (!contract) {
    return res.status(404).json({ error: 'Contract not found' });
  }
  
  // Get the milestone
  const milestone = await contractService.getMilestone(existingEscrow.milestoneId);
  
  if (!milestone) {
    return res.status(404).json({ error: 'Milestone not found' });
  }
  
  // Validate permissions based on action
  const isClient = contract.clientId === userId;
  const isFreelancer = contract.freelancerId === userId;
  
  if (!isClient && !isFreelancer) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // Validate allowed status transitions
  if (status === 'released') {
    // Only client can release funds
    if (!isClient) {
      return res.status(403).json({ error: 'Only the client can release funds' });
    }
    
    // The milestone should be approved first
    if (milestone.status !== 'approved') {
      return res.status(400).json({ error: 'Milestone must be approved before releasing funds' });
    }
    
    // Need to specify the freelancer's wallet
    if (!toWalletId) {
      return res.status(400).json({ error: 'Recipient wallet ID is required to release funds' });
    }
    
    // Check if the wallet belongs to the freelancer
    const freelancerWallet = await financeService.getWallet(toWalletId);
    
    if (!freelancerWallet) {
      return res.status(404).json({ error: 'Recipient wallet not found' });
    }
    
    if (freelancerWallet.userId !== contract.freelancerId) {
      return res.status(403).json({ error: 'The wallet does not belong to the freelancer' });
    }
    
    // Update escrow status and recipient wallet
    const updatedEscrow = await financeService.updateEscrowStatus(escrowId, 'released');
    
    if (!updatedEscrow) {
      return res.status(500).json({ error: 'Failed to update escrow' });
    }
    
    // Update the freelancer's wallet balance
    await financeService.updateWallet(toWalletId, { 
      balance: freelancerWallet.balance + existingEscrow.amount 
    });
    
    // Record a transaction for the release
    await financeService.createTransaction({
      userId: contract.freelancerId,
      walletId: toWalletId,
      amount: existingEscrow.amount,
      currency: existingEscrow.currency,
      type: 'release',
      status: 'completed',
      description: `Payment received for milestone "${milestone.title}" in contract "${contract.title}"`,
      contractId: existingEscrow.contractId,
      milestoneId: existingEscrow.milestoneId
    });
    
    // Update milestone status
    await contractService.updateMilestoneStatus(milestone.$id, 'paid');
    
    return res.status(200).json(updatedEscrow);
  } else if (status === 'refunded') {
    // Only client can request refund
    if (!isClient) {
      return res.status(403).json({ error: 'Only the client can request a refund' });
    }
    
    // The milestone should not be completed or paid
    if (milestone.status === 'paid') {
      return res.status(400).json({ error: 'Cannot refund a paid milestone' });
    }
    
    // Update escrow status
    const updatedEscrow = await financeService.updateEscrowStatus(escrowId, 'refunded');
    
    if (!updatedEscrow) {
      return res.status(500).json({ error: 'Failed to update escrow' });
    }
    
    // Return the funds to the client's wallet
    const clientWallet = await financeService.getWallet(existingEscrow.fromWalletId);
    
    if (clientWallet) {
      await financeService.updateWallet(clientWallet.$id, { 
        balance: clientWallet.balance + existingEscrow.amount 
      });
      
      // Record a transaction for the refund
      await financeService.createTransaction({
        userId,
        walletId: clientWallet.$id,
        amount: existingEscrow.amount,
        currency: existingEscrow.currency,
        type: 'refund',
        status: 'completed',
        description: `Refund for milestone "${milestone.title}" in contract "${contract.title}"`,
        contractId: existingEscrow.contractId,
        milestoneId: existingEscrow.milestoneId
      });
    }
    
    // Update milestone status
    await contractService.updateMilestoneStatus(milestone.$id, 'pending');
    
    return res.status(200).json(updatedEscrow);
  } else if (status === 'disputed') {
    // Both client and freelancer can raise a dispute
    const updatedEscrow = await financeService.updateEscrowStatus(escrowId, 'disputed');
    
    if (!updatedEscrow) {
      return res.status(500).json({ error: 'Failed to update escrow' });
    }
    
    // Update milestone status
    await contractService.updateMilestoneStatus(milestone.$id, 'disputed');
    
    return res.status(200).json(updatedEscrow);
  } else {
    return res.status(400).json({ error: 'Invalid status transition' });
  }
}