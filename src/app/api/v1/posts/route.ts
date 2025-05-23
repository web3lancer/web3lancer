import { NextRequest, NextResponse } from 'next/server';
import { databases, storage } from '@/lib/appwrite';
import { getSession } from '@/utils/auth';
import * as env from '@/lib/env';
import { ID } from '@/app/appwrite';
/**
 * Get user's feed (posts from people they follow)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // First, get the profiles that the user follows
    const followedProfilesQuery = await databases.listDocuments(
      env.SOCIAL_DATABASE_ID,
      env.USER_CONNECTIONS_COLLECTION_ID,
      [
        /* Query for followerId = current user's profile ID */
      ]
    );
    
    const followedProfileIds = followedProfilesQuery.documents.map(doc => doc.followingId);
    
    // Then, get posts from those profiles
    const posts = await databases.listDocuments(
      env.CONTENT_DATABASE_ID,
      env.USER_POSTS_COLLECTION_ID,
      [
        /* Query for posts from followed profiles, ordered by createdAt */
      ]
    );
    
    // For each post, check if the current user has liked it
    const postsWithLikeInfo = await Promise.all(
      posts.documents.map(async (post) => {
        const likes = await databases.listDocuments(
          env.CONTENT_DATABASE_ID,
          env.POST_INTERACTIONS_COLLECTION_ID,
          [
            /* Query for interactions on this post from current user */
          ]
        );
        
        const isLiked = likes.documents.length > 0;
        
        return {
          ...post,
          isLikedByCurrentUser: isLiked,
          likesCount: post.likesCount || 0
        };
      })
    );
    
    return NextResponse.json(postsWithLikeInfo);
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json({ message: 'Failed to fetch feed' }, { status: 500 });
  }
}

/**
 * Create a new post
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const { authorId, content, tags, media, visibility } = await request.json();
    
    // Create post document
    const post = await databases.createDocument(
      env.CONTENT_DATABASE_ID,
      env.USER_POSTS_COLLECTION_ID,
      ID.unique(),
      {
        authorId,
        content,
        tags,
        media: media && Array.isArray(media) ? JSON.stringify(media) : media,
        likesCount: 0,
        commentsCount: 0,
        bookmarksCount: 0,
        viewsCount: 0,
        repostsCount: 0,
        visibility,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ message: 'Failed to create post' }, { status: 500 });
  }
}