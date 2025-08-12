import { cookies } from 'next/headers';

import { account } from '@/lib/appwrite';

export interface Session {
  userId: string;
  name?: string;
  email?: string;
}

/**
 * Gets the current session from the appwrite account
 */
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('appwrite_session');
    
    if (!authCookie) {
      return null;
    }
    
    const user = await account.get();
    
    return {
      userId: user.$id,
      name: user.name,
      email: user.email
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Check if the user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getSession();
    return session !== null;
  } catch (error) {
    return false;
  }
}
