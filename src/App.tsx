import { useState } from 'react';
import BootScreen from './components/BootScreen';
import Desktop from './components/Desktop';
import { SettingsProvider } from './contexts/SettingsContext';

function App() {
  const [isBooted, setIsBooted] = useState(false);

  const handleBootComplete = () => {
    setIsBooted(true);
  };

  return (
    <SettingsProvider>
      <div className="font-nunito cursor-custom">
        {!isBooted ? (
          <BootScreen onBootComplete={handleBootComplete} />
        ) : (
          <Desktop />
        )}
      </div>
    </SettingsProvider>
  );
}

export default App;