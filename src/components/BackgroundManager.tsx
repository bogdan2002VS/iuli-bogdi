import React, { useEffect, useState } from 'react';
import { allPhotos, useCustomPhotos } from '../config/photos';

interface BackgroundManagerProps {
  children: React.ReactNode;
  refreshInterval?: number; // in milliseconds
}

const BackgroundManager: React.FC<BackgroundManagerProps> = ({
  children,
  refreshInterval = 300000, // 5 minutes default
}) => {
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);

  useEffect(() => {
    // Load backgrounds on mount
    if (useCustomPhotos && allPhotos.length > 0) {
      setBackgroundImages(allPhotos);
    } else {
      // Use default background
      setBackgroundImages(['/media/bg.jpg']);
    }
  }, []);

  useEffect(() => {
    if (backgroundImages.length <= 1) return;

    // Set up interval to change background
    const intervalId = setInterval(() => {
      setCurrentBackgroundIndex((prev) => (prev + 1) % backgroundImages.length);
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval, backgroundImages.length]);

  const currentBackground = backgroundImages[currentBackgroundIndex] || '/media/bg.jpg';

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
