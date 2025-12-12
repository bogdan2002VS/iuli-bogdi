import React, { useState } from 'react';
import { FileSystemItem } from '../types';
import { fileSystem } from '../data/filesystem';
import { Folder, ArrowLeft } from 'lucide-react';
import { getSocialIcon } from './SocialIcons';

interface FileManagerProps {
  initialPath?: string;
  onFileOpen?: (file: FileSystemItem) => void;
}

const FileManager: React.FC<FileManagerProps> = ({ initialPath = '/', onFileOpen }) => {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [pathHistory, setPathHistory] = useState<string[]>(['/']);

  const getCurrentFolder = (): FileSystemItem | null => {
    if (currentPath === '/') {
      return {
        id: 'root',
        name: 'Desktop',
        type: 'folder',
        icon: '🖥️',
        path: '/',
        children: fileSystem
      };
    }

    const findFolder = (items: FileSystemItem[]): FileSystemItem | null => {
      for (const item of items) {
        if (item.path === currentPath) return item;
        if (item.children) {
          const found = findFolder(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findFolder(fileSystem);
  };

  const handleItemClick = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      setPathHistory(prev => [...prev, currentPath]);
      setCurrentPath(item.path);
    } else {
      onFileOpen?.(item);
    }
  };

  const handleBack = () => {
    if (pathHistory.length > 1) {
      const newHistory = [...pathHistory];
      const previousPath = newHistory.pop()!;
      setPathHistory(newHistory);
      setCurrentPath(previousPath);
    }
  };

  const currentFolder = getCurrentFolder();

  return (
    <div className="h-full bg-pink-25/50 backdrop-blur-sm flex flex-col">
      {/* Navigation Bar */}
      <div className="bg-pink-50/90 backdrop-blur-sm border-b border-pink-200/70 p-3 flex items-center space-x-3">
        <button
          onClick={handleBack}
          disabled={pathHistory.length <= 1}
          className="p-2 rounded hover:bg-pink-100 disabled:opacity-50 disabled:cursor-not-allowed border border-pink-200/50"
        >
          <ArrowLeft className="w-4 h-4 text-pink-600" />
        </button>
        <div className="flex-1 bg-pink-100/70 border border-pink-200/50 rounded px-3 py-1 text-sm text-pink-800">
          {currentPath}
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-4 gap-4">
          {currentFolder?.children?.map(item => (
            <div
              key={item.id}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-pink-100/80 hover:shadow-md transition-all duration-200 cursor-pointer group backdrop-blur-sm border border-pink-200/30"
              onDoubleClick={() => handleItemClick(item)}
            >
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-200">
                {item.type === 'folder' ? (
                  <Folder className="w-12 h-12 text-pink-400" />
                ) : (
                  getSocialIcon(item.icon, 48) || <div className="text-4xl">{item.icon}</div>
                )}
              </div>
              <span className="text-sm text-center font-medium text-pink-700 truncate max-w-full">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileManager;