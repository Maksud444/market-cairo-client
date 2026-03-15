import { useEffect, useState } from 'react';

export default function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setVisible(false);
        onDone?.();
      }, 600);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        backgroundColor: '#dc2626',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        transition: 'opacity 0.6s ease',
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? 'none' : 'all',
      }}
    >
      {/* Animated circles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', width: 400, height: 400,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
          top: -100, right: -100,
          animation: 'splashPulse 2s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300,
          borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
          bottom: -80, left: -80,
          animation: 'splashPulse 2s ease-in-out infinite 0.5s',
        }} />
      </div>

      {/* Logo */}
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80,
          background: 'white',
          borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'splashBounce 0.6s ease',
        }}>
          <span style={{ fontSize: 40, fontWeight: 900, color: '#dc2626' }}>M</span>
        </div>
        <h1 style={{
          color: 'white', fontSize: 32, fontWeight: 900,
          letterSpacing: '-0.5px', margin: '0 0 8px',
          animation: 'splashFadeIn 0.8s ease 0.3s both',
        }}>MySouqify</h1>
        <p style={{
          color: 'rgba(255,255,255,0.8)', fontSize: 14,
          animation: 'splashFadeIn 0.8s ease 0.5s both',
        }}>Cairo&apos;s trusted marketplace</p>

        {/* Loading dots */}
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'center',
          marginTop: 40,
          animation: 'splashFadeIn 0.8s ease 0.8s both',
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 8, height: 8,
              borderRadius: '50%',
              background: 'white',
              animation: `splashDot 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes splashBounce {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes splashFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes splashPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
