# Notification Query Fix

## Problem
The application was throwing an error:
```
AppwriteException: Invalid query: Cannot query equal on attribute "toUserId" because it is an array.
```

This error occurred when trying to fetch user notifications, indicating that the database schema has a field called "toUserId" that is defined as an array, but the code was using `Query.equal` which doesn't work on array fields.

## Root Cause
1. **Missing Method**: The `NotificationService` class was missing a `listNotifications` method that was being called by various components.
2. **Field Name Mismatch**: The code was using "recipientId" and "userId" but the database field was actually "toUserId".
3. **Array Field Handling**: The "toUserId" field is an array in the database, requiring `Query.contains` instead of `Query.equal`.
4. **Service Instantiation**: NotificationService constructor was being called incorrectly throughout the codebase.

## Solution

### 1. Added Missing Method
Added `listNotifications` method to `NotificationService` that:
- Converts string queries to proper Query objects
- Handles backward compatibility with existing code
- Implements fallback strategy for array fields

### 2. Implemented Smart Query Handling
The method now:
- First tries with `Query.equal('userId', userId)`
- If it fails with "toUserId array" error, automatically retries with `Query.contains('toUserId', userId)`
- This ensures compatibility with both database schema variations

### 3. Fixed Service Instantiation
Updated all components to properly instantiate NotificationService:
- `NotificationBell.tsx`
- `NotificationDropdown.tsx` 
- `NotificationsList.tsx`
- `DisputeForm.tsx`
- `/app/notifications/page.tsx`

### 4. Updated Environment Configuration
Fixed the environment configuration to use the correct collection IDs:
- Changed from `COLLECTION_NOTIFICATIONS_ID` to `USER_NOTIFICATIONS_COLLECTION_ID`

### 5. Type Compatibility
Temporarily used `any[]` types to avoid type conflicts between:
- `NotificationModel` (from service)
- `UserNotification` (from activity types)
- `Notification` (from governance types)

## Code Changes

### Key Method Addition in `notificationService.ts`:
```typescript
async listNotifications(queryStrings: string[]): Promise<NotificationModel[]> {
  // ... converts string queries to Query objects
  try {
    // Try with userId field first
    return await this.appwrite.listDocuments(/* ... */);
  } catch (error) {
    // If toUserId array error, retry with Query.contains
    if (error.message?.includes('toUserId') && error.message?.includes('array')) {
      // Use Query.contains('toUserId', userId) instead
      return await this.appwrite.listDocuments(/* ... with array queries */);
    }
    throw error;
  }
}
```

## Test Results
Created and ran a test that simulates the error condition and confirms the fix works:
- ✅ Detects the "toUserId array" error
- ✅ Automatically switches to `Query.contains`
- ✅ Successfully retrieves notifications

## Files Modified
- `src/services/notificationService.ts` - Added missing method with array handling
- `src/components/notifications/NotificationBell.tsx` - Fixed service instantiation
- `src/components/notifications/NotificationDropdown.tsx` - Fixed service instantiation and methods
- `src/components/notifications/NotificationsList.tsx` - Fixed service instantiation
- `src/components/governance/DisputeForm.tsx` - Fixed service instantiation
- `src/app/notifications/page.tsx` - Fixed service instantiation
- `src/config/environment.ts` - Fixed collection ID mapping

## Impact
This fix resolves the runtime error that was occurring when users tried to:
- View notifications in the dropdown
- Check unread notification counts
- Access the notifications page
- Get notification updates in real-time

The solution is backward compatible and handles both possible database schema configurations automatically.