# Login Landing Page Guide

## HTML Structure & Syntax

### Basic Layout
```html
<div class="login-container">
  <div class="login-box">
    <h1>PantryPal</h1>
    <p class="tagline">Your AI-powered recipe companion</p>
    
    <form id="loginForm" method="POST" action="/api/login">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required placeholder="you@example.com">
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required placeholder="Enter your password">
      </div>
      
      <button type="submit" class="btn-primary">Login</button>
    </form>
    
    <p class="signup-link">Don't have an account? <a href="/signup">Sign up here</a></p>
  </div>
</div>
```

### Form Input Types & Attributes
```html
<!-- Email input with validation -->
<input type="email" id="email" name="email" required>

<!-- Password input (masked) -->
<input type="password" id="password" name="password" required>

<!-- Remember me checkbox -->
<input type="checkbox" id="remember" name="remember">
<label for="remember">Remember me</label>

<!-- Submit button -->
<button type="submit" class="btn-primary">Login</button>
```

## Best Practices

### Accessibility
- Use semantic HTML: `<form>`, `<label>`, `<button>`
- Link labels to inputs with `for` attribute matching input `id`
- Include `required` attributes on mandatory fields
- Use `type="email"` for browser-level email validation
- Provide descriptive placeholder text

### Security
- Use `method="POST"` for sensitive data (never GET)
- Never log passwords in console
- Validate on both client and server
- Use HTTPS in production
- Store passwords as hashes, never plain text

### UX/Design
- Keep form fields to essential items (email + password minimum)
- Use clear, large call-to-action button
- Show password toggle option for convenience
- Display form validation errors inline
- Add "Forgot password?" link
- Show loading state during submission
- Provide signup link for new users

### Performance
- Minimize external dependencies
- Use CSS for styling over inline styles
- Load critical CSS inline, defer non-critical
- Minify CSS/JS in production
- Cache static assets

## PantryPal-Specific Advice

### Brand Integration
- Include PantryPal logo/wordmark prominently
- Use your app's color scheme and typography
- Add tagline: "Your AI-powered recipe companion" to establish purpose
- Consider showing app preview/features below fold for new users

### User Flow Consideration
Based on your README, post-login users access:
1. **Pantry View** - First action after login
2. **Feed & Recipes View** - Social discovery
3. **AI Assistant** - Recipe generation
4. **Planning View** - Meal planning

**Recommendation:** After successful login, route to the Pantry View as the natural first step.

### Form Fields
Keep it minimal for login:
- Email/Username
- Password
- "Remember me" (optional but recommended)
- "Forgot password?" link

**Don't include:**
- Dietary preferences (save for onboarding/profile setup)
- Pantry items (collect post-login)
- Follow suggestions (do after authentication)

### Social/Optional Features
For future iterations consider:
- "Login with Google/Apple" for faster onboarding
- Email verification before first login
- Multi-factor authentication option

### Error Handling Examples
```html
<div class="error-message" id="loginError" style="display:none;">
  Invalid email or password. Please try again.
</div>

<div class="success-message" id="loginSuccess" style="display:none;">
  Login successful! Redirecting...
</div>
```

### Styling Considerations
- Responsive design (mobile-first approach)
- Login box centered on screen
- Adequate padding/whitespace
- Clear focus states for accessibility
- Smooth transitions for better UX
- Dark/light mode support if applicable

## JavaScript Integration

```javascript
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      // Redirect to Pantry View
      window.location.href = '/pantry';
    } else {
      // Show error message
      document.getElementById('loginError').style.display = 'block';
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
});
```

## Checklist

- [ ] HTML form with email and password fields
- [ ] Form submits via POST to `/api/login`
- [ ] Proper labels linked to inputs
- [ ] Client-side validation (required fields, email format)
- [ ] Error message display area
- [ ] Loading state while submitting
- [ ] Success redirect to Pantry View
- [ ] "Forgot password?" link
- [ ] "Sign up" link for new users
- [ ] Responsive design tested on mobile
- [ ] Accessibility tested (keyboard navigation, screen readers)
- [ ] Password visibility toggle (optional enhancement)
