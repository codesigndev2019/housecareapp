# User Manual (Auth flows)

This document explains how end users use the authentication flows in the app.

## Login
- Go to `/auth/login`.
- Enter email and password.
- Press **Sign in**. If credentials are valid, you'll be redirected to the dashboard.

## Register
- Go to `/auth/register`.
- Fill in: Full name, Relation, Date of birth, Email, Phone, Password, Confirm password.
- Password must be at least 8 characters, include an uppercase letter, a number and a special character.
- Press **Create account** and follow any verification steps (if enabled).

## Password reset
1. Go to `/auth/reset` and enter your email to request a code.
2. Check your email for a 6-digit code (expires in 10–15 minutes).
3. Go to `/auth/reset/verify`, enter email, code, new password and confirmation.

## Accessibility notes for users
- Keyboard navigation is supported; use Tab to move between fields.
- There is a skip link at the top to jump to main content.

## Screenshots
- Consider adding screenshots to `docs/assets/screenshots/` for each flow:
  - `login.png`, `register.png`, `reset-request.png`, `reset-verify.png`

