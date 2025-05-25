import { Transaction } from '@mysten/sui/transactions';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SUI_CONFIG } from '@/utils/contractUtils';

// Initialize Sui client
const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

// Base service class with common utilities
abstract class BaseSuiService {
  protected packageId: string;
  protected client: SuiClient;

  constructor(packageId: string) {
    this.packageId = packageId;
    this.client = suiClient;
  }

  protected async executeTransaction(txb: TransactionBlock, signer?: Ed25519Keypair) {
    try {
      if (!signer) {
        throw new Error('Signer keypair is required');
      }

      const result = await this.client.signAndExecuteTransactionBlock({
        signer,
        transactionBlock: txb,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      return { success: true, result };
    } catch (error) {
      console.error('Transaction execution failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  protected createTransactionBlock() {
    return new TransactionBlock();
  }
}

// User Profile Service
export class SuiUserProfileService extends BaseSuiService {
  private registryId: string;

  constructor() {
    super(SUI_CONFIG.PACKAGE_ID);
    this.registryId = SUI_CONFIG.TESTNET.USER_PROFILE_REGISTRY;
  }

  async createProfile(params: {
    username: string;
    email: string;
    bio: string;
    hourlyRate: number;
  }, signer: Ed25519Keypair) {
    try {
      const txb = this.createTransactionBlock();

      txb.moveCall({
        target: `${this.packageId}::user_profile::create_profile`,
        arguments: [
          txb.object(this.registryId),
          txb.pure(Array.from(new TextEncoder().encode(params.username))),
          txb.pure(Array.from(new TextEncoder().encode(params.email))),
          txb.pure(Array.from(new TextEncoder().encode(params.bio))),
          txb.pure(params.hourlyRate),
        ],
      });

      const result = await this.executeTransaction(txb, signer);
      
      if (result.success && result.result?.objectChanges) {
        const createdProfile = result.result.objectChanges.find(
          (change: any) => change.type === 'created' && 
          change.objectType?.includes('::user_profile::UserProfile')
        );
        
        return {
          success: true,
          profileId: createdProfile?.objectId || 'unknown',
          txDigest: result.result.digest
        };
      }

      return result;
    } catch (error) {
      console.error('Create profile failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateProfile(profileId: string, params: {
    bio: string;
    hourlyRate: number;
  }, signer: Ed25519Keypair) {
    try {
      const txb = this.createTransactionBlock();

      txb.moveCall({
        target: `${this.packageId}::user_profile::update_profile`,
        arguments: [
          txb.object(profileId),
          txb.pure(Array.from(new TextEncoder().encode(params.bio))),
          txb.pure(params.hourlyRate),
        ],
      });

      return await this.executeTransaction(txb, signer);
    } catch (error) {
      console.error('Update profile failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async addSkill(profileId: string, skill: string, signer: Ed25519Keypair) {
    try {
      const txb = this.createTransactionBlock();

      txb.moveCall({
        target: `${this.packageId}::user_profile::add_skill`,
        arguments: [
          txb.object(profileId),
          txb.pure(Array.from(new TextEncoder().encode(skill))),
        ],
      });

      return await this.executeTransaction(txb, signer);
    } catch (error) {
      console.error('Add skill failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async addPortfolioLink(profileId: string, link: string, signer: Ed25519Keypair) {
    try {
      const txb = this.createTransactionBlock();

      txb.moveCall({
        target: `${this.packageId}::user_profile::add_portfolio_link`,
        arguments: [
          txb.object(profileId),
          txb.pure(Array.from(new TextEncoder().encode(link))),
        ],
      });

      return await this.executeTransaction(txb, signer);
    } catch (error) {
      console.error('Add portfolio link failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getProfile(profileId: string) {
    try {
      const profile = await this.client.getObject({
        id: profileId,
        options: { showContent: true }
      });

      return { success: true, profile };
    } catch (error) {
      console.error('Get profile failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Project Management Service
export class SuiProjectService extends BaseSuiService {
  private registryId: string;

  constructor() {
    super(SUI_CONFIG.PACKAGE_ID);
    this.registryId = SUI_CONFIG.TESTNET.PROJECT_REGISTRY;
  }

  async createProject(params: {
    title: string;
    description: string;
    budget: number;
    milestones: Array<{
      title: string;
      description: string;
      amount: number;
      deadline: number;
    }>;
  }, paymentCoinId: string, signer: Ed25519Keypair) {
    try {
      const txb = this.createTransactionBlock();

      // Prepare milestone arrays
      const milestoneTitles = params.milestones.map(m => 
        Array.from(new TextEncoder().encode(m.title))
      );
      const milestoneDescriptions = params.milestones.map(m => 
        Array.from(new TextEncoder().encode(m.description))
      );
      const milestoneAmounts = params.milestones.map(m => m.amount);
      const milestoneDeadlines = params.milestones.map(m => m.deadline);

      txb.moveCall({
        target: `${this.packageId}::project_management::create_project`,
        arguments: [
          txb.object(this.registryId),
          txb.pure(Array.from(new TextEncoder().encode(params.title))),
          txb.pure(Array.from(new TextEncoder().encode(params.description))),
          txb.object(paymentCoinId),
          txb.pure(milestoneTitles),
          txb.pure(milestoneDescriptions),
          txb.pure(milestoneAmounts),
          txb.pure(milestoneDeadlines),
        ],
      });

      const result = await this.executeTransaction(txb, signer);
      
      if (result.success && result.result?.objectChanges) {
        const createdProject = result.result.objectChanges.find(
          (change: any) => change.type === 'created' && 
          change.objectType?.includes('::project_management::Project')
        );
        
        return {
          success: true,
          projectId: createdProject?.objectId || 'unknown',
          txDigest: result.result.digest
        };
      }

      return result;
    } catch (error) {
      console.error('Create project failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async acceptProject(projectId: string, signer: Ed25519Keypair) {
    try {
      const txb = this.createTransactionBlock();

      txb.moveCall({
        target: `${this.packageId}::project_management::accept_project`,
        arguments: [
          txb.object(this.registryId),
          txb.object(projectId),
        ],
      });

      return await this.executeTransaction(txb, signer);
    } catch (error) {
      console.error('Accept project failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async submitMilestone(projectId: string, milestoneId: number, signer: Ed25519Keypair) {
    try {
      const txb = this.createTransactionBlock();

      txb.moveCall({
        target: `${this.packageId}::project_management::submit_milestone`,
        arguments: [
          txb.object(projectId),
          txb.pure(milestoneId),
        ],
      });

      return await this.executeTransaction(txb, signer);
    } catch (error) {
      console.error('Submit milestone failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async approveMilestone(
    projectId: string, 
    freelancerProfileId: string, 
    milestoneId: number, 
    signer: Ed25519Keypair
  ) {
    try {
      const txb = this.createTransactionBlock();

      txb.moveCall({
        target: `${this.packageId}::project_management::approve_milestone`,
        arguments: [
          txb.object(this.registryId),
          txb.object(projectId),
          txb.object(freelancerProfileId),
          txb.pure(milestoneId),
        ],
      });

      return await this.executeTransaction(txb, signer);
    } catch (error) {
      console.error('Approve milestone failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async raiseDispute(
    projectId: string, 
    reason: string, 
    evidence: string, 
    signer: Ed25519Keypair
  ) {
    try {
      const txb = this.createTransactionBlock();

      txb.moveCall({
        target: `${this.packageId}::project_management::raise_dispute`,
        arguments: [
          txb.object(this.registryId),
          txb.object(projectId),
          txb.pure(Array.from(new TextEncoder().encode(reason))),
          txb.pure(Array.from(new TextEncoder().encode(evidence))),
        ],
      });

      return await this.executeTransaction(txb, signer);
    } catch (error) {
      console.error('Raise dispute failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getProject(projectId: string) {
    try {
      const project = await this.client.getObject({
        id: projectId,
        options: { showContent: true }
      });

      return { success: true, project };
    } catch (error) {
      console.error('Get project failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Reputation Service
export class SuiReputationService extends BaseSuiService {
  private registryId: string;

  constructor() {
    super(SUI_CONFIG.PACKAGE_ID);
    this.registryId = SUI_CONFIG.TESTNET.REPUTATION_REGISTRY;
  }

  async submitReview(params: {
    projectId: string;
    reviewee: string;
    rating: number;
    comment: string;
    skillsRating: number;
    communicationRating: number;
    timelinessRating: number;
    qualityRating: number;
    isClientReview: boolean;
  }, signer: Ed25519Keypair) {
    try {
      const txb = this.createTransactionBlock();

      txb.moveCall({
        target: `${this.packageId}::reputation_system::submit_review`,
        arguments: [
          txb.object(this.registryId),
          txb.pure(params.projectId),
          txb.pure(params.reviewee),
          txb.pure(params.rating),
          txb.pure(Array.from(new TextEncoder().encode(params.comment))),
          txb.pure(params.skillsRating),
          txb.pure(params.communicationRating),
          txb.pure(params.timelinessRating),
          txb.pure(params.qualityRating),
          txb.pure(params.isClientReview),
        ],
      });

      const result = await this.executeTransaction(txb, signer);
      
      if (result.success && result.result?.objectChanges) {
        const createdReview = result.result.objectChanges.find(
          (change: any) => change.type === 'created' && 
          change.objectType?.includes('::reputation_system::Review')
        );
        
        return {
          success: true,
          reviewId: createdReview?.objectId || 'unknown',
          txDigest: result.result.digest
        };
      }

      return result;
    } catch (error) {
      console.error('Submit review failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async verifySkill(
    userAddress: string,
    skill: string,
    verificationType: string,
    evidenceUrl: string,
    expiryDate: number,
    signer: Ed25519Keypair
  ) {
    try {
      const txb = this.createTransactionBlock();

      txb.moveCall({
        target: `${this.packageId}::reputation_system::verify_skill`,
        arguments: [
          txb.pure(userAddress),
          txb.pure(Array.from(new TextEncoder().encode(skill))),
          txb.pure(Array.from(new TextEncoder().encode(verificationType))),
          txb.pure(Array.from(new TextEncoder().encode(evidenceUrl))),
          txb.pure(expiryDate),
        ],
      });

      return await this.executeTransaction(txb, signer);
    } catch (error) {
      console.error('Verify skill failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async disputeReview(reviewId: string, reason: string, signer: Ed25519Keypair) {
    try {
      const txb = this.createTransactionBlock();

      txb.moveCall({
        target: `${this.packageId}::reputation_system::dispute_review`,
        arguments: [
          txb.object(reviewId),
          txb.pure(Array.from(new TextEncoder().encode(reason))),
        ],
      });

      return await this.executeTransaction(txb, signer);
    } catch (error) {
      console.error('Dispute review failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Messaging Service
export class SuiMessagingService extends BaseSuiService {
  private registryId: string;

  constructor() {
    super(SUI_CONFIG.PACKAGE_ID);
    this.registryId = SUI_CONFIG.TESTNET.MESSAGING_REGISTRY;
  }

  async createConversation(
    otherParticipant: string, 
    projectId: string = '0x0', 
    signer: Ed25519Keypair
  ) {
    try {
      const txb = this.createTransactionBlock();

      txb.moveCall({
        target: `${this.packageId}::messaging_system::create_conversation`,
        arguments: [
          txb.object(this.registryId),
          txb.pure(otherParticipant),
          txb.pure(projectId),
        ],
      });

      const result = await this.executeTransaction(txb, signer);
      
      if (result.success && result.result?.objectChanges) {
        const createdConversation = result.result.objectChanges.find(
          (change: any) => change.type === 'created' && 
          change.objectType?.includes('::messaging_system::Conversation')
        );
        
        return {
          success: true,
          conversationId: createdConversation?.objectId || 'unknown',
          txDigest: result.result.digest
        };
      }

      return result;
    } catch (error) {
      console.error('Create conversation failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendMessage(conversationId: string, params: {
    content: string;
    messageType: number;
    fileUrl?: string;
    replyTo?: number;
  }, signer: Ed25519Keypair) {
    try {
      const txb = this.createTransactionBlock();

      txb.moveCall({
        target: `${this.packageId}::messaging_system::send_message`,
        arguments: [
          txb.object(this.registryId),
          txb.object(conversationId),
          txb.pure(Array.from(new TextEncoder().encode(params.content))),
          txb.pure(params.messageType),
          txb.pure(Array.from(new TextEncoder().encode(params.fileUrl || ''))),
          txb.pure(params.replyTo || 0),
        ],
      });

      return await this.executeTransaction(txb, signer);
    } catch (error) {
      console.error('Send message failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async markMessagesRead(
    conversationId: string, 
    upToMessageId: number, 
    signer: Ed25519Keypair
  ) {
    try {
      const txb = this.createTransactionBlock();

      txb.moveCall({
        target: `${this.packageId}::messaging_system::mark_messages_read`,
        arguments: [
          txb.object(conversationId),
          txb.pure(upToMessageId),
        ],
      });

      return await this.executeTransaction(txb, signer);
    } catch (error) {
      console.error('Mark messages read failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async createNotification(params: {
    recipient: string;
    title: string;
    content: string;
    notificationType: number;
    relatedId: string;
    actionUrl: string;
  }, signer: Ed25519Keypair) {
    try {
      const txb = this.createTransactionBlock();

      txb.moveCall({
        target: `${this.packageId}::messaging_system::create_notification`,
        arguments: [
          txb.object(this.registryId),
          txb.pure(params.recipient),
          txb.pure(Array.from(new TextEncoder().encode(params.title))),
          txb.pure(Array.from(new TextEncoder().encode(params.content))),
          txb.pure(params.notificationType),
          txb.pure(params.relatedId),
          txb.pure(Array.from(new TextEncoder().encode(params.actionUrl))),
        ],
      });

      return await this.executeTransaction(txb, signer);
    } catch (error) {
      console.error('Create notification failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async archiveConversation(conversationId: string, signer: Ed25519Keypair) {
    try {
      const txb = this.createTransactionBlock();

      txb.moveCall({
        target: `${this.packageId}::messaging_system::archive_conversation`,
        arguments: [
          txb.object(conversationId),
        ],
      });

      return await this.executeTransaction(txb, signer);
    } catch (error) {
      console.error('Archive conversation failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Export service instances
export const suiUserProfileService = new SuiUserProfileService();
export const suiProjectService = new SuiProjectService();
export const suiReputationService = new SuiReputationService();
export const suiMessagingService = new SuiMessagingService();