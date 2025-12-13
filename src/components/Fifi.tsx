import React, { useState, useEffect, useCallback } from 'react';

type CatState = 'idle' | 'sleeping' | 'walking' | 'running' | 'eating' | 'held';

const Fifi: React.FC = () => {
  const [pos, setPos] = useState({ x: 250, y: window.innerHeight - 120 });
  const [state, setState] = useState<CatState>('idle');
  const [dir, setDir] = useState<1 | -1>(1);
  const [frame, setFrame] = useState(0);
  const [message, setMessage] = useState('');
  const [hunger, setHunger] = useState(25);
  const [showStats, setShowStats] = useState(false);
  const [held, setHeld] = useState(false);
  const [holdOffset, setHoldOffset] = useState({ x: 0, y: 0 });
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);
  const [ballPos, setBallPos] = useState({ x: 120, y: window.innerHeight - 60 });
  const [ballVel, setBallVel] = useState({ x: 0, y: 0 });
  const [ballMoving, setBallMoving] = useState(false);
  const [bowlFull, setBowlFull] = useState(false);
  const [foodLevel, setFoodLevel] = useState(0);

  // Smooth 60fps animation
  useEffect(() => {
    let id: number;
    let last = 0;
    const tick = (t: number) => {
      if (t - last > 16) { // 60fps
        setFrame(f => f + 1);
        last = t;
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  // Hunger
  useEffect(() => {
    const i = setInterval(() => setHunger(h => Math.min(100, h + 1)), 3000);
    return () => clearInterval(i);
  }, []);

  // AI behavior
  useEffect(() => {
    if (held || state === 'eating' || state === 'sleeping') return;
    const ai = setInterval(() => {
      if (hunger > 50 && bowlFull && state === 'idle') {
        setTarget({ x: window.innerWidth - 80, y: window.innerHeight - 120 });
        setState('running');
        setMessage('mâncare!');
        return;
      }
      if (state === 'idle' && Math.random() < 0.15) {
        if (Math.random() < 0.2) {
          setState('sleeping');
          setMessage('zzz...');
        } else {
          setTarget({
            x: 80 + Math.random() * (window.innerWidth - 250),
            y: window.innerHeight - 120
          });
          setState('walking');
        }
      }
    }, 2500);
    return () => clearInterval(ai);
  }, [state, hunger, bowlFull, held]);

  // Smooth movement
  useEffect(() => {
    if (!target || held) return;
    let id: number;
    const move = () => {
      setPos(p => {
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 5) {
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
                return f - 5;
              });
            }, 50);
          } else {
            setState('idle');
          }
          return p;
        }
        if (dx !== 0) setDir(dx > 0 ? 1 : -1);
        const speed = state === 'running' ? 4 : 2;
        return {
          x: p.x + (dx / dist) * speed,
          y: p.y + (dy / dist) * speed
        };
      });
      id = requestAnimationFrame(move);
    };
    id = requestAnimationFrame(move);
    return () => cancelAnimationFrame(id);
  }, [target, state, held, bowlFull]);

  // Ball physics - smooth
  useEffect(() => {
    if (!ballMoving) return;
    let id: number;
    const phys = () => {
      setBallPos(p => {
        let nx = p.x + ballVel.x;
        let ny = p.y + ballVel.y;
        let vx = ballVel.x * 0.99;
        let vy = ballVel.y + 0.3;
        if (nx < 15 || nx > window.innerWidth - 35) { vx = -vx * 0.7; nx = Math.max(15, Math.min(window.innerWidth - 35, nx)); }
        if (ny > window.innerHeight - 55) { ny = window.innerHeight - 55; vy = -vy * 0.6; vx *= 0.95; }
        setBallVel({ x: vx, y: vy });
        if (Math.abs(vx) < 0.2 && Math.abs(vy) < 0.2 && ny >= window.innerHeight - 60) setBallMoving(false);
        return { x: nx, y: ny };
      });
      id = requestAnimationFrame(phys);
    };
    id = requestAnimationFrame(phys);
    return () => cancelAnimationFrame(id);
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
    const move = (e: MouseEvent) => setPos({
      x: Math.max(40, Math.min(window.innerWidth - 80, e.clientX - holdOffset.x)),
      y: Math.max(40, Math.min(window.innerHeight - 80, e.clientY - holdOffset.y))
    });
    const up = () => { setHeld(false); setState('idle'); };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    return () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
  }, [held, holdOffset]);

  const pourFood = useCallback(() => {
    if (bowlFull) return;
    setMessage('mâncare!');
    let amt = 0;
    const pour = setInterval(() => {
      amt += 10;
      setFoodLevel(amt);
      if (amt >= 100) {
        clearInterval(pour);
        setBowlFull(true);
        if (hunger > 25 && state === 'idle') {
          setTarget({ x: window.innerWidth - 80, y: window.innerHeight - 120 });
          setState('running');
        }
      }
    }, 30);
  }, [bowlFull, hunger, state]);

  const kickBall = useCallback(() => {
    setBallVel({ x: (Math.random() - 0.5) * 12, y: -8 - Math.random() * 4 });
    setBallMoving(true);
    if (state === 'idle') {
      setTarget({ x: ballPos.x, y: window.innerHeight - 120 });
      setState('running');
      setMessage('minge!');
    }
  }, [state, ballPos]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 2000);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    if (state !== 'sleeping') return;
    const t = setTimeout(() => { setState('idle'); setMessage('*căscat*'); }, 6000);
    return () => clearTimeout(t);
  }, [state]);

  // Animation calculations - smooth sine waves
  const t = frame * 0.1;
  const isMoving = state === 'walking' || state === 'running';
  const walkSpeed = state === 'running' ? 0.4 : 0.25;
  const walkCycle = Math.sin(frame * walkSpeed);
  const bounce = isMoving ? Math.abs(Math.sin(frame * walkSpeed * 2)) * 2 : 0;
  const tailSwing = Math.sin(t * 0.8) * (isMoving ? 25 : 12);
  const earTwitch = Math.sin(t * 0.3) * 2;
  const breathe = Math.sin(t * 0.15) * 1.5;

  return (
    <>
      {/* Cat */}
      <div
        onMouseDown={onMouseDown}
        onClick={() => {
          if (state === 'sleeping') { setState('idle'); setMessage('*căscat*'); }
          else setMessage(hunger > 60 ? 'foame...' : 'mrrr~ 💕');
        }}
        style={{
          position: 'fixed',
          left: pos.x - 40,
          top: pos.y - 50 - bounce,
          zIndex: 9999,
          cursor: held ? 'grabbing' : 'grab',
          filter: 'drop-shadow(1px 3px 3px rgba(0,0,0,0.25))',
          userSelect: 'none',
        }}
      >
        <svg width="80" height="60" viewBox="0 0 80 60" style={{ overflow: 'visible', transform: `scaleX(${dir})` }}>
          {state === 'sleeping' ? (
            // Sleeping - curled ball
            <g>
              <ellipse cx="40" cy="45" rx="28" ry="12" fill="#9aacbb">
                <animate attributeName="ry" values="12;13;12" dur="2s" repeatCount="indefinite"/>
              </ellipse>
              <ellipse cx="40" cy="44" rx="25" ry="10" fill="#aabbcc"/>
              <circle cx="55" cy="40" r="12" fill="#9aacbb"/>
              <circle cx="55" cy="39" r="10" fill="#aabbcc"/>
              <path d="M63 32 L67 26 L64 33 Z" fill="#9aacbb"/>
              <path d="M64 32 L66 28 L64 33 Z" fill="#c9a0a0"/>
              <path d="M48 38 Q51 40 54 38" stroke="#555" strokeWidth="1.5" fill="none"/>
              <path d="M56 37 Q59 39 62 37" stroke="#555" strokeWidth="1.5" fill="none"/>
              <ellipse cx="58" cy="42" rx="2" ry="1.2" fill="#d4a5a5"/>
              <ellipse cx="30" cy="50" rx="5" ry="3" fill="#bcc8d4"/>
              <path d="M15 42 Q8 38 10 30" stroke="#9aacbb" strokeWidth="5" strokeLinecap="round" fill="none">
                <animate attributeName="d" values="M15 42 Q8 38 10 30;M15 42 Q7 39 9 31;M15 42 Q8 38 10 30" dur="3s" repeatCount="indefinite"/>
              </path>
              <text x="68" y="28" fontSize="8" fill="#666" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.5s" repeatCount="indefinite"/>
                z
              </text>
              <text x="72" y="22" fontSize="6" fill="#888" opacity="0.6">
                <animate attributeName="opacity" values="0.6;0.3;0.6" dur="1.5s" repeatCount="indefinite" begin="0.3s"/>
                z
              </text>
            </g>
          ) : (
            // Active cat
            <g>
              {/* Tail - smooth animated */}
              <path
                d={`M12 38 Q${2 + tailSwing * 0.3} ${30 - Math.abs(tailSwing) * 0.15} ${8 + tailSwing * 0.2} ${18 - Math.abs(tailSwing) * 0.1}`}
                stroke="#8a9aaa"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Back legs */}
              <ellipse cx="20" cy={52 + (isMoving ? walkCycle * 1.5 : 0)} rx="6" ry="4" fill="#8a9aaa"/>
              <ellipse cx="26" cy={52 - (isMoving ? walkCycle * 1.5 : 0)} rx="6" ry="4" fill="#9aacbb"/>

              {/* Body - breathing */}
              <ellipse cx="35" cy={40 + breathe * 0.3} rx={18 + breathe * 0.5} ry={11 + breathe * 0.3} fill="#9aacbb"/>
              <ellipse cx="35" cy={39 + breathe * 0.3} rx={16 + breathe * 0.4} ry={9 + breathe * 0.2} fill="#aabbcc"/>

              {/* Front legs - walk cycle */}
              <rect x="44" y={42} width="5" height={isMoving ? 10 + walkCycle * 2 : 10} rx="2.5" fill="#9aacbb"/>
              <rect x="51" y={42} width="5" height={isMoving ? 10 - walkCycle * 2 : 10} rx="2.5" fill="#8a9aaa"/>

              {/* Paws */}
              <ellipse cx="46.5" cy={53 + (isMoving ? walkCycle * 2 : 0)} rx="4" ry="2.5" fill="#c5d0db"/>
              <ellipse cx="53.5" cy={53 - (isMoving ? walkCycle * 2 : 0)} rx="4" ry="2.5" fill="#c5d0db"/>

              {/* Head */}
              <circle cx="55" cy="28" r="14" fill="#9aacbb"/>
              <circle cx="55" cy="27" r="12" fill="#aabbcc"/>

              {/* Ears - twitching */}
              <path d={`M43 18 L${40 + earTwitch} 6 L48 16 Z`} fill="#9aacbb"/>
              <path d={`M44 17 L${42 + earTwitch * 0.5} 10 L47 16 Z`} fill="#c9a0a0"/>
              <path d={`M64 16 L${70 - earTwitch} 6 L67 18 Z`} fill="#9aacbb"/>
              <path d={`M65 16 L${68 - earTwitch * 0.5} 10 L66 17 Z`} fill="#c9a0a0"/>

              {/* Eyes - blinking */}
              {frame % 180 < 6 ? (
                <>
                  <path d="M47 26 Q50 28 53 26" stroke="#444" strokeWidth="1.5" fill="none"/>
                  <path d="M57 26 Q60 28 63 26" stroke="#444" strokeWidth="1.5" fill="none"/>
                </>
              ) : (
                <>
                  <ellipse cx="50" cy="26" rx="3.5" ry="4.5" fill="#e8b600"/>
                  <ellipse cx="60" cy="26" rx="3.5" ry="4.5" fill="#e8b600"/>
                  <ellipse cx="50.5" cy="27" rx="1.8" ry="2.8" fill="#222"/>
                  <ellipse cx="60.5" cy="27" rx="1.8" ry="2.8" fill="#222"/>
                  <circle cx="49" cy="25" r="1" fill="white" opacity="0.9"/>
                  <circle cx="59" cy="25" r="1" fill="white" opacity="0.9"/>
                </>
              )}

              {/* Nose */}
              <path d="M54.5 32 L55.5 32 L55 34 Z" fill="#d4a5a5"/>

              {/* Mouth */}
              <path d="M55 34 Q52 36 50 35" stroke="#999" strokeWidth="0.8" fill="none"/>
              <path d="M55 34 Q58 36 60 35" stroke="#999" strokeWidth="0.8" fill="none"/>

              {/* Whiskers */}
              <g stroke="#bbb" strokeWidth="0.6" opacity="0.7">
                <line x1="42" y1="31" x2="32" y2="29"/>
                <line x1="42" y1="33" x2="30" y2="34"/>
                <line x1="42" y1="35" x2="32" y2="38"/>
                <line x1="68" y1="31" x2="78" y2="29"/>
                <line x1="68" y1="33" x2="80" y2="34"/>
                <line x1="68" y1="35" x2="78" y2="38"/>
              </g>

              {/* Collar */}
              <path d="M46 40 Q55 43 64 40" stroke="#4a90d9" strokeWidth="3" fill="none"/>
              <circle cx="55" cy="42" r="2.5" fill="#ffd700"/>
            </g>
          )}
        </svg>

        {message && (
          <div style={{
            position: 'absolute',
            top: -25,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'white',
            padding: '4px 10px',
            borderRadius: 10,
            border: '2px solid #7755cc',
            fontSize: 12,
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            animation: 'fadeIn 0.15s ease-out',
          }}>
            {message}
          </div>
        )}

        {hunger > 60 && state !== 'sleeping' && state !== 'eating' && (
          <div style={{ position: 'absolute', top: -8, left: 0, fontSize: 16 }}>
            {hunger > 80 ? '😾' : '💭'}
          </div>
        )}
      </div>

      {/* Ball */}
      <div
        onClick={kickBall}
        style={{
          position: 'fixed',
          left: ballPos.x - 12,
          top: ballPos.y - 12,
          zIndex: 100,
          cursor: 'pointer',
          transform: `rotate(${ballMoving ? frame * 8 : 0}deg)`,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24">
          <defs>
            <radialGradient id="ball" cx="35%" cy="35%">
              <stop offset="0%" stopColor="#ff7777"/>
              <stop offset="100%" stopColor="#cc2222"/>
            </radialGradient>
          </defs>
          <circle cx="12" cy="12" r="10" fill="url(#ball)" stroke="#aa1111" strokeWidth="1.5"/>
          <ellipse cx="8" cy="8" rx="3" ry="2" fill="rgba(255,255,255,0.35)"/>
        </svg>
      </div>

      {/* Food - bottom right */}
      <div style={{
        position: 'fixed',
        right: 15,
        bottom: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
        zIndex: 100,
      }}>
        <div onClick={pourFood} style={{ cursor: bowlFull ? 'not-allowed' : 'pointer', opacity: bowlFull ? 0.5 : 1 }}>
          <svg width="28" height="40" viewBox="0 0 28 40">
            <rect x="4" y="4" width="20" height="32" rx="2" fill="#6655bb" stroke="#5544aa" strokeWidth="1.5"/>
            <text x="14" y="22" textAnchor="middle" fontSize="14">🐱</text>
            <rect x="6" y="6" width="16" height="4" fill="#8877cc"/>
            <path d="M8 4 L9 0 M14 4 L14 0 M19 4 L20 0" stroke="#8877cc" strokeWidth="1.5"/>
          </svg>
        </div>
        <div onClick={pourFood} style={{ cursor: bowlFull ? 'default' : 'pointer' }}>
          <svg width="40" height="22" viewBox="0 0 40 22">
            <defs>
              <linearGradient id="bowl" x1="0%" y1="0%" x2="100%">
                <stop offset="0%" stopColor="#cc8800"/>
                <stop offset="50%" stopColor="#ffaa22"/>
                <stop offset="100%" stopColor="#cc8800"/>
              </linearGradient>
            </defs>
            <ellipse cx="20" cy="18" rx="18" ry="5" fill="url(#bowl)"/>
            <ellipse cx="20" cy="8" rx="15" ry="4" fill="#553300"/>
            <path d="M4 8 Q4 18 20 18 Q36 18 36 8" fill="url(#bowl)"/>
            {foodLevel > 0 && <ellipse cx="20" cy={10 - foodLevel * 0.03} rx={12} ry={3} fill="#774422"/>}
          </svg>
        </div>
      </div>

      {/* Stats button */}
      <button
        onClick={() => setShowStats(s => !s)}
        style={{
          position: 'fixed',
          right: 70,
          bottom: 15,
          padding: '5px 10px',
          background: showStats ? '#7755cc' : 'white',
          color: showStats ? 'white' : '#7755cc',
          border: '2px solid #7755cc',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 'bold',
          zIndex: 101,
        }}
      >
        🐱 Fifi
      </button>

      {showStats && (
        <div style={{
          position: 'fixed',
          right: 70,
          bottom: 50,
          background: 'white',
          padding: '8px 12px',
          borderRadius: 8,
          border: '2px solid #7755cc',
          fontSize: 11,
          zIndex: 10000,
        }}>
          <div style={{ fontWeight: 'bold', color: '#5533aa', marginBottom: 4 }}>🐱 Fifi</div>
          <div>
            🍽️ {Math.round(hunger)}%
            <div style={{ height: 5, background: '#eee', borderRadius: 2, marginTop: 2 }}>
              <div style={{ height: '100%', width: `${hunger}%`, background: hunger > 70 ? '#d33' : '#3a3', borderRadius: 2 }}/>
            </div>
          </div>
          <div style={{ fontSize: 9, color: '#666', marginTop: 4 }}>
            {state === 'sleeping' ? '😴 Doarme' : state === 'eating' ? '😋 Mănâncă' : state === 'walking' ? '🚶 Se plimbă' : state === 'running' ? '🏃 Aleargă' : '😺 Relaxată'}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(5px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>
    </>
  );
};

export default Fifi;
