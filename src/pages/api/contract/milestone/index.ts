import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
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
      case 'DELETE':
        return handleDeleteRequest(req, res, userId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Milestone API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Handle GET requests for milestones
async function handleGetRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { milestoneId, contractId } = req.query;
  
  // Get a specific milestone
  if (milestoneId && typeof milestoneId === 'string') {
    const milestone = await contractService.getMilestone(milestoneId);
    
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    
    // Get the associated contract to check permissions
    const contract = await contractService.getContract(milestone.contractId);
    
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found for this milestone' });
    }
    
    // Check if user is authorized to view this milestone
    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    return res.status(200).json(milestone);
  }
  
  // Get milestones for a specific contract
  if (contractId && typeof contractId === 'string') {
    // First check if user is authorized to view this contract
    const contract = await contractService.getContract(contractId);
    
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    // Check if user is authorized to view this contract
    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const milestones = await contractService.getMilestonesByContractId(contractId);
    return res.status(200).json(milestones);
  }
  
  // If no specific query, return bad request
  return res.status(400).json({ error: 'Milestone ID or Contract ID is required' });
}

// Handle POST requests for creating milestones
async function handlePostRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const milestoneData = req.body;
  
  // Validate required fields
  if (!milestoneData.contractId || !milestoneData.title || !milestoneData.amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Get the contract to check permissions
  const contract = await contractService.getContract(milestoneData.contractId);
  
  if (!contract) {
    return res.status(404).json({ error: 'Contract not found' });
  }
  
  // Only the client can create milestones
  if (contract.clientId !== userId) {
    return res.status(403).json({ error: 'Only the client can create milestones' });
  }
  
  // Create the milestone
  const newMilestone = await contractService.createMilestone(milestoneData);
  
  if (!newMilestone) {
    return res.status(500).json({ error: 'Failed to create milestone' });
  }
  
  return res.status(201).json(newMilestone);
}

// Handle PUT requests for updating milestones
async function handlePutRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { milestoneId } = req.query;
  const milestoneData = req.body;
  
  if (!milestoneId || typeof milestoneId !== 'string') {
    return res.status(400).json({ error: 'Milestone ID is required' });
  }
  
  // Get the current milestone
  const existingMilestone = await contractService.getMilestone(milestoneId);
  
  if (!existingMilestone) {
    return res.status(404).json({ error: 'Milestone not found' });
  }
  
  // Get the contract to check permissions
  const contract = await contractService.getContract(existingMilestone.contractId);
  
  if (!contract) {
    return res.status(404).json({ error: 'Contract not found for this milestone' });
  }
  
  // Check if user is part of this contract
  const isClient = contract.clientId === userId;
  const isFreelancer = contract.freelancerId === userId;
  
  if (!isClient && !isFreelancer) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // Restrict what each role can update
  if (isFreelancer) {
    // Freelancers can only update status to 'submitted_for_approval'
    const allowedFields = ['status'];
    const allowedStatusValues = ['submitted_for_approval'];
    
    if (
      milestoneData.status && 
      !allowedStatusValues.includes(milestoneData.status)
    ) {
      return res.status(400).json({ 
        error: 'Freelancers can only update status to submitted_for_approval' 
      });
    }
    
    // Filter out any fields that aren't allowed
    const filteredData = Object.keys(milestoneData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = milestoneData[key];
        return obj;
      }, {} as Record<string, any>);
    
    const updatedMilestone = await contractService.updateMilestone(milestoneId, filteredData);
    
    if (!updatedMilestone) {
      return res.status(500).json({ error: 'Failed to update milestone' });
    }
    
    return res.status(200).json(updatedMilestone);
  }
  
  if (isClient) {
    // Clients can update all fields if milestone is not yet approved
    // But only status if it's already in progress
    if (
      existingMilestone.status === 'in_progress' || 
      existingMilestone.status === 'submitted_for_approval'
    ) {
      // Only allow status updates at this point
      const updatedMilestone = await contractService.updateMilestoneStatus(
        milestoneId, 
        milestoneData.status
      );
      
      if (!updatedMilestone) {
        return res.status(500).json({ error: 'Failed to update milestone status' });
      }
      
      return res.status(200).json(updatedMilestone);
    }
    
    // For pending milestones, allow full updates
    const updatedMilestone = await contractService.updateMilestone(milestoneId, milestoneData);
    
    if (!updatedMilestone) {
      return res.status(500).json({ error: 'Failed to update milestone' });
    }
    
    return res.status(200).json(updatedMilestone);
  }
  
  // This should never happen, but just in case
  return res.status(403).json({ error: 'Forbidden' });
}

// Handle DELETE requests for milestones
async function handleDeleteRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { milestoneId } = req.query;
  
  if (!milestoneId || typeof milestoneId !== 'string') {
    return res.status(400).json({ error: 'Milestone ID is required' });
  }
  
  // Get the current milestone
  const existingMilestone = await contractService.getMilestone(milestoneId);
  
  if (!existingMilestone) {
    return res.status(404).json({ error: 'Milestone not found' });
  }
  
  // Get the contract to check permissions
  const contract = await contractService.getContract(existingMilestone.contractId);
  
  if (!contract) {
    return res.status(404).json({ error: 'Contract not found for this milestone' });
  }
  
  // Only the client can delete milestones, and only if they're pending
  if (contract.clientId !== userId) {
    return res.status(403).json({ error: 'Only the client can delete milestones' });
  }
  
  if (existingMilestone.status !== 'pending') {
    return res.status(400).json({ 
      error: 'Only pending milestones can be deleted' 
    });
  }
  
  const success = await contractService.deleteMilestone(milestoneId);
  
  if (!success) {
    return res.status(500).json({ error: 'Failed to delete milestone' });
  }
  
  return res.status(200).json({ message: 'Milestone deleted successfully' });
}