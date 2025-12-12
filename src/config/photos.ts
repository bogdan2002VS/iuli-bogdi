// 📸 PHOTO CONFIGURATION
// Add your photos here - super simple!

// METHOD 1: Use photos from your public/media/backgrounds folder
// Just add your photos to public/media/backgrounds/ and list them here
export const localPhotos = [
  '/media/backgrounds/photo1.jpg',
  '/media/backgrounds/photo2.jpg',
  '/media/backgrounds/photo3.jpg',
  // Add more photos here...
];

// METHOD 2: Use direct image URLs (from Google Photos or anywhere)
// Right-click on an image in Google Photos → "Copy image address" and paste here
export const directPhotoUrls = [
  // Example:
  // 'https://lh3.googleusercontent.com/...',
  // 'https://lh3.googleusercontent.com/...',
];

// Combine all photos
export const allPhotos = [...localPhotos, ...directPhotoUrls].filter(url => url && url.length > 0);

// Set to true to use photos, false to use default background
export const useCustomPhotos = allPhotos.length > 0;
