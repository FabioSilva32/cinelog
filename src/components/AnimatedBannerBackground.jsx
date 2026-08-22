import React from 'react';

export default function AnimatedBannerBackground({ bannerId, style = {} }) {
  if (!bannerId || !bannerId.startsWith('animated-')) return null;

  const type = bannerId.replace('animated-', '');

  if (type === 'stars') {
    return (
      <div
        style={{
          position: 'absolute', inset: 0, overflow: 'hidden',
          background: 'radial-gradient(ellipse at center, #150e28 0%, #080614 70%, #030208 100%)',
          ...style
        }}
      >
        {/* Deep cosmic nebulae clouds */}
        <div style={{ position: 'absolute', top: '-20%', left: '10%', width: '400px', height: '300px', background: 'radial-gradient(circle, rgba(124,111,247,0.2) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'auroraFlow 12s infinite alternate' }} />
        <div style={{ position: 'absolute', bottom: '0%', right: '15%', width: '450px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'auroraFlow 10s infinite alternate-reverse' }} />

        {/* 60+ Twinkling Stars generated via SVG for crisp render */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {[
            { cx: '5%', cy: '15%', r: 1.5, d: '0s', o: 0.8 },
            { cx: '12%', cy: '45%', r: 2.2, d: '1.2s', o: 0.9 },
            { cx: '18%', cy: '25%', r: 1.2, d: '0.4s', o: 0.7 },
            { cx: '25%', cy: '80%', r: 1.8, d: '2s', o: 0.85 },
            { cx: '32%', cy: '35%', r: 2.5, d: '1.5s', o: 1 },
            { cx: '40%', cy: '15%', r: 1.2, d: '0.8s', o: 0.7 },
            { cx: '48%', cy: '65%', r: 2.0, d: '2.5s', o: 0.9 },
            { cx: '55%', cy: '20%', r: 1.5, d: '0.2s', o: 0.75 },
            { cx: '62%', cy: '50%', r: 2.4, d: '1.8s', o: 1 },
            { cx: '70%', cy: '85%', r: 1.2, d: '0.9s', o: 0.6 },
            { cx: '78%', cy: '30%', r: 2.0, d: '2.2s', o: 0.85 },
            { cx: '85%', cy: '70%', r: 1.5, d: '1.1s', o: 0.8 },
            { cx: '92%', cy: '25%', r: 2.2, d: '0.5s', o: 0.95 },
            { cx: '8%', cy: '75%', r: 1.0, d: '1.7s', o: 0.65 },
            { cx: '22%', cy: '55%', r: 1.5, d: '2.8s', o: 0.8 },
            { cx: '37%', cy: '90%', r: 1.2, d: '0.3s', o: 0.7 },
            { cx: '66%', cy: '10%', r: 1.8, d: '1.4s', o: 0.85 },
            { cx: '82%', cy: '45%', r: 1.2, d: '2.1s', o: 0.7 },
            { cx: '95%', cy: '80%', r: 1.6, d: '0.7s', o: 0.8 },
            { cx: '15%', cy: '10%', r: 2.8, d: '1.9s', o: 1 },
            { cx: '50%', cy: '30%', r: 1.5, d: '0.6s', o: 0.75 },
            { cx: '88%', cy: '12%', r: 2.4, d: '2.4s', o: 0.9 }
          ].map((s, idx) => (
            <circle
              key={idx}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill="#fff"
              opacity={s.o}
              style={{
                filter: s.r > 2 ? 'drop-shadow(0 0 4px #93c5fd)' : 'none',
                animation: `starsTwinkle 2.5s infinite alternate ease-in-out ${s.d}`
              }}
            />
          ))}
        </svg>

        {/* 3 Continuous Shooting Stars / Meteors */}
        <div className="meteor-1" />
        <div className="meteor-2" />
        <div className="meteor-3" />
      </div>
    );
  }

  if (type === 'matrix') {
    const cols = [
      '101100101100101', '010011010011010', '110101010110101', '001011010010110',
      '101010101010101', '011001100110011', '111000111000111', '000111000111000',
      '100100100100100', '011011011011011', '110011001100110', '001100110011001',
      '101001010010100', '010110101101011', '111100001111000', '000011110000111',
      '101110111011101', '010001000100010', '110110110110110', '001001001001001',
      '101011010110101', '010100101001010', '111011101110111', '000100010001000'
    ];

    return (
      <div
        style={{
          position: 'absolute', inset: 0, overflow: 'hidden',
          background: '#020904',
          display: 'flex', justifyContent: 'space-between', padding: '0 8px',
          ...style
        }}
      >
        {cols.map((chars, i) => (
          <div
            key={i}
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'upright',
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: 900,
              color: '#22c55e',
              letterSpacing: '3px',
              textShadow: '0 0 8px #22c55e, 0 0 16px rgba(34,197,94,0.6)',
              animation: `matrixStream ${2.5 + (i % 5) * 0.5}s linear infinite`,
              animationDelay: `${(i * 0.18)}s`,
              opacity: 0.85
            }}
          >
            {chars}
          </div>
        ))}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, rgba(2,9,4,0.4) 60%, #020904 100%)', pointerEvents: 'none' }} />
      </div>
    );
  }

  if (type === 'synthwave') {
    return (
      <div
        style={{
          position: 'absolute', inset: 0, overflow: 'hidden',
          background: 'linear-gradient(180deg, #090217 0%, #1f053a 45%, #4a0e4e 75%, #0d0118 100%)',
          ...style
        }}
      >
        {/* Glowing Horizon Sun */}
        <div
          style={{
            position: 'absolute',
            top: '18px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            background: 'linear-gradient(to bottom, #fde047 0%, #f97316 50%, #ec4899 100%)',
            boxShadow: '0 0 50px rgba(251,191,36,0.9), 0 0 90px rgba(236,72,153,0.7)',
            overflow: 'hidden'
          }}
        >
          {/* Laser Cut horizontal lines across sun */}
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 10px, #1f053a 10px, #1f053a 14px)' }} />
        </div>

        {/* 3D Moving Perspective Wireframe Grid */}
        <div
          style={{
            position: 'absolute',
            bottom: 0, left: '-50%', right: '-50%', height: '62%',
            backgroundImage: `
              linear-gradient(rgba(236,72,153,0.85) 2px, transparent 2px),
              linear-gradient(90deg, rgba(6,182,212,0.85) 2px, transparent 2px)
            `,
            backgroundSize: '48px 24px',
            transform: 'perspective(160px) rotateX(65deg)',
            transformOrigin: 'bottom center',
            animation: 'synthwaveRoad 1.4s linear infinite',
            boxShadow: 'inset 0 10px 40px rgba(236,72,153,0.5)'
          }}
        />

        {/* Horizon Neon Laser Line */}
        <div style={{ position: 'absolute', top: '48%', left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #ec4899, #06b6d4, #ec4899, transparent)', boxShadow: '0 0 12px #ec4899' }} />
      </div>
    );
  }

  if (type === 'aurora') {
    return (
      <div
        style={{
          position: 'absolute', inset: 0, overflow: 'hidden',
          background: 'linear-gradient(135deg, #030712 0%, #061826 40%, #090a1a 100%)',
          ...style
        }}
      >
        <div style={{ position: 'absolute', inset: '-30%', background: 'radial-gradient(circle at 30% 40%, rgba(6,182,212,0.6) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(168,85,247,0.6) 0%, transparent 50%), radial-gradient(circle at 50% 30%, rgba(16,185,129,0.5) 0%, transparent 50%)', filter: 'blur(45px)', animation: 'auroraFlow 9s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', inset: '-20%', background: 'radial-gradient(circle at 60% 70%, rgba(236,72,153,0.4) 0%, transparent 55%), radial-gradient(circle at 40% 20%, rgba(56,189,248,0.5) 0%, transparent 50%)', filter: 'blur(55px)', animation: 'auroraFlow 13s ease-in-out infinite alternate-reverse' }} />
      </div>
    );
  }

  if (type === 'scanlines') {
    return (
      <div
        style={{
          position: 'absolute', inset: 0, overflow: 'hidden',
          background: 'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.2) 0%, rgba(20,12,6,0.95) 75%, #0a0604 100%)',
          ...style
        }}
      >
        {/* Projector Flicker Light Beam */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top center, rgba(251,191,36,0.3) 0%, transparent 70%)', animation: 'projectorFlicker 0.15s infinite' }} />
        {/* Moving Horizontal 35mm Scanlines */}
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.5) 3px, rgba(0,0,0,0.5) 5px)', opacity: 0.85 }} />
        <div style={{ position: 'absolute', top: '-100%', left: 0, right: 0, height: '100%', background: 'linear-gradient(to bottom, transparent, rgba(251,191,36,0.25), transparent)', animation: 'scanlineSweep 3.5s linear infinite' }} />
      </div>
    );
  }

  if (type === 'plasma') {
    return (
      <div
        style={{
          position: 'absolute', inset: 0, overflow: 'hidden',
          background: '#04010a',
          ...style
        }}
      >
        <div style={{ position: 'absolute', inset: '-40%', background: 'conic-gradient(from 0deg, #ec4899, #8b5cf6, #3b82f6, #06b6d4, #ec4899)', filter: 'blur(50px)', opacity: 0.6, animation: 'plasmaSpin 5s linear infinite' }} />
        <div style={{ position: 'absolute', inset: '-20%', background: 'radial-gradient(circle at center, rgba(236,72,153,0.4) 0%, transparent 60%)', filter: 'blur(30px)', animation: 'pulse-glow 2s infinite alternate' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, transparent 20%, rgba(4,1,10,0.85) 85%)' }} />
      </div>
    );
  }

  return null;
}
