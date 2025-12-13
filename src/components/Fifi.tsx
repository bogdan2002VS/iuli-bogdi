import React, { useState, useEffect, useRef, useCallback } from 'react';

// Fifi - A cute British Shorthair cat virtual pet
// Simple, clean design that actually looks good

type CatState = 'idle' | 'sleeping' | 'walking' | 'running' | 'eating' | 'held';

const Fifi: React.FC = () => {
  const [pos, setPos] = useState({ x: 250, y: 300 });
  const [state, setState] = useState<CatState>('idle');
  const [dir, setDir] = useState<1 | -1>(1);
  const [frame, setFrame] = useState(0);
  const [message, setMessage] = useState('');

  // Stats
  const [hunger, setHunger] = useState(25);
  const [showStats, setShowStats] = useState(false);

  // Interaction
  const [held, setHeld] = useState(false);
  const [holdOffset, setHoldOffset] = useState({ x: 0, y: 0 });
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);

  // Ball
  const [ballPos, setBallPos] = useState({ x: 150, y: 400 });
  const [ballVel, setBallVel] = useState({ x: 0, y: 0 });
  const [ballMoving, setBallMoving] = useState(false);

  // Food
  const [bowlFull, setBowlFull] = useState(false);
  const [foodLevel, setFoodLevel] = useState(0);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => setFrame(f => f + 1), 150);
    return () => clearInterval(interval);
  }, []);

  // Hunger increases over time
  useEffect(() => {
    const interval = setInterval(() => {
      setHunger(h => Math.min(100, h + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Random behaviors
  useEffect(() => {
    if (held || state === 'eating' || state === 'sleeping') return;

    const ai = setInterval(() => {
      if (hunger > 50 && bowlFull && state === 'idle') {
        setTarget({ x: window.innerWidth - 100, y: window.innerHeight - 150 });
        setState('running');
        setMessage('mâncare!');
        return;
      }

      if (state === 'idle' && Math.random() < 0.2) {
        if (Math.random() < 0.3) {
          setState('sleeping');
          setMessage('zzz...');
        } else {
          setTarget({
            x: 50 + Math.random() * (window.innerWidth - 200),
            y: 50 + Math.random() * (window.innerHeight - 200)
          });
          setState('walking');
        }
      }
    }, 3000);

    return () => clearInterval(ai);
  }, [state, hunger, bowlFull, held]);

  // Movement
  useEffect(() => {
    if (!target || held) return;

    const move = setInterval(() => {
      setPos(p => {
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 15) {
          setTarget(null);
          if (bowlFull && target.x > window.innerWidth - 150) {
            setState('eating');
            setMessage('nom nom~');
            const eat = setInterval(() => {
              setFoodLevel(f => {
                if (f <= 0) {
                  clearInterval(eat);
                  setBowlFull(false);
                  setState('idle');
                  setHunger(h => Math.max(0, h - 50));
                  setMessage('mulțumesc! 💕');
                  return 0;
                }
                return f - 10;
              });
            }, 100);
          } else {
            setState('idle');
          }
          return p;
        }

        setDir(dx > 0 ? 1 : -1);
        const speed = state === 'running' ? 6 : 3;
        return {
          x: p.x + (dx / dist) * speed,
          y: p.y + (dy / dist) * speed
        };
      });
    }, 30);

    return () => clearInterval(move);
  }, [target, state, held, bowlFull]);

  // Ball physics
  useEffect(() => {
    if (!ballMoving) return;

    const phys = setInterval(() => {
      setBallPos(p => {
        let nx = p.x + ballVel.x;
        let ny = p.y + ballVel.y;
        let vx = ballVel.x * 0.98;
        let vy = ballVel.y + 0.5;

        if (nx < 10 || nx > window.innerWidth - 40) vx = -vx * 0.7;
        if (ny > window.innerHeight - 80) {
          ny = window.innerHeight - 80;
          vy = -vy * 0.5;
          vx *= 0.9;
        }

        nx = Math.max(10, Math.min(window.innerWidth - 40, nx));
        setBallVel({ x: vx, y: vy });

        if (Math.abs(vx) < 0.3 && Math.abs(vy) < 0.3 && ny >= window.innerHeight - 85) {
          setBallMoving(false);
        }

        return { x: nx, y: ny };
      });
    }, 16);

    return () => clearInterval(phys);
  }, [ballMoving, ballVel]);

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
        y: Math.max(10, Math.min(window.innerHeight - 100, e.clientY - holdOffset.y))
      });
    };
    const up = () => {
      setHeld(false);
      setState('idle');
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
    if (bowlFull) return;
    setMessage('mâncare!');
    let amt = 0;
    const pour = setInterval(() => {
      amt += 20;
      setFoodLevel(amt);
      if (amt >= 100) {
        clearInterval(pour);
        setBowlFull(true);
        if (hunger > 30 && state === 'idle') {
          setTarget({ x: window.innerWidth - 100, y: window.innerHeight - 150 });
          setState('running');
        }
      }
    }, 50);
  }, [bowlFull, hunger, state]);

  // Kick ball
  const kickBall = useCallback(() => {
    setBallVel({ x: (Math.random() - 0.5) * 20, y: -15 });
    setBallMoving(true);
    if (state === 'idle') {
      setTarget({ x: ballPos.x, y: ballPos.y });
      setState('running');
      setMessage('minge!');
    }
  }, [state, ballPos]);

  // Clear message
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 2000);
    return () => clearTimeout(t);
  }, [message]);

  // Wake up when sleeping
  useEffect(() => {
    if (state !== 'sleeping') return;
    const t = setTimeout(() => {
      setState('idle');
      setMessage('*căscat*');
    }, 8000);
    return () => clearTimeout(t);
  }, [state]);

  // Animation values
  const walkBounce = state === 'walking' || state === 'running' ? Math.sin(frame * 0.8) * 3 : 0;
  const tailWag = Math.sin(frame * 0.3) * 15;
  const eyeBlink = frame % 30 === 0;

  // Cat SVG - Clean, cute design
  const CatSVG = () => (
    <svg
      width="80"
      height="70"
      viewBox="0 0 80 70"
      style={{
        transform: `scaleX(${dir}) translateY(${walkBounce}px)`,
        transition: 'transform 0.1s'
      }}
    >
      {/* Tail */}
      <path
        d={state === 'sleeping'
          ? "M15 50 Q5 45 8 35"
          : `M15 40 Q${5 + tailWag * 0.3} 30 ${10 + tailWag * 0.2} ${20 + Math.abs(tailWag) * 0.2}`
        }
        fill="none"
        stroke="#7a8a99"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {state === 'sleeping' ? (
        // Sleeping - curled up ball
        <>
          {/* Body curl */}
          <ellipse cx="40" cy="50" rx="25" ry="15" fill="#8a9aaa" />
          <ellipse cx="40" cy="48" rx="22" ry="12" fill="#9aacbb" />

          {/* Head resting */}
          <circle cx="55" cy="42" r="14" fill="#8a9aaa" />
          <circle cx="55" cy="41" r="12" fill="#9aacbb" />

          {/* Ear */}
          <path d="M62 30 L68 22 L65 32 Z" fill="#8a9aaa" />
          <path d="M63 31 L66 26 L65 32 Z" fill="#d4a5a5" />

          {/* Closed eyes */}
          <path d="M50 40 Q53 42 56 40" stroke="#333" strokeWidth="2" fill="none" />
          <path d="M58 39 Q61 41 64 39" stroke="#333" strokeWidth="2" fill="none" />

          {/* Nose */}
          <ellipse cx="60" cy="44" rx="2" ry="1.5" fill="#d4a5a5" />

          {/* Paw */}
          <ellipse cx="35" cy="58" rx="6" ry="4" fill="#bcc8d4" />

          {/* Zzz */}
          <text x="68" y="25" fontSize="10" fill="#666">z</text>
          <text x="72" y="20" fontSize="8" fill="#888">z</text>
        </>
      ) : (
        // Normal poses
        <>
          {/* Back legs */}
          <ellipse cx="22" cy="58" rx="7" ry="5" fill="#7a8a99" />
          <ellipse cx="28" cy="58" rx="7" ry="5" fill="#8a9aaa" />

          {/* Body */}
          <ellipse cx="35" cy="45" rx="20" ry="14" fill="#8a9aaa" />
          <ellipse cx="35" cy="43" rx="18" ry="12" fill="#9aacbb" />

          {/* Front legs */}
          {(state === 'walking' || state === 'running') ? (
            <>
              <rect x="42" y="52" width="6" height={12 + Math.sin(frame) * 3} rx="3" fill="#8a9aaa" />
              <rect x="50" y="52" width="6" height={12 - Math.sin(frame) * 3} rx="3" fill="#7a8a99" />
            </>
          ) : (
            <>
              <rect x="42" y="52" width="6" height="12" rx="3" fill="#8a9aaa" />
              <rect x="50" y="52" width="6" height="12" rx="3" fill="#7a8a99" />
            </>
          )}

          {/* Paws */}
          <ellipse cx="45" cy="65" rx="5" ry="3" fill="#bcc8d4" />
          <ellipse cx="53" cy="65" rx="5" ry="3" fill="#bcc8d4" />

          {/* Head */}
          <circle cx="55" cy="32" r="16" fill="#8a9aaa" />
          <circle cx="55" cy="31" r="14" fill="#9aacbb" />

          {/* Ears */}
          <path d="M42 20 L38 8 L48 18 Z" fill="#8a9aaa" />
          <path d="M43 19 L41 12 L47 18 Z" fill="#d4a5a5" />
          <path d="M65 18 L72 8 L68 20 Z" fill="#8a9aaa" />
          <path d="M66 18 L69 12 L67 19 Z" fill="#d4a5a5" />

          {/* Eyes */}
          {eyeBlink ? (
            <>
              <path d="M47 28 Q50 30 53 28" stroke="#333" strokeWidth="2" fill="none" />
              <path d="M57 28 Q60 30 63 28" stroke="#333" strokeWidth="2" fill="none" />
            </>
          ) : (
            <>
              <ellipse cx="50" cy="29" rx="4" ry="5" fill="#e8b600" />
              <ellipse cx="60" cy="29" rx="4" ry="5" fill="#e8b600" />
              <ellipse cx="51" cy="30" rx="2" ry="3" fill="#1a1a1a" />
              <ellipse cx="61" cy="30" rx="2" ry="3" fill="#1a1a1a" />
              <circle cx="49" cy="28" r="1" fill="white" />
              <circle cx="59" cy="28" r="1" fill="white" />
            </>
          )}

          {/* Nose */}
          <path d="M54 36 L56 36 L55 38 Z" fill="#d4a5a5" />

          {/* Mouth */}
          <path d="M55 38 Q52 41 50 39" stroke="#888" strokeWidth="1" fill="none" />
          <path d="M55 38 Q58 41 60 39" stroke="#888" strokeWidth="1" fill="none" />

          {/* Whiskers */}
          <g stroke="#aaa" strokeWidth="1">
            <line x1="40" y1="35" x2="30" y2="33" />
            <line x1="40" y1="37" x2="28" y2="38" />
            <line x1="40" y1="39" x2="30" y2="42" />
            <line x1="70" y1="35" x2="80" y2="33" />
            <line x1="70" y1="37" x2="82" y2="38" />
            <line x1="70" y1="39" x2="80" y2="42" />
          </g>

          {/* Collar */}
          <path d="M45 44 Q55 48 65 44" stroke="#4a90d9" strokeWidth="4" fill="none" />
          <circle cx="55" cy="47" r="3" fill="#ffd700" />
        </>
      )}
    </svg>
  );

  return (
    <>
      {/* Cat */}
      <div
        onMouseDown={onMouseDown}
        onClick={() => {
          if (state === 'sleeping') {
            setState('idle');
            setMessage('*căscat*');
          } else {
            setMessage(hunger > 60 ? 'foame...' : 'mrrr~ 💕');
          }
        }}
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          zIndex: 9999,
          cursor: held ? 'grabbing' : 'grab',
          filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))',
          userSelect: 'none',
        }}
      >
        <CatSVG />

        {message && (
          <div style={{
            position: 'absolute',
            top: -30,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'white',
            padding: '5px 12px',
            borderRadius: 12,
            border: '2px solid #7755cc',
            fontSize: 13,
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            {message}
          </div>
        )}

        {hunger > 60 && state !== 'sleeping' && state !== 'eating' && (
          <div style={{ position: 'absolute', top: -10, left: -5, fontSize: 18 }}>
            {hunger > 80 ? '😾' : '💭'}
          </div>
        )}
      </div>

      {/* Ball */}
      <div
        onClick={kickBall}
        style={{
          position: 'fixed',
          left: ballPos.x,
          top: ballPos.y,
          zIndex: 100,
          cursor: 'pointer',
          transform: ballMoving ? `rotate(${frame * 20}deg)` : 'none',
          transition: ballMoving ? 'none' : 'transform 0.3s',
        }}
      >
        <svg width="30" height="30" viewBox="0 0 30 30">
          <defs>
            <radialGradient id="ballGrad" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#ff6666" />
              <stop offset="100%" stopColor="#cc2222" />
            </radialGradient>
          </defs>
          <circle cx="15" cy="15" r="13" fill="url(#ballGrad)" stroke="#aa1111" strokeWidth="2" />
          <ellipse cx="10" cy="10" rx="4" ry="3" fill="rgba(255,255,255,0.4)" />
        </svg>
      </div>

      {/* Food area */}
      <div style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        zIndex: 100,
      }}>
        {/* Food packet */}
        <div
          onClick={pourFood}
          style={{
            cursor: bowlFull ? 'not-allowed' : 'pointer',
            opacity: bowlFull ? 0.5 : 1,
            transition: 'transform 0.2s, opacity 0.2s',
          }}
        >
          <svg width="35" height="50" viewBox="0 0 35 50">
            <rect x="5" y="5" width="25" height="40" rx="3" fill="#6655bb" stroke="#5544aa" strokeWidth="2" />
            <text x="17.5" y="28" textAnchor="middle" fontSize="20">🐱</text>
            <rect x="8" y="8" width="19" height="5" fill="#8877cc" />
            <path d="M10 5 L12 0 L14 5 M16 5 L18 0 L20 5 M22 5 L24 0 L26 5" stroke="#8877cc" strokeWidth="2" fill="none" />
          </svg>
        </div>

        {/* Bowl */}
        <div onClick={pourFood} style={{ cursor: bowlFull ? 'default' : 'pointer' }}>
          <svg width="50" height="30" viewBox="0 0 50 30">
            <defs>
              <linearGradient id="bowlGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#cc8800" />
                <stop offset="50%" stopColor="#ffaa22" />
                <stop offset="100%" stopColor="#cc8800" />
              </linearGradient>
            </defs>
            <ellipse cx="25" cy="25" rx="23" ry="8" fill="url(#bowlGrad)" />
            <ellipse cx="25" cy="10" rx="20" ry="6" fill="#664400" />
            <path d="M5 10 Q5 25 25 25 Q45 25 45 10" fill="url(#bowlGrad)" />
            {foodLevel > 0 && (
              <ellipse
                cx="25"
                cy={15 - foodLevel * 0.05}
                rx={15 - (100 - foodLevel) * 0.05}
                ry={4}
                fill="#885533"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Stats */}
      {showStats && (
        <div style={{
          position: 'fixed',
          right: 80,
          bottom: 60,
          background: 'white',
          padding: '10px 15px',
          borderRadius: 10,
          border: '2px solid #7755cc',
          fontSize: 12,
          zIndex: 10000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        }}>
          <div style={{ fontWeight: 'bold', color: '#5533aa', marginBottom: 6 }}>🐱 Fifi</div>
          <div style={{ marginBottom: 4 }}>
            🍽️ Foame: {Math.round(hunger)}%
            <div style={{ height: 6, background: '#eee', borderRadius: 3, marginTop: 2 }}>
              <div style={{
                height: '100%',
                width: `${hunger}%`,
                background: hunger > 70 ? '#dd3333' : '#33aa33',
                borderRadius: 3,
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
          <div style={{ fontSize: 10, color: '#666', marginTop: 6 }}>
            {state === 'sleeping' ? '😴 Doarme' :
             state === 'eating' ? '😋 Mănâncă' :
             state === 'walking' ? '🚶 Se plimbă' :
             state === 'running' ? '🏃 Aleargă' :
             '😺 Relaxată'}
          </div>
        </div>
      )}

      <button
        onClick={() => setShowStats(s => !s)}
        style={{
          position: 'fixed',
          right: 100,
          bottom: 20,
          padding: '6px 12px',
          background: showStats ? '#7755cc' : 'white',
          color: showStats ? 'white' : '#7755cc',
          border: '2px solid #7755cc',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 'bold',
          zIndex: 101,
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        }}
      >
        🐱 Fifi
      </button>
    </>
  );
};

export default Fifi;
