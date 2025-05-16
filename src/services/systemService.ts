import { AppwriteService } from './appwriteService';
import { 
  CORE_DATABASE_ID,
  SYSTEM_SETTINGS_COLLECTION_ID,
  SYSTEM_METRICS_COLLECTION_ID,
  SYSTEM_AUDIT_LOGS_COLLECTION_ID
} from '@/lib/env';
import { SystemSetting, SystemMetric, SystemAuditLog } from '@/types/governance';
import { ID, Query } from 'appwrite';

class SystemService {
  private databaseId: string;
  private settingsCollectionId: string;
  private metricsCollectionId: string;
  private auditLogsCollectionId: string;

  constructor(private appwrite: AppwriteService) {
    this.databaseId = CORE_DATABASE_ID;
    this.settingsCollectionId = SYSTEM_SETTINGS_COLLECTION_ID;
    this.metricsCollectionId = SYSTEM_METRICS_COLLECTION_ID;
    this.auditLogsCollectionId = SYSTEM_AUDIT_LOGS_COLLECTION_ID;
  }

  // System Settings
  async getSetting(key: string): Promise<SystemSetting | null> {
    try {
      const settings = await this.appwrite.listDocuments<SystemSetting>(
        this.databaseId,
        this.settingsCollectionId,
        [Query.equal('key', key)]
      );
      
      return settings.length > 0 ? settings[0] : null;
    } catch (error) {
      console.error('Error fetching setting:', error);
      return null;
    }
  }

  async getPublicSettings(): Promise<SystemSetting[]> {
    return this.appwrite.listDocuments<SystemSetting>(
      this.databaseId,
      this.settingsCollectionId,
      [Query.equal('isPublic', true)]
    );
  }

  async updateSetting(key: string, value: string): Promise<SystemSetting | null> {
    try {
      const setting = await this.getSetting(key);
      
      if (!setting) return null;
      
      return this.appwrite.updateDocument<SystemSetting>(
        this.databaseId,
        this.settingsCollectionId,
        setting.$id,
        { value }
      );
    } catch (error) {
      console.error('Error updating setting:', error);
      return null;
    }
  }

  async createSetting(data: Omit<SystemSetting, '$id' | '$createdAt' | '$updatedAt'>): Promise<SystemSetting> {
    return this.appwrite.createDocument<SystemSetting>(
      this.databaseId,
      this.settingsCollectionId,
      ID.unique(),
      data
    );
  }

  // System Metrics
  async recordMetric(metric: string, value: number, interval: SystemMetric['interval'] = 'daily'): Promise<SystemMetric> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    return this.appwrite.createDocument<SystemMetric>(
      this.databaseId,
      this.metricsCollectionId,
      ID.unique(),
      {
        metric,
        value,
        date: today,
        interval
      }
    );
  }

  async getMetrics(metric: string, startDate?: string, endDate?: string, interval?: SystemMetric['interval']): Promise<SystemMetric[]> {
    const queries: string[] = [Query.equal('metric', metric)];
    
    if (startDate) {
      queries.push(Query.greaterThanEqual('date', startDate));
    }
    
    if (endDate) {
      queries.push(Query.lessThanEqual('date', endDate));
    }
    
    if (interval) {
      queries.push(Query.equal('interval', interval));
    }
    
    queries.push(Query.orderAsc('date'));
    
    return this.appwrite.listDocuments<SystemMetric>(
      this.databaseId,
      this.metricsCollectionId,
      queries
    );
  }

  // System Audit Logs
  async createAuditLog(data: Omit<SystemAuditLog, '$id' | '$createdAt' | '$updatedAt'>): Promise<SystemAuditLog> {
    return this.appwrite.createDocument<SystemAuditLog>(
      this.databaseId,
      this.auditLogsCollectionId,
      ID.unique(),
      data
    );
  }

  async listAuditLogs(queries: string[] = []): Promise<SystemAuditLog[]> {
    const defaultQueries = [
      ...queries,
      Query.orderDesc('$createdAt')
    ];
    
    return this.appwrite.listDocuments<SystemAuditLog>(
      this.databaseId,
      this.auditLogsCollectionId,
      defaultQueries
    );
  }
}

export default SystemService;