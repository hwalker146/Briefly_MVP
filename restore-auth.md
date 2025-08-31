# Restore Authentication System

## Missing Components
1. Google OAuth signin button on landing page
2. NextAuth session handling
3. Protected routes middleware
4. User profile management

## Implementation Steps

### 1. Add Google OAuth Credentials
```bash
# Get credentials from Google Cloud Console
# Add to .env.local:
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### 2. Update Landing Page
- Add "Sign in with Google" button
- Add magic link email authentication
- Redirect authenticated users to dashboard

### 3. Add Route Protection
- Implement middleware for protected routes
- Redirect unauthenticated users to signin
- Handle session state in components

### 4. User Management
- Create user profile pages
- Handle account settings
- Implement sign out functionality

## Files to Update
- `app/page.tsx` - Add auth buttons
- `middleware.ts` - Add route protection
- `app/auth/signin/page.tsx` - Update signin page
- Components - Add session handling