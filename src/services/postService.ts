import { Client, ID, Storage, Query } from 'appwrite';
import { Post } from '@/types';
import env from '@/lib/env';

class PostService {
  private client: Client;
  private storage: Storage;
  
  constructor() {
    this.client = new Client();
    this.client
      .setEndpoint(env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    
    this.storage = new Storage(this.client);
  }
  
  async createPost(
    profileId: string,
    content: string,
    tags: string[] = [],
    files?: File[]
  ): Promise<Post> {
    try {
      // 1. Upload media files if any
      let mediaFileIds: string[] = [];
      
      if (files && files.length > 0) {
        const uploadPromises = files.map(file => 
          this.storage.createFile(
            env.NEXT_PUBLIC_APPWRITE_BUCKET_POST_MEDIA_ID,
            ID.unique(),
            file
          )
        );
        
        const uploadResults = await Promise.all(uploadPromises);
        mediaFileIds = uploadResults.map(result => result.$id);
      }
      
      // 2. Create the post document
      const response = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorId: profileId,
          content,
          tags,
          mediaFileIds,
          visibility: 'public', // Default to public
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create post');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in createPost:', error);
      throw error;
    }
  }
  
  async getPost(postId: string): Promise<Post> {
    try {
      const response = await fetch(`/api/v1/posts/${postId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get post');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in getPost:', error);
      throw error;
    }
  }
  
  async updatePost(
    postId: string,
    data: Partial<Post>,
    files?: File[]
  ): Promise<Post> {
    try {
      // 1. Upload new media files if any
      let mediaFileIds: string[] = data.mediaFileIds || [];
      
      if (files && files.length > 0) {
        const uploadPromises = files.map(file => 
          this.storage.createFile(
            env.NEXT_PUBLIC_APPWRITE_BUCKET_POST_MEDIA_ID,
            ID.unique(),
            file
          )
        );
        
        const uploadResults = await Promise.all(uploadPromises);
        const newMediaFileIds = uploadResults.map(result => result.$id);
        mediaFileIds = [...mediaFileIds, ...newMediaFileIds];
      }
      
      // 2. Update the post
      const response = await fetch(`/api/v1/posts/${postId}`, {
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
        throw new Error(error.message || 'Failed to update post');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in updatePost:', error);
      throw error;
    }
  }
  
  async deletePost(postId: string): Promise<void> {
    try {
      const response = await fetch(`/api/v1/posts/${postId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error in deletePost:', error);
      throw error;
    }
  }
  
  async getUserPosts(profileId: string, limit: number = 10, offset: number = 0): Promise<Post[]> {
    try {
      const response = await fetch(`/api/v1/posts/user/${profileId}?limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get user posts');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in getUserPosts:', error);
      throw error;
    }
  }
  
  async getFeed(limit: number = 10, offset: number = 0): Promise<Post[]> {
    try {
      const response = await fetch(`/api/v1/posts/feed?limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get feed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in getFeed:', error);
      throw error;
    }
  }
  
  async likePost(postId: string): Promise<void> {
    try {
      const response = await fetch(`/api/v1/posts/${postId}/like`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to like post');
      }
    } catch (error) {
      console.error('Error in likePost:', error);
      throw error;
    }
  }
  
  async unlikePost(postId: string): Promise<void> {
    try {
      const response = await fetch(`/api/v1/posts/${postId}/like`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to unlike post');
      }
    } catch (error) {
      console.error('Error in unlikePost:', error);
      throw error;
    }
  }
  
  async getPostMedia(fileId: string): Promise<string> {
    try {
      return this.storage.getFileView(env.NEXT_PUBLIC_APPWRITE_BUCKET_POST_MEDIA_ID, fileId).toString();
    } catch (error) {
      console.error('Error in getPostMedia:', error);
      throw error;
    }
  }
}

const postService = new PostService();
export default postService;