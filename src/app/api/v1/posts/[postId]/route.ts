import { NextRequest, NextResponse } from 'next/server';
import { databases, storage } from '@/lib/appwrite';
import { getSession } from '@/utils/auth';
import env from '@/lib/env';

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
      env.NEXT_PUBLIC_APPWRITE_DATABASE_CONTENT_ID,
      env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_POSTS_ID,
      postId
    );
    
    // Check if the current user has liked this post
    const session = await getSession();
    if (session?.userId) {
      const likes = await databases.listDocuments(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_CONTENT_ID,
        env.NEXT_PUBLIC_APPWRITE_COLLECTION_POST_INTERACTIONS_ID,
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
      env.NEXT_PUBLIC_APPWRITE_DATABASE_CONTENT_ID,
      env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_POSTS_ID,
      postId
    );
    
    // Verify that the user is the author of the post
    // This would require looking up the user's profile ID and comparing it to post.authorId
    // For this example, we're assuming the post.authorId is directly the user's ID from the session
    if (post.authorId !== session.userId) {
      return NextResponse.json({ message: 'Forbidden: Not the author of this post' }, { status: 403 });
    }
    
    // Update the post
    const updatedPost = await databases.updateDocument(
      env.NEXT_PUBLIC_APPWRITE_DATABASE_CONTENT_ID,
      env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_POSTS_ID,
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
      env.NEXT_PUBLIC_APPWRITE_DATABASE_CONTENT_ID,
      env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_POSTS_ID,
      postId
    );
    
    // Verify that the user is the author of the post
    if (post.authorId !== session.userId) {
      return NextResponse.json({ message: 'Forbidden: Not the author of this post' }, { status: 403 });
    }
    
    // Delete the post's media files if any
    if (post.mediaFileIds && post.mediaFileIds.length > 0) {
      for (const fileId of post.mediaFileIds) {
        try {
          await storage.deleteFile(
            env.NEXT_PUBLIC_APPWRITE_BUCKET_POST_MEDIA_ID,
            fileId
          );
        } catch (error) {
          console.error(`Error deleting file ${fileId}:`, error);
          // Continue with other files even if one fails
        }
      }
    }
    
    // Delete the post
    await databases.deleteDocument(
      env.NEXT_PUBLIC_APPWRITE_DATABASE_CONTENT_ID,
      env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_POSTS_ID,
      postId
    );
    
    // Delete associated interactions (likes, comments, etc.)
    const interactions = await databases.listDocuments(
      env.NEXT_PUBLIC_APPWRITE_DATABASE_CONTENT_ID,
      env.NEXT_PUBLIC_APPWRITE_COLLECTION_POST_INTERACTIONS_ID,
      [
        /* Query for interactions on this post */
      ]
    );
    
    for (const interaction of interactions.documents) {
      await databases.deleteDocument(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_CONTENT_ID,
        env.NEXT_PUBLIC_APPWRITE_COLLECTION_POST_INTERACTIONS_ID,
        interaction.$id
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ message: 'Failed to delete post' }, { status: 500 });
  }
}