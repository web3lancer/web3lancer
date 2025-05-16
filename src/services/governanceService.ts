import { AppwriteService, ID, Query } from './appwriteService';
import { EnvService } from './envService';
import { Dispute, DisputeVote, Proposal } from '@/types/governance';

/**
 * Governance Service for managing disputes, dispute votes, and platform proposals
 * Follows best practices from Cross-Cutting Concerns section
 */
class GovernanceService {
  private databaseId: string;
  private disputesCollectionId: string;
  private disputeVotesCollectionId: string;
  private proposalsCollectionId: string;
  
  constructor(
    private appwrite: AppwriteService,
    private env: EnvService<'governance'>
  ) {
    this.databaseId = this.env.databaseId;
    this.disputesCollectionId = this.env.get('collectionContractDisputes');
    this.disputeVotesCollectionId = this.env.get('collectionDisputeVotes');
    this.proposalsCollectionId = this.env.get('collectionPlatformProposals');
  }

  // Disputes
  async createDispute(data: {
    contractId: string;
    creatorId: string;
    respondentId: string;
    reason: string;
    description: string;
    evidenceFileIds?: string[];
    requestedResolution: string;
  }): Promise<Dispute> {
    return this.appwrite.createDocument<Dispute>(
      this.databaseId,
      this.disputesCollectionId,
      ID.unique(),
      {
        ...data,
        status: 'pending_review',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        outcome: null,
        resolution: null,
        resolvedAt: null,
        votingStartsAt: null,
        votingEndsAt: null
      }
    );
  }

  async getDispute(disputeId: string): Promise<Dispute | null> {
    return this.appwrite.getDocument<Dispute>(
      this.databaseId,
      this.disputesCollectionId,
      disputeId
    );
  }

  async updateDispute(disputeId: string, data: Partial<Dispute>): Promise<Dispute> {
    return this.appwrite.updateDocument<Dispute>(
      this.databaseId,
      this.disputesCollectionId,
      disputeId,
      {
        ...data,
        updatedAt: new Date().toISOString()
      }
    );
  }

  async listDisputes(queries: string[] = []): Promise<Dispute[]> {
    return this.appwrite.listDocuments<Dispute>(
      this.databaseId,
      this.disputesCollectionId,
      queries
    );
  }

  async getDisputesByUser(userId: string): Promise<Dispute[]> {
    return this.appwrite.listDocuments<Dispute>(
      this.databaseId,
      this.disputesCollectionId,
      [
        Query.equal('creatorId', userId),
        Query.orderDesc('createdAt')
      ]
    );
  }

  async getDisputesAgainstUser(userId: string): Promise<Dispute[]> {
    return this.appwrite.listDocuments<Dispute>(
      this.databaseId,
      this.disputesCollectionId,
      [
        Query.equal('respondentId', userId),
        Query.orderDesc('createdAt')
      ]
    );
  }

  async getDisputesByContract(contractId: string): Promise<Dispute[]> {
    return this.appwrite.listDocuments<Dispute>(
      this.databaseId,
      this.disputesCollectionId,
      [
        Query.equal('contractId', contractId),
        Query.orderDesc('createdAt')
      ]
    );
  }

  async getActiveDisputes(): Promise<Dispute[]> {
    return this.appwrite.listDocuments<Dispute>(
      this.databaseId,
      this.disputesCollectionId,
      [
        Query.notEqual('status', 'resolved'),
        Query.notEqual('status', 'closed'),
        Query.orderDesc('createdAt')
      ]
    );
  }

  async startVotingPeriod(disputeId: string, durationInDays = 7): Promise<Dispute> {
    const now = new Date();
    const votingEndsAt = new Date(now);
    votingEndsAt.setDate(now.getDate() + durationInDays);
    
    return this.updateDispute(disputeId, {
      status: 'voting',
      votingStartsAt: now.toISOString(),
      votingEndsAt: votingEndsAt.toISOString()
    });
  }

  async resolveDispute(disputeId: string, outcome: 'in_favor_of_creator' | 'in_favor_of_respondent' | 'compromise', resolution: string): Promise<Dispute> {
    return this.updateDispute(disputeId, {
      status: 'resolved',
      outcome,
      resolution,
      resolvedAt: new Date().toISOString()
    });
  }

  // Dispute Votes
  async voteOnDispute(data: {
    disputeId: string;
    voterId: string;
    vote: 'for_creator' | 'for_respondent' | 'abstain';
    reason?: string;
  }): Promise<DisputeVote> {
    // Check if user has already voted
    const existingVotes = await this.appwrite.listDocuments<DisputeVote>(
      this.databaseId,
      this.disputeVotesCollectionId,
      [
        Query.equal('disputeId', data.disputeId),
        Query.equal('voterId', data.voterId)
      ]
    );
    
    if (existingVotes.length > 0) {
      throw new Error('User has already voted on this dispute');
    }
    
    return this.appwrite.createDocument<DisputeVote>(
      this.databaseId,
      this.disputeVotesCollectionId,
      ID.unique(),
      {
        ...data,
        votedAt: new Date().toISOString()
      }
    );
  }

  async getDisputeVote(voteId: string): Promise<DisputeVote | null> {
    return this.appwrite.getDocument<DisputeVote>(
      this.databaseId,
      this.disputeVotesCollectionId,
      voteId
    );
  }

  async getUserVoteOnDispute(disputeId: string, voterId: string): Promise<DisputeVote | null> {
    const votes = await this.appwrite.listDocuments<DisputeVote>(
      this.databaseId,
      this.disputeVotesCollectionId,
      [
        Query.equal('disputeId', disputeId),
        Query.equal('voterId', voterId)
      ]
    );
    
    return votes.length > 0 ? votes[0] : null;
  }

  async getDisputeVotes(disputeId: string): Promise<DisputeVote[]> {
    return this.appwrite.listDocuments<DisputeVote>(
      this.databaseId,
      this.disputeVotesCollectionId,
      [
        Query.equal('disputeId', disputeId),
        Query.orderDesc('votedAt')
      ]
    );
  }

  async getDisputeVoteCounts(disputeId: string): Promise<{
    totalVotes: number;
    forCreator: number;
    forRespondent: number;
    abstain: number;
  }> {
    const votes = await this.getDisputeVotes(disputeId);
    
    return {
      totalVotes: votes.length,
      forCreator: votes.filter(v => v.vote === 'for_creator').length,
      forRespondent: votes.filter(v => v.vote === 'for_respondent').length,
      abstain: votes.filter(v => v.vote === 'abstain').length
    };
  }

  // Platform Proposals
  async createProposal(data: {
    creatorId: string;
    title: string;
    description: string;
    proposalType: 'feature' | 'policy' | 'improvement' | 'other';
    details: any;
  }): Promise<Proposal> {
    return this.appwrite.createDocument<Proposal>(
      this.databaseId,
      this.proposalsCollectionId,
      ID.unique(),
      {
        ...data,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        votingStartsAt: null,
        votingEndsAt: null,
        votesFor: 0,
        votesAgainst: 0,
        votesAbstain: 0,
        outcome: null,
        implementationDetails: null,
        implementedAt: null
      }
    );
  }

  async getProposal(proposalId: string): Promise<Proposal | null> {
    return this.appwrite.getDocument<Proposal>(
      this.databaseId,
      this.proposalsCollectionId,
      proposalId
    );
  }

  async updateProposal(proposalId: string, data: Partial<Proposal>): Promise<Proposal> {
    return this.appwrite.updateDocument<Proposal>(
      this.databaseId,
      this.proposalsCollectionId,
      proposalId,
      {
        ...data,
        updatedAt: new Date().toISOString()
      }
    );
  }

  async listProposals(queries: string[] = []): Promise<Proposal[]> {
    return this.appwrite.listDocuments<Proposal>(
      this.databaseId,
      this.proposalsCollectionId,
      queries
    );
  }

  async getProposalsByStatus(status: Proposal['status']): Promise<Proposal[]> {
    return this.appwrite.listDocuments<Proposal>(
      this.databaseId,
      this.proposalsCollectionId,
      [
        Query.equal('status', status),
        Query.orderDesc('createdAt')
      ]
    );
  }

  async publishProposal(proposalId: string): Promise<Proposal> {
    return this.updateProposal(proposalId, {
      status: 'open'
    });
  }

  async startProposalVoting(proposalId: string, durationInDays = 14): Promise<Proposal> {
    const now = new Date();
    const votingEndsAt = new Date(now);
    votingEndsAt.setDate(now.getDate() + durationInDays);
    
    return this.updateProposal(proposalId, {
      status: 'voting',
      votingStartsAt: now.toISOString(),
      votingEndsAt: votingEndsAt.toISOString()
    });
  }

  async voteOnProposal(proposalId: string, vote: 'for' | 'against' | 'abstain'): Promise<Proposal> {
    const proposal = await this.getProposal(proposalId);
    if (!proposal) throw new Error('Proposal not found');
    
    // In a real implementation, you would likely have a separate collection for votes
    // and check if the user has already voted
    
    let updates: Partial<Proposal> = {};
    if (vote === 'for') {
      updates.votesFor = (proposal.votesFor || 0) + 1;
    } else if (vote === 'against') {
      updates.votesAgainst = (proposal.votesAgainst || 0) + 1;
    } else {
      updates.votesAbstain = (proposal.votesAbstain || 0) + 1;
    }
    
    return this.updateProposal(proposalId, updates);
  }

  async closeProposalVoting(proposalId: string, passed: boolean): Promise<Proposal> {
    return this.updateProposal(proposalId, {
      status: passed ? 'approved' : 'rejected',
      outcome: passed ? 'passed' : 'failed'
    });
  }

  async implementProposal(proposalId: string, implementationDetails: string): Promise<Proposal> {
    return this.updateProposal(proposalId, {
      status: 'implemented',
      implementationDetails,
      implementedAt: new Date().toISOString()
    });
  }
}

export default GovernanceService;
