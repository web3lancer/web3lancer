import Web3 from 'web3';
import { GraphitePlugin } from '@atgraphite/web3-plugin';

interface GraphiteConfig {
  nodeUrl: string;
  privateKey?: string;
}

interface ReputationData {
  score: number;
  level: string;
  isActivated: boolean;
  kycLevel: number;
  lastUpdated: string;
}

interface KYCRequestData {
  uuid: string;
  level: number;
  status: 'pending' | 'approved' | 'rejected';
  fee: string;
}

export class GraphiteService {
  private web3: Web3;
  private config: GraphiteConfig;
  private isInitialized: boolean = false;

  constructor(config: GraphiteConfig) {
    this.config = config;
    this.web3 = new Web3(config.nodeUrl);
  }

  /**
   * Initialize Graphite plugin and register it with Web3
   */
  async initialize(privateKey?: string): Promise<void> {
    try {
      if (privateKey || this.config.privateKey) {
        const key = privateKey || this.config.privateKey!;
        this.web3.eth.accounts.wallet.add(key);
      }

      // Register Graphite plugin
      this.web3.registerPlugin(new GraphitePlugin(this.web3));
      this.isInitialized = true;
      
      console.log('Graphite service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Graphite service:', error);
      throw new Error(`Graphite initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if account is activated on Graphite Network
   */
  async isAccountActivated(address?: string): Promise<boolean> {
    this.ensureInitialized();
    try {
      return await (this.web3 as any).graphite.isActivated(address);
    } catch (error) {
      console.error('Error checking account activation:', error);
      return false;
    }
  }

  /**
   * Get activation fee amount
   */
  async getActivationFee(): Promise<string> {
    this.ensureInitialized();
    try {
      return await (this.web3 as any).graphite.getActivationFeeAmount();
    } catch (error) {
      console.error('Error getting activation fee:', error);
      throw error;
    }
  }

  /**
   * Activate account on Graphite Network
   */
  async activateAccount(): Promise<boolean> {
    this.ensureInitialized();
    try {
      await (this.web3 as any).graphite.activateAccount();
      console.log('Account activated successfully on Graphite Network');
      return true;
    } catch (error) {
      console.error('Error activating account:', error);
      throw new Error(`Account activation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user's reputation score from Graphite Network
   */
  async getReputation(address?: string): Promise<ReputationData> {
    this.ensureInitialized();
    try {
      const [reputation, kycLevel, isActivated] = await Promise.all([
        (this.web3 as any).graphite.getReputation(address),
        this.getKYCLevel(address),
        this.isAccountActivated(address)
      ]);

      return {
        score: reputation || 0,
        level: this.getReputationLevel(reputation || 0),
        isActivated,
        kycLevel,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting reputation:', error);
      throw new Error(`Failed to get reputation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get KYC level for address
   */
  async getKYCLevel(address?: string): Promise<number> {
    this.ensureInitialized();
    try {
      return await (this.web3 as any).graphite.getKycLevel(address);
    } catch (error) {
      console.error('Error getting KYC level:', error);
      return 0;
    }
  }

  /**
   * Create KYC request
   */
  async createKYCRequest(uuid: string, level: number): Promise<KYCRequestData> {
    this.ensureInitialized();
    try {
      const fee = await this.getKYCFee(level);
      await (this.web3 as any).graphite.createKYCRequest(uuid, level);
      
      return {
        uuid,
        level,
        status: 'pending',
        fee
      };
    } catch (error) {
      console.error('Error creating KYC request:', error);
      throw new Error(`KYC request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get KYC fee for specific level
   */
  async getKYCFee(level: number): Promise<string> {
    this.ensureInitialized();
    try {
      return await (this.web3 as any).graphite.getKYCFee(level);
    } catch (error) {
      console.error('Error getting KYC fee:', error);
      throw error;
    }
  }

  /**
   * Get last KYC request
   */
  async getLastKYCRequest(): Promise<any> {
    this.ensureInitialized();
    try {
      return await (this.web3 as any).graphite.getLastKycRequest();
    } catch (error) {
      console.error('Error getting last KYC request:', error);
      return null;
    }
  }

  /**
   * Set filter level for compliance
   */
  async setFilterLevel(level: number): Promise<void> {
    this.ensureInitialized();
    try {
      await (this.web3 as any).graphite.setFilterLevel(level);
      console.log(`Filter level set to ${level}`);
    } catch (error) {
      console.error('Error setting filter level:', error);
      throw error;
    }
  }

  /**
   * Get current filter level
   */
  async getFilterLevel(): Promise<number> {
    this.ensureInitialized();
    try {
      return await (this.web3 as any).graphite.getFilterLevel();
    } catch (error) {
      console.error('Error getting filter level:', error);
      return 0;
    }
  }

  /**
   * Get wallet address
   */
  getWalletAddress(): string {
    this.ensureInitialized();
    return (this.web3 as any).graphite.getWalletAddress();
  }

  /**
   * Check if user meets minimum trust requirements
   */
  async meetsMinimumTrust(address?: string, minScore: number = 3): Promise<boolean> {
    try {
      const reputation = await this.getReputation(address);
      return reputation.score >= minScore && reputation.isActivated;
    } catch (error) {
      console.error('Error checking minimum trust:', error);
      return false;
    }
  }

  /**
   * Check if user is compliant for specific operations
   */
  async isCompliant(address?: string, requiredKYCLevel: number = 1): Promise<boolean> {
    try {
      const reputation = await this.getReputation(address);
      return reputation.kycLevel >= requiredKYCLevel && reputation.isActivated;
    } catch (error) {
      console.error('Error checking compliance:', error);
      return false;
    }
  }

  /**
   * Convert numeric reputation to level string
   */
  private getReputationLevel(score: number): string {
    if (score >= 4.5) return 'Excellent';
    if (score >= 4.0) return 'Very Good';
    if (score >= 3.5) return 'Good';
    if (score >= 3.0) return 'Fair';
    if (score >= 2.0) return 'Poor';
    return 'New';
  }

  /**
   * Ensure service is initialized before use
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Graphite service not initialized. Call initialize() first.');
    }
  }
}

// Export singleton instance
let graphiteServiceInstance: GraphiteService | null = null;

export const getGraphiteService = (config?: GraphiteConfig): GraphiteService => {
  if (!graphiteServiceInstance && config) {
    graphiteServiceInstance = new GraphiteService(config);
  }
  if (!graphiteServiceInstance) {
    throw new Error('Graphite service not configured. Provide config on first call.');
  }
  return graphiteServiceInstance;
};

export default GraphiteService;
