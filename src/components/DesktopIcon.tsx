import React, { useState } from 'react';
import { DesktopIcon as DesktopIconType } from '../types';

interface DesktopIconProps {
  icon: DesktopIconType;
  onDoubleClick: (icon: DesktopIconType) => void;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ icon, onDoubleClick }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
  };

  // Calculate position - if Y is negative, calculate from bottom of screen
  const getPosition = () => {
    let x = icon.position.x;
    let y = icon.position.y;
    
    // Special handling for center positioning for IMPORTANT.txt
    if (icon.id === 'important-txt') {
      x = window.innerWidth / 2 - 40; // Center minus half icon width
    }
    
    if (y < 0) {
      // Negative Y means position from bottom of screen
      y = window.innerHeight + y; // Add negative value to subtract from height
    }
    
    return { left: x, top: y };
  };

  return (
    <div
      className={`absolute flex flex-col items-center cursor-pointer hover:bg-white/20 hover:backdrop-blur-sm rounded-lg p-2 transition-all duration-200 group ${
        isClicked ? 'scale-95' : 'hover:scale-110'
      }`}
      style={getPosition()}
      onDoubleClick={() => onDoubleClick(icon)}
      onClick={handleClick}
    >
      <div className={`text-5xl mb-1 transition-all duration-200 drop-shadow-lg relative ${
        isClicked ? 'scale-90' : 'group-hover:scale-110'
      }`}>
        {icon.icon.startsWith('/') || icon.icon.startsWith('http') ? (
          <img 
            src={icon.icon} 
            alt={icon.name}
            className="w-16 h-16 object-cover rounded-xl border-4 border-white/80 shadow-lg backdrop-blur-sm bg-white/20"
            style={{
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3))',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5)'
            }}
          />
        ) : (
          icon.icon
        )}
        {/* Sparkle effect on hover */}
        <div className="absolute -top-1 -right-1 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 animate-pulse">
          ✨
        </div>
      </div>
      <span className="text-white text-sm font-medium text-center drop-shadow-md max-w-20 truncate bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
        {icon.name}
      </span>
    </div>
  );
};

export default DesktopIcon;