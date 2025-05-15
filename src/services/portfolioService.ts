import { Client, ID, Storage, Query } from 'appwrite';
import { Portfolio } from '@/types/content';
import * as env from '@/lib/env';

class PortfolioService {
  private client: Client;
  private storage: Storage;
  
  constructor() {
    this.client = new Client();
    this.client
      .setEndpoint(env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    
    this.storage = new Storage(this.client);
  }
  
  async createPortfolio(
    profileId: string,
    title: string,
    description: string,
    skillsUsed: string[] = [],
    projectUrl?: string,
    completionDate?: string,
    files?: File[]
  ): Promise<Portfolio> {
    try {
      // 1. Upload media files if any
      let mediaFileIds: string[] = [];
      
      if (files && files.length > 0) {
        const uploadPromises = files.map(file => 
          this.storage.createFile(
            env.NEXT_PUBLIC_APPWRITE_BUCKET_PROJECT_MEDIA_ID,
            ID.unique(),
            file
          )
        );
        
        const uploadResults = await Promise.all(uploadPromises);
        mediaFileIds = uploadResults.map(result => result.$id);
      }
      
      // 2. Create the portfolio document
      const response = await fetch('/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId,
          title,
          description,
          skillsUsed,
          mediaFileIds,
          projectUrl,
          completionDate,
          visibility: 'public', // Default to public
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create portfolio');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in createPortfolio:', error);
      throw error;
    }
  }
  
  async getPortfolio(portfolioId: string): Promise<Portfolio> {
    try {
      const response = await fetch(`/api/v1/portfolios/${portfolioId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get portfolio');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in getPortfolio:', error);
      throw error;
    }
  }
  
  async updatePortfolio(
    portfolioId: string,
    data: Partial<Portfolio>,
    files?: File[]
  ): Promise<Portfolio> {
    try {
      // 1. Upload new media files if any
      let mediaFileIds: string[] = data.mediaFileIds || [];
      
      if (files && files.length > 0) {
        const uploadPromises = files.map(file => 
          this.storage.createFile(
            env.NEXT_PUBLIC_APPWRITE_BUCKET_PROJECT_MEDIA_ID,
            ID.unique(),
            file
          )
        );
        
        const uploadResults = await Promise.all(uploadPromises);
        const newMediaFileIds = uploadResults.map(result => result.$id);
        mediaFileIds = [...mediaFileIds, ...newMediaFileIds];
      }
      
      // 2. Update the portfolio
      const response = await fetch(`/api/v1/portfolios/${portfolioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          mediaFileIds,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update portfolio');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in updatePortfolio:', error);
      throw error;
    }
  }
  
  async deletePortfolio(portfolioId: string): Promise<void> {
    try {
      const response = await fetch(`/api/v1/portfolios/${portfolioId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete portfolio');
      }
    } catch (error) {
      console.error('Error in deletePortfolio:', error);
      throw error;
    }
  }
  
  async getUserPortfolios(profileId: string): Promise<Portfolio[]> {
    try {
      const response = await fetch(`/api/v1/portfolios/user/${profileId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get user portfolios');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in getUserPortfolios:', error);
      throw error;
    }
  }
  
  async getPortfolioMedia(fileId: string): Promise<string> {
    try {
      return this.storage.getFileView(env.NEXT_PUBLIC_APPWRITE_BUCKET_PROJECT_MEDIA_ID, fileId).toString();
    } catch (error) {
      console.error('Error in getPortfolioMedia:', error);
      throw error;
    }
  }
}

const portfolioService = new PortfolioService();
export default portfolioService;