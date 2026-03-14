# Google OAuth Setup Guide
# Market Cairo - Google Sign-In Integration

This guide will help you set up Google OAuth for the Market Cairo application.

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Sign in with your Google account
3. Click on the project dropdown at the top
4. Click **"New Project"**
5. Enter project name: `Market Cairo` (or any name you prefer)
6. Click **"Create"**

---

## Step 2: Enable Google+ API

1. In the Google Cloud Console, make sure your new project is selected
2. Go to **"APIs & Services"** > **"Library"** (from the left sidebar)
3. Search for **"Google+ API"** or **"Google Identity"**
4. Click on **"Google+ API"**
5. Click **"Enable"**

---

## Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** > **"OAuth consent screen"**
2. Select **"External"** user type
3. Click **"Create"**

4. Fill in the required information:
   - **App name:** Market Cairo
   - **User support email:** Your email address
   - **Developer contact information:** Your email address

5. Click **"Save and Continue"**

6. **Scopes:** Skip this for now (click "Save and Continue")

7. **Test users:**
   - Click "Add Users"
   - Add your email address and any test emails
   - Click "Save and Continue"

8. Click **"Back to Dashboard"**

---

## Step 4: Create OAuth 2.0 Client ID

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"OAuth client ID"**

3. Select **"Web application"** as the application type

4. Configure the client:
   - **Name:** Market Cairo Web Client

   - **Authorized JavaScript origins:**
     ```
     http://localhost:3000
     http://127.0.0.1:3000
     ```

   - **Authorized redirect URIs:**
     ```
     http://localhost:3000
     http://localhost:3000/auth/callback
     ```

5. Click **"Create"**

6. **IMPORTANT:** Copy your credentials:
   - ✅ Copy the **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
   - ✅ Copy the **Client Secret** (optional, for backend)

---

## Step 5: Configure Frontend Environment

1. Create a `.env.local` file in the **frontend** directory:

```bash
cd frontend
touch .env.local  # or create manually on Windows
```

2. Add your Google Client ID:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
```

3. Replace `YOUR_CLIENT_ID_HERE` with the actual Client ID you copied

---

## Step 6: Update _app.js (If Not Done)

Your `frontend/src/pages/_app.js` should include the Google OAuth Provider:

```javascript
import { GoogleOAuthProvider } from '@react-oauth/google';

function MyApp({ Component, pageProps }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      {/* Rest of your app */}
      <Component {...pageProps} />
    </GoogleOAuthProvider>
  );
}
```

---

## Step 7: Test Google Login

1. **Start your application:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Open the application:**
   - Go to `http://localhost:3000`
   - Click on "Login"
   - Click on "Continue with Google" button
   - Select your Google account
   - Grant permissions
   - You should be logged in!

---

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem:** The redirect URI doesn't match what's configured in Google Console

**Solution:**
1. Go back to Google Cloud Console > Credentials
2. Click on your OAuth 2.0 Client ID
3. Make sure these URIs are added:
   ```
   http://localhost:3000
   http://localhost:3000/auth/callback
   ```
4. Click "Save"
5. Wait a few minutes for changes to propagate
6. Try again

### Error: "invalid_client"

**Problem:** The Client ID is incorrect or not set

**Solution:**
1. Check your `.env.local` file
2. Make sure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set correctly
3. Make sure there are no extra spaces or quotes
4. Restart your frontend server: `npm run dev`

### Error: "access_denied"

**Problem:** User is not added to test users list

**Solution:**
1. Go to Google Cloud Console > OAuth consent screen
2. Scroll down to "Test users"
3. Click "Add Users"
4. Add the email address you're trying to login with
5. Click "Save"

### Google button not showing

**Problem:** Google OAuth library not installed or provider not configured

**Solution:**
1. Make sure library is installed:
   ```bash
   cd frontend
   npm install @react-oauth/google
   ```
2. Check if `_app.js` has `GoogleOAuthProvider` wrapper
3. Check browser console for errors

---

## Production Deployment

When deploying to production:

1. **Update Authorized Origins:**
   - Add your production domain:
     ```
     https://yourdomain.com
     ```

2. **Update Authorized Redirect URIs:**
   - Add production callback:
     ```
     https://yourdomain.com
     https://yourdomain.com/auth/callback
     ```

3. **Update OAuth Consent Screen:**
   - Change from "Testing" to "In Production"
   - Submit for Google verification if needed

4. **Update Environment Variables:**
   - Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to your production environment
   - Use your hosting platform's environment variable settings

---

## Security Best Practices

1. ✅ **Never commit `.env.local`** to Git
2. ✅ Keep Client Secret secure (if used on backend)
3. ✅ Only add necessary scopes
4. ✅ Regularly review OAuth consent screen
5. ✅ Monitor OAuth usage in Google Console

---

## Additional Resources

- [Google Identity Documentation](https://developers.google.com/identity)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google Library](https://www.npmjs.com/package/@react-oauth/google)

---

## Need Help?

If you encounter any issues:

1. Check the browser console for error messages
2. Check backend logs for API errors
3. Review this guide step by step
4. Check Google Cloud Console for any warnings

**Good luck! 🚀**
