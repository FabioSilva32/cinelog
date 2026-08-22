import React from 'react';
import { BORDER_STYLES } from '../utils/achievements';
import { Sparkles, Flame } from 'lucide-react';

export const DEFAULT_GREY_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><circle cx="64" cy="64" r="64" fill="%23242038"/><circle cx="64" cy="45" r="22" fill="%239ca3af"/><path d="M64 74c-22 0-38 14-38 32v6h76v-6c0-18-16-32-38-32z" fill="%239ca3af"/></svg>`;

export default function AvatarWithBorder({ src, username, borderId, size = 96, onClick, className, style, onError }) {
  const activeBorder = borderId || 'none';
  const borderConfig = BORDER_STYLES[activeBorder] || BORDER_STYLES.none;
  const borderStyle = borderConfig.style || BORDER_STYLES.none.style;

  const isSmall = size < 48;
  const borderWidth = isSmall ? '2px' : '4px';

  // Build the outer wrapper styles
  const wrapperStyle = {
    position: 'relative',
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    minHeight: `${size}px`,
    maxWidth: `${size}px`,
    maxHeight: `${size}px`,
    aspectRatio: '1 / 1',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    boxSizing: 'border-box',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.3s ease',
    ...borderStyle,
    // Override widths/borders dynamically
    borderWidth: borderStyle.border === 'none' ? '0' : borderWidth,
    ...style
  };

  const finalSrc = src && src.trim() ? src : DEFAULT_GREY_AVATAR;

  return (
    <div className={className} onClick={onClick} style={wrapperStyle}>
      {/* Avatar Image inside the frame */}
      <img
        src={finalSrc}
        alt={username || 'Profile'}
        style={{
          width: '100%',
          height: '100%',
          minWidth: '100%',
          minHeight: '100%',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          objectFit: 'cover',
          display: 'block',
          boxSizing: 'border-box',
          flexShrink: 0,
          // Pad the image if the border is a background-gradient boundary
          padding: borderStyle.border?.includes('transparent') ? (isSmall ? '2px' : '3.5px') : '0',
          background: 'var(--bg-dark)'
        }}
        onError={onError || (e => e.target.src = DEFAULT_GREY_AVATAR)}
      />

      {/* Decorative details for premium borders */}
      {!isSmall && (
        <>
          {/* Creator Border Details (3D floating Crown on top) */}
          {activeBorder === 'creator' && (
            <div style={{
              position: 'absolute',
              top: '-14px',
              left: '50%',
              transform: 'translateX(-50%) rotate(-5deg)',
              fontSize: '18px',
              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))',
              pointerEvents: 'none',
              animation: 'ambientPulse 2s infinite alternate',
              zIndex: 10
            }}>
              👑
            </div>
          )}

          {/* Cyber Neon Details (tech corners absolute overlays) */}
          {activeBorder === 'cyber-neon' && (
            <>
              <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '10px', height: '10px', borderLeft: '2.5px solid #06b6d4', borderTop: '2.5px solid #06b6d4', borderTopLeftRadius: '3px', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '-1px', right: '-1px', width: '10px', height: '10px', borderRight: '2.5px solid #06b6d4', borderTop: '2.5px solid #06b6d4', borderTopRightRadius: '3px', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-1px', left: '-1px', width: '10px', height: '10px', borderLeft: '2.5px solid #d946ef', borderBottom: '2.5px solid #d946ef', borderBottomLeftRadius: '3px', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '10px', height: '10px', borderRight: '2.5px solid #d946ef', borderBottom: '2.5px solid #d946ef', borderBottomRightRadius: '3px', pointerEvents: 'none' }} />
            </>
          )}

          {/* Starry Sparkle Details (glowing floating stars) */}
          {activeBorder === 'starry' && (
            <>
              <Sparkles size={13} color="#fbbf24" style={{ position: 'absolute', top: '1px', right: '1px', animation: 'ambientPulse 1.5s infinite alternate', filter: 'drop-shadow(0 0 5px #fbbf24)' }} />
              <Sparkles size={9} color="#3b82f6" style={{ position: 'absolute', bottom: '6px', left: '-4px', animation: 'ambientPulse 2s infinite alternate-reverse', filter: 'drop-shadow(0 0 4px #3b82f6)' }} />
            </>
          )}

          {/* Fire Glow Details (solar flares/sparks) */}
          {activeBorder === 'fire-glow' && (
            <>
              <Flame size={14} color="#f97316" style={{ position: 'absolute', top: '-9px', right: '12px', transform: 'rotate(12deg)', animation: 'ambientPulse 1.2s infinite alternate', filter: 'drop-shadow(0 0 5px #f97316)' }} />
              <div style={{ position: 'absolute', bottom: '2px', right: '-4px', width: '5px', height: '5px', borderRadius: '50%', background: '#ef4444', animation: 'ambientPulse 1.1s infinite alternate-reverse', boxShadow: '0 0 8px #ef4444' }} />
              <div style={{ position: 'absolute', top: '32px', left: '-5px', width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', animation: 'ambientPulse 1.6s infinite alternate', boxShadow: '0 0 8px #f59e0b' }} />
            </>
          )}

          {/* Crystal Diamond Details (3D sparkling diamond facets) */}
          {activeBorder === 'crystal-diamond' && (
            <>
              <div style={{
                position: 'absolute',
                top: '-3px',
                left: '22px',
                width: '6px',
                height: '6px',
                background: '#fff',
                transform: 'rotate(45deg)',
                boxShadow: '0 0 8px #fff, 0 0 16px #38bdf8',
                animation: 'ambientPulse 1.4s infinite alternate'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '12px',
                right: '-3px',
                width: '5px',
                height: '5px',
                background: '#e0f2fe',
                transform: 'rotate(45deg)',
                boxShadow: '0 0 8px #38bdf8',
                animation: 'ambientPulse 1.8s infinite alternate-reverse'
              }} />
            </>
          )}
        </>
      )}
    </div>
  );
}
