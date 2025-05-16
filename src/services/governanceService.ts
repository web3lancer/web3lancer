import BaseService from './baseService';
import { AppwriteService, ID, Query } from './appwriteService';
import { EnvConfig } from '@/config/environment';
import { Dispute, GovernanceProposal, GovernanceVote } from '@/types/governance';

/**
 * GovernanceService - Handles all governance related operations
 * 
 * This service manages disputes, governance proposals, and votes for
 * platform governance.
 */
class GovernanceService extends BaseService {
  constructor(
    protected appwrite: AppwriteService,
    protected config: EnvConfig
  ) {
    super(appwrite, config);
  }

  // Disputes
  async createDispute(data: Omit<Dispute, '$id' | '$createdAt' | '$updatedAt'>): Promise<Dispute> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.createDocument<Dispute>(
          this.config.governance.databaseId,
          this.config.governance.disputesCollectionId,
          ID.unique(),
          data
        );
      },
      'createDispute'
    );
  }

  async getDispute(disputeId: string): Promise<Dispute | null> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.getDocument<Dispute>(
          this.config.governance.databaseId,
          this.config.governance.disputesCollectionId,
          disputeId
        );
      },
      'getDispute'
    );
  }

  async listDisputes(queries: string[] = []): Promise<Dispute[]> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.listDocuments<Dispute>(
          this.config.governance.databaseId,
          this.config.governance.disputesCollectionId,
          queries
        );
      },
      'listDisputes'
    );
  }

  async updateDispute(disputeId: string, data: Partial<Dispute>): Promise<Dispute> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.updateDocument<Dispute>(
          this.config.governance.databaseId,
          this.config.governance.disputesCollectionId,
          disputeId,
          data
        );
      },
      'updateDispute'
    );
  }

  // Governance Proposals
  async createProposal(data: Omit<GovernanceProposal, '$id' | '$createdAt' | '$updatedAt'>): Promise<GovernanceProposal> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.createDocument<GovernanceProposal>(
          this.config.governance.databaseId,
          this.config.governance.proposalsCollectionId,
          ID.unique(),
          data
        );
      },
      'createProposal'
    );
  }

  async getProposal(proposalId: string): Promise<GovernanceProposal | null> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.getDocument<GovernanceProposal>(
          this.config.governance.databaseId,
          this.config.governance.proposalsCollectionId,
          proposalId
        );
      },
      'getProposal'
    );
  }

  async listProposals(queries: string[] = []): Promise<GovernanceProposal[]> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.listDocuments<GovernanceProposal>(
          this.config.governance.databaseId,
          this.config.governance.proposalsCollectionId,
          queries
        );
      },
      'listProposals'
    );
  }

  async updateProposal(proposalId: string, data: Partial<GovernanceProposal>): Promise<GovernanceProposal> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.updateDocument<GovernanceProposal>(
          this.config.governance.databaseId,
          this.config.governance.proposalsCollectionId,
          proposalId,
          data
        );
      },
      'updateProposal'
    );
  }

  // Governance Votes
  async castVote(data: Omit<GovernanceVote, '$id' | '$createdAt' | '$updatedAt'>): Promise<GovernanceVote> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.createDocument<GovernanceVote>(
          this.config.governance.databaseId,
          this.config.governance.votesCollectionId,
          ID.unique(),
          data
        );
      },
      'castVote'
    );
  }

  async getVote(voteId: string): Promise<GovernanceVote | null> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.getDocument<GovernanceVote>(
          this.config.governance.databaseId,
          this.config.governance.votesCollectionId,
          voteId
        );
      },
      'getVote'
    );
  }

  async listVotes(queries: string[] = []): Promise<GovernanceVote[]> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.listDocuments<GovernanceVote>(
          this.config.governance.databaseId,
          this.config.governance.votesCollectionId,
          queries
        );
      },
      'listVotes'
    );
  }

  async getUserVoteOnProposal(proposalId: string, userId: string): Promise<GovernanceVote | null> {
    return this.handleRequest(
      async () => {
        const votes = await this.appwrite.listDocuments<GovernanceVote>(
          this.config.governance.databaseId,
          this.config.governance.votesCollectionId,
          [
            Query.equal('proposalId', proposalId),
            Query.equal('voterId', userId)
          ]
        );
        
        return votes.length > 0 ? votes[0] : null;
      },
      'getUserVoteOnProposal'
    );
  }
}

export default GovernanceService;
