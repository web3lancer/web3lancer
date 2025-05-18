import { NextRequest, NextResponse } from 'next/server';
import { databases, storage } from '@/lib/appwrite';
import { getSession } from '@/utils/auth';
import * as env from '@/lib/env';
import { ID } from '@/app/appwrite';

interface Params {
  params: {
    postId: string;
  };
}

// Get a specific post
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { postId } = params;
    
    const post = await databases.getDocument(
      env.CONTENT_DATABASE_ID,
      env.USER_POSTS_COLLECTION_ID,
      postId
    );
    

    // Check if the current user has liked this post
    const session = await getSession();
    if (session?.userId) {
      const likes = await databases.listDocuments(
        env.CONTENT_DATABASE_ID,
        env.POST_INTERACTIONS_COLLECTION_ID,
        [
          /* Query for interactions on this post from current user */
        ]
      );
      
      post.isLikedByCurrentUser = likes.documents.length > 0;
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ message: 'Failed to fetch post' }, { status: 500 });
  }
}

// Create a post
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { authorId, content, tags, media, visibility } = await request.json();
    // Create post document
    const mediaString = media && Array.isArray(media) ? JSON.stringify(media) : undefined;
    if (mediaString && mediaString.length > 1000) {
      return NextResponse.json({ message: 'Media attachments are too large. Please reduce the number or size of media files.' }, { status: 400 });
    }
    const post = await databases.createDocument(
      env.CONTENT_DATABASE_ID,
      env.USER_POSTS_COLLECTION_ID,
      ID.unique(),
      {
        authorId,
        content,
        tags,
        media: mediaString,
        visibility,
        likesCount: 0,
        commentsCount: 0,
        shares: 0,
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

// Update a post
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const { postId } = params;
    const updateData = await request.json();
    
    // First, verify that the user is the author of the post
    const post = await databases.getDocument(
      env.CONTENT_DATABASE_ID,
      env.USER_POSTS_COLLECTION_ID,
      postId
    );
    
    // Verify that the user is the author of the post
    if (post.authorId !== session.userId) {
      return NextResponse.json({ message: 'Forbidden: Not the author of this post' }, { status: 403 });
    }
    
    // Update the post
    const updatedPost = await databases.updateDocument(
      env.CONTENT_DATABASE_ID,
      env.USER_POSTS_COLLECTION_ID,
      postId,
      {
        ...updateData,
        updatedAt: new Date().toISOString()
      }
    );
    
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ message: 'Failed to update post' }, { status: 500 });
  }
}

// Delete a post
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const { postId } = params;
    
    // First, verify that the user is the author of the post
    const post = await databases.getDocument(
      env.CONTENT_DATABASE_ID,
      env.USER_POSTS_COLLECTION_ID,
      postId
    );
    
    // Verify that the user is the author of the post
    if (post.authorId !== session.userId) {
      return NextResponse.json({ message: 'Forbidden: Not the author of this post' }, { status: 403 });
    }
    
    // Delete the post's media files if any
    if (post.media && Array.isArray(post.media)) {
      for (const mediaObj of post.media) {
        try {
          await storage.deleteFile(
            env.POST_ATTACHMENTS_BUCKET_ID,
            mediaObj.fileId
          );
        } catch (error) {
          console.error(`Error deleting file ${mediaObj.fileId}:`, error);
        }
      }
    }
    
    // Delete the post
    await databases.deleteDocument(
      env.CONTENT_DATABASE_ID,
      env.USER_POSTS_COLLECTION_ID,
      postId
    );
    
    // Delete associated interactions (likes, comments, etc.)
    const interactions = await databases.listDocuments(
      env.CONTENT_DATABASE_ID,
      env.POST_INTERACTIONS_COLLECTION_ID,
      [
        /* Query for interactions on this post */
      ]
    );
    
    for (const interaction of interactions.documents) {
      await databases.deleteDocument(
        env.CONTENT_DATABASE_ID,
        env.POST_INTERACTIONS_COLLECTION_ID,
        interaction.$id
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ message: 'Failed to delete post' }, { status: 500 });
  }
}