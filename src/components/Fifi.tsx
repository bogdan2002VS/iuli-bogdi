import React, { useState, useEffect, useRef, useCallback } from 'react';

// Fifi - A British Shorthair cat virtual pet
// Inspired by 90s game animation quality (Lion King 1994)
// Each sprite is carefully designed to represent real cat anatomy and movement

interface Vec2 {
  x: number;
  y: number;
}

type CatState =
  | 'sleeping'    // Curled up in a ball
  | 'waking'      // Stretching after sleep
  | 'sitting'     // Sitting upright
  | 'lying'       // Lying down relaxed
  | 'grooming'    // Licking paw, rubbing face
  | 'walking'     // Normal walk
  | 'running'     // Fast run
  | 'stalking'    // Low crouch, hunting
  | 'pouncing'    // Jump attack
  | 'eating'      // Head in bowl
  | 'playing'     // Batting at toy
  | 'held';       // Being picked up

interface CatStats {
  hunger: number;
  mood: number;
  energy: number;
}

const Fifi: React.FC = () => {
  // Position and state
  const [pos, setPos] = useState<Vec2>({ x: 250, y: 300 });
  const [state, setState] = useState<CatState>('lying');
  const [dir, setDir] = useState<1 | -1>(1); // 1 = right, -1 = left
  const [frame, setFrame] = useState(0);
  const [subFrame, setSubFrame] = useState(0);

  // Stats
  const [stats, setStats] = useState<CatStats>({ hunger: 25, mood: 75, energy: 60 });
  const [showStats, setShowStats] = useState(false);

  // Interaction
  const [held, setHeld] = useState(false);
  const [holdOffset, setHoldOffset] = useState<Vec2>({ x: 0, y: 0 });
  const [target, setTarget] = useState<Vec2 | null>(null);
  const [message, setMessage] = useState('');

  // Cursor stealing
  const [stealingCursor, setStealingCursor] = useState(false);
  const [cursorPos, setCursorPos] = useState<Vec2 | null>(null);
  const stealRef = useRef(false);

  // Ball
  const [ballPos, setBallPos] = useState<Vec2>({ x: 180, y: 380 });
  const [ballVel, setBallVel] = useState<Vec2>({ x: 0, y: 0 });
  const [ballMoving, setBallMoving] = useState(false);
  const [chasingBall, setChasingBall] = useState(false);

  // Food
  const [bowlFull, setBowlFull] = useState(false);
  const [foodLevel, setFoodLevel] = useState(0);
  const [pouring, setPouring] = useState(false);

  // Canvas refs
  const catRef = useRef<HTMLCanvasElement>(null);
  const ballRef = useRef<HTMLCanvasElement>(null);
  const bowlRef = useRef<HTMLCanvasElement>(null);
  const plicRef = useRef<HTMLCanvasElement>(null);

  // British Shorthair colors
  const FUR = '#7a8a99';
  const FUR_LIGHT = '#9aacbb';
  const FUR_DARK = '#5a6a79';
  const OUTLINE = '#1a1a1a';
  const EYE = '#e8b600';
  const EYE_PUPIL = '#1a1a1a';
  const NOSE = '#d4a5a5';
  const TONGUE = '#e89090';
  const COLLAR = '#4a90d9';
  const BELL = '#ffd700';
  const INNER_EAR = '#c9a0a0';

  // Animation timing - smooth like Lion King
  useEffect(() => {
    let id: number;
    let last = 0;
    const tick = (t: number) => {
      if (t - last > 100) { // 10fps for sprite animation (like classic games)
        setFrame(f => f + 1);
        last = t;
      }
      setSubFrame(sf => sf + 1); // For smooth position interpolation
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  // Stats decay
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(s => ({
        hunger: Math.min(100, s.hunger + 1),
        mood: Math.max(0, s.mood - (s.hunger > 70 ? 1 : 0.3)),
        energy: state === 'sleeping' ? Math.min(100, s.energy + 2) : Math.max(0, s.energy - 0.15),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [state]);

  // Behavior AI
  useEffect(() => {
    if (held || stealingCursor || chasingBall) return;

    const ai = setInterval(() => {
      // Tired -> sleep
      if (stats.energy < 15 && state !== 'sleeping') {
        setState('sleeping');
        setMessage('zzz...');
        return;
      }

      // Rested -> wake up
      if (state === 'sleeping' && stats.energy > 90) {
        setState('waking');
        setMessage('*stretch*');
        setTimeout(() => setState('sitting'), 2000);
        return;
      }

      // Hungry + food -> eat
      if (stats.hunger > 45 && bowlFull && state !== 'eating' && state !== 'sleeping') {
        setTarget({ x: window.innerWidth - 90, y: window.innerHeight - 160 });
        setState('running');
        return;
      }

      // Random behaviors when idle
      if ((state === 'sitting' || state === 'lying') && Math.random() < 0.15) {
        const r = Math.random();
        if (r < 0.3) {
          setState('grooming');
          setMessage('*lick lick*');
          setTimeout(() => setState('sitting'), 4000);
        } else if (r < 0.5) {
          setState(state === 'sitting' ? 'lying' : 'sitting');
        } else {
          // Wander
          setTarget({
            x: 50 + Math.random() * (window.innerWidth - 200),
            y: 50 + Math.random() * (window.innerHeight - 250)
          });
          setState('walking');
        }
      }
    }, 2500);

    return () => clearInterval(ai);
  }, [state, stats, held, bowlFull, stealingCursor, chasingBall]);

  // Movement
  useEffect(() => {
    if (!target || state === 'sleeping' || held) return;

    const move = setInterval(() => {
      setPos(p => {
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 10) {
          setTarget(null);
          // Arrived at bowl?
          if (bowlFull && target.x > window.innerWidth - 150) {
            setState('eating');
            setMessage('nom nom~');
            const eat = setInterval(() => {
              setFoodLevel(f => {
                if (f <= 0) {
                  clearInterval(eat);
                  setBowlFull(false);
                  setState('sitting');
                  setStats(s => ({ ...s, hunger: Math.max(0, s.hunger - 40), mood: Math.min(100, s.mood + 10) }));
                  setMessage('mulțumesc! 💕');
                  return 0;
                }
                return f - 8;
              });
            }, 120);
          } else {
            setState('sitting');
          }
          return p;
        }

        setDir(dx > 0 ? 1 : -1);
        const speed = state === 'running' ? 5 : 2.5;
        return {
          x: p.x + (dx / dist) * speed,
          y: p.y + (dy / dist) * speed
        };
      });
    }, 30);

    return () => clearInterval(move);
  }, [target, state, held, bowlFull]);

  // Cursor stealing
  useEffect(() => {
    if (state === 'sleeping' || state === 'eating' || held || stealRef.current) return;

    const attempt = setInterval(() => {
      const prob = stats.hunger > 80 ? 0.2 : stats.hunger > 60 ? 0.08 : 0.02;

      if (Math.random() < prob) {
        stealRef.current = true;
        setStealingCursor(true);
        setState('stalking');
        setMessage('...');

        const track = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
        document.addEventListener('mousemove', track);

        // Stalk phase
        setTimeout(() => {
          setState('pouncing');
          setMessage('MIAU!');

          // Catch!
          setTimeout(() => {
            document.body.style.cursor = 'none';
            const s = document.createElement('style');
            s.id = 'hide-cursor';
            s.textContent = '* { cursor: none !important; }';
            document.head.appendChild(s);

            setMessage('mrrr~ 😼');

            // Run away
            setTimeout(() => {
              setStealingCursor(false);
              stealRef.current = false;
              document.body.style.cursor = '';
              document.getElementById('hide-cursor')?.remove();
              setCursorPos(null);
              setState('sitting');
              setMessage('hehe~');
              document.removeEventListener('mousemove', track);
            }, 3500);
          }, 350);
        }, 1800);
      }
    }, 3000);

    return () => clearInterval(attempt);
  }, [state, stats.hunger, held]);

  // Stalking movement
  useEffect(() => {
    if (!stealingCursor || !cursorPos || state !== 'stalking') return;

    const stalk = setInterval(() => {
      setPos(p => {
        const dx = cursorPos.x - p.x - 30;
        const dy = cursorPos.y - p.y - 20;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 60) return p;
        setDir(dx > 0 ? 1 : -1);
        return { x: p.x + (dx / dist) * 1.5, y: p.y + (dy / dist) * 1.5 };
      });
    }, 40);

    return () => clearInterval(stalk);
  }, [stealingCursor, cursorPos, state]);

  // Running with stolen cursor
  useEffect(() => {
    if (!stealingCursor || !cursorPos || state === 'stalking') return;

    const run = setInterval(() => {
      setPos(p => {
        const dx = cursorPos.x - p.x;
        const dy = cursorPos.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 100) return p;
        const angle = Math.atan2(dy, dx) + Math.PI;
        setDir(Math.cos(angle) > 0 ? 1 : -1);
        return {
          x: Math.max(30, Math.min(window.innerWidth - 100, p.x + Math.cos(angle) * 6)),
          y: Math.max(30, Math.min(window.innerHeight - 150, p.y + Math.sin(angle) * 6))
        };
      });
    }, 25);

    return () => clearInterval(run);
  }, [stealingCursor, cursorPos, state]);

  // Ball physics
  useEffect(() => {
    if (!ballMoving) return;

    const phys = setInterval(() => {
      setBallPos(p => {
        let nx = p.x + ballVel.x;
        let ny = p.y + ballVel.y;
        let vx = ballVel.x * 0.98;
        let vy = ballVel.y + 0.4;

        if (nx < 10 || nx > window.innerWidth - 40) vx = -vx * 0.7;
        if (ny > window.innerHeight - 90) {
          ny = window.innerHeight - 90;
          vy = -vy * 0.6;
          vx *= 0.92;
        }

        nx = Math.max(10, Math.min(window.innerWidth - 40, nx));
        setBallVel({ x: vx, y: vy });

        if (Math.abs(vx) < 0.3 && Math.abs(vy) < 0.3 && ny >= window.innerHeight - 95) {
          setBallMoving(false);
        }

        return { x: nx, y: ny };
      });
    }, 16);

    return () => clearInterval(phys);
  }, [ballMoving, ballVel]);

  // Chase ball
  useEffect(() => {
    if (!chasingBall || state === 'sleeping') return;

    const chase = setInterval(() => {
      const dx = ballPos.x - pos.x - 15;
      const dy = ballPos.y - pos.y - 10;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 40) {
        setChasingBall(false);
        setState('pouncing');
        setMessage('HAP!');
        setBallVel({ x: (Math.random() - 0.5) * 15, y: -10 - Math.random() * 6 });
        setBallMoving(true);
        setStats(s => ({ ...s, mood: Math.min(100, s.mood + 8), energy: Math.max(0, s.energy - 3) }));

        setTimeout(() => {
          setState('sitting');
          if (stats.energy > 25 && Math.random() < 0.5) {
            setTimeout(() => {
              setChasingBall(true);
              setState('running');
            }, 400);
          }
        }, 350);
      } else {
        setDir(dx > 0 ? 1 : -1);
        setPos(p => ({
          x: p.x + (dx / dist) * 4,
          y: p.y + (dy / dist) * 4
        }));
      }
    }, 30);

    return () => clearInterval(chase);
  }, [chasingBall, ballPos, pos, state, stats.energy]);

  // Drag
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setHeld(true);
    setHoldOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    setState('held');
    setMessage('miau~!');
    setTarget(null);
  };

  useEffect(() => {
    if (!held) return;
    const move = (e: MouseEvent) => {
      setPos({
        x: Math.max(10, Math.min(window.innerWidth - 90, e.clientX - holdOffset.x)),
        y: Math.max(10, Math.min(window.innerHeight - 120, e.clientY - holdOffset.y))
      });
    };
    const up = () => {
      setHeld(false);
      setState('sitting');
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
  }, [held, holdOffset]);

  // Pour food
  const pourFood = useCallback(() => {
    if (bowlFull || pouring) return;
    setPouring(true);
    setMessage('mâncare!');
    let amt = 0;
    const pour = setInterval(() => {
      amt += 10;
      setFoodLevel(amt);
      if (amt >= 100) {
        clearInterval(pour);
        setPouring(false);
        setBowlFull(true);
        if (stats.hunger > 30 && (state === 'sitting' || state === 'lying')) {
          setTarget({ x: window.innerWidth - 90, y: window.innerHeight - 160 });
          setState('running');
        }
      }
    }, 60);
  }, [bowlFull, pouring, stats.hunger, state]);

  // Kick ball
  const kickBall = useCallback(() => {
    setBallVel({ x: (Math.random() - 0.5) * 18, y: -12 - Math.random() * 6 });
    setBallMoving(true);
    if ((state === 'sitting' || state === 'lying') && stats.energy > 15) {
      setChasingBall(true);
      setState('running');
      setMessage('minge!');
    }
  }, [state, stats.energy]);

  // Clear message
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 2500);
    return () => clearTimeout(t);
  }, [message]);

  // ============================================
  // SPRITE DRAWING - Carefully designed like 90s games
  // Each pose studied from real cat reference
  // ============================================

  useEffect(() => {
    const c = catRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, c.width, c.height);

    const S = 3; // Pixel size
    const px = (x: number, y: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(x * S, y * S, S, S);
    };

    ctx.save();
    if (dir === -1) {
      ctx.scale(-1, 1);
      ctx.translate(-c.width, 0);
    }

    const anim = Math.floor(frame / 2) % 4; // Animation frame

    // ===================
    // SLEEPING - Curled into a ball (real cat sleep pose)
    // ===================
    if (state === 'sleeping') {
      // Body - circular curl
      for (let y = 6; y <= 13; y++) {
        for (let x = 4; x <= 18; x++) {
          const cx = 11, cy = 10;
          const dist = Math.sqrt((x-cx)*(x-cx) + (y-cy)*(y-cy)*0.8);
          if (dist < 5.5 && dist > 0) px(x, y, FUR);
        }
      }

      // Head resting on body
      for (let y = 4; y <= 9; y++) {
        for (let x = 12; x <= 20; x++) {
          if (y === 4 && (x < 14 || x > 18)) continue;
          if (y === 9 && (x < 14 || x > 18)) continue;
          px(x, y, FUR);
        }
      }

      // Ear (one visible, folded)
      px(18, 3, FUR); px(19, 3, FUR); px(19, 4, INNER_EAR);

      // Closed eyes (curved lines)
      px(15, 6, OUTLINE); px(16, 6, OUTLINE);

      // Nose tucked
      px(16, 7, NOSE);

      // Tail wrapped around
      px(5, 8, FUR); px(4, 9, FUR); px(4, 10, FUR); px(5, 11, FUR);
      px(3, 9, FUR_DARK); px(3, 10, FUR_DARK);

      // Paw visible
      px(8, 12, FUR_LIGHT); px(9, 12, FUR_LIGHT);

      // Outline
      for (let x = 5; x <= 17; x++) px(x, 14, OUTLINE);
      px(4, 13, OUTLINE); px(18, 13, OUTLINE);
      px(3, 11, OUTLINE); px(3, 12, OUTLINE);

      // Zzz animation
      if (frame % 20 < 10) {
        px(22, 2, OUTLINE); px(23, 2, OUTLINE);
        px(23, 3, OUTLINE);
        px(22, 4, OUTLINE); px(23, 4, OUTLINE);
      }
    }

    // ===================
    // GROOMING - Sitting, licking paw (real cat grooming behavior)
    // ===================
    else if (state === 'grooming') {
      const lickFrame = Math.floor(frame / 3) % 3;

      // Back body (sitting)
      for (let y = 12; y <= 18; y++) {
        const w = y < 14 ? 8 : y < 16 ? 10 : 8;
        const sx = 10 - w/2;
        for (let x = 0; x < w; x++) px(sx + x, y, FUR);
      }

      // Tail curled around
      px(14, 16, FUR); px(15, 15, FUR); px(16, 14, FUR); px(17, 14, FUR);
      px(18, 15, FUR_DARK);

      // Head tilted toward paw
      for (let y = 5; y <= 11; y++) {
        for (let x = 5; x <= 14; x++) {
          if (y === 5 && (x < 7 || x > 12)) continue;
          if (y === 11 && (x < 7 || x > 12)) continue;
          px(x, y, FUR);
        }
      }

      // Ears
      px(6, 3, FUR); px(7, 3, FUR); px(7, 4, INNER_EAR);
      px(12, 3, FUR); px(13, 3, FUR); px(12, 4, INNER_EAR);
      px(5, 4, OUTLINE); px(8, 3, OUTLINE); px(11, 3, OUTLINE); px(14, 4, OUTLINE);

      // Eyes (looking at paw)
      px(7, 7, EYE); px(8, 7, EYE_PUPIL);
      px(11, 7, EYE_PUPIL); px(12, 7, EYE);

      // Raised paw being licked
      px(3, 9, FUR_LIGHT); px(4, 9, FUR_LIGHT);
      px(3, 10, FUR_LIGHT); px(4, 10, FUR_LIGHT);
      px(2, 10, OUTLINE); px(2, 11, OUTLINE);

      // Tongue licking paw
      if (lickFrame === 0) {
        px(5, 10, TONGUE);
      } else if (lickFrame === 1) {
        px(4, 11, TONGUE); px(5, 11, TONGUE);
      } else {
        px(5, 10, TONGUE); px(5, 11, TONGUE);
      }

      // Nose
      px(9, 9, NOSE); px(10, 9, NOSE);

      // Sitting legs
      px(6, 18, FUR_LIGHT); px(7, 18, FUR_LIGHT);
      px(12, 18, FUR_LIGHT); px(13, 18, FUR_LIGHT);
      for (let x = 5; x <= 14; x++) px(x, 19, OUTLINE);
    }

    // ===================
    // SITTING - Upright, alert (classic cat sit)
    // ===================
    else if (state === 'sitting' || state === 'held') {
      // Body
      for (let y = 10; y <= 17; y++) {
        const w = y < 12 ? 7 : y < 15 ? 9 : 7;
        const sx = 10 - w/2;
        for (let x = 0; x < w; x++) {
          px(sx + x, y, x === 0 || x === w-1 ? FUR_DARK : FUR);
        }
      }

      // Head
      for (let y = 3; y <= 9; y++) {
        for (let x = 5; x <= 15; x++) {
          if (y === 3 && (x < 7 || x > 13)) continue;
          if (y === 9 && (x < 7 || x > 13)) continue;
          px(x, y, x === 5 || x === 15 ? FUR_DARK : FUR);
        }
      }

      // Ears with inner pink
      px(6, 1, FUR); px(7, 1, FUR); px(7, 2, INNER_EAR); px(8, 2, FUR);
      px(12, 1, FUR); px(13, 1, FUR); px(13, 2, FUR); px(12, 2, INNER_EAR);
      px(5, 2, OUTLINE); px(9, 1, OUTLINE); px(11, 1, OUTLINE); px(14, 2, OUTLINE);

      // Eyes
      px(7, 5, EYE); px(8, 5, EYE); px(8, 6, EYE_PUPIL);
      px(12, 5, EYE); px(13, 5, EYE); px(12, 6, EYE_PUPIL);

      // Nose
      px(10, 7, NOSE);

      // Collar
      for (let x = 7; x <= 13; x++) px(x, 10, COLLAR);
      px(10, 11, BELL);

      // Front paws
      px(7, 17, FUR_LIGHT); px(8, 17, FUR_LIGHT);
      px(12, 17, FUR_LIGHT); px(13, 17, FUR_LIGHT);

      // Tail
      px(14, 14, FUR); px(15, 13, FUR); px(16, 12, FUR); px(17, 11, FUR_DARK);

      // Outline
      for (let x = 6; x <= 14; x++) px(x, 18, OUTLINE);
      px(4, 4, OUTLINE); px(4, 5, OUTLINE); px(4, 6, OUTLINE); px(4, 7, OUTLINE); px(4, 8, OUTLINE);
      px(16, 4, OUTLINE); px(16, 5, OUTLINE); px(16, 6, OUTLINE); px(16, 7, OUTLINE); px(16, 8, OUTLINE);
    }

    // ===================
    // LYING - Relaxed on belly (sphinx pose)
    // ===================
    else if (state === 'lying') {
      // Body flat
      for (let y = 10; y <= 14; y++) {
        for (let x = 3; x <= 20; x++) {
          px(x, y, y === 10 ? FUR_LIGHT : FUR);
        }
      }

      // Head
      for (let y = 4; y <= 10; y++) {
        for (let x = 4; x <= 14; x++) {
          if (y === 4 && (x < 6 || x > 12)) continue;
          if (y === 10 && (x < 6 || x > 12)) continue;
          px(x, y, FUR);
        }
      }

      // Ears
      px(5, 2, FUR); px(6, 2, FUR); px(6, 3, INNER_EAR);
      px(12, 2, FUR); px(13, 2, FUR); px(12, 3, INNER_EAR);
      px(4, 3, OUTLINE); px(7, 2, OUTLINE); px(11, 2, OUTLINE); px(14, 3, OUTLINE);

      // Eyes
      px(6, 6, EYE); px(7, 6, EYE); px(7, 7, EYE_PUPIL);
      px(11, 6, EYE); px(12, 6, EYE); px(11, 7, EYE_PUPIL);

      // Nose
      px(9, 8, NOSE);

      // Collar
      for (let x = 6; x <= 12; x++) px(x, 10, COLLAR);
      px(9, 11, BELL);

      // Front paws extended
      px(2, 13, FUR_LIGHT); px(3, 13, FUR_LIGHT); px(4, 13, FUR_LIGHT);
      px(1, 14, OUTLINE); px(2, 14, OUTLINE); px(3, 14, OUTLINE);

      // Back paw
      px(17, 14, FUR_LIGHT); px(18, 14, FUR_LIGHT);

      // Tail curved up
      const tw = Math.sin(frame * 0.1) * 1.5;
      px(20, 12, FUR); px(21, 11 + tw, FUR); px(22, 10 + tw, FUR); px(23, 9 + tw, FUR_DARK);

      // Outline
      for (let x = 4; x <= 19; x++) px(x, 15, OUTLINE);
      px(2, 12, OUTLINE); px(3, 12, OUTLINE);
      px(20, 13, OUTLINE); px(19, 14, OUTLINE);
    }

    // ===================
    // WALKING - 4 frame walk cycle (diagonal gait like real cats)
    // ===================
    else if (state === 'walking') {
      // Body
      for (let y = 8; y <= 12; y++) {
        for (let x = 4; x <= 16; x++) {
          px(x, y, y === 8 ? FUR_LIGHT : FUR);
        }
      }

      // Head
      for (let y = 3; y <= 8; y++) {
        for (let x = 10; x <= 18; x++) {
          if (y === 3 && (x < 12 || x > 16)) continue;
          if (y === 8 && (x < 12 || x > 16)) continue;
          px(x, y, FUR);
        }
      }

      // Ears
      px(12, 1, FUR); px(13, 1, FUR); px(13, 2, INNER_EAR);
      px(16, 1, FUR); px(17, 1, FUR); px(16, 2, INNER_EAR);

      // Eyes
      px(12, 5, EYE); px(13, 5, EYE_PUPIL);
      px(15, 5, EYE_PUPIL); px(16, 5, EYE);

      // Nose
      px(14, 6, NOSE);

      // Collar
      for (let x = 11; x <= 15; x++) px(x, 8, COLLAR);

      // LEGS - Diagonal gait animation
      // Frame 0: Right front + Left back forward
      // Frame 1: Transition
      // Frame 2: Left front + Right back forward
      // Frame 3: Transition

      if (anim === 0) {
        // Right front forward, left front back
        px(14, 13, FUR); px(14, 14, FUR); px(14, 15, OUTLINE);
        px(11, 12, FUR); px(11, 13, FUR); px(11, 14, OUTLINE);
        // Left back forward, right back back
        px(8, 13, FUR); px(8, 14, FUR); px(8, 15, OUTLINE);
        px(5, 12, FUR); px(5, 13, FUR); px(5, 14, OUTLINE);
      } else if (anim === 1) {
        px(13, 12, FUR); px(13, 13, FUR); px(13, 14, OUTLINE);
        px(12, 12, FUR); px(12, 13, FUR); px(12, 14, OUTLINE);
        px(7, 12, FUR); px(7, 13, FUR); px(7, 14, OUTLINE);
        px(6, 12, FUR); px(6, 13, FUR); px(6, 14, OUTLINE);
      } else if (anim === 2) {
        px(11, 13, FUR); px(11, 14, FUR); px(11, 15, OUTLINE);
        px(14, 12, FUR); px(14, 13, FUR); px(14, 14, OUTLINE);
        px(5, 13, FUR); px(5, 14, FUR); px(5, 15, OUTLINE);
        px(8, 12, FUR); px(8, 13, FUR); px(8, 14, OUTLINE);
      } else {
        px(12, 12, FUR); px(12, 13, FUR); px(12, 14, OUTLINE);
        px(13, 12, FUR); px(13, 13, FUR); px(13, 14, OUTLINE);
        px(6, 12, FUR); px(6, 13, FUR); px(6, 14, OUTLINE);
        px(7, 12, FUR); px(7, 13, FUR); px(7, 14, OUTLINE);
      }

      // Tail
      const tw = Math.sin(frame * 0.15) * 2;
      px(4, 10, FUR); px(3, 9 + tw, FUR); px(2, 8 + tw, FUR_DARK);
    }

    // ===================
    // RUNNING - Faster, stretched pose
    // ===================
    else if (state === 'running') {
      const runFrame = Math.floor(frame / 1.5) % 4;
      const bounce = runFrame % 2 === 0 ? 0 : -1;

      // Body stretched
      for (let y = 7 + bounce; y <= 10 + bounce; y++) {
        for (let x = 3; x <= 17; x++) {
          px(x, y, FUR);
        }
      }

      // Head forward
      for (let y = 3 + bounce; y <= 7 + bounce; y++) {
        for (let x = 14; x <= 21; x++) {
          if (y === 3 + bounce && (x < 16 || x > 19)) continue;
          px(x, y, FUR);
        }
      }

      // Ears back
      px(15, 2 + bounce, FUR); px(16, 2 + bounce, INNER_EAR);
      px(19, 2 + bounce, FUR); px(20, 2 + bounce, INNER_EAR);

      // Eyes
      px(16, 4 + bounce, EYE); px(17, 4 + bounce, EYE_PUPIL);
      px(19, 4 + bounce, EYE_PUPIL); px(20, 4 + bounce, EYE);

      // Nose
      px(18, 5 + bounce, NOSE);

      // Running legs - gallop
      if (runFrame === 0) {
        // All legs stretched
        px(18, 10 + bounce, FUR); px(19, 11 + bounce, FUR); px(20, 12 + bounce, OUTLINE);
        px(15, 10 + bounce, FUR); px(14, 11 + bounce, FUR); px(13, 12 + bounce, OUTLINE);
        px(6, 10 + bounce, FUR); px(5, 11 + bounce, FUR); px(4, 12 + bounce, OUTLINE);
        px(9, 10 + bounce, FUR); px(10, 11 + bounce, FUR); px(11, 12 + bounce, OUTLINE);
      } else if (runFrame === 2) {
        // Legs gathered under
        px(16, 10 + bounce, FUR); px(16, 11 + bounce, FUR); px(16, 12 + bounce, OUTLINE);
        px(14, 10 + bounce, FUR); px(14, 11 + bounce, FUR); px(14, 12 + bounce, OUTLINE);
        px(7, 10 + bounce, FUR); px(7, 11 + bounce, FUR); px(7, 12 + bounce, OUTLINE);
        px(9, 10 + bounce, FUR); px(9, 11 + bounce, FUR); px(9, 12 + bounce, OUTLINE);
      } else {
        // Transition
        px(17, 10 + bounce, FUR); px(17, 11 + bounce, OUTLINE);
        px(15, 10 + bounce, FUR); px(15, 11 + bounce, OUTLINE);
        px(6, 10 + bounce, FUR); px(6, 11 + bounce, OUTLINE);
        px(8, 10 + bounce, FUR); px(8, 11 + bounce, OUTLINE);
      }

      // Tail streaming
      px(3, 8 + bounce, FUR); px(2, 8 + bounce, FUR); px(1, 7 + bounce, FUR_DARK);
    }

    // ===================
    // STALKING - Low crouch, intense focus
    // ===================
    else if (state === 'stalking') {
      // Body very low
      for (let y = 10; y <= 13; y++) {
        for (let x = 3; x <= 18; x++) {
          px(x, y, FUR);
        }
      }

      // Head low, forward
      for (let y = 7; y <= 11; y++) {
        for (let x = 14; x <= 22; x++) {
          if (y === 7 && (x < 16 || x > 20)) continue;
          px(x, y, FUR);
        }
      }

      // Ears flat back
      px(15, 6, FUR); px(16, 6, INNER_EAR);
      px(20, 6, FUR); px(21, 6, INNER_EAR);

      // Intense eyes - pupils dilated
      px(16, 8, EYE); px(17, 8, EYE);
      px(16, 9, EYE_PUPIL); px(17, 9, EYE_PUPIL);
      px(19, 8, EYE); px(20, 8, EYE);
      px(19, 9, EYE_PUPIL); px(20, 9, EYE_PUPIL);

      // Nose
      px(18, 10, NOSE);

      // Legs ready to spring
      px(17, 13, FUR); px(17, 14, FUR); px(17, 15, OUTLINE);
      px(14, 13, FUR); px(14, 14, FUR); px(14, 15, OUTLINE);
      px(6, 13, FUR); px(6, 14, FUR); px(6, 15, OUTLINE);
      px(4, 13, FUR); px(4, 14, FUR); px(4, 15, OUTLINE);

      // Tail twitching (hunting sign)
      const tw = Math.sin(frame * 0.3) * 2;
      px(3, 11, FUR); px(2, 10 + tw, FUR); px(1, 9 + tw, FUR_DARK);
    }

    // ===================
    // POUNCING - Airborne, stretched
    // ===================
    else if (state === 'pouncing') {
      // Body stretched horizontal
      for (let y = 6; y <= 9; y++) {
        for (let x = 5; x <= 20; x++) {
          px(x, y, FUR);
        }
      }

      // Head forward, mouth open
      for (let y = 3; y <= 7; y++) {
        for (let x = 17; x <= 24; x++) {
          if (y === 3 && (x < 19 || x > 22)) continue;
          px(x, y, FUR);
        }
      }

      // Ears back
      px(18, 2, FUR); px(19, 2, INNER_EAR);
      px(22, 2, FUR); px(23, 2, INNER_EAR);

      // Wide eyes
      px(19, 4, EYE); px(20, 4, EYE);
      px(22, 4, EYE); px(23, 4, EYE);

      // Open mouth
      px(20, 6, NOSE);
      px(20, 7, TONGUE); px(21, 7, TONGUE);

      // Front legs reaching forward
      px(22, 8, FUR); px(23, 9, FUR); px(24, 9, FUR_LIGHT);
      px(25, 9, OUTLINE);

      // Back legs pushing
      px(5, 9, FUR); px(4, 10, FUR); px(3, 10, FUR);
      px(2, 11, OUTLINE);

      // Tail streaming back
      px(5, 7, FUR); px(4, 6, FUR); px(3, 5, FUR); px(2, 4, FUR_DARK);
    }

    // ===================
    // EATING - Head down in bowl
    // ===================
    else if (state === 'eating') {
      // Body
      for (let y = 8; y <= 14; y++) {
        const w = y < 10 ? 7 : y < 12 ? 9 : 7;
        const sx = 10 - w/2;
        for (let x = 0; x < w; x++) px(sx + x, y, FUR);
      }

      // Head down
      for (let y = 6; y <= 12; y++) {
        for (let x = 12; x <= 20; x++) {
          if (y === 6 && (x < 14 || x > 18)) continue;
          px(x, y, FUR);
        }
      }

      // Ears
      px(14, 4, FUR); px(15, 4, FUR); px(15, 5, INNER_EAR);
      px(18, 4, FUR); px(19, 4, FUR); px(18, 5, INNER_EAR);

      // Closed happy eyes
      px(14, 8, OUTLINE); px(15, 8, OUTLINE);
      px(18, 8, OUTLINE); px(19, 8, OUTLINE);

      // Licking food animation
      if (frame % 8 < 4) {
        px(16, 11, TONGUE); px(17, 11, TONGUE);
      }

      // Tail happy
      const tw = Math.sin(frame * 0.2) * 2;
      px(6, 11, FUR); px(5, 10 + tw, FUR); px(4, 9 + tw, FUR_DARK);

      // Legs
      px(7, 14, FUR_LIGHT); px(8, 14, FUR_LIGHT);
      px(12, 14, FUR_LIGHT); px(13, 14, FUR_LIGHT);
      for (let x = 6; x <= 14; x++) px(x, 15, OUTLINE);
    }

    ctx.restore();
  }, [frame, state, dir]);

  // Draw ball
  useEffect(() => {
    const c = ballRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, c.width, c.height);

    const S = 2;
    const px = (x: number, y: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(x * S, y * S, S, S);
    };

    // Red ball
    for (let y = 2; y <= 11; y++) {
      const w = y < 4 || y > 9 ? 6 : y < 5 || y > 8 ? 8 : 10;
      const sx = 7 - w/2;
      for (let x = 0; x < w; x++) {
        px(sx + x, y, '#cc3333');
      }
    }
    // Shine
    px(4, 3, '#ff6666'); px(5, 3, '#ff6666'); px(4, 4, '#ffaaaa');
    // Shadow
    px(8, 9, '#992222'); px(9, 8, '#992222'); px(9, 9, '#992222');
    // Outline
    for (let i = 0; i < 6; i++) px(3 + i, 1, OUTLINE);
    for (let i = 0; i < 6; i++) px(3 + i, 12, OUTLINE);
    px(2, 2, OUTLINE); px(11, 2, OUTLINE);
    px(1, 3, OUTLINE); px(12, 3, OUTLINE);
    px(1, 10, OUTLINE); px(12, 10, OUTLINE);
    px(2, 11, OUTLINE); px(11, 11, OUTLINE);
  }, []);

  // Draw bowl
  useEffect(() => {
    const c = bowlRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, c.width, c.height);

    const S = 2;
    const px = (x: number, y: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(x * S, y * S, S, S);
    };

    // Bowl
    for (let y = 0; y < 12; y++) {
      const indent = Math.floor(y / 4);
      for (let x = 1 + indent; x < 19 - indent; x++) {
        px(x, y, x === 1 + indent || x === 18 - indent ? '#996600' : '#cc8800');
      }
    }
    // Inside
    for (let y = 1; y < 10; y++) {
      const indent = Math.floor(y / 4) + 1;
      for (let x = 2 + indent; x < 18 - indent; x++) {
        px(x, y, '#664400');
      }
    }
    // Food
    if (foodLevel > 0) {
      const h = Math.floor(foodLevel / 20);
      for (let y = 0; y < h; y++) {
        const fy = 8 - y;
        const indent = Math.floor(fy / 4) + 2;
        for (let x = 3 + indent; x < 17 - indent; x++) {
          px(x, fy, (x + y) % 2 ? '#aa6633' : '#885522');
        }
      }
    }
  }, [foodLevel]);

  // Draw plic
  useEffect(() => {
    const c = plicRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, c.width, c.height);

    const S = 2;
    const px = (x: number, y: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(x * S, y * S, S, S);
    };

    // Packet
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 10; x++) {
        px(x, y, x === 0 ? '#5544aa' : x === 9 ? '#8877cc' : '#6655bb');
      }
    }
    // Cat face
    px(2, 4, OUTLINE); px(3, 4, OUTLINE);
    px(6, 4, OUTLINE); px(7, 4, OUTLINE);
    px(4, 6, '#ff8866'); px(5, 6, '#ff8866');
    // Torn top
    px(1, 0, '#8877cc'); px(3, 0, '#8877cc'); px(5, 0, '#8877cc'); px(7, 0, '#8877cc');

    // Pouring
    if (pouring) {
      const pf = frame % 6;
      for (let i = 0; i < 3; i++) {
        const py = 16 + i * 4 + pf;
        if (py < 28) {
          px(4 + (i % 2), py, '#885522');
          px(5 - (i % 2), py, '#aa6633');
        }
      }
    }
  }, [frame, pouring]);

  return (
    <>
      {/* Cat */}
      <div
        onMouseDown={onMouseDown}
        onClick={() => {
          if (state === 'sleeping') {
            setState('waking');
            setMessage('*yawn*');
            setTimeout(() => setState('sitting'), 1500);
          } else {
            setMessage(stats.hunger > 60 ? 'foame...' : 'mrrr~');
            setStats(s => ({ ...s, mood: Math.min(100, s.mood + 2) }));
          }
        }}
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          zIndex: 9999,
          cursor: held ? 'grabbing' : 'grab',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        }}
      >
        <canvas ref={catRef} width={84} height={63} style={{ imageRendering: 'pixelated' }} />

        {message && (
          <div style={{
            position: 'absolute',
            top: -35,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'white',
            padding: '4px 10px',
            borderRadius: 10,
            border: '2px solid #7755cc',
            fontSize: 11,
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}>
            {message}
          </div>
        )}

        {stats.hunger > 60 && state !== 'sleeping' && state !== 'eating' && (
          <div style={{ position: 'absolute', top: -15, left: 0, fontSize: 16 }}>
            {stats.hunger > 80 ? '😾' : '💭'}
          </div>
        )}
      </div>

      {/* Cursor when stolen */}
      {stealingCursor && state !== 'stalking' && (
        <div style={{
          position: 'fixed',
          left: pos.x + 20,
          top: pos.y + 15,
          zIndex: 999999,
          pointerEvents: 'none',
          fontSize: 14,
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
          zIndex: 100,
          cursor: 'pointer',
          transform: ballMoving ? `rotate(${frame * 15}deg)` : 'none',
        }}
      >
        <canvas ref={ballRef} width={28} height={28} style={{ imageRendering: 'pixelated' }} />
      </div>

      {/* Food area */}
      <div style={{
        position: 'fixed',
        right: 12,
        bottom: 70,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        zIndex: 100,
      }}>
        <div
          onClick={pourFood}
          style={{
            cursor: bowlFull || pouring ? 'not-allowed' : 'pointer',
            opacity: bowlFull ? 0.5 : 1,
            transform: pouring ? 'rotate(35deg) translateX(10px)' : 'none',
            transition: 'transform 0.2s',
          }}
        >
          <canvas ref={plicRef} width={20} height={56} style={{ imageRendering: 'pixelated' }} />
        </div>

        <div onClick={pourFood} style={{ cursor: bowlFull ? 'default' : 'pointer' }}>
          <canvas ref={bowlRef} width={40} height={28} style={{ imageRendering: 'pixelated' }} />
        </div>
      </div>

      {/* Stats */}
      {showStats && (
        <div style={{
          position: 'fixed',
          right: 8,
          bottom: 60,
          background: 'white',
          padding: '8px 12px',
          borderRadius: 8,
          border: '2px solid #7755cc',
          fontSize: 10,
          zIndex: 10000,
        }}>
          <div style={{ fontWeight: 'bold', color: '#5533aa', marginBottom: 4 }}>🐱 Fifi</div>
          {[
            { icon: '🍽️', val: stats.hunger, col: stats.hunger > 70 ? '#dd3333' : '#33aa33' },
            { icon: '💜', val: stats.mood, col: '#cc55cc' },
            { icon: '⚡', val: stats.energy, col: '#ddaa00' },
          ].map(s => (
            <div key={s.icon} style={{ marginBottom: 3 }}>
              <span>{s.icon} {Math.round(s.val)}%</span>
              <div style={{ height: 4, background: '#ddd', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${s.val}%`, background: s.col, borderRadius: 2 }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 4, fontSize: 9, color: '#666' }}>
            {state === 'sleeping' ? '😴 doarme' :
             state === 'grooming' ? '🧼 se spală' :
             state === 'eating' ? '😋 mănâncă' :
             state === 'stalking' ? '👀 pândește' :
             '😺 relaxată'}
          </div>
        </div>
      )}

      <button
        onClick={() => setShowStats(s => !s)}
        style={{
          position: 'fixed',
          right: 120,
          bottom: 12,
          padding: '3px 8px',
          background: showStats ? '#7755cc' : 'rgba(119,85,204,0.2)',
          color: showStats ? 'white' : '#7755cc',
          border: '2px solid rgba(119,85,204,0.4)',
          borderRadius: 5,
          cursor: 'pointer',
          fontSize: 10,
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
