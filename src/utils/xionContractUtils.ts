/**
 * Xion contract utility functions for Web3Lancer
 * Contains functions to interact with the Xion contract for voting and other functionalities
 */

import { WEB3LANCER_CONTRACTS } from './contractUtils';

// Xion contract address from configuration
export const getXionContractAddress = (): string => {
  return WEB3LANCER_CONTRACTS.XION.CONTRACT_ID;
};

// Types for dispute data
export interface Dispute {
  id: number;
  projectId: number;
  created?: string;
  status: 'Active' | 'Resolved';
  reason?: string;
  votesForClient: number;
  votesForFreelancer: number;
  winner?: 'client' | 'freelancer';
}

// Query message to get a specific dispute by project ID
export const getDisputeMsg = (projectId: number) => {
  return {
    get_dispute: {
      project_id: projectId
    }
  };
};

// Query message to get all active disputes
export const getActiveDisputesMsg = () => {
  return {
    get_active_disputes: {}
  };
};

// Query message to get votes for a specific dispute
export const getDisputeVotesMsg = (projectId: number) => {
  return {
    get_dispute_votes: {
      project_id: projectId
    }
  };
};

// Query message to check if a user has voted on a dispute
export const hasUserVotedMsg = (projectId: number, address: string) => {
  return {
    has_voted: {
      project_id: projectId,
      voter: address
    }
  };
};

// Execute message to vote on a dispute
export const voteOnDisputeMsg = (projectId: number, voteForClient: boolean) => {
  return {
    vote: {
      project_id: projectId,
      vote_for_client: voteForClient
    }
  };
};

// Execute message to create a new dispute
export const createDisputeMsg = (projectId: number, reason: string) => {
  return {
    create_dispute: {
      project_id: projectId,
      reason: reason
    }
  };
};

// Execute message to resolve a dispute
export const resolveDisputeMsg = (projectId: number, winnerIsClient: boolean) => {
  return {
    resolve_dispute: {
      project_id: projectId,
      winner_is_client: winnerIsClient
    }
  };
};