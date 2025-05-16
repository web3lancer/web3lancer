import BaseService from './baseService';
import { AppwriteService, ID, Query } from './appwriteService';
import { EnvConfig } from '@/config/environment';
import { SystemSetting, SystemMetric, SystemAuditLog } from '@/types/core';

/**
 * SystemService - Handles system-wide settings and metrics
 * 
 * This service manages platform settings, performance metrics,
 * and system audit logs.
 */
class SystemService extends BaseService {
  constructor(
    protected appwrite: AppwriteService,
    protected config: EnvConfig
  ) {
    super(appwrite, config);
  }

  // System Settings
  async getSetting(key: string): Promise<SystemSetting | null> {
    return this.handleRequest(
      async () => {
        const settings = await this.appwrite.listDocuments<SystemSetting>(
          this.config.core.databaseId,
          this.config.core.settingsCollectionId,
          [Query.equal('key', key)]
        );
        
        return settings.length > 0 ? settings[0] : null;
      },
      'getSetting'
    );
  }

  async getSettings(category?: string): Promise<SystemSetting[]> {
    return this.handleRequest(
      async () => {
        const queries = category 
          ? [Query.equal('category', category)] 
          : [];
        
        return await this.appwrite.listDocuments<SystemSetting>(
          this.config.core.databaseId,
          this.config.core.settingsCollectionId,
          queries
        );
      },
      'getSettings'
    );
  }

  async updateSetting(key: string, value: any): Promise<SystemSetting> {
    return this.handleRequest(
      async () => {
        // First check if the setting exists
        const existingSetting = await this.getSetting(key);
        
        if (existingSetting) {
          // Update existing setting
          return await this.appwrite.updateDocument<SystemSetting>(
            this.config.core.databaseId,
            this.config.core.settingsCollectionId,
            existingSetting.$id,
            { 
              value,
              updatedAt: new Date().toISOString()
            }
          );
        } else {
          // Create new setting if it doesn't exist
          return await this.appwrite.createDocument<SystemSetting>(
            this.config.core.databaseId,
            this.config.core.settingsCollectionId,
            ID.unique(),
            {
              key,
              value,
              category: 'general', // Default category
              isPublic: false, // Default to private
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          );
        }
      },
      'updateSetting'
    );
  }

  async createSetting(setting: Omit<SystemSetting, '$id' | '$createdAt' | '$updatedAt'>): Promise<SystemSetting> {
    return this.handleRequest(
      async () => {
        // Check if setting already exists
        const existingSetting = await this.getSetting(setting.key);
        
        if (existingSetting) {
          throw new Error(`Setting with key '${setting.key}' already exists`);
        }
        
        return await this.appwrite.createDocument<SystemSetting>(
          this.config.core.databaseId,
          this.config.core.settingsCollectionId,
          ID.unique(),
          {
            ...setting,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        );
      },
      'createSetting'
    );
  }

  async deleteSetting(key: string): Promise<void> {
    return this.handleRequest(
      async () => {
        const existingSetting = await this.getSetting(key);
        
        if (!existingSetting) {
          throw new Error(`Setting with key '${key}' not found`);
        }
        
        await this.appwrite.deleteDocument(
          this.config.core.databaseId,
          this.config.core.settingsCollectionId,
          existingSetting.$id
        );
      },
      'deleteSetting'
    );
  }

  // System Metrics
  async recordMetric(metric: Omit<SystemMetric, '$id' | '$createdAt' | '$updatedAt'>): Promise<SystemMetric> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.createDocument<SystemMetric>(
          this.config.core.databaseId,
          this.config.core.metricsCollectionId,
    queries.push(Query.orderAsc('order'));
    
    return this.appwrite.listDocuments<Category>(
      this.databaseId,
      this.categoriesCollectionId,
      queries
    );
  }

  async getTopLevelCategories(includeInactive = false): Promise<Category[]> {
    const queries = [Query.isNull('parentId')];
    if (!includeInactive) {
      queries.push(Query.equal('isActive', true));
    }
    queries.push(Query.orderAsc('order'));
    
    return this.appwrite.listDocuments<Category>(
      this.databaseId,
      this.categoriesCollectionId,
      queries
    );
  }

  async getSubcategories(parentId: string, includeInactive = false): Promise<Category[]> {
    const queries = [Query.equal('parentId', parentId)];
    if (!includeInactive) {
      queries.push(Query.equal('isActive', true));
    }
    queries.push(Query.orderAsc('order'));
    
    return this.appwrite.listDocuments<Category>(
      this.databaseId,
      this.categoriesCollectionId,
      queries
    );
  }

  // Platform Settings
  async getSetting(key: string): Promise<PlatformSetting | null> {
    // We use key as the document ID for settings
    try {
      return await this.appwrite.getDocument<PlatformSetting>(
        this.databaseId,
        this.settingsCollectionId,
        key
      );
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error);
      return null;
    }
  }

  async getSettingValue<T>(key: string, defaultValue: T): Promise<T> {
    const setting = await this.getSetting(key);
    return setting ? (setting.value as T) : defaultValue;
  }

  async updateSetting(key: string, value: any, description?: string): Promise<PlatformSetting> {
    try {
      // Try to get the setting first to see if it exists
      const existing = await this.getSetting(key);
      
      if (existing) {
        // Update existing setting
        return this.appwrite.updateDocument<PlatformSetting>(
          this.databaseId,
          this.settingsCollectionId,
          key,
          {
            value,
            description: description || existing.description,
            updatedAt: new Date().toISOString()
          }
        );
      } else {
        // Create new setting
        return this.appwrite.createDocument<PlatformSetting>(
          this.databaseId,
          this.settingsCollectionId,
          key, // Use key as the document ID
          {
            key,
            value,
            description: description || `Setting for ${key}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        );
      }
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      throw error;
    }
  }

  async deleteSetting(key: string): Promise<void> {
    return this.appwrite.deleteDocument(
      this.databaseId,
      this.settingsCollectionId,
      key
    );
  }

  async listSettings(): Promise<PlatformSetting[]> {
    return this.appwrite.listDocuments<PlatformSetting>(
      this.databaseId,
      this.settingsCollectionId,
      []
    );
  }

  // Helper methods for common platform settings
  async getCommissionRate(): Promise<number> {
    return this.getSettingValue<number>('commission_rate', 0.05);
  }

  async getEscrowReleaseDelay(): Promise<number> {
    return this.getSettingValue<number>('escrow_release_delay_hours', 24);
  }

  async getDisputeVotingPeriod(): Promise<number> {
    return this.getSettingValue<number>('dispute_voting_period_days', 7);
  }

  async getProposalVotingThreshold(): Promise<number> {
    return this.getSettingValue<number>('proposal_voting_threshold', 0.51);
  }

  async getMaintenanceMode(): Promise<boolean> {
    return this.getSettingValue<boolean>('maintenance_mode', false);
  }

  async getMinimumWithdrawal(): Promise<Record<string, number>> {
    return this.getSettingValue<Record<string, number>>('minimum_withdrawal', {
      USD: 25,
      EUR: 25,
      ETH: 0.01,
      BTC: 0.001
    });
  }
}

export default SystemService;