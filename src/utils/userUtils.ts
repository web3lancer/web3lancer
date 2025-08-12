
/**
 * Utility to determine if a given identifier is a User ID or a username
 * Appwrite IDs are typically in a specific format with certain length
 */
export const isUserId = (identifier: string): boolean => {
  // Appwrite IDs are typically 20 characters and include numbers and lowercase letters
  // This is a simple check and could be adjusted based on your ID format
  const appwriteIdPattern = /^[a-z0-9]{20}$/;
  return appwriteIdPattern.test(identifier);
};

/**
 * Utility to get a user profile by either User ID or username
 */
export const getUserByIdentifier = async (identifier: string) => {
  if (isUserId(identifier)) {
    // If it looks like a User ID, try to get profile directly
    return await getUserProfile(identifier);
  } else {
    // Otherwise, try to find the user by username
    return await getUserProfileByUsername(identifier);
  }
};
