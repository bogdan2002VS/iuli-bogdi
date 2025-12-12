import React, { useState, useEffect } from 'react';
import { Settings, Palette, Volume2, Bell, Heart, Star, Sparkles, Moon, Sun, RotateCcw } from 'lucide-react';
import { useSettings, SettingsState } from '../contexts/SettingsContext';

const SettingsApp: React.FC = () => {
  const { settings, updateSetting, resetSettings } = useSettings();
  const [activeSection, setActiveSection] = useState('appearance');
  const [showStickers, setShowStickers] = useState(false);

  useEffect(() => {
    // Trigger sticker animation on mount
    setShowStickers(true);
  }, []);

  const toggleSetting = (key: keyof SettingsState) => {
    updateSetting(key, !settings[key]);
  };

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: Palette, color: 'text-pink-500' },
    { id: 'sound', label: 'Sound & Music', icon: Volume2, color: 'text-purple-500' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-blue-500' },
    { id: 'kawaii', label: 'Kawaii Mode', icon: Heart, color: 'text-red-500' },
  ];

  const kawaiStickers = ['🌸', '💕', '✨', '🦄', '🍓', '🌙', '⭐', '💖', '🎀', '🧁'];

  return (
    <div className="h-full bg-gradient-to-br from-pink-50 to-purple-50 flex relative overflow-hidden">
      {/* Kawaii Stickers */}
      {showStickers && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {kawaiStickers.map((sticker, index) => (
            <div
              key={index}
              className="absolute text-2xl animate-bounce opacity-20 hover:opacity-60 transition-opacity duration-300"
              style={{
                left: `${10 + (index * 8)}%`,
                top: `${15 + (index % 3) * 25}%`,
                animationDelay: `${index * 0.2}s`,
                animationDuration: `${2 + (index % 3)}s`
              }}
            >
              {sticker}
            </div>
          ))}
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 bg-pink-50/90 backdrop-blur-sm border-r border-pink-200/70 p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Settings className="w-6 h-6 mr-2 text-pink-500" />
            Settings
          </h2>
          <p className="text-sm text-gray-600 mt-1">Customize your MatchaOS experience! ✨</p>
        </div>

        <nav className="space-y-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                activeSection === section.id
                  ? 'bg-pink-100 border-2 border-pink-300 shadow-md'
                  : 'hover:bg-pink-50'
              }`}
            >
              <section.icon className={`w-5 h-5 ${section.color}`} />
              <span className="font-medium text-gray-700">{section.label}</span>
            </button>
          ))}
        </nav>

        {/* Cute mascot */}
        <div className="mt-8 text-center">
          <div className="text-6xl animate-pulse">🧁</div>
          <p className="text-xs text-gray-500 mt-2">MatchaOS Mascot</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeSection === 'appearance' && (
          <div className="space-y-6">
            <div className="bg-pink-50/90 backdrop-blur-sm rounded-xl p-6 border border-pink-200/70 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2 text-pink-500" />
                Appearance Settings
              </h3>
              
              <div className="space-y-4">
                <ToggleOption
                  label="Dark Mode"
                  description="Switch to a darker theme (coming soon!)"
                  icon={settings.darkMode ? Moon : Sun}
                  checked={settings.darkMode}
                  onChange={() => toggleSetting('darkMode')}
                  disabled={true}
                />
                
                <ToggleOption
                  label="Background Effects"
                  description="Show falling stars and animated background"
                  icon={Sparkles}
                  checked={settings.backgroundEffects}
                  onChange={() => toggleSetting('backgroundEffects')}
                />
                
                <ToggleOption
                  label="Cursor Effects"
                  description="Enable sparkly cursor animations"
                  icon={Star}
                  checked={settings.cursorEffects}
                  onChange={() => toggleSetting('cursorEffects')}
                />
                
                <ToggleOption
                  label="Window Animations"
                  description="Smooth window transitions and effects"
                  icon={Sparkles}
                  checked={settings.animations}
                  onChange={() => toggleSetting('animations')}
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'sound' && (
          <div className="space-y-6">
            <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-6 border border-pink-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Volume2 className="w-5 h-5 mr-2 text-purple-500" />
                Sound & Music Settings
              </h3>
              
              <div className="space-y-4">
                <ToggleOption
                  label="Sound Effects"
                  description="Play cute sounds on interactions"
                  icon={Volume2}
                  checked={settings.soundEffects}
                  onChange={() => toggleSetting('soundEffects')}
                />
                
                <ToggleOption
                  label="Music Autoplay"
                  description="Automatically start music player"
                  icon={Volume2}
                  checked={settings.musicAutoplay}
                  onChange={() => toggleSetting('musicAutoplay')}
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-6 border border-pink-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-blue-500" />
                Notification Settings
              </h3>
              
              <div className="space-y-4">
                <ToggleOption
                  label="Desktop Notifications"
                  description="Show cute popup notifications"
                  icon={Bell}
                  checked={settings.notifications}
                  onChange={() => toggleSetting('notifications')}
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'kawaii' && (
          <div className="space-y-6">
            <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-6 border border-pink-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Kawaii Mode Settings
              </h3>
              
              <div className="space-y-4">
                <ToggleOption
                  label="Extra Kawaii Mode"
                  description="Maximum cuteness with extra animations! >w<"
                  icon={Heart}
                  checked={settings.kawaiMode}
                  onChange={() => toggleSetting('kawaiMode')}
                />
                
                <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                  <h4 className="font-semibold text-pink-800 mb-2">Kawaii Stats</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl">💕</div>
                      <div className="text-pink-600">Love Level: MAX</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">✨</div>
                      <div className="text-pink-600">Sparkles: Infinite</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cute footer */}
        <div className="mt-8 text-center space-y-4">
          <button
            onClick={resetSettings}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white px-6 py-3 rounded-full hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="font-medium">Reset All Settings</span>
          </button>
          
          <div className="inline-flex items-center space-x-2 bg-white bg-opacity-60 rounded-full px-4 py-2 border border-pink-200">
            <span className="text-sm text-gray-600">Made with</span>
            <Heart className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="text-sm text-gray-600">for Yuzy & Assad</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ToggleOptionProps {
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

const ToggleOption: React.FC<ToggleOptionProps> = ({ 
  label, 
  description, 
  icon: Icon, 
  checked, 
  onChange, 
  disabled = false 
}) => {
  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
      disabled ? 'bg-gray-50 border-gray-200' : 'bg-white border-pink-200 hover:border-pink-300'
    }`}>
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${disabled ? 'bg-gray-200' : 'bg-pink-100'}`}>
          <Icon className={`w-5 h-5 ${disabled ? 'text-gray-400' : 'text-pink-500'}`} />
        </div>
        <div>
          <h4 className={`font-medium ${disabled ? 'text-gray-400' : 'text-gray-800'}`}>{label}</h4>
          <p className={`text-sm ${disabled ? 'text-gray-300' : 'text-gray-600'}`}>{description}</p>
        </div>
      </div>
      
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          disabled 
            ? 'bg-gray-300' 
            : checked 
              ? 'bg-gradient-to-r from-pink-400 to-purple-400' 
              : 'bg-gray-200'
        } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300`}>
          <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform duration-200 ${
            checked ? 'translate-x-full border-white' : ''
          }`} />
        </div>
      </label>
    </div>
  );
};

export default SettingsApp;