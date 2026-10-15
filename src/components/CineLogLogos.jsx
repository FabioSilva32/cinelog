import React from 'react';

export const ALL_CINELOG_LOGOS = [
  // ── CATEGORY 1: GEOMETRIC & MODERN ──
  {
    id: 'aperture-c',
    number: 1,
    name: 'The 35mm Aperture Shutter',
    category: 'Geometric & Modern',
    tagline: 'Precision Optics',
    desc: 'Anamorphic lens iris forming a bold geometric "C" with glowing crimson blades and a golden focal point.',
    render: (size = 32) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32 }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#0d0b16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="14" stroke="#c0392b" strokeWidth="2.5" />
          <path d="M14 12L25 14L22 26L11 24Z" fill="#c0392b" fillOpacity="0.4" stroke="#c0392b" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="4.5" fill="#fbbf24" />
          <circle cx="20" cy="20" r="2" fill="#fff" />
        </svg>
        <span style={{ fontSize: size * 0.62, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
          Cine<span style={{ color: '#c0392b' }}>Log</span>
        </span>
      </div>
    )
  },
  {
    id: 'filmstrip-c',
    number: 2,
    name: 'The Anamorphic Filmstrip C',
    category: 'Geometric & Modern',
    tagline: 'Classic Celluloid',
    desc: 'Curved cinema filmstrip forming an open "C" silhouette with four precision rectangular sprocket cutouts.',
    render: (size = 32) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32 }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="linear-gradient(135deg, #c0392b 0%, #880808 100%)" />
          <path d="M28 12C24 9 14 9 11 16C8 23 11 30 18 31C24 32 28 28 28 28" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <rect x="12" y="14" width="3" height="4" rx="0.8" fill="#ffffff" />
          <rect x="10" y="20" width="3" height="4" rx="0.8" fill="#ffffff" />
          <rect x="13" y="26" width="3" height="4" rx="0.8" fill="#ffffff" />
          <circle cx="24" cy="20" r="3" fill="#ffffff" />
        </svg>
        <span style={{ fontSize: size * 0.62, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
          Cine<span style={{ color: '#c0392b' }}>Log</span>
        </span>
      </div>
    )
  },
  {
    id: 'infinite-reel',
    number: 3,
    name: 'The Infinity Film Reel',
    category: 'Geometric & Modern',
    tagline: 'Endless Stories',
    desc: 'Möbius-style intertwined double infinity loops representing continuous film reels and diary tracking.',
    render: (size = 32) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32 }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#120e20" stroke="rgba(192,57,43,0.3)" strokeWidth="1.5" />
          <path d="M13 20C13 16.5 16.5 14 20 20C23.5 26 27 23.5 27 20C27 16.5 23.5 14 20 20C16.5 26 13 23.5 13 20Z" stroke="#c0392b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="15.5" cy="20" r="1.5" fill="#fff" />
          <circle cx="24.5" cy="20" r="1.5" fill="#fff" />
        </svg>
        <span style={{ fontSize: size * 0.62, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
          Cine<span style={{ color: '#c0392b' }}>Log</span>
        </span>
      </div>
    )
  },
  {
    id: 'projector-beam',
    number: 4,
    name: 'The Light Cone Projector',
    category: 'Geometric & Modern',
    tagline: 'Illuminating Film',
    desc: 'Minimalist optical projector lens projecting a glowing crimson angular beam across the cinema hall.',
    render: (size = 32) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32 }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#08070e" />
          <path d="M10 16L10 24L15 22L15 18Z" fill="#ffffff" />
          <path d="M15 18L32 10L32 30L15 22Z" fill="url(#beamGrad)" fillOpacity="0.85" />
          <circle cx="10" cy="20" r="3" fill="#c0392b" />
          <defs>
            <linearGradient id="beamGrad" x1="15" y1="20" x2="32" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#c0392b" />
              <stop offset="1" stopColor="#fbbf24" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>
        <span style={{ fontSize: size * 0.62, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
          CINE<span style={{ color: '#c0392b' }}>LOG</span>
        </span>
      </div>
    )
  },
  {
    id: 'clapper-chevron',
    number: 5,
    name: 'The Clapper Chevrons',
    category: 'Geometric & Modern',
    tagline: 'Action & Play',
    desc: 'Two dynamic angled diagonal clapperboard slashes creating a forward-thrusting fast-forward play symbol.',
    render: (size = 32) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32 }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#14111f" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <path d="M14 12L22 20L14 28" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 12L30 20L22 28" stroke="#c0392b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: size * 0.62, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
          Cine<span style={{ color: '#c0392b' }}>Log</span>
        </span>
      </div>
    )
  },

  // ── CATEGORY 2: PRESTIGE & EDITORIAL ──
  {
    id: 'studio-monogram',
    number: 6,
    name: 'The Auteur Monogram (CL)',
    category: 'Prestige & Editorial',
    tagline: 'Criterion Prestige',
    desc: 'Classic editorial serif interlocking "C" and "L" inside a refined gold and crimson crest.',
    render: (size = 32) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32 }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" fill="#0d0b16" stroke="#fbbf24" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="15" stroke="rgba(192,57,43,0.6)" strokeWidth="1" />
          <text x="14" y="26" fill="#fff" fontFamily="'Cinzel', serif, Georgia" fontWeight="bold" fontSize="17">C</text>
          <text x="21" y="26" fill="#c0392b" fontFamily="'Cinzel', serif, Georgia" fontWeight="bold" fontSize="17">L</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontSize: size * 0.58, fontWeight: 900, color: '#fff', letterSpacing: '0.5px', fontFamily: 'Georgia, serif' }}>
            CINELOG
          </span>
          <span style={{ fontSize: size * 0.22, color: '#fbbf24', letterSpacing: '2px', fontWeight: 700, textTransform: 'uppercase' }}>
            Film Archive
          </span>
        </div>
      </div>
    )
  },
  {
    id: 'ticket-stub',
    number: 7,
    name: 'The Vintage Ticket Stub',
    category: 'Prestige & Editorial',
    tagline: 'Admit One',
    desc: 'Iconic retro ticket with semicircular edge notches, perforated bar, and five-star rating emblem.',
    render: (size = 32) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32 }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <path d="M6 12C9 12 11 10 11 7L29 7C29 10 31 12 34 12L34 28C31 28 29 30 29 33L11 33C11 30 9 28 6 28Z" fill="#c0392b" />
          <line x1="16" y1="10" x2="16" y2="30" stroke="#fff" strokeWidth="1.2" strokeDasharray="2 2" />
          <polygon points="25,16 26.5,20 31,20 27.5,22.5 29,27 25,24 21,27 22.5,22.5 19,20 23.5,20" fill="#fbbf24" transform="scale(0.6) translate(16, 8)" />
        </svg>
        <span style={{ fontSize: size * 0.62, fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>
          Cine<span style={{ color: '#c0392b' }}>Log</span>
        </span>
      </div>
    )
  },
  {
    id: 'viewfinder',
    number: 8,
    name: 'The Director\'s Viewfinder',
    category: 'Prestige & Editorial',
    tagline: 'Framing Cinema',
    desc: 'Square camera sensor framelines with precision crop crosshairs and an active crimson REC dot.',
    render: (size = 32) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32 }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="8" fill="#0d0b16" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <path d="M10 15V10H15M25 10H30V15M30 25V30H25M15 30H10V25" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <circle cx="20" cy="20" r="4.5" fill="#c0392b" />
          <circle cx="20" cy="20" r="1.8" fill="#fff" />
        </svg>
        <span style={{ fontSize: size * 0.62, fontWeight: 900, color: '#fff', letterSpacing: '-0.4px' }}>
          CINE<span style={{ color: '#c0392b' }}>●</span>LOG
        </span>
      </div>
    )
  },
  {
    id: 'laurel-wreath',
    number: 9,
    name: 'The Cannes Gold Laurel',
    category: 'Prestige & Editorial',
    tagline: 'Award Winning',
    desc: 'Prestigious festival film award golden olive wreath encircling a glowing 35mm projector reel.',
    render: (size = 32) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32 }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="19" fill="#0b0816" stroke="rgba(192,57,43,0.3)" strokeWidth="1" />
          {/* Laurel leaves */}
          <path d="M12 28C10 24 10 16 16 11M28 28C30 24 30 16 24 11" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          <circle cx="11" cy="18" r="1.5" fill="#fbbf24" />
          <circle cx="12" cy="14" r="1.5" fill="#fbbf24" />
          <circle cx="29" cy="18" r="1.5" fill="#fbbf24" />
          <circle cx="28" cy="14" r="1.5" fill="#fbbf24" />
          <circle cx="20" cy="20" r="5" fill="#c0392b" />
          <circle cx="20" cy="20" r="2" fill="#fff" />
        </svg>
        <span style={{ fontSize: size * 0.62, fontWeight: 900, color: '#fff', letterSpacing: '0.2px' }}>
          Cine<span style={{ color: '#fbbf24' }}>Log</span>
        </span>
      </div>
    )
  },
  {
    id: 'neon-marquee',
    number: 10,
    name: 'The Sunset Blvd Neon Marquee',
    category: 'Prestige & Editorial',
    tagline: 'Midnight Premiere',
    desc: 'Luminous cursive double-glass neon tubes with vibrant crimson and magenta ambient street glow.',
    render: (size = 32) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32 }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#05010a" stroke="#c0392b" strokeWidth="1.5" />
          <text x="20" y="26" textAnchor="middle" fill="#fff" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="18" filter="drop-shadow(0 0 4px #c0392b)">
            CL
          </text>
        </svg>
        <span style={{ fontSize: size * 0.65, fontWeight: 900, color: '#fff', letterSpacing: '-0.3px', textShadow: '0 0 10px rgba(192,57,43,0.8)' }}>
          Cine<span style={{ color: '#c0392b' }}>Log</span>
        </span>
      </div>
    )
  },

  // ── CATEGORY 3: CYBERPUNK & SCI-FI ──
  {
    id: 'cyber-shutter',
    number: 11,
    name: 'The Cyber Hex Iris',
    category: 'Cyber & Sci-Fi',
    tagline: 'High-Tech Optics',
    desc: 'Mechanical hexagonal cyberpunk camera diaphragm with electric cyan circuits and a ruby core.',
    render: (size = 32) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32 }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <polygon points="20,4 35,12 35,28 20,36 5,28 5,12" fill="#090514" stroke="#06b6d4" strokeWidth="1.5" />
          <polygon points="20,10 29,15 29,25 20,30 11,25 11,15" stroke="#c0392b" strokeWidth="2" />
          <circle cx="20" cy="20" r="4" fill="#c0392b" />
          <circle cx="20" cy="20" r="1.5" fill="#fff" />
        </svg>
        <span style={{ fontSize: size * 0.62, fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>
          CINE<span style={{ color: '#06b6d4' }}>_</span><span style={{ color: '#c0392b' }}>LOG</span>
        </span>
      </div>
    )
  },
  {
    id: 'prism-reel',
    number: 12,
    name: 'The Holographic Prism Reel',
    category: 'Cyber & Sci-Fi',
    tagline: 'Dimensional Cinema',
    desc: 'Isometric 3D floating film reel with chromatic aberration prism edges in cyan and crimson.',
    render: (size = 32) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32 }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#0c0a1a" />
          <ellipse cx="20" cy="20" rx="14" ry="10" stroke="#06b6d4" strokeWidth="2" transform="rotate(-15 20 20)" />
          <ellipse cx="20" cy="20" rx="14" ry="10" stroke="#c0392b" strokeWidth="2" transform="rotate(15 20 20)" />
          <circle cx="20" cy="20" r="3.5" fill="#fff" />
        </svg>
        <span style={{ fontSize: size * 0.62, fontWeight: 900, color: '#fff', letterSpacing: '-0.4px' }}>
          Cine<span style={{ color: '#06b6d4' }}>L</span><span style={{ color: '#c0392b' }}>og</span>
        </span>
      </div>
    )
  },
  {
    id: 'neon-eye',
    number: 13,
    name: 'The Blade Runner Voight-Kampff Eye',
    category: 'Cyber & Sci-Fi',
    tagline: 'Observer of Realities',
    desc: 'Cybernetic human-replicant eye with an anamorphic crimson laser flare piercing horizontally.',
    render: (size = 32) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32 }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#04020a" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <path d="M7 20C11 13 29 13 33 20C29 27 11 27 7 20Z" stroke="#ffffff" strokeWidth="2" />
          <circle cx="20" cy="20" r="5.5" fill="#c0392b" />
          <circle cx="20" cy="20" r="2.5" fill="#fbbf24" />
          <line x1="3" y1="20" x2="37" y2="20" stroke="#c0392b" strokeWidth="1.2" strokeOpacity="0.8" />
        </svg>
        <span style={{ fontSize: size * 0.62, fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>
          CINE<span style={{ color: '#c0392b' }}>LOG</span>
        </span>
      </div>
    )
  },
  {
    id: 'timecode-log',
    number: 14,
    name: 'The Master Timecode (00:00:00)',
    category: 'Cyber & Sci-Fi',
    tagline: 'Every Frame Logged',
    desc: 'Digital studio production timecode reader with flashing live recording beacon and LCD readout.',
    render: (size = 32) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32 }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#0a0814" stroke="#c0392b" strokeWidth="1.5" />
          <rect x="8" y="14" width="24" height="12" rx="3" fill="#181326" />
          <circle cx="13" cy="20" r="2.5" fill="#c0392b" />
          <rect x="18" y="18" width="8" height="4" rx="1" fill="#fff" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontSize: size * 0.58, fontWeight: 900, color: '#fff', letterSpacing: '0.2px' }}>
            CINELOG
          </span>
          <span style={{ fontSize: size * 0.24, color: '#c0392b', fontWeight: 800, fontFamily: 'monospace' }}>
            TC 01:24:00
          </span>
        </div>
      </div>
    )
  },
  {
    id: 'hyperspace-core',
    number: 15,
    name: 'The Lightspeed Warp Gate',
    category: 'Cyber & Sci-Fi',
    tagline: 'Beyond Boundaries',
    desc: 'Radial hyperdrive warp streaks converging into a central glowing crimson movie screen singularity.',
    render: (size = 32) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32 }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#04020a" />
          <line x1="6" y1="6" x2="16" y2="16" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
          <line x1="34" y1="6" x2="24" y2="16" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
          <line x1="6" y1="34" x2="16" y2="24" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" />
          <line x1="34" y1="34" x2="24" y2="24" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" />
          <rect x="16" y="16" width="8" height="8" rx="2" fill="#c0392b" />
        </svg>
        <span style={{ fontSize: size * 0.62, fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>
          Cine<span style={{ color: '#06b6d4' }}>Log</span>
        </span>
      </div>
    )
  },

  // ── CATEGORY 4: SYMBOLIC & CINEMATIC ──
  {
    id: 'twin-moons',
    number: 16,
    name: 'The Eclipse Crescents',
    category: 'Symbolic & Narrative',
    tagline: 'Solar & Lunar Cinema',
    desc: 'Two interpenetrating golden and crimson lunar crescents forming an abstract "C" and "L" eclipse.',
    render: (size = 32) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32 }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="19" fill="#0b0818" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <path d="M22 10C16 11 11 16 12 23C13 29 19 33 26 31C20 32 14 28 14 21C14 15 18 11 22 10Z" fill="#c0392b" />
          <path d="M26 12C21 13 18 17 19 22C19 26 23 29 28 28C24 28 21 25 21 21C21 16 23 13 26 12Z" fill="#fbbf24" />
        </svg>
        <span style={{ fontSize: size * 0.62, fontWeight: 900, color: '#fff', letterSpacing: '-0.4px' }}>
          Cine<span style={{ color: '#c0392b' }}>Log</span>
        </span>
      </div>
    )
  },
  {
    id: 'cinema-flame',
    number: 17,
    name: 'The Passion Film Flame',
    category: 'Symbolic & Narrative',
    tagline: 'Cinema Passion',
    desc: 'Three stylized flame tongues shaped out of twisted celluloid film ribbons burning in crimson and gold.',
    render: (size = 32) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32 }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#100b1a" stroke="rgba(192,57,43,0.3)" strokeWidth="1" />
          <path d="M20 7C20 7 14 15 14 22C14 27 18 31 22 31C27 31 30 26 28 21C26 24 23 25 21 24C19 23 18 20 20 17C21 15 22 13 20 7Z" fill="#c0392b" />
          <path d="M20 18C18 20 17 23 19 26C21 26 23 24 22 22C21 20 20 18 20 18Z" fill="#fbbf24" />
        </svg>
        <span style={{ fontSize: size * 0.62, fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>
          Cine<span style={{ color: '#c0392b' }}>Log</span>
        </span>
      </div>
    )
  },
  {
    id: 'quill-reel',
    number: 18,
    name: 'The Screenwriter\'s Quill',
    category: 'Symbolic & Narrative',
    tagline: 'Stories Written',
    desc: 'An author\'s gold fountain pen nib merging into a swirling 35mm film strip diary ribbon.',
    render: (size = 32) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32 }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#0d0918" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <path d="M12 28L24 10L28 14L16 32L10 33L12 28Z" fill="#c0392b" />
          <circle cx="21" cy="18" r="1.5" fill="#fbbf24" />
          <line x1="21" y1="18" x2="11" y2="31" stroke="#fff" strokeWidth="1" />
        </svg>
        <span style={{ fontSize: size * 0.62, fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>
          Cine<span style={{ color: '#c0392b' }}>Log</span>
        </span>
      </div>
    )
  },
  {
    id: 'imax-keystone',
    number: 19,
    name: 'The IMAX Ultra Keystone',
    category: 'Symbolic & Narrative',
    tagline: 'Maximum Scale',
    desc: 'Massive trapezoidal IMAX cinema screen geometry with a glowing laser line bisecting the frame.',
    render: (size = 32) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32 }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <polygon points="6,10 34,7 32,33 8,30" fill="#0c0714" stroke="#c0392b" strokeWidth="2.5" />
          <line x1="5" y1="20" x2="35" y2="20" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          <circle cx="20" cy="20" r="3" fill="#fff" />
        </svg>
        <span style={{ fontSize: size * 0.62, fontWeight: 900, color: '#fff', letterSpacing: '0.5px' }}>
          CINE<span style={{ color: '#c0392b' }}>LOG</span>
        </span>
      </div>
    )
  },
  {
    id: 'popcorn-crown',
    number: 20,
    name: 'The Cinema Crown',
    category: 'Symbolic & Narrative',
    tagline: 'Royalty of Film',
    desc: 'Regal golden cinema crown constructed from three projector spotlights and gold star honors.',
    render: (size = 32) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32 }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#090514" stroke="rgba(251,191,36,0.3)" strokeWidth="1" />
          <path d="M10 26L12 14L17 21L20 12L23 21L28 14L30 26Z" fill="#c0392b" stroke="#fbbf24" strokeWidth="1.5" />
          <circle cx="12" cy="14" r="1.5" fill="#fbbf24" />
          <circle cx="20" cy="12" r="1.8" fill="#fbbf24" />
          <circle cx="28" cy="14" r="1.5" fill="#fbbf24" />
        </svg>
        <span style={{ fontSize: size * 0.62, fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>
          Cine<span style={{ color: '#c0392b' }}>Log</span>
          <span style={{ color: '#fbbf24', fontSize: '11px', verticalAlign: 'super', marginLeft: '2px' }}>👑</span>
        </span>
      </div>
    )
  }
];

export default function CineLogLogo({ logoId = 'aperture-c', size = 32, onClick, className, style }) {
  const logo = ALL_CINELOG_LOGOS.find(l => l.id === logoId) || ALL_CINELOG_LOGOS[0];
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        ...style
      }}
    >
      {logo.render(size)}
    </div>
  );
}
