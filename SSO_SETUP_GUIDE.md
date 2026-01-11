# SSO Setup Guide - Google OAuth 2.0

## 🔑 Getting Your Google OAuth Credentials

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com
2. Sign in with your Google account

### Step 2: Create a New Project
1. Click on the project dropdown (top left)
2. Click "New Project"
3. Name it: **Feedelate-UKZ**
4. Click "Create"

### Step 3: Enable Google+ API
1. In the left sidebar, go to **APIs & Services > Library**
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 4: Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace)
3. Fill in the required fields:
   - App name: **Feedelate UKZ**
   - User support email: Your email
   - Developer contact: Your email
4. Click **Save and Continue**
5. Skip "Scopes" for now (click Save and Continue)
6. Add test users (your @uni-gjilan.net emails for testing)
7. Click **Save and Continue**

### Step 5: Create OAuth Credentials
1. Go to **APIs & Services > Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Choose **Web application**
4. Name it: **Feedelate Web Client**
5. Add Authorized JavaScript origins:
   ```
   http://localhost:5173
   http://localhost:5000
   ```
6. Add Authorized redirect URIs:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
7. Click **Create**
8. **COPY** your Client ID and Client Secret

### Step 6: Update Backend .env File
Open `Backend/.env` and add:
```env
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your-random-secret-key-here-change-this
GOOGLE_CLIENT_ID=your_client_id_from_step_5
GOOGLE_CLIENT_SECRET=your_client_secret_from_step_5
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

**Important:** Keep your Client Secret private!

## 🗄️ Database Migration

Run this SQL to update your database:
```sql
ALTER TABLE studentet 
MODIFY COLUMN password VARCHAR(255) NULL,
ADD COLUMN ssoProvider VARCHAR(50) NULL,
ADD COLUMN ssoProviderId VARCHAR(255) NULL,
ADD COLUMN profilePicture TEXT NULL;
```

## 🚀 Running the Application

### Terminal 1 - Backend:
```bash
cd Backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd Frontend
npm run dev
```

## ✅ Testing

1. Open http://localhost:5173
2. Click "Sign in with Google"
3. Sign in with an @uni-gjilan.net email
4. You should be redirected to the student dashboard
5. Check your database - the user should be saved in the `studentet` table

## 🔧 Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure the redirect URI in Google Console exactly matches:
  `http://localhost:5000/api/auth/google/callback`

### "Only @uni-gjilan.net emails are allowed"
- This is working correctly! Only university emails can sign in
- For testing, create a Google account with @uni-gjilan.net or modify the domain check in `Backend/src/config/passport.ts`

### "Authentication failed"
- Check that your Google credentials are correct in `.env`
- Make sure the backend server is running on port 5000

### CORS Errors
- The frontend URL in backend `.env` should be: `http://localhost:5173`
- Make sure both servers are running

## 📝 Next Steps

Once SSO is working:
1. You can add Professor and Admin roles
2. Configure with university's actual Google Workspace
3. Add production URLs to Google Console
4. Deploy with HTTPS (required for production)

## 🎓 Email Patterns

The system automatically detects user roles:
- `.st@uni-gjilan.net` → Student
- `.prof@uni-gjilan.net` → Professor
- `.admin@uni-gjilan.net` → Admin
