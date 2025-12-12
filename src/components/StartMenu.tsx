import React, { useState } from 'react';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFileManager: () => void;
  onOpenFolder?: (folderId: string) => void;
}

const StartMenu: React.FC<StartMenuProps> = ({
  isOpen,
  onClose,
  onOpenFileManager,
  onOpenFolder,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const menuItems = [
    {
      id: 'files',
      icon: '📁',
      label: 'Files & Letters',
      items: [
        { icon: '💌', label: 'Love Letters', action: () => openLoveLetters() },
        { icon: '📁', label: 'File Manager', action: onOpenFileManager },
        { icon: '🌸', label: 'Pukku Socials', action: () => handleSocialsClick('strawberry-socials') },
        { icon: '🌟', label: 'Debangshu Socials', action: () => handleSocialsClick('pinak-socials') },
      ]
    },
    {
      id: 'about',
      icon: '💖',
      label: 'About MatchaOS',
      items: [
        { icon: '🌸', label: 'Version 1.0', action: () => showAboutNotification() },
        { icon: '💕', label: 'Made with Love', action: () => showLoveNotification() },
      ]
    }
  ];

  const openLoveLetters = () => {
    // Open file manager directly to love letters
    onOpenFileManager();
    onClose();
  };

  const handleSocialsClick = (folderId: string) => {
    if (onOpenFolder) {
      onOpenFolder(folderId);
    } else {
      // Fallback to regular file manager
      onOpenFileManager();
    }
    onClose();
  };

  const showLoveNotification = () => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-white rounded-lg shadow-lg border-2 border-pink-300 p-4 z-50 animate-bounce';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="text-2xl">💕</span>
        <span class="font-medium text-gray-800">Debangshu and Pukku forever! {'>'} w {'<'}</span>
        <span class="text-xl">✨</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
    onClose();
  };

  const showAboutNotification = () => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-white rounded-lg shadow-lg border-2 border-pink-300 p-4 z-50 animate-bounce';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="text-2xl">🌸</span>
        <span class="font-medium text-gray-800">MatchaOS - The cutest OS ever! uwu</span>
        <span class="text-xl">💖</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
    onClose();
  };

  const handleItemClick = (action: () => void) => {
    action();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Start Menu */}
      <div className="fixed bottom-12 left-4 z-50">
        <div className="bg-pink-50/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-pink-200/70 overflow-hidden min-w-80 max-w-96">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-200 to-rose-200 p-4 text-center border-b border-pink-300/50">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">🌸</span>
              <h2 className="text-lg font-bold text-pink-800">MatchaOS</h2>
              <span className="text-2xl">✨</span>
            </div>
            <p className="text-sm text-pink-600 mt-1">hewwo user! {'>'} w {'<'}</p>
          </div>

          {/* Menu Content */}
          <div className="p-2 max-h-96 overflow-y-auto">
            {menuItems.map((section) => (
              <div key={section.id} className="mb-3">
                {/* Section Header */}
                <div className="flex items-center space-x-2 px-3 py-2 text-pink-600 font-medium">
                  <span className="text-lg">{section.icon}</span>
                  <span className="text-sm">{section.label}</span>
                </div>
                
                {/* Section Items */}
                <div className="space-y-1">
                  {section.items.map((item, index) => (
                    <button
                      key={index}
                      className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-pink-100 hover:scale-105 ${
                        hoveredItem === `${section.id}-${index}` ? 'bg-pink-100 shadow-md' : ''
                      }`}
                      onMouseEnter={() => setHoveredItem(`${section.id}-${index}`)}
                      onMouseLeave={() => setHoveredItem(null)}
                      onClick={() => handleItemClick(item.action)}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="bg-pink-50 p-3 border-t border-pink-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">💖</span>
                <span className="text-xs text-pink-600">Made with love</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-pink-500">v1.0</span>
                <span className="text-sm">🌸</span>
              </div>
            </div>
          </div>

          {/* Cute decorative elements */}
          <div className="absolute top-2 right-2 text-pink-300 animate-pulse">
            ✨
          </div>
          <div className="absolute bottom-16 right-4 text-pink-300 animate-pulse delay-75">
            💕
          </div>
          <div className="absolute top-1/2 left-2 text-pink-300 animate-pulse delay-150">
            🌟
          </div>
        </div>
      </div>
    </>
  );
};

export default StartMenu;