import React, { useState, useEffect, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

type FifiAction = 'sleeping' | 'sitting' | 'walking' | 'eating' | 'dragging' | 'playing';

const Fifi: React.FC = () => {
  const [position, setPosition] = useState<Position>({ x: 200, y: 200 });
  const [action, setAction] = useState<FifiAction>('sleeping');
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [message, setMessage] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [hunger, setHunger] = useState(50);
  const [walkTarget, setWalkTarget] = useState<Position | null>(null);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [frame, setFrame] = useState(0);

  const fifiRef = useRef<HTMLDivElement>(null);

  // Animation frames
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 4);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Hunger system
  useEffect(() => {
    const interval = setInterval(() => {
      setHunger((h) => Math.min(100, h + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto sleep after inactivity
  useEffect(() => {
    const checkSleep = setInterval(() => {
      const now = Date.now();
      if (now - lastInteraction > 30000 && action !== 'sleeping') {
        setAction('sleeping');
        setMessage('');
      }
    }, 1000);
    return () => clearInterval(checkSleep);
  }, [lastInteraction, action]);

  // Random wandering
  useEffect(() => {
    if (action === 'sleeping' || isDragging || walkTarget) return;

    const wander = setInterval(() => {
      if (Math.random() > 0.7) {
        const newX = Math.max(50, Math.min(window.innerWidth - 150, Math.random() * window.innerWidth));
        const newY = Math.max(50, Math.min(window.innerHeight - 200, Math.random() * window.innerHeight));
        setWalkTarget({ x: newX, y: newY });
        setAction('walking');
      }
    }, 3000);

    return () => clearInterval(wander);
  }, [action, isDragging, walkTarget]);

  // Walking to target
  useEffect(() => {
    if (!walkTarget || action !== 'walking') return;

    const walk = setInterval(() => {
      setPosition((pos) => {
        const dx = walkTarget.x - pos.x;
        const dy = walkTarget.y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
          setWalkTarget(null);
          setAction('sitting');
          return pos;
        }

        const speed = 2;
        setDirection(dx > 0 ? 'right' : 'left');

        return {
          x: pos.x + (dx / distance) * speed,
          y: pos.y + (dy / distance) * speed,
        };
      });
    }, 30);

    return () => clearInterval(walk);
  }, [walkTarget, action]);

  // Clear message after timeout
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    setLastInteraction(Date.now());
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLastInteraction(Date.now());

    if (action === 'sleeping') {
      setAction('sitting');
      setMessage('Meaww sunt Fifi mi foami! 😺');
    } else if (hunger > 70) {
      setMessage('Vreau plic! 🍽️');
    } else {
      setMessage('Mrrr~ 💕');
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
      setAction('dragging');
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setAction('sitting');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Feed function (can be called from external items)
  const feed = () => {
    if (hunger < 20) {
      setMessage('Nu mai am foame! 😊');
      return;
    }
    setHunger(Math.max(0, hunger - 50));
    setAction('eating');
    setMessage('Diaa! 😻');
    setLastInteraction(Date.now());

    setTimeout(() => setAction('sitting'), 2000);
  };

  // Expose feed function globally for food bowl
  useEffect(() => {
    (window as any).feedFifi = feed;
    return () => {
      delete (window as any).feedFifi;
    };
  }, [hunger]);

  // Pixel art sprite (British Shorthair cat)
  const renderSprite = () => {
    const scale = 3;
    const pixelSize = 2 * scale;

    // British Shorthair color palette
    const gray = '#95A3B3'; // Blue-gray
    const darkGray = '#6B7785';
    const lightGray = '#C5CDD6';
    const pink = '#FFB6C6';
    const white = '#FFFFFF';
    const black = '#2C3E50';
    const yellow = '#FFD93D';

    // Sprite patterns for different actions
    const sprites: Record<FifiAction, number[][]> = {
      sleeping: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0],
        [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
        [0, 1, 2, 2, 8, 8, 2, 2, 2, 2, 1, 0],
        [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
        [0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      ],
      sitting: [
        [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 2, 1, 0, 0, 1, 2, 1, 0, 0],
        [0, 0, 0, 1, 2, 1, 1, 2, 1, 0, 0, 0],
        [0, 0, 0, 1, 2, 2, 2, 2, 1, 0, 0, 0],
        [0, 0, 1, 2, 7, 6, 6, 7, 2, 1, 0, 0],
        [0, 0, 1, 2, 2, 4, 4, 2, 2, 1, 0, 0],
        [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
        [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
        [0, 0, 1, 1, 2, 2, 2, 2, 1, 1, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
      ],
      walking: frame % 2 === 0 ? [
        [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 2, 1, 0, 0, 1, 2, 1, 0, 0],
        [0, 0, 0, 1, 2, 1, 1, 2, 1, 0, 0, 0],
        [0, 0, 0, 1, 2, 2, 2, 2, 1, 0, 0, 0],
        [0, 0, 1, 2, 7, 6, 6, 7, 2, 1, 0, 0],
        [0, 0, 1, 2, 2, 4, 4, 2, 2, 1, 0, 0],
        [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
        [0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0],
        [1, 1, 0, 1, 2, 2, 2, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
      ] : [
        [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 2, 1, 0, 0, 1, 2, 1, 0, 0],
        [0, 0, 0, 1, 2, 1, 1, 2, 1, 0, 0, 0],
        [0, 0, 0, 1, 2, 2, 2, 2, 1, 0, 0, 0],
        [0, 0, 1, 2, 7, 6, 6, 7, 2, 1, 0, 0],
        [0, 0, 1, 2, 2, 4, 4, 2, 2, 1, 0, 0],
        [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
        [0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0],
        [0, 0, 0, 1, 1, 2, 2, 1, 1, 1, 1, 0],
        [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
      ],
      eating: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 2, 1, 0, 0, 1, 2, 1, 0, 0],
        [0, 0, 0, 1, 2, 1, 1, 2, 1, 0, 0, 0],
        [0, 0, 0, 1, 2, 2, 2, 2, 1, 0, 0, 0],
        [0, 0, 1, 2, 7, 6, 6, 7, 2, 1, 0, 0],
        [0, 0, 1, 2, 2, 5, 5, 2, 2, 1, 0, 0],
        [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
        [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
      ],
      dragging: [
        [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 2, 1, 0, 0, 1, 2, 1, 0, 0],
        [0, 0, 0, 1, 2, 1, 1, 2, 1, 0, 0, 0],
        [0, 0, 0, 1, 2, 2, 2, 2, 1, 0, 0, 0],
        [0, 0, 1, 2, 6, 6, 6, 6, 2, 1, 0, 0],
        [0, 0, 1, 2, 2, 4, 4, 2, 2, 1, 0, 0],
        [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
        [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
      ],
      playing: [
        [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 2, 1, 0, 0, 1, 2, 1, 0, 0],
        [0, 0, 0, 1, 2, 1, 1, 2, 1, 0, 0, 0],
        [0, 0, 0, 1, 2, 2, 2, 2, 1, 0, 0, 0],
        [0, 0, 1, 2, 7, 6, 6, 7, 2, 1, 0, 0],
        [0, 0, 1, 2, 2, 9, 9, 2, 2, 1, 0, 0],
        [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
        [0, 1, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0],
      ],
    };

    const colorMap: Record<number, string> = {
      0: 'transparent',
      1: darkGray,
      2: gray,
      3: lightGray,
      4: pink,
      5: pink, // Open mouth
      6: black,
      7: yellow,
      8: black, // Closed eyes
      9: pink, // Happy mouth
    };

    const sprite = sprites[action];

    return (
      <div style={{ transform: `scaleX(${direction === 'left' ? -1 : 1})` }}>
        {sprite.map((row, y) => (
          <div key={y} style={{ display: 'flex', height: pixelSize }}>
            {row.map((pixel, x) => (
              <div
                key={x}
                style={{
                  width: pixelSize,
                  height: pixelSize,
                  backgroundColor: colorMap[pixel],
                  imageRendering: 'pixelated',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div
        ref={fifiRef}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: 9999,
          userSelect: 'none',
        }}
      >
        {renderSprite()}

        {/* Speech bubble */}
        {message && (
          <div
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white rounded-lg px-3 py-2 shadow-lg border-2 border-violet-300 whitespace-nowrap"
            style={{ minWidth: '120px', textAlign: 'center' }}
          >
            <div className="text-sm font-medium text-gray-800">{message}</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white"></div>
            </div>
          </div>
        )}

        {/* Hunger indicator */}
        {hunger > 70 && action !== 'sleeping' && (
          <div className="absolute -top-8 left-0 text-2xl animate-bounce">🍽️</div>
        )}
      </div>

      {/* Food bowl */}
      <div
        onClick={() => (window as any).feedFifi?.()}
        style={{
          position: 'fixed',
          left: '80px',
          bottom: '120px',
          cursor: 'pointer',
          zIndex: 100,
          fontSize: '40px',
        }}
        className="hover:scale-110 transition-transform"
        title="Dă-i plic lui Fifi"
      >
        🍽️
      </div>

      {/* Litter box */}
      <div
        style={{
          position: 'fixed',
          right: '80px',
          bottom: '120px',
          zIndex: 100,
          fontSize: '40px',
        }}
        title="Litieră"
      >
        📦
      </div>

      {/* Toys */}
      <div
        onClick={() => {
          setWalkTarget({ x: 300, y: window.innerHeight - 200 });
          setAction('playing');
          setMessage('Yay! 🎾');
          setLastInteraction(Date.now());
        }}
        style={{
          position: 'fixed',
          left: '300px',
          bottom: '150px',
          cursor: 'pointer',
          zIndex: 100,
          fontSize: '35px',
        }}
        className="hover:scale-110 transition-transform"
      >
        🎾
      </div>
    </>
  );
};

export default Fifi;
