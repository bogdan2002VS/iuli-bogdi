import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WindowState } from '../types';
import { X, Minus, Square } from 'lucide-react';

interface WindowProps {
  window: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onUpdate: (updates: Partial<WindowState>) => void;
  children: React.ReactNode;
}

const Window: React.FC<WindowProps> = ({
  window,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onUpdate,
  children
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(true);
  const windowRef = useRef<HTMLDivElement>(null);

  // Animation on mount
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      onUpdate({
        position: {
          x: Math.max(0, e.clientX - dragStart.x),
          y: Math.max(0, e.clientY - dragStart.y)
        }
      });
    }
  }, [isDragging, dragStart, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('window-title')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - window.position.x,
        y: e.clientY - window.position.y
      });
      onFocus();
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  if (!window.isOpen || window.isMinimized) return null;

  const windowStyle = window.isMaximized
    ? { top: 0, left: 0, width: '100vw', height: '100vh' }
    : {
        top: window.position.y,
        left: window.position.x,
        width: window.size.width,
        height: window.size.height
      };

  return (
    <div
      ref={windowRef}
      className={`fixed bg-pink-50/95 backdrop-blur-md rounded-lg shadow-2xl border-2 border-pink-200/70 overflow-hidden transition-all duration-300 ${
        isDragging ? 'cursor-move' : ''
      } ${isAnimating ? 'animate-[windowOpen_0.3s_ease-out]' : ''}`}
      style={{ 
        ...windowStyle, 
        zIndex: window.zIndex,
        boxShadow: '0 20px 25px -5px rgba(249, 168, 212, 0.15), 0 10px 10px -5px rgba(252, 165, 165, 0.1), 0 0 0 1px rgba(249, 168, 212, 0.2)'
      }}
      onClick={onFocus}
    >
      {/* Enhanced Title Bar */}
      <div
        className="window-title bg-gradient-to-r from-pink-200 via-rose-200 to-pink-300 text-pink-800 px-4 py-3 flex items-center justify-between cursor-move select-none relative overflow-hidden border-b border-pink-300/50"
        onMouseDown={handleMouseDown}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1 right-4 text-sm animate-pulse text-pink-400">✨</div>
          <div className="absolute bottom-1 left-8 text-xs animate-bounce text-pink-400">💕</div>
        </div>
        
        <div className="flex items-center space-x-2 relative z-10">
          {window.icon && <span className="text-lg drop-shadow-sm">{window.icon}</span>}
          <span className="font-medium drop-shadow-sm">{window.title}</span>
        </div>
        
        <div className="flex items-center space-x-2 relative z-10">
          <button
            onClick={onMinimize}
            className="w-7 h-7 rounded-full bg-yellow-300 hover:bg-yellow-400 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm border border-yellow-400/50"
          >
            <Minus className="w-3 h-3 text-yellow-800 drop-shadow-sm" />
          </button>
          <button
            onClick={onMaximize}
            className="w-7 h-7 rounded-full bg-green-300 hover:bg-green-400 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm border border-green-400/50"
          >
            <Square className="w-3 h-3 text-green-800 drop-shadow-sm" />
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-red-300 hover:bg-red-400 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm border border-red-400/50"
          >
            <X className="w-3 h-3 text-red-800 drop-shadow-sm" />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-hidden bg-pink-25/80 backdrop-blur-sm" style={{ height: 'calc(100% - 52px)' }}>
        {children}
      </div>

      <style>{`
        @keyframes windowOpen {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Window;