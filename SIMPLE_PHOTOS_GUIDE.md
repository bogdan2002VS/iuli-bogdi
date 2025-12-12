# 📸 Simple Photo Setup Guide

Super easy way to add your own photos as backgrounds! No complex API setup needed.

## Method 1: Download & Upload (Easiest!) ⭐

This is the simplest method - just download your photos and add them to the project.

### Steps:

1. **Download photos from Google Photos**
   - Go to your Google Photos album
   - Select the photos you want
   - Click the three dots (⋮) → Download
   - Save them to your computer

2. **Add photos to the project**
   - Put all downloaded photos in: `public/media/backgrounds/`
   - You can rename them to `photo1.jpg`, `photo2.jpg`, etc.

3. **Configure the app**
   - Open `src/config/photos.ts`
   - Add your photo filenames:

   ```typescript
   export const localPhotos = [
     '/media/backgrounds/photo1.jpg',
     '/media/backgrounds/photo2.jpg',
     '/media/backgrounds/photo3.jpg',
     '/media/backgrounds/iuliana-bogdan-1.jpg',
     '/media/backgrounds/iuliana-bogdan-2.jpg',
     // Add as many as you want!
   ];
   ```

4. **That's it!**
   - Save the file
   - Refresh your browser
   - Photos will rotate every 5 minutes

---

## Method 2: Direct Image URLs (For Advanced Users)

If you want to link directly to images without downloading:

### Steps:

1. **Share your Google Photos album publicly**
   - Open the album in Google Photos
   - Click "Share" → Create link
   - Make sure it's set to "Anyone with the link"

2. **Get direct image URLs**
   - Open your public album
   - Right-click on each photo
   - Select "Open image in new tab"
   - Copy the URL from the address bar

3. **Add URLs to config**
   - Open `src/config/photos.ts`
   - Add the URLs:

   ```typescript
   export const directPhotoUrls = [
     'https://lh3.googleusercontent.com/pw/xxx...',
     'https://lh3.googleusercontent.com/pw/yyy...',
     // Add all your photo URLs here
   ];
   ```

⚠️ **Note**: Google Photos URLs may expire after some time. Method 1 is more reliable!

---

## Configuration Options

Open `src/config/photos.ts` to customize:

### Change rotation speed:
The default is 5 minutes (300000ms). To change it, edit `src/components/Desktop.tsx`:

Find `<BackgroundManager>` and add:
```typescript
<BackgroundManager refreshInterval={60000}> {/* 1 minute */}
```

Or use these values:
- `60000` = 1 minute
- `180000` = 3 minutes
- `300000` = 5 minutes (default)
- `600000` = 10 minutes

### Mix local and direct URLs:
You can use both methods together! The app will combine all photos:

```typescript
export const localPhotos = [
  '/media/backgrounds/photo1.jpg',
  '/media/backgrounds/photo2.jpg',
];

export const directPhotoUrls = [
  'https://lh3.googleusercontent.com/pw/xxx...',
];

// Both will be used!
```

---

## Example Setup

Here's a complete example of `src/config/photos.ts`:

```typescript
export const localPhotos = [
  '/media/backgrounds/iuli-bobo-beach.jpg',
  '/media/backgrounds/iuli-bobo-sunset.jpg',
  '/media/backgrounds/iuli-bobo-paris.jpg',
  '/media/backgrounds/iuli-bobo-home.jpg',
];

export const directPhotoUrls = [
  // Leave empty if not using direct URLs
];

export const allPhotos = [...localPhotos, ...directPhotoUrls].filter(url => url && url.length > 0);
export const useCustomPhotos = allPhotos.length > 0;
```

---

## Troubleshooting

### Photos not showing?

1. **Check file location**
   - Photos must be in `public/media/backgrounds/`
   - NOT in `src/` folder!

2. **Check file names**
   - Match exactly what you put in `photos.ts`
   - Including file extensions (.jpg, .png, etc.)
   - File names are case-sensitive!

3. **Check file format**
   - Use common formats: JPG, PNG, WebP
   - Avoid huge files (over 5MB) for better performance

4. **Clear browser cache**
   - Press Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
   - Or open in incognito mode

### Only one photo showing?

- Make sure you added multiple photos to the array
- Check that all file paths are correct
- Look in browser console (F12) for errors

### Photos loading slowly?

- Resize photos to 1920x1080 or smaller
- Use JPG format (smaller file size than PNG)
- Compress images using tools like TinyPNG

---

## Recommended Photo Settings

For best results:

- **Resolution**: 1920x1080 (Full HD) or 1280x720 (HD)
- **Format**: JPG (smaller files)
- **File size**: Under 500KB per photo
- **Aspect ratio**: 16:9 (landscape)

You can use free tools to resize/compress:
- **Windows**: Paint, Photos app
- **Mac**: Preview app
- **Online**: [TinyPNG.com](https://tinypng.com), [Squoosh.app](https://squoosh.app)

---

## Quick Start Checklist

- [ ] Create `public/media/backgrounds/` folder (already done!)
- [ ] Download photos from Google Photos
- [ ] Add photos to the backgrounds folder
- [ ] Open `src/config/photos.ts`
- [ ] List your photo filenames in the `localPhotos` array
- [ ] Save and refresh browser
- [ ] Enjoy! 💕

---

Need help? Check the main [README.md](README.md) or create an issue on GitHub.

**Made with 💕 by Bogdan & Iuliana**
