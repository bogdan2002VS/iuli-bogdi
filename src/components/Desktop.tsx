import React, { useState } from 'react';
import { useWindowManager } from '../hooks/useWindowManager';
import { desktopIcons, fileSystem } from '../data/filesystem';
import { DesktopIcon as DesktopIconType, FileSystemItem } from '../types';
import DesktopIcon from './DesktopIcon';
import Window from './Window';
import Taskbar from './Taskbar';
import StartMenu from './StartMenu';
import FileManager from './FileManager';
import TextEditor from './TextEditor';
import MessagePopup from './MessagePopup';
import SpotifyMusicBox from './SpotifyMusicBox';
import KawaiiEffects from './KawaiiEffects';
import TGTimeWidget from './TGTimeWidget';
import LetterGenerator from './LetterGenerator';
import BackgroundManager from './BackgroundManager';
import Fifi from './Fifi';
import { useSettings } from '../contexts/SettingsContext';

const Desktop: React.FC = () => {
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [showMusicBox, setShowMusicBox] = useState(false);
  const { settings } = useSettings();
  
  const {
    windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updateWindow,
  } = useWindowManager();

  const handleDesktopClick = (e: React.MouseEvent) => {
    // Only spawn emoji if clicking on the desktop itself, not on icons or other elements
    if (e.target === e.currentTarget) {
      // Don't interfere with music box functionality
      const emoji = ['✨', '💕', '🌸', '💖', '🦄', '💫', '🌟'][Math.floor(Math.random() * 7)];
      const emojiElement = document.createElement('div');
      emojiElement.innerHTML = emoji;
      emojiElement.style.cssText = `
        position: fixed;
        left: ${e.clientX - 15}px;
        top: ${e.clientY - 15}px;
        font-size: 30px;
        pointer-events: none;
        z-index: 1000;
        animation: emojiFloat 3s ease-out forwards;
      `;
      
      document.body.appendChild(emojiElement);
      
      setTimeout(() => {
        emojiElement.remove();
      }, 3000);
    }
  };

  const handleIconDoubleClick = (icon: DesktopIconType) => {
    if (icon.action === 'popup' && icon.data?.message) {
      // Check if it's Bogdan or Iuliana profile - show both message popup AND music box
      if (icon.id === 'bogdan-profile' || icon.id === 'iuliana-profile') {
        // Show message popup in center of screen
        openWindow({
          id: `message-${icon.id}`,
          title: icon.name,
          component: 'message-popup',
          icon: icon.icon,
          data: { message: icon.data.message },
          size: { width: 400, height: 300 }
        });
        // Also show music box in bottom right
        setShowMusicBox(true);
      } else {
        // Open a small window with the message popup for other items
        openWindow({
          id: `message-${icon.id}`,
          title: icon.name,
          component: 'message-popup',
          icon: icon.icon,
          data: { message: icon.data.message },
          size: { width: 400, height: 300 }
        });
      }
    } else if (icon.action === 'open-folder' && icon.data?.folderId) {
      const folder = fileSystem.find(f => f.id === icon.data.folderId);
      if (folder) {
        openWindow({
          id: `folder-${folder.id}`,
          title: folder.name,
          component: 'file-manager',
          icon: folder.icon,
          data: { folder },
          size: { width: 800, height: 600 }
        });
      }
    } else if (icon.action === 'open-file' && icon.data?.fileId) {
      const file = fileSystem.find(f => f.id === icon.data.fileId);
      if (file) {
        openWindow({
          id: `file-${file.id}`,
          title: file.name,
          component: 'text-editor',
          icon: file.icon,
          data: { file },
          size: { width: 600, height: 500 }
        });
      }
    }
  };

  const handleFileOpen = (file: FileSystemItem) => {
    openWindow({
      id: `file-${file.id}`,
      title: file.name,
      component: 'text-editor',
      icon: file.icon,
      data: { file },
      size: { width: 600, height: 500 }
    });
  };

  const handleStartClick = () => {
    setShowStartMenu(!showStartMenu);
  };

  const handleOpenFileManager = () => {
    openWindow({
      id: 'file-manager-main',
      title: 'File Manager',
      component: 'file-manager',
      icon: '📁',
      size: { width: 800, height: 600 }
    });
  };

  const handleOpenFolder = (folderId: string) => {
    const folder = fileSystem.find(f => f.id === folderId);
    if (folder) {
      openWindow({
        id: `folder-${folder.id}`,
        title: folder.name,
        component: 'file-manager',
        icon: folder.icon,
        data: { folder },
        size: { width: 800, height: 600 }
      });
    }
  };

  const handleOpenLetterGenerator = () => {
    openWindow({
      id: 'letter-generator',
      title: '✍️ Generator de Scrisori',
      component: 'letter-generator',
      icon: '💌',
      size: { width: 700, height: 600 }
    });
  };

  const handleLetterCreated = (letter: FileSystemItem) => {
    // Open the newly created letter in a text editor
    openWindow({
      id: `file-${letter.id}`,
      title: letter.name,
      component: 'text-editor',
      icon: letter.icon,
      data: { file: letter },
      size: { width: 600, height: 500 }
    });
  };

  const renderWindowContent = (window: any) => {
    switch (window.component) {
      case 'file-manager':
        return (
          <FileManager
            initialPath={window.data?.folder?.path || '/'}
            onFileOpen={handleFileOpen}
          />
        );
      case 'text-editor':
        return <TextEditor file={window.data.file} />;
      case 'message-popup':
        return <MessagePopup message={window.data.message} />;
      case 'letter-generator':
        return <LetterGenerator onLetterCreated={handleLetterCreated} />;
      default:
        return <div className="p-4">Unknown window type</div>;
    }
  };

  return (
    <BackgroundManager refreshInterval={300000}>
      <div
        className="relative w-full h-screen overflow-hidden"
        onClick={handleDesktopClick}
      >

        {/* Light violet overlay to maintain the soft theme */}
        <div className="absolute inset-0 bg-violet-50/30"></div>

      {/* Kawaii Effects Layer - only if enabled */}
      {settings.kawaiMode && <KawaiiEffects />}

      {/* Fifi the Cat */}
      <Fifi />

      {/* Desktop Icons */}
      {desktopIcons.map(icon => (
        <DesktopIcon
          key={icon.id}
          icon={icon}
          onDoubleClick={handleIconDoubleClick}
        />
      ))}

      {/* TG Time Widget */}
      <TGTimeWidget />

      {/* Windows */}
      {windows.map(window => (
        <Window
          key={window.id}
          window={window}
          onClose={() => closeWindow(window.id)}
          onMinimize={() => minimizeWindow(window.id)}
          onMaximize={() => maximizeWindow(window.id)}
          onFocus={() => focusWindow(window.id)}
          onUpdate={(updates) => updateWindow(window.id, updates)}
        >
          {renderWindowContent(window)}
        </Window>
      ))}

      {/* Start Menu */}
      <StartMenu
        isOpen={showStartMenu}
        onClose={() => setShowStartMenu(false)}
        onOpenFileManager={handleOpenFileManager}
        onOpenFolder={handleOpenFolder}
        onOpenLetterGenerator={handleOpenLetterGenerator}
      />

      {/* Taskbar */}
      <Taskbar
        windows={windows}
        onStartClick={handleStartClick}
        onWindowClick={(windowId) => {
          const window = windows.find(w => w.id === windowId);
          if (window) {
            if (window.isMinimized) {
              minimizeWindow(windowId);
            }
            focusWindow(windowId);
          }
        }}
      />

      {/* Spotify Music Box */}
      {showMusicBox && (
        <SpotifyMusicBox
          isVisible={showMusicBox}
          onClose={() => setShowMusicBox(false)}
        />
      )}

      {/* Global CSS for emoji animation */}
      <style>{`
        @keyframes emojiFloat {
          0% {
            opacity: 1;
            transform: scale(0.8) translateY(0);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.2) translateY(-20px);
          }
          100% {
            opacity: 0;
            transform: scale(0.6) translateY(-40px);
          }
        }
      `}</style>
      </div>
    </BackgroundManager>
  );
};

export default Desktop;