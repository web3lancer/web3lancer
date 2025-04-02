import { account, createAnonymousSession, validateSession } from './api';

// Cache to prevent multiple anonymous session attempts
let anonymousSessionAttemptInProgress = false;

/**
 * Creates or ensures an anonymous session for guest users
 * This will only create a new anonymous session if no session exists
 * @returns The user object or null if creation failed
 */
export async function ensureGuestSession() {
  // Don't attempt to create multiple anonymous sessions at once
  if (anonymousSessionAttemptInProgress) {
    return null;
  }
  
  try {
    anonymousSessionAttemptInProgress = true;
    
    // First check if we already have a valid session
    try {
      const isValid = await validateSession();
      if (isValid) {
        const currentUser = await account.get();
        return currentUser;
      }
    } catch (error) {
      // No valid session exists, continue to create anonymous session
      console.log('No existing session found, creating anonymous session...');
    }

    // Create anonymous session
    const session = await createAnonymousSession();
    
    // Get the user details from the new anonymous session
    const user = await account.get();
    console.log('Anonymous session created successfully');
    return user;
  } catch (error) {
    console.error('Failed to create anonymous session:', error);
    return null;
  } finally {
    anonymousSessionAttemptInProgress = false;
  }
}

/**
 * Checks if the current user is an anonymous user
 * @param user The user object to check
 * @returns True if the user is anonymous, false otherwise
 */
export function isAnonymousUser(user: any): boolean {
  if (!user) return false;
  
  // Anonymous users typically have labels or flags in Appwrite
  return user.labels?.includes('anonymous') || 
         user.$id?.startsWith('anon_') || 
         user.status === false;
}

/**
 * Determines whether to show sign-up prompts to the current user
 * @param user The user object
 * @returns True if prompts should be shown, false otherwise
 */
export function shouldShowSignUpPrompt(user: any): boolean {
  // Show prompts for anonymous users or when no user is logged in
  return !user || isAnonymousUser(user);
}
