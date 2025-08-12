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
