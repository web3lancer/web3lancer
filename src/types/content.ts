// Post related types
export interface Post {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  authorId: string;
  content: string;
  mediaFileIds?: string[];
  parentPostId?: string; // Added for threaded comments/replies
  tags?: string[];
  visibility: 'public' | 'connections' | 'private';
  likesCount: number;
  commentsCount: number;
  repostCount: number; // Added
  bookmarkCount: number; // Added
  isLikedByCurrentUser?: boolean;
  createdAt?: string; // Redundant with $createdAt but kept for compatibility
  updatedAt?: string; // Redundant with $updatedAt but kept for compatibility
}

export interface PostInteraction {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  postId: string;
  userId: string;
  interactionType: 'like' | 'repost' | 'bookmark' | 'comment_reference'; // Expanded
  commentId?: string; // Added to reference a comment post
  createdAt: string;
}

// Portfolio related types
export interface Portfolio {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  profileId: string;
  title: string;
  description: string;
  skillsUsed: string[];
  mediaFileIds?: string[];
  projectUrl?: string;
  completionDate?: string;
  visibility: 'public' | 'connections' | 'private';
  createdAt: string;
  updatedAt: string;
}

// Bookmark related types
export interface Bookmark {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  profileId: string;
  itemId: string;
  itemType: 'post' | 'job' | 'portfolio' | 'profile' | 'article'; // Added 'article'
  createdAt: string;
}

// Social connection related types
export interface Connection {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  followerId: string;
  followingId: string;
  connectionType: 'follow' | 'friend'; // Changed 'connect' to 'friend'
  status: 'pending' | 'active' | 'rejected' | 'blocked'; // Added 'blocked'
  createdAt: string;
  updatedAt: string;
}