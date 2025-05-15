import { Contract, Proposal, Payment, Review, Project } from '@/types';
import { appwriteClient } from '@/lib/appwrite-client';
import { Databases, Query, ID } from 'appwrite';
import { env } from '@/lib/env';

class ContractService {
  private databases;

  constructor() {
    this.databases = new Databases(appwriteClient);
  }

  // Create a contract from an accepted proposal
  async createContract(proposal: Proposal, project: Project): Promise<Contract | null> {
    try {
      // Prepare milestones from proposal if they exist
      const milestones = proposal.milestones ? proposal.milestones.map(m => ({
        title: m.title,
        description: m.description || '',
        amount: m.amount || 0,
        status: 'pending' as const
      })) : [];

      const contractData: Partial<Contract> = {
        projectId: project.$id,
        proposalId: proposal.$id,
        clientId: project.clientId,
        clientProfileId: project.clientProfileId,
        freelancerId: proposal.freelancerId,
        freelancerProfileId: proposal.freelancerProfileId,
        title: project.title,
        description: project.description,
        terms: `Contract based on proposal ${proposal.$id} for project ${project.title}`,
        budget: proposal.proposedBudget || 0,
        duration: proposal.proposedDuration,
        milestones: milestones,
        status: 'active',
        startDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const contract = await this.databases.createDocument(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_JOBS_ID,
        env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_CONTRACTS_ID,
        ID.unique(),
        contractData
      );

      return contract as Contract;
    } catch (error) {
      console.error('Error creating contract:', error);
      return null;
    }
  }

  // Get contract by ID
  async getContract(contractId: string): Promise<Contract | null> {
    try {
      const contract = await this.databases.getDocument(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_JOBS_ID,
        env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_CONTRACTS_ID,
        contractId
      );
      
      return contract as Contract;
    } catch (error) {
      console.error('Error fetching contract:', error);
      return null;
    }
  }

  // Get contracts for a user (as client or freelancer)
  async getUserContracts(userId: string, role: 'client' | 'freelancer'): Promise<Contract[]> {
    try {
      const fieldToQuery = role === 'client' ? 'clientId' : 'freelancerId';
      
      const contracts = await this.databases.listDocuments(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_JOBS_ID,
        env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_CONTRACTS_ID,
        [
          Query.equal(fieldToQuery, userId),
          Query.orderDesc('$createdAt')
        ]
      );
      
      return contracts.documents as Contract[];
    } catch (error) {
      console.error(`Error fetching ${role} contracts:`, error);
      return [];
    }
  }

  // Get contract for a specific project
  async getProjectContract(projectId: string): Promise<Contract | null> {
    try {
      const contracts = await this.databases.listDocuments(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_JOBS_ID,
        env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_CONTRACTS_ID,
        [
          Query.equal('projectId', projectId),
          Query.limit(1)
        ]
      );
      
      if (contracts.documents.length === 0) {
        return null;
      }
      
      return contracts.documents[0] as Contract;
    } catch (error) {
      console.error('Error fetching project contract:', error);
      return null;
    }
  }

  // Update contract status
  async updateContractStatus(contractId: string, status: Contract['status']): Promise<Contract | null> {
    try {
      const contract = await this.databases.updateDocument(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_JOBS_ID,
        env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_CONTRACTS_ID,
        contractId,
        {
          status,
          updatedAt: new Date().toISOString()
        }
      );
      
      return contract as Contract;
    } catch (error) {
      console.error('Error updating contract status:', error);
      return null;
    }
  }

  // Add a milestone to a contract
  async addMilestone(contractId: string, milestone: {
    title: string;
    description?: string;
    amount: number;
    dueDate?: string;
  }): Promise<Contract | null> {
    try {
      const contract = await this.getContract(contractId);
      if (!contract) return null;

      const milestones = contract.milestones || [];
      milestones.push({
        ...milestone,
        status: 'pending'
      });

      const updatedContract = await this.databases.updateDocument(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_JOBS_ID,
        env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_CONTRACTS_ID,
        contractId,
        {
          milestones,
          updatedAt: new Date().toISOString()
        }
      );
      
      return updatedContract as Contract;
    } catch (error) {
      console.error('Error adding milestone:', error);
      return null;
    }
  }

  // Update milestone status
  async updateMilestoneStatus(
    contractId: string, 
    milestoneIndex: number, 
    status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'paid'
  ): Promise<Contract | null> {
    try {
      const contract = await this.getContract(contractId);
      if (!contract || !contract.milestones || !contract.milestones[milestoneIndex]) {
        return null;
      }

      const milestones = [...contract.milestones];
      milestones[milestoneIndex] = {
        ...milestones[milestoneIndex],
        status
      };

      const updatedContract = await this.databases.updateDocument(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_JOBS_ID,
        env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_CONTRACTS_ID,
        contractId,
        {
          milestones,
          updatedAt: new Date().toISOString()
        }
      );
      
      return updatedContract as Contract;
    } catch (error) {
      console.error('Error updating milestone status:', error);
      return null;
    }
  }

  // Create a review for a completed contract
  async createReview(
    reviewData: {
      projectId: string;
      reviewerId: string;
      recipientId: string;
      rating: number;
      comment: string;
    }
  ): Promise<Review | null> {
    try {
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const review = await this.databases.createDocument(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_JOBS_ID,
        env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_REVIEWS_ID,
        ID.unique(),
        {
          ...reviewData,
          createdAt: new Date().toISOString()
        }
      );
      
      return review as Review;
    } catch (error) {
      console.error('Error creating review:', error);
      return null;
    }
  }

  // Get reviews for a specific user
  async getUserReviews(userId: string): Promise<Review[]> {
    try {
      const reviews = await this.databases.listDocuments(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_JOBS_ID,
        env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_REVIEWS_ID,
        [
          Query.equal('recipientId', userId),
          Query.orderDesc('$createdAt')
        ]
      );
      
      return reviews.documents as Review[];
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return [];
    }
  }

  // Get average rating for a user
  async getUserRating(userId: string): Promise<{ average: number; count: number }> {
    try {
      const reviews = await this.getUserReviews(userId);
      
      if (reviews.length === 0) {
        return { average: 0, count: 0 };
      }
      
      const total = reviews.reduce((sum, review) => sum + review.rating, 0);
      const average = total / reviews.length;
      
      return {
        average: parseFloat(average.toFixed(1)),
        count: reviews.length
      };
    } catch (error) {
      console.error('Error calculating user rating:', error);
      return { average: 0, count: 0 };
    }
  }
}

export const contractService = new ContractService();