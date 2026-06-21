# Dealit Financial OS v2.8

GitHub Pages-ready financial operating system for Dealit with Firebase Cloud autosave.

## v2.8 updates

- Simple login remains: username + password, Enter = login, show password, remember me.
- Admin can create users directly in Firebase Authentication with first login password `123456`.
- On first login, users are forced to change password in a popup before continuing.
- Admin user table now has a Reset password button per user.
- Reset password sends Firebase password reset email and flags the user as needing password change.

## Admin email

`Azhar.mohd.said@gmail.com`

## Firebase requirements

- Enable Authentication > Email/Password.
- Use Firestore Standard edition.
- Publish `firestore.rules`.

## Security note

Static GitHub Pages can create new users through the Web SDK using a secondary Firebase Auth app, but changing another existing user's password to a fixed value requires Firebase Admin SDK / Cloud Functions. Therefore, the reset button sends Firebase's official password reset email and marks the user as needing a password change.
