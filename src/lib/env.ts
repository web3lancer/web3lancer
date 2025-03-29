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
    USERS: '67af3ffe0011106c4575',
    JOBS: '67af3ffe0011106c4575',
    WALLET: '67af3ffe0011106c4575',
    BOOKMARKS: '67af3ffe0011106c4575',
    TRANSACTIONS: '67af3ffe0011106c4575',
    PROJECTS: '67af3ffe0011106c4575',
    MESSAGES: '67af3ffe0011106c4575',
    NOTIFICATIONS: '67af3ffe0011106c4575',
    PAYMENT_METHODS: '67af3ffe0011106c4575'
  },
  
  // Collection IDs
  COLLECTIONS: {
    PROFILES: '67af4020000dd2ff4e80',
    JOBS: '67b8f57b0018fe4fcde7',
    WALLETS: '67b8f60d00178b6d01be',
    BALANCES: '67b8f63c00172b99e3c3',
    BOOKMARKS: '67af402800115f2e70d7',
    TRANSACTIONS: '67af402f001128cc747c',
    PROJECTS: '67af40390011d6fa12e0',
    MESSAGES: '67af404100113ec99acd',
    NOTIFICATIONS: '67af4049001156d17ea6',
    PAYMENT_METHODS: '67af40500011c02d90cb'
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
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
};
