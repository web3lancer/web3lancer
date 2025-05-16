import { AppwriteService } from '@/services/appwriteService';
import {
    GOVERNANCE_DATABASE_ID,
    DISPUTES_COLLECTION_ID,
    GOVERNANCE_PROPOSALS_COLLECTION_ID,
    GOVERNANCE_VOTES_COLLECTION_ID
} from '@/lib/env';
import { Dispute, GovernanceProposal, GovernanceVote } from '@/types/governance';
import { ID, Query } from 'appwrite';

class GovernanceService {
    private databaseId: string;
    private disputesCollectionId: string;
    private proposalsCollectionId: string;
    private votesCollectionId: string;

    constructor(private appwrite: AppwriteService) {
        this.databaseId = GOVERNANCE_DATABASE_ID;
        this.disputesCollectionId = DISPUTES_COLLECTION_ID;
        this.proposalsCollectionId = GOVERNANCE_PROPOSALS_COLLECTION_ID;
        this.votesCollectionId = GOVERNANCE_VOTES_COLLECTION_ID;
    }

    // Disputes
    async createDispute(data: Omit<Dispute, '$id' | '$createdAt' | '$updatedAt'>): Promise<Dispute> {
        return this.appwrite.createDocument<Dispute>(this.databaseId, this.disputesCollectionId, ID.unique(), data);
    }

    async getDispute(disputeId: string): Promise<Dispute | null> {
        return this.appwrite.getDocument<Dispute>(this.databaseId, this.disputesCollectionId, disputeId);
    }

    async listDisputes(queries: string[] = []): Promise<Dispute[]> {
        return this.appwrite.listDocuments<Dispute>(this.databaseId, this.disputesCollectionId, queries);
    }

    async updateDispute(disputeId: string, data: Partial<Dispute>): Promise<Dispute> {
        return this.appwrite.updateDocument<Dispute>(this.databaseId, this.disputesCollectionId, disputeId, data);
    }

    // Governance Proposals
    async createProposal(data: Omit<GovernanceProposal, '$id' | '$createdAt' | '$updatedAt'>): Promise<GovernanceProposal> {
        return this.appwrite.createDocument<GovernanceProposal>(this.databaseId, this.proposalsCollectionId, ID.unique(), data);
    }

    async getProposal(proposalId: string): Promise<GovernanceProposal | null> {
        return this.appwrite.getDocument<GovernanceProposal>(this.databaseId, this.proposalsCollectionId, proposalId);
    }

    async listProposals(queries: string[] = []): Promise<GovernanceProposal[]> {
        return this.appwrite.listDocuments<GovernanceProposal>(this.databaseId, this.proposalsCollectionId, queries);
    }

    async updateProposal(proposalId: string, data: Partial<GovernanceProposal>): Promise<GovernanceProposal> {
        return this.appwrite.updateDocument<GovernanceProposal>(this.databaseId, this.proposalsCollectionId, proposalId, data);
    }

    // Governance Votes
    async castVote(data: Omit<GovernanceVote, '$id' | '$createdAt' | '$updatedAt'>): Promise<GovernanceVote> {
        return this.appwrite.createDocument<GovernanceVote>(this.databaseId, this.votesCollectionId, ID.unique(), data);
    }

    async getVote(voteId: string): Promise<GovernanceVote | null> {
        return this.appwrite.getDocument<GovernanceVote>(this.databaseId, this.votesCollectionId, voteId);
    }

    async listVotes(queries: string[] = []): Promise<GovernanceVote[]> {
        return this.appwrite.listDocuments<GovernanceVote>(this.databaseId, this.votesCollectionId, queries);
    }

    async getUserVoteOnProposal(proposalId: string, userId: string): Promise<GovernanceVote | null> {
        const votes = await this.appwrite.listDocuments<GovernanceVote>(
            this.databaseId,
            this.votesCollectionId,
            [
                Query.equal('proposalId', proposalId),
                Query.equal('voterId', userId)
            ]
        );
        
        return votes.length > 0 ? votes[0] : null;
    }
}

export default GovernanceService;
