import { AppwriteService, ID, Query } from '@/services/appwriteService';
import { EnvService } from '@/services/envService';
import { Skill, Category, PlatformSetting } from '@/types/system';

/**
 * System Service for managing platform settings, skills, and categories
 * Follows best practices from Cross-Cutting Concerns section
 */
class SystemService {
  private databaseId: string;
  private skillsCollectionId: string;
  private categoriesCollectionId: string;
  private settingsCollectionId: string;
  
  constructor(
    private appwrite: AppwriteService,
    private env: EnvService<'core'>
  ) {
    this.databaseId = this.env.databaseId;
    this.skillsCollectionId = this.env.get('collectionAppSkills');
    this.categoriesCollectionId = this.env.get('collectionAppCategories');
    this.settingsCollectionId = this.env.get('collectionPlatformSettings');
  }

  // Skills
  async createSkill(data: { name: string; description?: string; isActive?: boolean }): Promise<Skill> {
    return this.appwrite.createDocument<Skill>(
      this.databaseId,
      this.skillsCollectionId,
      ID.unique(),
      {
        ...data,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
  }

  async getSkill(skillId: string): Promise<Skill | null> {
    return this.appwrite.getDocument<Skill>(
      this.databaseId,
      this.skillsCollectionId,
      skillId
    );
  }

  async updateSkill(skillId: string, data: Partial<Skill>): Promise<Skill> {
    return this.appwrite.updateDocument<Skill>(
      this.databaseId,
      this.skillsCollectionId,
      skillId,
      {
        ...data,
        updatedAt: new Date().toISOString()
      }
    );
  }

  async deleteSkill(skillId: string): Promise<void> {
    return this.appwrite.deleteDocument(
      this.databaseId,
      this.skillsCollectionId,
      skillId
    );
  }

  async listSkills(includeInactive = false): Promise<Skill[]> {
    const queries = includeInactive ? [] : [Query.equal('isActive', true)];
    return this.appwrite.listDocuments<Skill>(
      this.databaseId,
      this.skillsCollectionId,
      queries
    );
  }

  async searchSkills(searchTerm: string, includeInactive = false): Promise<Skill[]> {
    const queries = [Query.search('name', searchTerm)];
    if (!includeInactive) {
      queries.push(Query.equal('isActive', true));
    }
    
    return this.appwrite.listDocuments<Skill>(
      this.databaseId,
      this.skillsCollectionId,
      queries
    );
  }

  // Categories
  async createCategory(data: {
    name: string;
    description?: string;
    parentId?: string;
    order?: number;
    isActive?: boolean;
  }): Promise<Category> {
    return this.appwrite.createDocument<Category>(
      this.databaseId,
      this.categoriesCollectionId,
      ID.unique(),
      {
        ...data,
        isActive: data.isActive !== undefined ? data.isActive : true,
        order: data.order || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
  }

  async getCategory(categoryId: string): Promise<Category | null> {
    return this.appwrite.getDocument<Category>(
      this.databaseId,
      this.categoriesCollectionId,
      categoryId
    );
  }

  async updateCategory(categoryId: string, data: Partial<Category>): Promise<Category> {
    return this.appwrite.updateDocument<Category>(
      this.databaseId,
      this.categoriesCollectionId,
      categoryId,
      {
        ...data,
        updatedAt: new Date().toISOString()
      }
    );
  }

  async deleteCategory(categoryId: string): Promise<void> {
    return this.appwrite.deleteDocument(
      this.databaseId,
      this.categoriesCollectionId,
      categoryId
    );
  }

  async listCategories(includeInactive = false): Promise<Category[]> {
    const queries = includeInactive ? [] : [Query.equal('isActive', true)];
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