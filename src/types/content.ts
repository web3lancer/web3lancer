// Post related types
export interface Post {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  authorId: string; // UserProfile.$id
  content: string; // Text content of the post
  media?: { type: 'image' | 'video' | 'code'; fileId: string; thumbnailFileId?: string }[]; // Storage File objects for images, videos
  parentPostId?: string; // Post.$id, for comments/replies
  tags?: string[];
  visibility: 'public' | 'connections' | 'private';
  likesCount: number;
  commentsCount: number;
  repostCount: number;
  bookmarkCount: number;
  isLikedByCurrentUser?: boolean; // Dynamically set based on user
  // Redundant createdAt and updatedAt removed
}

export interface PostInteraction {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  postId: string; // Post.$id
  userId: string; // UserProfile.$id
  interactionType: 'like' | 'repost' | 'bookmark' | 'comment_reference';
  commentId?: string; // Post.$id (if interactionType is 'comment_reference')
  // Redundant createdAt removed
}

// Portfolio related types
export interface Portfolio {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  profileId: string; // UserProfile.$id
  title: string;
  description: string;
  skillsUsed: string[];
  mediaFileIds?: string[]; // Storage File IDs
  projectUrl?: string;
  completionDate?: string; // ISO Date string
  visibility: 'public' | 'connections' | 'private';
  // Redundant createdAt and updatedAt removed
}

// Bookmark related types
export interface Bookmark {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  profileId: string; // UserProfile.$id
  itemId: string; // ID of the bookmarked item (Post.$id, JobPosting.$id, etc.)
  itemType: 'post' | 'job' | 'portfolio' | 'profile' | 'article';
  // Redundant createdAt removed
}

// Article related types
export interface Article {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  authorId: string; // UserProfile.$id
  title: string;
  content: string; // Rich text or Markdown content
  coverImageFileId?: string; // Storage File ID
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'connections' | 'private';
  clapsCount: number; // Or likes, depending on terminology
  commentsCount: number;
  isClappedByCurrentUser?: boolean; // Dynamically set
  publishedAt?: string; // ISO Date string, set when status becomes 'published'
}

// Social connection related types
export interface Connection {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  followerId: string; // UserProfile.$id of the user initiating the follow/connection
  followingId: string; // UserProfile.$id of the user being followed/connected with
  connectionType: 'follow' | 'friend_request'; // 'friend_request' for mutual connections
  status: 'pending' | 'active' | 'rejected' | 'blocked' | 'unfollowed'; // Added 'unfollowed'
  // Redundant createdAt and updatedAt removed
}

// Direct Message related types
export interface Conversation {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  participantIds: string[]; // Array of UserProfile.$id
  lastMessageId?: string; // DirectMessage.$id
  lastMessageText?: string; // Snippet of the last message
  lastMessageAt?: string; // ISO Date string of the last message
  unreadCounts?: Record<string, number>; // { [userId]: count }
}

export interface DirectMessage {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  conversationId: string; // Conversation.$id
  senderId: string; // UserProfile.$id
  receiverId: string; // UserProfile.$id (denormalized for easier querying by receiver)
  content: string;
  mediaFileId?: string; // Storage File ID
  readAt?: string; // ISO Date string, when the receiver read the message
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

// Generic Reaction type for articles, portfolios etc. (if not using PostInteraction)
export interface Reaction {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    targetId: string; // ID of the item being reacted to (Article.$id, Portfolio.$id)
    targetType: 'article' | 'portfolio' | 'comment'; // Add other types as needed
    userId: string; // UserProfile.$id
    reactionType: 'like' | 'clap' | 'love' | 'celebrate' | 'insightful' | 'funny'; // Example reaction types
}

// Comment type (can be generic for posts, articles, portfolios)
export interface Comment {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    authorId: string; // UserProfile.$id
    targetId: string; // ID of the item being commented on (Post.$id, Article.$id)
    targetType: 'post' | 'article' | 'portfolio';
    content: string;
    parentCommentId?: string; // Comment.$id for threaded replies
    likesCount: number;
    isLikedByCurrentUser?: boolean;
}