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
    BASE_URL: process.env.NEXT_PUBLIC_PAYMENT_API_URL || 'http://localhost:3030',
    HEALTH: '/health',
    PAYMENTS: '/payments',
    PLUGINS: '/plugins',
  },
  
  // Appwrite endpoints are handled through the Appwrite client
};

/**
 * Appwrite configuration
 */
export const APPWRITE_CONFIG = {
  // API endpoint for Appwrite
  ENDPOINT: 'https://cloud.appwrite.io/v1',
  
  // Project ID for Appwrite
  PROJECT_ID: '67aed8360001b6dd8cb3',
  
  // Database IDs
  DATABASES: {
    USERS: '67b885280000d2cb5411',
    JOBS: '67af3ffe0011106c4575',
    PROJECTS: '67b88574002c6eb405a2',
    BOOKMARKS: '67b885ed000038dd7ab9',
    NOTIFICATIONS: '67b8862f00055127cd62',
    MESSAGES: '67b8864c0020483351b5',
    TRANSACTIONS: '67b8866c00265d466063',
    WALLET: '67e629540014107023a2',
    PAYMENT_METHODS: '67e62c92002bfdf969c9'
  },
  
  // Collection IDs
  COLLECTIONS: {
    PROFILES: '67b8853c003c55c82ff6',
    CONNECTIONS: '67b88545001d27584d7e',
    JOBS: '67b8f57b0018fe4fcde7',
    APPLICATIONS: '67b8825d0022017188a8',
    REVIEWS: '67b884c10005b6971e9c',
    PROJECTS: '67b885810006a89bc6a4',
    TASKS: '67b8858a00321bdbbf80',
    BOOKMARKS: '67b8860100311b7d7939',
    CATEGORIES: '67b88607002255ac18fc',
    NOTIFICATIONS: '67b88639000157c7909d',
    MESSAGES: '67b88658000bea7a7c7e',
    TRANSACTIONS: '67b8867b001643b2585a',
    WALLETS: '67e629b1003bcc87679e',
    BALANCES: '67e62a5c00093534cc42',
    CRYPTO_TRANSACTIONS: '67e62b6f0003ed0e4ecc',
    PAYMENT_METHODS: '67e62cd3001975b82202'
  },
  
  // Storage bucket IDs
  STORAGE: {
    PROFILE_PICTURES: '67b889200019e3d3519d',
    JOB_ATTACHMENTS: '67b889440032a2ff90d3',
    PROJECT_DOCUMENTS: '67b8896b001c03586d6c',
    PROJECT_MEDIA: '67b88992001f1185cf8e',
    MESSAGE_ATTACHMENTS: '67b889b6000f7e9fa47c',
    MISCELLANEOUS: '67b889d200014904243b'
  }
};

/**
 * Environment settings
 */
export const ENV = {
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
};
