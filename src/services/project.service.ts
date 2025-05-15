// Add these functions to the projectService class

// Accept a proposal and create a contract
async acceptProposal(projectId: string, proposalId: string): Promise<boolean> {
  try {
    // 1. Get project details
    const project = await this.getProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    // 2. Get proposal details
    const proposal = await this.getProposalById(proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }
    
    // 3. Update proposal status to accepted
    const updatedProposal = await this.databases.updateDocument(
      env.NEXT_PUBLIC_APPWRITE_DATABASE_JOBS_ID,
      env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_PROPOSALS_ID,
      proposalId,
      { 
        status: 'accepted',
        updatedAt: new Date().toISOString()
      }
    );
    
    // 4. Update project status to in_progress and set freelancer
    const updatedProject = await this.databases.updateDocument(
      env.NEXT_PUBLIC_APPWRITE_DATABASE_JOBS_ID,
      env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_POSTINGS_ID,
      projectId,
      { 
        status: 'in_progress',
        freelancerId: proposal.freelancerId,
        freelancerProfileId: proposal.freelancerProfileId,
        updatedAt: new Date().toISOString()
      }
    );
    
    // 5. Create a contract from the proposal
    const contractService = (await import('@/services/contract.service')).contractService;
    const contract = await contractService.createContract(proposal, project);
    
    if (!contract) {
      throw new Error('Failed to create contract');
    }
    
    // 6. Add contractId to the project
    await this.databases.updateDocument(
      env.NEXT_PUBLIC_APPWRITE_DATABASE_JOBS_ID,
      env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_POSTINGS_ID,
      projectId,
      { 
        contractId: contract.$id,
        updatedAt: new Date().toISOString()
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error accepting proposal:', error);
    return false;
  }
}

// Get contract for a project
async getProjectContract(projectId: string): Promise<Contract | null> {
  try {
    const project = await this.getProjectById(projectId);
    if (!project || !project.contractId) {
      return null;
    }
    
    const contractService = (await import('@/services/contract.service')).contractService;
    return await contractService.getContract(project.contractId);
  } catch (error) {
    console.error('Error getting project contract:', error);
    return null;
  }
}