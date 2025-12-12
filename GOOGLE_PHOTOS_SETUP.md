# 📸 Google Photos API Setup Guide

This guide will help you set up Google Photos API integration to use your personal photos as backgrounds in the app.

## Prerequisites

- A Google account
- Photos uploaded to Google Photos
- Basic knowledge of working with APIs

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a project" → "New Project"
3. Enter a project name (e.g., "Iuli-Bobo-Photos")
4. Click "Create"

## Step 2: Enable Google Photos Library API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Photos Library API"
3. Click on it and press "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in the app name (e.g., "Iuli & Bogdan Photo App")
   - Add your email as a developer
   - Skip optional fields and save
4. Back at credentials, select "Web application" as the application type
5. Add your app URL to "Authorized JavaScript origins":
   - For local development: `http://localhost:5173`
   - For production: your deployed URL
6. Add redirect URIs:
   - For local development: `http://localhost:5173`
   - For production: your deployed URL
7. Click "Create" and save your Client ID and Client Secret

## Step 4: Get Your Photos Album ID (Optional)

If you want to use photos from a specific album:

1. Go to [Google Photos](https://photos.google.com/)
2. Open the album you want to use
3. The URL will look like: `https://photos.google.com/album/ALBUM_ID_HERE`
4. Copy the ALBUM_ID

## Step 5: Configure the Application

1. Create a `.env` file in the root of your project:

```env
VITE_GOOGLE_PHOTOS_API_KEY=your_client_id_here
VITE_GOOGLE_PHOTOS_ALBUM_ID=your_album_id_here_optional
```

2. Update `src/main.tsx` to initialize the Google Photos service:

```typescript
import { googlePhotosService } from './services/googlePhotos';

// Initialize Google Photos
const apiKey = import.meta.env.VITE_GOOGLE_PHOTOS_API_KEY;
const albumId = import.meta.env.VITE_GOOGLE_PHOTOS_ALBUM_ID;

if (apiKey) {
  googlePhotosService.init({ apiKey, albumId });
}
```

3. Update `src/components/Desktop.tsx` to use BackgroundManager:

Replace the current background div with:

```typescript
import BackgroundManager from './BackgroundManager';

// In the return statement:
<BackgroundManager useGooglePhotos={true}>
  {/* existing content */}
</BackgroundManager>
```

## Step 6: Authentication Flow

For production use, you'll need to implement OAuth 2.0 authentication:

1. Install the Google API client library:
```bash
npm install @react-oauth/google
```

2. Wrap your app with GoogleOAuthProvider in `src/main.tsx`:

```typescript
import { GoogleOAuthProvider } from '@react-oauth/google';

root.render(
  <GoogleOAuthProvider clientId="YOUR_CLIENT_ID">
    <App />
  </GoogleOAuthProvider>
);
```

3. Use the `useGoogleLogin` hook to authenticate users and get an access token

## Testing

1. Start your development server: `npm run dev`
2. Open the app and check if photos are loading
3. Check browser console for any errors

## Troubleshooting

### Photos not loading?

- Verify your API key is correct
- Check that the Photos Library API is enabled
- Ensure your OAuth consent screen is configured
- Check browser console for error messages

### "Access denied" errors?

- Make sure you've added yourself as a test user in OAuth consent screen
- Verify the OAuth scopes include `https://www.googleapis.com/auth/photoslibrary.readonly`

### CORS errors?

- Add your domain to authorized origins in Google Cloud Console
- For localhost, use `http://localhost:5173` exactly as shown

## Rate Limits

Google Photos API has the following limits:
- 10,000 requests per day per project
- 1,000 requests per 100 seconds per user

The app caches photos for 1 hour to minimize API calls.

## Privacy & Security

⚠️ **Important Security Notes:**

- Never commit your `.env` file or API keys to Git
- Add `.env` to your `.gitignore` file
- For production, use environment variables on your hosting platform
- Only request the minimum required OAuth scopes
- Consider using a service account for server-side applications

## Alternative: Manual Photo Upload

If Google Photos API setup is too complex, you can manually add photos:

1. Place your photos in the `public/media/backgrounds/` folder
2. Update the background rotation logic to use local photos instead

Example:
```typescript
const backgrounds = [
  '/media/backgrounds/photo1.jpg',
  '/media/backgrounds/photo2.jpg',
  '/media/backgrounds/photo3.jpg',
];
```

## Need Help?

- [Google Photos Library API Documentation](https://developers.google.com/photos/library/guides/get-started)
- [OAuth 2.0 for Web Apps](https://developers.google.com/identity/protocols/oauth2/web-server)
- Check the project's GitHub issues for common problems

---

Made with 💕 by Bogdan & Iuliana
