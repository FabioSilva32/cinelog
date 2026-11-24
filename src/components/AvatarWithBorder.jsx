import EarnedFrameArt,{FRAME_ART} from './EarnedFrameArt';
import React from 'react';
import { BORDER_STYLES } from '../utils/achievements';
import { Sparkles, Flame } from 'lucide-react';

export const DEFAULT_GREY_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><circle cx="64" cy="64" r="64" fill="%23242424"/><circle cx="64" cy="45" r="22" fill="%239ca3af"/><path d="M64 74c-22 0-38 14-38 32v6h76v-6c0-18-16-32-38-32z" fill="%239ca3af"/></svg>`;

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
    <div className={className} data-frame={activeBorder} onClick={onClick} style={wrapperStyle}>
      {activeBorder==='creator'&&<svg aria-hidden="true" viewBox="0 0 120 120" style={{position:'absolute',inset:'-10%',width:'120%',height:'120%',pointerEvents:'none',overflow:'visible',zIndex:2}}>
        <circle cx="60" cy="60" r="51" fill="none" stroke="#7f1930" strokeWidth="5"/>
        <circle cx="60" cy="60" r="53" fill="none" stroke="#f0ce91" strokeWidth=".8" strokeDasharray="64 19" transform="rotate(-30 60 60)"/>
        <circle cx="60" cy="60" r="48.5" fill="none" stroke="#ff3554" strokeWidth="1.5"/>
        {Array.from({length:12},(_,i)=><path key={i} d="M58 7 L62 7 L62 10 L58 10 Z" fill={i%3===0?'#f6dba5':'#d34458'} transform={'rotate('+(i*30)+' 60 60)'}/>)}
        {!isSmall&&<>{[-1,1].map(side=><g key={side} transform={side===1?'translate(120 0) scale(-1 1)':undefined} fill="none" stroke="#dab578" strokeWidth="1.3" strokeLinecap="round"><path d="M34 101 Q8 87 12 58"/>{[0,1,2,3].map(i=><path key={i} d={'M'+(14+i*3)+' '+(67+i*8)+' q-9 -1 -10 -9 q9 0 10 9 M'+(14+i*3)+' '+(67+i*8)+' q8 -6 5 -12 q-8 4 -5 12'}/>)}</g>)}
          <path d="M47 10 L50 1 L55 6 L60 -2 L65 6 L70 1 L73 10 L69 16 L51 16 Z" fill="#171315" stroke="#efd29a" strokeWidth="1.2"/>
          <path d="M56 9 L60 4 L64 9 L60 14 Z" fill="#ff3554"/>
          <path d="M38 103 L82 103 L79 116 L41 116 Z" fill="#201417" stroke="#caa66c" strokeWidth=".9"/>
          <text x="60" y="111.5" textAnchor="middle" fill="#f3d8a3" fontSize="5.5" fontFamily="Arial,sans-serif" fontWeight="700" letterSpacing="1.3">FOUNDER</text>
        </>}
      </svg>}
      <EarnedFrameArt id={activeBorder} small={isSmall}/>
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
          objectPosition: style?.objectPosition || (finalSrc && finalSrc.includes('image.tmdb.org') ? 'center 18%' : 'center center'),
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
      {!isSmall && !FRAME_ART[activeBorder] && (
        <>
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

