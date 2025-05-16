import { AppwriteService } from '@/services/appwriteService';
import {
    CORE_DATABASE_ID,
    APP_SKILLS_COLLECTION_ID,
    APP_CATEGORIES_COLLECTION_ID,
    PLATFORM_SETTINGS_COLLECTION_ID
} from '@/lib/env';
import { Skill, Category, PlatformSetting } from '@/types/core';
import { ID, Query } from 'appwrite';

class CoreDataService {
    private databaseId: string;
    private skillsCollectionId: string;
    private categoriesCollectionId: string;
    private settingsCollectionId: string;

    constructor(private appwrite: AppwriteService) {
        this.databaseId = CORE_DATABASE_ID;
        this.skillsCollectionId = APP_SKILLS_COLLECTION_ID;
        this.categoriesCollectionId = APP_CATEGORIES_COLLECTION_ID;
        this.settingsCollectionId = PLATFORM_SETTINGS_COLLECTION_ID;
    }

    // Skills Management
    async createSkill(data: Omit<Skill, '$id' | '$createdAt' | '$updatedAt' | 'usageCount'>): Promise<Skill | null> {
        try {
            return this.appwrite.createDocument<Skill>(
                this.databaseId,
                this.skillsCollectionId,
                ID.unique(),
                { ...data, usageCount: 0 }
            );
        } catch (error) {
            console.error("Error creating skill:", error);
            return null;
        }
    }

    async getSkill(skillId: string): Promise<Skill | null> {
        try {
            return this.appwrite.getDocument<Skill>(
                this.databaseId,
                this.skillsCollectionId,
                skillId
            );
        } catch (error) {
            console.error("Error fetching skill:", error);
            return null;
        }
    }

    async getSkillByName(name: string): Promise<Skill | null> {
        try {
            const response = await this.appwrite.listDocuments<{ documents: Skill[] }>(
                this.databaseId,
                this.skillsCollectionId,
                [
                    Query.equal('name', name),
                    Query.limit(1)
                ]
            );

            return response.documents.length > 0 ? response.documents[0] : null;
        } catch (error) {
            console.error("Error fetching skill by name:", error);
            return null;
        }
    }

    async listSkills(limit: number = 100, offset: number = 0, category?: string): Promise<Skill[]> {
        try {
            const queries = [
                Query.orderDesc('usageCount'),
                Query.limit(limit),
                Query.offset(offset)
            ];

            if (category) {
                queries.unshift(Query.equal('category', category));
            }

            const response = await this.appwrite.listDocuments<{ documents: Skill[] }>(
                this.databaseId,
                this.skillsCollectionId,
                queries
            );

            return response.documents;
        } catch (error) {
            console.error("Error listing skills:", error);
            return [];
        }
    }

    async searchSkills(query: string, limit: number = 10): Promise<Skill[]> {
        try {
            const response = await this.appwrite.listDocuments<{ documents: Skill[] }>(
                this.databaseId,
                this.skillsCollectionId,
                [
                    Query.search('name', query),
                    Query.orderDesc('usageCount'),
                    Query.limit(limit)
                ]
            );

            return response.documents;
        } catch (error) {
            console.error("Error searching skills:", error);
            return [];
        }
    }

    async updateSkill(skillId: string, data: Partial<Omit<Skill, '$id' | '$createdAt' | '$updatedAt'>>): Promise<Skill | null> {
        try {
            return this.appwrite.updateDocument<Skill>(
                this.databaseId,
                this.skillsCollectionId,
                skillId,
                data
            );
        } catch (error) {
            console.error("Error updating skill:", error);
            return null;
        }
    }

    async incrementSkillUsage(skillId: string): Promise<boolean> {
        try {
            const skill = await this.getSkill(skillId);
            if (!skill) return false;

            await this.updateSkill(skillId, { usageCount: (skill.usageCount || 0) + 1 });
            return true;
        } catch (error) {
            console.error("Error incrementing skill usage:", error);
            return false;
        }
    }

    async deleteSkill(skillId: string): Promise<boolean> {
        try {
            await this.appwrite.deleteDocument(
                this.databaseId,
                this.skillsCollectionId,
                skillId
            );
            return true;
        } catch (error) {
            console.error("Error deleting skill:", error);
            return false;
        }
    }

    // Categories Management
    async createCategory(data: Omit<Category, '$id' | '$createdAt' | '$updatedAt' | 'usageCount'>): Promise<Category | null> {
        try {
            return this.appwrite.createDocument<Category>(
                this.databaseId,
                this.categoriesCollectionId,
                ID.unique(),
                { ...data, usageCount: 0 }
            );
        } catch (error) {
            console.error("Error creating category:", error);
            return null;
        }
    }

    async getCategory(categoryId: string): Promise<Category | null> {
        try {
            return this.appwrite.getDocument<Category>(
                this.databaseId,
                this.categoriesCollectionId,
                categoryId
            );
        } catch (error) {
            console.error("Error fetching category:", error);
            return null;
        }
    }

    async getCategoryBySlug(slug: string): Promise<Category | null> {
        try {
            const response = await this.appwrite.listDocuments<{ documents: Category[] }>(
                this.databaseId,
                this.categoriesCollectionId,
                [
                    Query.equal('slug', slug),
                    Query.limit(1)
                ]
            );

            return response.documents.length > 0 ? response.documents[0] : null;
        } catch (error) {
            console.error("Error fetching category by slug:", error);
            return null;
        }
    }

    async listCategories(parentCategoryId?: string): Promise<Category[]> {
        try {
            const queries = [Query.orderAsc('name')];

            if (parentCategoryId) {
                queries.unshift(Query.equal('parentCategoryId', parentCategoryId));
            } else {
                // Get root categories (those without a parent)
                queries.unshift(Query.isNull('parentCategoryId'));
            }

            const response = await this.appwrite.listDocuments<{ documents: Category[] }>(
                this.databaseId,
                this.categoriesCollectionId,
                queries
            );

            return response.documents;
        } catch (error) {
            console.error("Error listing categories:", error);
            return [];
        }
    }

    async updateCategory(categoryId: string, data: Partial<Omit<Category, '$id' | '$createdAt' | '$updatedAt'>>): Promise<Category | null> {
        try {
            return this.appwrite.updateDocument<Category>(
                this.databaseId,
                this.categoriesCollectionId,
                categoryId,
                data
            );
        } catch (error) {
            console.error("Error updating category:", error);
            return null;
        }
    }

    async deleteCategory(categoryId: string): Promise<boolean> {
        try {
            await this.appwrite.deleteDocument(
                this.databaseId,
                this.categoriesCollectionId,
                categoryId
            );
            return true;
        } catch (error) {
            console.error("Error deleting category:", error);
            return false;
        }
    }

    // Platform Settings Management
    async getPlatformSetting(key: string): Promise<PlatformSetting | null> {
        try {
            const response = await this.appwrite.listDocuments<{ documents: PlatformSetting[] }>(
                this.databaseId,
                this.settingsCollectionId,
                [
                    Query.equal('settingKey', key),
                    Query.limit(1)
                ]
            );

            return response.documents.length > 0 ? response.documents[0] : null;
        } catch (error) {
            console.error(`Error fetching platform setting ${key}:`, error);
            return null;
        }
    }

    async listPlatformSettings(group?: string): Promise<PlatformSetting[]> {
        try {
            const queries = group
                ? [Query.equal('group', group)]
                : [];

            const response = await this.appwrite.listDocuments<{ documents: PlatformSetting[] }>(
                this.databaseId,
                this.settingsCollectionId,
                queries
            );

            return response.documents;
        } catch (error) {
            console.error("Error listing platform settings:", error);
            return [];
        }
    }

    async updatePlatformSetting(settingId: string, value: any): Promise<PlatformSetting | null> {
        try {
            return this.appwrite.updateDocument<PlatformSetting>(
                this.databaseId,
                this.settingsCollectionId,
                settingId,
                { value }
            );
        } catch (error) {
            console.error("Error updating platform setting:", error);
            return null;
        }
    }

    async updatePlatformSettingByKey(key: string, value: any): Promise<PlatformSetting | null> {
        try {
            const setting = await this.getPlatformSetting(key);
            if (!setting) {
                throw new Error(`Setting with key ${key} not found`);
            }

            return this.updatePlatformSetting(setting.$id, value);
        } catch (error) {
            console.error(`Error updating platform setting ${key}:`, error);
            return null;
        }
    }

    async createPlatformSetting(data: Omit<PlatformSetting, '$id' | '$createdAt' | '$updatedAt'>): Promise<PlatformSetting | null> {
        try {
            // Check if setting with this key already exists
            const existing = await this.getPlatformSetting(data.settingKey);
            if (existing) {
                throw new Error(`Setting with key ${data.settingKey} already exists`);
            }

            return this.appwrite.createDocument<PlatformSetting>(
                this.databaseId,
                this.settingsCollectionId,
                ID.unique(),
                data
            );
        } catch (error) {
            console.error("Error creating platform setting:", error);
            return null;
        }
    }
}

export default CoreDataService;
