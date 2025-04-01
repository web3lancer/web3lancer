import { APPWRITE_CONFIG } from '@/lib/env';

/**
 * Database structure from appwrite-database.md
 */
const EXPECTED_CONFIG = {
  DATABASES: {
    USERS: '67b885280000d2cb5411',
    JOBS: '67af3ffe0011106c4575',
    WALLET: '67e629540014107023a2',
    BOOKMARKS: '67b885ed000038dd7ab9',
    TRANSACTIONS: '67b8866c00265d466063',
    PROJECTS: '67b88574002c6eb405a2',
    MESSAGES: '67b8864c0020483351b5',
    NOTIFICATIONS: '67b8862f00055127cd62',
    PAYMENT_METHODS: '67e62c92002bfdf969c9'
  },
  COLLECTIONS: {
    PROFILES: '67b8853c003c55c82ff6',
    JOBS: '67b8f57b0018fe4fcde7',
    APPLICATIONS: '67b8825d0022017188a8',
    REVIEWS: '67b884c10005b6971e9c',
    WALLETS: '67e629b1003bcc87679e',
    BALANCES: '67e62a5c00093534cc42',
    CRYPTO_TRANSACTIONS: '67e62b6f0003ed0e4ecc',
    BOOKMARKS: '67b8860100311b7d7939',
    CATEGORIES: '67b88607002255ac18fc',
    TRANSACTIONS: '67b8867b001643b2585a',
    PROJECTS: '67b885810006a89bc6a4',
    TASKS: '67b8858a00321bdbbf80',
    MESSAGES: '67b88658000bea7a7c7e',
    NOTIFICATIONS: '67b88639000157c7909d',
    CONNECTIONS: '67b88545001d27584d7e',
    PAYMENT_METHODS: '67e62cd3001975b82202'
  },
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
 * Validates the AppWrite configuration against expected values from documentation
 */
export function validateConfig() {
  const issues: string[] = [];
  
  // Check databases
  for (const [key, expectedId] of Object.entries(EXPECTED_CONFIG.DATABASES)) {
    const actualId = APPWRITE_CONFIG.DATABASES[key as keyof typeof APPWRITE_CONFIG.DATABASES];
    if (actualId !== expectedId) {
      issues.push(`Database ${key} has incorrect ID: expected ${expectedId}, got ${actualId}`);
    }
  }
  
  // Check for missing databases
  for (const key of Object.keys(EXPECTED_CONFIG.DATABASES)) {
    if (!APPWRITE_CONFIG.DATABASES.hasOwnProperty(key)) {
      issues.push(`Missing database ${key} in config`);
    }
  }
  
  // Check collections
  for (const [key, expectedId] of Object.entries(EXPECTED_CONFIG.COLLECTIONS)) {
    const actualId = APPWRITE_CONFIG.COLLECTIONS[key as keyof typeof APPWRITE_CONFIG.COLLECTIONS];
    if (actualId !== expectedId) {
      issues.push(`Collection ${key} has incorrect ID: expected ${expectedId}, got ${actualId}`);
    }
  }
  
  // Check for missing collections
  for (const key of Object.keys(EXPECTED_CONFIG.COLLECTIONS)) {
    if (!APPWRITE_CONFIG.COLLECTIONS.hasOwnProperty(key)) {
      issues.push(`Missing collection ${key} in config`);
    }
  }
  
  // Check storage buckets
  for (const [key, expectedId] of Object.entries(EXPECTED_CONFIG.STORAGE)) {
    const actualId = APPWRITE_CONFIG.STORAGE[key as keyof typeof APPWRITE_CONFIG.STORAGE];
    if (actualId !== expectedId) {
      issues.push(`Storage bucket ${key} has incorrect ID: expected ${expectedId}, got ${actualId}`);
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Run validation in development environment
 */
export function runValidation() {
  if (process.env.NODE_ENV === 'development') {
    const result = validateConfig();
    
    if (!result.isValid) {
      console.warn('⚠️ Appwrite configuration issues detected:');
      result.issues.forEach(issue => console.warn(`  - ${issue}`));
      console.warn('Please update your configuration to match appwrite-database.md');
    } else {
      console.log('✅ Appwrite configuration validated successfully');
    }
  }
}
