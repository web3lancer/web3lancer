// Environment configuration - Maps environment variables to typed constants
// This centralizes all environment variable access for better type safety

// Core Appwrite Configuration
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';
export const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
export const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
export const APPWRITE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '';

// Database IDs
export const PROFILES_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_PROFILES_ID || '';
export const JOBS_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_JOBS_ID || '';
export const FINANCE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_FINANCE_ID || '';
export const SOCIAL_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_SOCIAL_ID || '';
export const CONTENT_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_CONTENT_ID || '';
export const GOVERNANCE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_GOVERNANCE_ID || '';
export const ACTIVITY_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ACTIVITY_ID || '';
export const CORE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_CORE_ID || '';

// ProfilesDB Collections
export const USER_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PROFILES_ID || '';
export const PROFILE_VERIFICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILE_VERIFICATIONS_ID || '';

// JobsDB Collections
export const JOB_POSTINGS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_POSTINGS_ID || '';
export const JOB_PROPOSALS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_PROPOSALS_ID || '';
export const JOB_CONTRACTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_CONTRACTS_ID || '';
export const CONTRACT_MILESTONES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CONTRACT_MILESTONES_ID || '';
export const USER_REVIEWS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_REVIEWS_ID || '';

// FinanceDB Collections
export const USER_WALLETS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_WALLETS_ID || '';
export const PLATFORM_TRANSACTIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLATFORM_TRANSACTIONS_ID || '';
export const USER_PAYMENT_METHODS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PAYMENT_METHODS_ID || '';
export const ESCROW_TRANSACTIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ESCROW_TRANSACTIONS_ID || '';

// SocialDB Collections
export const USER_CONNECTIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_CONNECTIONS_ID || '';
export const DIRECT_MESSAGES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DIRECT_MESSAGES_ID || '';
export const GROUP_CHATS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GROUP_CHATS_ID || '';
export const GROUP_CHAT_MESSAGES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GROUP_CHAT_MESSAGES_ID || '';

// ContentDB Collections
export const POSTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_POSTS_ID || '';
export const POST_INTERACTIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_POST_INTERACTIONS_ID || '';
export const PORTFOLIOS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PORTFOLIOS_ID || '';
export const ARTICLES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ARTICLES_ID || '';
export const BOOKMARKS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKMARKS_ID || '';

// GovernanceDB Collections
export const DISPUTES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DISPUTES_ID || '';
export const GOVERNANCE_PROPOSALS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GOVERNANCE_PROPOSALS_ID || '';
export const GOVERNANCE_VOTES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GOVERNANCE_VOTES_ID || '';

// ActivityDB Collections
export const NOTIFICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_NOTIFICATIONS_ID || '';
export const ACTIVITY_LOGS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOGS_ID || '';

// CoreDB Collections
export const SYSTEM_SETTINGS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SYSTEM_SETTINGS_ID || '';
export const SYSTEM_METRICS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SYSTEM_METRICS_ID || '';
export const SYSTEM_AUDIT_LOGS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SYSTEM_AUDIT_LOGS_ID || '';

// Storage Buckets
export const VERIFICATION_DOCUMENTS_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_VERIFICATION_DOCUMENTS_PRIVATE_ID || '';
export const PROFILE_IMAGES_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PROFILE_IMAGES_ID || '';
export const POST_MEDIA_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_POST_MEDIA_ID || '';
export const PORTFOLIO_MEDIA_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PORTFOLIO_MEDIA_ID || '';
export const JOB_ATTACHMENTS_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_JOB_ATTACHMENTS_ID || '';
export const MESSAGE_ATTACHMENTS_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_MESSAGE_ATTACHMENTS_ID || '';

// Validate environment at startup - This will help identify missing env vars early
export function validateEnvironment(): boolean {
  const requiredVars = [
    APPWRITE_ENDPOINT, 
    APPWRITE_PROJECT_ID
  ];
  
  const missing = requiredVars.filter(v => !v);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables');
    return false;
  }
  
  return true;
}

// Typed interface for environment service - helps create more specific services
export interface EnvVars {
  // Generic getter for any environment variable
  get(key: string): string;
}

// Type definition for module-specific environment variables
export interface EnvConfig {
  // Add specific config keys for different modules
  appwrite: {
    endpoint: string;
    projectId: string;
  };
  profiles: {
    databaseId: string;
    userProfilesCollectionId: string;
    verificationsCollectionId: string;
  };
  jobs: {
    databaseId: string;
    jobPostingsCollectionId: string;
    jobProposalsCollectionId: string;
    jobContractsCollectionId: string;
    milestonesCollectionId: string;
    reviewsCollectionId: string;
  };
  finance: {
    databaseId: string;
    walletsCollectionId: string;
    transactionsCollectionId: string;
    paymentMethodsCollectionId: string;
    escrowTransactionsCollectionId: string;
  };
  social: {
    databaseId: string;
    connectionsCollectionId: string;
    directMessagesCollectionId: string;
    groupChatsCollectionId: string;
    groupChatMessagesCollectionId: string;
  };
  content: {
    databaseId: string;
    postsCollectionId: string;
    postInteractionsCollectionId: string;
    portfoliosCollectionId: string;
    articlesCollectionId: string;
    bookmarksCollectionId: string;
  };
  governance: {
    databaseId: string;
    disputesCollectionId: string;
    proposalsCollectionId: string;
    votesCollectionId: string;
  };
  activity: {
    databaseId: string;
    notificationsCollectionId: string;
    logsCollectionId: string;
  };
  core: {
    databaseId: string;
    settingsCollectionId: string;
    metricsCollectionId: string;
    auditLogsCollectionId: string;
  };
  storage: {
    verificationDocumentsBucketId: string;
    profileImagesBucketId: string;
    postMediaBucketId: string;
    portfolioMediaBucketId: string;
    jobAttachmentsBucketId: string;
    messageAttachmentsBucketId: string;
  };
}

// Default environment configuration - simplifies service creation
export const defaultEnvConfig: EnvConfig = {
  appwrite: {
    endpoint: APPWRITE_ENDPOINT,
    projectId: APPWRITE_PROJECT_ID,
  },
  profiles: {
    databaseId: PROFILES_DATABASE_ID,
    userProfilesCollectionId: USER_PROFILES_COLLECTION_ID,
    verificationsCollectionId: PROFILE_VERIFICATIONS_COLLECTION_ID,
  },
  jobs: {
    databaseId: JOBS_DATABASE_ID,
    jobPostingsCollectionId: JOB_POSTINGS_COLLECTION_ID,
    jobProposalsCollectionId: JOB_PROPOSALS_COLLECTION_ID,
    jobContractsCollectionId: JOB_CONTRACTS_COLLECTION_ID,
    milestonesCollectionId: CONTRACT_MILESTONES_COLLECTION_ID,
    reviewsCollectionId: USER_REVIEWS_COLLECTION_ID,
  },
  finance: {
    databaseId: FINANCE_DATABASE_ID,
    walletsCollectionId: USER_WALLETS_COLLECTION_ID,
    transactionsCollectionId: PLATFORM_TRANSACTIONS_COLLECTION_ID,
    paymentMethodsCollectionId: USER_PAYMENT_METHODS_COLLECTION_ID,
    escrowTransactionsCollectionId: ESCROW_TRANSACTIONS_COLLECTION_ID,
  },
  social: {
    databaseId: SOCIAL_DATABASE_ID,
    connectionsCollectionId: USER_CONNECTIONS_COLLECTION_ID,
    directMessagesCollectionId: DIRECT_MESSAGES_COLLECTION_ID,
    groupChatsCollectionId: GROUP_CHATS_COLLECTION_ID,
    groupChatMessagesCollectionId: GROUP_CHAT_MESSAGES_COLLECTION_ID,
  },
  content: {
    databaseId: CONTENT_DATABASE_ID,
    postsCollectionId: POSTS_COLLECTION_ID,
    postInteractionsCollectionId: POST_INTERACTIONS_COLLECTION_ID,
    portfoliosCollectionId: PORTFOLIOS_COLLECTION_ID,
    articlesCollectionId: ARTICLES_COLLECTION_ID,
    bookmarksCollectionId: BOOKMARKS_COLLECTION_ID,
  },
  governance: {
    databaseId: GOVERNANCE_DATABASE_ID,
    disputesCollectionId: DISPUTES_COLLECTION_ID,
    proposalsCollectionId: GOVERNANCE_PROPOSALS_COLLECTION_ID,
    votesCollectionId: GOVERNANCE_VOTES_COLLECTION_ID,
  },
  activity: {
    databaseId: ACTIVITY_DATABASE_ID,
    notificationsCollectionId: NOTIFICATIONS_COLLECTION_ID,
    logsCollectionId: ACTIVITY_LOGS_COLLECTION_ID,
  },
  core: {
    databaseId: CORE_DATABASE_ID,
    settingsCollectionId: SYSTEM_SETTINGS_COLLECTION_ID,
    metricsCollectionId: SYSTEM_METRICS_COLLECTION_ID,
    auditLogsCollectionId: SYSTEM_AUDIT_LOGS_COLLECTION_ID,
  },
  storage: {
    verificationDocumentsBucketId: VERIFICATION_DOCUMENTS_BUCKET_ID,
    profileImagesBucketId: PROFILE_IMAGES_BUCKET_ID,
    postMediaBucketId: POST_MEDIA_BUCKET_ID,
    portfolioMediaBucketId: PORTFOLIO_MEDIA_BUCKET_ID,
    jobAttachmentsBucketId: JOB_ATTACHMENTS_BUCKET_ID,
    messageAttachmentsBucketId: MESSAGE_ATTACHMENTS_BUCKET_ID,
  },
};