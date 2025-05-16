/**
 * Types for the System database
 */

export interface Skill {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  description?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformSetting {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  key: string;
  value: any;
  description?: string;
  createdAt: string;
  updatedAt: string;
}