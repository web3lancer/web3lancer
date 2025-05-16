// This file serves as the central export point for all type definitions
// related to the new database schema.

// ProfilesDB types
export * from './profiles';

// JobsDB types
export * from './jobs';

// FinanceDB types
export * from './finance';

// ContentDB types
export * from './content';

// SocialDB types
export * from './social';

// GovernanceDB types
export * from './governance';

// ActivityDB types
export * from './activity';

// CoreDB types
export * from './core';

// Generic User type for AuthContext or similar, can be refined
export interface AuthenticatedUser {
  $id: string; // Appwrite User ID
  email: string;
  name: string; // Appwrite User Name
  profileId?: string; // Link to the user's document in user_profiles
  // Add any other essential user details needed globally after authentication
}