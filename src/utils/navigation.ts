/**
 * Helper functions for navigation and layout decisions
 */

/**
 * Determines if the current path should have the sidebar
 * @param pathname Current page path
 * @returns boolean indicating if sidebar should be shown
 */
export function shouldShowSidebar(pathname: string): boolean {
  // Pages that should not have the sidebar
  const noSidebarPaths = [
    '/',                // Homepage
    '/signin',          // Sign in page
    '/signup',          // Sign up page
    '/verify-email',    // Email verification
    '/reset-password',  // Password reset
    '/oauth/callback',  // OAuth callback
    '/magic-link',      // Magic link authentication
    '/verify-magic-link', // Magic link verification
  ];
  
  // Check if the path exactly matches any in the noSidebarPaths array
  if (noSidebarPaths.includes(pathname)) {
    return false;
  }
  
  // Check if the path starts with any of these prefixes
  const noSidebarPrefixes = [
    '/auth/',          // Auth related pages
    '/maintenance/',   // Maintenance pages
    '/error/',         // Error pages
    '/welcome/'        // Onboarding/welcome pages
  ];
  
  // Check if current path starts with any of the excluded prefixes
  return !noSidebarPrefixes.some(prefix => pathname.startsWith(prefix));
}
