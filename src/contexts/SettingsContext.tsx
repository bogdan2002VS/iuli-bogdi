import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SettingsState {
  darkMode: boolean;
  notifications: boolean;
  soundEffects: boolean;
  animations: boolean;
  kawaiMode: boolean;
  musicAutoplay: boolean;
  backgroundEffects: boolean;
  cursorEffects: boolean;
}

interface SettingsContextType {
  settings: SettingsState;
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  resetSettings: () => void;
}

const defaultSettings: SettingsState = {
  darkMode: false,
  notifications: true,
  soundEffects: true,
  animations: true,
  kawaiMode: true,
  musicAutoplay: false,
  backgroundEffects: true,
  cursorEffects: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(() => {
    // Load settings from localStorage if available
    const saved = localStorage.getItem('matchaos-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  useEffect(() => {
    // Save settings to localStorage whenever they change
    localStorage.setItem('matchaos-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    // Apply cursor effects
    if (settings.cursorEffects) {
      document.body.style.cursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ctext y='24' font-size='20'%3E🌸%3C/text%3E%3C/svg%3E"), auto`;
    } else {
      document.body.style.cursor = 'default';
    }

    // Apply kawaii mode class to body
    if (settings.kawaiMode) {
      document.body.classList.add('kawaii-mode');
    } else {
      document.body.classList.remove('kawaii-mode');
    }

    // Apply animations setting
    if (!settings.animations) {
      document.body.classList.add('no-animations');
    } else {
      document.body.classList.remove('no-animations');
    }
  }, [settings]);

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Show notification if notifications are enabled
    if (settings.notifications && key !== 'notifications') {
      showSettingNotification(key, value);
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('matchaos-settings');
  };

  const showSettingNotification = (key: keyof SettingsState, value: any) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-white rounded-lg shadow-lg border-2 border-violet-300 p-4 z-[9999] animate-bounce';
    
    const settingNames: Record<keyof SettingsState, string> = {
      darkMode: 'Dark Mode',
      notifications: 'Notifications',
      soundEffects: 'Sound Effects',
      animations: 'Animations',
      kawaiMode: 'Kawaii Mode',
      musicAutoplay: 'Music Autoplay',
      backgroundEffects: 'Background Effects',
      cursorEffects: 'Cursor Effects',
    };

    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="text-xl">⚙️</span>
        <span class="font-medium text-gray-800">${settingNames[key]} ${value ? 'enabled' : 'disabled'}</span>
        <span class="text-xl">✨</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 2000);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
