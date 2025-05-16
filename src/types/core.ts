// filepath: /home/nathfavour/Documents/code/web3lancer/web3lancer/src/types/core.ts

/**
 * Represents a skill available on the platform.
 * Corresponds to the `app_skills` collection in `CoreDB`.
 */
export interface Skill {
  $id: string; // Appwrite document ID
  $createdAt: string;
  $updatedAt: string;
  name: string; // Skill name (e.g., "React", "Solidity") - Should be unique
  description?: string; // Optional description of the skill
  category?: string; // Optional categorization (e.g., "Frontend Development", "Blockchain")
  usageCount: number; // Denormalized count of how many profiles/jobs use this skill
  isVerified?: boolean; // Indicates if the skill is officially recognized or curated by the platform
}

/**
 * Represents a category for organizing content like jobs, articles, etc.
 * Corresponds to the `app_categories` collection in `CoreDB`.
 */
export interface Category {
  $id: string; // Appwrite document ID
  $createdAt: string;
  $updatedAt: string;
  name: string; // Category name (e.g., "Software Development") - Should be unique
  description?: string; // Optional description of the category
  parentCategoryId?: string; // For hierarchical categories (references Category.$id)
  icon?: string; // Icon identifier or URL
  usageCount?: number; // Denormalized count of items in this category
  slug?: string; // URL-friendly slug
}

/**
 * Represents a global platform setting.
 * Corresponds to the `platform_settings` collection in `CoreDB`.
 */
export interface PlatformSetting {
  $id: string; // Appwrite document ID, but settingKey is the primary identifier
  $createdAt: string;
  $updatedAt: string;
  settingKey: string; // The unique key for the setting (e.g., "defaultServiceFeePercentage")
  value: any; // The value of the setting (can be string, number, boolean, JSON object/array)
  description?: string; // Explanation of what the setting does
  type: 'string' | 'number' | 'boolean' | 'json' | 'array'; // Data type of the value for validation/parsing
  isEditableByAdmin: boolean; // Whether admins can change this setting via an admin panel
  group?: string; // Optional grouping for settings in an admin UI (e.g., "Fees", "Features")
}

// Core system data types
export interface SystemSetting {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  key: string;
  value: any;
  category: string; // e.g., 'general', 'appearance', 'billing', 'email', etc.
  description?: string;
  isPublic: boolean; // Whether this setting is exposed to client-side
  dataType?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  createdAt?: string; // ISO Date string
  updatedAt?: string; // ISO Date string
  createdById?: string; // UserProfile.$id of admin
  schema?: any; // JSON schema for validation
}

export interface SystemMetric {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  value: number;
  unit?: string;
  timestamp: string; // ISO Date string
  tags?: { [key: string]: string };
  dimensions?: {
    name: string;
    value: string;
  }[];
  metadata?: { [key: string]: any };
}

export interface SystemAuditLog {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string; // UserProfile.$id of the user who performed the action
  action: string; // e.g., 'create', 'update', 'delete', 'login', 'logout', etc.
  resourceType: string; // e.g., 'user', 'job', 'contract', 'setting', etc.
  resourceId?: string; // ID of the affected resource
  description: string;
  timestamp: string; // ISO Date string
  ipAddress?: string;
  userAgent?: string;
  changes?: {
    field: string;
    oldValue?: any;
    newValue?: any;
  }[];
  metadata?: { [key: string]: any };
  severity: 'info' | 'warning' | 'error' | 'critical';
  isSystemGenerated: boolean;
}
