/**
 * Configuration Checker
 * 
 * Utility to check that the configuration matches the appwrite-database.md documentation
 * and validate database structure at runtime.
 */

import { validateDatabaseConfig } from './dbConfig';
import { APPWRITE_CONFIG } from '@/lib/env';

/**
 * Check database configuration against appwrite-database.md documentation
 * This should be run during initialization in development
 */
export async function checkDatabaseConfig(): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Checking Appwrite database configuration...');
    
    try {
      const { valid, results } = await validateDatabaseConfig();
      
      if (valid) {
        console.log('✅ All database collections validated successfully!');
      } else {
        console.error('❌ Some database collections failed validation:');
        results.filter(r => !r.exists).forEach(r => {
          console.error(`  - ${r.databaseId}/${r.collectionId}: ${r.error}`);
        });
      }
    } catch (error) {
      console.error('Failed to validate database configuration:', error);
    }
  }
}

/**
 * Check that all required config values are present
 */
export function checkConfigValues(): void {
  const missingDatabases = [];
  const missingCollections = [];
  
  // Database IDs from appwrite-database.md
  const requiredDatabases = [
    'USERS', 'JOBS', 'WALLET', 'BOOKMARKS', 'TRANSACTIONS', 
    'PROJECTS', 'MESSAGES', 'NOTIFICATIONS', 'PAYMENT_METHODS'
  ];
  
  // Collection IDs from appwrite-database.md
  const requiredCollections = [
    'PROFILES', 'JOBS', 'APPLICATIONS', 'REVIEWS', 'WALLETS',
    'BALANCES', 'CRYPTO_TRANSACTIONS', 'BOOKMARKS', 'CATEGORIES',
    'TRANSACTIONS', 'PROJECTS', 'TASKS', 'MESSAGES', 
    'NOTIFICATIONS', 'CONNECTIONS', 'PAYMENT_METHODS'
  ];
  
  // Check databases
  requiredDatabases.forEach(db => {
    if (!APPWRITE_CONFIG.DATABASES[db]) {
      missingDatabases.push(db);
    }
  });
  
  // Check collections
  requiredCollections.forEach(col => {
    if (!APPWRITE_CONFIG.COLLECTIONS[col]) {
      missingCollections.push(col);
    }
  });
  
  // Report issues
  if (missingDatabases.length > 0 || missingCollections.length > 0) {
    console.error('❌ Configuration issues detected:');
    
    if (missingDatabases.length > 0) {
      console.error(`  Missing databases: ${missingDatabases.join(', ')}`);
    }
    
    if (missingCollections.length > 0) {
      console.error(`  Missing collections: ${missingCollections.join(', ')}`);
    }
    
    console.error('Please update your configuration based on appwrite-database.md');
  } else {
    console.log('✅ All required configuration values present');
  }
}
