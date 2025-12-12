// Simple Google Photos Service
// Just paste your public album link and it works!

interface GooglePhotosConfig {
  publicAlbumUrl?: string;
}

class GooglePhotosService {
  private config: GooglePhotosConfig = {};
  private photoUrls: string[] = [];

  /**
   * Initialize with a public Google Photos album URL
   * Example: https://photos.app.goo.gl/xxxxx or https://photos.google.com/share/xxxxx
   */
  init(config: GooglePhotosConfig) {
    this.config = config;
  }

  /**
   * Set photos manually from local folder
   */
  setLocalPhotos(photoUrls: string[]) {
    this.photoUrls = photoUrls;
  }

  /**
   * Get a random photo
   */
  getRandomPhoto(): string | null {
    if (this.photoUrls.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * this.photoUrls.length);
    return this.photoUrls[randomIndex];
  }

  /**
   * Get multiple random photos for collage
   */
  getRandomPhotos(count: number): string[] {
    if (this.photoUrls.length === 0) return [];

    const shuffled = [...this.photoUrls].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, this.photoUrls.length));
  }

  /**
   * Check if service has photos configured
   */
  hasPhotos(): boolean {
    return this.photoUrls.length > 0;
  }
}

export const googlePhotosService = new GooglePhotosService();
export type { GooglePhotosConfig };
