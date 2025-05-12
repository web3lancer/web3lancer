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
 * These IDs must be set in your environment variables.
 */
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
