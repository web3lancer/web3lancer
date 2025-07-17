import { AppwriteService, ID, Query } from '@/services/appwriteService';
import { EnvService } from '@/services/envService';
import { Post, Portfolio, Article, Bookmark, PostInteraction } from '@/types/content';

/**
 * Content Service for managing user-generated content
 * Follows best practices from Cross-Cutting Concerns section
 */
class ContentService {
  private databaseId: string;
  private postsCollectionId: string;
  private portfoliosCollectionId: string;
  private articlesCollectionId: string;
  private bookmarksCollectionId: string;
  private postInteractionsCollectionId: string;
  private postMediaBucketId: string;
  private portfolioMediaBucketId: string;
  
  constructor(
    private appwrite: AppwriteService,
    private env: EnvService<'content'>
  ) {
    this.databaseId = this.env.databaseId;
    this.postsCollectionId = this.env.get('collectionUserPosts');
    this.portfoliosCollectionId = this.env.get('collectionUserPortfolios');
    this.articlesCollectionId = this.env.get('collectionUserArticles');
    this.bookmarksCollectionId = this.env.get('collectionUserBookmarks');
    this.postInteractionsCollectionId = this.env.get('collectionPostInteractions');
    this.postMediaBucketId = this.env.get('bucketPostMedia');
    this.portfolioMediaBucketId = this.env.get('bucketPortfolioMedia');
  }

  // Posts
  async createPost(data: Omit<Post, '$id' | '$createdAt' | '$updatedAt'>): Promise<Post> {
    return this.appwrite.createDocument<Post>(this.databaseId, this.postsCollectionId, ID.unique(), data);
  }

  async getPost(postId: string): Promise<Post | null> {
    return this.appwrite.getDocument<Post>(this.databaseId, this.postsCollectionId, postId);
  }

  async listPosts(queries: string[] = []): Promise<Post[]> {
    return this.appwrite.listDocuments<Post>(this.databaseId, this.postsCollectionId, queries);
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
    return this.appwrite.listDocuments<Portfolio>(this.databaseId, this.portfoliosCollectionId, queries);
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
    return this.appwrite.listDocuments<Article>(this.databaseId, this.articlesCollectionId, queries);
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
    return this.appwrite.listDocuments<Bookmark>(this.databaseId, this.bookmarksCollectionId, queries);
  }

  async deleteBookmark(bookmarkId: string): Promise<void> {
    return this.appwrite.deleteDocument(this.databaseId, this.bookmarksCollectionId, bookmarkId);
  }
  
  // Post Interactions (Likes, Reposts, specific Bookmarks for posts if handled via PostInteractions)
  async createPostInteraction(data: Omit<PostInteraction, '$id' | '$createdAt' | '$updatedAt'>): Promise<PostInteraction> {
    return this.appwrite.createDocument<PostInteraction>(this.databaseId, this.postInteractionsCollectionId, ID.unique(), data);
  }

  async listPostInteractions(queries: string[] = []): Promise<PostInteraction[]> {
    return this.appwrite.listDocuments<PostInteraction>(this.databaseId, this.postInteractionsCollectionId, queries);
  }

  async deletePostInteraction(interactionId: string): Promise<void> {
    return this.appwrite.deleteDocument(this.databaseId, this.postInteractionsCollectionId, interactionId);
  }

  async getPostInteraction(userId: string, postId: string, interactionType: PostInteraction['interactionType']): Promise<PostInteraction | null> {
    const interactions = await this.appwrite.listDocuments<PostInteraction>(
      this.databaseId, 
      this.postInteractionsCollectionId, 
      [
        Query.equal('userId', userId),
        Query.equal('postId', postId),
        Query.equal('interactionType', interactionType),
        Query.limit(1)
      ]
    );
    
    return interactions.length > 0 ? interactions[0] : null;
  }

  // File Upload Methods
  async uploadPostMedia(file: File): Promise<string> {
    return this.appwrite.uploadFile(this.postMediaBucketId, file);
  }

  async uploadPortfolioMedia(file: File): Promise<string> {
    return this.appwrite.uploadFile(this.portfolioMediaBucketId, file);
  }

  async getPostMediaPreview(fileId: string, width = 800, height = 600): Promise<URL> {
    return this.appwrite.getFilePreview(this.postMediaBucketId, fileId, width, height);
  }

  async getPortfolioMediaPreview(fileId: string, width = 800, height = 600): Promise<URL> {
    return this.appwrite.getFilePreview(this.portfolioMediaBucketId, fileId, width, height);
  }

  async deletePostMedia(fileId: string): Promise<void> {
    return this.appwrite.deleteFile(this.postMediaBucketId, fileId);
  }

  async deletePortfolioMedia(fileId: string): Promise<void> {
    return this.appwrite.deleteFile(this.portfolioMediaBucketId, fileId);
  }
}

export default ContentService;
