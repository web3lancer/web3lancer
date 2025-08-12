import type { Models } from 'appwrite';
import { AppwriteException } from 'appwrite';

import { account } from '@/utils/api';

// Assuming account is exported from api.ts


/**
 * Ensures that a guest (anonymous) session exists if no user is logged in.
 * @returns {Promise<Models.User<Models.Preferences> | null>} The user object if a session exists or was created, null otherwise.
 */
export async function ensureGuestSession() {
  try {
    // Check if a session already exists
    return await account.get();
  } catch (error) {
    // If no session exists (specific error code for Appwrite might be 401), create an anonymous one
    if (error instanceof AppwriteException && error.code === 401) {
      try {
        await account.createAnonymousSession();
        // Fetch the newly created anonymous user details
        return await account.get(); 
      } catch (anonError) {
        console.error('Error creating anonymous session:', anonError);
        return null;
      }
    } else {
      // Log other errors but don't necessarily create an anonymous session
      console.error('Error checking session:', error);
      return null;
    }
  }
}

/**
 * Checks if the currently active user session is anonymous.
 * Appwrite anonymous users typically lack an email address.
 * @param {Models.User<Models.Preferences> | null} user - The user object from account.get().
 * @returns {boolean} True if the user is anonymous, false otherwise.
 */
export function isAnonymousUser(user: Models.User<Models.Preferences> | null): boolean {
  // Check if user exists and if the email field is empty, which usually indicates an anonymous user in Appwrite
  return !!user && !user.email;
}

// Re-export necessary types if not globally available or handled elsewhere
