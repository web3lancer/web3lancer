/**
 * Environment Configuration module
 * 
 * This file centralizes all environment variables and provides
 * typed access to them throughout the application.
 */

// Environment config type definition
export interface EnvConfig {
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

// Default environment config with fallback values
export const defaultEnvConfig: EnvConfig = {
  appwrite: {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
  },
  profiles: {
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_PROFILES_ID || '',
    userProfilesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PROFILES_ID || '',
    verificationsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILE_VERIFICATIONS_ID || '',
  },
  jobs: {
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_JOBS_ID || '',
    jobPostingsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_POSTINGS_ID || '',
    jobProposalsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_PROPOSALS_ID || '',
    jobContractsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_CONTRACTS_ID || '',
    milestonesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CONTRACT_MILESTONES_ID || '',
    reviewsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_REVIEWS_ID || '',
  },
  finance: {
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_FINANCE_ID || '',
    walletsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_WALLETS_ID || '',
    transactionsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLATFORM_TRANSACTIONS_ID || '',
    paymentMethodsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PAYMENT_METHODS_ID || '',
    escrowTransactionsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ESCROW_TRANSACTIONS_ID || '',
  },
  social: {
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_SOCIAL_ID || '',
    connectionsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_CONNECTIONS_ID || '',
    directMessagesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DIRECT_MESSAGES_ID || '',
    groupChatsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GROUP_CHATS_ID || '',
    groupChatMessagesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GROUP_CHAT_MESSAGES_ID || '',
  },
  content: {
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_CONTENT_ID || '',
    postsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_POSTS_ID || '',
    postInteractionsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_POST_INTERACTIONS_ID || '',
    portfoliosCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PORTFOLIOS_ID || '',
    articlesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_ARTICLES_ID || '',
    bookmarksCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_BOOKMARKS_ID || '',
  },
  governance: {
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_GOVERNANCE_ID || '',
    disputesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CONTRACT_DISPUTES_ID || '',
    proposalsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLATFORM_PROPOSALS_ID || '',
    votesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DISPUTE_VOTES_ID || '',
  },
  activity: {
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ACTIVITY_ID || '',
    notificationsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_NOTIFICATIONS_ID || '',
    logsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_AUDIT_LOGS_ID || '',
  },
  core: {
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_CORE_ID || '',
    settingsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLATFORM_SETTINGS_ID || '',
    metricsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_APP_CATEGORIES_ID || '', // Using categories as metrics placeholder
    auditLogsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_AUDIT_LOGS_ID || '',
  },
  storage: {
    verificationDocumentsBucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_VERIFICATION_DOCUMENTS_PRIVATE_ID || '',
    profileImagesBucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PROFILE_AVATARS_ID || '',
    postMediaBucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PROJECT_MEDIA_ID || '',
    portfolioMediaBucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PROJECT_MEDIA_ID || '',
    jobAttachmentsBucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_JOB_ATTACHMENTS_ID || '',
    messageAttachmentsBucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_MESSAGE_ATTACHMENTS_ID || '',
  },
};

// Helper function to validate required environment variables
export function validateEnvConfig(config: EnvConfig): boolean {
  // Required variables for the app to function
  const requiredVars = [
    config.appwrite.projectId,
    config.profiles.databaseId,
    config.profiles.userProfilesCollectionId,
  ];
  
  return requiredVars.every(val => val && val.length > 0);
}

// Export a validated environment config
export const envConfig = defaultEnvConfig;

// Log warning if required environment variables are missing
if (typeof window !== 'undefined' && !validateEnvConfig(envConfig)) {
  console.warn(
    'Some required environment variables are missing. ' +
    'The application may not function correctly. ' +
    'Please check your .env configuration.'
  );
}