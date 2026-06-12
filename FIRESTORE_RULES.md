# Firestore Security Rules Setup

## Problem

If member deletion (or other writes) are not working, it's likely due to **Firestore security rules** being too restrictive.

## Solution

Replace your Firestore security rules with the contents of `firestore.rules` in this project:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **GymPulse** project
3. Go to **Firestore Database** → **Rules** tab
4. Replace the default rules with the content from `firestore.rules`
5. Click **Publish**

## What the Rules Do

```javascript
match /members/{memberId} {
  allow read, write: if true;  // Allow all reads/writes to members
}

match /attendanceRecords/{recordId} {
  allow read, write: if true;  // Allow all reads/writes to attendance records
}
```

These rules **allow public access** (suitable for local testing/prototype). For production, you should:

- Add authentication
- Restrict writes to authenticated users
- Use role-based access control (RBAC)

## Testing Deletion

After updating the rules:

1. Refresh `http://127.0.0.1:5173/`
2. Create a test member
3. Click the **Delete** button
4. Confirm the deletion
5. Member should disappear from the dashboard

If it still doesn't work:
- Check browser console for errors (press F12)
- Look for security/permission errors
- Verify the Firebase config in `web/firebase.js` matches your project

## Production Security

For a live app, implement proper authentication and rules like:

```javascript
match /members/{memberId} {
  allow read: if request.auth != null;
  allow create, delete: if request.auth != null && request.auth.uid == request.resource.data.createdBy;
}
```
