# React Startup Implementation Plan

## Authentication Flow Plan

### 1. Data Storage Structure (localStorage)

For the mock implementation:

```javascript
// Register: Store new user
localStorage.setItem('users', JSON.stringify([
  {
    email: 'user@example.com',
    userName: 'John Doe',
    passwordHash: 'bcrypt_hashed_password_here'
  }
]));

// Login: Store current authenticated user
localStorage.setItem('currentUser', JSON.stringify({
  email: 'user@example.com',
  userName: 'John Doe',
  loginTime: new Date().toISOString()
}));
```

**Note:** For the mock, since we don't have a backend:
- Use `bcryptjs` (browser-compatible version) - ✅ INSTALLED
- Hash passwords on registration in the browser
- Compare hashes on login in the browser
- ⚠️ *This is ONLY for mocking - in production, password hashing happens on the server*

### 2. Protected Routes

Pages that require authentication:
- ✅ `/pantry` - Protected
- ✅ `/recipes` - Protected  
- ✅ `/recipes/friends` - Protected
- ✅ `/calendar` - Protected
- ✅ `/ai-assistant` - Protected

Public routes:
- 🔓 `/login` - Public
- 🔓 `/register` - Public

### 3. Authentication Flow

#### Registration Flow
1. User enters email, username, password on `/register`
2. Hash password with bcrypt
3. Store in `localStorage.users` array
4. Automatically log them in (set `currentUser`)
5. Redirect to `/pantry`

#### Login Flow
1. User enters email, password on `/login`
2. Look up user in `localStorage.users` by email
3. Compare password hash using bcrypt
4. If match: set `localStorage.currentUser` and redirect to `/pantry`
5. If no match: show error message

#### Logout Flow
1. Remove `localStorage.currentUser`
2. Redirect to `/login`

#### Protected Route Check
1. Component mounts
2. Check if `localStorage.currentUser` exists
3. If not: redirect to `/login`
4. If yes: render page

### 4. Dependencies

Required packages:
- ✅ `bcryptjs` - INSTALLED

### 5. Key Components to Create

1. **AuthContext** (`src/components/AuthContext.jsx`)
   - Manages auth state globally
   - Provides login, logout, register functions
   - Provides current user state

2. **ProtectedRoute** (`src/components/ProtectedRoute.jsx`)
   - Wrapper component for protected routes
   - Checks authentication before rendering
   - Redirects to login if not authenticated

3. **Updated Login Component** (`src/login/login.jsx`)
   - Convert to controlled form
   - Handle form submission
   - Call login function from AuthContext
   - Display error/success messages

4. **Updated Register Component** (`src/register/register.jsx`)
   - Add username field (not just email/password)
   - Convert to controlled form
   - Handle password confirmation validation
   - Hash password before storing
   - Call register function from AuthContext
   - Display error/success messages

5. **Logout Button** (in header)
   - Display when user is authenticated
   - Show username
   - Call logout function from AuthContext

### 6. Implementation Order

1. ✅ Install bcryptjs
2. Create AuthContext with state management
3. Wrap App with AuthContext Provider
4. Create ProtectedRoute component
5. Update App.jsx to use ProtectedRoute for protected pages
6. Update Login component with form handling
7. Update Register component with form handling and username field
8. Add logout button to header
9. Test all flows

## Next Steps

- Move to step 2: Create auth context structure
- Implement state management for authentication
- Create helper functions for localStorage operations
