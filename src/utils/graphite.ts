import { getGraphiteService } from '@/services/graphiteService';

// Graphite Network Trust Score Integration
// Based on Graphite's reputation-based PoA Layer 1 blockchain

interface GraphiteTrustScore {
  address: string;
  trustScore: number; // 0-100 scale
  kycVerified: boolean;
  behavioralScore: number;
  lastUpdated: string;
}

interface GraphiteApiResponse {
  success: boolean;
  data?: GraphiteTrustScore;
  error?: string;
}

export class GraphiteReputationService {
  private apiBaseUrl: string;
  private apiKey: string;

  constructor() {
    // These would be provided by Graphite during hackathon
    this.apiBaseUrl = process.env.NEXT_PUBLIC_GRAPHITE_API_URL || 'https://api.graphite.network';
    this.apiKey = process.env.NEXT_PUBLIC_GRAPHITE_API_KEY || '';
  }

  /**
   * Fetch trust score from Graphite Network
   * Integrates with existing reputation system
   */
  async getTrustScore(walletAddress: string): Promise<GraphiteTrustScore | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/trust-score/${walletAddress}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const result: GraphiteApiResponse = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching Graphite trust score:', error);
      return null;
    }
  }

  /**
   * Combine Graphite trust score with existing Web3Lancer reputation
   * Creates a hybrid reputation system
   */
  async getHybridReputationScore(userId: string, walletAddress?: string): Promise<number> {
    try {
      // Get existing Web3Lancer reputation (0-5 scale)
      const stellarReputation = await this.getExistingStellarReputation(userId);
      
      // Get Graphite trust score if wallet provided
      let graphiteTrust = 0;
      if (walletAddress) {
        const trustData = await this.getTrustScore(walletAddress);
        graphiteTrust = trustData ? trustData.trustScore / 20 : 0; // Convert 0-100 to 0-5
      }

      // Weighted combination: 70% existing reputation, 30% Graphite trust
      const hybridScore = (stellarReputation * 0.7) + (graphiteTrust * 0.3);
      
      return Math.min(5, Math.max(0, hybridScore));
    } catch (error) {
      console.error('Error calculating hybrid reputation:', error);
      return 0;
    }
  }

  /**
   * Check if user meets compliance requirements for high-value transactions
   * Implements Graphite's KYC and behavioral verification
   */
  async isEligibleForHighValueTransaction(walletAddress: string, amount: number): Promise<boolean> {
    const trustData = await this.getTrustScore(walletAddress);
    
    if (!trustData) return false;

    // High-value transaction requirements
    const HIGH_VALUE_THRESHOLD = 10000; // $10k USD equivalent
    
    if (amount >= HIGH_VALUE_THRESHOLD) {
      return trustData.kycVerified && trustData.trustScore >= 70;
    }
    
    // Medium transactions require basic trust score
    return trustData.trustScore >= 50;
  }

  private async getExistingStellarReputation(userId: string): Promise<number> {
    // Integration with existing reputation system
    // This calls your existing Stellar-based reputation
    try {
      // Placeholder for actual integration with existing system
      return 4.2; // This would fetch from your existing reputation system
    } catch (error) {
      return 0;
    }
  }
}

export const graphiteService = new GraphiteReputationService();

// Importing and using Graphite service in utils/graphite.ts


// Configuration for Graphite nodes
const GRAPHITE_CONFIG = {
  nodeUrl: process.env.NEXT_PUBLIC_GRAPHITE_NODE_URL || 'https://testnet.atgraphite.com',
  privateKey: process.env.GRAPHITE_PRIVATE_KEY || undefined
};

/**
 * Initialize Graphite service with configuration
 */
export const initializeGraphite = async (privateKey?: string) => {
  const service = getGraphiteService(GRAPHITE_CONFIG);
  await service.initialize(privateKey);
  return service;
};

/**
 * Get user's trust score for reputation-based features
 */
export const getUserTrustScore = async (address?: string) => {
  try {
    const service = getGraphiteService();
    const reputation = await service.getReputation(address);
    return {
      score: reputation.score,
      level: reputation.level,
      isVerified: reputation.isActivated && reputation.kycLevel > 0,
      compliance: {
        activated: reputation.isActivated,
        kycLevel: reputation.kycLevel
      }
    };
  } catch (error) {
    console.error('Error getting trust score:', error);
    return {
      score: 0,
      level: 'New',
      isVerified: false,
      compliance: {
        activated: false,
        kycLevel: 0
      }
    };
  }
};

/**
 * Check if user can access premium features based on trust
 */
export const canAccessPremiumFeatures = async (address?: string): Promise<boolean> => {
  try {
    const service = getGraphiteService();
    return await service.meetsMinimumTrust(address, 3.5); // Require 3.5+ score
  } catch (error) {
    console.error('Error checking premium access:', error);
    return false;
  }
};

/**
 * Check if user can post jobs (compliance check)
 */
export const canPostJobs = async (address?: string): Promise<boolean> => {
  try {
    const service = getGraphiteService();
    return await service.isCompliant(address, 1); // Require KYC level 1+
  } catch (error) {
    console.error('Error checking job posting permission:', error);
    return false;
  }
};

/**
 * Get activation requirements for new users
 */
export const getActivationRequirements = async () => {
  try {
    const service = getGraphiteService();
    const fee = await service.getActivationFee();
    return {
      required: true,
      fee,
      currency: 'ETH'
    };
  } catch (error) {
    console.error('Error getting activation requirements:', error);
    return {
      required: true,
      fee: '0',
      currency: 'ETH'
    };
  }
};

/**
 * Activate user account on Graphite Network
 */
export const activateUserAccount = async () => {
  try {
    const service = getGraphiteService();
    return await service.activateAccount();
  } catch (error) {
    console.error('Error activating account:', error);
    throw error;
  }
};

export { getGraphiteService };
