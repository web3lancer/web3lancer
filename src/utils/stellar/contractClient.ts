import { Contract, SorobanRpc } from '@stellar/stellar-sdk';

// Contract configuration
const CONTRACT_ID = 'CDFJTPECWESQLM4NCVBD3VQZ2VMOL7LOK6EEJHTJ3MM4OFNNNJORB5HN';
const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';

// Initialize the Soroban RPC client
const rpc = new SorobanRpc.Server(SOROBAN_RPC_URL, { allowHttp: true });

/**
 * StellarContractClient provides methods to interact with the reputation system smart contract
 */
class StellarContractClient {
  private contract: Contract;

  constructor() {
    this.contract = new Contract(CONTRACT_ID);
  }

  /**
   * Submit a review for a freelancer or client
   * @param reviewerId - ID of the reviewer (client or freelancer)
   * @param targetId - ID of the person being reviewed
   * @param projectId - ID of the project/job
   * @param rating - Numerical rating (1-5)
   * @param comment - Text comment
   */
  async submitReview(
    reviewerId: string,
    targetId: string,
    projectId: string,
    rating: number,
    comment: string
  ): Promise<string> {
    try {
      // Validate inputs
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      // Call the contract method
      const operation = this.contract.call(
        "submit_review",
        [reviewerId, targetId, projectId, rating, comment]
      );

      // Simulate to check for errors before submitting
      const simulateResult = await rpc.simulateTransaction(operation);
      
      if (!simulateResult.result) {
        throw new Error('Contract simulation failed');
      }

      // Return transaction hash (in a real implementation, we would submit the transaction)
      return `Simulated review submission successfully: ${simulateResult.transactionData}`;
    } catch (error) {
      console.error('Error submitting review to contract:', error);
      throw error;
    }
  }

  /**
   * Get the reputation score for a user
   * @param userId - ID of the user to get reputation for
   */
  async getReputationScore(userId: string): Promise<number> {
    try {
      // Call the contract method
      const operation = this.contract.call("get_reputation_score", [userId]);
      
      // Simulate the transaction
      const simulateResult = await rpc.simulateTransaction(operation);
      
      if (!simulateResult.result) {
        throw new Error('Failed to retrieve reputation score');
      }
      
      // Parse the result (if we had the actual contract, we would parse the specific return type)
      return parseFloat(simulateResult.result.retval || '0');
    } catch (error) {
      console.error('Error getting reputation score:', error);
      return 0; // Default to 0 if there's an error
    }
  }

  /**
   * Dispute a review
   * @param disputerId - ID of the person disputing the review
   * @param reviewId - ID of the review being disputed
   * @param reason - Reason for the dispute
   */
  async disputeReview(
    disputerId: string,
    reviewId: string,
    reason: string
  ): Promise<string> {
    try {
      // Call the contract method
      const operation = this.contract.call(
        "dispute_review",
        [disputerId, reviewId, reason]
      );

      // Simulate to check for errors
      const simulateResult = await rpc.simulateTransaction(operation);
      
      if (!simulateResult.result) {
        throw new Error('Contract simulation failed');
      }

      // Return transaction hash
      return `Simulated dispute submission successfully: ${simulateResult.transactionData}`;
    } catch (error) {
      console.error('Error disputing review:', error);
      throw error;
    }
  }

  /**
   * Get reviews for a user
   * @param userId - ID of the user to get reviews for
   */
  async getUserReviews(userId: string): Promise<any[]> {
    try {
      // Call the contract method
      const operation = this.contract.call("get_user_reviews", [userId]);
      
      // Simulate the transaction
      const simulateResult = await rpc.simulateTransaction(operation);
      
      if (!simulateResult.result) {
        throw new Error('Failed to retrieve user reviews');
      }
      
      // Parse the result (mock implementation)
      return [
        {
          reviewId: 'r1',
          reviewerId: 'user123',
          rating: 4,
          comment: 'Great work, delivered on time',
          timestamp: Date.now() - 86400000 * 3 // 3 days ago
        },
        {
          reviewId: 'r2',
          reviewerId: 'user456',
          rating: 5,
          comment: 'Excellent communication and quality',
          timestamp: Date.now() - 86400000 * 10 // 10 days ago
        }
      ];
    } catch (error) {
      console.error('Error getting user reviews:', error);
      return []; // Return empty array if there's an error
    }
  }
}

// Export a singleton instance
export const contractClient = new StellarContractClient();
