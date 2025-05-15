// Post related types
export interface Post {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  authorId: string;
  content: string;
  mediaFileIds?: string[];
  tags?: string[];
  visibility: 'public' | 'connections' | 'private';
  likesCount: number;
  commentsCount: number;
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
  interactionType: 'like' | 'comment';
  comment?: string;
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
  itemType: 'post' | 'job' | 'portfolio' | 'profile';
  createdAt: string;
}

// Social connection related types
export interface Connection {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  followerId: string;
  followingId: string;
  connectionType: 'follow' | 'connect';
  status: 'pending' | 'active' | 'rejected';
  createdAt: string;
  updatedAt: string;
}