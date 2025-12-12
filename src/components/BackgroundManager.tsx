import React, { useEffect, useState } from 'react';
import { googlePhotosService } from '../services/googlePhotos';

interface BackgroundManagerProps {
  children: React.ReactNode;
  useGooglePhotos?: boolean;
  refreshInterval?: number; // in milliseconds
}

const BackgroundManager: React.FC<BackgroundManagerProps> = ({
  children,
  useGooglePhotos = false,
  refreshInterval = 300000, // 5 minutes default
}) => {
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBackgrounds();

    // Set up interval to change background
    const intervalId = setInterval(() => {
      if (backgroundImages.length > 1) {
        setCurrentBackgroundIndex((prev) => (prev + 1) % backgroundImages.length);
      }
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval, backgroundImages.length]);

  const loadBackgrounds = async () => {
    setIsLoading(true);

    if (useGooglePhotos && googlePhotosService.isInitialized()) {
      try {
        // Try to get multiple photos for variety
        const photos = await googlePhotosService.getRandomPhotos(5);

        if (photos.length > 0) {
          setBackgroundImages(photos);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error loading Google Photos:', error);
      }
    }

    // Fallback to default background
    setBackgroundImages(['/media/bg.jpg']);
    setIsLoading(false);
  };

  const currentBackground = backgroundImages[currentBackgroundIndex] || '/media/bg.jpg';

  // Determine if we need to create a collage or use a single image
  const backgroundStyle: React.CSSProperties = {
    backgroundImage: `url(${currentBackground})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    transition: 'background-image 1s ease-in-out',
  };

  return (
    <div className="relative w-full h-screen overflow-hidden" style={backgroundStyle}>
      {children}
    </div>
  );
};

export default BackgroundManager;
