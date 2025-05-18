import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { getSession } from '@/utils/auth';
import * as env from '@/lib/env';
import { ID } from "appwrite";

interface Params {
  params: {
    postId: string;
  };
}

// Like a post
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const { postId } = params;
    
    // Check if the user has already liked this post
    const existingLikes = await databases.listDocuments(
      env.CONTENT_DATABASE_ID,
      env.POST_INTERACTIONS_COLLECTION_ID,
      [
        /* Query for existing like from this user */
      ]
    );
    
    if (existingLikes.documents.length > 0) {
      return NextResponse.json({ message: 'Post already liked by user' }, { status: 400 });
    }
    
    // Create like interaction
    await databases.createDocument(
      env.CONTENT_DATABASE_ID,
      env.POST_INTERACTIONS_COLLECTION_ID,
      ID.unique(),
      {
        postId,
        userId: session.userId,
        interactionType: 'like',
        createdAt: new Date().toISOString()
      }
    );
    
    // Update post's likesCount
    const post = await databases.getDocument(
      env.CONTENT_DATABASE_ID,
      env.USER_POSTS_COLLECTION_ID,
      postId
    );
    
    const updatedPost = await databases.updateDocument(
      env.CONTENT_DATABASE_ID,
      env.USER_POSTS_COLLECTION_ID,
      postId,
      {
        likesCount: (post.likesCount || 0) + 1
      }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json({ message: 'Failed to like post' }, { status: 500 });
  }
}

// Unlike a post
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const { postId } = params;
    
    // Find the user's like interaction
    const existingLikes = await databases.listDocuments(
      env.CONTENT_DATABASE_ID,
      env.POST_INTERACTIONS_COLLECTION_ID,
      [
        /* Query for existing like from this user */
      ]
    );
    
    if (existingLikes.documents.length === 0) {
      return NextResponse.json({ message: 'Post not liked by user' }, { status: 400 });
    }
    
    // Delete the like interaction
    await databases.deleteDocument(
      env.CONTENT_DATABASE_ID,
      env.POST_INTERACTIONS_COLLECTION_ID,
      existingLikes.documents[0].$id
    );
    
    // Update post's likesCount
    const post = await databases.getDocument(
      env.CONTENT_DATABASE_ID,
      env.USER_POSTS_COLLECTION_ID,
      postId
    );
    
    const updatedPost = await databases.updateDocument(
      env.CONTENT_DATABASE_ID,
      env.USER_POSTS_COLLECTION_ID,
      postId,
      {
        likesCount: Math.max((post.likesCount || 0) - 1, 0)
      }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unliking post:', error);
    return NextResponse.json({ message: 'Failed to unlike post' }, { status: 500 });
  }
}