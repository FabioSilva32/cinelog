import React, { useMemo, useState } from 'react';
import { BarChart3, Trophy, Sparkles, Star, Heart, Clock, Film, Calendar, Zap, TrendingUp } from 'lucide-react';

// ── SVG DONUT CHART ──────────────────────────────────────────────────────────
function DonutChart({ segments, size = 180, thickness = 38 }) {
  const [hovered, setHovered] = useState(null);
  const R = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * R;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  let cumulativeOffset = 0;
  const arcs = segments.map((seg) => {
    const pct = seg.value / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const start = cumulativeOffset;
    cumulativeOffset += dash;
    return { ...seg, dash, gap, start, pct };
  });

  const hoveredSeg = hovered !== null ? arcs[hovered] : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={thickness} />
          {arcs.map((arc, i) => (
            <circle key={i} cx={cx} cy={cy} r={R} fill="none"
              stroke={arc.color}
              strokeWidth={hovered === i ? thickness + 5 : thickness}
              strokeDasharray={`${Math.max(0, arc.dash - 3)} ${arc.gap + 3}`}
              strokeDashoffset={-arc.start}
              strokeLinecap="round"
              style={{
                cursor: 'pointer', transition: 'stroke-width 0.2s, opacity 0.2s',
                filter: hovered === i ? `drop-shadow(0 0 10px ${arc.color})` : 'none',
                opacity: hovered !== null && hovered !== i ? 0.45 : 1
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          {hoveredSeg ? (
            <>
              <div style={{ fontSize: '20px', fontWeight: 900, color: hoveredSeg.color }}>{Math.round(hoveredSeg.pct * 100)}%</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center', maxWidth: '70px', lineHeight: 1.2 }}>{hoveredSeg.label}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text)' }}>{total}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700 }}>GENRES</div>
            </>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', flex: 1, minWidth: '110px' }}>
        {arcs.map((arc, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: hovered !== null && hovered !== i ? 0.45 : 1, transition: 'opacity 0.2s' }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: arc.color, boxShadow: `0 0 6px ${arc.color}88`, flexShrink: 0 }} />
            <span style={{ fontSize: '11.5px', fontWeight: 700, flex: 1, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{arc.label}</span>
            <span style={{ fontSize: '11px', fontWeight: 900, color: arc.color }}>{arc.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SVG RATING AREA CHART ────────────────────────────────────────────────────
// ── SVG RATING AREA CHART ────────────────────────────────────────────────────
function RatingAreaChart({ library, onMovieClick }) {
  const [hovIdx, setHovIdx] = useState(null);
  const buckets = useMemo(() => {
    const map = {};
    for (let i = 1; i <= 10; i++) map[i] = 0;
    library.forEach(m => {
      if (m.rating != null && m.rating > 0) {
        const r = Math.min(10, Math.max(1, Math.round(Number(m.rating))));
        map[r]++;
      }
    });
    return Object.entries(map).map(([r, c]) => ({ rating: Number(r), count: c }));
  }, [library]);

  const maxCount = Math.max(...buckets.map(b => b.count), 1);
  const total = library.filter(m => m.rating > 0).length;
  const W = 320, H = 110, PAD_X = 14, PAD_Y = 12;

  const points = buckets.map((b, i) => ({
    x: PAD_X + i * ((W - PAD_X * 2) / 9),
    y: H - PAD_Y - (b.count / maxCount) * (H - PAD_Y * 2),
    count: b.count, rating: b.rating,
  }));

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = points[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `${acc} C ${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${H - PAD_Y} L ${points[0].x},${H - PAD_Y} Z`;

  if (total === 0) return (
    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)', fontSize: '12px' }}>
      Rate titles to see your distribution curve.
    </div>
  );

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c6ff7" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#7c6ff7" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map(p => (
          <line key={p} x1={PAD_X} y1={H - PAD_Y - p * (H - PAD_Y * 2)} x2={W - PAD_X} y2={H - PAD_Y - p * (H - PAD_Y * 2)}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}
        <path d={areaD} fill="url(#ratingGrad)" />
        <path d={pathD} fill="none" stroke="#7c6ff7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(124,111,247,0.6))' }} />
        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setHovIdx(i)} onMouseLeave={() => setHovIdx(null)} style={{ cursor: 'pointer' }}>
            <circle cx={p.x} cy={p.y} r={hovIdx === i ? 6 : (p.count > 0 ? 4 : 2.5)}
              fill={hovIdx === i ? '#fff' : (p.count > 0 ? '#7c6ff7' : 'rgba(124,111,247,0.3)')}
              stroke={p.count > 0 ? '#7c6ff7' : 'transparent'} strokeWidth="2"
              style={{ filter: hovIdx === i ? 'drop-shadow(0 0 8px rgba(124,111,247,0.9))' : 'none', transition: 'r 0.15s' }} />
            <text x={p.x} y={H + 2} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8.5" fontWeight="600">{p.rating}</text>
          </g>
        ))}
      </svg>

      {/* Hover Tooltip Overlay with Movie Posters */}
      {hovIdx !== null && points[hovIdx] && points[hovIdx].count > 0 && (() => {
        const p = points[hovIdx];
        const matchingMovies = library.filter(m => m.rating != null && Math.min(10, Math.max(1, Math.round(Number(m.rating)))) === p.rating);
        
        const pctX = (p.x / W) * 100;
        const pctY = (p.y / H) * 100;

        return (
          <div className="glass animate-fade-in-scale" style={{
            position: 'absolute',
            left: `${pctX}%`,
            top: `${pctY}%`,
            transform: 'translate(-50%, -108%)',
            background: 'rgba(8,7,12,0.98)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '10px 12px',
            pointerEvents: 'auto',
            zIndex: 100,
            width: '180px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{ fontWeight: 800, fontSize: '11px', color: '#fff', marginBottom: '6px', textAlign: 'center' }}>
              {p.count} {p.count === 1 ? 'Film' : 'Films'} rated {p.rating} ★
            </div>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {matchingMovies.slice(0, 4).map(m => (
                <img
                  key={m.id || m.tmdb_id}
                  src={m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=80&q=80'}
                  alt=""
                  onClick={() => onMovieClick && onMovieClick(m.tmdb_id, m.media_type || 'movie')}
                  style={{ width: '28px', height: '42px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: '1px solid var(--border)' }}
                  title={m.title}
                />
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}


export default function StatsTab({ library, onMovieClick }) {
  const [decadeStart, setDecadeStart] = useState(1950);
  const [decadeEnd, setDecadeEnd] = useState(2020);

  const filteredLibrary = useMemo(() => {
    return library.filter(m => {
      const yearStr = m.release_year || m.year;
      if (!yearStr) return true;
      const year = parseInt(yearStr);
      if (isNaN(year)) return true;
      return year >= decadeStart && year <= (decadeEnd + 9);
    });
  }, [library, decadeStart, decadeEnd]);

  // ── CORE METRICS ───────────────────────────────────────────────────
  const watchedCount = filteredLibrary.filter(m => m.status === 'watched').length;
  const watchlistCount = filteredLibrary.filter(m => m.status === 'plan_to_watch').length;
  const watchlistCountTotal = library.filter(m => m.status === 'plan_to_watch').length;
  const favCount = filteredLibrary.filter(m => m.favorite).length;

  const avgRating = useMemo(() => {
    const rated = filteredLibrary.filter(m => m.rating != null && m.rating > 0);
    if (rated.length === 0) return 0;
    return rated.reduce((s, m) => s + Number(m.rating), 0) / rated.length;
  }, [filteredLibrary]);

  // Total runtime estimate (e.g. 115 minutes average per movie, 45 per TV episode)
  const totalRuntimeHours = useMemo(() => {
    let totalMin = 0;
    filteredLibrary.forEach(m => {
      if (m.status === 'watched') {
        totalMin += m.media_type === 'tv' ? 45 : 115;
      }
    });
    return Math.round(totalMin / 60);
  }, [filteredLibrary]);

  // ── WATCH STREAKS ──
  const streaks = useMemo(() => {
    const watchDates = [...new Set(filteredLibrary
      .map(m => m.watch_date || m.date_added)
      .filter(Boolean)
      .map(d => d.slice(0, 10))
    )].sort();
    
    if (watchDates.length === 0) return { current: 0, longest: 0 };
    
    let longest = 0;
    let temp = 0;
    let prevDate = null;
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    for (const dStr of watchDates) {
      const d = new Date(dStr);
      if (prevDate) {
        const diff = d - prevDate;
        if (diff <= oneDayMs + 10000) {
          temp++;
        } else {
          if (temp > longest) longest = temp;
          temp = 1;
        }
      } else {
        temp = 1;
      }
      prevDate = d;
    }
    if (temp > longest) longest = temp;
    
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - oneDayMs).toISOString().slice(0, 10);
    const hasToday = watchDates.includes(today);
    const hasYesterday = watchDates.includes(yesterday);
    const current = (hasToday || hasYesterday) ? temp : 0;
    
    return { current, longest };
  }, [filteredLibrary]);

  // ── TOP GENRES + DONUT SEGMENTS ────────────────────────────────────
  const genreStats = useMemo(() => {
    const map = {};
    filteredLibrary.forEach(m => (m.genres || []).forEach(g => { map[g] = (map[g] || 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 7);
  }, [filteredLibrary]);

  const GENRE_COLOR_MAP = {
    'Action': '#ef4444', 'Adventure': '#f97316', 'Comedy': '#eab308',
    'Drama': '#10b981', 'Sci-Fi': '#3b82f6', 'Horror': '#8b5cf6',
    'Romance': '#ec4899', 'Thriller': '#f59e0b', 'Animation': '#06b6d4',
    'Fantasy': '#a78bfa', 'Crime': '#6b7280', 'Documentary': '#84cc16',
    'Mystery': '#c084fc', 'Music': '#fb7185', 'Family': '#fde68a',
  };
  const GENRE_FALLBACKS = ['#7c6ff7', '#10b981', '#ef4444', '#fbbf24', '#3b82f6', '#ec4899', '#8b5cf6'];

  const donutSegments = genreStats.map(([g, v], i) => ({
    label: g, value: v,
    color: GENRE_COLOR_MAP[g] || GENRE_FALLBACKS[i % GENRE_FALLBACKS.length],
  }));

  // ── TOP RATED LIST ─────────────────────────────────────────────────
  const topRated = useMemo(() => {
    return [...filteredLibrary]
      .filter(m => m.rating != null && m.status === 'watched')
      .sort((a, b) => Number(b.rating) - Number(a.rating))
      .slice(0, 6);
  }, [filteredLibrary]);

  // ── MOVIE DIARY HEATMAP (GitHub Commit Style) ──────────────────────
  // Show movie logs density over the last 12 months (365 days)
  const heatmapData = useMemo(() => {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    const logsByDate = {};
    filteredLibrary.forEach(m => {
      if (m.date_added) {
        const dateStr = new Date(m.date_added).toISOString().split('T')[0];
        logsByDate[dateStr] = (logsByDate[dateStr] || 0) + 1;
      }
    });

    const days = [];
    let current = new Date(oneYearAgo);
    current.setDate(current.getDate() - current.getDay());

    while (current <= today) {
      const dateStr = current.toISOString().split('T')[0];
      const count = logsByDate[dateStr] || 0;
      days.push({
        date: new Date(current),
        dateStr,
        count
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [filteredLibrary]);

  // ── STATISTICS COMPARISONS ─────────────────────────────────────────
  const comparisons = useMemo(() => {
    if (watchedCount === 0) return null;
    const marsTripDays = 260; // Travel to Mars is ~260 days
    const totalDays = parseFloat((totalRuntimeHours / 24).toFixed(1));
    const marsPercent = Math.min(100, Math.round((totalDays / marsTripDays) * 100));

    return {
      totalDays,
      marsPercent,
      popcornCount: Math.round(watchedCount * 1.5),
      framesCount: (watchedCount * 115 * 60 * 24).toLocaleString()
    };
  }, [watchedCount, totalRuntimeHours]);

  // ── MEDIA TYPE BREAKDOWN ────────────────────────────────────────────
  const mediaTypeStats = useMemo(() => {
    const movies = filteredLibrary.filter(m => m.media_type === 'movie' || (!m.media_type && m.type !== 'anime' && m.type !== 'tv'));
    const series = filteredLibrary.filter(m => m.media_type === 'tv' || m.type === 'tv');
    const anime = filteredLibrary.filter(m => m.media_type === 'anime' || m.type === 'anime');
    const total = filteredLibrary.length || 1;
    return [
      { label: 'Movies', count: movies.length, color: '#7c6ff7', pct: Math.round((movies.length / total) * 100) },
      { label: 'Series', count: series.length, color: '#3b82f6', pct: Math.round((series.length / total) * 100) },
      { label: 'Anime', count: anime.length, color: '#f97316', pct: Math.round((anime.length / total) * 100) },
    ];
  }, [filteredLibrary]);

  // ── RUNTIME BREAKDOWN ──
  const runtimeStats = useMemo(() => {
    let shortCount = 0; 
    let standardCount = 0; 
    let featureCount = 0; 
    let epicCount = 0; 
    
    filteredLibrary.forEach(m => {
      if (m.status !== 'watched') return;
      const run = m.media_type === 'tv' ? 45 : 115; 
      if (run < 90) shortCount++;
      else if (run <= 120) standardCount++;
      else if (run <= 150) featureCount++;
      else epicCount++;
    });
    
    const total = shortCount + standardCount + featureCount + epicCount || 1;
    return [
      { label: 'Short (<90m)', count: shortCount, color: '#06b6d4', pct: Math.round((shortCount / total) * 100) },
      { label: 'Standard (90-120m)', count: standardCount, color: '#3b82f6', pct: Math.round((standardCount / total) * 100) },
      { label: 'Feature (120-150m)', count: featureCount, color: '#a78bfa', pct: Math.round((featureCount / total) * 100) },
      { label: 'Epic (>150m)', count: epicCount, color: '#ec4899', pct: Math.round((epicCount / total) * 100) }
    ];
  }, [filteredLibrary]);

  // ── DECADE BREAKDOWN ───────────────────────────────────────────────
  const decadeStats = useMemo(() => {
    const map = {};
    filteredLibrary.forEach(m => {
      const year = parseInt(m.release_year);
      if (!isNaN(year) && year > 1900) {
        const decade = `${Math.floor(year / 10) * 10}s`;
        map[decade] = (map[decade] || 0) + 1;
      }
    });
    return Object.entries(map).sort((a, b) => parseInt(b[0]) - parseInt(a[0])).slice(0, 6);
  }, [filteredLibrary]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px', paddingBottom: '40px' }}>
      
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BarChart3 size={28} color="var(--accent)" />
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.5px' }}>Cinema Analytics</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>Insights, trends, and achievements across your film collection.</p>
          </div>
        </div>

        {/* Decade Filter Selectors */}
        <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '30px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Era:</span>
          <select
            value={decadeStart}
            onChange={e => setDecadeStart(Number(e.target.value))}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
          >
            {[1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020].map(yr => (
              <option key={yr} value={yr} style={{ background: '#0a0813', color: '#fff' }}>{yr}s</option>
            ))}
          </select>
          <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>to</span>
          <select
            value={decadeEnd}
            onChange={e => setDecadeEnd(Number(e.target.value))}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
          >
            {[1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020].map(yr => (
              <option key={yr} value={yr} disabled={yr < decadeStart} style={{ background: '#0a0813', color: '#fff' }}>{yr}s</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── STATS CARDS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Total Titles', val: filteredLibrary.length, color: 'var(--accent)', glow: 'rgba(124,111,247,0.2)', icon: Film, detail: `${watchedCount} Watched · ${watchlistCount} Watchlist` },
          { label: 'Time Invested', val: `${totalRuntimeHours}h`, color: 'var(--green)', glow: 'rgba(16,185,129,0.2)', icon: Clock, detail: `Approx. ${comparisons ? comparisons.totalDays : 0} complete days` },
          { label: 'Avg Rating', val: avgRating > 0 ? avgRating.toFixed(1) : '—', color: 'var(--gold)', glow: 'rgba(251,191,36,0.2)', icon: Star, detail: `Across ${filteredLibrary.filter(m => m.rating).length} rated titles` },
          { label: 'Favorites', val: favCount, color: 'var(--red)', glow: 'rgba(239,68,68,0.2)', icon: Heart, detail: `${Math.round((favCount / (filteredLibrary.length || 1)) * 100)}% of collection` },
          { label: 'Watch Streak', val: `${streaks.current}d`, color: '#ec4899', glow: 'rgba(236,72,153,0.2)', icon: Zap, detail: `Longest streak: ${streaks.longest} days` }
        ].map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="glass" style={{
              borderRadius: 'var(--radius-lg)', padding: '20px', position: 'relative', overflow: 'hidden',
              border: '1px solid var(--border)', transition: 'all 0.3s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.boxShadow = `0 10px 25px ${s.glow}`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '90px', height: '90px', background: `radial-gradient(circle, ${s.glow} 0%, transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</span>
                <Icon size={18} color={s.color} style={{ opacity: 0.8 }} />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: s.color, fontFamily: 'var(--font-heading)', lineHeight: 1.1, marginBottom: '6px' }}>
                {s.val}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.detail}</div>
            </div>
          );
        })}
      </div>

      {/* ── GENRE DONUT + RATING CURVE ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

        {/* Genre Donut */}
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Sparkles size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Genre Breakdown</h3>
          </div>
          {donutSegments.length > 0 ? (
            <DonutChart segments={donutSegments} />
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
              Log titles with genres to see the donut chart.
            </div>
          )}
        </div>

        {/* Rating Distribution Curve */}
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <TrendingUp size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Rating Distribution</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: 'auto' }}>
              {filteredLibrary.filter(m => m.rating > 0).length} rated
            </span>
          </div>
          <RatingAreaChart library={filteredLibrary} onMovieClick={onMovieClick} />
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '16px', textAlign: 'center' }}>
            Rating frequency by score (1–10) — hover circles to see movie posters
          </div>
        </div>
      </div>

      {/* ── TOP RATED + CHALLENGES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

        {/* Top Rated */}
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Star size={18} color="var(--gold)" fill="var(--gold)" />
            <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Top Rated Masterpieces</h3>
          </div>
          {topRated.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topRated.map((m, i) => (
                <div key={m.id} onClick={() => onMovieClick(m.tmdb_id, m.media_type || 'movie')}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'all 0.2s', background: 'rgba(255,255,255,0.01)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: 800, width: '18px', textAlign: 'center' }}>#{i + 1}</span>
                  {m.poster_path && (
                    <img src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} alt="" style={{ width: '32px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{m.release_year} · {m.media_type === 'tv' ? 'Series' : m.media_type === 'anime' ? 'Anime' : 'Film'}</div>
                  </div>
                  <span style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '14px' }}>★ {Number(m.rating).toFixed(1)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
              Rate watched titles to see your masterpieces!
            </div>
          )}
        </div>

        {/* Active Challenges */}
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Trophy size={18} color="var(--gold)" />
            <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Active Challenges</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: '🎬 2026 Marathon', current: watchedCount, goal: 50, note: 'Watch 50 titles this year' },
              { label: '👾 Sci-Fi Explorer', current: library.filter(m => m.genres?.includes('Sci-Fi')).length, goal: 10, note: 'Log 10 Sci-Fi titles' },
              { label: '❤️ Favorites Wall', current: favCount, goal: 12, note: 'Mark 12 favorites' },
              { label: '⭐ High Rater', current: library.filter(m => Number(m.rating) >= 9).length, goal: 5, note: 'Rate 5 titles at 9+' },
            ].map(c => {
              const pct = Math.min(100, Math.round((c.current / c.goal) * 100));
              const done = pct >= 100;
              return (
                <div key={c.label} style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: `1px solid ${done ? 'rgba(16,185,129,0.3)' : 'var(--border)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                    <span>{c.label}</span>
                    <span style={{ color: done ? 'var(--green)' : 'var(--accent)' }}>
                      {done ? '🏆 Done!' : `${Math.min(c.current, c.goal)}/${c.goal}`}
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: '6px' }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: done ? 'var(--green)' : 'var(--accent-gradient)' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>{c.note}</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── FUN TRIVIA ── */}
      {comparisons && (
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Zap size={18} color="var(--accent)" />
              <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Fun Trivia</h3>
            </div>
            {comparisons ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13.5px', lineHeight: 1.5 }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '22px' }}>🚀</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>Journey to Mars</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                      Your total viewing time equals {comparisons.totalDays} complete days. That is {comparisons.marsPercent}% of the 260 days required to travel to Mars.
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '22px' }}>🍿</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>Popcorn Consumption</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                      If you ate popcorn during every watched title, you would have consumed roughly {comparisons.popcornCount} buckets of popcorn!
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '22px' }}>🎞️</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>Projected Frames</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                      At a standard 24 frames per second, you have witnessed approximately {comparisons.framesCount} individual frames of cinematic history.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '10px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
                Add watched films to see your trivia metrics.
              </div>
            )}
        </div>
      )}

      {/* ── MEDIA TYPE, RUNTIME & DECADE BREAKDOWN ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
        
        {/* Media Type */}
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Film size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Media Type Breakdown</h3>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            {mediaTypeStats.map(type => (
              <div key={type.label} style={{ flex: 1, textAlign: 'center', padding: '14px 8px', background: `${type.color}12`, borderRadius: '12px', border: `1px solid ${type.color}30` }}>
                <div style={{ fontSize: '22px', fontWeight: 900, color: type.color }}>{type.count}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, marginTop: '3px' }}>{type.label}</div>
                <div style={{ fontSize: '10px', color: type.color, fontWeight: 700 }}>{type.pct}%</div>
              </div>
            ))}
          </div>
          {/* Segmented bar */}
          <div style={{ height: '8px', borderRadius: '4px', overflow: 'hidden', display: 'flex', gap: '2px' }}>
            {mediaTypeStats.filter(t => t.count > 0).map(type => (
              <div key={type.label} style={{ height: '100%', width: `${type.pct}%`, background: type.color, borderRadius: '4px', transition: 'width 0.4s ease' }} title={`${type.label}: ${type.pct}%`} />
            ))}
          </div>
        </div>

        {/* Runtime Breakdown */}
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Clock size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Runtime Breakdown</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {runtimeStats.map(stat => (
              <div key={stat.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
                  <span>{stat.label}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{stat.count} ({stat.pct}%)</span>
                </div>
                <div className="progress-bar" style={{ height: '6px' }}>
                  <div className="progress-fill" style={{ width: `${stat.pct}%`, background: stat.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decade Distribution */}
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <TrendingUp size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '15px', fontWeight: 800 }}>By Decade</h3>
          </div>
          {decadeStats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {decadeStats.map(([decade, count], i) => {
                const maxCount = Math.max(...decadeStats.map(d => d[1]));
                const pct = Math.round((count / maxCount) * 100);
                const DECADE_COLORS = ['#7c6ff7', '#3b82f6', '#10b981', '#fbbf24', '#f97316', '#ec4899'];
                return (
                  <div key={decade}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
                      <span>{decade}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{count} titles</span>
                    </div>
                    <div className="progress-bar" style={{ height: '6px' }}>
                      <div className="progress-fill" style={{ width: `${pct}%`, background: DECADE_COLORS[i % DECADE_COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '12px' }}>
              Add titles with release years to see your decade distribution.
            </div>
          )}
        </div>

      </div>

      {/* ── MOVIE DIARY HEATMAP ── */}
      <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Watch Diary (Last 12 Months)</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>Less</span>
            <div style={{ display: 'flex', gap: '3px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(124,111,247,0.2)' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(124,111,247,0.45)' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(124,111,247,0.7)' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent)' }} />
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid wrapper */}
        <div style={{ overflowX: 'auto', paddingBottom: '5px' }}>
          <div style={{ display: 'flex', gap: '3px', width: 'max-content' }}>
            {/* Columns representing weeks */}
            {Array.from({ length: Math.ceil(heatmapData.length / 7) }).map((_, weekIdx) => {
              const weekDays = heatmapData.slice(weekIdx * 7, weekIdx * 7 + 7);
              return (
                <div key={weekIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {weekDays.map((day, dayIdx) => {
                    let bg = 'rgba(255,255,255,0.03)';
                    let border = '1px solid var(--border)';
                    if (day.count === 1) { bg = 'rgba(124,111,247,0.25)'; border = '1px solid rgba(124,111,247,0.3)'; }
                    else if (day.count === 2) { bg = 'rgba(124,111,247,0.5)'; border = '1px solid rgba(124,111,247,0.6)'; }
                    else if (day.count === 3) { bg = 'rgba(124,111,247,0.75)'; border = '1px solid rgba(124,111,247,0.85)'; }
                    else if (day.count > 3) { bg = 'var(--accent)'; border = '1px solid var(--accent)'; }

                    return (
                      <div
                        key={dayIdx}
                        style={{
                          width: '11px', height: '11px', borderRadius: '2px',
                          background: bg, border,
                          transition: 'transform 0.15s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'scale(1.3)';
                          e.currentTarget.style.zIndex = 10;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.zIndex = 1;
                        }}
                        title={`${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: ${day.count} titles logged`}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', fontSize: '11px', color: 'var(--text-dim)', paddingLeft: '5px' }}>
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
          <span style={{ marginLeft: 'auto' }}>Hover points to inspect log date density</span>
        </div>
      </div>

    </div>
  );
}
