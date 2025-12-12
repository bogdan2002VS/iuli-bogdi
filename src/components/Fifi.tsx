import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  vx: number;
  vy: number;
}

type FifiAction =
  | 'sleeping'
  | 'sitting'
  | 'walking'
  | 'eating'
  | 'dragging'
  | 'playing'
  | 'stealing_cursor'
  | 'grooming'
  | 'stretching'
  | 'curious'
  | 'hunting'
  | 'running'
  | 'pouncing';

interface FifiStats {
  hunger: number;
  happiness: number;
  energy: number;
  playfulness: number;
}

// High-quality Desktop Goose style cat component
const Fifi: React.FC = () => {
  const [position, setPosition] = useState<Position>({ x: 400, y: 350 });
  const [action, setAction] = useState<FifiAction>('sitting');
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [message, setMessage] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [stats, setStats] = useState<FifiStats>({
    hunger: 30,
    happiness: 80,
    energy: 70,
    playfulness: 60,
  });
  const [walkTarget, setWalkTarget] = useState<Position | null>(null);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [frame, setFrame] = useState(0);
  const [isStealingCursor, setIsStealingCursor] = useState(false);
  const [stolenCursorPos, setStolenCursorPos] = useState<Position | null>(null);
  const [lastFed, setLastFed] = useState(0);
  const [showStats, setShowStats] = useState(false);

  // Ball physics
  const [ballPosition, setBallPosition] = useState<Position>({ x: window.innerWidth - 100, y: window.innerHeight - 200 });
  const [ballVelocity, setBallVelocity] = useState<Velocity>({ vx: 0, vy: 0 });
  const [isBallActive, setIsBallActive] = useState(false);
  const [isChasingBall, setIsChasingBall] = useState(false);

  // Food bowl
  const [foodBowlFilled, setFoodBowlFilled] = useState(false);
  const [isGoingToFood, setIsGoingToFood] = useState(false);
  const [foodAmount, setFoodAmount] = useState(0);

  const stealingRef = useRef<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballCanvasRef = useRef<HTMLCanvasElement>(null);

  // Animation loop - smoother 60fps feel
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 120);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Hunger system - gets hungry in ~1 minute
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        hunger: Math.min(100, prev.hunger + 2),
        happiness: Math.max(0, prev.happiness - (prev.hunger > 70 ? 2 : 0.5)),
        energy: action === 'sleeping' ? Math.min(100, prev.energy + 3) : Math.max(0, prev.energy - 0.3),
        playfulness: Math.min(100, prev.playfulness + (prev.energy > 50 ? 1 : 0)),
      }));
    }, 2000); // Every 2 seconds, +2 hunger = 100 hunger in ~100 seconds
    return () => clearInterval(interval);
  }, [action]);

  // Auto behaviors based on stats
  useEffect(() => {
    if (isDragging || isStealingCursor || isChasingBall || isGoingToFood) return;

    const behaviorCheck = setInterval(() => {
      const timeSinceInteraction = Date.now() - lastInteraction;

      // Auto sleep when tired
      if (stats.energy < 20 && action !== 'sleeping' && timeSinceInteraction > 10000) {
        setAction('sleeping');
        setMessage('zzz... 😴');
        return;
      }

      // Wake up when rested
      if (action === 'sleeping' && stats.energy > 80) {
        setAction('sitting');
        setMessage('*stretch* 🐱');
        setLastInteraction(Date.now());
        return;
      }

      // Go to food when very hungry and bowl is filled
      if (stats.hunger > 60 && foodBowlFilled && !isGoingToFood && action !== 'eating') {
        setIsGoingToFood(true);
        setWalkTarget({ x: window.innerWidth - 90, y: window.innerHeight - 170 });
        setAction('running');
        setMessage('Mâncare!! 😻');
        return;
      }

      // Random cat behaviors when idle
      if (action === 'sitting' && timeSinceInteraction > 5000 && Math.random() < 0.3) {
        const behaviors: FifiAction[] = ['grooming', 'stretching', 'curious'];
        const randomBehavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        setAction(randomBehavior);

        if (randomBehavior === 'grooming') {
          setMessage('*lick lick* 👅');
        } else if (randomBehavior === 'stretching') {
          setMessage('*streeeetch* 🙀');
        } else if (randomBehavior === 'curious') {
          setMessage('Hmm? 👀');
        }

        setTimeout(() => {
          if (!isDragging && !isStealingCursor) {
            setAction('sitting');
          }
        }, 3000);
      }
    }, 2000);

    return () => clearInterval(behaviorCheck);
  }, [action, stats, isDragging, isStealingCursor, isChasingBall, isGoingToFood, foodBowlFilled, lastInteraction]);

  // Cursor stealing - happens randomly AND when hungry
  useEffect(() => {
    if (action === 'sleeping' || action === 'eating' || isDragging) return;
    if (stealingRef.current) return;
    if (Date.now() - lastFed < 10000) return;

    const stealChance = setInterval(() => {
      // Higher chance when hungry, but also random chance when away
      const hungerProb = stats.hunger > 90 ? 0.4 : stats.hunger > 70 ? 0.25 : stats.hunger > 50 ? 0.1 : 0;
      const randomProb = 0.05; // 5% random chance even when not hungry
      const totalProb = Math.max(hungerProb, randomProb);

      if (Math.random() < totalProb && !stealingRef.current) {
        stealingRef.current = true;
        setIsStealingCursor(true);
        setAction('stealing_cursor');

        const messages = stats.hunger > 70
          ? ['Dă-mi mâncare! 😼', 'FOAME! 🍽️', 'Plic plic plic! 😾']
          : ['Hehe! 😼', 'Prinsă! 🐾', 'Miau miau! 😸'];
        setMessage(messages[Math.floor(Math.random() * messages.length)]);
        setLastInteraction(Date.now());

        document.body.style.cursor = 'none';
        document.documentElement.style.cursor = 'none';

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
            if (dist < 250 && dist > 0) {
              const speed = 22;
              setDirection(dx > 0 ? 'left' : 'right');
              return {
                x: Math.max(50, Math.min(window.innerWidth - 150, prev.x - (dx / dist) * speed)),
                y: Math.max(50, Math.min(window.innerHeight - 200, prev.y - (dy / dist) * speed)),
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
          setMessage('Hehe, am fost drăguță! 😸');
          setStolenCursorPos(null);
          document.removeEventListener('mousemove', handleMouseMove);
        }, 5000);
      }
    }, 1500);

    return () => clearInterval(stealChance);
  }, [stats.hunger, action, lastFed, isDragging]);

  // Ball physics
  useEffect(() => {
    if (!isBallActive) return;

    const physics = setInterval(() => {
      setBallPosition(prev => {
        let newX = prev.x + ballVelocity.vx;
        let newY = prev.y + ballVelocity.vy;
        let newVx = ballVelocity.vx * 0.98; // Friction
        let newVy = ballVelocity.vy + 0.5; // Gravity

        // Bounce off walls
        if (newX < 20) {
          newX = 20;
          newVx = -newVx * 0.7;
        }
        if (newX > window.innerWidth - 60) {
          newX = window.innerWidth - 60;
          newVx = -newVx * 0.7;
        }

        // Bounce off floor
        if (newY > window.innerHeight - 150) {
          newY = window.innerHeight - 150;
          newVy = -newVy * 0.6;
          newVx *= 0.9;
        }

        // Bounce off ceiling
        if (newY < 50) {
          newY = 50;
          newVy = -newVy * 0.7;
        }

        setBallVelocity({ vx: newVx, vy: newVy });

        // Stop if velocity is very low
        if (Math.abs(newVx) < 0.5 && Math.abs(newVy) < 0.5 && newY >= window.innerHeight - 155) {
          setIsBallActive(false);
        }

        return { x: newX, y: newY };
      });
    }, 16);

    return () => clearInterval(physics);
  }, [isBallActive, ballVelocity]);

  // Fifi chases the ball
  useEffect(() => {
    if (!isChasingBall || !isBallActive) return;

    const chase = setInterval(() => {
      setPosition(prev => {
        const dx = ballPosition.x - prev.x - 30;
        const dy = ballPosition.y - prev.y - 20;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 50) {
          // Pounce on the ball!
          setIsChasingBall(false);
          setAction('pouncing');
          setMessage('PRINSĂ! 😺');
          setStats(prev => ({
            ...prev,
            happiness: Math.min(100, prev.happiness + 15),
            playfulness: Math.max(0, prev.playfulness - 20),
            energy: Math.max(0, prev.energy - 10),
          }));

          // Kick the ball in random direction
          setBallVelocity({
            vx: (Math.random() - 0.5) * 20,
            vy: -10 - Math.random() * 10,
          });
          setIsBallActive(true);

          setTimeout(() => {
            setAction('sitting');
            if (stats.playfulness > 40) {
              setIsChasingBall(true);
              setAction('hunting');
              setMessage('Din nou! 🎾');
            }
          }, 800);

          return prev;
        }

        setDirection(dx > 0 ? 'right' : 'left');
        const speed = action === 'running' ? 8 : 5;
        return {
          x: Math.max(50, Math.min(window.innerWidth - 150, prev.x + (dx / dist) * speed)),
          y: Math.max(50, Math.min(window.innerHeight - 200, prev.y + (dy / dist) * speed)),
        };
      });
    }, 30);

    return () => clearInterval(chase);
  }, [isChasingBall, isBallActive, ballPosition, action, stats.playfulness]);

  // Random wandering
  useEffect(() => {
    if (action === 'sleeping' || isDragging || walkTarget || isStealingCursor || isChasingBall) return;

    const wander = setInterval(() => {
      if (Math.random() > 0.5 && action === 'sitting') {
        const newX = 100 + Math.random() * (window.innerWidth - 300);
        const newY = 100 + Math.random() * (window.innerHeight - 350);
        setWalkTarget({ x: newX, y: newY });
        setAction('walking');
      }
    }, 5000);

    return () => clearInterval(wander);
  }, [action, isDragging, walkTarget, isStealingCursor, isChasingBall]);

  // Walking to target
  useEffect(() => {
    if (!walkTarget) return;
    if (action !== 'walking' && action !== 'running') return;

    const walk = setInterval(() => {
      setPosition((pos) => {
        const dx = walkTarget.x - pos.x;
        const dy = walkTarget.y - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 15) {
          setWalkTarget(null);

          // Check if arrived at food bowl
          if (isGoingToFood && foodBowlFilled) {
            setIsGoingToFood(false);
            setAction('eating');
            setMessage('Nom nom nom! 😋');

            // Eating animation
            const eatInterval = setInterval(() => {
              setFoodAmount(prev => {
                if (prev <= 0) {
                  clearInterval(eatInterval);
                  setFoodBowlFilled(false);
                  setAction('sitting');
                  setStats(prev => ({
                    ...prev,
                    hunger: Math.max(0, prev.hunger - 50),
                    happiness: Math.min(100, prev.happiness + 20),
                    energy: Math.min(100, prev.energy + 10),
                  }));
                  setMessage('Mulțumesc! Sunt fericită! 😻');
                  setLastFed(Date.now());
                  return 0;
                }
                return prev - 10;
              });
            }, 300);

            return pos;
          }

          setAction('sitting');
          return pos;
        }

        setDirection(dx > 0 ? 'right' : 'left');
        const speed = action === 'running' ? 7 : 4;
        return { x: pos.x + (dx / dist) * speed, y: pos.y + (dy / dist) * speed };
      });
    }, 25);

    return () => clearInterval(walk);
  }, [walkTarget, action, isGoingToFood, foodBowlFilled]);

  // Clear message
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 4000);
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
    setMessage('Miau~! Unde mă duci? 😺');
    setStats(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 5) }));
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLastInteraction(Date.now());

    if (action === 'sleeping') {
      setAction('sitting');
      setStats(prev => ({ ...prev, energy: Math.min(100, prev.energy + 10) }));
      setMessage('*yawn* Meaww, bună! 😺');
    } else if (stats.hunger > 70) {
      setMessage('Vreau plic! Foame mare! 🍽️');
    } else if (stats.hunger > 40) {
      setMessage('Mrrr~ Sunt bine! 💕');
    } else {
      const happyMessages = ['Sunt fericită! 😻', 'Te iubesc! 💖', 'Mrrr prrrr~ 💕', 'Cea mai bună stăpână! 🥰'];
      setMessage(happyMessages[Math.floor(Math.random() * happyMessages.length)]);
    }

    setStats(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 3) }));
  };

  useEffect(() => {
    if (!isDragging) return;

    const move = (e: MouseEvent) => {
      setPosition({
        x: Math.max(20, Math.min(window.innerWidth - 150, e.clientX - dragOffset.x)),
        y: Math.max(20, Math.min(window.innerHeight - 180, e.clientY - dragOffset.y)),
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

  // Fill food bowl
  const fillFoodBowl = useCallback(() => {
    if (foodBowlFilled) {
      setMessage('Castronul e plin deja! 🍽️');
      return;
    }
    setFoodBowlFilled(true);
    setFoodAmount(100);
    setMessage('Mâncare! Vin imediat! 😻');
    setLastInteraction(Date.now());

    // Fifi notices and goes to food
    if (stats.hunger > 30 && action !== 'eating' && action !== 'sleeping') {
      setIsGoingToFood(true);
      setWalkTarget({ x: window.innerWidth - 90, y: window.innerHeight - 170 });
      setAction('running');
    }
  }, [foodBowlFilled, stats.hunger, action]);

  // Click ball to play
  const kickBall = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setLastInteraction(Date.now());

    // Give ball a random kick
    const kickX = (Math.random() - 0.5) * 25;
    const kickY = -15 - Math.random() * 10;
    setBallVelocity({ vx: kickX, vy: kickY });
    setIsBallActive(true);

    // Fifi gets excited and chases
    if (action !== 'sleeping' && action !== 'eating' && stats.energy > 20) {
      setIsChasingBall(true);
      setAction('hunting');
      setMessage('Minge! Minge! 🎾😺');
      setStats(prev => ({
        ...prev,
        happiness: Math.min(100, prev.happiness + 10),
        playfulness: Math.min(100, prev.playfulness + 15),
      }));
    }
  }, [action, stats.energy]);

  // Expose stats toggle
  useEffect(() => {
    (window as any).toggleFifiStats = () => setShowStats(prev => !prev);
    (window as any).feedFifi = fillFoodBowl;
    return () => {
      delete (window as any).toggleFifiStats;
      delete (window as any).feedFifi;
    };
  }, [fillFoodBowl]);

  // Draw high-quality pixel art cat on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = 5;

    // High quality British Shorthair palette
    const colors = {
      outline: '#1a1a2e',
      body: '#9ba4b4',
      bodyDark: '#6b7280',
      bodyLight: '#c9d1d9',
      bodyHighlight: '#e5e7eb',
      eyes: '#fcd34d',
      eyesDark: '#f59e0b',
      eyesPupil: '#1f2937',
      nose: '#f472b6',
      noseDark: '#ec4899',
      collar: '#8b5cf6',
      collarDark: '#7c3aed',
      bell: '#fde047',
      bellHighlight: '#fef9c3',
      white: '#ffffff',
      pink: '#fce7f3',
      whiskers: '#4b5563',
    };

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    if (direction === 'left') {
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
    }

    const drawPixel = (x: number, y: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    };

    const blink = frame % 60 < 4 && action !== 'sleeping';
    const walkFrame = Math.floor(frame / 10) % 4;
    const breathe = Math.sin(frame * 0.08) * 0.8;
    const tailWave = Math.sin(frame * 0.12) * 2.5;
    const earTwitch = Math.sin(frame * 0.05) > 0.8 ? 1 : 0;

    if (action === 'sleeping') {
      // Curled up sleeping cat with ears!

      // Left ear
      drawPixel(3, 2, colors.body);
      drawPixel(4, 2, colors.body);
      drawPixel(2, 3, colors.outline);
      drawPixel(3, 3, colors.body);
      drawPixel(4, 3, colors.pink);
      drawPixel(5, 3, colors.outline);

      // Right ear
      drawPixel(8, 2, colors.body);
      drawPixel(9, 2, colors.body);
      drawPixel(7, 3, colors.outline);
      drawPixel(8, 3, colors.pink);
      drawPixel(9, 3, colors.body);
      drawPixel(10, 3, colors.outline);

      // Ear outlines
      drawPixel(2, 2, colors.outline);
      drawPixel(5, 2, colors.outline);
      drawPixel(7, 2, colors.outline);
      drawPixel(10, 2, colors.outline);

      // Head
      for (let y = 4; y <= 8; y++) {
        for (let x = 3; x <= 10; x++) {
          if (y === 4 && (x < 4 || x > 9)) continue;
          if (y === 8 && (x < 5 || x > 8)) continue;
          drawPixel(x, y, colors.body);
        }
      }

      // Head highlights
      drawPixel(5, 5, colors.bodyLight);
      drawPixel(6, 5, colors.bodyLight);

      // Closed eyes (Z shape for sleeping)
      drawPixel(5, 6, colors.outline);
      drawPixel(6, 6, colors.outline);
      drawPixel(8, 6, colors.outline);
      drawPixel(9, 6, colors.outline);

      // Nose
      drawPixel(7, 7, colors.nose);

      // Body curled
      const bodyPixels = [
        [5,9],[6,9],[7,9],[8,9],[9,9],[10,9],[11,9],[12,9],
        [4,10],[5,10],[6,10],[7,10],[8,10],[9,10],[10,10],[11,10],[12,10],[13,10],
        [4,11],[5,11],[6,11],[7,11],[8,11],[9,11],[10,11],[11,11],[12,11],[13,11],[14,11],
        [5,12],[6,12],[7,12],[8,12],[9,12],[10,12],[11,12],[12,12],[13,12],[14,12],
        [6,13],[7,13],[8,13],[9,13],[10,13],[11,13],[12,13],[13,13],
      ];
      bodyPixels.forEach(([x, y]) => drawPixel(x, y, colors.body));

      // Body highlights
      [[6,10],[7,10],[8,11],[9,11]].forEach(([x,y]) => drawPixel(x, y, colors.bodyLight));

      // Tail curled around
      [[14,10],[15,9],[16,8],[16,7],[15,6],[14,6]].forEach(([x,y]) => drawPixel(x, y, colors.body));
      [[17,8],[17,7],[16,6],[15,5]].forEach(([x,y]) => drawPixel(x, y, colors.outline));

      // Paws tucked
      drawPixel(5, 13, colors.bodyLight);
      drawPixel(6, 13, colors.bodyLight);

      // Outline
      [[3,4],[10,4],[2,5],[11,5],[2,6],[11,6],[2,7],[11,7],[3,8],[10,8],[4,9],[13,9],
       [3,10],[14,10],[3,11],[15,11],[4,12],[15,12],[5,13],[14,13],[6,14],[13,14]].forEach(([x,y]) =>
        drawPixel(x, y, colors.outline));

      // Zzz
      const zzz = Math.floor(frame / 20) % 3;
      if (zzz === 0) {
        drawPixel(12, 3, colors.outline);
        drawPixel(13, 3, colors.outline);
        drawPixel(13, 4, colors.outline);
        drawPixel(12, 5, colors.outline);
        drawPixel(13, 5, colors.outline);
      } else if (zzz === 1) {
        drawPixel(14, 2, colors.bodyDark);
        drawPixel(15, 2, colors.bodyDark);
        drawPixel(15, 3, colors.bodyDark);
        drawPixel(14, 4, colors.bodyDark);
        drawPixel(15, 4, colors.bodyDark);
      }

    } else if (action === 'eating') {
      // Eating pose - head down
      // Ears
      [[4,1],[5,1],[9,1],[10,1]].forEach(([x,y]) => drawPixel(x, y, colors.body));
      [[3,1],[6,1],[8,1],[11,1]].forEach(([x,y]) => drawPixel(x, y, colors.outline));
      drawPixel(4, 2, colors.pink);
      drawPixel(10, 2, colors.pink);

      // Head (tilted down)
      for (let y = 2; y <= 7; y++) {
        for (let x = 3; x <= 11; x++) {
          if (y === 2 && (x < 4 || x > 10)) continue;
          if (y === 7 && (x < 5 || x > 9)) continue;
          drawPixel(x, y, colors.body);
        }
      }

      // Closed happy eyes
      drawPixel(5, 4, colors.outline);
      drawPixel(6, 4, colors.outline);
      drawPixel(8, 4, colors.outline);
      drawPixel(9, 4, colors.outline);

      // Eating mouth
      drawPixel(7, 6, colors.nose);
      drawPixel(6, 7, colors.pink);
      drawPixel(7, 7, colors.pink);
      drawPixel(8, 7, colors.pink);

      // Body
      for (let y = 8; y <= 14; y++) {
        const width = y < 10 ? 6 : y < 12 ? 8 : 6;
        const startX = 7 - Math.floor(width / 2);
        for (let x = startX; x < startX + width; x++) {
          drawPixel(x, y, colors.body);
        }
      }

      // Collar
      for (let x = 5; x <= 9; x++) drawPixel(x, 8, colors.collar);
      drawPixel(7, 9, colors.bell);

      // Legs
      [[4,13],[5,13],[4,14],[5,14],[9,13],[10,13],[9,14],[10,14]].forEach(([x,y]) =>
        drawPixel(x, y, colors.body));
      [[4,15],[5,15],[9,15],[10,15]].forEach(([x,y]) => drawPixel(x, y, colors.outline));

      // Tail
      [[11,11],[12,10],[13,9 + tailWave],[14,8 + tailWave]].forEach(([x,y]) =>
        drawPixel(x, y, colors.body));

    } else if (action === 'grooming') {
      // Grooming - licking paw
      // Ears
      [[3,0],[4,0],[9,0],[10,0]].forEach(([x,y]) => drawPixel(x, y, colors.body));
      [[2,0],[5,0],[8,0],[11,0]].forEach(([x,y]) => drawPixel(x, y, colors.outline));
      [[2,1],[3,1],[4,1],[5,1],[8,1],[9,1],[10,1],[11,1]].forEach(([x,y]) => drawPixel(x, y, colors.body));
      drawPixel(3, 1, colors.pink);
      drawPixel(10, 1, colors.pink);

      // Head tilted
      for (let y = 2; y <= 6; y++) {
        for (let x = 2; x <= 11; x++) {
          if (y === 2 && (x < 3 || x > 10)) continue;
          if (y === 6 && (x < 4 || x > 9)) continue;
          drawPixel(x, y, colors.body);
        }
      }

      // Eyes looking at paw
      drawPixel(4, 3, colors.eyes);
      drawPixel(4, 4, colors.eyesPupil);
      drawPixel(8, 3, colors.eyes);
      drawPixel(8, 4, colors.eyesPupil);

      // Tongue out
      drawPixel(6, 5, colors.nose);
      drawPixel(5, 6, colors.pink);
      drawPixel(6, 6, colors.pink);

      // Raised paw being licked
      drawPixel(3, 5, colors.bodyLight);
      drawPixel(3, 6, colors.bodyLight);
      drawPixel(4, 6, colors.bodyLight);
      drawPixel(3, 7, colors.bodyLight);

      // Body
      for (let y = 7; y <= 13; y++) {
        for (let x = 4; x <= 10; x++) {
          drawPixel(x, y, colors.body);
        }
      }

      // Collar
      for (let x = 5; x <= 9; x++) drawPixel(x, 7, colors.collar);
      drawPixel(7, 8, colors.bell);

      // Sitting legs
      [[4,12],[5,12],[9,12],[10,12],[4,13],[5,13],[9,13],[10,13]].forEach(([x,y]) =>
        drawPixel(x, y, colors.body));

    } else if (action === 'stretching') {
      // Stretching pose
      // Ears back
      [[2,2],[3,2],[10,2],[11,2]].forEach(([x,y]) => drawPixel(x, y, colors.body));
      [[1,2],[4,2],[9,2],[12,2]].forEach(([x,y]) => drawPixel(x, y, colors.outline));

      // Head
      for (let y = 3; y <= 7; y++) {
        for (let x = 3; x <= 10; x++) {
          drawPixel(x, y, colors.body);
        }
      }

      // Squinted eyes (stretching face)
      drawPixel(4, 5, colors.outline);
      drawPixel(5, 5, colors.outline);
      drawPixel(8, 5, colors.outline);
      drawPixel(9, 5, colors.outline);

      // Open mouth yawning
      drawPixel(6, 6, colors.nose);
      drawPixel(7, 6, colors.nose);
      drawPixel(5, 7, colors.pink);
      drawPixel(6, 7, colors.pink);
      drawPixel(7, 7, colors.pink);
      drawPixel(8, 7, colors.pink);

      // Stretched body
      for (let x = 4; x <= 16; x++) {
        drawPixel(x, 9, colors.body);
        drawPixel(x, 10, colors.body);
      }

      // Front legs stretched
      drawPixel(2, 10, colors.body);
      drawPixel(3, 10, colors.body);
      drawPixel(2, 11, colors.outline);
      drawPixel(3, 11, colors.outline);

      // Back legs
      drawPixel(15, 11, colors.body);
      drawPixel(16, 11, colors.body);
      drawPixel(15, 12, colors.outline);
      drawPixel(16, 12, colors.outline);

      // Tail up
      [[17,9],[18,8],[19,7],[19,6],[18,5]].forEach(([x,y]) => drawPixel(x, y, colors.body));

    } else if (action === 'curious') {
      // Curious pose - head tilted
      // Ears (one up, one tilted)
      [[3,0],[4,0]].forEach(([x,y]) => drawPixel(x, y, colors.body));
      [[9,1],[10,1]].forEach(([x,y]) => drawPixel(x, y, colors.body));
      [[2,0],[5,0],[8,1],[11,1]].forEach(([x,y]) => drawPixel(x, y, colors.outline));
      [[2,1],[3,1],[4,1],[5,1],[8,2],[9,2],[10,2],[11,2]].forEach(([x,y]) => drawPixel(x, y, colors.body));
      drawPixel(3, 1, colors.pink);
      drawPixel(9, 2, colors.pink);

      // Head slightly tilted
      for (let y = 2; y <= 6; y++) {
        for (let x = 2; x <= 11; x++) {
          if (y === 2 && (x < 3 || x > 10)) continue;
          if (y === 6 && (x < 4 || x > 9)) continue;
          drawPixel(x, y + (x > 7 ? 1 : 0), colors.body);
        }
      }

      // Big curious eyes
      drawPixel(4, 3, colors.white);
      drawPixel(4, 4, colors.eyes);
      drawPixel(5, 3, colors.eyes);
      drawPixel(5, 4, colors.eyesPupil);

      drawPixel(8, 4, colors.white);
      drawPixel(8, 5, colors.eyes);
      drawPixel(9, 4, colors.eyes);
      drawPixel(9, 5, colors.eyesPupil);

      // Nose
      drawPixel(6, 5, colors.nose);

      // Body
      for (let y = 8; y <= 14; y++) {
        for (let x = 4; x <= 10; x++) {
          drawPixel(x, y, colors.body);
        }
      }

      // Collar
      for (let x = 5; x <= 9; x++) drawPixel(x, 8, colors.collar);
      drawPixel(7, 9, colors.bell);

      // Legs
      [[4,13],[5,13],[4,14],[5,14],[9,13],[10,13],[9,14],[10,14]].forEach(([x,y]) =>
        drawPixel(x, y, colors.body));
      [[4,15],[5,15],[9,15],[10,15]].forEach(([x,y]) => drawPixel(x, y, colors.outline));

      // Tail question mark shape
      [[11,11],[12,10],[13,9],[13,8],[12,7],[13,6]].forEach(([x,y]) =>
        drawPixel(x, y, colors.body));

    } else if (action === 'hunting' || action === 'pouncing') {
      // Hunting/pouncing pose - low crouch
      // Ears flat back
      [[2,3],[3,3],[10,3],[11,3]].forEach(([x,y]) => drawPixel(x, y, colors.body));
      [[1,3],[4,3],[9,3],[12,3]].forEach(([x,y]) => drawPixel(x, y, colors.outline));

      // Head low
      for (let y = 4; y <= 8; y++) {
        for (let x = 3; x <= 11; x++) {
          drawPixel(x, y, colors.body);
        }
      }

      // Focused eyes
      drawPixel(4, 5, colors.eyes);
      drawPixel(5, 5, colors.eyes);
      drawPixel(5, 6, colors.eyesPupil);
      drawPixel(4, 6, colors.eyesPupil);

      drawPixel(8, 5, colors.eyes);
      drawPixel(9, 5, colors.eyes);
      drawPixel(8, 6, colors.eyesPupil);
      drawPixel(9, 6, colors.eyesPupil);

      // Nose
      drawPixel(6, 7, colors.nose);
      drawPixel(7, 7, colors.nose);

      // Low crouched body
      for (let x = 3; x <= 14; x++) {
        drawPixel(x, 9, colors.body);
        drawPixel(x, 10, colors.body);
        drawPixel(x, 11, colors.body);
      }

      // Legs ready to pounce
      const pounceFrame = action === 'pouncing' ? 2 : 0;
      drawPixel(2 - pounceFrame, 11, colors.body);
      drawPixel(3 - pounceFrame, 11, colors.body);
      drawPixel(2 - pounceFrame, 12, colors.outline);
      drawPixel(3 - pounceFrame, 12, colors.outline);

      drawPixel(13 + pounceFrame, 11, colors.body);
      drawPixel(14 + pounceFrame, 11, colors.body);
      drawPixel(13 + pounceFrame, 12, colors.outline);
      drawPixel(14 + pounceFrame, 12, colors.outline);

      // Tail twitching
      const twitchY = Math.sin(frame * 0.3) * 2;
      [[15,10],[16,9 + twitchY],[17,8 + twitchY],[18,7 + twitchY]].forEach(([x,y]) =>
        drawPixel(x, y, colors.body));

    } else {
      // Normal sitting/walking cat
      const isWalking = action === 'walking' || action === 'running' || action === 'playing' || action === 'stealing_cursor';
      const isRunning = action === 'running';
      const legOffset = isWalking ? (walkFrame % 2) : 0;
      const runBounce = isRunning ? Math.abs(Math.sin(frame * 0.3)) * 2 : 0;

      // Ears with detail and twitching
      const earY = earTwitch;
      [[3,0-earY],[4,0-earY],[9,0],[10,0]].forEach(([x,y]) => drawPixel(x, y, colors.body));
      [[2,0-earY],[5,0-earY],[8,0],[11,0]].forEach(([x,y]) => drawPixel(x, y, colors.outline));
      [[2,1-earY],[3,1-earY],[4,1-earY],[5,1-earY],[8,1],[9,1],[10,1],[11,1]].forEach(([x,y]) => drawPixel(x, y, colors.body));
      // Inner ear pink
      drawPixel(3, 1 - earY, colors.pink);
      drawPixel(10, 1, colors.pink);
      // Ear outline
      [[1,1-earY],[6,1-earY],[7,1],[12,1]].forEach(([x,y]) => drawPixel(x, y, colors.outline));

      // Head with shading
      for (let y = 2; y <= 6; y++) {
        for (let x = 2; x <= 11; x++) {
          if (y === 2 && (x < 3 || x > 10)) continue;
          if (y === 6 && (x < 4 || x > 9)) continue;

          // Add highlights and shading
          if (y === 2 && x >= 4 && x <= 8) {
            drawPixel(x, y - runBounce, colors.bodyLight);
          } else if (x === 2 || x === 11) {
            drawPixel(x, y - runBounce, colors.bodyDark);
          } else {
            drawPixel(x, y - runBounce, colors.body);
          }
        }
      }

      // Head outline
      [[2,2],[11,2],[1,3],[12,3],[1,4],[12,4],[1,5],[12,5],[3,6],[10,6]].forEach(([x,y]) =>
        drawPixel(x, y - runBounce, colors.outline));

      // Eyes with expression
      if (blink) {
        drawPixel(4, 4 - runBounce, colors.outline);
        drawPixel(5, 4 - runBounce, colors.outline);
        drawPixel(8, 4 - runBounce, colors.outline);
        drawPixel(9, 4 - runBounce, colors.outline);
      } else if (action === 'stealing_cursor') {
        // Mischievous squint
        drawPixel(4, 3 - runBounce, colors.eyes);
        drawPixel(5, 4 - runBounce, colors.eyesPupil);
        drawPixel(8, 3 - runBounce, colors.eyes);
        drawPixel(9, 4 - runBounce, colors.eyesPupil);
        // Smirk
        drawPixel(7, 5 - runBounce, colors.white);
        drawPixel(8, 6 - runBounce, colors.pink);
      } else {
        // Normal eyes with highlights
        drawPixel(4, 3 - runBounce, colors.white);
        drawPixel(4, 4 - runBounce, colors.eyes);
        drawPixel(5, 3 - runBounce, colors.eyes);
        drawPixel(5, 4 - runBounce, colors.eyesPupil);

        drawPixel(8, 3 - runBounce, colors.white);
        drawPixel(8, 4 - runBounce, colors.eyes);
        drawPixel(9, 3 - runBounce, colors.eyes);
        drawPixel(9, 4 - runBounce, colors.eyesPupil);
      }

      // Nose with highlight
      drawPixel(6, 5 - runBounce, colors.nose);
      drawPixel(7, 5 - runBounce, colors.noseDark);

      // Whiskers
      drawPixel(2, 4 - runBounce, colors.whiskers);
      drawPixel(1, 5 - runBounce, colors.whiskers);
      drawPixel(11, 4 - runBounce, colors.whiskers);
      drawPixel(12, 5 - runBounce, colors.whiskers);

      // Collar with shading
      for (let x = 4; x <= 9; x++) {
        drawPixel(x, 7 - runBounce, x === 4 || x === 9 ? colors.collarDark : colors.collar);
      }
      // Bell with highlight
      drawPixel(6, 8 - runBounce, colors.bell);
      drawPixel(7, 8 - runBounce, colors.bellHighlight);

      // Body with shading
      for (let y = 8; y <= 13; y++) {
        const width = y < 10 ? 6 : y < 12 ? 8 : 6;
        const startX = 7 - Math.floor(width / 2);
        for (let x = startX; x < startX + width; x++) {
          const yPos = y + (y > 10 ? breathe : 0) - runBounce;
          if (x === startX || x === startX + width - 1) {
            drawPixel(x, yPos, colors.bodyDark);
          } else if (y === 8) {
            drawPixel(x, yPos, colors.bodyLight);
          } else {
            drawPixel(x, yPos, colors.body);
          }
        }
      }

      // Animated legs
      if (isWalking) {
        // Walking animation - 4 frame cycle
        const frontLegX = 3 + (walkFrame === 1 || walkFrame === 2 ? 1 : 0);
        const backLegX = 9 - (walkFrame === 0 || walkFrame === 3 ? 1 : 0);
        const frontLegY = walkFrame === 1 ? 12 : 13;
        const backLegY = walkFrame === 3 ? 12 : 13;

        // Front legs
        drawPixel(frontLegX, frontLegY - runBounce, colors.body);
        drawPixel(frontLegX + 1, frontLegY - runBounce, colors.body);
        drawPixel(frontLegX, frontLegY + 1 - runBounce, colors.body);
        drawPixel(frontLegX + 1, frontLegY + 1 - runBounce, colors.bodyLight);
        drawPixel(frontLegX, frontLegY + 2 - runBounce, colors.outline);
        drawPixel(frontLegX + 1, frontLegY + 2 - runBounce, colors.outline);

        // Back legs
        drawPixel(backLegX, backLegY - runBounce, colors.body);
        drawPixel(backLegX + 1, backLegY - runBounce, colors.body);
        drawPixel(backLegX, backLegY + 1 - runBounce, colors.body);
        drawPixel(backLegX + 1, backLegY + 1 - runBounce, colors.bodyLight);
        drawPixel(backLegX, backLegY + 2 - runBounce, colors.outline);
        drawPixel(backLegX + 1, backLegY + 2 - runBounce, colors.outline);
      } else {
        // Sitting legs
        [[3,13],[4,13],[3,14],[4,14],[9,13],[10,13],[9,14],[10,14]].forEach(([x,y]) =>
          drawPixel(x, y + breathe, colors.body));
        [[3,14],[4,14],[9,14],[10,14]].forEach(([x,y]) =>
          drawPixel(x, y + breathe, colors.bodyLight));
        [[3,15],[4,15],[9,15],[10,15]].forEach(([x,y]) =>
          drawPixel(x, y + breathe, colors.outline));
      }

      // Animated tail with better shape
      const tailY = tailWave;
      [[11,10 - runBounce],[12,9 - runBounce + tailY * 0.3],[13,8 - runBounce + tailY * 0.6],
       [14,7 - runBounce + tailY * 0.8],[15,6 - runBounce + tailY],[16,5 - runBounce + tailY]].forEach(([x,y]) =>
        drawPixel(x, y, colors.body));
      // Tail tip darker
      drawPixel(16, 5 - runBounce + tailY, colors.bodyDark);
      drawPixel(17, 4 - runBounce + tailY, colors.outline);
    }

    ctx.restore();
  }, [frame, action, direction, stats]);

  // Draw pixelated ball
  useEffect(() => {
    const canvas = ballCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = 3;
    const drawPixel = (x: number, y: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    };

    // Pixelated red ball with shine
    const ballColors = {
      dark: '#991b1b',
      main: '#dc2626',
      light: '#f87171',
      highlight: '#fecaca',
    };

    // Ball shape
    [[4,0],[5,0],[6,0],[7,0],
     [2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],
     [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],
     [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],[9,3],[10,3],
     [1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],
     [1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],
     [1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],
     [1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7],[8,7],[9,7],[10,7],
     [2,8],[3,8],[4,8],[5,8],[6,8],[7,8],[8,8],[9,8],
     [4,9],[5,9],[6,9],[7,9]].forEach(([x,y]) => drawPixel(x, y, ballColors.main));

    // Shading
    [[1,5],[1,6],[1,7],[2,7],[2,8],[3,8],[4,9]].forEach(([x,y]) => drawPixel(x, y, ballColors.dark));

    // Highlight
    [[3,2],[4,2],[3,3],[4,3],[5,3]].forEach(([x,y]) => drawPixel(x, y, ballColors.light));
    [[4,2],[4,3]].forEach(([x,y]) => drawPixel(x, y, ballColors.highlight));

  }, []);

  // Get hunger status
  const getHungerStatus = () => {
    if (stats.hunger > 80) return { text: 'Foarte flămândă!', color: '#ef4444' };
    if (stats.hunger > 60) return { text: 'Flămândă', color: '#f97316' };
    if (stats.hunger > 40) return { text: 'Puțin foame', color: '#eab308' };
    if (stats.hunger > 20) return { text: 'Sătulă', color: '#22c55e' };
    return { text: 'Burtică plină!', color: '#10b981' };
  };

  const hungerStatus = getHungerStatus();

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
          filter: isDragging
            ? 'drop-shadow(0 12px 24px rgba(0,0,0,0.4))'
            : 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))',
          transition: isDragging ? 'none' : 'filter 0.2s',
        }}
      >
        <canvas
          ref={canvasRef}
          width={120}
          height={90}
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Speech bubble */}
        {message && (
          <div style={{
            position: 'absolute',
            top: '-55px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'white',
            borderRadius: '18px',
            padding: '12px 18px',
            boxShadow: '0 6px 24px rgba(139, 92, 246, 0.25)',
            border: '3px solid #8b5cf6',
            whiteSpace: 'nowrap',
            fontSize: '15px',
            fontWeight: 'bold',
            color: '#1f2937',
            zIndex: 10001,
            animation: 'fifi-pop 0.3s ease-out',
          }}>
            {message}
            <div style={{
              position: 'absolute',
              bottom: '-14px',
              left: '50%',
              transform: 'translateX(-50%)',
              borderLeft: '14px solid transparent',
              borderRight: '14px solid transparent',
              borderTop: '14px solid white',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-18px',
              left: '50%',
              transform: 'translateX(-50%)',
              borderLeft: '16px solid transparent',
              borderRight: '16px solid transparent',
              borderTop: '16px solid #8b5cf6',
              zIndex: -1,
            }} />
          </div>
        )}

        {/* Hunger thought bubble */}
        {stats.hunger > 60 && action !== 'sleeping' && action !== 'eating' && (
          <div style={{
            position: 'absolute',
            top: '-30px',
            left: '5px',
            fontSize: '28px',
            animation: 'fifi-bounce 0.6s ease-in-out infinite',
          }}>
            {stats.hunger > 80 ? '😾' : '💭'}
          </div>
        )}

        {/* Hearts when happy */}
        {stats.happiness > 80 && action === 'sitting' && frame % 60 < 30 && (
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '0px',
            fontSize: '16px',
            animation: 'fifi-float 2s ease-in-out infinite',
            opacity: 0.8,
          }}>
            💕
          </div>
        )}
      </div>

      {/* Pixelated Ball */}
      <div
        onClick={kickBall}
        style={{
          position: 'fixed',
          left: ballPosition.x,
          top: ballPosition.y,
          cursor: 'pointer',
          zIndex: 100,
          transition: isBallActive ? 'none' : 'transform 0.2s',
          transform: isBallActive ? `rotate(${frame * 10}deg)` : 'rotate(0deg)',
        }}
        onMouseEnter={(e) => !isBallActive && (e.currentTarget.style.transform = 'scale(1.2)')}
        onMouseLeave={(e) => !isBallActive && (e.currentTarget.style.transform = 'scale(1)')}
        title="Click să te joci cu Fifi! 🎾"
      >
        <canvas
          ref={ballCanvasRef}
          width={36}
          height={36}
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Food Bowl & Pliculete Button */}
      <div style={{
        position: 'fixed',
        right: '25px',
        bottom: '85px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        zIndex: 100,
      }}>
        {/* Pliculete cu mancare button */}
        <button
          onClick={fillFoodBowl}
          style={{
            padding: '8px 14px',
            backgroundColor: foodBowlFilled ? '#9ca3af' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: foodBowlFilled ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseEnter={(e) => !foodBowlFilled && (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          title="Pune pliculețe cu mâncare în castron"
        >
          <span>🍽️</span>
          <span>Pliculețe</span>
        </button>

        {/* Food Bowl */}
        <div style={{
          position: 'relative',
          width: '55px',
          height: '40px',
        }}>
          {/* Bowl */}
          <div style={{
            width: '55px',
            height: '35px',
            background: 'linear-gradient(180deg, #d97706 0%, #92400e 100%)',
            borderRadius: '0 0 50% 50%',
            border: '3px solid #78350f',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25), inset 0 -8px 16px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Food inside */}
            {foodBowlFilled && (
              <div style={{
                position: 'absolute',
                bottom: '5px',
                left: '5px',
                right: '5px',
                height: `${foodAmount * 0.2}px`,
                background: 'linear-gradient(180deg, #cd6133 0%, #8B4513 100%)',
                borderRadius: '0 0 40% 40%',
                transition: 'height 0.3s',
              }} />
            )}
          </div>

          {/* Bowl label */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '8px',
            color: '#fef3c7',
            fontWeight: 'bold',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}>
            FIFI
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <div style={{
          position: 'fixed',
          right: '20px',
          bottom: '75px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.25)',
          border: '3px solid #8b5cf6',
          zIndex: 10000,
          minWidth: '180px',
          animation: 'fifi-pop 0.3s ease-out',
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#7c3aed',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            🐱 Statistici Fifi
          </div>

          {/* Hunger */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span>🍽️ Foame</span>
              <span style={{ color: hungerStatus.color, fontWeight: 'bold' }}>{hungerStatus.text}</span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${stats.hunger}%`,
                backgroundColor: hungerStatus.color,
                transition: 'width 0.3s',
              }} />
            </div>
          </div>

          {/* Happiness */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span>💕 Fericire</span>
              <span>{stats.happiness}%</span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${stats.happiness}%`,
                backgroundColor: '#ec4899',
                transition: 'width 0.3s',
              }} />
            </div>
          </div>

          {/* Energy */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span>⚡ Energie</span>
              <span>{Math.round(stats.energy)}%</span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${stats.energy}%`,
                backgroundColor: '#eab308',
                transition: 'width 0.3s',
              }} />
            </div>
          </div>

          {/* Playfulness */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span>🎾 Joacă</span>
              <span>{Math.round(stats.playfulness)}%</span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${stats.playfulness}%`,
                backgroundColor: '#8b5cf6',
                transition: 'width 0.3s',
              }} />
            </div>
          </div>

          {/* Current Action */}
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#4b5563',
          }}>
            <span style={{ fontWeight: 'bold' }}>Status: </span>
            {action === 'sleeping' && '😴 Doarme'}
            {action === 'sitting' && '😺 Stă'}
            {action === 'walking' && '🚶 Se plimbă'}
            {action === 'running' && '🏃 Aleargă'}
            {action === 'eating' && '😋 Mănâncă'}
            {action === 'playing' && '🎾 Se joacă'}
            {action === 'grooming' && '👅 Se spală'}
            {action === 'stretching' && '🙀 Se întinde'}
            {action === 'curious' && '👀 E curioasă'}
            {action === 'hunting' && '🐾 Vânează'}
            {action === 'pouncing' && '💨 Sare!'}
            {action === 'stealing_cursor' && '😼 Fură cursorul'}
            {action === 'dragging' && '😺 E ridicată'}
          </div>
        </div>
      )}

      {/* Stats toggle button in taskbar area */}
      <button
        onClick={() => setShowStats(prev => !prev)}
        style={{
          position: 'fixed',
          right: '180px',
          bottom: '18px',
          padding: '6px 12px',
          backgroundColor: showStats ? '#8b5cf6' : 'rgba(139, 92, 246, 0.2)',
          color: showStats ? 'white' : '#7c3aed',
          border: '2px solid rgba(139, 92, 246, 0.5)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 31,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#8b5cf6';
          e.currentTarget.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          if (!showStats) {
            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.2)';
            e.currentTarget.style.color = '#7c3aed';
          }
        }}
        title="Vezi statisticile lui Fifi"
      >
        <span>🐱</span>
        <span>Fifi</span>
      </button>

      {/* Stolen Cursor Paw */}
      {isStealingCursor && stolenCursorPos && (
        <div style={{
          position: 'fixed',
          left: stolenCursorPos.x - 18,
          top: stolenCursorPos.y - 18,
          zIndex: 999999,
          pointerEvents: 'none',
          fontSize: '32px',
          transform: `rotate(${Math.sin(frame * 0.25) * 25}deg)`,
          filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))',
        }}>
          🐾
        </div>
      )}

      <style>{`
        @keyframes fifi-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fifi-pop {
          0% { transform: scale(0.8) translateX(-50%); opacity: 0; }
          50% { transform: scale(1.05) translateX(-50%); }
          100% { transform: scale(1) translateX(-50%); opacity: 1; }
        }
        @keyframes fifi-float {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
      `}</style>
    </>
  );
};

export default Fifi;
