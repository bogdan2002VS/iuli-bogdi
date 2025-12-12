import React, { useState, useEffect } from 'react';
import { WindowState } from '../types';

interface TaskbarProps {
  windows: WindowState[];
  onStartClick: () => void;
  onWindowClick: (windowId: string) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ windows, onStartClick, onWindowClick }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const openWindows = windows.filter(w => w.isOpen);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-gradient-to-r from-violet-100/95 via-purple-100/95 to-lavender-100/95 backdrop-blur-md border-t border-violet-200/70 shadow-lg z-30 flex items-center px-4">
      {/* Start Button */}
      <button
        onClick={onStartClick}
        className="bg-violet-200/50 hover:bg-violet-200/70 rounded-lg px-4 py-2 text-violet-800 font-medium transition-all duration-200 flex items-center space-x-2 border border-violet-300/50"
      >
        <span className="text-lg">🧁</span>
        <span>Start</span>
      </button>

      {/* Window Buttons */}
      <div className="flex-1 flex items-center space-x-2 mx-4 overflow-x-auto">
        {openWindows.map(window => (
          <button
            key={window.id}
            onClick={() => onWindowClick(window.id)}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 min-w-0 max-w-48 border
              ${window.isMinimized
                ? 'bg-violet-200/40 text-violet-700 border-violet-300/50'
                : 'bg-violet-200/60 text-violet-800 border-violet-300/70'
              }
            `}
          >
            {window.icon && <span className="text-base">{window.icon}</span>}
            <span className="truncate">{window.title}</span>
          </button>
        ))}
      </div>

      {/* Clock */}
      <div className="bg-violet-200/50 border border-violet-300/50 rounded-lg px-3 py-2 text-violet-800 font-mono text-sm">
        <div>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        <div className="text-xs opacity-80">{currentTime.toLocaleDateString()}</div>
      </div>
    </div>
  );
};

export default Taskbar;