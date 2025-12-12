// Google Photos API Service
// This service handles fetching photos from Google Photos API

interface GooglePhotosConfig {
  apiKey: string;
  albumId?: string;
}

interface PhotoItem {
  id: string;
  baseUrl: string;
  productUrl: string;
  mimeType: string;
  filename: string;
}

class GooglePhotosService {
  private config: GooglePhotosConfig | null = null;
  private cachedPhotos: PhotoItem[] = [];
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 3600000; // 1 hour in milliseconds

  /**
   * Initialize the Google Photos service with API credentials
   */
  init(config: GooglePhotosConfig) {
    this.config = config;
  }

  /**
   * Check if the service is initialized
   */
  isInitialized(): boolean {
    return this.config !== null && this.config.apiKey !== '';
  }

  /**
   * Fetch photos from Google Photos API
   */
  async fetchPhotos(): Promise<PhotoItem[]> {
    if (!this.isInitialized()) {
      console.warn('Google Photos service not initialized. Using default backgrounds.');
      return [];
    }

    // Return cached photos if still valid
    const now = Date.now();
    if (this.cachedPhotos.length > 0 && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      return this.cachedPhotos;
    }

    try {
      const endpoint = this.config!.albumId
        ? `https://photoslibrary.googleapis.com/v1/albums/${this.config!.albumId}/mediaItems`
        : 'https://photoslibrary.googleapis.com/v1/mediaItems';

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${this.config!.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Google Photos API error: ${response.status}`);
      }

      const data = await response.json();
      this.cachedPhotos = data.mediaItems || [];
      this.lastFetchTime = now;

      return this.cachedPhotos;
    } catch (error) {
      console.error('Error fetching photos from Google Photos:', error);
      return [];
    }
  }

  /**
   * Get a random photo from the collection
   */
  async getRandomPhoto(): Promise<string | null> {
    const photos = await this.fetchPhotos();
    if (photos.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * photos.length);
    const photo = photos[randomIndex];

    // Add size parameters to get full resolution
    return `${photo.baseUrl}=w1920-h1080`;
  }

  /**
   * Get multiple random photos for collage
   */
  async getRandomPhotos(count: number): Promise<string[]> {
    const photos = await this.fetchPhotos();
    if (photos.length === 0) return [];

    const shuffled = [...photos].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, photos.length));

    return selected.map(photo => `${photo.baseUrl}=w1920-h1080`);
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cachedPhotos = [];
    this.lastFetchTime = 0;
  }
}

export const googlePhotosService = new GooglePhotosService();
export type { GooglePhotosConfig, PhotoItem };
