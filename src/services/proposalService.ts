import { AppwriteService } from '@/services/appwriteService';
import {
  GOVERNANCE_DATABASE_ID,
  PLATFORM_PROPOSALS_COLLECTION_ID,
  DISPUTE_VOTES_COLLECTION_ID
} from '@/lib/env';
import { PlatformProposal, Vote } from '@/types/governance';
import { ID, Query } from 'appwrite';

class ProposalService {
  private databaseId: string;
  private proposalsCollectionId: string;
  private votesCollectionId: string;

  constructor(private appwrite: AppwriteService) {
    this.databaseId = GOVERNANCE_DATABASE_ID;
    this.proposalsCollectionId = PLATFORM_PROPOSALS_COLLECTION_ID;
    this.votesCollectionId = DISPUTE_VOTES_COLLECTION_ID;
  }

  async createProposal(data: Omit<PlatformProposal, '$id' | '$createdAt' | '$updatedAt' | 'yesVotes' | 'noVotes' | 'abstainVotes'>): Promise<PlatformProposal | null> {
    try {
      const proposalData = {
        ...data,
        status: 'draft',
        yesVotes: 0,
        noVotes: 0,
        abstainVotes: 0
      };
      
      return this.appwrite.createDocument<PlatformProposal>(
        this.databaseId,
        this.proposalsCollectionId,
        ID.unique(),
        proposalData
      );
    } catch (error) {
      console.error("Error creating proposal:", error);
      return null;
    }
  }

  async getProposal(proposalId: string): Promise<PlatformProposal | null> {
    try {
      return this.appwrite.getDocument<PlatformProposal>(
        this.databaseId,
        this.proposalsCollectionId,
        proposalId
      );
    } catch (error) {
      console.error("Error fetching proposal:", error);
      return null;
    }
  }

  async listProposals(status?: PlatformProposal['status'], limit: number = 20, offset: number = 0): Promise<PlatformProposal[]> {
    try {
      const queries = [
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
        Query.offset(offset)
      ];
      
      if (status) {
        queries.unshift(Query.equal('status', status));
      }
      
      const response = await this.appwrite.listDocuments<{ documents: PlatformProposal[] }>(
        this.databaseId,
        this.proposalsCollectionId,
        queries
      );
      
      return response.documents;
    } catch (error) {
      console.error("Error listing proposals:", error);
      return [];
    }
  }

  async listProposalsByUser(userId: string): Promise<PlatformProposal[]> {
    try {
      const response = await this.appwrite.listDocuments<{ documents: PlatformProposal[] }>(
        this.databaseId,
        this.proposalsCollectionId,
        [
          Query.equal('proposerId', userId),
          Query.orderDesc('$createdAt')
        ]
      );
      return response.documents;
    } catch (error) {
      console.error("Error listing user proposals:", error);
      return [];
    }
  }

  async updateProposalStatus(proposalId: string, status: PlatformProposal['status']): Promise<PlatformProposal | null> {
    try {
      const proposal = await this.getProposal(proposalId);
      if (!proposal) {
        throw new Error(`Proposal ${proposalId} not found`);
      }
      
      const updateData: Partial<PlatformProposal> = { status };
      
      // Add voting start/end dates if moving to voting phase
      if (status === 'voting' && proposal.status !== 'voting') {
        const now = new Date();
        const votingEndDate = new Date();
        votingEndDate.setDate(now.getDate() + 7); // 7-day voting period
        
        updateData.votingStartDate = now.toISOString();
        updateData.votingEndDate = votingEndDate.toISOString();
      }
      
      return this.appwrite.updateDocument<PlatformProposal>(
        this.databaseId,
        this.proposalsCollectionId,
        proposalId,
        updateData
      );
    } catch (error) {
      console.error("Error updating proposal status:", error);
      return null;
    }
  }

  async castVote(proposalId: string, voterId: string, voteOption: 'yes' | 'no' | 'abstain'): Promise<Vote | null> {
    try {
      // Check if proposal is in voting phase
      const proposal = await this.getProposal(proposalId);
      if (!proposal || proposal.status !== 'voting') {
        throw new Error(`Proposal ${proposalId} is not in voting phase`);
      }
      
      // Check if voting period has ended
      if (proposal.votingEndDate && new Date(proposal.votingEndDate) < new Date()) {
        throw new Error(`Voting period for proposal ${proposalId} has ended`);
      }
      
      // Check if user has already voted
      const hasVoted = await this.checkUserVoted(proposalId, voterId);
      if (hasVoted) {
        throw new Error(`User ${voterId} has already voted on proposal ${proposalId}`);
      }
      
      // Cast vote
      const vote = await this.appwrite.createDocument<Vote>(
        this.databaseId,
        this.votesCollectionId,
        ID.unique(),
        {
          targetId: proposalId,
          targetType: 'platform_proposal',
          voterId,
          voteOption
        }
      );
      
      // Update vote counts on proposal
      if (vote) {
        await this.updateVoteCount(proposalId, voteOption);
      }
      
      return vote;
    } catch (error) {
      console.error("Error casting vote on proposal:", error);
      return null;
    }
  }

  private async checkUserVoted(proposalId: string, voterId: string): Promise<boolean> {
    try {
      const response = await this.appwrite.listDocuments<{ documents: Vote[], total: number }>(
        this.databaseId,
        this.votesCollectionId,
        [
          Query.equal('targetId', proposalId),
          Query.equal('targetType', 'platform_proposal'),
          Query.equal('voterId', voterId),
          Query.limit(1)
        ]
      );
      
      return response.total > 0;
    } catch (error) {
      console.error("Error checking if user voted:", error);
      return false;
    }
  }

  private async updateVoteCount(proposalId: string, voteOption: 'yes' | 'no' | 'abstain'): Promise<void> {
    try {
      const proposal = await this.getProposal(proposalId);
      if (!proposal) return;
      
      const voteCountField = voteOption === 'yes' ? 'yesVotes' : 
                             voteOption === 'no' ? 'noVotes' : 'abstainVotes';
      
      const currentCount = proposal[voteCountField] || 0;
      
      await this.appwrite.updateDocument<PlatformProposal>(
        this.databaseId,
        this.proposalsCollectionId,
        proposalId,
        { [voteCountField]: currentCount + 1 }
      );
    } catch (error) {
      console.error("Error updating vote count:", error);
    }
  }
}

export default ProposalService;