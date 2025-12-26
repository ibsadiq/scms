# Admission Sidebar Links Fix

## Issue
The 3 admission links in the admin sidebar were unresponsive and not navigating to their respective pages.

## Root Cause
All admission pages were using `middleware: 'auth'` in their `definePageMeta()`, but this middleware doesn't exist. The project uses a global auth middleware at `app/middleware/auth.global.ts` instead.

**Error:**
```
Type '"auth"' is not assignable to type 'MiddlewareKey | NavigationGuard | ...'
```

This caused the pages to fail silently when attempting to navigate to them.

## Solution
Removed the non-existent `middleware: 'auth'` from all admission pages, leaving only `layout: 'admin'`.

### Files Fixed:

1. **app/pages/admin/admissions/applications/index.vue**
   - Removed `middleware: 'auth'`

2. **app/pages/admin/admissions/applications/[id].vue**
   - Removed `middleware: 'auth'`

3. **app/pages/admin/admissions/sessions/index.vue**
   - Removed `middleware: 'auth'`

4. **app/pages/admin/admissions/fee-structures/index.vue**
   - Removed `middleware: 'auth'`

### Before:
```typescript
definePageMeta({
  layout: 'admin',
  middleware: 'auth', // ❌ Doesn't exist
})
```

### After:
```typescript
definePageMeta({
  layout: 'admin', // ✅ Uses global auth middleware
})
```

## How It Works Now

The global auth middleware (`auth.global.ts`) automatically:
- Protects all routes except public ones (login, register, etc.)
- Redirects unauthenticated users to `/login`
- Redirects authenticated users from `/login` to their appropriate dashboard

Individual pages only need to specify their layout, not auth middleware.

## Testing
All 3 admission sidebar links now work correctly:
- ✅ Applications → `/admin/admissions/applications`
- ✅ Sessions → `/admin/admissions/sessions`
- ✅ Fee Structures → `/admin/admissions/fee-structures`

## Additional Notes
This is consistent with other admin pages in the project which also only use `layout: 'admin'` without explicit auth middleware.
