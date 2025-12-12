import React, { useState, useEffect, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface FifiState {
  hunger: number; // 0-100
  happiness: number; // 0-100
  isSleeping: boolean;
  isFollowing: boolean;
  position: Position;
  animation: 'idle' | 'walking' | 'sleeping' | 'eating' | 'playing';
  facing: 'left' | 'right';
}

interface Message {
  text: string;
  timestamp: number;
}

const Fifi: React.FC = () => {
  const [fifi, setFifi] = useState<FifiState>({
    hunger: 50,
    happiness: 70,
    isSleeping: true,
    isFollowing: false,
    position: { x: 100, y: 100 },
    animation: 'sleeping',
    facing: 'right',
  });

  const [message, setMessage] = useState<Message | null>(null);
  const [cursorPos, setCursorPos] = useState<Position>({ x: 0, y: 0 });
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showBowl, setShowBowl] = useState(true);
  const [showLitterBox, setShowLitterBox] = useState(true);
  const [toys, setToys] = useState<Position[]>([
    { x: 300, y: 400 },
    { x: 500, y: 300 },
  ]);

  const fifiRef = useRef<HTMLDivElement>(null);

  // Track cursor position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      setLastActivity(Date.now());
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Follow cursor when active
  useEffect(() => {
    if (!fifi.isFollowing || fifi.isSleeping) return;

    const interval = setInterval(() => {
      setFifi((prev) => {
        const dx = cursorPos.x - prev.position.x;
        const dy = cursorPos.y - prev.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 50) {
          return { ...prev, animation: 'idle' };
        }

        const speed = 3;
        const newX = prev.position.x + (dx / distance) * speed;
        const newY = prev.position.y + (dy / distance) * speed;

        return {
          ...prev,
          position: { x: newX, y: newY },
          animation: 'walking',
          facing: dx > 0 ? 'right' : 'left',
        };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [fifi.isFollowing, fifi.isSleeping, cursorPos]);

  // Hunger and sleep system
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;

      setFifi((prev) => {
        let newState = { ...prev };

        // Increase hunger over time
        newState.hunger = Math.min(100, prev.hunger + 0.5);

        // Sleep after 30 seconds of inactivity
        if (timeSinceActivity > 30000 && !prev.isSleeping) {
          newState.isSleeping = true;
          newState.isFollowing = false;
          newState.animation = 'sleeping';
          showMessage('zzz... 😴');
        }

        // Hungry message
        if (newState.hunger > 70 && Math.random() > 0.95) {
          showMessage('Vreau plic! 🍽️');
        }

        return newState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lastActivity]);

  // Clear old messages
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  const showMessage = (text: string) => {
    setMessage({ text, timestamp: Date.now() });
  };

  const handleFifiClick = () => {
    if (fifi.isSleeping) {
      setFifi((prev) => ({
        ...prev,
        isSleeping: false,
        isFollowing: true,
        animation: 'idle',
      }));
      showMessage('Meaww sunt Fifi mi foami! 😺');
    } else {
      setFifi((prev) => ({
        ...prev,
        isFollowing: !prev.isFollowing,
      }));
      showMessage(fifi.isFollowing ? 'Ok! 💕' : 'Hai să ne jucăm! 🎾');
    }
    setLastActivity(Date.now());
  };

  const feedFifi = () => {
    if (fifi.hunger < 20) {
      showMessage('Nu mai am foame! 😊');
      return;
    }

    setFifi((prev) => ({
      ...prev,
      hunger: Math.max(0, prev.hunger - 50),
      happiness: Math.min(100, prev.happiness + 20),
      animation: 'eating',
    }));

    showMessage('Diaa! 😻');

    setTimeout(() => {
      setFifi((prev) => ({ ...prev, animation: 'idle' }));
    }, 2000);

    setLastActivity(Date.now());
  };

  const playWithToy = (toyIndex: number) => {
    setFifi((prev) => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 10),
      animation: 'playing',
      position: toys[toyIndex],
    }));

    showMessage('Yay! 🎾');

    setTimeout(() => {
      setFifi((prev) => ({ ...prev, animation: 'idle' }));
    }, 2000);

    setLastActivity(Date.now());
  };

  return (
    <>
      {/* Fifi the Cat */}
      <div
        ref={fifiRef}
        onClick={handleFifiClick}
        style={{
          position: 'fixed',
          left: fifi.position.x,
          top: fifi.position.y,
          transform: `scaleX(${fifi.facing === 'left' ? -1 : 1})`,
          cursor: 'pointer',
          zIndex: 100,
          transition: fifi.isFollowing ? 'none' : 'all 0.3s ease',
        }}
        className="select-none"
      >
        {/* Pixelated Cat */}
        <div className="relative">
          {/* Cat sprite - using pixel art style with CSS */}
          <div
            style={{
              width: '64px',
              height: '64px',
              imageRendering: 'pixelated',
              fontSize: '48px',
              filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))',
            }}
          >
            {fifi.animation === 'sleeping' && '😴'}
            {fifi.animation === 'idle' && '🐱'}
            {fifi.animation === 'walking' && (Date.now() % 1000 > 500 ? '🐱' : '🐈')}
            {fifi.animation === 'eating' && '😸'}
            {fifi.animation === 'playing' && '😺'}
          </div>

          {/* Speech bubble */}
          {message && (
            <div
              className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg px-3 py-2 shadow-lg border-2 border-violet-300 whitespace-nowrap animate-bounce"
              style={{ zIndex: 101 }}
            >
              <div className="text-sm font-medium text-gray-800">{message.text}</div>
              {/* Speech bubble arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-violet-300"></div>
              </div>
            </div>
          )}

          {/* Status indicators */}
          <div className="absolute -bottom-8 left-0 flex space-x-1">
            {/* Hunger bar */}
            <div className="w-16 h-2 bg-gray-300 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  fifi.hunger > 70 ? 'bg-red-400' : fifi.hunger > 40 ? 'bg-yellow-400' : 'bg-green-400'
                }`}
                style={{ width: `${fifi.hunger}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Food Bowl */}
      {showBowl && (
        <div
          onClick={feedFifi}
          style={{
            position: 'fixed',
            left: '50px',
            bottom: '100px',
            cursor: 'pointer',
            zIndex: 50,
          }}
          className="hover:scale-110 transition-transform"
          title="Dă-i plic lui Fifi"
        >
          <div className="text-4xl">🍽️</div>
          <div className="text-xs text-center text-violet-800 font-medium mt-1">Plic</div>
        </div>
      )}

      {/* Litter Box */}
      {showLitterBox && (
        <div
          style={{
            position: 'fixed',
            right: '50px',
            bottom: '100px',
            zIndex: 50,
          }}
          title="Litieră"
        >
          <div className="text-4xl">📦</div>
          <div className="text-xs text-center text-violet-800 font-medium mt-1">Litieră</div>
        </div>
      )}

      {/* Toys */}
      {toys.map((toy, index) => (
        <div
          key={index}
          onClick={() => playWithToy(index)}
          style={{
            position: 'fixed',
            left: toy.x,
            top: toy.y,
            cursor: 'pointer',
            zIndex: 50,
          }}
          className="hover:scale-110 transition-transform animate-bounce"
          title="Joacă-te cu Fifi"
        >
          <div className="text-3xl">{index === 0 ? '🎾' : '🧶'}</div>
        </div>
      ))}

      {/* Fifi Info Panel (bottom right) */}
      <div
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          zIndex: 50,
        }}
        className="bg-violet-50/95 backdrop-blur-md rounded-lg shadow-lg border-2 border-violet-200 p-3"
      >
        <div className="text-sm font-bold text-violet-800 mb-2 flex items-center space-x-2">
          <span>🐱</span>
          <span>Fifi</span>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between space-x-2">
            <span className="text-violet-700">Foame:</span>
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  fifi.hunger > 70 ? 'bg-red-400' : fifi.hunger > 40 ? 'bg-yellow-400' : 'bg-green-400'
                }`}
                style={{ width: `${fifi.hunger}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center justify-between space-x-2">
            <span className="text-violet-700">Fericire:</span>
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-violet-400" style={{ width: `${fifi.happiness}%` }}></div>
            </div>
          </div>
          <div className="text-violet-600 text-center mt-2">
            {fifi.isSleeping && '😴 Doarme'}
            {!fifi.isSleeping && fifi.isFollowing && '👣 Te urmează'}
            {!fifi.isSleeping && !fifi.isFollowing && '🎮 Joacă-te'}
          </div>
        </div>
      </div>
    </>
  );
};

export default Fifi;
