import React from 'react';

// Helper to wrap SVG in data URL for dynamic favicon switching
export function getSvgDataUrl(svgString) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

export function updateFavicon(logoId) {
  const logo = ALL_CINELOG_LOGOS.find(l => l.id === logoId) || ALL_CINELOG_LOGOS[0];
  if (!logo || !logo.svgIconString) return;
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  link.type = 'image/svg+xml';
  link.href = getSvgDataUrl(logo.svgIconString);
}

export const ALL_CINELOG_LOGOS = [
  // ══════════════════════════════════════════════════════════════════
  // CATEGORY 1: MINIMALIST & MONOGRAM
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'aperture-c',
    number: 1,
    name: 'The Monogram Iris',
    category: 'Minimalist & Monogram',
    tagline: 'Precision Optics & Golden Ratio',
    desc: 'An architectural "C" sculpted from 4 interlocking precision aperture blades in CineLog ruby, focusing into a radiant golden optic core. Designed for razor-sharp clarity from 16px favicon to giant billboards.',
    svgIconString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="irisGrad1" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#ff3344" />
          <stop offset="50%" stop-color="#c01525" />
          <stop offset="100%" stop-color="#70060e" />
        </linearGradient>
        <linearGradient id="goldCore" x1="18" y1="18" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="100%" stop-color="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="#0d0a14" />
      <path d="M36 15C32.8 10.2 27.5 7.5 21.5 8C12.8 8.8 6 16.3 6 25C6 34.4 13.6 42 23 42C29.6 42 35.2 38.2 38 32.5L29.5 28C27.8 30.5 24.8 32 21.5 31.5C17.2 30.8 13.8 27.2 14 22.8C14.2 18.5 17.8 15 22.2 15C25.5 15 28.5 16.5 30 19L36 15Z" fill="url(#irisGrad1)" />
      <circle cx="24" cy="24" r="5" fill="url(#goldCore)" />
      <circle cx="24" cy="24" r="2.2" fill="#ffffff" />
    </svg>`,
    renderIcon: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: 'block' }}>
        <defs>
          <linearGradient id="irisGrad1_jsx" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff3344" />
            <stop offset="50%" stopColor="#c01525" />
            <stop offset="100%" stopColor="#70060e" />
          </linearGradient>
          <linearGradient id="goldCore_jsx" x1="18" y1="18" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="#0d0a14" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <path d="M36 15C32.8 10.2 27.5 7.5 21.5 8C12.8 8.8 6 16.3 6 25C6 34.4 13.6 42 23 42C29.6 42 35.2 38.2 38 32.5L29.5 28C27.8 30.5 24.8 32 21.5 31.5C17.2 30.8 13.8 27.2 14 22.8C14.2 18.5 17.8 15 22.2 15C25.5 15 28.5 16.5 30 19L36 15Z" fill="url(#irisGrad1_jsx)" />
        <circle cx="24" cy="24" r="5" fill="url(#goldCore_jsx)" />
        <circle cx="24" cy="24" r="2.2" fill="#ffffff" />
      </svg>
    ),
    render: (size = 32) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
        {ALL_CINELOG_LOGOS[0].renderIcon(size)}
        <span style={{ fontSize: size * 0.64, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          CINE<span style={{ color: '#e50914' }}>LOG</span>
        </span>
      </div>
    )
  },
  {
    id: 'anamorphic-frame',
    number: 2,
    name: 'The Anamorphic Frame',
    category: 'Minimalist & Monogram',
    tagline: '2.39:1 Cinematic Scope',
    desc: 'Widescreen cinematic letterbox frame geometry sculpted into a bold open "C" with calibrated 35mm sprocket perforations and a central golden play glyph.',
    svgIconString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="anaGrad" x1="4" y1="8" x2="44" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#e50914" />
          <stop offset="100%" stop-color="#880808" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="#08070d" />
      <path d="M38 14H18C13.58 14 10 17.58 10 22V26C10 30.42 13.58 34 18 34H38" stroke="url(#anaGrad)" stroke-width="4.5" stroke-linecap="round" />
      <rect x="14" y="19" width="3" height="4" rx="0.8" fill="#ffffff" />
      <rect x="14" y="25" width="3" height="4" rx="0.8" fill="#ffffff" />
      <polygon points="26,19 35,24 26,29" fill="#fbbf24" />
    </svg>`,
    renderIcon: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: 'block' }}>
        <defs>
          <linearGradient id="anaGrad_jsx" x1="4" y1="8" x2="44" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e50914" />
            <stop offset="100%" stopColor="#880808" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="#08070d" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <path d="M38 14H18C13.58 14 10 17.58 10 22V26C10 30.42 13.58 34 18 34H38" stroke="url(#anaGrad_jsx)" strokeWidth="4.5" strokeLinecap="round" />
        <rect x="14" y="19" width="3" height="4" rx="0.8" fill="#ffffff" />
        <rect x="14" y="25" width="3" height="4" rx="0.8" fill="#ffffff" />
        <polygon points="26,19 35,24 26,29" fill="#fbbf24" />
      </svg>
    ),
    render: (size = 32) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
        {ALL_CINELOG_LOGOS[1].renderIcon(size)}
        <span style={{ fontSize: size * 0.64, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          Cine<span style={{ color: '#e50914' }}>Log</span>
        </span>
      </div>
    )
  },
  {
    id: 'clapper-c',
    number: 3,
    name: 'The Director Slate',
    category: 'Minimalist & Monogram',
    tagline: 'Action & Cut',
    desc: 'Minimalist director clapperboard where the articulated top slate swings at 24° to form the upper serif of a monumental "C", styled with crisp carbon & crimson stripes.',
    svgIconString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="#0e0c16" />
      <path d="M12 20H36V36C36 38.2 34.2 40 32 40H16C13.8 40 12 38.2 12 36V20Z" fill="#181524" stroke="#e50914" stroke-width="2.5" />
      <path d="M11 18L35 11L37 17L13 24Z" fill="#c01525" />
      <path d="M16 16.5L19 15.6L17.5 22.5L14.5 23.4Z" fill="#ffffff" />
      <path d="M24 14.2L27 13.3L25.5 20.2L22.5 21.1Z" fill="#ffffff" />
      <path d="M32 11.8L35 11L33.5 17.8L30.5 18.7Z" fill="#ffffff" />
      <polygon points="21,26 29,30 21,34" fill="#fbbf24" />
    </svg>`,
    renderIcon: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: 'block' }}>
        <rect width="48" height="48" rx="12" fill="#0e0c16" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <path d="M12 20H36V36C36 38.2 34.2 40 32 40H16C13.8 40 12 38.2 12 36V20Z" fill="#181524" stroke="#e50914" strokeWidth="2.5" />
        <path d="M11 18L35 11L37 17L13 24Z" fill="#c01525" />
        <path d="M16 16.5L19 15.6L17.5 22.5L14.5 23.4Z" fill="#ffffff" />
        <path d="M24 14.2L27 13.3L25.5 20.2L22.5 21.1Z" fill="#ffffff" />
        <path d="M32 11.8L35 11L33.5 17.8L30.5 18.7Z" fill="#ffffff" />
        <polygon points="21,26 29,30 21,34" fill="#fbbf24" />
      </svg>
    ),
    render: (size = 32) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
        {ALL_CINELOG_LOGOS[2].renderIcon(size)}
        <span style={{ fontSize: size * 0.64, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          Cine<span style={{ color: '#e50914' }}>Log</span>
        </span>
      </div>
    )
  },
  {
    id: 'infinity-reel',
    number: 4,
    name: 'The Endless Diary',
    category: 'Minimalist & Monogram',
    tagline: 'Continuous Watchlist',
    desc: 'An exquisite Möbius infinity ribbon in deep crimson and velvet ruby, linking watch diary logs with perpetual movie tracking reels.',
    svgIconString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="infGrad" x1="8" y1="14" x2="40" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#ff2a3b" />
          <stop offset="100%" stop-color="#880808" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="#090810" />
      <path d="M15 17C10.5 17 8 20.5 8 24C8 27.5 10.5 31 15 31C20.5 31 24.5 17 33 17C37.5 17 40 20.5 40 24C40 27.5 37.5 31 33 31C27.5 31 23.5 17 15 17Z" stroke="url(#infGrad)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="15" cy="24" r="2.5" fill="#ffffff" />
      <circle cx="33" cy="24" r="2.5" fill="#fbbf24" />
    </svg>`,
    renderIcon: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: 'block' }}>
        <defs>
          <linearGradient id="infGrad_jsx" x1="8" y1="14" x2="40" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff2a3b" />
            <stop offset="100%" stopColor="#880808" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="#090810" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <path d="M15 17C10.5 17 8 20.5 8 24C8 27.5 10.5 31 15 31C20.5 31 24.5 17 33 17C37.5 17 40 20.5 40 24C40 27.5 37.5 31 33 31C27.5 31 23.5 17 15 17Z" stroke="url(#infGrad_jsx)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="15" cy="24" r="2.5" fill="#ffffff" />
        <circle cx="33" cy="24" r="2.5" fill="#fbbf24" />
      </svg>
    ),
    render: (size = 32) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
        {ALL_CINELOG_LOGOS[3].renderIcon(size)}
        <span style={{ fontSize: size * 0.64, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          CINE<span style={{ color: '#e50914' }}>LOG</span>
        </span>
      </div>
    )
  },
  {
    id: 'sprocket-stamp',
    number: 5,
    name: 'The Ticket Perforation',
    category: 'Minimalist & Monogram',
    tagline: 'Admit One & Track',
    desc: 'Cinema admission ticket pass silhouette with calibrated side punches, enclosing a sharp Play chevron and 5 gold-embossed milestone stars.',
    svgIconString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="ticketGrad" x1="6" y1="10" x2="42" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#e50914" />
          <stop offset="100%" stop-color="#990000" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="#0b0914" />
      <path d="M8 14C8 11.8 9.8 10 12 10H36C38.2 10 40 11.8 40 14V20C37.8 20 36 21.8 36 24C36 26.2 37.8 28 40 28V34C40 36.2 38.2 38 36 38H12C9.8 38 8 36.2 8 34V28C10.2 28 12 26.2 12 24C12 21.8 10.2 20 8 20V14Z" fill="url(#ticketGrad)" />
      <polygon points="21,17 31,24 21,31" fill="#ffffff" />
      <circle cx="21" cy="24" r="1.5" fill="#fbbf24" />
    </svg>`,
    renderIcon: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: 'block' }}>
        <defs>
          <linearGradient id="ticketGrad_jsx" x1="6" y1="10" x2="42" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e50914" />
            <stop offset="100%" stopColor="#990000" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="#0b0914" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <path d="M8 14C8 11.8 9.8 10 12 10H36C38.2 10 40 11.8 40 14V20C37.8 20 36 21.8 36 24C36 26.2 37.8 28 40 28V34C40 36.2 38.2 38 36 38H12C9.8 38 8 36.2 8 34V28C10.2 28 12 26.2 12 24C12 21.8 10.2 20 8 20V14Z" fill="url(#ticketGrad_jsx)" />
        <polygon points="21,17 31,24 21,31" fill="#ffffff" />
        <circle cx="21" cy="24" r="1.5" fill="#fbbf24" />
      </svg>
    ),
    render: (size = 32) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
        {ALL_CINELOG_LOGOS[4].renderIcon(size)}
        <span style={{ fontSize: size * 0.64, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          Cine<span style={{ color: '#e50914' }}>Log</span>
        </span>
      </div>
    )
  },

  // ══════════════════════════════════════════════════════════════════
  // CATEGORY 2: CINEMA CRAFT & CELLULOID
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'projector-prism',
    number: 6,
    name: 'The Light Cone',
    category: 'Cinema Craft & Celluloid',
    tagline: 'Illuminating The Darkness',
    desc: 'Optical projector body on the left throwing a sweeping volumetric light beam across the dark cinema hall toward the silver screen.',
    svgIconString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="beamGrad" x1="18" y1="24" x2="42" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="40%" stop-color="#e50914" />
          <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.3" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="#08070d" />
      <rect x="8" y="18" width="8" height="12" rx="2" fill="#ffffff" />
      <circle cx="12" cy="14" r="4" stroke="#e50914" stroke-width="2.5" />
      <polygon points="16,21 42,10 42,38 16,27" fill="url(#beamGrad)" fill-opacity="0.9" />
      <circle cx="41" cy="24" r="2.5" fill="#fbbf24" />
    </svg>`,
    renderIcon: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: 'block' }}>
        <defs>
          <linearGradient id="beamGrad_jsx" x1="18" y1="24" x2="42" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#e50914" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="#08070d" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <rect x="8" y="18" width="8" height="12" rx="2" fill="#ffffff" />
        <circle cx="12" cy="14" r="4" stroke="#e50914" strokeWidth="2.5" />
        <polygon points="16,21 42,10 42,38 16,27" fill="url(#beamGrad_jsx)" fillOpacity="0.9" />
        <circle cx="41" cy="24" r="2.5" fill="#fbbf24" />
      </svg>
    ),
    render: (size = 32) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
        {ALL_CINELOG_LOGOS[5].renderIcon(size)}
        <span style={{ fontSize: size * 0.64, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          CINE<span style={{ color: '#e50914' }}>LOG</span>
        </span>
      </div>
    )
  },
  {
    id: 'film-quad',
    number: 7,
    name: 'The Four Perfs',
    category: 'Cinema Craft & Celluloid',
    tagline: 'Letterboxd-Tier Minimalism',
    desc: 'Four calibrated 35mm film perforation apertures arranged in a dynamic 2x2 grid, converging on an inner ruby optic circle.',
    svgIconString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="#0d0b16" />
      <rect x="10" y="10" width="11" height="11" rx="2.5" fill="#e50914" />
      <rect x="27" y="10" width="11" height="11" rx="2.5" fill="#ffffff" fill-opacity="0.9" />
      <rect x="10" y="27" width="11" height="11" rx="2.5" fill="#ffffff" fill-opacity="0.9" />
      <rect x="27" y="27" width="11" height="11" rx="2.5" fill="#fbbf24" />
      <circle cx="24" cy="24" r="4.5" fill="#0d0b16" stroke="#e50914" stroke-width="2" />
    </svg>`,
    renderIcon: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: 'block' }}>
        <rect width="48" height="48" rx="12" fill="#0d0b16" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <rect x="10" y="10" width="11" height="11" rx="2.5" fill="#e50914" />
        <rect x="27" y="10" width="11" height="11" rx="2.5" fill="#ffffff" fillOpacity="0.9" />
        <rect x="10" y="27" width="11" height="11" rx="2.5" fill="#ffffff" fillOpacity="0.9" />
        <rect x="27" y="27" width="11" height="11" rx="2.5" fill="#fbbf24" />
        <circle cx="24" cy="24" r="4.5" fill="#0d0b16" stroke="#e50914" strokeWidth="2" />
      </svg>
    ),
    render: (size = 32) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
        {ALL_CINELOG_LOGOS[6].renderIcon(size)}
        <span style={{ fontSize: size * 0.64, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          Cine<span style={{ color: '#e50914' }}>Log</span>
        </span>
      </div>
    )
  },
  {
    id: 'viewfinder-grid',
    number: 8,
    name: 'The Viewfinder',
    category: 'Cinema Craft & Celluloid',
    tagline: 'Framing The Shot',
    desc: 'Cinema camera viewfinder brackets framing a central crosshair and a vivid red recording dot, signaling live diary tracking.',
    svgIconString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="#0a0812" />
      <path d="M10 16V10H16" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
      <path d="M32 10H38V16" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
      <path d="M10 32V38H16" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
      <path d="M32 38H38V32" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="24" cy="24" r="6" stroke="#e50914" stroke-width="2.5" />
      <circle cx="24" cy="24" r="2.5" fill="#fbbf24" />
      <line x1="24" y1="14" x2="24" y2="17" stroke="#e50914" stroke-width="2" stroke-linecap="round" />
      <line x1="24" y1="31" x2="24" y2="34" stroke="#e50914" stroke-width="2" stroke-linecap="round" />
      <line x1="14" y1="24" x2="17" y2="24" stroke="#e50914" stroke-width="2" stroke-linecap="round" />
      <line x1="31" y1="24" x2="34" y2="24" stroke="#e50914" stroke-width="2" stroke-linecap="round" />
    </svg>`,
    renderIcon: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: 'block' }}>
        <rect width="48" height="48" rx="12" fill="#0a0812" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <path d="M10 16V10H16" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M32 10H38V16" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M10 32V38H16" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M32 38H38V32" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="24" r="6" stroke="#e50914" strokeWidth="2.5" />
        <circle cx="24" cy="24" r="2.5" fill="#fbbf24" />
        <line x1="24" y1="14" x2="24" y2="17" stroke="#e50914" strokeWidth="2" strokeLinecap="round" />
        <line x1="24" y1="31" x2="24" y2="34" stroke="#e50914" strokeWidth="2" strokeLinecap="round" />
        <line x1="14" y1="24" x2="17" y2="24" stroke="#e50914" strokeWidth="2" strokeLinecap="round" />
        <line x1="31" y1="24" x2="34" y2="24" stroke="#e50914" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    render: (size = 32) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
        {ALL_CINELOG_LOGOS[7].renderIcon(size)}
        <span style={{ fontSize: size * 0.64, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          CINE<span style={{ color: '#e50914' }}>LOG</span>
        </span>
      </div>
    )
  },
  {
    id: 'shutter-wheel',
    number: 9,
    name: 'The 180° Rotary Shutter',
    category: 'Cinema Craft & Celluloid',
    tagline: 'Standard 24 FPS',
    desc: 'The mechanical motion picture 180-degree half-moon rotary disk in carbon black and ruby, immortalizing the optical physics of 24 frames per second.',
    svgIconString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="#0e0c18" />
      <circle cx="24" cy="24" r="16" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
      <path d="M24 8C32.8 8 40 15.2 40 24C40 32.8 32.8 40 24 40V8Z" fill="#e50914" />
      <circle cx="24" cy="24" r="4.5" fill="#0e0c18" stroke="#ffffff" stroke-width="2" />
      <polygon points="17,21 17,27 21,24" fill="#fbbf24" />
    </svg>`,
    renderIcon: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: 'block' }}>
        <rect width="48" height="48" rx="12" fill="#0e0c18" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <circle cx="24" cy="24" r="16" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
        <path d="M24 8C32.8 8 40 15.2 40 24C40 32.8 32.8 40 24 40V8Z" fill="#e50914" />
        <circle cx="24" cy="24" r="4.5" fill="#0e0c18" stroke="#ffffff" strokeWidth="2" />
        <polygon points="17,21 17,27 21,24" fill="#fbbf24" />
      </svg>
    ),
    render: (size = 32) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
        {ALL_CINELOG_LOGOS[8].renderIcon(size)}
        <span style={{ fontSize: size * 0.64, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          Cine<span style={{ color: '#e50914' }}>Log</span>
        </span>
      </div>
    )
  },
  {
    id: 'celluloid-strip',
    number: 10,
    name: 'The Celluloid Ribbon',
    category: 'Cinema Craft & Celluloid',
    tagline: '35mm Film Heritage',
    desc: 'An elegant vertical 35mm film cell curve with micro-precision sprocket windows and a gleaming central preview frame.',
    svgIconString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="cellGrad" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#ff3344" />
          <stop offset="100%" stop-color="#880808" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="#090710" />
      <path d="M16 8H32C34.2 8 36 9.8 36 12V36C36 38.2 34.2 40 32 40H16C13.8 40 12 38.2 12 36V12C12 9.8 13.8 8 16 8Z" fill="url(#cellGrad)" />
      <rect x="14" y="12" width="3" height="3" rx="0.5" fill="#090710" />
      <rect x="14" y="18" width="3" height="3" rx="0.5" fill="#090710" />
      <rect x="14" y="24" width="3" height="3" rx="0.5" fill="#090710" />
      <rect x="14" y="30" width="3" height="3" rx="0.5" fill="#090710" />
      <rect x="31" y="12" width="3" height="3" rx="0.5" fill="#090710" />
      <rect x="31" y="18" width="3" height="3" rx="0.5" fill="#090710" />
      <rect x="31" y="24" width="3" height="3" rx="0.5" fill="#090710" />
      <rect x="31" y="30" width="3" height="3" rx="0.5" fill="#090710" />
      <rect x="19" y="16" width="10" height="16" rx="1.5" fill="#090710" />
      <polygon points="22,20 27,24 22,28" fill="#fbbf24" />
    </svg>`,
    renderIcon: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: 'block' }}>
        <defs>
          <linearGradient id="cellGrad_jsx" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff3344" />
            <stop offset="100%" stopColor="#880808" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="#090710" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <path d="M16 8H32C34.2 8 36 9.8 36 12V36C36 38.2 34.2 40 32 40H16C13.8 40 12 38.2 12 36V12C12 9.8 13.8 8 16 8Z" fill="url(#cellGrad_jsx)" />
        <rect x="14" y="12" width="3" height="3" rx="0.5" fill="#090710" />
        <rect x="14" y="18" width="3" height="3" rx="0.5" fill="#090710" />
        <rect x="14" y="24" width="3" height="3" rx="0.5" fill="#090710" />
        <rect x="14" y="30" width="3" height="3" rx="0.5" fill="#090710" />
        <rect x="31" y="12" width="3" height="3" rx="0.5" fill="#090710" />
        <rect x="31" y="18" width="3" height="3" rx="0.5" fill="#090710" />
        <rect x="31" y="24" width="3" height="3" rx="0.5" fill="#090710" />
        <rect x="31" y="30" width="3" height="3" rx="0.5" fill="#090710" />
        <rect x="19" y="16" width="10" height="16" rx="1.5" fill="#090710" />
        <polygon points="22,20 27,24 22,28" fill="#fbbf24" />
      </svg>
    ),
    render: (size = 32) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
        {ALL_CINELOG_LOGOS[9].renderIcon(size)}
        <span style={{ fontSize: size * 0.64, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          Cine<span style={{ color: '#e50914' }}>Log</span>
        </span>
      </div>
    )
  },

  // ══════════════════════════════════════════════════════════════════
  // CATEGORY 3: PRESTIGE & EDITORIAL
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'golden-palm',
    number: 11,
    name: 'The Festival Crest',
    category: 'Prestige & Editorial',
    tagline: 'Palme d’Or Prestige',
    desc: 'Golden film festival laurel branches encircling a rich ruby cinema reel. Built for serious cinephiles, critics, and awards season devotees.',
    svgIconString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="palmGold" x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="100%" stop-color="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="#0e0a16" />
      <circle cx="24" cy="24" r="10" fill="#e50914" />
      <polygon points="22,19 28,24 22,29" fill="#ffffff" />
      <path d="M12 28C10 24 10 18 14 13C12 17 14 22 17 25" stroke="url(#palmGold)" stroke-width="2" stroke-linecap="round" />
      <path d="M36 28C38 24 38 18 34 13C36 17 34 22 31 25" stroke="url(#palmGold)" stroke-width="2" stroke-linecap="round" />
      <circle cx="13" cy="15" r="1.5" fill="#f59e0b" />
      <circle cx="35" cy="15" r="1.5" fill="#f59e0b" />
      <circle cx="24" cy="38" r="1.8" fill="#f59e0b" />
    </svg>`,
    renderIcon: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: 'block' }}>
        <defs>
          <linearGradient id="palmGold_jsx" x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="#0e0a16" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <circle cx="24" cy="24" r="10" fill="#e50914" />
        <polygon points="22,19 28,24 22,29" fill="#ffffff" />
        <path d="M12 28C10 24 10 18 14 13C12 17 14 22 17 25" stroke="url(#palmGold_jsx)" strokeWidth="2" strokeLinecap="round" />
        <path d="M36 28C38 24 38 18 34 13C36 17 34 22 31 25" stroke="url(#palmGold_jsx)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="13" cy="15" r="1.5" fill="#f59e0b" />
        <circle cx="35" cy="15" r="1.5" fill="#f59e0b" />
        <circle cx="24" cy="38" r="1.8" fill="#f59e0b" />
      </svg>
    ),
    render: (size = 32) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
        {ALL_CINELOG_LOGOS[10].renderIcon(size)}
        <span style={{ fontSize: size * 0.64, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          CINE<span style={{ color: '#fbbf24' }}>LOG</span>
        </span>
      </div>
    )
  },
  {
    id: 'criterion-lens',
    number: 12,
    name: 'The Criterion Arc',
    category: 'Prestige & Editorial',
    tagline: 'Artisanal Archival Edition',
    desc: 'High-contrast editorial circle where a crisp ivory crescent eclipse cuts through a deep crimson film aperture.',
    svgIconString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="#08070c" />
      <circle cx="24" cy="24" r="15" fill="#c01525" />
      <path d="M24 9C15.7 9 9 15.7 9 24C9 32.3 15.7 39 24 39C19 36 16 30.5 16 24C16 17.5 19 12 24 9Z" fill="#ffffff" />
      <circle cx="28" cy="24" r="3.5" fill="#fbbf24" />
    </svg>`,
    renderIcon: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: 'block' }}>
        <rect width="48" height="48" rx="12" fill="#08070c" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <circle cx="24" cy="24" r="15" fill="#c01525" />
        <path d="M24 9C15.7 9 9 15.7 9 24C9 32.3 15.7 39 24 39C19 36 16 30.5 16 24C16 17.5 19 12 24 9Z" fill="#ffffff" />
        <circle cx="28" cy="24" r="3.5" fill="#fbbf24" />
      </svg>
    ),
    render: (size = 32) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
        {ALL_CINELOG_LOGOS[11].renderIcon(size)}
        <span style={{ fontSize: size * 0.64, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          Cine<span style={{ color: '#e50914' }}>Log</span>
        </span>
      </div>
    )
  },
  {
    id: 'monolith-c',
    number: 13,
    name: 'The 70mm Monolith',
    category: 'Prestige & Editorial',
    tagline: 'Brutalist Architectural C',
    desc: 'Monumental geometric lettermark with 45° internal chamfers and high-contrast crimson / platinum facets inspired by 70mm roadshow roadmaps.',
    svgIconString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="#0d0a14" />
      <path d="M38 10H16C12.69 10 10 12.69 10 16V32C10 35.31 12.69 38 16 38H38V30H18V18H38V10Z" fill="#e50914" />
      <polygon points="26,20 34,24 26,28" fill="#ffffff" />
      <line x1="18" y1="18" x2="18" y2="30" stroke="#fbbf24" stroke-width="2" />
    </svg>`,
    renderIcon: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: 'block' }}>
        <rect width="48" height="48" rx="12" fill="#0d0a14" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <path d="M38 10H16C12.69 10 10 12.69 10 16V32C10 35.31 12.69 38 16 38H38V30H18V18H38V10Z" fill="#e50914" />
        <polygon points="26,20 34,24 26,28" fill="#ffffff" />
        <line x1="18" y1="18" x2="18" y2="30" stroke="#fbbf24" strokeWidth="2" />
      </svg>
    ),
    render: (size = 32) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
        {ALL_CINELOG_LOGOS[12].renderIcon(size)}
        <span style={{ fontSize: size * 0.64, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          CINE<span style={{ color: '#e50914' }}>LOG</span>
        </span>
      </div>
    )
  },
  {
    id: 'constellation-c',
    number: 14,
    name: 'The Starfield Constellation',
    category: 'Prestige & Editorial',
    tagline: '5-Star Rating Chart',
    desc: 'Celestial star charts forming an elegant "C" arc connected by fine gold coordinate rays, representing cinema ratings and astronomical passion.',
    svgIconString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="#080612" />
      <path d="M36 12L24 10L14 18L10 28L16 38L28 38L36 32" stroke="#e50914" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <line x1="14" y1="18" x2="28" y2="38" stroke="rgba(251,191,36,0.35)" stroke-width="1.5" stroke-dasharray="2 2" />
      <circle cx="36" cy="12" r="3" fill="#fbbf24" />
      <circle cx="24" cy="10" r="3" fill="#ffffff" />
      <circle cx="14" cy="18" r="3.5" fill="#e50914" />
      <circle cx="10" cy="28" r="3" fill="#ffffff" />
      <circle cx="16" cy="38" r="3" fill="#ffffff" />
      <circle cx="28" cy="38" r="3" fill="#fbbf24" />
      <circle cx="36" cy="32" r="3.5" fill="#e50914" />
    </svg>`,
    renderIcon: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: 'block' }}>
        <rect width="48" height="48" rx="12" fill="#080612" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <path d="M36 12L24 10L14 18L10 28L16 38L28 38L36 32" stroke="#e50914" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="14" y1="18" x2="28" y2="38" stroke="rgba(251,191,36,0.35)" strokeWidth="1.5" strokeDasharray="2 2" />
        <circle cx="36" cy="12" r="3" fill="#fbbf24" />
        <circle cx="24" cy="10" r="3" fill="#ffffff" />
        <circle cx="14" cy="18" r="3.5" fill="#e50914" />
        <circle cx="10" cy="28" r="3" fill="#ffffff" />
        <circle cx="16" cy="38" r="3" fill="#ffffff" />
        <circle cx="28" cy="38" r="3" fill="#fbbf24" />
        <circle cx="36" cy="32" r="3.5" fill="#e50914" />
      </svg>
    ),
    render: (size = 32) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
        {ALL_CINELOG_LOGOS[13].renderIcon(size)}
        <span style={{ fontSize: size * 0.64, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          Cine<span style={{ color: '#e50914' }}>Log</span>
        </span>
      </div>
    )
  },
  {
    id: 'ticket-tombstone',
    number: 15,
    name: 'The Premiere Ticket',
    category: 'Prestige & Editorial',
    tagline: 'VIP Theater Badge',
    desc: 'Deep crimson velvet premiere pass with arched corners, star perforation, and an engraved gold-foil "C" emblem.',
    svgIconString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="#0a0812" />
      <rect x="10" y="8" width="28" height="32" rx="4" fill="#880808" stroke="#e50914" stroke-width="2" />
      <circle cx="10" cy="24" r="3.5" fill="#0a0812" />
      <circle cx="38" cy="24" r="3.5" fill="#0a0812" />
      <path d="M28 17C26 15 22 15 20 17C17 20 17 28 20 31C22 33 26 33 28 31" stroke="#fbbf24" stroke-width="3" stroke-linecap="round" />
      <polygon points="23,21 27,24 23,27" fill="#ffffff" />
    </svg>`,
    renderIcon: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: 'block' }}>
        <rect width="48" height="48" rx="12" fill="#0a0812" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <rect x="10" y="8" width="28" height="32" rx="4" fill="#880808" stroke="#e50914" strokeWidth="2" />
        <circle cx="10" cy="24" r="3.5" fill="#0a0812" />
        <circle cx="38" cy="24" r="3.5" fill="#0a0812" />
        <path d="M28 17C26 15 22 15 20 17C17 20 17 28 20 31C22 33 26 33 28 31" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        <polygon points="23,21 27,24 23,27" fill="#ffffff" />
      </svg>
    ),
    render: (size = 32) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
        {ALL_CINELOG_LOGOS[14].renderIcon(size)}
        <span style={{ fontSize: size * 0.64, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          CINE<span style={{ color: '#fbbf24' }}>LOG</span>
        </span>
      </div>
    )
  },

  // ══════════════════════════════════════════════════════════════════
  // CATEGORY 4: NEON, CYBER & MIDNIGHT CINEMA
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'neon-marquee',
    number: 16,
    name: 'The Neon Marquee',
    category: 'Neon, Cyber & Midnight Cinema',
    tagline: 'Broadway Glowing Tubes',
    desc: 'Handcrafted twin luminous neon glass tubes in electric crimson and golden amber with soft atmospheric ambient glow.',
    svgIconString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <defs>
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#ff1a3c" flood-opacity="0.8" />
        </filter>
      </defs>
      <rect width="48" height="48" rx="12" fill="#07050d" />
      <path d="M36 14C32 9.5 24 9.5 17 14C11 18 10 28 15 34C20 39 30 39 36 34" stroke="#ff1a3c" stroke-width="4.5" stroke-linecap="round" filter="url(#neonGlow)" />
      <path d="M34 16C31 12 25 12 19 16C14 19.5 13 27 17 32C21 36 29 36 34 32" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" />
      <circle cx="28" cy="24" r="3.5" fill="#ffb703" filter="url(#neonGlow)" />
    </svg>`,
    renderIcon: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: 'block' }}>
        <defs>
          <filter id="neonGlow_jsx" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ff1a3c" floodOpacity="0.8" />
          </filter>
        </defs>
        <rect width="48" height="48" rx="12" fill="#07050d" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <path d="M36 14C32 9.5 24 9.5 17 14C11 18 10 28 15 34C20 39 30 39 36 34" stroke="#ff1a3c" strokeWidth="4.5" strokeLinecap="round" filter="url(#neonGlow_jsx)" />
        <path d="M34 16C31 12 25 12 19 16C14 19.5 13 27 17 32C21 36 29 36 34 32" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="28" cy="24" r="3.5" fill="#ffb703" />
      </svg>
    ),
    render: (size = 32) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
        {ALL_CINELOG_LOGOS[15].renderIcon(size)}
        <span style={{ fontSize: size * 0.64, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          Cine<span style={{ color: '#ff1a3c' }}>Log</span>
        </span>
      </div>
    )
  },
  {
    id: 'cyber-noir',
    number: 17,
    name: 'The 2049 Hex Shutter',
    category: 'Neon, Cyber & Midnight Cinema',
    tagline: 'Blade Runner Dystopia',
    desc: 'Heavy carbon hexagonal mechanical iris with electric red rim light and laser targeting optical reticle.',
    svgIconString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="#08070e" />
      <polygon points="24,6 40,15 40,33 24,42 8,33 8,15" stroke="#e50914" stroke-width="3" stroke-linejoin="round" />
      <polygon points="24,14 33,19 33,29 24,34 15,29 15,19" fill="#141120" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="24" cy="24" r="4" fill="#fbbf24" />
      <circle cx="24" cy="24" r="1.5" fill="#ffffff" />
    </svg>`,
    renderIcon: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: 'block' }}>
        <rect width="48" height="48" rx="12" fill="#08070e" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <polygon points="24,6 40,15 40,33 24,42 8,33 8,15" stroke="#e50914" strokeWidth="3" strokeLinejoin="round" />
        <polygon points="24,14 33,19 33,29 24,34 15,29 15,19" fill="#141120" stroke="#ffffff" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="4" fill="#fbbf24" />
        <circle cx="24" cy="24" r="1.5" fill="#ffffff" />
      </svg>
    ),
    render: (size = 32) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
        {ALL_CINELOG_LOGOS[16].renderIcon(size)}
        <span style={{ fontSize: size * 0.64, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          CINE<span style={{ color: '#e50914' }}>LOG</span>
        </span>
      </div>
    )
  },
  {
    id: 'laser-disc',
    number: 18,
    name: 'The Synthwave Sunset',
    category: 'Neon, Cyber & Midnight Cinema',
    tagline: 'Outrun Retro Grid',
    desc: 'Segmented retro-futuristic horizon sun disk in graduated ruby-to-amber neon slats with a central cinema triangle.',
    svgIconString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="synthSun" x1="24" y1="8" x2="24" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#ff0055" />
          <stop offset="60%" stop-color="#ff7700" />
          <stop offset="100%" stop-color="#ffcc00" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="#0b0814" />
      <path d="M12 24C12 17.37 17.37 12 24 12C30.63 12 36 17.37 36 24H12Z" fill="url(#synthSun)" />
      <rect x="10" y="26" width="28" height="3" rx="1" fill="url(#synthSun)" />
      <rect x="12" y="31" width="24" height="2.5" rx="1" fill="url(#synthSun)" />
      <rect x="15" y="35.5" width="18" height="2" rx="1" fill="url(#synthSun)" />
      <polygon points="21,17 29,21 21,25" fill="#ffffff" />
    </svg>`,
    renderIcon: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: 'block' }}>
        <defs>
          <linearGradient id="synthSun_jsx" x1="24" y1="8" x2="24" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff0055" />
            <stop offset="60%" stopColor="#ff7700" />
            <stop offset="100%" stopColor="#ffcc00" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="#0b0814" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <path d="M12 24C12 17.37 17.37 12 24 12C30.63 12 36 17.37 36 24H12Z" fill="url(#synthSun_jsx)" />
        <rect x="10" y="26" width="28" height="3" rx="1" fill="url(#synthSun_jsx)" />
        <rect x="12" y="31" width="24" height="2.5" rx="1" fill="url(#synthSun_jsx)" />
        <rect x="15" y="35.5" width="18" height="2" rx="1" fill="url(#synthSun_jsx)" />
        <polygon points="21,17 29,21 21,25" fill="#ffffff" />
      </svg>
    ),
    render: (size = 32) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
        {ALL_CINELOG_LOGOS[17].renderIcon(size)}
        <span style={{ fontSize: size * 0.64, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          CINE<span style={{ color: '#ff0055' }}>LOG</span>
        </span>
      </div>
    )
  },
  {
    id: 'analog-reel',
    number: 19,
    name: 'The Twin Spool',
    category: 'Neon, Cyber & Midnight Cinema',
    tagline: 'Drive-in & Grindhouse',
    desc: 'Two precision machined metal reels connected by a taut tape ribbon, with golden bearings and dynamic reel cutouts.',
    svgIconString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="#090812" />
      <circle cx="16" cy="24" r="9" stroke="#e50914" stroke-width="2.5" />
      <circle cx="32" cy="24" r="9" stroke="#ffffff" stroke-width="2.5" />
      <line x1="16" y1="15" x2="32" y2="15" stroke="#fbbf24" stroke-width="2" />
      <line x1="16" y1="33" x2="32" y2="33" stroke="#fbbf24" stroke-width="2" />
      <circle cx="16" cy="24" r="3" fill="#e50914" />
      <circle cx="32" cy="24" r="3" fill="#ffffff" />
    </svg>`,
    renderIcon: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: 'block' }}>
        <rect width="48" height="48" rx="12" fill="#090812" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <circle cx="16" cy="24" r="9" stroke="#e50914" strokeWidth="2.5" />
        <circle cx="32" cy="24" r="9" stroke="#ffffff" strokeWidth="2.5" />
        <line x1="16" y1="15" x2="32" y2="15" stroke="#fbbf24" strokeWidth="2" />
        <line x1="16" y1="33" x2="32" y2="33" stroke="#fbbf24" strokeWidth="2" />
        <circle cx="16" cy="24" r="3" fill="#e50914" />
        <circle cx="32" cy="24" r="3" fill="#ffffff" />
      </svg>
    ),
    render: (size = 32) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
        {ALL_CINELOG_LOGOS[18].renderIcon(size)}
        <span style={{ fontSize: size * 0.64, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          Cine<span style={{ color: '#e50914' }}>Log</span>
        </span>
      </div>
    )
  },
  {
    id: 'cinema-crown',
    number: 20,
    name: 'The Cinephile Sovereign',
    category: 'Neon, Cyber & Midnight Cinema',
    tagline: 'Crown of Film Royalty',
    desc: 'A geometric three-point royal crown where each pinnacle is formed by a 35mm film cell with sprocket perforations and golden diamonds.',
    svgIconString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="crownGrad" x1="10" y1="14" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#ff3344" />
          <stop offset="100%" stop-color="#990000" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="#0b0814" />
      <path d="M10 34L13 16L20 25L24 12L28 25L35 16L38 34H10Z" fill="url(#crownGrad)" stroke="#fbbf24" stroke-width="1.8" stroke-linejoin="round" />
      <circle cx="13" cy="14" r="2.5" fill="#fbbf24" />
      <circle cx="24" cy="10" r="3" fill="#ffffff" />
      <circle cx="35" cy="14" r="2.5" fill="#fbbf24" />
      <rect x="15" y="30" width="3" height="2" rx="0.5" fill="#ffffff" />
      <rect x="22.5" y="30" width="3" height="2" rx="0.5" fill="#ffffff" />
      <rect x="30" y="30" width="3" height="2" rx="0.5" fill="#ffffff" />
    </svg>`,
    renderIcon: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: 'block' }}>
        <defs>
          <linearGradient id="crownGrad_jsx" x1="10" y1="14" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff3344" />
            <stop offset="100%" stopColor="#990000" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="#0b0814" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <path d="M10 34L13 16L20 25L24 12L28 25L35 16L38 34H10Z" fill="url(#crownGrad_jsx)" stroke="#fbbf24" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="13" cy="14" r="2.5" fill="#fbbf24" />
        <circle cx="24" cy="10" r="3" fill="#ffffff" />
        <circle cx="35" cy="14" r="2.5" fill="#fbbf24" />
        <rect x="15" y="30" width="3" height="2" rx="0.5" fill="#ffffff" />
        <rect x="22.5" y="30" width="3" height="2" rx="0.5" fill="#ffffff" />
        <rect x="30" y="30" width="3" height="2" rx="0.5" fill="#ffffff" />
      </svg>
    ),
    render: (size = 32) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
        {ALL_CINELOG_LOGOS[19].renderIcon(size)}
        <span style={{ fontSize: size * 0.64, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          CINE<span style={{ color: '#fbbf24' }}>LOG</span>
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
