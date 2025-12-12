import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

type FifiAction = 'sleeping' | 'sitting' | 'walking' | 'eating' | 'dragging' | 'playing' | 'stealing_cursor';

const Fifi: React.FC = () => {
  const [position, setPosition] = useState<Position>({ x: 300, y: 300 });
  const [action, setAction] = useState<FifiAction>('sleeping');
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [message, setMessage] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [hunger, setHunger] = useState(50);
  const [walkTarget, setWalkTarget] = useState<Position | null>(null);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [frame, setFrame] = useState(0);
  const [isStealingCursor, setIsStealingCursor] = useState(false);
  const [stolenCursorPos, setStolenCursorPos] = useState<Position | null>(null);
  const [lastFed, setLastFed] = useState(0);
  const [tailWag, setTailWag] = useState(0);

  const fifiRef = useRef<HTMLDivElement>(null);
  const stealingRef = useRef<boolean>(false);

  // Animation frames - faster for more lively feel
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 4);
      setTailWag((t) => (t + 1) % 6);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Hunger system - increases over time
  useEffect(() => {
    const interval = setInterval(() => {
      setHunger((h) => Math.min(100, h + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auto sleep after inactivity
  useEffect(() => {
    const checkSleep = setInterval(() => {
      const now = Date.now();
      if (now - lastInteraction > 30000 && action !== 'sleeping' && !isStealingCursor) {
        setAction('sleeping');
        setMessage('zzz... 😴');
      }
    }, 1000);
    return () => clearInterval(checkSleep);
  }, [lastInteraction, action, isStealingCursor]);

  // Cursor stealing behavior - Desktop Goose style!
  useEffect(() => {
    if (action === 'sleeping' || action === 'playing' || action === 'eating') return;
    if (stealingRef.current) return;
    if (Date.now() - lastFed < 30000) return; // 30 second cooldown after feeding

    const stealChance = setInterval(() => {
      // Higher chance when very hungry
      const stealProbability = hunger > 90 ? 0.25 : hunger > 80 ? 0.12 : hunger > 70 ? 0.05 : 0;

      if (hunger > 70 && Math.random() < stealProbability && !stealingRef.current) {
        stealingRef.current = true;
        setIsStealingCursor(true);
        setAction('stealing_cursor');
        setMessage('mu he he he 😼');
        setLastInteraction(Date.now());

        // Hide actual cursor globally
        document.body.style.cursor = 'none';
        document.documentElement.style.cursor = 'none';

        // Track cursor and make Fifi run away
        const handleMouseMove = (e: MouseEvent) => {
          setStolenCursorPos({ x: e.clientX, y: e.clientY });

          setPosition((prevPos) => {
            const dx = e.clientX - prevPos.x - 40;
            const dy = e.clientY - prevPos.y - 30;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 200 && distance > 0) {
              const escapeSpeed = 12;
              const newX = Math.max(100, Math.min(window.innerWidth - 200, prevPos.x - (dx / distance) * escapeSpeed));
              const newY = Math.max(100, Math.min(window.innerHeight - 250, prevPos.y - (dy / distance) * escapeSpeed));
              setDirection(dx > 0 ? 'left' : 'right');
              return { x: newX, y: newY };
            }
            return prevPos;
          });
        };

        document.addEventListener('mousemove', handleMouseMove);

        // Return cursor after 6 seconds
        setTimeout(() => {
          stealingRef.current = false;
          setIsStealingCursor(false);
          setAction('sitting');
          document.body.style.cursor = 'default';
          document.documentElement.style.cursor = 'default';
          setMessage('bon bon... 😸');
          setStolenCursorPos(null);
          document.removeEventListener('mousemove', handleMouseMove);
        }, 6000);
      }
    }, 2000);

    return () => clearInterval(stealChance);
  }, [hunger, action, lastFed]);

  // Random wandering
  useEffect(() => {
    if (action === 'sleeping' || isDragging || walkTarget || isStealingCursor) return;

    const wander = setInterval(() => {
      if (Math.random() > 0.6) {
        const newX = Math.max(100, Math.min(window.innerWidth - 200, Math.random() * (window.innerWidth - 300) + 100));
        const newY = Math.max(100, Math.min(window.innerHeight - 300, Math.random() * (window.innerHeight - 400) + 100));
        setWalkTarget({ x: newX, y: newY });
        setAction('walking');
      }
    }, 4000);

    return () => clearInterval(wander);
  }, [action, isDragging, walkTarget, isStealingCursor]);

  // Walking animation
  useEffect(() => {
    if (!walkTarget || action !== 'walking') return;

    const walk = setInterval(() => {
      setPosition((pos) => {
        const dx = walkTarget.x - pos.x;
        const dy = walkTarget.y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
          setWalkTarget(null);
          setAction('sitting');
          return pos;
        }

        const speed = 3;
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
    const timer = setTimeout(() => setMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    setLastInteraction(Date.now());
    setAction('dragging');
    setMessage('Miau~! 😺');
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLastInteraction(Date.now());

    if (action === 'sleeping') {
      setAction('sitting');
      setMessage('Meaww sunt Fifi mi foami! 😺');
    } else if (hunger > 70) {
      setMessage('Vreau plic! 🍽️');
    } else if (hunger > 40) {
      setMessage('Mrrr~ 💕');
    } else {
      setMessage('Sunt fericită! 😻');
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: Math.max(50, Math.min(window.innerWidth - 150, e.clientX - dragOffset.x)),
        y: Math.max(50, Math.min(window.innerHeight - 200, e.clientY - dragOffset.y)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setAction('sitting');
      setMessage('');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Feed function
  const feed = useCallback(() => {
    if (hunger < 20) {
      setMessage('Nu mai am foame! 😊');
      return;
    }
    setHunger(Math.max(0, hunger - 50));
    setAction('eating');
    setMessage('Diaa! Mulțumesc! 😻');
    setLastInteraction(Date.now());
    setLastFed(Date.now());

    if (isStealingCursor) {
      stealingRef.current = false;
      setIsStealingCursor(false);
      document.body.style.cursor = 'default';
      document.documentElement.style.cursor = 'default';
      setStolenCursorPos(null);
    }

    setTimeout(() => {
      setAction('sitting');
      setMessage('Mrrr~ 💕');
    }, 2500);
  }, [hunger, isStealingCursor]);

  // Expose feed function globally
  useEffect(() => {
    (window as any).feedFifi = feed;
    return () => {
      delete (window as any).feedFifi;
    };
  }, [feed]);

  // Pixel art sprite matching the reference - British Shorthair with collar
  const renderSprite = () => {
    const scale = 4;
    const pixelSize = scale;

    // Color palette matching reference
    const colors = {
      transparent: 'transparent',
      black: '#1a1a2e',      // Dark outline
      gray: '#7a8b99',       // Main body gray
      darkGray: '#5a6b79',   // Darker gray for shading
      lightGray: '#9aabb9',  // Light gray highlights
      yellow: '#ffd700',     // Eyes and bell
      pink: '#ffb6c1',       // Nose/inner ear
      blue: '#4a9eff',       // Collar
      white: '#ffffff',      // Eye highlights
    };

    // Sprite definitions - matching reference image style
    const sprites: Record<FifiAction, string[][]> = {
      sleeping: [
        ['T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','T','B','B','B','B','T','T','T','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','G','B','T','T','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','D','D','G','G','B','B','B','B','B','B','B','B','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','G','G','G','G','G','G','G','B','T','T','T'],
        ['T','T','T','B','G','G','G','G','G','G','G','G','G','G','G','G','B','T','T','T'],
        ['T','T','T','T','B','B','B','B','B','B','B','B','B','B','B','B','T','T','T','T'],
        ['T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T'],
      ],
      sitting: [
        ['T','T','B','B','T','T','T','T','B','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','B','G','G','B','T','T','B','G','G','B','T','T','T','T','T','T','T','T','T'],
        ['T','B','G','P','G','B','B','G','P','G','B','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','Y','B','B','Y','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','P','P','G','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','T','B','C','C','C','C','B','T','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','T','B','G','O','G','G','B','T','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','B','B','B','B','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','G','G','G','G','B','B','B','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','G','G','G','G','G','G','G','B','B','T','T'],
        ['T','T','T','B','B','G','G','G','G','G','G','G','G','G','G','B','G','B','T','T'],
        ['T','T','T','T','T','B','B','B','B','B','B','B','B','B','B','B','B','T','T','T'],
      ],
      walking: frame % 2 === 0 ? [
        ['T','T','B','B','T','T','T','T','B','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','B','G','G','B','T','T','B','G','G','B','T','T','T','T','T','T','T','T','T'],
        ['T','B','G','P','G','B','B','G','P','G','B','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','Y','B','B','Y','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','P','P','G','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','T','B','C','C','C','C','B','T','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','T','B','G','O','G','G','B','T','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','B','B','B','B','T','T','T','B','B','T','T'],
        ['T','T','B','G','G','G','G','G','G','G','G','G','G','B','B','B','G','G','B','T'],
        ['T','T','T','B','B','G','G','G','G','G','G','G','G','G','G','G','G','B','T','T'],
        ['T','T','B','G','B','B','B','T','T','B','B','B','T','B','B','G','B','T','T','T'],
        ['T','T','B','B','T','T','T','T','T','T','T','B','B','T','T','B','B','T','T','T'],
      ] : [
        ['T','T','B','B','T','T','T','T','B','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','B','G','G','B','T','T','B','G','G','B','T','T','T','T','T','T','T','T','T'],
        ['T','B','G','P','G','B','B','G','P','G','B','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','Y','B','B','Y','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','P','P','G','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','T','B','C','C','C','C','B','T','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','T','B','G','O','G','G','B','T','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','B','B','B','B','T','T','B','B','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','G','G','G','G','B','B','G','G','B','T','T'],
        ['T','T','T','B','B','G','G','G','G','G','G','G','G','G','G','G','B','T','T','T'],
        ['T','T','T','B','G','B','B','T','B','B','T','T','B','B','G','B','T','T','T','T'],
        ['T','T','T','B','B','T','T','T','T','B','B','T','T','B','B','T','T','T','T','T'],
      ],
      eating: [
        ['T','T','B','B','T','T','T','T','B','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','B','G','G','B','T','T','B','G','G','B','T','T','T','T','T','T','T','T','T'],
        ['T','B','G','P','G','B','B','G','P','G','B','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','B','B','B','B','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','P','P','G','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','T','B','C','C','C','C','B','T','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','T','B','G','O','G','G','B','T','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','B','B','B','B','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','G','G','G','G','B','B','B','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','G','G','G','G','G','G','G','B','B','T','T'],
        ['T','T','T','B','B','G','G','G','G','G','G','G','G','G','G','B','G','B','T','T'],
        ['T','T','T','T','T','B','B','B','B','B','B','B','B','B','B','B','B','T','T','T'],
      ],
      dragging: [
        ['T','T','B','B','T','T','T','T','B','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','B','G','G','B','T','T','B','G','G','B','T','T','T','T','T','T','T','T','T'],
        ['T','B','G','P','G','B','B','G','P','G','B','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','Y','Y','Y','Y','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','T','B','C','C','C','C','B','T','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','T','B','G','O','G','G','B','T','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','G','B','T','T','T','T','T','T','T','T','T'],
        ['T','T','T','B','B','B','B','B','B','B','T','T','T','T','T','T','T','T','T','T'],
      ],
      playing: [
        ['T','T','B','B','T','T','T','T','B','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','B','G','G','B','T','T','B','G','G','B','T','T','T','T','T','T','T','T','T'],
        ['T','B','G','P','G','B','B','G','P','G','B','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','W','Y','Y','W','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','W','W','G','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','T','B','C','C','C','C','B','T','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','T','B','G','O','G','G','B','T','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','B','B','B','B','T','T','T','T','B','B','T'],
        ['T','T','B','G','G','G','G','G','G','G','G','G','G','B','B','B','B','G','B','T'],
        ['T','T','T','B','B','G','G','G','G','G','G','G','G','G','G','G','B','B','T','T'],
        ['T','T','B','G','B','B','T','T','T','B','B','B','T','T','B','B','T','T','T','T'],
        ['T','T','B','B','T','T','T','T','T','T','T','B','B','T','T','T','T','T','T','T'],
      ],
      stealing_cursor: frame % 2 === 0 ? [
        ['T','T','B','B','T','T','T','T','B','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','B','G','G','B','T','T','B','G','G','B','T','T','T','T','T','T','T','T','T'],
        ['T','B','G','P','G','B','B','G','P','G','B','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','B','Y','Y','B','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','W','G','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','T','B','C','C','C','C','B','T','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','T','B','G','O','G','G','B','T','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','B','B','B','B','T','T','T','B','B','T','T'],
        ['T','T','B','G','G','G','G','G','G','G','G','G','G','B','B','B','G','G','B','T'],
        ['T','T','T','B','B','G','G','G','G','G','G','G','G','G','G','G','G','B','T','T'],
        ['T','T','B','G','B','B','B','T','T','B','B','B','T','B','B','G','B','T','T','T'],
        ['T','T','B','B','T','T','T','T','T','T','T','B','B','T','T','B','B','T','T','T'],
      ] : [
        ['T','T','B','B','T','T','T','T','B','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','B','G','G','B','T','T','B','G','G','B','T','T','T','T','T','T','T','T','T'],
        ['T','B','G','P','G','B','B','G','P','G','B','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','B','Y','Y','B','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','W','G','G','G','B','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','T','B','C','C','C','C','B','T','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','T','B','G','O','G','G','B','T','T','T','T','T','T','T','T','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','B','B','B','B','T','T','B','B','T','T','T'],
        ['T','T','B','G','G','G','G','G','G','G','G','G','G','B','B','G','G','B','T','T'],
        ['T','T','T','B','B','G','G','G','G','G','G','G','G','G','G','G','B','T','T','T'],
        ['T','T','T','B','G','B','B','T','B','B','T','T','B','B','G','B','T','T','T','T'],
        ['T','T','T','B','B','T','T','T','T','B','B','T','T','B','B','T','T','T','T','T'],
      ],
    };

    const colorMap: Record<string, string> = {
      'T': colors.transparent,
      'B': colors.black,
      'G': colors.gray,
      'D': colors.darkGray,
      'L': colors.lightGray,
      'Y': colors.yellow,
      'P': colors.pink,
      'C': colors.blue,
      'O': colors.yellow, // Bell
      'W': colors.white,
    };

    const sprite = sprites[action] || sprites.sitting;

    return (
      <div
        style={{
          transform: `scaleX(${direction === 'left' ? -1 : 1})`,
          imageRendering: 'pixelated',
        }}
      >
        {sprite.map((row, y) => (
          <div key={y} style={{ display: 'flex', height: pixelSize }}>
            {row.map((pixel, x) => (
              <div
                key={x}
                style={{
                  width: pixelSize,
                  height: pixelSize,
                  backgroundColor: colorMap[pixel] || colors.transparent,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Pixelated food bowl
  const renderPixelBowl = () => {
    const scale = 3;
    const bowl = [
      ['T','T','B','B','B','B','B','B','T','T'],
      ['T','B','O','O','O','O','O','O','B','T'],
      ['B','O','O','O','O','O','O','O','O','B'],
      ['B','G','G','G','G','G','G','G','G','B'],
      ['T','B','G','G','G','G','G','G','B','T'],
      ['T','T','B','B','B','B','B','B','T','T'],
    ];
    const colors: Record<string, string> = {
      'T': 'transparent',
      'B': '#1a1a2e',
      'G': '#7a8b99',
      'O': '#8B4513',
    };

    return (
      <div style={{ imageRendering: 'pixelated' }}>
        {bowl.map((row, y) => (
          <div key={y} style={{ display: 'flex', height: scale }}>
            {row.map((pixel, x) => (
              <div
                key={x}
                style={{
                  width: scale,
                  height: scale,
                  backgroundColor: colors[pixel],
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Pixelated toy ball
  const renderPixelBall = () => {
    const scale = 3;
    const ball = [
      ['T','R','R','R','T'],
      ['R','R','W','R','R'],
      ['R','R','R','R','R'],
      ['R','R','R','R','R'],
      ['T','R','R','R','T'],
    ];
    const colors: Record<string, string> = {
      'T': 'transparent',
      'R': '#ff6b6b',
      'W': '#ffffff',
    };

    return (
      <div style={{ imageRendering: 'pixelated' }}>
        {ball.map((row, y) => (
          <div key={y} style={{ display: 'flex', height: scale }}>
            {row.map((pixel, x) => (
              <div
                key={x}
                style={{
                  width: scale,
                  height: scale,
                  backgroundColor: colors[pixel],
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Pixelated cursor paw
  const renderPixelPaw = () => {
    const scale = 2;
    const paw = [
      ['T','T','B','T','B','T','T'],
      ['T','B','P','B','P','B','T'],
      ['T','T','B','T','B','T','T'],
      ['T','B','P','P','P','B','T'],
      ['B','P','P','P','P','P','B'],
      ['B','P','P','P','P','P','B'],
      ['T','B','B','B','B','B','T'],
    ];
    const colors: Record<string, string> = {
      'T': 'transparent',
      'B': '#1a1a2e',
      'P': '#ffb6c1',
    };

    return (
      <div style={{ imageRendering: 'pixelated' }}>
        {paw.map((row, y) => (
          <div key={y} style={{ display: 'flex', height: scale }}>
            {row.map((pixel, x) => (
              <div
                key={x}
                style={{
                  width: scale,
                  height: scale,
                  backgroundColor: colors[pixel],
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
      {/* Fifi */}
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
          transition: isDragging ? 'none' : 'transform 0.1s ease',
        }}
      >
        {renderSprite()}

        {/* Speech bubble */}
        {message && (
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '6px 12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              border: '2px solid #7c3aed',
              whiteSpace: 'nowrap',
              minWidth: '100px',
              textAlign: 'center',
              zIndex: 10000,
              fontFamily: "'Press Start 2P', monospace, sans-serif",
              fontSize: '10px',
            }}
          >
            <div style={{ color: '#374151', fontWeight: 'bold' }}>{message}</div>
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid white',
              }}
            />
          </div>
        )}

        {/* Hunger indicator */}
        {hunger > 70 && action !== 'sleeping' && action !== 'eating' && (
          <div
            style={{
              position: 'absolute',
              top: '-25px',
              left: '0',
              fontSize: '20px',
              animation: 'bounce 0.5s ease-in-out infinite',
            }}
          >
            💭
          </div>
        )}
      </div>

      {/* Right bottom corner items container */}
      <div
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px',
          zIndex: 100,
        }}
      >
        {/* Pixelated Food bowl */}
        <div
          onClick={() => (window as any).feedFifi?.()}
          style={{
            cursor: 'pointer',
            transform: 'scale(1.5)',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.8)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.5)'}
          title="Dă-i plic lui Fifi"
        >
          {renderPixelBowl()}
        </div>

        {/* Pixelated Toy ball */}
        <div
          onClick={() => {
            const targetX = window.innerWidth - 150;
            const targetY = window.innerHeight - 250;
            setWalkTarget({ x: targetX, y: targetY });
            setAction('playing');
            setMessage('Yay! Minge! 🎾');
            setLastInteraction(Date.now());
          }}
          style={{
            cursor: 'pointer',
            transform: 'scale(1.5)',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.8)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.5)'}
          title="Joacă-te cu Fifi"
        >
          {renderPixelBall()}
        </div>
      </div>

      {/* Stolen cursor paw - pixelated */}
      {isStealingCursor && stolenCursorPos && (
        <div
          style={{
            position: 'fixed',
            left: stolenCursorPos.x - 7,
            top: stolenCursorPos.y - 7,
            zIndex: 99999,
            pointerEvents: 'none',
            transform: `rotate(${Math.sin(frame * 0.5) * 10}deg)`,
          }}
        >
          {renderPixelPaw()}
        </div>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
};

export default Fifi;
