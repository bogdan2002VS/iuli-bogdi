import React, { useEffect } from 'react';
import { FileSystemItem } from '../types';
import { getSocialIcon } from './SocialIcons';

interface TextEditorProps {
  file: FileSystemItem;
}

const TextEditor: React.FC<TextEditorProps> = ({ file }) => {
  // Check if content is a URL and auto-open it
  useEffect(() => {
    if (file.content && isValidURL(file.content)) {
      // Auto-open social media links in new tab
      window.open(file.content, '_blank', 'noopener,noreferrer');
    }
  }, [file.content]);

  const isValidURL = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleLinkClick = () => {
    if (file.content && isValidURL(file.content)) {
      window.open(file.content, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="h-full bg-white/50 backdrop-blur-sm p-4">
      <div className="mb-4 border-b border-gray-200 pb-2">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="mr-2">
            {getSocialIcon(file.icon, 20) || <span>{file.icon}</span>}
          </span>
          {file.name}
        </h2>
      </div>
      <div className="bg-gray-50/70 backdrop-blur-sm rounded-lg p-4 h-full overflow-auto">
        {file.content && isValidURL(file.content) ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              {getSocialIcon(file.icon, 64) || <div className="text-4xl">{file.icon}</div>}
            </div>
            <p className="text-gray-600 mb-4">Social Media Link</p>
            <button
              onClick={handleLinkClick}
              className="bg-gradient-to-r from-pink-400 to-purple-500 text-white px-6 py-3 rounded-lg hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Open Link in New Tab
            </button>
            <div className="mt-4 p-3 bg-gray-100/80 rounded-lg">
              <p className="text-sm text-gray-600 break-all">{file.content}</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Link will auto-open when this file is accessed
            </p>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 leading-relaxed">
            {file.content}
          </pre>
        )}
      </div>
    </div>
  );
};

export default TextEditor;
