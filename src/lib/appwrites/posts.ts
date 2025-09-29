import {
  databases,
  ID,
  Query,
} from '@/lib/appwrites/client';
import {
  COL,
  DB,
} from '@/lib/appwrites/constants';
import type * as AppwriteTypes from '@/types/appwrite.d';

// --- Posts ---
export async function createPost(data: Partial<AppwriteTypes.Posts & { postType?: string }>) {
  return databases.createDocument<AppwriteTypes.Posts>(DB.CONTENT, COL.POSTS, ID.unique(), data);
}
export async function getPost(postId: string) {
  return databases.getDocument<AppwriteTypes.Posts>(DB.CONTENT, COL.POSTS, postId);
}
export async function updatePost(postId: string, data: Partial<AppwriteTypes.Posts>) {
  return databases.updateDocument<AppwriteTypes.Posts>(DB.CONTENT, COL.POSTS, postId, data);
}
export async function listPosts(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Posts>(DB.CONTENT, COL.POSTS, queries);
}

// --- Post Interactions ---
export async function createPostInteraction(data: Partial<AppwriteTypes.PostInteractions>) {
  return databases.createDocument<AppwriteTypes.PostInteractions>(DB.CONTENT, COL.POST_INTERACTIONS, ID.unique(), data);
}
export async function listPostInteractions(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.PostInteractions>(DB.CONTENT, COL.POST_INTERACTIONS, queries);
}
export async function getPostInteraction(postId: string, userId: string) {
    const response = await listPostInteractions([
        Query.equal('postId', postId),
        Query.equal('userId', userId),
    ]);
    return response.documents[0];
}
export async function deletePostInteraction(interactionId: string) {
    return databases.deleteDocument(DB.CONTENT, COL.POST_INTERACTIONS, interactionId);
}

// --- Comments ---
export async function createComment(data: Partial<AppwriteTypes.PostInteractions>) {
    return databases.createDocument<AppwriteTypes.PostInteractions>(DB.CONTENT, COL.POST_INTERACTIONS, ID.unique(), { ...data, interactions: 'comment' });
}

export async function listComments(postId: string) {
    return listPostInteractions([
        Query.equal('postId', postId),
        Query.equal('interactions', 'comment'),
    ]);
}


// --- Bookmarks ---
export async function createBookmark(data: AppwriteTypes.Bookmarks) {
  return databases.createDocument<AppwriteTypes.Bookmarks>(DB.CONTENT, COL.BOOKMARKS, ID.unique(), data);
}
export async function listBookmarks(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Bookmarks>(DB.CONTENT, COL.BOOKMARKS, queries);
}
export async function getBookmark(postId: string, userId: string) {
    const response = await listBookmarks([
        Query.equal('itemId', postId),
        Query.equal('profileId', userId),
    ]);
    return response.documents[0];
}
export async function deleteBookmark(bookmarkId: string) {
    return databases.deleteDocument(DB.CONTENT, COL.BOOKMARKS, bookmarkId);
}

// --- Portfolios ---
export async function createPortfolio(data: Partial<AppwriteTypes.Portfolios>) {
  return databases.createDocument<AppwriteTypes.Portfolios>(DB.CONTENT, COL.PORTFOLIOS, ID.unique(), data);
}
export async function listPortfolios(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Portfolios>(DB.CONTENT, COL.PORTFOLIOS, queries);
}

// --- Articles ---
export async function createArticle(data: Partial<AppwriteTypes.Articles>) {
  return databases.createDocument<AppwriteTypes.Articles>(DB.CONTENT, COL.ARTICLES, ID.unique(), data);
}
export async function listArticles(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Articles>(DB.CONTENT, COL.ARTICLES, queries);
}
