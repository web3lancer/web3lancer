/**
 * Xion contract utility functions for Web3Lancer
 * Contains functions to interact with the Xion contract for voting and other functionalities
 */

import { WEB3LANCER_CONTRACTS } from './contractUtils';

export interface Dispute {
  id: number;
  projectId: number;
  clientAddress: string;
  freelancerAddress: string;
  reason: string;
  status: 'Active' | 'Resolved' | 'Cancelled';
  votesForClient: number;
  votesForFreelancer: number;
  created: string;
  resolved?: string;
}

export interface VoteData {
  voter: string;
  projectId: number;
  voteForClient: boolean; // true = vote for client, false = vote for freelancer
  timestamp: string;
}

/**
 * Create a query message for getting all active disputes
 */
export const getActiveDisputesMsg = () => ({ get_active_disputes: {} });

/**
 * Create a query message for getting a specific dispute
 */
export const getDisputeMsg = (projectId: number) => ({ get_dispute: { project_id: projectId } });

/**
 * Create a query message for getting votes for a specific dispute
 */
export const getDisputeVotesMsg = (projectId: number) => ({ get_dispute_votes: { project_id: projectId } });

/**
 * Create a query message for checking if a user has already voted
 */
export const hasUserVotedMsg = (projectId: number, userAddress: string) => ({ 
  has_user_voted: { project_id: projectId, user: userAddress } 
});

/**
 * Create an execute message for voting on a dispute
 */
export const voteOnDisputeMsg = (projectId: number, voteForClient: boolean) => ({ 
  vote_on_dispute: { project_id: projectId, vote_for_client: voteForClient } 
});

/**
 * Create an execute message for creating a dispute
 */
export const createDisputeMsg = (projectId: number, reason: string) => ({
  create_dispute: { project_id: projectId, reason }
});

/**
 * Get the Xion contract address from contractUtils
 */
export const getXionContractAddress = () => {
  return WEB3LANCER_CONTRACTS.XION?.CONTRACT_ID;
};