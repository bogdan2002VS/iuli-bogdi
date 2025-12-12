import React from 'react';

interface MessagePopupProps {
  message: string;
  onClose?: () => void;
}

const MessagePopup: React.FC<MessagePopupProps> = ({ message, onClose }) => {
  return (
    <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg border-2 border-violet-200 shadow-lg">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <span className="text-3xl animate-pulse">💕</span>
        <span className="text-3xl animate-bounce">✨</span>
      </div>
      
      <div className="text-center">
        <p className="text-lg font-medium text-gray-800 mb-4 leading-relaxed">
          {message}
        </p>
        
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-violet-300 hover:bg-violet-400 text-white font-medium rounded-full transition-colors duration-200 transform hover:scale-105"
          >
            Close ✨
          </button>
        )}
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -top-2 -left-2 text-2xl opacity-60 animate-spin" style={{ animationDuration: '3s' }}>
        🌸
      </div>
      <div className="absolute -top-2 -right-2 text-xl opacity-70 animate-pulse">
        💖
      </div>
      <div className="absolute -bottom-2 -left-2 text-lg opacity-50 animate-bounce" style={{ animationDelay: '0.5s' }}>
        🦄
      </div>
    </div>
  );
};

export default MessagePopup;