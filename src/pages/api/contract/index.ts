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
    console.error('Contract API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Handle GET requests for contracts
async function handleGetRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { contractId, clientId, freelancerId, projectId } = req.query;
  
  // Get a specific contract
  if (contractId && typeof contractId === 'string') {
    const contract = await contractService.getContract(contractId);
    
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    // Check if user is authorized to view this contract
    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    return res.status(200).json(contract);
  }
  
  // Get contracts where user is the client
  if (clientId === 'me' || clientId === userId) {
    const contracts = await contractService.getContractsByClientId(userId);
    return res.status(200).json(contracts);
  }
  
  // Get contracts where user is the freelancer
  if (freelancerId === 'me' || freelancerId === userId) {
    const contracts = await contractService.getContractsByFreelancerId(userId);
    return res.status(200).json(contracts);
  }
  
  // Get contracts for a specific project
  if (projectId && typeof projectId === 'string') {
    const contract = await contractService.getContract(projectId);
    
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found for this project' });
    }
    
    // Check if user is authorized to view this contract
    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    return res.status(200).json(contract);
  }
  
  // If no specific query, return user's contracts (both as client and freelancer)
  const clientContracts = await contractService.getContractsByClientId(userId);
  const freelancerContracts = await contractService.getContractsByFreelancerId(userId);
  
  // Combine and deduplicate contracts
  const allContracts = [...clientContracts, ...freelancerContracts];
  const uniqueContracts = allContracts.filter((contract, index, self) =>
    index === self.findIndex((c) => c.$id === contract.$id)
  );
  
  return res.status(200).json(uniqueContracts);
}

// Handle POST requests for creating contracts
async function handlePostRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const contractData = req.body;
  
  // Validate required fields
  if (!contractData.projectId || !contractData.freelancerId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Ensure the user is the client creating this contract
  contractData.clientId = userId;
  
  // Create the contract
  const newContract = await contractService.createContract(contractData);
  
  if (!newContract) {
    return res.status(500).json({ error: 'Failed to create contract' });
  }
  
  return res.status(201).json(newContract);
}

// Handle PUT requests for updating contracts
async function handlePutRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { contractId } = req.query;
  const contractData = req.body;
  
  if (!contractId || typeof contractId !== 'string') {
    return res.status(400).json({ error: 'Contract ID is required' });
  }
  
  // Get the current contract to check permissions
  const existingContract = await contractService.getContract(contractId);
  
  if (!existingContract) {
    return res.status(404).json({ error: 'Contract not found' });
  }
  
  // Check if user is authorized to update this contract
  const isClient = existingContract.clientId === userId;
  const isFreelancer = existingContract.freelancerId === userId;
  
  if (!isClient && !isFreelancer) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // Restrict what freelancers can update
  if (isFreelancer && !isClient) {
    // Freelancers can only update specific fields
    const allowedFields = ['status']; // Add other allowed fields as needed
    
    // Filter out any fields that aren't allowed
    const filteredData = Object.keys(contractData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = contractData[key];
        return obj;
      }, {} as Record<string, any>);
    
    const updatedContract = await contractService.updateContract(contractId, filteredData);
    
    if (!updatedContract) {
      return res.status(500).json({ error: 'Failed to update contract' });
    }
    
    return res.status(200).json(updatedContract);
  }
  
  // Client can update more fields
  const updatedContract = await contractService.updateContract(contractId, contractData);
  
  if (!updatedContract) {
    return res.status(500).json({ error: 'Failed to update contract' });
  }
  
  return res.status(200).json(updatedContract);
}

// Handle DELETE requests for contracts
async function handleDeleteRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { contractId } = req.query;
  
  if (!contractId || typeof contractId !== 'string') {
    return res.status(400).json({ error: 'Contract ID is required' });
  }
  
  // Get the current contract to check permissions
  const existingContract = await contractService.getContract(contractId);
  
  if (!existingContract) {
    return res.status(404).json({ error: 'Contract not found' });
  }
  
  // Only the client who created the contract can delete it, and only if it's a draft
  if (existingContract.clientId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  if (existingContract.status !== 'draft') {
    return res.status(400).json({ 
      error: 'Only draft contracts can be deleted. Consider cancelling the contract instead.' 
    });
  }
  
  const success = await contractService.deleteContract(contractId);
  
  if (!success) {
    return res.status(500).json({ error: 'Failed to delete contract' });
  }
  
  return res.status(200).json({ message: 'Contract deleted successfully' });
}