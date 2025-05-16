import { AppwriteService } from './appwriteService';
import {
    CONTENT_DATABASE_ID,
    USER_POSTS_COLLECTION_ID,
    USER_PORTFOLIOS_COLLECTION_ID,
    USER_ARTICLES_COLLECTION_ID,
    USER_BOOKMARKS_COLLECTION_ID,
    POST_INTERACTIONS_COLLECTION_ID
} from '@/lib/env';
import { Post, Portfolio, Article, Bookmark, PostInteraction } from '@/types/content';
import { ID, Query } from 'appwrite';

class ContentService {
  private databaseId: string;
  private postsCollectionId: string;
  private portfoliosCollectionId: string;
  private articlesCollectionId: string;
  private bookmarksCollectionId: string;
  private postInteractionsCollectionId: string;

  constructor(private appwrite: AppwriteService) {
    this.databaseId = CONTENT_DATABASE_ID;
    this.postsCollectionId = USER_POSTS_COLLECTION_ID;
    this.portfoliosCollectionId = USER_PORTFOLIOS_COLLECTION_ID;
    this.articlesCollectionId = USER_ARTICLES_COLLECTION_ID;
    this.bookmarksCollectionId = USER_BOOKMARKS_COLLECTION_ID;
    this.postInteractionsCollectionId = POST_INTERACTIONS_COLLECTION_ID;
  }

  // Posts
  async createPost(data: Omit<Post, '$id' | '$createdAt' | '$updatedAt'>): Promise<Post> {
    return this.appwrite.createDocument<Post>(this.databaseId, this.postsCollectionId, ID.unique(), data);
  }

  async getPost(postId: string): Promise<Post | null> {
    return this.appwrite.getDocument<Post>(this.databaseId, this.postsCollectionId, postId);
  }

  async listPosts(queries: string[] = []): Promise<Post[]> {
    const response = await this.appwrite.listDocuments<{ documents: Post[] }>(this.databaseId, this.postsCollectionId, queries);
    return response.documents;
  }

  async updatePost(postId: string, data: Partial<Post>): Promise<Post> {
    return this.appwrite.updateDocument<Post>(this.databaseId, this.postsCollectionId, postId, data);
  }

  async deletePost(postId: string): Promise<void> {
    return this.appwrite.deleteDocument(this.databaseId, this.postsCollectionId, postId);
  }

  // Portfolios
  async createPortfolio(data: Omit<Portfolio, '$id' | '$createdAt' | '$updatedAt'>): Promise<Portfolio> {
    return this.appwrite.createDocument<Portfolio>(this.databaseId, this.portfoliosCollectionId, ID.unique(), data);
  }

  async getPortfolio(portfolioId: string): Promise<Portfolio | null> {
    return this.appwrite.getDocument<Portfolio>(this.databaseId, this.portfoliosCollectionId, portfolioId);
  }

  async listPortfolios(queries: string[] = []): Promise<Portfolio[]> {
    const response = await this.appwrite.listDocuments<{ documents: Portfolio[] }>(this.databaseId, this.portfoliosCollectionId, queries);
    return response.documents;
  }

  async updatePortfolio(portfolioId: string, data: Partial<Portfolio>): Promise<Portfolio> {
    return this.appwrite.updateDocument<Portfolio>(this.databaseId, this.portfoliosCollectionId, portfolioId, data);
  }

  async deletePortfolio(portfolioId: string): Promise<void> {
    return this.appwrite.deleteDocument(this.databaseId, this.portfoliosCollectionId, portfolioId);
  }

  // Articles
  async createArticle(data: Omit<Article, '$id' | '$createdAt' | '$updatedAt'>): Promise<Article> {
    return this.appwrite.createDocument<Article>(this.databaseId, this.articlesCollectionId, ID.unique(), data);
  }

  async getArticle(articleId: string): Promise<Article | null> {
    return this.appwrite.getDocument<Article>(this.databaseId, this.articlesCollectionId, articleId);
  }

  async listArticles(queries: string[] = []): Promise<Article[]> {
    const response = await this.appwrite.listDocuments<{ documents: Article[] }>(this.databaseId, this.articlesCollectionId, queries);
    return response.documents;
  }

  async updateArticle(articleId: string, data: Partial<Article>): Promise<Article> {
    return this.appwrite.updateDocument<Article>(this.databaseId, this.articlesCollectionId, articleId, data);
  }

  async deleteArticle(articleId: string): Promise<void> {
    return this.appwrite.deleteDocument(this.databaseId, this.articlesCollectionId, articleId);
  }

  // Bookmarks
  async createBookmark(data: Omit<Bookmark, '$id' | '$createdAt' | '$updatedAt'>): Promise<Bookmark> {
    return this.appwrite.createDocument<Bookmark>(this.databaseId, this.bookmarksCollectionId, ID.unique(), data);
  }

  async getBookmark(bookmarkId: string): Promise<Bookmark | null> {
    return this.appwrite.getDocument<Bookmark>(this.databaseId, this.bookmarksCollectionId, bookmarkId);
  }

  async listBookmarks(queries: string[] = []): Promise<Bookmark[]> {
    // Ensure the user can only list their own bookmarks, typically by adding Query.equal('profileId', currentUserProfileId)
    // This logic should be handled either here by passing userId or in the calling function.
    const response = await this.appwrite.listDocuments<{ documents: Bookmark[] }>(this.databaseId, this.bookmarksCollectionId, queries);
    return response.documents;
  }

  async deleteBookmark(bookmarkId: string): Promise<void> {
    // Add permission check to ensure user can only delete their own bookmark
    return this.appwrite.deleteDocument(this.databaseId, this.bookmarksCollectionId, bookmarkId);
  }
  
  // Post Interactions (Likes, Reposts, specific Bookmarks for posts if handled via PostInteractions)
  async createPostInteraction(data: Omit<PostInteraction, '$id' | '$createdAt' | '$updatedAt'>): Promise<PostInteraction> {
    return this.appwrite.createDocument<PostInteraction>(this.databaseId, this.postInteractionsCollectionId, ID.unique(), data);
  }

  async listPostInteractions(queries: string[] = []): Promise<PostInteraction[]> {
    const response = await this.appwrite.listDocuments<{ documents: PostInteraction[] }>(this.databaseId, this.postInteractionsCollectionId, queries);
    return response.documents;
  }

  async deletePostInteraction(interactionId: string, userId: string): Promise<void> {
    // Optional: Add a check to ensure the user deleting the interaction is the one who created it.
    // This might involve fetching the interaction first, checking userId, then deleting.
    // Or, rely on Appwrite permissions.
    return this.appwrite.deleteDocument(this.databaseId, this.postInteractionsCollectionId, interactionId);
  }

  async getPostInteraction(userId: string, postId: string, interactionType: PostInteraction['interactionType']): Promise<PostInteraction | null> {
    const queries = [
        Query.equal('userId', userId),
        Query.equal('postId', postId),
        Query.equal('interactionType', interactionType),
        Query.limit(1)
    ];
    const response = await this.appwrite.listDocuments<{ documents: PostInteraction[] }>(this.databaseId, this.postInteractionsCollectionId, queries);
    return response.documents.length > 0 ? response.documents[0] : null;
  }
}

export default ContentService;
