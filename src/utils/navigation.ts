// src/utils/navigation.ts

/**
 * Determines whether the sidebar should be displayed based on the current pathname.
 * The sidebar is hidden on specific paths like the homepage and authentication pages.
 *
 * @param pathname - The current URL pathname.
 * @returns True if the sidebar should be shown, false otherwise.
 */
export const shouldShowSidebar = (pathname: string): boolean => {
  const hiddenPaths = [
    '/',        // Homepage
    '/signin',  // Sign in page
    '/signup',  // Sign up page
    // Add any other paths where the sidebar should be hidden
  ];

  // Check if the current pathname exactly matches any of the hidden paths
  // or if it starts with an auth path followed by a slash (e.g., /signin/...)
  const isHidden = hiddenPaths.some(hiddenPath => 
    pathname === hiddenPath || (hiddenPath !== '/' && pathname.startsWith(hiddenPath + '/'))
  );

  return !isHidden;
};
