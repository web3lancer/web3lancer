/**
 * Environment configuration for Web3Lancer
 * 
 * This module provides centralized access to environment variables
 * and configuration settings across the application.
 */

/**
 * API Endpoints configuration
 */
export const API_ENDPOINTS = {
  // PhotonLancerr Payment API
  PAYMENT: {
    BASE_URL: process.env.NEXT_PUBLIC_PAYMENT_API_URL, // Relies on environment variable
    HEALTH: '/health',
    PAYMENTS: '/payments',
    PLUGINS: '/plugins',
  },
  
  // Appwrite endpoints are handled through the Appwrite client, 
  // which itself should be configured using environment variables (see api.ts)
};

/**
 * Appwrite configuration
 */
// Appwrite Project
export const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
export const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;


// New schema database IDs
export const PROFILES_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_PROFILES_ID!;
export const JOBS_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_JOBS_ID!;
export const FINANCE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_FINANCE_ID!;
export const SOCIAL_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_SOCIAL_ID!;
export const CONTENT_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_CONTENT_ID!;
export const GOVERNANCE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_GOVERNANCE_ID!;
export const ACTIVITY_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ACTIVITY_ID!;
export const CORE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_CORE_ID!;

// ProfilesDB Collection IDs
export const USER_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PROFILES_ID!;
export const PROFILE_VERIFICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILE_VERIFICATIONS_ID!;

// JobsDB Collection IDs
export const JOB_POSTINGS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_POSTINGS_ID!;
export const JOB_PROPOSALS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_PROPOSALS_ID!;
export const JOB_CONTRACTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_CONTRACTS_ID!;
export const CONTRACT_MILESTONES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CONTRACT_MILESTONES_ID!;
export const USER_REVIEWS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_REVIEWS_ID!;

// FinanceDB Collection IDs
export const USER_WALLETS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_WALLETS_ID!;
export const PLATFORM_TRANSACTIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLATFORM_TRANSACTIONS_ID!;
export const USER_PAYMENT_METHODS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PAYMENT_METHODS_ID!;
export const ESCROW_TRANSACTIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ESCROW_TRANSACTIONS_ID!;

// SocialDB Collection IDs
export const USER_CONNECTIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_CONNECTIONS_ID!;
export const DIRECT_MESSAGES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DIRECT_MESSAGES_ID!;
export const GROUP_CHATS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GROUP_CHATS_ID!;
export const GROUP_CHAT_MESSAGES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GROUP_CHAT_MESSAGES_ID!;

// ContentDB Collection IDs
export const USER_POSTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_POSTS_ID!;
export const POST_INTERACTIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_POST_INTERACTIONS_ID!;
export const USER_PORTFOLIOS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PORTFOLIOS_ID!;
export const USER_ARTICLES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_ARTICLES_ID!;
export const USER_BOOKMARKS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_BOOKMARKS_ID!;

// GovernanceDB Collection IDs
export const CONTRACT_DISPUTES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CONTRACT_DISPUTES_ID!;
export const DISPUTE_VOTES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DISPUTE_VOTES_ID!;
export const PLATFORM_PROPOSALS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLATFORM_PROPOSALS_ID!;

// ActivityDB Collection IDs
export const USER_NOTIFICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_NOTIFICATIONS_ID!;
export const AUDIT_LOGS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_AUDIT_LOGS_ID!;

// CoreDB Collection IDs
export const APP_SKILLS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_APP_SKILLS_ID!;
export const APP_CATEGORIES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_APP_CATEGORIES_ID!;
export const PLATFORM_SETTINGS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLATFORM_SETTINGS_ID!;

// Storage Bucket IDs
export const PROFILE_AVATARS_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PROFILE_AVATARS_ID!;
export const COVER_IMAGES_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_COVER_IMAGES_ID!;
export const VERIFICATION_DOCUMENTS_PRIVATE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_VERIFICATION_DOCUMENTS_PRIVATE_ID!;
export const JOB_ATTACHMENTS_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_JOB_ATTACHMENTS_ID!;
export const PORTFOLIO_MEDIA_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PORTFOLIO_MEDIA_ID!;
export const POST_ATTACHMENTS_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_POST_ATTACHMENTS_ID!;
export const MESSAGE_ATTACHMENTS_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_MESSAGE_ATTACHMENTS_ID!;
export const MISCELLANEOUS_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_MISCELLANEOUS_ID!;
// Note: NEXT_PUBLIC_APPWRITE_BUCKET_ID is used for general/profile purposes in older parts, ensure it's mapped to a relevant new bucket if needed or phase out.
// For clarity, specific new bucket IDs like PROFILE_AVATARS_BUCKET_ID should be used.
export const LEGACY_PROFILE_PICTURES_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID; // Keep for legacy if needed, map to new one if possible.
export const PROJECT_MEDIA_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PROJECT_MEDIA_ID!; // Retained from old list, ensure it's used or map to portfolio/post media
export const PROJECT_DOCUMENTS_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PROJECT_DOCUMENTS_ID!; // Retained, ensure used or map


/**
 * Environment settings
 */
export const ENV = {
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
};

/**
 * Application configuration
 */
export const APP_CONFIG = {
  APP_URL: process.env.NEXT_PUBLIC_APP_URL
};


// Skills list for form selections - Consider fetching from CoreDB/app_skills in the future
export const AVAILABLE_SKILLS = [
  'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 
  'Solidity', 'Web3', 'Smart Contracts', 'Blockchain',
  'UI/UX', 'Design', 'Backend', 'Frontend', 'Full Stack',
  'AWS', 'Cloud', 'Database', 'Rust', 'Go', 'DevOps'
];

// Project categories - Consider fetching from CoreDB/app_categories in the future
export const PROJECT_CATEGORIES = [
  'Development', 'Design', 'Marketing', 'Writing', 'Admin Support',
  'Blockchain', 'Smart Contracts', 'NFT', 'DeFi', 'DAO', 'Metaverse'
];

// API routes (client-side, not Appwrite functions)
export const API_ROUTES = {
  PROFILE: '/api/profile', // Example, adjust if using Next.js API routes for backend logic
  PROJECT: '/api/project', // Example
  PROPOSAL: '/api/proposal', // Example
  CONTRACT: '/api/contract', // Example
  REVIEW: '/api/review', // Example
  AUTH: '/api/auth', // Example
};

// Deprecated section - remove old APPWRITE_CONFIG and other duplicates
/*
export const APPWRITE_CONFIG = {
  // ENDPOINT and PROJECT are typically configured directly in the Appwrite client initialization (see src/utils/api.ts)
  // However, if needed elsewhere, they can be defined here from env vars:
  // ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  // PROJECT: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  
  DATABASES: {
    USERS: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_USERS_ID,
    BOOKMARKS: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_BOOKMARKS_ID,
    PROJECTS: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_PROJECTS_ID,
    MESSAGES: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_MESSAGES_ID,
    TRANSACTIONS: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_TRANSACTIONS_ID,
    NOTIFICATIONS: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_NOTIFICATIONS_ID,
    JOBS: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_JOBS_ID,
    WALLET: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_WALLET_ID,
    PAYMENT_METHODS: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_PAYMENTMETHODS_ID
  },
  COLLECTIONS: {
    PROFILES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES_ID,
    CONNECTIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CONNECTIONS_ID,
    BOOKMARKS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKMARKS_ID,
    CATEGORIES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CATEGORIES_ID,
    PROJECTS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROJECTS_ID,
    TASKS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TASKS_ID,
    MESSAGES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MESSAGES_ID,
    TRANSACTIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS_ID,
    NOTIFICATIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_NOTIFICATIONS_ID,
    APPLICATIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_APPLICATIONS_ID,
    REVIEWS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_REVIEWS_ID,
    JOBS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOBS_ID,
    WALLETS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_WALLETS_ID,
    BALANCES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BALANCES_ID,
    CRYPTO_TRANSACTIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CRYPTOTRANSACTIONS_ID,
    PAYMENT_METHODS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAYMENTMETHODS_ID
  },
  STORAGE: {
    // The main profile picture bucket ID is often referred to as NEXT_PUBLIC_APPWRITE_BUCKET_ID
    PROFILE_PICTURES: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID, 
    JOB_ATTACHMENTS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_JOB_ATTACHMENTS_ID,
    PROJECT_DOCUMENTS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PROJECT_DOCUMENTS_ID,
    PROJECT_MEDIA: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PROJECT_MEDIA_ID,
    MESSAGE_ATTACHMENTS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_MESSAGE_ATTACHMENTS_ID,
    MISCELLANEOUS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_MISCELLANEOUS_ID
  }
};
*/

// The following sections seem to be duplicates or outdated, 
// relying on older naming conventions or redeclaring constants already defined above with the '!' non-null assertion.
// It's recommended to consolidate these and use the constants defined with '!' for consistency and to avoid potential issues.
// All duplicated constants below this line have been removed.

/**
 * Interface for all environment variables.
 * Helps with type checking when accessing environment variables.
 */
export interface AppEnv {
  // App URL
  APP_URL: string;
  
  // Appwrite General
  APPWRITE_ENDPOINT: string;
  APPWRITE_PROJECT_ID: string;

  // Database IDs
  PROFILES_DATABASE_ID: string;
  JOBS_DATABASE_ID: string;
  FINANCE_DATABASE_ID: string;
  SOCIAL_DATABASE_ID: string;
  CONTENT_DATABASE_ID: string;
  GOVERNANCE_DATABASE_ID: string;
  ACTIVITY_DATABASE_ID: string;
  CORE_DATABASE_ID: string;

  // ProfilesDB Collections
  USER_PROFILES_COLLECTION_ID: string;
  PROFILE_VERIFICATIONS_COLLECTION_ID: string;

  // JobsDB Collections
  JOB_POSTINGS_COLLECTION_ID: string;
  JOB_PROPOSALS_COLLECTION_ID: string;
  JOB_CONTRACTS_COLLECTION_ID: string;
  CONTRACT_MILESTONES_COLLECTION_ID: string;
  USER_REVIEWS_COLLECTION_ID: string;

  // FinanceDB Collections
  USER_WALLETS_COLLECTION_ID: string;
  PLATFORM_TRANSACTIONS_COLLECTION_ID: string;
  USER_PAYMENT_METHODS_COLLECTION_ID: string;
  ESCROW_TRANSACTIONS_COLLECTION_ID: string;

  // SocialDB Collections
  USER_CONNECTIONS_COLLECTION_ID: string;
  DIRECT_MESSAGES_COLLECTION_ID: string;
  GROUP_CHATS_COLLECTION_ID: string;
  GROUP_CHAT_MESSAGES_COLLECTION_ID: string;

  // ContentDB Collections
  USER_POSTS_COLLECTION_ID: string;
  POST_INTERACTIONS_COLLECTION_ID: string;
  USER_PORTFOLIOS_COLLECTION_ID: string;
  USER_ARTICLES_COLLECTION_ID: string;
  USER_BOOKMARKS_COLLECTION_ID: string;

  // GovernanceDB Collections
  CONTRACT_DISPUTES_COLLECTION_ID: string;
  DISPUTE_VOTES_COLLECTION_ID: string;
  PLATFORM_PROPOSALS_COLLECTION_ID: string;

  // ActivityDB Collections
  USER_NOTIFICATIONS_COLLECTION_ID: string;
  AUDIT_LOGS_COLLECTION_ID: string;

  // CoreDB Collections
  APP_SKILLS_COLLECTION_ID: string;
  APP_CATEGORIES_COLLECTION_ID: string;
  PLATFORM_SETTINGS_COLLECTION_ID: string;

  // Storage Bucket IDs
  BUCKET_PROFILE_AVATARS_ID: string;
  BUCKET_COVER_IMAGES_ID: string;
  BUCKET_VERIFICATION_DOCUMENTS_PRIVATE_ID: string;
  BUCKET_MISCELLANEOUS_ID: string;
  BUCKET_MESSAGE_ATTACHMENTS_ID: string;
  BUCKET_PROJECT_MEDIA_ID: string;
  BUCKET_PROJECT_DOCUMENTS_ID: string;
  BUCKET_JOB_ATTACHMENTS_ID: string;
}

/**
 * Interface for content-related environment variables.
 */
export interface ContentEnv {
  databaseContentId: string;
  collectionPostsId: string;
  collectionPostInteractionsId: string;
  collectionPortfoliosId: string;
  collectionArticlesId: string;
  collectionBookmarksId: string;
}

/**
 * Interface for governance-related environment variables.
 */
export interface GovernanceEnv {
  databaseGovernanceId: string;
  collectionDisputesId: string;
  collectionVotesId: string;
  collectionProposalsId: string;
}

/**
 * Interface for activity-related environment variables.
 */
export interface ActivityEnv {
  databaseActivityId: string;
  collectionNotificationsId: string;
  collectionAuditLogsId: string;
}

/**
 * Interface for core data-related environment variables.
 */
export interface CoreDataEnv {
  databaseCoreId: string;
  collectionSkillsId: string;
  collectionCategoriesId: string;
  collectionSettingsId: string;
}

// Governance Database Constants
export const GOVERNANCE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_GOVERNANCE_ID || '';
export const DISPUTES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DISPUTES_ID || '';
export const GOVERNANCE_PROPOSALS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GOVERNANCE_PROPOSALS_ID || '';
export const GOVERNANCE_VOTES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GOVERNANCE_VOTES_ID || '';

// Activity Database Constants
export const ACTIVITY_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ACTIVITY_ID || '';
export const NOTIFICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_NOTIFICATIONS_ID || '';
export const ACTIVITY_LOGS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOGS_ID || '';

// Core Database Constants
export const CORE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_CORE_ID || '';
export const SYSTEM_SETTINGS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SYSTEM_SETTINGS_ID || '';
export const SYSTEM_METRICS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SYSTEM_METRICS_ID || '';
export const SYSTEM_AUDIT_LOGS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SYSTEM_AUDIT_LOGS_ID || '';

// Export all constants with the appropriate structure
export default {
  getAll(): AppEnv {
    return {
      // App URL
      APP_URL: process.env.NEXT_PUBLIC_APP_URL || '',

      // Appwrite General
      APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '',
      APPWRITE_PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',

      // Database IDs
      PROFILES_DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_PROFILES_ID || '',
      JOBS_DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_JOBS_ID || '',
      FINANCE_DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_FINANCE_ID || '',
      SOCIAL_DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_SOCIAL_ID || '',
      CONTENT_DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_CONTENT_ID || '',
      GOVERNANCE_DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_GOVERNANCE_ID || '',
      ACTIVITY_DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ACTIVITY_ID || '',
      CORE_DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_CORE_ID || '',

      // ProfilesDB Collections
      USER_PROFILES_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PROFILES_ID || '',
      PROFILE_VERIFICATIONS_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILE_VERIFICATIONS_ID || '',

      // JobsDB Collections
      JOB_POSTINGS_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_POSTINGS_ID || '',
      JOB_PROPOSALS_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_PROPOSALS_ID || '',
      JOB_CONTRACTS_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_CONTRACTS_ID || '',
      CONTRACT_MILESTONES_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CONTRACT_MILESTONES_ID || '',
      USER_REVIEWS_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_REVIEWS_ID || '',

      // FinanceDB Collections
      USER_WALLETS_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_WALLETS_ID || '',
      PLATFORM_TRANSACTIONS_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLATFORM_TRANSACTIONS_ID || '',
      USER_PAYMENT_METHODS_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PAYMENT_METHODS_ID || '',
      ESCROW_TRANSACTIONS_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ESCROW_TRANSACTIONS_ID || '',

      // SocialDB Collections
      USER_CONNECTIONS_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_CONNECTIONS_ID || '',
      DIRECT_MESSAGES_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DIRECT_MESSAGES_ID || '',
      GROUP_CHATS_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GROUP_CHATS_ID || '',
      GROUP_CHAT_MESSAGES_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GROUP_CHAT_MESSAGES_ID || '',

      // ContentDB Collections
      USER_POSTS_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_POSTS_ID || '',
      POST_INTERACTIONS_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_POST_INTERACTIONS_ID || '',
      USER_PORTFOLIOS_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PORTFOLIOS_ID || '',
      USER_ARTICLES_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_ARTICLES_ID || '',
      USER_BOOKMARKS_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_BOOKMARKS_ID || '',

      // GovernanceDB Collections
      CONTRACT_DISPUTES_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CONTRACT_DISPUTES_ID || '',
      DISPUTE_VOTES_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DISPUTE_VOTES_ID || '',
      PLATFORM_PROPOSALS_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLATFORM_PROPOSALS_ID || '',

      // ActivityDB Collections
      USER_NOTIFICATIONS_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_NOTIFICATIONS_ID || '',
      AUDIT_LOGS_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_AUDIT_LOGS_ID || '',

      // CoreDB Collections
      APP_SKILLS_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_APP_SKILLS_ID || '',
      APP_CATEGORIES_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_APP_CATEGORIES_ID || '',
      PLATFORM_SETTINGS_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLATFORM_SETTINGS_ID || '',

      // Storage Bucket IDs
      BUCKET_PROFILE_AVATARS_ID: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PROFILE_AVATARS_ID || '',
      BUCKET_COVER_IMAGES_ID: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_COVER_IMAGES_ID || '',
      BUCKET_VERIFICATION_DOCUMENTS_PRIVATE_ID: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_VERIFICATION_DOCUMENTS_PRIVATE_ID || '',
      BUCKET_MISCELLANEOUS_ID: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_MISCELLANEOUS_ID || '',
      BUCKET_MESSAGE_ATTACHMENTS_ID: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_MESSAGE_ATTACHMENTS_ID || '',
      BUCKET_PROJECT_MEDIA_ID: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PROJECT_MEDIA_ID || '',
      BUCKET_PROJECT_DOCUMENTS_ID: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PROJECT_DOCUMENTS_ID || '',
      BUCKET_JOB_ATTACHMENTS_ID: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_JOB_ATTACHMENTS_ID || '',
    };
  },

  getContentEnv(): ContentEnv {
    return {
      databaseContentId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_CONTENT_ID || '',
      collectionPostsId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_POSTS_ID || '',
      collectionPostInteractionsId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_POST_INTERACTIONS_ID || '',
      collectionPortfoliosId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PORTFOLIOS_ID || '',
      collectionArticlesId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_ARTICLES_ID || '',
      collectionBookmarksId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_BOOKMARKS_ID || '',
    };
  },

  getGovernanceEnv(): GovernanceEnv {
    return {
      databaseGovernanceId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_GOVERNANCE_ID || '',
      collectionDisputesId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CONTRACT_DISPUTES_ID || '',
      collectionVotesId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DISPUTE_VOTES_ID || '',
      collectionProposalsId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLATFORM_PROPOSALS_ID || '',
    };
  },

  getActivityEnv(): ActivityEnv {
    return {
      databaseActivityId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ACTIVITY_ID || '',
      collectionNotificationsId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_NOTIFICATIONS_ID || '',
      collectionAuditLogsId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_AUDIT_LOGS_ID || '',
    };
  },

  getCoreDataEnv(): CoreDataEnv {
    return {
      databaseCoreId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_CORE_ID || '',
      collectionSkillsId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_APP_SKILLS_ID || '',
      collectionCategoriesId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_APP_CATEGORIES_ID || '',
      collectionSettingsId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLATFORM_SETTINGS_ID || '',
    };
  }
};
