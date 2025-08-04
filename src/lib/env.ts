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
// Safe getter for required environment variables
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Appwrite Project
export const PROJECT_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_PROJECT_ID');
export const ENDPOINT = getEnvVar('NEXT_PUBLIC_APPWRITE_ENDPOINT');
export const APP_URL = getEnvVar('NEXT_PUBLIC_APP_URL');

// New schema database IDs
export const PROFILES_DATABASE_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_DATABASE_PROFILES_ID');
export const JOBS_DATABASE_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_DATABASE_JOBS_ID');
export const FINANCE_DATABASE_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_DATABASE_FINANCE_ID');
export const SOCIAL_DATABASE_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_DATABASE_SOCIAL_ID');
export const CONTENT_DATABASE_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_DATABASE_CONTENT_ID');
export const GOVERNANCE_DATABASE_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_DATABASE_GOVERNANCE_ID');
export const ACTIVITY_DATABASE_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_DATABASE_ACTIVITY_ID');
export const CORE_DATABASE_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_DATABASE_CORE_ID');
export const USER_BOOKMARKS_DATABASE_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_DATABASE_CONTENT_ID');

// ProfilesDB Collection IDs
export const USER_PROFILES_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PROFILES_ID');
export const PROFILE_VERIFICATIONS_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILE_VERIFICATIONS_ID');

// JobsDB Collection IDs
export const JOB_POSTINGS_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_POSTINGS_ID');
export const JOB_PROPOSALS_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_PROPOSALS_ID');
export const JOB_CONTRACTS_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_CONTRACTS_ID');
export const CONTRACT_MILESTONES_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_CONTRACT_MILESTONES_ID');
export const USER_REVIEWS_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_USER_REVIEWS_ID');

// FinanceDB Collection IDs
export const USER_WALLETS_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_USER_WALLETS_ID');
export const PLATFORM_TRANSACTIONS_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_PLATFORM_TRANSACTIONS_ID');
export const USER_PAYMENT_METHODS_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PAYMENT_METHODS_ID');
export const ESCROW_TRANSACTIONS_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_ESCROW_TRANSACTIONS_ID');

// SocialDB Collection IDs
export const USER_CONNECTIONS_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_USER_CONNECTIONS_ID');
export const DIRECT_MESSAGES_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_DIRECT_MESSAGES_ID');
export const GROUP_CHATS_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_GROUP_CHATS_ID');
export const GROUP_CHAT_MESSAGES_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_GROUP_CHAT_MESSAGES_ID');

// ContentDB Collection IDs
export const USER_POSTS_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_USER_POSTS_ID');
export const POST_INTERACTIONS_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_POST_INTERACTIONS_ID');
export const USER_PORTFOLIOS_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PORTFOLIOS_ID');
export const USER_ARTICLES_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_USER_ARTICLES_ID');
export const USER_BOOKMARKS_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_USER_BOOKMARKS_ID');

// GovernanceDB Collection IDs
export const CONTRACT_DISPUTES_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_CONTRACT_DISPUTES_ID');
export const DISPUTE_VOTES_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_DISPUTE_VOTES_ID');
export const PLATFORM_PROPOSALS_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_PLATFORM_PROPOSALS_ID');

// ActivityDB Collection IDs
export const USER_NOTIFICATIONS_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_USER_NOTIFICATIONS_ID');
export const AUDIT_LOGS_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_AUDIT_LOGS_ID');

// CoreDB Collection IDs
export const APP_SKILLS_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_APP_SKILLS_ID');
export const APP_CATEGORIES_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_APP_CATEGORIES_ID');
export const PLATFORM_SETTINGS_COLLECTION_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_COLLECTION_PLATFORM_SETTINGS_ID');

// Storage Bucket IDs
export const PROFILE_AVATARS_BUCKET_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_BUCKET_PROFILE_AVATARS_ID');
export const COVER_IMAGES_BUCKET_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_BUCKET_COVER_IMAGES_ID');
export const VERIFICATION_DOCUMENTS_PRIVATE_BUCKET_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_BUCKET_VERIFICATION_DOCUMENTS_PRIVATE_ID');
export const JOB_ATTACHMENTS_BUCKET_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_BUCKET_JOB_ATTACHMENTS_ID');
export const PORTFOLIO_MEDIA_BUCKET_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_BUCKET_PROJECT_MEDIA_ID'); // Maps from PROJECT_MEDIA_ID
export const POST_ATTACHMENTS_BUCKET_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_BUCKET_POST_ATTACHMENTS_ID');
export const MESSAGE_ATTACHMENTS_BUCKET_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_BUCKET_MESSAGE_ATTACHMENTS_ID');
export const MISCELLANEOUS_BUCKET_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_BUCKET_MISCELLANEOUS_ID');
// Note: NEXT_PUBLIC_APPWRITE_BUCKET_ID is used for general/profile purposes in older parts, ensure it's mapped to a relevant new bucket if needed or phase out.
// For clarity, specific new bucket IDs like PROFILE_AVATARS_BUCKET_ID should be used.
export const LEGACY_PROFILE_PICTURES_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID; // Keep for legacy if needed, map to new one if possible.
export const PROJECT_DOCUMENTS_BUCKET_ID = getEnvVar('NEXT_PUBLIC_APPWRITE_BUCKET_PROJECT_DOCUMENTS_ID'); // Retained, ensure used or map


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
// All duplicated constants and interfaces below this line have been removed.
// The application should use the directly exported constants defined above.
