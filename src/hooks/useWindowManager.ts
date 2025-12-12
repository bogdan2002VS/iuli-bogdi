import { useState, useCallback } from 'react';
import { WindowState } from '../types';

export const useWindowManager = () => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1000);

  const openWindow = useCallback((windowConfig: Partial<WindowState>) => {
    const windowSize = windowConfig.size || { width: 600, height: 400 };
    
    // Calculate center position
    const centerX = (window.innerWidth - windowSize.width) / 2;
    const centerY = (window.innerHeight - windowSize.height) / 2;
    
    // Add small random offset to prevent exact overlapping of multiple windows
    const offsetX = (Math.random() - 0.5) * 40; // ±20px random offset
    const offsetY = (Math.random() - 0.5) * 40; // ±20px random offset
    
    const newWindow: WindowState = {
      id: windowConfig.id || `window-${Date.now()}`,
      title: windowConfig.title || 'Untitled Window',
      component: windowConfig.component || 'default',
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      position: windowConfig.position || { 
        x: Math.max(0, centerX + offsetX), 
        y: Math.max(0, centerY + offsetY) 
      },
      size: windowSize,
      zIndex: nextZIndex,
      icon: windowConfig.icon,
      data: windowConfig.data,
    };

    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);
    return newWindow.id;
  }, [nextZIndex]);

  const closeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
  }, []);

  const minimizeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: !w.isMinimized } : w
    ));
  }, []);

  const maximizeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  }, []);

  const focusWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, zIndex: nextZIndex, isMinimized: false } : w
    ));
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  const updateWindow = useCallback((windowId: string, updates: Partial<WindowState>) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, ...updates } : w
    ));
  }, []);

  return {
    windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updateWindow,
  };
};