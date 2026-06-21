# Firebase next steps for Dealit Financial OS v2

## 1) Enable products

- Authentication → Sign-in method → Email/Password → Enable.
- Firestore Database → Create database.
- Start in production mode if you are ready to paste the production rules.

## 2) Add first Admin

Replace the placeholder email in two places:

- `app.js` → `BOOTSTRAP_ADMIN_EMAILS` is already set to Azhar.mohd.said@gmail.com
- `firestore.rules` → `bootstrapAdmin()` is already set

Use the same lowercase email in both places.

## 3) Publish rules

Use `firestore.rules` for production.

Only use `firestore-setup-temporary.rules` if you are stuck during first setup, and replace it immediately after the first admin is created.

## 4) Add users

Admin page → Add user → enter email + role.

The invited user then clicks Sign up using the same email. The system reads the invitation and creates `users/{uid}` with the assigned role.

## 5) Suggested later upgrade

To create Auth accounts directly from the Admin page, add a Cloud Function using the Firebase Admin SDK. The client app should never hold Admin SDK credentials.


## Direct user creation from Admin page

This version creates Firebase Authentication users directly from the Admin page, then stores the role under Firestore and sends a password reset/setup email.

Requirements:
1. Authentication > Sign-in method > Email/Password must be enabled.
2. Firestore rules from this package must be published.
3. Login as Azhar.mohd.said@gmail.com, open Admin, and click Add user.

Production hardening option: later, replace this client-side user creation with a Firebase Cloud Function using Firebase Admin SDK.
