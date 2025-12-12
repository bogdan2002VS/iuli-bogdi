export interface WindowState {
  id: string;
  title: string;
  component: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  icon?: string;
  data?: any;
}

export interface DesktopIcon {
  id: string;
  name: string;
  icon: string;
  position: { x: number; y: number };
  type: 'folder' | 'file' | 'app';
  action?: string;
  data?: any;
}

export interface FileSystemItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  icon: string;
  content?: string;
  children?: FileSystemItem[];
  path: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
}