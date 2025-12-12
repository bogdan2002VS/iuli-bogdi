import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

type FifiAction = 'sleeping' | 'sitting' | 'walking' | 'eating' | 'dragging' | 'playing' | 'stealing_cursor';

// Desktop Goose style cat component
const Fifi: React.FC = () => {
  const [position, setPosition] = useState<Position>({ x: 400, y: 350 });
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

  const stealingRef = useRef<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 60);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Hunger system
  useEffect(() => {
    const interval = setInterval(() => {
      setHunger((h) => Math.min(100, h + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto sleep
  useEffect(() => {
    const checkSleep = setInterval(() => {
      if (Date.now() - lastInteraction > 20000 && action !== 'sleeping' && !isStealingCursor) {
        setAction('sleeping');
        setMessage('');
      }
    }, 1000);
    return () => clearInterval(checkSleep);
  }, [lastInteraction, action, isStealingCursor]);

  // Cursor stealing - Desktop Goose style
  useEffect(() => {
    if (action === 'sleeping' || action === 'playing' || action === 'eating') return;
    if (stealingRef.current) return;
    if (Date.now() - lastFed < 15000) return;

    const stealChance = setInterval(() => {
      const prob = hunger > 90 ? 0.35 : hunger > 80 ? 0.2 : hunger > 70 ? 0.1 : 0;

      if (hunger > 70 && Math.random() < prob && !stealingRef.current) {
        stealingRef.current = true;
        setIsStealingCursor(true);
        setAction('stealing_cursor');
        setMessage('mu he he he 😼');
        setLastInteraction(Date.now());

        document.body.style.cursor = 'none';
        document.documentElement.style.cursor = 'none';

        // Add cursor none to all elements
        const style = document.createElement('style');
        style.id = 'fifi-cursor-hide';
        style.textContent = '* { cursor: none !important; }';
        document.head.appendChild(style);

        const handleMouseMove = (e: MouseEvent) => {
          setStolenCursorPos({ x: e.clientX, y: e.clientY });
          setPosition((prev) => {
            const dx = e.clientX - prev.x - 60;
            const dy = e.clientY - prev.y - 40;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200 && dist > 0) {
              const speed = 18;
              setDirection(dx > 0 ? 'left' : 'right');
              return {
                x: Math.max(50, Math.min(window.innerWidth - 150, prev.x - (dx / dist) * speed)),
                y: Math.max(50, Math.min(window.innerHeight - 150, prev.y - (dy / dist) * speed)),
              };
            }
            return prev;
          });
        };

        document.addEventListener('mousemove', handleMouseMove);

        setTimeout(() => {
          stealingRef.current = false;
          setIsStealingCursor(false);
          setAction('sitting');
          document.body.style.cursor = 'default';
          document.documentElement.style.cursor = 'default';
          document.getElementById('fifi-cursor-hide')?.remove();
          setMessage('bon bon... 😸');
          setStolenCursorPos(null);
          document.removeEventListener('mousemove', handleMouseMove);
        }, 4500);
      }
    }, 1200);

    return () => clearInterval(stealChance);
  }, [hunger, action, lastFed]);

  // Random wandering
  useEffect(() => {
    if (action === 'sleeping' || isDragging || walkTarget || isStealingCursor) return;

    const wander = setInterval(() => {
      if (Math.random() > 0.4) {
        const newX = 100 + Math.random() * (window.innerWidth - 300);
        const newY = 100 + Math.random() * (window.innerHeight - 300);
        setWalkTarget({ x: newX, y: newY });
        setAction('walking');
      }
    }, 4000);

    return () => clearInterval(wander);
  }, [action, isDragging, walkTarget, isStealingCursor]);

  // Walking
  useEffect(() => {
    if (!walkTarget || action !== 'walking') return;

    const walk = setInterval(() => {
      setPosition((pos) => {
        const dx = walkTarget.x - pos.x;
        const dy = walkTarget.y - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 10) {
          setWalkTarget(null);
          setAction('sitting');
          return pos;
        }

        setDirection(dx > 0 ? 'right' : 'left');
        return { x: pos.x + (dx / dist) * 5, y: pos.y + (dy / dist) * 5 };
      });
    }, 20);

    return () => clearInterval(walk);
  }, [walkTarget, action]);

  // Clear message
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(t);
  }, [message]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
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

    const move = (e: MouseEvent) => {
      setPosition({
        x: Math.max(20, Math.min(window.innerWidth - 130, e.clientX - dragOffset.x)),
        y: Math.max(20, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y)),
      });
    };

    const up = () => {
      setIsDragging(false);
      setAction('sitting');
      setMessage('');
    };

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
  }, [isDragging, dragOffset]);

  // Feed
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
      document.getElementById('fifi-cursor-hide')?.remove();
      setStolenCursorPos(null);
    }

    setTimeout(() => {
      setAction('sitting');
      setMessage('Mrrr~ 💕');
    }, 1800);
  }, [hunger, isStealingCursor]);

  useEffect(() => {
    (window as any).feedFifi = feed;
    return () => { delete (window as any).feedFifi; };
  }, [feed]);

  // Draw pixel art cat on canvas - HIGH QUALITY like Desktop Goose
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = 6; // Large scale for crisp pixels

    // Colors - British Shorthair palette
    const colors = {
      outline: '#2d3436',
      body: '#8395a7',
      bodyDark: '#636e72',
      bodyLight: '#b2bec3',
      eyes: '#fdcb6e',
      eyesDark: '#f39c12',
      nose: '#fd79a8',
      collar: '#0984e3',
      bell: '#ffeaa7',
      white: '#ffffff',
    };

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Flip for direction
    ctx.save();
    if (direction === 'left') {
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
    }

    const drawPixel = (x: number, y: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    };

    const blink = frame % 40 < 3 && action !== 'sleeping';
    const walkFrame = Math.floor(frame / 8) % 2;
    const breathe = Math.sin(frame * 0.15) * 0.5;

    if (action === 'sleeping') {
      // Lying down cat - curled up
      // Body outline and fill
      const bodyPixels = [
        // Head
        [4,1],[5,1],[6,1],[7,1],
        [3,2],[4,2],[5,2],[6,2],[7,2],[8,2],
        [2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],[9,3],
        [2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],
        [2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],
        [3,6],[4,6],[5,6],[6,6],[7,6],[8,6],
        // Body extending
        [6,7],[7,7],[8,7],[9,7],[10,7],[11,7],[12,7],[13,7],[14,7],
        [5,8],[6,8],[7,8],[8,8],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[15,8],
        [5,9],[6,9],[7,9],[8,9],[9,9],[10,9],[11,9],[12,9],[13,9],[14,9],[15,9],[16,9],
        [6,10],[7,10],[8,10],[9,10],[10,10],[11,10],[12,10],[13,10],[14,10],[15,10],[16,10],
        // Tail
        [16,9],[17,9],[18,9],[17,8],[18,8],[19,7],[19,6],[18,5],
      ];

      bodyPixels.forEach(([x, y]) => drawPixel(x, y, colors.body));

      // Closed eyes (sleeping)
      drawPixel(4, 4, colors.outline);
      drawPixel(5, 4, colors.outline);
      drawPixel(7, 4, colors.outline);
      drawPixel(8, 4, colors.outline);

      // Nose
      drawPixel(5, 5, colors.nose);
      drawPixel(6, 5, colors.nose);

      // Outline
      [[3,1],[8,1],[2,2],[9,2],[1,3],[10,3],[1,4],[10,4],[1,5],[10,5],[2,6],[9,6],
       [5,7],[15,7],[4,8],[16,8],[4,9],[17,9],[5,10],[17,10],[6,11],[16,11],
       [19,8],[20,7],[20,6],[19,5]].forEach(([x,y]) => drawPixel(x, y, colors.outline));

    } else {
      // Sitting/walking cat
      const isWalking = action === 'walking' || action === 'playing' || action === 'stealing_cursor';
      const legOffset = isWalking && walkFrame === 1 ? 1 : 0;

      // Ears
      [[3,0],[4,0],[8,0],[9,0],
       [2,1],[3,1],[4,1],[5,1],[7,1],[8,1],[9,1],[10,1]].forEach(([x,y]) => drawPixel(x, y, colors.body));
      [[2,0],[5,0],[7,0],[10,0],[1,1],[6,1]].forEach(([x,y]) => drawPixel(x, y, colors.outline));
      // Inner ear pink
      drawPixel(3, 1, colors.nose);
      drawPixel(9, 1, colors.nose);

      // Head
      for (let y = 2; y <= 6; y++) {
        for (let x = 2; x <= 10; x++) {
          if (y === 2 && (x < 3 || x > 9)) continue;
          if (y === 6 && (x < 4 || x > 8)) continue;
          drawPixel(x, y, colors.body);
        }
      }

      // Head outline
      [[2,2],[10,2],[1,3],[11,3],[1,4],[11,4],[1,5],[11,5],[3,6],[9,6]].forEach(([x,y]) => drawPixel(x, y, colors.outline));

      // Eyes
      if (blink || action === 'stealing_cursor') {
        // Closed/squinted eyes
        drawPixel(4, 4, colors.outline);
        drawPixel(8, 4, colors.outline);
        if (action === 'stealing_cursor') {
          drawPixel(5, 4, colors.eyes);
          drawPixel(7, 4, colors.eyes);
        }
      } else {
        // Open eyes
        drawPixel(4, 3, colors.eyes);
        drawPixel(4, 4, colors.eyes);
        drawPixel(5, 3, colors.eyesDark);
        drawPixel(5, 4, colors.eyesDark);
        drawPixel(8, 3, colors.eyes);
        drawPixel(8, 4, colors.eyes);
        drawPixel(7, 3, colors.eyesDark);
        drawPixel(7, 4, colors.eyesDark);
        // Highlights
        drawPixel(4, 3, colors.white);
        drawPixel(8, 3, colors.white);
      }

      // Nose
      drawPixel(6, 5, colors.nose);

      // Mouth/smile for stealing
      if (action === 'stealing_cursor') {
        drawPixel(7, 5, colors.white);
      }

      // Collar
      for (let x = 4; x <= 8; x++) drawPixel(x, 7, colors.collar);
      drawPixel(6, 8, colors.bell);

      // Body
      for (let y = 8; y <= 13; y++) {
        const width = y < 10 ? 6 : y < 12 ? 8 : 10;
        const startX = 6 - Math.floor(width / 2);
        for (let x = startX; x < startX + width; x++) {
          drawPixel(x, y + (y > 10 ? breathe : 0), colors.body);
        }
      }

      // Legs
      if (isWalking) {
        // Walking legs - animated
        drawPixel(3 + legOffset, 13, colors.body);
        drawPixel(3 + legOffset, 14, colors.body);
        drawPixel(4 + legOffset, 13, colors.body);
        drawPixel(4 + legOffset, 14, colors.outline);

        drawPixel(8 - legOffset, 13, colors.body);
        drawPixel(8 - legOffset, 14, colors.body);
        drawPixel(9 - legOffset, 13, colors.body);
        drawPixel(9 - legOffset, 14, colors.outline);
      } else {
        // Sitting legs
        [[3,13],[4,13],[3,14],[4,14],[8,13],[9,13],[8,14],[9,14]].forEach(([x,y]) =>
          drawPixel(x, y, colors.body));
        [[3,15],[4,15],[8,15],[9,15]].forEach(([x,y]) => drawPixel(x, y, colors.outline));
      }

      // Tail
      const tailWave = Math.sin(frame * 0.2) * 2;
      [[11,10],[12,9],[13,8 + tailWave],[14,7 + tailWave],[15,6 + tailWave]].forEach(([x,y]) =>
        drawPixel(x, y, colors.body));
      [[11,11],[12,10],[13,9 + tailWave],[14,8 + tailWave],[15,7 + tailWave],[16,6 + tailWave]].forEach(([x,y]) =>
        drawPixel(x, y, colors.outline));
    }

    ctx.restore();
  }, [frame, action, direction]);

  return (
    <>
      {/* Fifi */}
      <div
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: 9999,
          userSelect: 'none',
          filter: isDragging ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
        }}
      >
        <canvas
          ref={canvasRef}
          width={130}
          height={100}
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Speech bubble */}
        {message && (
          <div style={{
            position: 'absolute',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '10px 16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '3px solid #8b5cf6',
            whiteSpace: 'nowrap',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#1f2937',
            zIndex: 10001,
          }}>
            {message}
            <div style={{
              position: 'absolute',
              bottom: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '12px solid white',
            }} />
          </div>
        )}

        {/* Hunger thought bubble */}
        {hunger > 70 && action !== 'sleeping' && action !== 'eating' && (
          <div style={{
            position: 'absolute',
            top: '-25px',
            left: '10px',
            fontSize: '26px',
            animation: 'fifi-bounce 0.5s ease-in-out infinite',
          }}>
            💭
          </div>
        )}
      </div>

      {/* Food & Toys - Bottom Right */}
      <div style={{
        position: 'fixed',
        right: '30px',
        bottom: '90px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        zIndex: 100,
      }}>
        {/* Food Bowl */}
        <div
          onClick={() => (window as any).feedFifi?.()}
          style={{
            width: '50px',
            height: '35px',
            background: 'linear-gradient(180deg, #cd6133 0%, #8B4513 50%, #636e72 50%, #2d3436 100%)',
            borderRadius: '0 0 12px 12px',
            border: '3px solid #2d3436',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Dă-i plic lui Fifi 🍽️"
        />

        {/* Toy Ball */}
        <div
          onClick={() => {
            setWalkTarget({ x: window.innerWidth - 120, y: window.innerHeight - 180 });
            setAction('playing');
            setMessage('Yay! Minge! 🎾');
            setLastInteraction(Date.now());
          }}
          style={{
            width: '30px',
            height: '30px',
            background: 'radial-gradient(circle at 30% 30%, #ff7675, #d63031)',
            borderRadius: '50%',
            border: '3px solid #c0392b',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Joacă-te cu Fifi 🎾"
        />
      </div>

      {/* Stolen Cursor Paw */}
      {isStealingCursor && stolenCursorPos && (
        <div style={{
          position: 'fixed',
          left: stolenCursorPos.x - 15,
          top: stolenCursorPos.y - 15,
          zIndex: 999999,
          pointerEvents: 'none',
          fontSize: '28px',
          transform: `rotate(${Math.sin(frame * 0.3) * 20}deg)`,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        }}>
          🐾
        </div>
      )}

      <style>{`
        @keyframes fifi-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
};

export default Fifi;
