import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  vx: number;
  vy: number;
}

type CatState =
  | 'idle'
  | 'lying'
  | 'sleeping'
  | 'walking'
  | 'running'
  | 'stalking'
  | 'pouncing'
  | 'jumping'
  | 'eating'
  | 'grooming'
  | 'caught_cursor'
  | 'dragging';

interface Stats {
  hunger: number;
  happiness: number;
  energy: number;
}

const Fifi: React.FC = () => {
  // Core state
  const [pos, setPos] = useState<Position>({ x: 300, y: 300 });
  const [state, setState] = useState<CatState>('lying');
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

  // Movement
  const [target, setTarget] = useState<Position | null>(null);

  // Ball
  const [ballPos, setBallPos] = useState<Position>({ x: 150, y: 350 });
  const [ballVel, setBallVel] = useState<Velocity>({ vx: 0, vy: 0 });
  const [ballActive, setBallActive] = useState(false);
  const [chasingBall, setChasingBall] = useState(false);

  // Food
  const [bowlFilled, setBowlFilled] = useState(false);
  const [foodAmount, setFoodAmount] = useState(0);
  const [pouringFood, setPouringFood] = useState(false);

  // Canvas refs
  const catCanvas = useRef<HTMLCanvasElement>(null);
  const ballCanvas = useRef<HTMLCanvasElement>(null);
  const bowlCanvas = useRef<HTMLCanvasElement>(null);
  const plicCanvas = useRef<HTMLCanvasElement>(null);

  // Colors matching reference image
  const C = {
    black: '#000000',
    gray: '#808080',
    grayLight: '#a0a0a0',
    grayDark: '#606060',
    yellow: '#ffff00',
    pink: '#ff80a0',
    blue: '#0080ff',
    white: '#ffffff',
    orange: '#ff8000',
    brown: '#804000',
  };

  // Fast animation loop - 60fps feel
  useEffect(() => {
    let animId: number;
    let lastTime = 0;
    const animate = (time: number) => {
      if (time - lastTime > 50) {
        setFrame(f => (f + 1) % 1000);
        lastTime = time;
      }
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Hunger - gets hungry in ~1 minute
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(s => ({
        ...s,
        hunger: Math.min(100, s.hunger + 1.5),
        happiness: Math.max(0, s.happiness - (s.hunger > 70 ? 1 : 0.3)),
        energy: state === 'sleeping' ? Math.min(100, s.energy + 3) : Math.max(0, s.energy - 0.2),
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, [state]);

  // Cat behaviors
  useEffect(() => {
    if (isDragging || state === 'stalking' || state === 'pouncing' || state === 'caught_cursor' || state === 'jumping') return;

    const behavior = setInterval(() => {
      const idleTime = Date.now() - lastInteraction;

      // Sleep when tired
      if (stats.energy < 20 && state !== 'sleeping' && idleTime > 5000) {
        setState('sleeping');
        setMessage('zzz...');
        return;
      }

      // Wake up
      if (state === 'sleeping' && stats.energy > 80) {
        setState('lying');
        setMessage('*căscat*');
        setLastInteraction(Date.now());
        return;
      }

      // Go eat
      if (stats.hunger > 50 && bowlFilled && (state === 'idle' || state === 'lying')) {
        setTarget({ x: window.innerWidth - 100, y: window.innerHeight - 180 });
        setState('running');
        setMessage('Mâncare!');
        return;
      }

      // Random behaviors
      if ((state === 'idle' || state === 'lying') && idleTime > 3000 && Math.random() < 0.15) {
        const actions: CatState[] = ['grooming', 'lying', 'idle'];
        const action = actions[Math.floor(Math.random() * actions.length)];
        setState(action);
        if (action === 'grooming') setMessage('*linge*');
      }
    }, 1500);

    return () => clearInterval(behavior);
  }, [state, stats, isDragging, bowlFilled, lastInteraction]);

  // Cursor stealing
  useEffect(() => {
    if (state === 'sleeping' || state === 'eating' || isDragging || stealingRef.current) return;

    const trySteal = setInterval(() => {
      const prob = stats.hunger > 80 ? 0.25 : stats.hunger > 60 ? 0.1 : 0.02;

      if (Math.random() < prob) {
        stealingRef.current = true;
        setState('stalking');
        setMessage('...');

        const onMove = (e: MouseEvent) => {
          setCursorPos({ x: e.clientX, y: e.clientY });
        };
        document.addEventListener('mousemove', onMove);

        // Stalk for 1.5s then pounce
        setTimeout(() => {
          setState('pouncing');
          setMessage('HAP!');

          setTimeout(() => {
            setHasCursor(true);
            setState('caught_cursor');
            setMessage('Mrrr! 😼');

            document.body.style.cursor = 'none';
            const style = document.createElement('style');
            style.id = 'hide-cursor';
            style.textContent = '* { cursor: none !important; }';
            document.head.appendChild(style);

            // Run away for 3s
            setTimeout(() => {
              setHasCursor(false);
              setState('lying');
              stealingRef.current = false;
              document.body.style.cursor = 'auto';
              document.getElementById('hide-cursor')?.remove();
              setCursorPos(null);
              setMessage('Hehe!');
              document.removeEventListener('mousemove', onMove);
            }, 3000);
          }, 300);
        }, 1500);
      }
    }, 2500);

    return () => clearInterval(trySteal);
  }, [state, stats.hunger, isDragging]);

  // Stalking movement
  useEffect(() => {
    if (state !== 'stalking' || !cursorPos) return;

    const stalk = setInterval(() => {
      setPos(p => {
        const dx = cursorPos.x - p.x - 40;
        const dy = cursorPos.y - p.y - 30;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) return p;
        setFacing(dx > 0 ? 'right' : 'left');
        return {
          x: p.x + (dx / dist) * 3,
          y: p.y + (dy / dist) * 3,
        };
      });
    }, 30);

    return () => clearInterval(stalk);
  }, [state, cursorPos]);

  // Running with cursor
  useEffect(() => {
    if (state !== 'caught_cursor' || !cursorPos) return;

    const run = setInterval(() => {
      setPos(p => {
        const dx = cursorPos.x - p.x;
        const dy = cursorPos.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 80) {
          const angle = Math.atan2(dy, dx) + Math.PI;
          setFacing(Math.cos(angle) > 0 ? 'right' : 'left');
          return {
            x: Math.max(20, Math.min(window.innerWidth - 120, p.x + Math.cos(angle) * 10)),
            y: Math.max(20, Math.min(window.innerHeight - 180, p.y + Math.sin(angle) * 10)),
          };
        }
        return p;
      });
    }, 25);

    return () => clearInterval(run);
  }, [state, cursorPos]);

  // Ball physics
  useEffect(() => {
    if (!ballActive) return;

    const physics = setInterval(() => {
      setBallPos(p => {
        let nx = p.x + ballVel.vx;
        let ny = p.y + ballVel.vy;
        let nvx = ballVel.vx * 0.98;
        let nvy = ballVel.vy + 0.6; // Gravity

        // Walls
        if (nx < 10) { nx = 10; nvx = -nvx * 0.8; }
        if (nx > window.innerWidth - 50) { nx = window.innerWidth - 50; nvx = -nvx * 0.8; }

        // Floor
        if (ny > window.innerHeight - 100) {
          ny = window.innerHeight - 100;
          nvy = -nvy * 0.65;
          nvx *= 0.9;
        }

        setBallVel({ vx: nvx, vy: nvy });

        if (Math.abs(nvx) < 0.5 && Math.abs(nvy) < 0.5 && ny >= window.innerHeight - 105) {
          setBallActive(false);
        }

        return { x: nx, y: ny };
      });
    }, 16);

    return () => clearInterval(physics);
  }, [ballActive, ballVel]);

  // Chase and jump at ball
  useEffect(() => {
    if (!chasingBall || state === 'sleeping' || state === 'eating') return;

    const chase = setInterval(() => {
      const dx = ballPos.x - pos.x - 20;
      const dy = ballPos.y - pos.y - 20;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 60) {
        // JUMP/POUNCE at ball!
        setChasingBall(false);
        setState('jumping');
        setMessage('HAP!');

        // Hit the ball
        setBallVel({
          vx: (Math.random() - 0.5) * 18,
          vy: -12 - Math.random() * 8,
        });
        setBallActive(true);

        setStats(s => ({
          ...s,
          happiness: Math.min(100, s.happiness + 10),
          energy: Math.max(0, s.energy - 5),
        }));

        setTimeout(() => {
          setState('lying');
          // Maybe chase again
          if (stats.energy > 30 && Math.random() < 0.6) {
            setTimeout(() => {
              setChasingBall(true);
              setState('running');
              setMessage('Din nou!');
            }, 500);
          }
        }, 400);
      } else {
        // Move towards ball
        setFacing(dx > 0 ? 'right' : 'left');
        setPos(p => ({
          x: p.x + (dx / dist) * 6,
          y: p.y + (dy / dist) * 6,
        }));
      }
    }, 30);

    return () => clearInterval(chase);
  }, [chasingBall, ballPos, pos, state, stats.energy]);

  // Walking/running to target
  useEffect(() => {
    if (!target || (state !== 'walking' && state !== 'running')) return;

    const move = setInterval(() => {
      setPos(p => {
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 15) {
          setTarget(null);

          // Arrived at food?
          if (bowlFilled && target.x > window.innerWidth - 150) {
            setState('eating');
            setMessage('Nom nom!');

            const eat = setInterval(() => {
              setFoodAmount(f => {
                if (f <= 0) {
                  clearInterval(eat);
                  setBowlFilled(false);
                  setState('lying');
                  setStats(s => ({ ...s, hunger: Math.max(0, s.hunger - 45), happiness: Math.min(100, s.happiness + 15) }));
                  setMessage('Mulțumesc! 💕');
                  return 0;
                }
                return f - 12;
              });
            }, 150);
          } else {
            setState('lying');
          }
          return p;
        }

        setFacing(dx > 0 ? 'right' : 'left');
        const speed = state === 'running' ? 7 : 4;
        return { x: p.x + (dx / dist) * speed, y: p.y + (dy / dist) * speed };
      });
    }, 25);

    return () => clearInterval(move);
  }, [target, state, bowlFilled]);

  // Random wandering
  useEffect(() => {
    if (state !== 'lying' && state !== 'idle') return;
    if (isDragging || target || chasingBall) return;

    const wander = setInterval(() => {
      if (Math.random() < 0.2) {
        const nx = 80 + Math.random() * (window.innerWidth - 250);
        const ny = 80 + Math.random() * (window.innerHeight - 280);
        setTarget({ x: nx, y: ny });
        setState('walking');
      }
    }, 4000);

    return () => clearInterval(wander);
  }, [state, isDragging, target, chasingBall]);

  // Drag
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    setState('dragging');
    setMessage('Miau~!');
    setLastInteraction(Date.now());
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent) => {
      setPos({
        x: Math.max(10, Math.min(window.innerWidth - 100, e.clientX - dragOffset.x)),
        y: Math.max(10, Math.min(window.innerHeight - 140, e.clientY - dragOffset.y)),
      });
    };

    const onUp = () => {
      setIsDragging(false);
      setState('lying');
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, dragOffset]);

  // Click cat
  const onClick = () => {
    setLastInteraction(Date.now());
    if (state === 'sleeping') {
      setState('lying');
      setMessage('*trezire*');
    } else {
      const msgs = stats.hunger > 60 ? ['Foame!', 'Plic!', 'Mâncare!'] : ['Mrrr~', 'Prrrr!', '💕'];
      setMessage(msgs[Math.floor(Math.random() * msgs.length)]);
    }
    setStats(s => ({ ...s, happiness: Math.min(100, s.happiness + 3) }));
  };

  // Pour food
  const pourFood = useCallback(() => {
    if (bowlFilled || pouringFood) return;

    setPouringFood(true);
    setMessage('Mâncare!!');

    // Pouring animation
    let poured = 0;
    const pour = setInterval(() => {
      poured += 15;
      setFoodAmount(poured);

      if (poured >= 100) {
        clearInterval(pour);
        setPouringFood(false);
        setBowlFilled(true);
        setFoodAmount(100);

        // Cat notices food
        if (stats.hunger > 25 && (state === 'lying' || state === 'idle')) {
          setTarget({ x: window.innerWidth - 100, y: window.innerHeight - 180 });
          setState('running');
        }
      }
    }, 80);
  }, [bowlFilled, pouringFood, stats.hunger, state]);

  // Kick ball
  const kickBall = useCallback(() => {
    setBallVel({ vx: (Math.random() - 0.5) * 20, vy: -14 - Math.random() * 8 });
    setBallActive(true);
    setLastInteraction(Date.now());

    if ((state === 'lying' || state === 'idle') && stats.energy > 20) {
      setChasingBall(true);
      setState('running');
      setMessage('Minge!');
    }
  }, [state, stats.energy]);

  // Clear message
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 2500);
    return () => clearTimeout(t);
  }, [message]);

  // DRAW CAT - matching reference image style
  useEffect(() => {
    const canvas = catCanvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const s = 4; // Pixel scale
    const px = (x: number, y: number, c: string) => {
      ctx.fillStyle = c;
      ctx.fillRect(x * s, y * s, s, s);
    };

    ctx.save();
    if (facing === 'left') {
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
    }

    const anim = Math.floor(frame / 6) % 4;
    const tailWag = Math.sin(frame * 0.15) * 2;

    if (state === 'sleeping') {
      // Curled up sleeping - based on reference lying pose
      // Ears
      px(4, 1, C.black); px(5, 0, C.black); px(6, 0, C.black); px(7, 1, C.black);
      px(5, 1, C.gray); px(6, 1, C.gray);
      px(5, 2, C.grayDark); px(6, 2, C.grayDark); // Inner ear

      px(12, 1, C.black); px(13, 0, C.black); px(14, 0, C.black); px(15, 1, C.black);
      px(13, 1, C.gray); px(14, 1, C.gray);
      px(13, 2, C.grayDark); px(14, 2, C.grayDark);

      // Head
      for (let y = 2; y < 8; y++) {
        for (let x = 4; x < 16; x++) {
          if (y === 2 && (x < 6 || x > 13)) continue;
          if (y === 7 && (x < 6 || x > 13)) continue;
          px(x, y, C.gray);
        }
      }
      // Head outline
      px(3, 3, C.black); px(3, 4, C.black); px(3, 5, C.black); px(3, 6, C.black);
      px(16, 3, C.black); px(16, 4, C.black); px(16, 5, C.black); px(16, 6, C.black);
      px(4, 7, C.black); px(5, 7, C.black); px(14, 7, C.black); px(15, 7, C.black);

      // Closed eyes (lines)
      px(7, 4, C.black); px(8, 4, C.black);
      px(11, 4, C.black); px(12, 4, C.black);

      // Nose
      px(9, 5, C.pink); px(10, 5, C.pink);

      // Body curled
      for (let x = 6; x < 22; x++) {
        px(x, 8, C.gray);
        px(x, 9, C.gray);
        px(x, 10, C.gray);
      }
      // Body outline
      px(5, 8, C.black); px(5, 9, C.black); px(5, 10, C.black);
      px(6, 11, C.black); for (let x = 7; x < 21; x++) px(x, 11, C.black);
      px(21, 10, C.black); px(22, 9, C.black); px(22, 8, C.black);

      // Paws
      px(6, 10, C.grayLight); px(7, 10, C.grayLight);

      // Tail
      px(21, 8, C.gray); px(22, 7, C.gray); px(23, 6, C.gray); px(24, 5, C.gray);
      px(24, 4, C.black); px(25, 5, C.black);

      // Zzz
      if (Math.floor(frame / 20) % 2 === 0) {
        px(18, 2, C.black); px(19, 2, C.black); px(19, 3, C.black); px(18, 4, C.black); px(19, 4, C.black);
      }

    } else if (state === 'lying' || state === 'idle' || state === 'grooming') {
      // LYING POSE - matching reference image exactly!

      // Left ear
      px(4, 1, C.black); px(5, 0, C.black); px(6, 0, C.black); px(7, 1, C.black);
      px(5, 1, C.gray); px(6, 1, C.gray);
      px(5, 2, C.grayDark); px(6, 2, C.grayDark);

      // Right ear
      px(12, 1, C.black); px(13, 0, C.black); px(14, 0, C.black); px(15, 1, C.black);
      px(13, 1, C.gray); px(14, 1, C.gray);
      px(13, 2, C.grayDark); px(14, 2, C.grayDark);

      // Head - round shape
      for (let y = 2; y < 8; y++) {
        for (let x = 4; x < 16; x++) {
          if (y === 2 && (x < 6 || x > 13)) continue;
          if (y === 7 && (x < 6 || x > 13)) continue;
          px(x, y, C.gray);
        }
      }

      // Head outline
      px(3, 3, C.black); px(3, 4, C.black); px(3, 5, C.black); px(3, 6, C.black);
      px(16, 3, C.black); px(16, 4, C.black); px(16, 5, C.black); px(16, 6, C.black);
      px(4, 2, C.black); px(5, 2, C.black); px(14, 2, C.black); px(15, 2, C.black);
      px(4, 7, C.black); px(5, 7, C.black); px(14, 7, C.black); px(15, 7, C.black);

      // Eyes - yellow squares like reference
      px(7, 4, C.yellow); px(8, 4, C.yellow);
      px(7, 5, C.yellow); px(8, 5, C.yellow);
      px(11, 4, C.yellow); px(12, 4, C.yellow);
      px(11, 5, C.yellow); px(12, 5, C.yellow);

      // Eye outline
      px(6, 4, C.black); px(6, 5, C.black); px(9, 4, C.black); px(9, 5, C.black);
      px(7, 3, C.black); px(8, 3, C.black); px(7, 6, C.black); px(8, 6, C.black);
      px(10, 4, C.black); px(10, 5, C.black); px(13, 4, C.black); px(13, 5, C.black);
      px(11, 3, C.black); px(12, 3, C.black); px(11, 6, C.black); px(12, 6, C.black);

      // Nose
      px(9, 6, C.pink); px(10, 6, C.pink);

      // Collar - blue with yellow bell
      for (let x = 5; x < 15; x++) px(x, 8, C.blue);
      px(9, 9, C.yellow); px(10, 9, C.yellow);

      // Body lying down
      for (let y = 9; y < 13; y++) {
        for (let x = 4; x < 22; x++) {
          px(x, y, C.gray);
        }
      }

      // Body outline
      px(3, 9, C.black); px(3, 10, C.black); px(3, 11, C.black); px(3, 12, C.black);
      for (let x = 4; x < 22; x++) px(x, 13, C.black);
      px(22, 9, C.black); px(22, 10, C.black); px(22, 11, C.black); px(22, 12, C.black);

      // Front paws extended
      px(2, 12, C.gray); px(3, 12, C.gray);
      px(1, 13, C.black); px(2, 13, C.black); px(3, 13, C.black); px(4, 13, C.black);

      // Back paw
      px(18, 13, C.gray); px(19, 13, C.gray);
      px(17, 14, C.black); px(18, 14, C.black); px(19, 14, C.black); px(20, 14, C.black);

      // Tail curved up
      const ty = tailWag;
      px(22, 10, C.gray); px(23, 9, C.gray); px(24, 8 + ty, C.gray); px(25, 7 + ty, C.gray);
      px(26, 6 + ty, C.gray); px(26, 5 + ty, C.gray);
      px(27, 5 + ty, C.black); px(27, 6 + ty, C.black);

    } else if (state === 'walking' || state === 'running') {
      // Walking/running - animated legs
      const speed = state === 'running' ? 2 : 1;
      const legAnim = Math.floor(frame / (8 / speed)) % 4;

      // Ears
      px(3, 0, C.black); px(4, 0, C.gray); px(5, 0, C.gray); px(6, 0, C.black);
      px(4, 1, C.grayDark);
      px(10, 0, C.black); px(11, 0, C.gray); px(12, 0, C.gray); px(13, 0, C.black);
      px(11, 1, C.grayDark);

      // Head
      for (let y = 1; y < 7; y++) {
        for (let x = 3; x < 14; x++) {
          if (y === 1 && (x < 5 || x > 11)) continue;
          if (y === 6 && (x < 5 || x > 11)) continue;
          px(x, y, C.gray);
        }
      }

      // Head outline
      px(2, 2, C.black); px(2, 3, C.black); px(2, 4, C.black); px(2, 5, C.black);
      px(14, 2, C.black); px(14, 3, C.black); px(14, 4, C.black); px(14, 5, C.black);

      // Eyes
      px(5, 3, C.yellow); px(6, 3, C.yellow); px(5, 4, C.yellow); px(6, 4, C.yellow);
      px(10, 3, C.yellow); px(11, 3, C.yellow); px(10, 4, C.yellow); px(11, 4, C.yellow);

      // Nose
      px(8, 5, C.pink);

      // Collar
      for (let x = 4; x < 13; x++) px(x, 7, C.blue);
      px(8, 8, C.yellow);

      // Body
      for (let y = 8; y < 12; y++) {
        for (let x = 4; x < 16; x++) {
          px(x, y, C.gray);
        }
      }

      // Legs animated
      const frontLegX = legAnim < 2 ? 5 : 6;
      const backLegX = legAnim < 2 ? 13 : 12;
      const frontLegY = legAnim === 1 || legAnim === 3 ? 11 : 12;
      const backLegY = legAnim === 0 || legAnim === 2 ? 11 : 12;

      px(frontLegX, frontLegY, C.gray);
      px(frontLegX, frontLegY + 1, C.gray);
      px(frontLegX, frontLegY + 2, C.black);

      px(backLegX, backLegY, C.gray);
      px(backLegX, backLegY + 1, C.gray);
      px(backLegX, backLegY + 2, C.black);

      // Tail
      px(16, 9, C.gray); px(17, 8 + tailWag, C.gray); px(18, 7 + tailWag, C.gray);
      px(19, 6 + tailWag, C.black);

    } else if (state === 'stalking') {
      // Low crouch
      // Ears flat
      px(2, 3, C.black); px(3, 2, C.gray); px(4, 3, C.black);
      px(12, 3, C.black); px(13, 2, C.gray); px(14, 3, C.black);

      // Head low
      for (let y = 3; y < 8; y++) {
        for (let x = 3; x < 15; x++) {
          px(x, y, C.gray);
        }
      }

      // Intense eyes
      px(5, 5, C.yellow); px(6, 5, C.yellow);
      px(11, 5, C.yellow); px(12, 5, C.yellow);
      px(6, 5, C.black); px(11, 5, C.black); // Pupils focused

      // Body low
      for (let x = 3; x < 18; x++) {
        px(x, 9, C.gray);
        px(x, 10, C.gray);
      }

      // Legs ready
      px(3, 11, C.gray); px(4, 11, C.gray);
      px(15, 11, C.gray); px(16, 11, C.gray);

      // Tail twitching
      const twitch = Math.sin(frame * 0.4) * 2;
      px(18, 9, C.gray); px(19, 8 + twitch, C.gray); px(20, 7 + twitch, C.black);

    } else if (state === 'pouncing' || state === 'jumping') {
      // Mid-air pounce!
      // Ears back
      px(1, 2, C.black); px(2, 1, C.gray); px(3, 2, C.black);

      // Head forward
      for (let y = 1; y < 6; y++) {
        for (let x = 2; x < 12; x++) {
          px(x, y, C.gray);
        }
      }

      // Wide eyes
      px(4, 3, C.yellow); px(5, 3, C.yellow); px(4, 4, C.yellow); px(5, 4, C.yellow);
      px(8, 3, C.yellow); px(9, 3, C.yellow); px(8, 4, C.yellow); px(9, 4, C.yellow);

      // Open mouth
      px(6, 5, C.pink); px(7, 5, C.pink);

      // Stretched body
      for (let x = 5; x < 20; x++) {
        px(x, 7, C.gray);
        px(x, 8, C.gray);
      }

      // Front legs forward
      px(3, 8, C.gray); px(4, 8, C.gray);
      px(2, 9, C.black); px(3, 9, C.black);

      // Back legs pushing
      px(18, 9, C.gray); px(19, 9, C.gray);
      px(19, 10, C.black); px(20, 10, C.black);

      // Tail streaming
      px(20, 7, C.gray); px(21, 6, C.gray); px(22, 5, C.gray); px(23, 4, C.black);

    } else if (state === 'eating') {
      // Head down eating
      // Ears
      px(4, 0, C.black); px(5, 0, C.gray); px(6, 0, C.black);
      px(11, 0, C.black); px(12, 0, C.gray); px(13, 0, C.black);

      // Head tilted down
      for (let y = 1; y < 7; y++) {
        for (let x = 3; x < 14; x++) {
          px(x, y, C.gray);
        }
      }

      // Closed happy eyes
      px(5, 3, C.black); px(6, 3, C.black);
      px(10, 3, C.black); px(11, 3, C.black);

      // Nose in food
      px(8, 6, C.pink);

      // Licking animation
      if (frame % 12 < 6) {
        px(7, 7, C.pink); px(8, 7, C.pink); px(9, 7, C.pink);
      }

      // Body
      for (let y = 7; y < 12; y++) {
        for (let x = 5; x < 15; x++) {
          px(x, y, C.gray);
        }
      }

      // Collar
      for (let x = 5; x < 14; x++) px(x, 7, C.blue);

      // Legs
      px(5, 11, C.gray); px(6, 11, C.gray); px(5, 12, C.black); px(6, 12, C.black);
      px(12, 11, C.gray); px(13, 11, C.gray); px(12, 12, C.black); px(13, 12, C.black);

      // Happy tail
      px(15, 9, C.gray); px(16, 8 + tailWag, C.gray); px(17, 7 + tailWag, C.black);

    } else if (state === 'caught_cursor') {
      // Running with cursor in mouth!
      const bounce = Math.abs(Math.sin(frame * 0.4)) * 3;
      const by = -bounce;

      // Ears
      px(3, by + 0, C.black); px(4, by + 0, C.gray); px(5, by + 0, C.black);
      px(10, by + 0, C.black); px(11, by + 0, C.gray); px(12, by + 0, C.black);

      // Head
      for (let y = 1; y < 6; y++) {
        for (let x = 3; x < 13; x++) {
          px(x, by + y, C.gray);
        }
      }

      // Smug eyes
      px(5, by + 3, C.yellow); px(6, by + 3, C.black);
      px(9, by + 3, C.black); px(10, by + 3, C.yellow);

      // CURSOR IN MOUTH!
      px(6, by + 5, C.white); px(7, by + 5, C.white);
      px(7, by + 6, C.white); px(8, by + 6, C.black);
      px(8, by + 7, C.black);

      // Body
      for (let x = 4; x < 14; x++) {
        px(x, by + 7, C.gray);
        px(x, by + 8, C.gray);
      }

      // Running legs
      const legFrame = Math.floor(frame / 3) % 4;
      if (legFrame < 2) {
        px(4, by + 9, C.gray); px(5, by + 10, C.black);
        px(12, by + 9, C.gray); px(13, by + 10, C.black);
      } else {
        px(5, by + 9, C.gray); px(4, by + 10, C.black);
        px(13, by + 9, C.gray); px(12, by + 10, C.black);
      }

      // Tail streaming
      px(14, by + 7, C.gray); px(15, by + 6, C.gray); px(16, by + 5, C.gray); px(17, by + 4, C.black);
    }

    ctx.restore();
  }, [frame, state, facing]);

  // Draw pixelated ball
  useEffect(() => {
    const canvas = ballCanvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const s = 3;
    const px = (x: number, y: number, c: string) => {
      ctx.fillStyle = c;
      ctx.fillRect(x * s, y * s, s, s);
    };

    // Red ball with shine
    const ballC = { dark: '#8b0000', main: '#dc143c', light: '#ff6b6b', shine: '#ffcccc' };

    // Ball shape
    for (let y = 1; y < 9; y++) {
      const w = y < 2 || y > 7 ? 4 : y < 3 || y > 6 ? 6 : 8;
      const sx = 5 - w / 2;
      for (let x = 0; x < w; x++) {
        px(sx + x, y, ballC.main);
      }
    }

    // Shading
    px(2, 6, ballC.dark); px(2, 7, ballC.dark); px(3, 7, ballC.dark);
    px(6, 6, ballC.dark); px(7, 6, ballC.dark); px(6, 7, ballC.dark);

    // Shine
    px(3, 2, ballC.light); px(4, 2, ballC.light); px(3, 3, ballC.shine);

    // Outline
    px(2, 0, C.black); px(3, 0, C.black); px(4, 0, C.black); px(5, 0, C.black);
    px(1, 1, C.black); px(6, 1, C.black);
    px(0, 2, C.black); px(7, 2, C.black);
    px(0, 7, C.black); px(7, 7, C.black);
    px(1, 8, C.black); px(6, 8, C.black);
    px(2, 9, C.black); px(3, 9, C.black); px(4, 9, C.black); px(5, 9, C.black);

  }, []);

  // Draw pixelated bowl
  useEffect(() => {
    const canvas = bowlCanvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const s = 2;
    const px = (x: number, y: number, c: string) => {
      ctx.fillStyle = c;
      ctx.fillRect(x * s, y * s, s, s);
    };

    // Bowl colors
    const bowlC = { rim: '#ffa500', rimDark: '#cc8400', inside: '#8b4513', food: '#cd853f', foodDark: '#8b4513' };

    // Rim
    for (let x = 2; x < 23; x++) {
      px(x, 0, bowlC.rim);
      px(x, 1, bowlC.rimDark);
    }

    // Bowl body
    for (let y = 2; y < 12; y++) {
      const indent = Math.floor(y / 4);
      for (let x = 2 + indent; x < 23 - indent; x++) {
        px(x, y, x === 2 + indent || x === 22 - indent ? bowlC.rimDark : bowlC.rim);
      }
    }

    // Inside
    for (let y = 2; y < 10; y++) {
      const indent = Math.floor(y / 4) + 2;
      for (let x = 2 + indent; x < 23 - indent; x++) {
        px(x, y, bowlC.inside);
      }
    }

    // Food
    if (foodAmount > 0) {
      const height = Math.floor((foodAmount / 100) * 5);
      for (let y = 0; y < height; y++) {
        const fy = 8 - y;
        const indent = Math.floor(fy / 4) + 3;
        for (let x = 2 + indent; x < 23 - indent; x++) {
          px(x, fy, (x + y) % 2 === 0 ? bowlC.food : bowlC.foodDark);
        }
      }
    }

    // FIFI text
    const textY = 13;
    // F
    px(7, textY, bowlC.rim); px(8, textY, bowlC.rim); px(7, textY + 1, bowlC.rim); px(7, textY + 2, bowlC.rim);
    // I
    px(10, textY, bowlC.rim); px(10, textY + 1, bowlC.rim); px(10, textY + 2, bowlC.rim);
    // F
    px(12, textY, bowlC.rim); px(13, textY, bowlC.rim); px(12, textY + 1, bowlC.rim); px(12, textY + 2, bowlC.rim);
    // I
    px(15, textY, bowlC.rim); px(15, textY + 1, bowlC.rim); px(15, textY + 2, bowlC.rim);

  }, [foodAmount]);

  // Draw food packet (plic)
  useEffect(() => {
    const canvas = plicCanvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const s = 2;
    const px = (x: number, y: number, c: string) => {
      ctx.fillStyle = c;
      ctx.fillRect(x * s, y * s, s, s);
    };

    // Packet colors
    const pC = { main: '#8b5cf6', dark: '#6d28d9', light: '#a78bfa', orange: '#f97316' };

    // Packet body
    for (let y = 0; y < 18; y++) {
      for (let x = 0; x < 12; x++) {
        px(x, y, pC.main);
      }
    }

    // Shading
    for (let y = 0; y < 18; y++) {
      px(0, y, pC.dark);
      px(11, y, pC.light);
    }

    // Top torn edge
    px(1, 0, pC.light); px(3, 0, pC.light); px(5, 0, pC.light); px(7, 0, pC.light); px(9, 0, pC.light);

    // Cat face on packet
    px(3, 5, C.black); px(4, 5, C.black); // Eye
    px(7, 5, C.black); px(8, 5, C.black); // Eye
    px(5, 7, pC.orange); px(6, 7, pC.orange); // Nose
    px(4, 8, C.black); px(5, 8, C.black); px(6, 8, C.black); px(7, 8, C.black); // Mouth

    // "PLIC" text
    px(2, 11, C.white); px(3, 11, C.white); px(2, 12, C.white);
    px(5, 11, C.white); px(5, 12, C.white); px(5, 13, C.white); px(6, 13, C.white);
    px(8, 11, C.white); px(8, 12, C.white); px(8, 13, C.white);
    px(10, 11, C.white); px(10, 12, C.white); px(10, 13, C.white);

    // Pouring animation
    if (pouringFood) {
      const pourFrame = frame % 10;
      for (let i = 0; i < 4; i++) {
        const py = 18 + i * 3 + pourFrame;
        if (py < 35) {
          px(5 + (i % 2), py, C.brown);
          px(6 - (i % 2), py, C.orange);
        }
      }
    }

  }, [frame, pouringFood]);

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
          filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))',
          userSelect: 'none',
        }}
      >
        <canvas
          ref={catCanvas}
          width={120}
          height={70}
          style={{ imageRendering: 'pixelated' }}
        />

        {message && (
          <div style={{
            position: 'absolute',
            top: '-40px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'white',
            padding: '6px 12px',
            borderRadius: '12px',
            border: '2px solid #8b5cf6',
            fontSize: '12px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            {message}
          </div>
        )}

        {stats.hunger > 60 && state !== 'sleeping' && state !== 'eating' && (
          <div style={{ position: 'absolute', top: '-18px', left: 0, fontSize: '18px' }}>
            {stats.hunger > 80 ? '😾' : '💭'}
          </div>
        )}
      </div>

      {/* Cursor when caught */}
      {hasCursor && (
        <div style={{
          position: 'fixed',
          left: pos.x + 28,
          top: pos.y + 24,
          zIndex: 999999,
          pointerEvents: 'none',
          fontSize: '16px',
        }}>
          🖱️
        </div>
      )}

      {/* Pixelated Ball */}
      <div
        onClick={kickBall}
        style={{
          position: 'fixed',
          left: ballPos.x,
          top: ballPos.y,
          zIndex: 100,
          cursor: 'pointer',
          transform: ballActive ? `rotate(${frame * 12}deg)` : 'none',
        }}
        title="Click pentru joacă!"
      >
        <canvas
          ref={ballCanvas}
          width={30}
          height={30}
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Food area */}
      <div style={{
        position: 'fixed',
        right: '15px',
        bottom: '75px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        zIndex: 100,
      }}>
        {/* Plic (food packet) - clickable */}
        <div
          onClick={pourFood}
          style={{
            cursor: bowlFilled || pouringFood ? 'not-allowed' : 'pointer',
            opacity: bowlFilled ? 0.5 : 1,
            transition: 'transform 0.1s',
            transform: pouringFood ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
          title="Click pentru a turna mâncare!"
        >
          <canvas
            ref={plicCanvas}
            width={24}
            height={70}
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Pixelated Bowl */}
        <div
          onClick={pourFood}
          style={{ cursor: bowlFilled ? 'default' : 'pointer' }}
          title={bowlFilled ? 'Plin!' : 'Click pentru mâncare!'}
        >
          <canvas
            ref={bowlCanvas}
            width={50}
            height={36}
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </div>

      {/* Stats */}
      {showStats && (
        <div style={{
          position: 'fixed',
          right: '10px',
          bottom: '65px',
          backgroundColor: 'white',
          padding: '10px 14px',
          borderRadius: '10px',
          border: '2px solid #8b5cf6',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 10000,
          fontSize: '11px',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#7c3aed' }}>🐱 Fifi</div>
          {[
            { l: '🍽️', v: stats.hunger, c: stats.hunger > 70 ? '#ef4444' : '#22c55e' },
            { l: '💕', v: stats.happiness, c: '#ec4899' },
            { l: '⚡', v: stats.energy, c: '#eab308' },
          ].map(s => (
            <div key={s.l} style={{ marginBottom: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{s.l}</span><span>{Math.round(s.v)}%</span>
              </div>
              <div style={{ height: '5px', backgroundColor: '#e5e7eb', borderRadius: '2px' }}>
                <div style={{ height: '100%', width: `${s.v}%`, backgroundColor: s.c, borderRadius: '2px' }} />
              </div>
            </div>
          ))}
          <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '6px' }}>
            {state === 'sleeping' ? '😴 Doarme' :
             state === 'stalking' ? '👀 Pândește' :
             state === 'caught_cursor' ? '😼 Fuge cu cursorul!' :
             state === 'eating' ? '😋 Mănâncă' :
             state === 'jumping' ? '🦘 Sare!' :
             state === 'running' ? '🏃 Aleargă' :
             '😺 Relaxată'}
          </div>
        </div>
      )}

      <button
        onClick={() => setShowStats(s => !s)}
        style={{
          position: 'fixed',
          right: '140px',
          bottom: '14px',
          padding: '4px 8px',
          backgroundColor: showStats ? '#8b5cf6' : 'rgba(139,92,246,0.2)',
          color: showStats ? 'white' : '#7c3aed',
          border: '2px solid rgba(139,92,246,0.4)',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '11px',
          fontWeight: 'bold',
          zIndex: 31,
        }}
      >
        🐱 Fifi
      </button>
    </>
  );
};

export default Fifi;
