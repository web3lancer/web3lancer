import { AppwriteService } from './appwriteService';
import {
  GOVERNANCE_DATABASE_ID,
  CONTRACT_DISPUTES_COLLECTION_ID,
  DISPUTE_VOTES_COLLECTION_ID
} from '@/lib/env';
import { Dispute, Vote } from '@/types/governance';
import { ID, Query } from 'appwrite';

class DisputeService {
  private databaseId: string;
  private disputesCollectionId: string;
  private votesCollectionId: string;

  constructor(private appwrite: AppwriteService) {
    this.databaseId = GOVERNANCE_DATABASE_ID;
    this.disputesCollectionId = CONTRACT_DISPUTES_COLLECTION_ID;
    this.votesCollectionId = DISPUTE_VOTES_COLLECTION_ID;
  }

  async createDispute(data: Omit<Dispute, '$id' | '$createdAt' | '$updatedAt'>): Promise<Dispute | null> {
    try {
      return this.appwrite.createDocument<Dispute>(
        this.databaseId,
        this.disputesCollectionId,
        ID.unique(),
        data
      );
    } catch (error) {
      console.error("Error creating dispute:", error);
      return null;
    }
  }

  async getDispute(disputeId: string): Promise<Dispute | null> {
    try {
      return this.appwrite.getDocument<Dispute>(
        this.databaseId,
        this.disputesCollectionId,
        disputeId
      );
    } catch (error) {
      console.error("Error fetching dispute:", error);
      return null;
    }
  }

  async listDisputesByUser(userId: string, role: 'claimant' | 'defendant'): Promise<Dispute[]> {
    try {
      const queryField = role === 'claimant' ? 'claimantId' : 'defendantId';
      const response = await this.appwrite.listDocuments<{ documents: Dispute[] }>(
        this.databaseId,
        this.disputesCollectionId,
        [
          Query.equal(queryField, userId),
          Query.orderDesc('$createdAt')
        ]
      );
      return response.documents;
    } catch (error) {
      console.error(`Error fetching disputes for ${role}:`, error);
      return [];
    }
  }

  async listOpenDisputes(limit: number = 20, offset: number = 0): Promise<Dispute[]> {
    try {
      const response = await this.appwrite.listDocuments<{ documents: Dispute[] }>(
        this.databaseId,
        this.disputesCollectionId,
        [
          Query.equal('status', 'open'),
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
          Query.offset(offset)
        ]
      );
      return response.documents;
    } catch (error) {
      console.error("Error fetching open disputes:", error);
      return [];
    }
  }

  async updateDisputeStatus(disputeId: string, status: Dispute['status'], resolutionDetails?: string): Promise<Dispute | null> {
    try {
      const updateData: Partial<Dispute> = { status };
      
      if (resolutionDetails && ['resolved', 'closed'].includes(status)) {
        updateData.resolutionDetails = resolutionDetails;
        updateData.resolvedAt = new Date().toISOString();
      }
      
      return this.appwrite.updateDocument<Dispute>(
        this.databaseId,
        this.disputesCollectionId,
        disputeId,
        updateData
      );
    } catch (error) {
      console.error("Error updating dispute status:", error);
      return null;
    }
  }

  async assignModerator(disputeId: string, moderatorId: string): Promise<Dispute | null> {
    try {
      return this.appwrite.updateDocument<Dispute>(
        this.databaseId,
        this.disputesCollectionId,
        disputeId,
        { 
          assignedModeratorId: moderatorId,
          status: 'under_review' 
        }
      );
    } catch (error) {
      console.error("Error assigning moderator to dispute:", error);
      return null;
    }
  }

  // Vote management
  async castVote(data: Omit<Vote, '$id' | '$createdAt'>): Promise<Vote | null> {
    try {
      // Check if user has already voted
      const existingVote = await this.checkExistingVote(
        data.voterId,
        data.targetId,
        data.targetType
      );
      
      if (existingVote) {
        throw new Error(`User ${data.voterId} has already voted on this ${data.targetType}`);
      }
      
      return this.appwrite.createDocument<Vote>(
        this.databaseId,
        this.votesCollectionId,
        ID.unique(),
        data
      );
    } catch (error) {
      console.error("Error casting vote:", error);
      return null;
    }
  }

  async getVoteResults(targetId: string, targetType: 'dispute'): Promise<Record<string, number>> {
    try {
      const response = await this.appwrite.listDocuments<{ documents: Vote[] }>(
        this.databaseId,
        this.votesCollectionId,
        [
          Query.equal('targetId', targetId),
          Query.equal('targetType', targetType)
        ]
      );
      
      // Count votes by option
      const results: Record<string, number> = {};
      
      response.documents.forEach(vote => {
        if (!results[vote.voteOption]) {
          results[vote.voteOption] = 0;
        }
        results[vote.voteOption]++;
      });
      
      return results;
    } catch (error) {
      console.error("Error getting vote results:", error);
      return {};
    }
  }

  private async checkExistingVote(voterId: string, targetId: string, targetType: Vote['targetType']): Promise<boolean> {
    try {
      const response = await this.appwrite.listDocuments<{ documents: Vote[], total: number }>(
        this.databaseId,
        this.votesCollectionId,
        [
          Query.equal('voterId', voterId),
          Query.equal('targetId', targetId),
          Query.equal('targetType', targetType),
          Query.limit(1)
        ]
      );
      
      return response.total > 0;
    } catch (error) {
      console.error("Error checking existing vote:", error);
      return false;
    }
  }
}

export default DisputeService;