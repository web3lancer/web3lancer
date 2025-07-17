import BaseService from '@/services/baseService';
import { AppwriteService, ID, Query } from '@/services/appwriteService';
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
          ID.unique(),
          {
            ...metric,
            timestamp: metric.timestamp || new Date().toISOString()
          }
        );
      },
      'recordMetric'
    );
  }

  async getMetrics(metricName: string, startDate?: string, endDate?: string, limit: number = 100): Promise<SystemMetric[]> {
    return this.handleRequest(
      async () => {
        let queries = [
          Query.equal('name', metricName),
          Query.orderDesc('timestamp'),
          Query.limit(limit)
        ];
        
        if (startDate) {
          queries.push(Query.greaterThanEqual('timestamp', startDate));
        }
        
        if (endDate) {
          queries.push(Query.lessThanEqual('timestamp', endDate));
        }
        
        return await this.appwrite.listDocuments<SystemMetric>(
          this.config.core.databaseId,
          this.config.core.metricsCollectionId,
          queries
        );
      },
      'getMetrics'
    );
  }

  async getLatestMetric(metricName: string): Promise<SystemMetric | null> {
    return this.handleRequest(
      async () => {
        const metrics = await this.appwrite.listDocuments<SystemMetric>(
          this.config.core.databaseId,
          this.config.core.metricsCollectionId,
          [
            Query.equal('name', metricName),
            Query.orderDesc('timestamp'),
            Query.limit(1)
          ]
        );
        
        return metrics.length > 0 ? metrics[0] : null;
      },
      'getLatestMetric'
    );
  }

  // System Audit Logs
  async logAuditEvent(log: Omit<SystemAuditLog, '$id' | '$createdAt' | '$updatedAt'>): Promise<SystemAuditLog> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.createDocument<SystemAuditLog>(
          this.config.core.databaseId,
          this.config.core.auditLogsCollectionId,
          ID.unique(),
          {
            ...log,
            timestamp: log.timestamp || new Date().toISOString()
          }
        );
      },
      'logAuditEvent'
    );
  }

  async getAuditLogs(
    options: {
      userId?: string;
      action?: string;
      resourceType?: string;
      resourceId?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    } = {}
  ): Promise<SystemAuditLog[]> {
    return this.handleRequest(
      async () => {
        let queries: string[] = [Query.orderDesc('timestamp')];
        
        if (options.userId) {
          queries.push(Query.equal('userId', options.userId));
        }
        
        if (options.action) {
          queries.push(Query.equal('action', options.action));
        }
        
        if (options.resourceType) {
          queries.push(Query.equal('resourceType', options.resourceType));
        }
        
        if (options.resourceId) {
          queries.push(Query.equal('resourceId', options.resourceId));
        }
        
        if (options.startDate) {
          queries.push(Query.greaterThanEqual('timestamp', options.startDate));
        }
        
        if (options.endDate) {
          queries.push(Query.lessThanEqual('timestamp', options.endDate));
        }
        
        queries.push(Query.limit(options.limit || 50));
        
        return await this.appwrite.listDocuments<SystemAuditLog>(
          this.config.core.databaseId,
          this.config.core.auditLogsCollectionId,
          queries
        );
      },
      'getAuditLogs'
    );
  }

  // Platform Health Methods
  async getPlatformStatus(): Promise<{ 
    isHealthy: boolean; 
    services: { 
      name: string; 
      status: 'up' | 'down' | 'degraded'; 
      latency?: number; 
    }[]; 
    lastUpdated: string; 
  }> {
    return this.handleRequest(
      async () => {
        // In a real implementation, this would check various services
        // For now, we'll return a mock status
        return {
          isHealthy: true,
          services: [
            { name: 'database', status: 'up', latency: 10 },
            { name: 'storage', status: 'up', latency: 15 },
            { name: 'authentication', status: 'up', latency: 5 },
            { name: 'payment_processing', status: 'up', latency: 20 }
          ],
          lastUpdated: new Date().toISOString()
        };
      },
      'getPlatformStatus'
    );
  }

  // Feature Flag Support
  async getFeatureFlag(flagName: string, defaultValue: boolean = false): Promise<boolean> {
    return this.handleRequest(
      async () => {
        const setting = await this.getSetting(`feature_flag_${flagName}`);
        return setting ? setting.value === true : defaultValue;
      },
      'getFeatureFlag'
    );
  }

  async setFeatureFlag(flagName: string, enabled: boolean): Promise<SystemSetting> {
    return this.handleRequest(
      async () => {
        return await this.updateSetting(`feature_flag_${flagName}`, enabled);
      },
      'setFeatureFlag'
    );
  }

  // System Configuration Helpers
  async getAppConfig(): Promise<Record<string, any>> {
    return this.handleRequest(
      async () => {
        const configSettings = await this.getSettings('app_config');
        
        // Convert settings array to object
        return configSettings.reduce((config: Record<string, any>, setting) => {
          config[setting.key] = setting.value;
          return config;
        }, {});
      },
      'getAppConfig'
    );
  }

  async updateAppConfig(config: Record<string, any>): Promise<void> {
    return this.handleRequest(
      async () => {
        // Update each setting
        const updatePromises = Object.entries(config).map(([key, value]) => 
          this.updateSetting(key, value)
        );
        
        await Promise.all(updatePromises);
      },
      'updateAppConfig'
    );
  }
}

export default SystemService;