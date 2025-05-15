import { Client, ID, Query } from 'appwrite';
import { Connection } from '@/types/content';
import * as env from '@/lib/env';

class SocialService {
  private client: Client;
  
  constructor() {
    this.client = new Client();
    this.client
      .setEndpoint(env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
  }
  
  async followUser(followerId: string, followingId: string): Promise<Connection> {
    try {
      const response = await fetch('/api/v1/social/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerId,
          followingId
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to follow user');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in followUser:', error);
      throw error;
    }
  }
  
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    try {
      const response = await fetch('/api/v1/social/unfollow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerId,
          followingId
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to unfollow user');
      }
    } catch (error) {
      console.error('Error in unfollowUser:', error);
      throw error;
    }
  }
  
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/v1/social/following?followerId=${followerId}&followingId=${followingId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to check follow status');
      }
      
      const result = await response.json();
      return result.isFollowing;
    } catch (error) {
      console.error('Error in isFollowing:', error);
      throw error;
    }
  }
  
  async getFollowers(profileId: string): Promise<Connection[]> {
    try {
      const response = await fetch(`/api/v1/social/followers/${profileId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get followers');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in getFollowers:', error);
      throw error;
    }
  }
  
  async getFollowing(profileId: string): Promise<Connection[]> {
    try {
      const response = await fetch(`/api/v1/social/following/${profileId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get following');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in getFollowing:', error);
      throw error;
    }
  }
  
  async connectWithUser(requesterId: string, receiverId: string): Promise<Connection> {
    try {
      const response = await fetch('/api/v1/social/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requesterId,
          receiverId
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send connection request');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in connectWithUser:', error);
      throw error;
    }
  }
  
  async acceptConnection(connectionId: string): Promise<Connection> {
    try {
      const response = await fetch(`/api/v1/social/connect/${connectionId}/accept`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to accept connection');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in acceptConnection:', error);
      throw error;
    }
  }
  
  async rejectConnection(connectionId: string): Promise<Connection> {
    try {
      const response = await fetch(`/api/v1/social/connect/${connectionId}/reject`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reject connection');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in rejectConnection:', error);
      throw error;
    }
  }
  
  async disconnectFromUser(profileId: string, connectedProfileId: string): Promise<void> {
    try {
      const response = await fetch('/api/v1/social/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId,
          connectedProfileId
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to disconnect from user');
      }
    } catch (error) {
      console.error('Error in disconnectFromUser:', error);
      throw error;
    }
  }
  
  async getConnections(profileId: string): Promise<Connection[]> {
    try {
      const response = await fetch(`/api/v1/social/connections/${profileId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get connections');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in getConnections:', error);
      throw error;
    }
  }
  
  async getPendingConnectionRequests(profileId: string): Promise<Connection[]> {
    try {
      const response = await fetch(`/api/v1/social/connections/pending/${profileId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get pending connection requests');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in getPendingConnectionRequests:', error);
      throw error;
    }
  }
}

const socialService = new SocialService();
export default socialService;