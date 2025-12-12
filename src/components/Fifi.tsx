import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  vx: number;
  vy: number;
}

type FifiState =
  | 'idle'
  | 'sleeping'
  | 'walking'
  | 'running'
  | 'eating'
  | 'grooming'
  | 'stretching'
  | 'stalking'
  | 'pouncing'
  | 'caught_cursor'
  | 'playing'
  | 'dragging';

interface Stats {
  hunger: number;
  happiness: number;
  energy: number;
}

const Fifi: React.FC = () => {
  // Core state
  const [pos, setPos] = useState<Position>({ x: 300, y: 300 });
  const [state, setState] = useState<FifiState>('idle');
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [frame, setFrame] = useState(0);
  const [message, setMessage] = useState('');

  // Stats
  const [stats, setStats] = useState<Stats>({ hunger: 20, happiness: 80, energy: 70 });
  const [showStats, setShowStats] = useState(false);

  // Interaction
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [lastInteraction, setLastInteraction] = useState(Date.now());

  // Cursor stealing
  const [cursorPos, setCursorPos] = useState<Position | null>(null);
  const [hasCursor, setHasCursor] = useState(false);
  const stealingRef = useRef(false);
  const [stalkTarget, setStalkTarget] = useState<Position | null>(null);

  // Movement
  const [walkTarget, setWalkTarget] = useState<Position | null>(null);

  // Ball
  const [ballPos, setBallPos] = useState<Position>({ x: 200, y: 400 });
  const [ballVel, setBallVel] = useState<Velocity>({ vx: 0, vy: 0 });
  const [ballActive, setBallActive] = useState(false);

  // Food bowl
  const [bowlFilled, setBowlFilled] = useState(false);
  const [foodAmount, setFoodAmount] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bowlCanvasRef = useRef<HTMLCanvasElement>(null);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => setFrame(f => (f + 1) % 1000), 80);
    return () => clearInterval(interval);
  }, []);

  // Hunger increases every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(s => ({
        ...s,
        hunger: Math.min(100, s.hunger + 1.5),
        happiness: Math.max(0, s.happiness - (s.hunger > 70 ? 1 : 0.2)),
        energy: state === 'sleeping'
          ? Math.min(100, s.energy + 2)
          : Math.max(0, s.energy - 0.2),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [state]);

  // Auto behaviors
  useEffect(() => {
    if (isDragging || state === 'stalking' || state === 'pouncing' || state === 'caught_cursor') return;

    const check = setInterval(() => {
      const idleTime = Date.now() - lastInteraction;

      // Sleep when tired
      if (stats.energy < 15 && state !== 'sleeping' && idleTime > 8000) {
        setState('sleeping');
        setMessage('zzz...');
        return;
      }

      // Wake up when rested
      if (state === 'sleeping' && stats.energy > 85) {
        setState('idle');
        setMessage('*căscat* 😺');
        setLastInteraction(Date.now());
        return;
      }

      // Go eat if hungry and food available
      if (stats.hunger > 50 && bowlFilled && state === 'idle') {
        setWalkTarget({ x: window.innerWidth - 80, y: window.innerHeight - 180 });
        setState('running');
        setMessage('Mâncare! 😻');
        return;
      }

      // Random behaviors when idle
      if (state === 'idle' && idleTime > 4000 && Math.random() < 0.2) {
        const behaviors: FifiState[] = ['grooming', 'stretching'];
        const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        setState(behavior);
        setMessage(behavior === 'grooming' ? '*linge linge*' : '*întindere*');
        setTimeout(() => {
          if (state === behavior) setState('idle');
        }, 3000);
      }
    }, 2000);

    return () => clearInterval(check);
  }, [state, stats, isDragging, bowlFilled, lastInteraction]);

  // Cursor stealing - the main feature!
  useEffect(() => {
    if (state === 'sleeping' || state === 'eating' || isDragging) return;
    if (stealingRef.current) return;

    const trySteal = setInterval(() => {
      const prob = stats.hunger > 80 ? 0.3 : stats.hunger > 60 ? 0.15 : 0.03;

      if (Math.random() < prob && !stealingRef.current) {
        stealingRef.current = true;

        // Start stalking the cursor
        setState('stalking');
        setMessage('...');

        // Track mouse position for stalking
        const onMouseMove = (e: MouseEvent) => {
          setCursorPos({ x: e.clientX, y: e.clientY });
          setStalkTarget({ x: e.clientX, y: e.clientY });
        };

        document.addEventListener('mousemove', onMouseMove);

        // After stalking, pounce!
        setTimeout(() => {
          setState('pouncing');
          setMessage('MIAU!');

          setTimeout(() => {
            // Got the cursor!
            setHasCursor(true);
            setState('caught_cursor');
            setMessage('Mrrr! 😼');

            // Hide real cursor
            document.body.style.cursor = 'none';
            const style = document.createElement('style');
            style.id = 'fifi-hide-cursor';
            style.textContent = '* { cursor: none !important; }';
            document.head.appendChild(style);

            // Run away with cursor for a while
            setTimeout(() => {
              // Release cursor
              setHasCursor(false);
              setState('idle');
              stealingRef.current = false;
              document.body.style.cursor = 'auto';
              document.getElementById('fifi-hide-cursor')?.remove();
              setCursorPos(null);
              setStalkTarget(null);
              setMessage('Hehe! 😸');
              document.removeEventListener('mousemove', onMouseMove);
            }, 4000);
          }, 400);
        }, 2000);
      }
    }, 3000);

    return () => clearInterval(trySteal);
  }, [state, stats.hunger, isDragging]);

  // Stalking movement - creep towards cursor
  useEffect(() => {
    if (state !== 'stalking' || !stalkTarget) return;

    const stalk = setInterval(() => {
      setPos(p => {
        const dx = stalkTarget.x - p.x - 40;
        const dy = stalkTarget.y - p.y - 30;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) return p; // Close enough to pounce

        setFacing(dx > 0 ? 'right' : 'left');
        const speed = 2; // Slow creeping
        return {
          x: p.x + (dx / dist) * speed,
          y: p.y + (dy / dist) * speed,
        };
      });
    }, 50);

    return () => clearInterval(stalk);
  }, [state, stalkTarget]);

  // Running with cursor - run away!
  useEffect(() => {
    if (state !== 'caught_cursor' || !cursorPos) return;

    const runAway = setInterval(() => {
      setPos(p => {
        // Run away from where mouse is trying to go
        const dx = cursorPos.x - p.x;
        const dy = cursorPos.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 50) {
          // Mouse is close, run away!
          const angle = Math.atan2(dy, dx) + Math.PI; // Opposite direction
          const speed = 8;
          const newX = p.x + Math.cos(angle) * speed;
          const newY = p.y + Math.sin(angle) * speed;

          setFacing(Math.cos(angle) > 0 ? 'right' : 'left');

          return {
            x: Math.max(50, Math.min(window.innerWidth - 150, newX)),
            y: Math.max(50, Math.min(window.innerHeight - 200, newY)),
          };
        }
        return p;
      });
    }, 30);

    return () => clearInterval(runAway);
  }, [state, cursorPos]);

  // Walking/running to target
  useEffect(() => {
    if (!walkTarget || (state !== 'walking' && state !== 'running')) return;

    const move = setInterval(() => {
      setPos(p => {
        const dx = walkTarget.x - p.x;
        const dy = walkTarget.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 10) {
          setWalkTarget(null);

          // Arrived at food bowl?
          if (bowlFilled && walkTarget.x > window.innerWidth - 150) {
            setState('eating');
            setMessage('Nom nom! 😋');

            const eatInterval = setInterval(() => {
              setFoodAmount(f => {
                if (f <= 0) {
                  clearInterval(eatInterval);
                  setBowlFilled(false);
                  setState('idle');
                  setStats(s => ({ ...s, hunger: Math.max(0, s.hunger - 40), happiness: Math.min(100, s.happiness + 15) }));
                  setMessage('Mulțumesc! 💕');
                  return 0;
                }
                return f - 10;
              });
            }, 200);
          } else {
            setState('idle');
          }
          return p;
        }

        setFacing(dx > 0 ? 'right' : 'left');
        const speed = state === 'running' ? 6 : 3;
        return {
          x: p.x + (dx / dist) * speed,
          y: p.y + (dy / dist) * speed,
        };
      });
    }, 30);

    return () => clearInterval(move);
  }, [walkTarget, state, bowlFilled]);

  // Random wandering
  useEffect(() => {
    if (state !== 'idle' || isDragging || walkTarget) return;

    const wander = setInterval(() => {
      if (Math.random() < 0.3) {
        const newX = 100 + Math.random() * (window.innerWidth - 300);
        const newY = 100 + Math.random() * (window.innerHeight - 300);
        setWalkTarget({ x: newX, y: newY });
        setState('walking');
      }
    }, 5000);

    return () => clearInterval(wander);
  }, [state, isDragging, walkTarget]);

  // Ball physics
  useEffect(() => {
    if (!ballActive) return;

    const physics = setInterval(() => {
      setBallPos(p => {
        let nx = p.x + ballVel.vx;
        let ny = p.y + ballVel.vy;
        let nvx = ballVel.vx * 0.98;
        let nvy = ballVel.vy + 0.4;

        if (nx < 10 || nx > window.innerWidth - 50) nvx = -nvx * 0.7;
        if (ny > window.innerHeight - 120) {
          ny = window.innerHeight - 120;
          nvy = -nvy * 0.6;
        }

        nx = Math.max(10, Math.min(window.innerWidth - 50, nx));
        ny = Math.max(10, ny);

        setBallVel({ vx: nvx, vy: nvy });

        if (Math.abs(nvx) < 0.3 && Math.abs(nvy) < 0.3 && ny >= window.innerHeight - 125) {
          setBallActive(false);
        }

        return { x: nx, y: ny };
      });
    }, 16);

    return () => clearInterval(physics);
  }, [ballActive, ballVel]);

  // Clear messages
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(t);
  }, [message]);

  // Drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    setState('dragging');
    setMessage('Miau~! 😺');
    setLastInteraction(Date.now());
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent) => {
      setPos({
        x: Math.max(10, Math.min(window.innerWidth - 120, e.clientX - dragOffset.x)),
        y: Math.max(10, Math.min(window.innerHeight - 150, e.clientY - dragOffset.y)),
      });
    };

    const onUp = () => {
      setIsDragging(false);
      setState('idle');
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, dragOffset]);

  // Click handler
  const onClick = () => {
    setLastInteraction(Date.now());
    if (state === 'sleeping') {
      setState('idle');
      setMessage('*trezire* Miau!');
    } else {
      const msgs = stats.hunger > 60
        ? ['Foame! 🍽️', 'Vreau plic!', 'Mâncaaare!']
        : ['Mrrr~ 💕', 'Prrrr!', 'Te iubesc! 💖'];
      setMessage(msgs[Math.floor(Math.random() * msgs.length)]);
    }
    setStats(s => ({ ...s, happiness: Math.min(100, s.happiness + 3) }));
  };

  // Fill bowl
  const fillBowl = useCallback(() => {
    if (bowlFilled) return;
    setBowlFilled(true);
    setFoodAmount(100);
    setMessage('Mâncare!! 😻');

    if (stats.hunger > 30 && state === 'idle') {
      setWalkTarget({ x: window.innerWidth - 80, y: window.innerHeight - 180 });
      setState('running');
    }
  }, [bowlFilled, stats.hunger, state]);

  // Kick ball
  const kickBall = useCallback(() => {
    setBallVel({ vx: (Math.random() - 0.5) * 20, vy: -12 - Math.random() * 8 });
    setBallActive(true);
    setLastInteraction(Date.now());

    if (state === 'idle' && stats.energy > 20) {
      setState('playing');
      setMessage('Minge!! 🎾');
    }
  }, [state, stats.energy]);

  // Draw the cat - PROPER British Shorthair
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const s = 4; // Scale
    const drawPx = (x: number, y: number, c: string) => {
      ctx.fillStyle = c;
      ctx.fillRect(x * s, y * s, s, s);
    };

    // British Shorthair colors
    const C = {
      outline: '#2d3436',
      fur: '#8395a7',
      furLight: '#a4b0be',
      furDark: '#636e72',
      furPale: '#dfe6e9',
      eye: '#fdcb6e',
      eyeDark: '#e17055',
      pupil: '#2d3436',
      nose: '#fab1a0',
      noseDark: '#e17055',
      tongue: '#ff7675',
      inner: '#ffeaa7',
      collar: '#6c5ce7',
      bell: '#ffeaa7',
      white: '#ffffff',
    };

    ctx.save();
    if (facing === 'left') {
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
    }

    const animFrame = Math.floor(frame / 4) % 8;
    const breathe = Math.sin(frame * 0.1) * 0.5;
    const tailWag = Math.sin(frame * 0.15) * 3;
    const walkCycle = Math.floor(frame / 3) % 4;
    const blink = frame % 50 < 3;

    // Helper for drawing body parts
    const drawEar = (baseX: number, baseY: number, isLeft: boolean) => {
      const x = baseX;
      const y = baseY;
      // Outer ear
      drawPx(x, y, C.fur);
      drawPx(x + 1, y, C.fur);
      drawPx(x - 1, y + 1, C.outline);
      drawPx(x, y + 1, C.fur);
      drawPx(x + 1, y + 1, C.fur);
      drawPx(x + 2, y + 1, C.outline);
      // Inner ear (pink)
      drawPx(x, y + 1, C.inner);
      drawPx(x + 1, y + 1, C.inner);
      // Top outline
      drawPx(x - 1, y, C.outline);
      drawPx(x + 2, y, C.outline);
      drawPx(x, y - 1, C.outline);
      drawPx(x + 1, y - 1, C.outline);
    };

    const drawHead = (baseX: number, baseY: number) => {
      // Round British Shorthair face - very round and chubby
      // Row by row for the round head shape
      const headRows = [
        { y: 0, pixels: [[5, C.fur], [6, C.fur], [7, C.fur], [8, C.fur]] },
        { y: 1, pixels: [[3, C.fur], [4, C.fur], [5, C.furLight], [6, C.furLight], [7, C.furLight], [8, C.furLight], [9, C.fur], [10, C.fur]] },
        { y: 2, pixels: [[2, C.fur], [3, C.fur], [4, C.furLight], [5, C.furLight], [6, C.furLight], [7, C.furLight], [8, C.furLight], [9, C.fur], [10, C.fur], [11, C.fur]] },
        { y: 3, pixels: [[1, C.fur], [2, C.fur], [3, C.fur], [4, C.fur], [5, C.fur], [6, C.fur], [7, C.fur], [8, C.fur], [9, C.fur], [10, C.fur], [11, C.fur], [12, C.fur]] },
        { y: 4, pixels: [[1, C.fur], [2, C.fur], [3, C.fur], [4, C.fur], [5, C.fur], [6, C.fur], [7, C.fur], [8, C.fur], [9, C.fur], [10, C.fur], [11, C.fur], [12, C.fur]] },
        { y: 5, pixels: [[1, C.fur], [2, C.fur], [3, C.fur], [4, C.fur], [5, C.fur], [6, C.fur], [7, C.fur], [8, C.fur], [9, C.fur], [10, C.fur], [11, C.fur], [12, C.fur]] },
        { y: 6, pixels: [[2, C.fur], [3, C.fur], [4, C.fur], [5, C.fur], [6, C.fur], [7, C.fur], [8, C.fur], [9, C.fur], [10, C.fur], [11, C.fur]] },
        { y: 7, pixels: [[3, C.fur], [4, C.fur], [5, C.fur], [6, C.fur], [7, C.fur], [8, C.fur], [9, C.fur], [10, C.fur]] },
      ];

      headRows.forEach(row => {
        row.pixels.forEach(([x, color]) => {
          drawPx(baseX + x, baseY + row.y, color as string);
        });
      });

      // Cheek fluff (British Shorthairs have very round cheeks)
      drawPx(baseX + 1, baseY + 4, C.furPale);
      drawPx(baseX + 1, baseY + 5, C.furPale);
      drawPx(baseX + 12, baseY + 4, C.furPale);
      drawPx(baseX + 12, baseY + 5, C.furPale);

      // Eyes - big and round
      if (blink || state === 'sleeping') {
        // Closed eyes
        drawPx(baseX + 4, baseY + 4, C.outline);
        drawPx(baseX + 5, baseY + 4, C.outline);
        drawPx(baseX + 8, baseY + 4, C.outline);
        drawPx(baseX + 9, baseY + 4, C.outline);
      } else {
        // Open eyes
        // Left eye
        drawPx(baseX + 4, baseY + 3, C.eye);
        drawPx(baseX + 5, baseY + 3, C.eye);
        drawPx(baseX + 4, baseY + 4, C.eye);
        drawPx(baseX + 5, baseY + 4, C.pupil);
        drawPx(baseX + 4, baseY + 3, C.white); // Highlight

        // Right eye
        drawPx(baseX + 8, baseY + 3, C.eye);
        drawPx(baseX + 9, baseY + 3, C.eye);
        drawPx(baseX + 8, baseY + 4, C.pupil);
        drawPx(baseX + 9, baseY + 4, C.eye);
        drawPx(baseX + 9, baseY + 3, C.white); // Highlight

        // Stalking eyes - narrow and focused
        if (state === 'stalking') {
          drawPx(baseX + 4, baseY + 3, C.eyeDark);
          drawPx(baseX + 9, baseY + 3, C.eyeDark);
        }
      }

      // Nose - pink triangle
      drawPx(baseX + 6, baseY + 5, C.nose);
      drawPx(baseX + 7, baseY + 5, C.nose);
      drawPx(baseX + 6, baseY + 6, C.noseDark);
      drawPx(baseX + 7, baseY + 6, C.noseDark);

      // Mouth
      if (state === 'eating') {
        drawPx(baseX + 6, baseY + 7, C.tongue);
        drawPx(baseX + 7, baseY + 7, C.tongue);
      } else if (state === 'caught_cursor') {
        // Mouth holding cursor - smug look
        drawPx(baseX + 5, baseY + 6, C.outline);
        drawPx(baseX + 8, baseY + 6, C.outline);
      }

      // Whiskers
      drawPx(baseX + 1, baseY + 5, C.furDark);
      drawPx(baseX + 0, baseY + 4, C.furDark);
      drawPx(baseX + 12, baseY + 5, C.furDark);
      drawPx(baseX + 13, baseY + 4, C.furDark);

      // Head outline
      drawPx(baseX + 4, baseY - 1, C.outline);
      drawPx(baseX + 5, baseY - 1, C.outline);
      drawPx(baseX + 8, baseY - 1, C.outline);
      drawPx(baseX + 9, baseY - 1, C.outline);
      drawPx(baseX + 0, baseY + 3, C.outline);
      drawPx(baseX + 0, baseY + 4, C.outline);
      drawPx(baseX + 0, baseY + 5, C.outline);
      drawPx(baseX + 13, baseY + 3, C.outline);
      drawPx(baseX + 13, baseY + 4, C.outline);
      drawPx(baseX + 13, baseY + 5, C.outline);
      drawPx(baseX + 2, baseY + 7, C.outline);
      drawPx(baseX + 11, baseY + 7, C.outline);
    };

    const drawBody = (baseX: number, baseY: number, isWalking: boolean, isRunning: boolean) => {
      const bounce = isRunning ? Math.abs(Math.sin(frame * 0.3)) * 2 : 0;
      const y = baseY - bounce;

      // Stocky British Shorthair body
      for (let row = 0; row < 6; row++) {
        const width = row < 2 ? 8 : row < 4 ? 10 : 8;
        const startX = baseX + 3 + (10 - width) / 2;
        for (let i = 0; i < width; i++) {
          const shade = i === 0 || i === width - 1 ? C.furDark : (row === 0 ? C.furLight : C.fur);
          drawPx(startX + i, y + row + breathe, shade);
        }
      }

      // Collar
      for (let i = 0; i < 6; i++) {
        drawPx(baseX + 4 + i, y, C.collar);
      }
      drawPx(baseX + 7, y + 1, C.bell);

      // Legs
      if (isWalking || isRunning) {
        const legOffset = walkCycle % 2;
        // Front legs
        drawPx(baseX + 4 + legOffset, y + 6, C.fur);
        drawPx(baseX + 5 + legOffset, y + 6, C.fur);
        drawPx(baseX + 4 + legOffset, y + 7, C.furLight);
        drawPx(baseX + 5 + legOffset, y + 7, C.furLight);
        // Back legs
        drawPx(baseX + 9 - legOffset, y + 6, C.fur);
        drawPx(baseX + 10 - legOffset, y + 6, C.fur);
        drawPx(baseX + 9 - legOffset, y + 7, C.furLight);
        drawPx(baseX + 10 - legOffset, y + 7, C.furLight);
      } else {
        // Standing/sitting legs
        drawPx(baseX + 4, y + 6, C.fur);
        drawPx(baseX + 5, y + 6, C.fur);
        drawPx(baseX + 4, y + 7, C.furLight);
        drawPx(baseX + 5, y + 7, C.furLight);
        drawPx(baseX + 9, y + 6, C.fur);
        drawPx(baseX + 10, y + 6, C.fur);
        drawPx(baseX + 9, y + 7, C.furLight);
        drawPx(baseX + 10, y + 7, C.furLight);
      }

      // Tail
      const tailY = tailWag;
      drawPx(baseX + 12, y + 3, C.fur);
      drawPx(baseX + 13, y + 2 + tailY * 0.3, C.fur);
      drawPx(baseX + 14, y + 1 + tailY * 0.6, C.fur);
      drawPx(baseX + 15, y + tailY, C.fur);
      drawPx(baseX + 16, y - 1 + tailY, C.furDark);
    };

    // Draw based on state
    if (state === 'sleeping') {
      // Curled up sleeping pose
      // Ears (visible when sleeping!)
      drawEar(2, 2, true);
      drawEar(9, 2, false);

      // Head resting
      for (let y = 3; y < 8; y++) {
        for (let x = 2; x < 12; x++) {
          if (y === 3 && (x < 4 || x > 9)) continue;
          if (y === 7 && (x < 4 || x > 9)) continue;
          drawPx(x, y, C.fur);
        }
      }

      // Closed eyes
      drawPx(4, 5, C.outline);
      drawPx(5, 5, C.outline);
      drawPx(8, 5, C.outline);
      drawPx(9, 5, C.outline);

      // Nose
      drawPx(6, 6, C.nose);
      drawPx(7, 6, C.nose);

      // Curled body
      for (let x = 5; x < 18; x++) {
        drawPx(x, 8, C.fur);
        drawPx(x, 9, C.fur);
        drawPx(x, 10, C.fur);
      }

      // Paws tucked
      drawPx(5, 10, C.furLight);
      drawPx(6, 10, C.furLight);

      // Tail wrapped around
      drawPx(16, 8, C.fur);
      drawPx(17, 7, C.fur);
      drawPx(18, 6, C.fur);
      drawPx(18, 5, C.furDark);

      // Zzz
      const zFrame = Math.floor(frame / 15) % 3;
      if (zFrame > 0) {
        drawPx(14, 2, C.outline);
        drawPx(15, 2, C.outline);
        drawPx(15, 3, C.outline);
        drawPx(14, 4, C.outline);
        drawPx(15, 4, C.outline);
      }

    } else if (state === 'stalking') {
      // Low stalking crouch
      // Ears flat back
      drawPx(1, 4, C.fur);
      drawPx(2, 3, C.fur);
      drawPx(2, 4, C.inner);
      drawPx(12, 4, C.fur);
      drawPx(11, 3, C.fur);
      drawPx(11, 4, C.inner);

      // Head low
      for (let y = 4; y < 9; y++) {
        for (let x = 2; x < 12; x++) {
          drawPx(x, y, C.fur);
        }
      }

      // Intense eyes
      drawPx(4, 5, C.eyeDark);
      drawPx(5, 5, C.eye);
      drawPx(5, 6, C.pupil);
      drawPx(8, 5, C.eye);
      drawPx(9, 5, C.eyeDark);
      drawPx(8, 6, C.pupil);

      // Nose
      drawPx(6, 7, C.nose);
      drawPx(7, 7, C.nose);

      // Low crouched body
      for (let x = 3; x < 16; x++) {
        drawPx(x, 10, C.fur);
        drawPx(x, 11, C.fur);
      }

      // Legs ready to pounce
      drawPx(3, 12, C.fur);
      drawPx(4, 12, C.fur);
      drawPx(14, 12, C.fur);
      drawPx(15, 12, C.fur);

      // Tail twitching
      const twitch = Math.sin(frame * 0.4) * 2;
      drawPx(16, 10, C.fur);
      drawPx(17, 9 + twitch, C.fur);
      drawPx(18, 8 + twitch, C.fur);
      drawPx(19, 7 + twitch, C.furDark);

    } else if (state === 'pouncing') {
      // Mid-pounce - stretched out
      // Ears back
      drawPx(1, 3, C.fur);
      drawPx(2, 2, C.fur);

      // Head forward
      for (let y = 2; y < 7; y++) {
        for (let x = 3; x < 11; x++) {
          drawPx(x, y, C.fur);
        }
      }

      // Wide eyes
      drawPx(4, 3, C.white);
      drawPx(5, 3, C.eye);
      drawPx(5, 4, C.pupil);
      drawPx(8, 3, C.eye);
      drawPx(8, 4, C.pupil);
      drawPx(9, 3, C.white);

      // Open mouth
      drawPx(6, 5, C.nose);
      drawPx(7, 5, C.nose);
      drawPx(6, 6, C.tongue);
      drawPx(7, 6, C.tongue);

      // Stretched body
      for (let x = 5; x < 18; x++) {
        drawPx(x, 8, C.fur);
        drawPx(x, 9, C.fur);
      }

      // Front legs stretched forward
      drawPx(3, 9, C.fur);
      drawPx(4, 9, C.fur);
      drawPx(2, 10, C.furLight);
      drawPx(3, 10, C.furLight);

      // Back legs pushing
      drawPx(17, 10, C.fur);
      drawPx(18, 10, C.fur);

    } else if (state === 'caught_cursor') {
      // Running with cursor in mouth!
      const runBounce = Math.abs(Math.sin(frame * 0.4)) * 3;
      const baseY = 2 - runBounce;

      // Ears
      drawEar(2, baseY, true);
      drawEar(10, baseY, false);

      // Head
      for (let y = 0; y < 6; y++) {
        for (let x = 2; x < 13; x++) {
          if (y === 0 && (x < 5 || x > 9)) continue;
          drawPx(x, baseY + y + 2, C.fur);
        }
      }

      // Smug eyes
      drawPx(4, baseY + 4, C.eye);
      drawPx(5, baseY + 4, C.pupil);
      drawPx(9, baseY + 4, C.pupil);
      drawPx(10, baseY + 4, C.eye);

      // Nose
      drawPx(7, baseY + 5, C.nose);

      // CURSOR IN MOUTH!
      // Draw a little arrow cursor
      drawPx(5, baseY + 7, C.white);
      drawPx(6, baseY + 7, C.white);
      drawPx(6, baseY + 8, C.white);
      drawPx(7, baseY + 8, C.outline);
      drawPx(7, baseY + 9, C.outline);
      drawPx(8, baseY + 9, C.outline);

      // Body running
      const bodyY = baseY + 8;
      for (let x = 4; x < 14; x++) {
        drawPx(x, bodyY, C.fur);
        drawPx(x, bodyY + 1, C.fur);
      }

      // Running legs
      const legFrame = Math.floor(frame / 2) % 4;
      if (legFrame === 0 || legFrame === 2) {
        drawPx(4, bodyY + 2, C.fur);
        drawPx(5, bodyY + 3, C.furLight);
        drawPx(12, bodyY + 2, C.fur);
        drawPx(13, bodyY + 3, C.furLight);
      } else {
        drawPx(5, bodyY + 2, C.fur);
        drawPx(4, bodyY + 3, C.furLight);
        drawPx(13, bodyY + 2, C.fur);
        drawPx(12, bodyY + 3, C.furLight);
      }

      // Tail streaming behind
      drawPx(14, bodyY, C.fur);
      drawPx(15, bodyY - 1, C.fur);
      drawPx(16, bodyY - 2, C.fur);
      drawPx(17, bodyY - 3, C.furDark);

    } else if (state === 'grooming') {
      // Sitting and licking paw
      drawEar(2, 0, true);
      drawEar(10, 0, false);
      drawHead(0, 2);

      // Raised paw near face
      drawPx(0, 8, C.furLight);
      drawPx(1, 8, C.furLight);
      drawPx(0, 9, C.furLight);

      // Tongue touching paw
      drawPx(2, 9, C.tongue);

      // Body
      for (let y = 0; y < 5; y++) {
        for (let x = 4; x < 12; x++) {
          drawPx(x, 10 + y, C.fur);
        }
      }

      // Sitting legs
      drawPx(4, 14, C.furLight);
      drawPx(5, 14, C.furLight);
      drawPx(10, 14, C.furLight);
      drawPx(11, 14, C.furLight);

    } else if (state === 'eating') {
      // Head down eating
      drawEar(3, 1, true);
      drawEar(11, 1, false);

      // Head tilted down
      for (let y = 2; y < 8; y++) {
        for (let x = 3; x < 13; x++) {
          drawPx(x, y, C.fur);
        }
      }

      // Closed happy eyes
      drawPx(5, 4, C.outline);
      drawPx(6, 4, C.outline);
      drawPx(9, 4, C.outline);
      drawPx(10, 4, C.outline);

      // Nose in food
      drawPx(7, 6, C.nose);
      drawPx(8, 6, C.nose);

      // Tongue licking
      const lickFrame = frame % 10 < 5;
      if (lickFrame) {
        drawPx(7, 7, C.tongue);
        drawPx(8, 7, C.tongue);
      }

      // Body
      for (let y = 0; y < 5; y++) {
        for (let x = 5; x < 12; x++) {
          drawPx(x, 9 + y, C.fur);
        }
      }

      // Legs
      drawPx(5, 13, C.furLight);
      drawPx(6, 13, C.furLight);
      drawPx(10, 13, C.furLight);
      drawPx(11, 13, C.furLight);

      // Tail happy
      drawPx(12, 11, C.fur);
      drawPx(13, 10 + tailWag * 0.5, C.fur);
      drawPx(14, 9 + tailWag, C.furDark);

    } else {
      // Default standing/walking/running
      const isMoving = state === 'walking' || state === 'running';

      // Ears
      drawEar(2, 0, true);
      drawEar(10, 0, false);

      // Head
      drawHead(0, 2);

      // Body
      drawBody(0, 10, isMoving, state === 'running');
    }

    ctx.restore();
  }, [frame, state, facing, stats]);

  // Draw pixelated food bowl
  useEffect(() => {
    const canvas = bowlCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const s = 3; // Scale
    const drawPx = (x: number, y: number, c: string) => {
      ctx.fillStyle = c;
      ctx.fillRect(x * s, y * s, s, s);
    };

    // Bowl colors
    const bowlColors = {
      rim: '#d97706',
      rimLight: '#fbbf24',
      rimDark: '#92400e',
      inside: '#78350f',
      insideDark: '#451a03',
      food: '#cd6133',
      foodDark: '#9a3412',
      foodLight: '#ea580c',
    };

    // Bowl rim (top)
    for (let x = 2; x < 18; x++) {
      drawPx(x, 0, bowlColors.rimLight);
      drawPx(x, 1, bowlColors.rim);
    }
    drawPx(1, 1, bowlColors.rimDark);
    drawPx(18, 1, bowlColors.rimDark);

    // Bowl body
    for (let y = 2; y < 10; y++) {
      const indent = Math.floor(y / 3);
      for (let x = 1 + indent; x < 19 - indent; x++) {
        if (x === 1 + indent || x === 18 - indent) {
          drawPx(x, y, bowlColors.rimDark);
        } else {
          drawPx(x, y, bowlColors.rim);
        }
      }
    }

    // Bowl inside (dark)
    for (let y = 2; y < 9; y++) {
      const indent = Math.floor(y / 3) + 1;
      for (let x = 2 + indent; x < 18 - indent; x++) {
        drawPx(x, y, y < 4 ? bowlColors.inside : bowlColors.insideDark);
      }
    }

    // Food inside bowl (if filled)
    if (bowlFilled && foodAmount > 0) {
      const foodHeight = Math.floor((foodAmount / 100) * 5);
      for (let y = 0; y < foodHeight; y++) {
        const foodY = 7 - y;
        const indent = Math.floor(foodY / 3) + 2;
        for (let x = 3 + indent; x < 17 - indent; x++) {
          // Add some texture to the food
          if ((x + y) % 3 === 0) {
            drawPx(x, foodY, bowlColors.foodDark);
          } else if ((x + y) % 3 === 1) {
            drawPx(x, foodY, bowlColors.foodLight);
          } else {
            drawPx(x, foodY, bowlColors.food);
          }
        }
      }
    }

    // Bowl label "FIFI"
    // F
    drawPx(6, 11, bowlColors.rimLight);
    drawPx(6, 12, bowlColors.rimLight);
    drawPx(6, 13, bowlColors.rimLight);
    drawPx(7, 11, bowlColors.rimLight);
    drawPx(7, 12, bowlColors.rimLight);
    // I
    drawPx(9, 11, bowlColors.rimLight);
    drawPx(9, 12, bowlColors.rimLight);
    drawPx(9, 13, bowlColors.rimLight);
    // F
    drawPx(11, 11, bowlColors.rimLight);
    drawPx(11, 12, bowlColors.rimLight);
    drawPx(11, 13, bowlColors.rimLight);
    drawPx(12, 11, bowlColors.rimLight);
    drawPx(12, 12, bowlColors.rimLight);
    // I
    drawPx(14, 11, bowlColors.rimLight);
    drawPx(14, 12, bowlColors.rimLight);
    drawPx(14, 13, bowlColors.rimLight);

  }, [bowlFilled, foodAmount]);

  // Render
  return (
    <>
      {/* Fifi */}
      <div
        onMouseDown={onMouseDown}
        onClick={onClick}
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          zIndex: 9999,
          cursor: isDragging ? 'grabbing' : 'grab',
          filter: isDragging ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))' : 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))',
          userSelect: 'none',
        }}
      >
        <canvas
          ref={canvasRef}
          width={100}
          height={80}
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Speech bubble */}
        {message && (
          <div style={{
            position: 'absolute',
            top: '-45px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'white',
            padding: '8px 14px',
            borderRadius: '14px',
            border: '2px solid #8b5cf6',
            fontSize: '13px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10001,
          }}>
            {message}
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid white',
            }} />
          </div>
        )}

        {/* Hunger indicator */}
        {stats.hunger > 60 && state !== 'sleeping' && state !== 'eating' && (
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '0',
            fontSize: '20px',
            animation: 'bounce 0.5s infinite alternate',
          }}>
            {stats.hunger > 80 ? '😾' : '💭'}
          </div>
        )}
      </div>

      {/* Cursor shown when caught - follows mouse but "held" by Fifi */}
      {hasCursor && cursorPos && (
        <div style={{
          position: 'fixed',
          left: pos.x + 25,
          top: pos.y + 40,
          zIndex: 999999,
          pointerEvents: 'none',
          fontSize: '20px',
        }}>
          🖱️
        </div>
      )}

      {/* Ball */}
      <div
        onClick={kickBall}
        style={{
          position: 'fixed',
          left: ballPos.x,
          top: ballPos.y,
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #ff6b6b, #c0392b)',
          border: '2px solid #922b21',
          cursor: 'pointer',
          zIndex: 100,
          transform: ballActive ? `rotate(${frame * 15}deg)` : 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
        title="Click pentru a te juca cu Fifi! 🎾"
      />

      {/* Food area */}
      <div style={{
        position: 'fixed',
        right: '20px',
        bottom: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        zIndex: 100,
      }}>
        <button
          onClick={fillBowl}
          disabled={bowlFilled}
          style={{
            padding: '8px 12px',
            backgroundColor: bowlFilled ? '#9ca3af' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: bowlFilled ? 'not-allowed' : 'pointer',
            fontSize: '11px',
            fontWeight: 'bold',
          }}
        >
          🍽️ Pliculețe
        </button>

        {/* Pixelated Food Bowl - clickable! */}
        <canvas
          ref={bowlCanvasRef}
          width={60}
          height={45}
          onClick={fillBowl}
          style={{
            imageRendering: 'pixelated',
            cursor: bowlFilled ? 'default' : 'pointer',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={(e) => !bowlFilled && (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          title={bowlFilled ? 'Castronul e plin!' : 'Click pentru a pune mâncare!'}
        />
      </div>

      {/* Stats panel */}
      {showStats && (
        <div style={{
          position: 'fixed',
          right: '15px',
          bottom: '70px',
          backgroundColor: 'white',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '2px solid #8b5cf6',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          zIndex: 10000,
          minWidth: '150px',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#7c3aed' }}>🐱 Fifi</div>

          {[
            { label: '🍽️ Foame', value: stats.hunger, color: stats.hunger > 70 ? '#ef4444' : stats.hunger > 40 ? '#f59e0b' : '#22c55e' },
            { label: '💕 Fericire', value: stats.happiness, color: '#ec4899' },
            { label: '⚡ Energie', value: stats.energy, color: '#eab308' },
          ].map(stat => (
            <div key={stat.label} style={{ marginBottom: '6px' }}>
              <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{stat.label}</span>
                <span>{Math.round(stat.value)}%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px' }}>
                <div style={{ height: '100%', width: `${stat.value}%`, backgroundColor: stat.color, borderRadius: '3px' }} />
              </div>
            </div>
          ))}

          <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '8px' }}>
            Status: {
              state === 'sleeping' ? '😴 Doarme' :
              state === 'stalking' ? '👀 Pândește...' :
              state === 'caught_cursor' ? '😼 A prins cursorul!' :
              state === 'eating' ? '😋 Mănâncă' :
              state === 'grooming' ? '👅 Se spală' :
              state === 'running' ? '🏃 Aleargă' :
              state === 'walking' ? '🚶 Se plimbă' :
              '😺 Relaxată'
            }
          </div>
        </div>
      )}

      {/* Stats button */}
      <button
        onClick={() => setShowStats(s => !s)}
        style={{
          position: 'fixed',
          right: '150px',
          bottom: '16px',
          padding: '5px 10px',
          backgroundColor: showStats ? '#8b5cf6' : 'rgba(139, 92, 246, 0.2)',
          color: showStats ? 'white' : '#7c3aed',
          border: '2px solid rgba(139, 92, 246, 0.4)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 31,
        }}
      >
        🐱 Fifi
      </button>

      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
};

export default Fifi;
