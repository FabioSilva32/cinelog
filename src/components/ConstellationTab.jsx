import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Star, Sparkles, RefreshCw } from 'lucide-react';

const GENRE_COLORS = {
  'Action':      '#ef4444',
  'Adventure':   '#f97316',
  'Comedy':      '#eab308',
  'Drama':       '#10b981',
  'Sci-Fi':      '#3b82f6',
  'Horror':      '#880808',
  'Romance':     '#c0392b',
  'Thriller':    '#f59e0b',
  'Animation':   '#06b6d4',
  'Fantasy':     '#c0392b',
  'Crime':       '#6b7280',
  'Documentary': '#84cc16',
  'Mystery':     '#c0392b',
  'Music':       '#fb7185',
  'Family':      '#fde68a',
};

const DEFAULT_COLOR = '#880808';

function normalizeGenre(rawGenre) {
  if (!rawGenre) return 'Other';
  const rg = rawGenre.trim();
  if (rg === 'Action & Adventure') return 'Action';
  if (rg === 'Sci-Fi & Fantasy') return 'Sci-Fi';
  if (rg === 'Science Fiction') return 'Sci-Fi';
  if (rg === 'War') return 'Action';
  if (rg === 'Western') return 'Adventure';
  if (rg === 'History') return 'Drama';
  if (rg === 'Reality') return 'Other';
  if (rg === 'TV Movie') return 'Drama';

  const matched = Object.keys(GENRE_COLORS).find(k => k.toLowerCase() === rg.toLowerCase());
  return matched || rg;
}

function getStarColor(movie) {
  const genres = movie.genres || [];
  for (const g of genres) {
    const norm = normalizeGenre(g);
    if (GENRE_COLORS[norm]) return GENRE_COLORS[norm];
  }
  return DEFAULT_COLOR;
}

function lerp(a, b, t) { return a + (b - a) * t; }

export default function ConstellationTab({ library = [], onMovieClick }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const [tooltip, setTooltip] = useState(null); // { x, y, movie }
  const starsRef = useRef([]);
  const [seed, setSeed] = useState(0);
  const [viewMode, setViewMode] = useState('galaxy'); // 'galaxy', 'spiral', 'rings', 'solar'
  const [colorMode, setColorMode] = useState('genre'); // 'genre', 'temperature'
  const [groupByMode, setGroupByMode] = useState('genre'); // 'genre', 'director'
  const [enablePhysics, setEnablePhysics] = useState(false);
  const [focusedGenre, setFocusedGenre] = useState(null);
  const [wallpaperOverlay, setWallpaperOverlay] = useState('none'); // 'none', 'nebula', 'deep-space'
  const cameraRef = useRef({ x: 0, y: 0, scale: 1 });

  // Build star positions once per library change (or seed change)
  const buildStars = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const W = canvas.width;
    const H = canvas.height;

    const MARGIN = 60;
    const stars = library.map((movie, i) => {
      const rawGenre = (movie.genres || [])[0] || 'Other';
      const genre = normalizeGenre(rawGenre);
      const directorName = movie.director || movie.details?.credits?.crew?.find(c => c.job === 'Director')?.name || 'Unknown';
      const rng1 = Math.sin(i * 127.1 + seed * 13.7) * 0.5 + 0.5;
      const rng2 = Math.sin(i * 311.7 + seed * 7.3) * 0.5 + 0.5;

      let x = W / 2;
      let y = H / 2;

      if (viewMode === 'galaxy') {
        const groupName = groupByMode === 'genre' ? genre : directorName;
        const nameHash = [...groupName].reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const clusterAngle = (nameHash / 360) * Math.PI * 2;
        const clusterR = 0.28;
        const cx = (W / 2) + Math.cos(clusterAngle) * W * clusterR;
        const cy = (H / 2) + Math.sin(clusterAngle) * H * clusterR;
        const scatter = 110;
        x = cx + (rng1 - 0.5) * scatter * 2;
        y = cy + (rng2 - 0.5) * scatter * 2;
      } else if (viewMode === 'spiral') {
        const arm = i % 3;
        const angle = (i * 0.22) + (arm * (2 * Math.PI / 3)) + (seed * 0.3);
        const rCoeff = 30 + i * 9;
        x = (W / 2) + Math.cos(angle) * rCoeff;
        y = (H / 2) + Math.sin(angle) * rCoeff;
      } else if (viewMode === 'rings') {
        const rating = Number(movie.rating || 5);
        const ringIndex = Math.min(10, Math.max(1, Math.round(rating)));
        const rCoeff = 60 + (10 - ringIndex) * 32;
        const angle = (i * 0.45) + (seed * 0.6);
        x = (W / 2) + Math.cos(angle) * rCoeff;
        y = (H / 2) + Math.sin(angle) * rCoeff;
      } else if (viewMode === 'solar') {
        const rCoeff = 60 + i * 20;
        const angle = (i * 0.4) + (seed * 0.8);
        x = (W / 2) + Math.cos(angle) * rCoeff;
        y = (H / 2) + Math.sin(angle) * rCoeff * 0.35;
      }

      // Constrain inside margins
      x = Math.max(MARGIN, Math.min(W - MARGIN, x));
      y = Math.max(MARGIN, Math.min(H - MARGIN, y));

      const rating = Number(movie.rating || movie.tmdb_score || 5);
      const size = lerp(3.5, 10, Math.min(1, rating / 10));
      
      const color = colorMode === 'genre' 
        ? getStarColor(movie) 
        : (() => {
            if (rating >= 9.0) return '#06b6d4'; // Hot cyan
            if (rating >= 7.0) return '#f8fafc'; // Bright white
            if (rating >= 5.0) return '#fbbf24'; // Warm yellow
            return '#f97316'; // Dim red/orange
          })();

      const twinkleOffset = rng1 * Math.PI * 2;

      return {
        movie,
        x, y,
        baseX: x, baseY: y,
        vx: 0, vy: 0,
        floatSpeed: 0.35 + rng2 * 0.7,
        floatAmp: viewMode === 'galaxy' ? (6 + rng1 * 8) : (3 + rng1 * 4),
        floatOffset: rng1 * Math.PI * 2,
        size,
        color,
        twinkleOffset,
        genre,
        director: directorName
      };
    });

    starsRef.current = stars;
  }, [library, seed, viewMode, colorMode, groupByMode]);

  // Draw loop
  const draw = useCallback((time) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Deep space background
    if (wallpaperOverlay === 'deep-space') {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#04020a');
      grad.addColorStop(1, '#0e0b24');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = '#050407';
    }
    ctx.fillRect(0, 0, W, H);

    // Ambient nebula glows
    const nebulas = [];
    if (wallpaperOverlay === 'nebula') {
      nebulas.push(
        { x: W * 0.5, y: H * 0.5, r: W * 0.7, c1: 'rgba(192,57,43,0.08)', c2: 'rgba(136,8,8,0.03)' },
        { x: W * 0.2, y: H * 0.3, r: W * 0.4, c1: 'rgba(6,182,212,0.06)', c2: 'transparent' }
      );
    } else {
      nebulas.push(
        { x: W * 0.3, y: H * 0.35, r: W * 0.5, c1: 'rgba(136,8,8,0.07)', c2: 'rgba(184,124,248,0.03)' },
        { x: W * 0.75, y: H * 0.6, r: W * 0.45, c1: 'rgba(59,130,246,0.04)', c2: 'transparent' },
        { x: W * 0.5, y: H * 0.8, r: W * 0.35, c1: 'rgba(16,185,129,0.03)', c2: 'transparent' }
      );
    }
    nebulas.forEach(({ x, y, r, c1, c2 }) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    });

    // Draw background orbital paths if rings or solar mode
    if (viewMode === 'rings') {
      ctx.lineWidth = 0.5;
      for (let ringIndex = 1; ringIndex <= 10; ringIndex++) {
        const rCoeff = 60 + (10 - ringIndex) * 32;
        ctx.strokeStyle = `rgba(136,8,8, ${0.02 + ringIndex * 0.008})`;
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, rCoeff, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (viewMode === 'solar') {
      ctx.lineWidth = 0.5;
      const count = starsRef.current?.length || 0;
      for (let i = 0; i < count; i++) {
        const rCoeff = 60 + i * 20;
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.035)';
        ctx.beginPath();
        ctx.ellipse(W / 2, H / 2, rCoeff, rCoeff * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Tiny random background stars (decorative)
    const bgSeed = W * 997 + H;
    for (let i = 0; i < 80; i++) {
      const bx = (Math.sin(i * 123.456 + bgSeed) * 0.5 + 0.5) * W;
      const by = (Math.sin(i * 789.012 + bgSeed) * 0.5 + 0.5) * H;
      const br = 0.5 + (Math.sin(i * 456.789) * 0.5 + 0.5) * 0.8;
      const alpha = 0.1 + (Math.sin(i * 333.1 + time / 3000) * 0.5 + 0.5) * 0.15;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }

    // Calculate drifted star coordinates
    let stars = starsRef.current.map(star => {
      const bx = star.baseX !== undefined ? star.baseX : star.x;
      const by = star.baseY !== undefined ? star.baseY : star.y;
      const fs = star.floatSpeed !== undefined ? star.floatSpeed : 0.6;
      const fa = star.floatAmp !== undefined ? star.floatAmp : 10;
      const fo = star.floatOffset !== undefined ? star.floatOffset : 0;
      
      const cx = bx + Math.sin(time / 2200 * fs + fo) * fa;
      const cy = by + Math.cos(time / 2200 * fs + fo) * fa;
      
      return {
        ...star,
        baseX: bx,
        baseY: by,
        floatSpeed: fs,
        floatAmp: fa,
        floatOffset: fo,
        x: cx,
        y: cy
      };
    });

    // ── GRAVITATIONAL PHYSICS SIMULATION ──
    if (enablePhysics && viewMode === 'galaxy') {
      const attractionStrength = 0.06;
      const repulsionStrength = 2.0;
      const minDistance = 45;

      for (let i = 0; i < stars.length; i++) {
        const s1 = stars[i];
        let fx = 0;
        let fy = 0;

        for (let j = 0; j < stars.length; j++) {
          if (i === j) continue;
          const s2 = stars[j];
          const dx = s2.x - s1.x;
          const dy = s2.y - s1.y;
          const dist = Math.hypot(dx, dy) || 1;

          const sameGroup = groupByMode === 'genre' 
            ? s1.genre === s2.genre 
            : s1.director === s2.director;

          if (sameGroup) {
            fx += (dx / dist) * attractionStrength;
            fy += (dy / dist) * attractionStrength;
          }

          if (dist < minDistance) {
            const force = (minDistance - dist) * repulsionStrength * 0.05;
            fx -= (dx / dist) * force;
            fy -= (dy / dist) * force;
          }
        }

        s1.vx = (s1.vx || 0) * 0.82 + fx;
        s1.vy = (s1.vy || 0) * 0.82 + fy;
      }

      stars.forEach(s => {
        s.x += s.vx || 0;
        s.y += s.vy || 0;
        
        // constrain
        const margin = 50;
        s.x = Math.max(margin, Math.min(W - margin, s.x));
        s.y = Math.max(margin, Math.min(H - margin, s.y));
        s.baseX = s.x;
        s.baseY = s.y;
      });
    }

    // Write coordinates back for hover accuracy
    starsRef.current = stars;

    // ── CAMERA ZOOM MATRIX TRANSLATIONS ──
    let targetScale = 1;
    let targetX = 0;
    let targetY = 0;

    if (focusedGenre) {
      const groupStars = stars.filter(s => s.genre === focusedGenre);
      if (groupStars.length > 0) {
        const avgX = groupStars.reduce((acc, s) => acc + s.x, 0) / groupStars.length;
        const avgY = groupStars.reduce((acc, s) => acc + s.y, 0) / groupStars.length;
        targetScale = 1.7;
        targetX = (W / 2) - avgX * targetScale;
        targetY = (H / 2) - avgY * targetScale;
      }
    }

    cameraRef.current.scale = lerp(cameraRef.current.scale, targetScale, 0.08);
    cameraRef.current.x = lerp(cameraRef.current.x, targetX, 0.08);
    cameraRef.current.y = lerp(cameraRef.current.y, targetY, 0.08);

    ctx.save();
    ctx.translate(cameraRef.current.x, cameraRef.current.y);
    ctx.scale(cameraRef.current.scale, cameraRef.current.scale);

    // Draw constellation lines (same group connections)
    ctx.lineWidth = 0.5;
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const sameGroup = groupByMode === 'genre' 
          ? stars[i].genre === stars[j].genre 
          : stars[i].director === stars[j].director;
        if (!sameGroup) continue;

        const dx = stars[j].x - stars[i].x;
        const dy = stars[j].y - stars[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 180) continue;
        const alpha = (1 - dist / 180) * 0.35;
        ctx.strokeStyle = stars[i].color + Math.round(alpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.moveTo(stars[i].x, stars[i].y);
        ctx.lineTo(stars[j].x, stars[j].y);
        ctx.stroke();
      }
    }

    // Draw stars and titles
    stars.forEach(star => {
      const twinkle = 0.6 + 0.4 * Math.sin(time / 1000 + star.twinkleOffset);
      const r = star.size * twinkle;

      // Glow
      const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, r * 4);
      glow.addColorStop(0, star.color + 'aa');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(star.x, star.y, r * 4, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = star.color;
      ctx.shadowBlur = 8 * twinkle;
      ctx.shadowColor = star.color;
      ctx.beginPath();
      ctx.arc(star.x, star.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // White center
      ctx.fillStyle = '#ffffffcc';
      ctx.beginPath();
      ctx.arc(star.x, star.y, r * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Show title under star if rating >= 9.0 OR if this star is focused by zoom
      const isFocused = focusedGenre && star.genre === focusedGenre;
      if ((star.movie.status === 'watched' && Number(star.movie.rating) >= 9) || isFocused) {
        ctx.fillStyle = isFocused ? '#ffffff' : 'rgba(255, 255, 255, 0.85)';
        ctx.font = isFocused ? '800 9px "Inter", sans-serif' : '700 9.5px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#000000';
        ctx.fillText(star.movie.title, star.x, star.y + star.size + 12);
        ctx.shadowBlur = 0;
      }
    });

    ctx.restore();

    animFrameRef.current = requestAnimationFrame(draw);
  }, [viewMode, colorMode, groupByMode, enablePhysics, focusedGenre, wallpaperOverlay]);

  // Setup canvas + start loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const resize = () => {
      canvas.width = parent.clientWidth;
      canvas.height = Math.max(500, parent.clientHeight);
      buildStars();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    animFrameRef.current = requestAnimationFrame(draw);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [buildStars, draw]);

  useEffect(() => {
    buildStars();
  }, [buildStars]);

  // Mouse hover
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let mx = e.clientX - rect.left;
    let my = e.clientY - rect.top;

    // Apply inverse camera transformations to mouse coordinates
    mx = (mx - cameraRef.current.x) / cameraRef.current.scale;
    my = (my - cameraRef.current.y) / cameraRef.current.scale;

    const stars = starsRef.current;
    let found = null;
    for (const star of stars) {
      const dist = Math.hypot(star.x - mx, star.y - my);
      if (dist < star.size * 5 + 8) { found = star; break; }
    }
    if (found) {
      setTooltip({ x: found.x, y: found.y, movie: found.movie });
    } else {
      setTooltip(null);
    }
  };

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let mx = e.clientX - rect.left;
    let my = e.clientY - rect.top;

    // Apply inverse camera transformations to mouse coordinates
    mx = (mx - cameraRef.current.x) / cameraRef.current.scale;
    my = (my - cameraRef.current.y) / cameraRef.current.scale;

    for (const star of starsRef.current) {
      const dist = Math.hypot(star.x - mx, star.y - my);
      if (dist < star.size * 5 + 8) {
        onMovieClick && onMovieClick(star.movie.tmdb_id, star.movie.media_type || 'movie');
        break;
      }
    }
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `cinelog-constellation-${viewMode}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Genre legend
  const activeGenres = [...new Set(starsRef.current.map(s => s.genre))];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '26px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.5px' }}>
            <Sparkles size={22} color="var(--accent)" />
            Your Constellation Map
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
            Each star is a film you've logged. Stars of the same genre form constellations. Click any star to open it.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Templates Selector */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2px 4px' }}>
            {[
              { id: 'galaxy', label: '🌌 Galaxy' },
              { id: 'spiral', label: '🌀 Spiral' },
              { id: 'rings', label: '🪐 Rings' },
              { id: 'solar', label: '☀️ Orbit' }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                style={{
                  background: viewMode === mode.id ? 'var(--accent)' : 'none',
                  border: 'none',
                  color: viewMode === mode.id ? '#fff' : 'var(--text-muted)',
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: '16px',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div style={{ background: 'rgba(136,8,8,0.08)', border: '1px solid rgba(136,8,8,0.2)', borderRadius: '20px', padding: '5px 12px', fontSize: '11.5px', fontWeight: 700, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={11} fill="currentColor" /> {library.length} stars
          </div>

          <button
            className="btn btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', height: '32px', padding: '0 10px' }}
            onClick={() => setSeed(s => s + 1)}
          >
            <RefreshCw size={12} />
            Shuffle
          </button>

          <button
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', height: '32px', padding: '0 12px' }}
            onClick={handleExportPNG}
          >
            📥 Export Map
          </button>
        </div>
      </div>

      {/* Settings sub-toolbar */}
      <div className="glass animate-fade-in" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', padding: '12px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Group By selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Group By:</span>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2px 4px' }}>
              {[{ id: 'genre', label: 'Genre' }, { id: 'director', label: 'Director' }].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setGroupByMode(opt.id)}
                  style={{
                    background: groupByMode === opt.id ? 'var(--accent)' : 'none',
                    border: 'none',
                    color: groupByMode === opt.id ? '#fff' : 'var(--text-muted)',
                    fontSize: '11px', fontWeight: 700, borderRadius: '16px', padding: '4px 10px', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color By selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Color By:</span>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2px 4px' }}>
              {[{ id: 'genre', label: 'Genre' }, { id: 'temperature', label: 'Rating Temp' }].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setColorMode(opt.id)}
                  style={{
                    background: colorMode === opt.id ? 'var(--accent)' : 'none',
                    border: 'none',
                    color: colorMode === opt.id ? '#fff' : 'var(--text-muted)',
                    fontSize: '11px', fontWeight: 700, borderRadius: '16px', padding: '4px 10px', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Physics toggle */}
          {viewMode === 'galaxy' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attraction Physics:</span>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2px 4px' }}>
                {[{ val: false, label: 'Off' }, { val: true, label: 'On' }].map(opt => (
                  <button
                    key={String(opt.val)}
                    onClick={() => setEnablePhysics(opt.val)}
                    style={{
                      background: enablePhysics === opt.val ? 'var(--accent)' : 'none',
                      border: 'none',
                      color: enablePhysics === opt.val ? '#fff' : 'var(--text-muted)',
                      fontSize: '11px', fontWeight: 700, borderRadius: '16px', padding: '4px 10px', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Wallpaper selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Space Theme:</span>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2px 4px' }}>
              {[
                { id: 'none', label: 'Void' },
                { id: 'nebula', label: 'Nebulae' },
                { id: 'deep-space', label: 'Deep Blue' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setWallpaperOverlay(opt.id)}
                  style={{
                    background: wallpaperOverlay === opt.id ? 'var(--accent)' : 'none',
                    border: 'none',
                    color: wallpaperOverlay === opt.id ? '#fff' : 'var(--text-muted)',
                    fontSize: '11px', fontWeight: 700, borderRadius: '16px', padding: '4px 10px', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {focusedGenre && (
          <button
            onClick={() => setFocusedGenre(null)}
            className="btn btn-ghost"
            style={{ fontSize: '11.5px', color: 'var(--red)', padding: '4px 12px', height: 'auto', fontWeight: 800 }}
          >
            Clear Focus Zoom [X]
          </button>
        )}
      </div>

      {/* Canvas container */}
      <div
        className="glass"
        style={{
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          position: 'relative',
          minHeight: '520px',
          border: '1px solid var(--border)',
        }}
      >
        {library.length === 0 && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '12px', zIndex: 10
          }}>
            <Star size={40} color="var(--text-dim)" />
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Add movies to your library to see your constellation
            </p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '540px', display: 'block', touchAction: 'none' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
          onClick={(e) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const stars = starsRef.current;
            let hit = null;
            let minDist = 24; // Touch radius threshold
            for (let i = 0; i < stars.length; i++) {
              const star = stars[i];
              const dist = Math.hypot(star.x - mouseX, star.y - mouseY);
              if (dist < minDist) {
                minDist = dist;
                hit = star;
              }
            }
            if (hit) {
              if (onMovieClick) onMovieClick(hit.movie.tmdb_id || hit.movie.id, hit.movie.media_type || 'movie');
            }
          }}
        />

        {/* Tooltip */}
        {tooltip && (
          <div style={{
            position: 'absolute',
            left: Math.min(
              tooltip.x * cameraRef.current.scale + cameraRef.current.x + 14,
              (canvasRef.current?.clientWidth || 600) - 220
            ),
            top: Math.max(
              10,
              tooltip.y * cameraRef.current.scale + cameraRef.current.y - 60
            ),
            background: 'rgba(8,7,11,0.95)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '10px 14px',
            pointerEvents: 'none',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            maxWidth: '220px',
            backdropFilter: 'blur(12px)',
          }}>
            {tooltip.movie.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w92${tooltip.movie.poster_path}`}
                alt=""
                style={{ width: '36px', height: '54px', objectFit: 'cover', borderRadius: '4px' }}
              />
            )}
            <div>
              <div style={{ fontWeight: 800, fontSize: '13px' }}>{tooltip.movie.title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                {tooltip.movie.release_year || '—'} • {(tooltip.movie.genres || [])[0] || '—'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: '2px' }}>
                Dir: {tooltip.movie.director || 'Unknown'}
              </div>
              {tooltip.movie.rating && (
                <div style={{ color: 'var(--gold)', fontSize: '11px', marginTop: '2px' }}>
                  ★ {tooltip.movie.rating}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Genre Legend */}
      {activeGenres.length > 0 && (
        <div className="glass" style={{ borderRadius: 'var(--radius)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Genre Legend (Click to Focus Zoom)</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{activeGenres.length} genres detected</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {activeGenres.sort().map(genre => {
              const isFocused = focusedGenre === genre;
              return (
                <button
                  key={genre}
                  onClick={() => setFocusedGenre(isFocused ? null : genre)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', fontWeight: 600,
                    background: isFocused ? 'rgba(136,8,8,0.15)' : 'rgba(255,255,255,0.03)',
                    border: isFocused ? '1px solid var(--accent)' : '1px solid var(--border)',
                    borderRadius: '20px', padding: '4px 12px', cursor: 'pointer', transition: 'all 0.2s',
                    color: isFocused ? 'var(--accent)' : 'var(--text)'
                  }}
                >
                  <span style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: GENRE_COLORS[genre] || DEFAULT_COLOR,
                    boxShadow: `0 0 6px ${GENRE_COLORS[genre] || DEFAULT_COLOR}`,
                    flexShrink: 0
                  }} />
                  {genre}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


