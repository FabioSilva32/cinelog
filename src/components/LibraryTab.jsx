import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Heart, Star, Edit, Trash, Plus, Upload, Download, Dices, X, Check, AlertCircle, ChevronRight, ChevronLeft, LayoutGrid, List, SlidersHorizontal, Film, Tv, Clock, RotateCcw, Layers, Sparkles } from 'lucide-react';
import { triggerBackdropHover } from '../utils/backdrop';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const GENRE_MAP = {28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Sci-Fi',53:'Thriller',10752:'War',37:'Western',10759:'Action & Adventure',10765:'Sci-Fi & Fantasy'};

function getRatingStyle(r) {
  if (!r) return { color: 'var(--text-dim)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)', star: 'var(--text-dim)' };
  const n = Number(r);
  if (n >= 9.0) {
    return {
      color: '#10b981', // Emerald green for masterpieces (9.0+)
      bg: 'rgba(16, 185, 129, 0.14)',
      border: 'rgba(16, 185, 129, 0.38)',
      star: '#10b981',
      glow: 'rgba(16, 185, 129, 0.25)'
    };
  }
  if (n >= 8.0) {
    return {
      color: '#34d399', // Mint / Light green (8.0 - 8.9)
      bg: 'rgba(52, 211, 153, 0.13)',
      border: 'rgba(52, 211, 153, 0.35)',
      star: '#34d399',
      glow: 'rgba(52, 211, 153, 0.2)'
    };
  }
  if (n >= 7.0) {
    return {
      color: '#38bdf8', // Cyan / Sky blue (7.0 - 7.9)
      bg: 'rgba(56, 189, 248, 0.13)',
      border: 'rgba(56, 189, 248, 0.35)',
      star: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.2)'
    };
  }
  if (n >= 6.0) {
    return {
      color: '#fbbf24', // Warm gold / amber (6.0 - 6.9)
      bg: 'rgba(251, 191, 36, 0.13)',
      border: 'rgba(251, 191, 36, 0.35)',
      star: '#fbbf24',
      glow: 'rgba(251, 191, 36, 0.2)'
    };
  }
  if (n >= 4.5) {
    return {
      color: '#f97316', // Orange (4.5 - 5.9)
      bg: 'rgba(249, 115, 22, 0.13)',
      border: 'rgba(249, 115, 22, 0.35)',
      star: '#f97316',
      glow: 'rgba(249, 115, 22, 0.2)'
    };
  }
  return {
    color: '#ef4444', // Red (< 4.5)
    bg: 'rgba(239, 68, 68, 0.13)',
    border: 'rgba(239, 68, 68, 0.35)',
    star: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.2)'
  };
}

function getRatingColor(r) {
  return getRatingStyle(r).color;
}

// ── JSON Import Modal ────────────────────────────────────────────────
function ImportModal({ onClose, onImport }) {
  useBodyScrollLock(true);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isImporting) onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImporting, onClose]);

  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    if (isImporting) return;
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        let data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) data = data.movies || data.library || data.entries || data.list || [];
        if (!Array.isArray(data) || data.length === 0) { setError('No valid entries found.'); return; }
        const normalized = data.map((item, i) => {
          const rawStatus = String(item.status || '').toLowerCase().trim();
          let status = 'plan_to_watch';
          if (rawStatus === 'watched' || rawStatus === 'completed' || rawStatus === 'completed_watching') {
            status = 'watched';
          } else if (rawStatus === 'plan_to_watch' || rawStatus === 'want_to_watch' || rawStatus === 'planned' || rawStatus === 'watchlist') {
            status = 'plan_to_watch';
          } else if (rawStatus === 'watching' || rawStatus === 'currently_watching') {
            status = 'watching';
          } else if (rawStatus === 'dropped') {
            status = 'dropped';
          } else if (item.watched) {
            status = 'watched';
          }

          return {
            id: item.id || item.tmdb_id || `import-${Date.now()}-${i}`,
            tmdb_id: item.tmdb_id || item.id || null,
            media_type: item.media_type || item.type || 'movie',
            title: item.title || item.name || 'Unknown',
            poster_path: item.poster_path || null,
            release_year: item.release_year || item.year || (item.release_date || '').slice(0,4) || '—',
            genres: Array.isArray(item.genres) ? item.genres : (item.genre ? [item.genre] : []),
            status,
            rating: item.rating || item.score || null,
            review: item.review || item.notes || '',
            favorite: item.favorite || item.starred || false,
            date_added: item.date_added || new Date().toISOString(),
            tags: item.tags || [],
          };
        });
        setPreview(normalized);
      } catch { setError('Invalid JSON file.'); }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="modal-backdrop"
      style={{ position: 'fixed', inset: 0, background: 'rgba(8,7,11,0.9)', backdropFilter: 'blur(12px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', overscrollBehavior: 'contain' }}
      onClick={e => e.target === e.currentTarget && !isImporting && onClose()}
      onWheel={e => e.stopPropagation()}
    >
      <div
        className="glass animate-fade-in"
        style={{ width: '100%', maxWidth: '520px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '28px', position: 'relative', overscrollBehavior: 'contain' }}
        onWheel={e => e.stopPropagation()}
      >
        <button disabled={isImporting} onClick={onClose} style={{ position: 'absolute', right: '18px', top: '18px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: isImporting ? 'not-allowed' : 'pointer' }}><X size={20} /></button>
        <h3 style={{ fontSize: '20px', marginBottom: '6px' }}>Import from JSON</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>Supports CineLog, Letterboxd exports, or any JSON with title/status fields.</p>
        <div onClick={() => !isImporting && fileRef.current?.click()} style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: '28px', textAlign: 'center', cursor: isImporting ? 'not-allowed' : 'pointer', marginBottom: '14px', opacity: isImporting ? 0.6 : 1 }}
          onMouseEnter={e => { if (!isImporting) e.currentTarget.style.borderColor = 'var(--accent)'; }}
          onMouseLeave={e => { if (!isImporting) e.currentTarget.style.borderColor = 'var(--border)'; }}>
          <Upload size={26} color="var(--accent)" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontWeight: 700, fontSize: '13px' }}>{isImporting ? 'Database upload in progress...' : 'Click to choose a .json file'}</div>
          <input ref={fileRef} type="file" accept=".json" onChange={handleFile} style={{ display: 'none' }} disabled={isImporting} />
        </div>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)', borderRadius: '8px', padding: '10px', fontSize: '12px', marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}><AlertCircle size={15}/>{error}</div>}
        {preview && (
          <>
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: 'var(--green)', borderRadius: '8px', padding: '10px', fontSize: '12px', marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Check size={15} /> Found <strong>{preview.length}</strong> entries ready to import.
            </div>
            <div style={{ maxHeight: '160px', overflowY: 'auto', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {preview.slice(0, 15).map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', padding: '6px 10px' }}>
                  <span style={{ flex: 1, fontSize: '12px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{m.release_year}</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: m.status === 'watched' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)', color: m.status === 'watched' ? 'var(--green)' : 'var(--blue)' }}>
                    {m.status === 'watched' ? 'Watched' : 'List'}
                  </span>
                </div>
              ))}
              {preview.length > 15 && <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>…and {preview.length - 15} more</div>}
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              disabled={isImporting}
              onClick={async () => {
                setIsImporting(true);
                setError('');
                try {
                  const success = await onImport(preview);
                  if (success) {
                    onClose();
                  } else {
                    setError('Database import failed. Please check the console.');
                    setIsImporting(false);
                  }
                } catch (err) {
                  setError('Import failed: ' + (err.message || err));
                  setIsImporting(false);
                }
              }}
            >
              {isImporting ? '⏳ Importing Titles...' : <><Upload size={15}/> Import {preview.length} Titles</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Library Column (Deluxe 3-Column Studio) ─────────────────────────
function LibraryColumn({ label, icon, color, movies, onEditClick, onRemove, searchQuery, sortBy }) {
  const filtered = useMemo(() => {
    let r = [...movies];
    if (searchQuery) r = r.filter(m => (m.title || '').toLowerCase().includes(searchQuery.toLowerCase()));
    r.sort((a, b) => {
      if (sortBy === 'date_added-desc') return new Date(b.date_added || 0) - new Date(a.date_added || 0);
      if (sortBy === 'date_added-asc')  return new Date(a.date_added || 0) - new Date(b.date_added || 0);
      if (sortBy === 'title-asc')       return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'title-desc')      return (b.title || '').localeCompare(a.title || '');
      if (sortBy === 'rating-desc')     return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'year-desc')       return Number(b.release_year || 0) - Number(a.release_year || 0);
      return 0;
    });
    return r;
  }, [movies, searchQuery, sortBy]);

  const watched = filtered.filter(m => m.status === 'watched');
  const avgRating = watched.filter(m => m.rating).length > 0
    ? (watched.filter(m => m.rating).reduce((s, m) => s + Number(m.rating), 0) / watched.filter(m => m.rating).length).toFixed(1)
    : null;

  return (
    <div style={{
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(16, 13, 24, 0.75)',
      backdropFilter: 'blur(16px)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.09)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
      overflow: 'hidden',
      height: '100%'
    }}>
      {/* Pinned Column Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.25) 100%)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexShrink: 0
      }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <span style={{ fontWeight: 900, fontSize: '16px', color: '#FFFFFF', flex: 1, letterSpacing: '-0.3px' }}>{label}</span>
        <span style={{
          fontSize: '11.5px',
          fontWeight: 800,
          color: color,
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '2px 10px',
          borderRadius: '20px'
        }}>
          {filtered.length}
        </span>
        {avgRating && (
          <span style={{ fontSize: '13px', fontWeight: 900, color: 'var(--gold)', letterSpacing: '-0.2px' }}>
            ★ {avgRating}
          </span>
        )}
        <span style={{ display: 'inline-flex', width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 8px ${color}` }} />
      </div>

      {/* Favorites / Status Sub-bar */}
      <div style={{
        padding: '6px 18px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        background: 'rgba(0, 0, 0, 0.2)',
        display: 'flex',
        gap: '14px',
        fontSize: '11px',
        color: 'var(--text-dim)',
        flexShrink: 0
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: 'var(--green)', fontWeight: 800 }}>{watched.length}</span> watched
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Heart size={10} fill="var(--red)" color="var(--red)" />
          <span style={{ color: 'var(--red)', fontWeight: 800 }}>{filtered.filter(m => m.favorite).length}</span> favs
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          ⏳ <span style={{ fontWeight: 800 }}>{filtered.filter(m => m.status === 'plan_to_watch').length}</span>
        </span>
      </div>

      {/* Independent Scrollable Column Body */}
      <div
        className="library-col-scroll"
        style={{
          overflowY: 'auto',
          flex: 1,
          minHeight: 0,
          padding: '10px 12px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎬</div>
            {searchQuery ? 'No matching titles found' : 'Empty category – add titles from Explore'}
          </div>
        ) : filtered.map(movie => {
          const isWatched = movie.status === 'watched';
          const genres = (movie.genres || []).slice(0, 2).join(' · ');
          const isWatching = movie.status === 'watching';
          const posterUrl = movie.poster_path
            ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w200${movie.poster_path}`)
            : null;

          return (
            <div
              key={movie.id || movie.tmdb_id}
              onClick={() => onEditClick(movie)}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '10px',
                borderRadius: '12px',
                background: isWatching ? 'rgba(229, 9, 20, 0.07)' : 'rgba(255, 255, 255, 0.025)',
                border: isWatching ? '1px solid rgba(229, 9, 20, 0.4)' : '1px solid rgba(255, 255, 255, 0.07)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = isWatching ? 'var(--accent)' : 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.background = isWatching ? 'rgba(229, 9, 20, 0.12)' : 'rgba(255, 255, 255, 0.05)';
                triggerBackdropHover(movie.backdrop_path || movie.details?.backdrop_path);
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.borderColor = isWatching ? 'rgba(229, 9, 20, 0.4)' : 'rgba(255, 255, 255, 0.07)';
                e.currentTarget.style.background = isWatching ? 'rgba(229, 9, 20, 0.07)' : 'rgba(255, 255, 255, 0.025)';
                triggerBackdropHover(null);
              }}
            >
              {/* Big High-Res Poster (74px x 110px) */}
              <div style={{
                width: '74px',
                height: '110px',
                borderRadius: '8px',
                overflow: 'hidden',
                flexShrink: 0,
                background: '#12101a',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                position: 'relative'
              }}>
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={movie.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '24px' }}>
                    🎬
                  </div>
                )}
              </div>

              {/* Title, Badges & Meta */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{
                  fontSize: '15.5px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  lineHeight: 1.25,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.3px'
                }}>
                  {movie.title}
                </div>

                {/* Subtitle: Year, runtime, director or episode progress */}
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.65)',
                  fontWeight: 600,
                  marginTop: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {movie.release_year || '—'}{genres ? ` · ${genres}` : ''}
                </div>

                {/* Status Badges Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {isWatching && (
                    <span style={{
                      fontSize: '9.5px',
                      background: 'rgba(229, 9, 20, 0.2)',
                      color: 'var(--accent)',
                      border: '1px solid rgba(229, 9, 20, 0.45)',
                      borderRadius: '5px',
                      padding: '2px 7px',
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase'
                    }}>
                      ▶ Watching
                    </span>
                  )}
                  {isWatched && !isWatching && (
                    <span style={{
                      fontSize: '9.5px',
                      background: 'rgba(34, 197, 94, 0.15)',
                      color: '#4ade80',
                      border: '1px solid rgba(34, 197, 94, 0.35)',
                      borderRadius: '5px',
                      padding: '2px 7px',
                      fontWeight: 800
                    }}>
                      ✓ Watched
                    </span>
                  )}
                  {movie.status === 'plan_to_watch' && (
                    <span style={{
                      fontSize: '9.5px',
                      background: 'rgba(96, 165, 250, 0.15)',
                      color: '#60a5fa',
                      border: '1px solid rgba(96, 165, 250, 0.35)',
                      borderRadius: '5px',
                      padding: '2px 7px',
                      fontWeight: 800
                    }}>
                      ⏳ Watchlist
                    </span>
                  )}
                  {movie.favorite && (
                    <span style={{
                      fontSize: '9.5px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      borderRadius: '5px',
                      padding: '2px 6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontWeight: 800
                    }}>
                      <Heart size={9} fill="currentColor" /> Favorite
                    </span>
                  )}
                  {movie.theater_seat && (
                    <span
                      title={`Theater Ticket: Row & Seat ${movie.theater_seat}`}
                      style={{
                        fontSize: '9.5px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        color: '#fbbf24',
                        borderRadius: '5px',
                        padding: '2px 6px',
                        fontWeight: 800
                      }}
                    >
                      🎟️ Ticket
                    </span>
                  )}
                </div>

                {/* Personal Review Snippet if available */}
                {movie.review && movie.review.trim().length > 0 && (
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.72)',
                    fontStyle: 'italic',
                    marginTop: '6px',
                    lineHeight: 1.35,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    borderLeft: '2px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    "{movie.review}"
                  </div>
                )}
              </div>

              {/* Right Side: Sleek, Compact Rating Pill (Color Coded by Score, No /10) */}
              {movie.rating > 0 && (() => {
                const style = getRatingStyle(movie.rating);
                return (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    alignSelf: 'center',
                    flexShrink: 0,
                    padding: '4px 8px',
                    borderRadius: '8px',
                    background: style.bg,
                    border: `1px solid ${style.border}`,
                    boxShadow: `0 2px 8px ${style.glow || 'rgba(0,0,0,0.3)'}`,
                    color: style.color,
                    marginRight: '6px',
                    lineHeight: 1
                  }}>
                    <Star size={12} fill="currentColor" color="currentColor" />
                    <span style={{
                      fontSize: '15px',
                      fontWeight: 900,
                      letterSpacing: '-0.3px',
                      fontFeatureSettings: '"tnum"'
                    }}>
                      {Number(movie.rating).toFixed(1)}
                    </span>
                  </div>
                );
              })()}

              {/* Remove (✕) Button in Top-Right Corner of the Box */}
              <button
                onClick={e => { e.stopPropagation(); onRemove(movie.id); }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '4px',
                  opacity: 0.35,
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  zIndex: 2
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = '#ef4444'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = 0.35; e.currentTarget.style.color = 'var(--text-dim)'; }}
                title="Remove title"
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Media Type Resolver ───────────────────────────────────────────────
export function getMediaType(m) {
  if (!m) return 'movie';
  const isAnime = m.media_type === 'anime' ||
    m.type === 'anime' ||
    (m.tags || []).some(t => typeof t === 'string' && t.toLowerCase() === 'anime') ||
    (m.genres || []).some(g => typeof g === 'string' && (g.toLowerCase() === 'anime' || (g.toLowerCase() === 'animation' && (m.original_language === 'ja' || (Array.isArray(m.origin_country) && m.origin_country.includes('JP'))))));
  if (isAnime) return 'anime';

  const isTv = m.media_type === 'tv' ||
    m.type === 'tv' ||
    m.number_of_seasons !== undefined ||
    m.first_air_date !== undefined ||
    Boolean(m.details && (m.details.number_of_seasons !== undefined || m.details.first_air_date));
  if (isTv) return 'tv';

  return 'movie';
}

// ── Reusable Cinema Card with High-Contrast Category Badges ───────────
function MediaPosterCard({ movie, onEditClick, layout = 'shelf' }) {
  const isWatching = movie.status === 'watching';
  const mediaType = getMediaType(movie);
  const isTv = mediaType === 'tv';
  const isAnime = mediaType === 'anime';

  let typeBadge = null;
  if (isAnime) {
    typeBadge = (
      <span style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(217, 119, 6, 0.95))',
        color: '#FFFFFF',
        boxShadow: '0 2px 6px rgba(245, 158, 11, 0.4)',
        borderRadius: '4px',
        padding: '1.5px 5px',
        fontSize: '8px',
        fontWeight: 900,
        letterSpacing: '0.02em',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px'
      }}>
        ⛩️ ANIME
      </span>
    );
  } else if (isTv) {
    const seasonsCount = movie.number_of_seasons || movie.details?.number_of_seasons;
    const seasonLabel = seasonsCount ? `TV · S${seasonsCount}` : 'TV SERIES';
    typeBadge = (
      <span style={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(30, 64, 175, 0.95))',
        color: '#FFFFFF',
        boxShadow: '0 2px 6px rgba(37, 99, 235, 0.4)',
        borderRadius: '4px',
        padding: '1.5px 5px',
        fontSize: '8px',
        fontWeight: 900,
        letterSpacing: '0.02em',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px'
      }}>
        📺 {seasonLabel}
      </span>
    );
  } else {
    typeBadge = (
      <span style={{
        background: 'linear-gradient(135deg, rgba(229, 9, 20, 0.9), rgba(153, 27, 27, 0.9))',
        color: '#FFFFFF',
        borderRadius: '4px',
        padding: '1.5px 5px',
        fontSize: '8px',
        fontWeight: 900,
        letterSpacing: '0.02em',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px'
      }}>
        🎬 FILM
      </span>
    );
  }

  return (
    <div
      onClick={() => onEditClick(movie)}
      className="library-card-interactive"
      style={{
        cursor: 'pointer',
        borderRadius: '10px',
        overflow: 'hidden',
        border: isWatching ? '1.5px solid var(--accent)' : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isWatching ? '0 0 14px rgba(229, 9, 20, 0.4)' : '0 4px 14px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        aspectRatio: '2/3',
        background: '#121216',
        flexShrink: layout === 'shelf' ? 0 : 1,
        width: layout === 'shelf' ? '124px' : 'auto'
      }}
      onMouseEnter={() => triggerBackdropHover(movie.backdrop_path || movie.details?.backdrop_path)}
      onMouseLeave={() => triggerBackdropHover(null)}
    >
      {movie.poster_path ? (
        <img
          src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
          alt={movie.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
      ) : (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '24px', background: 'linear-gradient(145deg, #181822, #101016)', padding: '12px', textAlign: 'center' }}>
          <span>{isAnime ? '⛩️' : isTv ? '📺' : '🎬'}</span>
          <span style={{ fontSize: '10px', color: '#999', marginTop: '6px', fontWeight: 600 }}>{movie.title}</span>
        </div>
      )}

      {/* Title & metadata gradient overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(8, 7, 12, 0.98) 0%, rgba(8, 7, 12, 0.6) 32%, transparent 65%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '7px 8px'
      }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {movie.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '3px' }}>
          <span style={{ fontSize: '9.5px', color: '#A1A1AA', fontWeight: 600 }}>
            {movie.release_year || '—'}
          </span>
          {movie.status === 'watched' && (
            <span style={{ fontSize: '8.5px', color: 'var(--green)', fontWeight: 800 }}>✓ Watched</span>
          )}
          {movie.status === 'plan_to_watch' && (
            <span style={{ fontSize: '8.5px', color: '#60A5FA', fontWeight: 700 }}>⏳ List</span>
          )}
        </div>
      </div>

      {/* Top Left: Type Pill Badge */}
      <div style={{ position: 'absolute', top: '5px', left: '5px', zIndex: 2 }}>
        {typeBadge}
      </div>

      {/* Top Right: Rating Pill or Favorite */}
      <div style={{ position: 'absolute', top: '5px', right: '5px', display: 'flex', alignItems: 'center', gap: '3px', zIndex: 2 }}>
        {movie.favorite && (
          <div style={{ fontSize: '11px', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))' }}>❤️</div>
        )}
        {Number(movie.rating) > 0 && (
          <div style={{
            background: 'rgba(8, 7, 12, 0.88)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '4px',
            padding: '1.5px 5px',
            fontSize: '9px',
            fontWeight: 900,
            color: getRatingColor(movie.rating),
            letterSpacing: '-0.2px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
          }}>
            ★ {Number(movie.rating).toFixed(1)}
          </div>
        )}
      </div>

      {/* Watching status ribbon */}
      {isWatching && (
        <div style={{
          position: 'absolute',
          top: '25px',
          left: '5px',
          background: 'var(--accent)',
          borderRadius: '3px',
          padding: '1px 5px',
          fontSize: '7.5px',
          fontWeight: 900,
          color: '#fff',
          letterSpacing: '0.04em',
          boxShadow: '0 2px 6px rgba(229, 9, 20, 0.5)',
          zIndex: 2
        }}>
          ▶ WATCHING
        </div>
      )}
    </div>
  );
}

// ── Categorized Shelf Section ─────────────────────────────────────────
function LibraryShelfRow({
  title,
  icon,
  badgeColor,
  accentGlow,
  items,
  onSeeAll,
  onEditClick,
  emptyPrompt
}) {
  const scrollRef = useRef(null);

  const scrollBy = (amount) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <section className="library-shelf-section" style={{
      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.025) 0%, rgba(255, 255, 255, 0.005) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: '16px',
      padding: '14px 16px 16px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative ambient corner glow */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        left: '-40px',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: accentGlow,
        opacity: 0.12,
        filter: 'blur(35px)',
        pointerEvents: 'none'
      }} />

      {/* Shelf Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{icon}</span>
          <div>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {title}
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                color: badgeColor,
                background: 'rgba(255, 255, 255, 0.06)',
                border: `1px solid ${badgeColor}33`,
                borderRadius: '12px',
                padding: '1px 7px',
                letterSpacing: '0'
              }}>
                {items.length} {items.length === 1 ? 'title' : 'titles'}
              </span>
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {items.length > 3 && (
            <div className="shelf-desktop-scroll-btns" style={{ display: 'none', gap: '4px' }}>
              <button
                onClick={() => scrollBy(-260)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#fff',
                  width: '26px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => scrollBy(260)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#fff',
                  width: '26px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {items.length > 0 && (
            <button
              onClick={onSeeAll}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '20px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#E4E4E7',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = badgeColor; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#E4E4E7'; }}
            >
              See all ({items.length}) <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Shelf Items Track */}
      {items.length === 0 ? (
        <div style={{
          padding: '24px 16px',
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: '10px',
          border: '1px dashed rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ fontSize: '12px', color: '#71717A' }}>{emptyPrompt}</div>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="library-shelf-scroll"
          style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '6px',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none'
          }}
        >
          {items.slice(0, 15).map(item => (
            <div key={item.id || item.tmdb_id} style={{ scrollSnapAlign: 'start' }}>
              <MediaPosterCard movie={item} onEditClick={onEditClick} layout="shelf" />
            </div>
          ))}

          {items.length > 15 && (
            <div
              onClick={onSeeAll}
              style={{
                width: '100px',
                borderRadius: '10px',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
                background: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                textAlign: 'center',
                padding: '12px',
                scrollSnapAlign: 'start'
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>➕</div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>+{items.length - 15} more</div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>View all →</div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ── Dedicated Category Vault (Filtered Single Medium Grid) ────────────
function DedicatedCategoryVault({
  type,
  items,
  onBackToShelves,
  onEditClick
}) {
  const meta = {
    movie: { label: 'Feature Films', icon: '🎬', color: 'var(--accent)', glow: '#ef4444' },
    tv: { label: 'Television Series', icon: '📺', color: '#3b82f6', glow: '#3b82f6' },
    anime: { label: 'Anime & Animation', icon: '⛩️', color: '#f59e0b', glow: '#f59e0b' }
  }[type] || { label: 'Library', icon: '🎬', color: 'var(--accent)', glow: '#ef4444' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Category Banner with Back Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.4) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        padding: '12px 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onBackToShelves}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '6px 10px',
              color: '#FFFFFF',
              fontSize: '11.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ChevronLeft size={15} /> All Shelves
          </button>

          <div>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 900,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>{meta.icon}</span> {meta.label}
            </h3>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Showing {items.length} {items.length === 1 ? 'title' : 'titles'} in this vault
            </div>
          </div>
        </div>

        <div style={{
          fontSize: '11px',
          fontWeight: 800,
          color: meta.color,
          background: 'rgba(255, 255, 255, 0.04)',
          border: `1px solid ${meta.color}40`,
          borderRadius: '14px',
          padding: '3px 10px'
        }}>
          {meta.label.toUpperCase()}
        </div>
      </div>

      {/* 3-Column Grid for this medium */}
      {items.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>{meta.icon}</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>No {meta.label} found</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>Try clearing search or filters</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {items.map(movie => (
            <MediaPosterCard key={movie.id || movie.tmdb_id} movie={movie} onEditClick={onEditClick} layout="grid" />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main LibraryTab ───────────────────────────────────────────────────
export default function LibraryTab({ library, onRemove, onEditClick, onOpenExplore, onImportMovies }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_added-desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGenre, setFilterGenre] = useState('all');
  const [filterType, setFilterType] = useState('all'); // 'all', 'movie', 'tv', 'anime'
  const [wallMode, setWallMode] = useState('shelves'); // 'shelves' | 'grid'
  const [mobileView, setMobileView] = useState('grid'); // 'grid' | 'list'
  const [diaryFilter, setDiaryFilter] = useState('all'); // 'all' | 'this_month' | 'this_year' | 'with_review' | 'top_rated' | 'favorites' | 'rewatches'
  const [showMobileFilterSheet, setShowMobileFilterSheet] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [compactView, setCompactView] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });

  // Extract available genres from library
  const availableGenres = useMemo(() => {
    const set = new Set();
    library.forEach(m => (m.genres || []).forEach(g => set.add(g)));
    return Array.from(set).sort();
  }, [library]);

  // Base filtered list before splitting into types
  const allFilteredWithoutType = useMemo(() => {
    let list = library;

    if (filterStatus === 'watched_this_month') {
      const now = new Date();
      const curYear = now.getFullYear();
      const curMonth = now.getMonth();
      list = list.filter(m => {
        if (m.status !== 'watched') return false;
        const dStr = m.watch_date || m.date_added;
        if (!dStr) return false;
        const d = new Date(dStr);
        return !isNaN(d.getTime()) && d.getFullYear() === curYear && d.getMonth() === curMonth;
      });
    } else if (filterStatus === 'favorites') {
      list = list.filter(m => m.favorite);
    } else if (filterStatus !== 'all') {
      list = list.filter(m => m.status === filterStatus);
    }

    if (filterGenre !== 'all') list = list.filter(m => (m.genres || []).includes(filterGenre));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m => m.title?.toLowerCase().includes(q));
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'title-desc') return (b.title || '').localeCompare(a.title || '');
      if (sortBy === 'year-desc') return Number(b.release_year || 0) - Number(a.release_year || 0);
      if (sortBy === 'date_added-asc') return new Date(a.date_added || 0) - new Date(b.date_added || 0);
      return new Date(b.date_added || 0) - new Date(a.date_added || 0);
    });
  }, [library, filterStatus, filterGenre, searchQuery, sortBy]);

  // Dedicated media partitions
  const movies = useMemo(() => allFilteredWithoutType.filter(m => getMediaType(m) === 'movie'), [allFilteredWithoutType]);
  const series = useMemo(() => allFilteredWithoutType.filter(m => getMediaType(m) === 'tv'), [allFilteredWithoutType]);
  const anime = useMemo(() => allFilteredWithoutType.filter(m => getMediaType(m) === 'anime'), [allFilteredWithoutType]);

  const filtered = useMemo(() => {
    if (filterType === 'all') return allFilteredWithoutType;
    return allFilteredWithoutType.filter(m => getMediaType(m) === filterType);
  }, [allFilteredWithoutType, filterType]);


  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const isThisMonth = (m) => {
      if (m.status !== 'watched') return false;
      const dStr = m.watch_date || m.date_added;
      if (!dStr) return false;
      const d = new Date(dStr);
      return !isNaN(d.getTime()) && d.getFullYear() === curYear && d.getMonth() === curMonth;
    };

    const watched = library.filter(m => m.status === 'watched');
    const thisMonth = library.filter(isThisMonth);
    const rated = watched.filter(m => m.rating);
    const avg = rated.length > 0 ? (rated.reduce((s, m) => s + Number(m.rating), 0) / rated.length).toFixed(1) : '—';
    return {
      total: library.length,
      watched: watched.length,
      thisMonth: thisMonth.length,
      watchlist: library.filter(m => m.status === 'plan_to_watch').length,
      avg,
      favs: library.filter(m => m.favorite).length
    };
  }, [library]);

  // ── Literal Watched Diary Computations ─────────────────────────────
  const watchedEntries = useMemo(() => {
    return library.filter(m => m.status === 'watched');
  }, [library]);

  const reviewedCount = useMemo(() => {
    return watchedEntries.filter(m => Boolean((m.review || '').replace(/__EPISODE_DATA__:.+$/s, '').replace(/__EPISODE_RATINGS__:.+$/s, '').trim())).length;
  }, [watchedEntries]);

  const watchedThisYearCount = useMemo(() => {
    const curYear = new Date().getFullYear();
    return watchedEntries.filter(m => {
      const dStr = m.watch_date || m.date_added;
      if (!dStr) return false;
      const d = new Date(dStr);
      return !isNaN(d.getTime()) && d.getFullYear() === curYear;
    }).length;
  }, [watchedEntries]);

  const topRatedCount = useMemo(() => {
    return watchedEntries.filter(m => Number(m.rating) >= 8).length;
  }, [watchedEntries]);

  const favoriteWatchedCount = useMemo(() => {
    return watchedEntries.filter(m => m.favorite).length;
  }, [watchedEntries]);

  const rewatchCount = useMemo(() => {
    return watchedEntries.filter(m => m.is_rewatch).length;
  }, [watchedEntries]);

  const diaryFiltered = useMemo(() => {
    let list = watchedEntries;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m => m.title?.toLowerCase().includes(q));
    }
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    if (diaryFilter === 'this_month') {
      list = list.filter(m => {
        const dStr = m.watch_date || m.date_added;
        if (!dStr) return false;
        const d = new Date(dStr);
        return !isNaN(d.getTime()) && d.getFullYear() === curYear && d.getMonth() === curMonth;
      });
    } else if (diaryFilter === 'this_year') {
      list = list.filter(m => {
        const dStr = m.watch_date || m.date_added;
        if (!dStr) return false;
        const d = new Date(dStr);
        return !isNaN(d.getTime()) && d.getFullYear() === curYear;
      });
    } else if (diaryFilter === 'with_review') {
      list = list.filter(m => Boolean((m.review || '').replace(/__EPISODE_DATA__:.+$/s, '').replace(/__EPISODE_RATINGS__:.+$/s, '').trim()));
    } else if (diaryFilter === 'top_rated') {
      list = list.filter(m => Number(m.rating) >= 8);
    } else if (diaryFilter === 'favorites') {
      list = list.filter(m => m.favorite);
    } else if (diaryFilter === 'rewatches') {
      list = list.filter(m => m.is_rewatch);
    }

    return [...list].sort((a, b) => {
      const dateA = new Date(a.watch_date || a.date_added || 0).getTime();
      const dateB = new Date(b.watch_date || b.date_added || 0).getTime();
      return dateB - dateA;
    });
  }, [watchedEntries, searchQuery, diaryFilter]);

  const diaryGroups = useMemo(() => {
    const groups = {};
    diaryFiltered.forEach(movie => {
      const dStr = movie.watch_date || movie.date_added;
      let groupKey = 'Recent Logs';
      if (dStr) {
        const d = new Date(dStr);
        if (!isNaN(d.getTime())) {
          groupKey = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        }
      }
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(movie);
    });
    return groups;
  }, [diaryFiltered]);

  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(library, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `cinelog_export_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = ['Title', 'Year', 'Rating10', 'WatchedDate', 'Rewatch', 'Type', 'Status', 'Genres', 'Tags', 'Favorite', 'Review', 'Date Added'];
      const rows = library.map(m => {
        const cleanReview = (m.review || '')
          .replace(/__EPISODE_DATA__:.+$/s, '')
          .replace(/__EPISODE_RATINGS__:.+$/s, '')
          .replace(/"/g, '""')
          .trim();
        const watchedDateStr = m.watch_date || (m.status === 'watched' && m.date_added ? new Date(m.date_added).toISOString().slice(0, 10) : '');
        return [
          `"${(m.title || '').replace(/"/g, '""')}"`,
          m.release_year || '',
          m.rating != null ? m.rating : '',
          watchedDateStr,
          m.is_rewatch ? 'Yes' : 'No',
          m.media_type || 'movie',
          m.status || '',
          `"${(m.genres || []).join(', ')}"`,
          `"${(m.tags || []).join(', ')}"`,
          m.favorite ? 'Yes' : 'No',
          `"${cleanReview}"`,
          m.date_added ? new Date(m.date_added).toLocaleDateString() : '',
        ];
      });
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cinelog_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const [randomError, setRandomError] = useState('');

  const handleRandomSelect = () => {
    const listToPickFrom = filtered.length > 0 ? filtered : library;
    if (listToPickFrom.length === 0) {
      setRandomError('No titles available! Add movies to your library first.');
      setTimeout(() => setRandomError(''), 3000);
      return;
    }
    setRandomError('');
    const randomIndex = Math.floor(Math.random() * listToPickFrom.length);
    const chosen = listToPickFrom[randomIndex];
    onEditClick(chosen);
  };

  return (
    <div className="animate-fade-in library-tab-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── MOBILE SPECIFIC TOP BAR & CHIP RAIL ──────────────────────── */}
      <div className="mobile-only-library-controls" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.4px' }}>
              Library
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
                {filtered.length} {filtered.length === 1 ? 'title' : 'titles'}
              </span>
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Quick Search Toggle */}
            <button
              onClick={() => setShowMobileSearch(p => !p)}
              style={{
                background: showMobileSearch ? 'var(--accent)' : '#141414',
                color: showMobileSearch ? '#FFFFFF' : '#A1A1AA',
                border: '1px solid #242424',
                borderRadius: '8px',
                width: '36px', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Search Library"
            >
              <Search size={16} />
            </button>

            {/* Segmented View Switcher: Cinema Wall vs Diary */}
            <div style={{ display: 'flex', background: '#121214', padding: '2px', borderRadius: '8px', border: '1px solid #242426' }}>
              <button
                onClick={() => setMobileView('grid')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: mobileView === 'grid' ? 'var(--accent)' : 'transparent',
                  color: mobileView === 'grid' ? '#FFFFFF' : '#8E8E93',
                  border: 'none', borderRadius: '6px', padding: '5px 8px',
                  fontSize: '11px', fontWeight: 800, cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Cinema Wall"
              >
                <LayoutGrid size={13} /> Wall
              </button>
              <button
                onClick={() => setMobileView('list')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: mobileView === 'list' ? 'var(--accent)' : 'transparent',
                  color: mobileView === 'list' ? '#FFFFFF' : '#8E8E93',
                  border: 'none', borderRadius: '6px', padding: '5px 8px',
                  fontSize: '11px', fontWeight: 800, cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Diary Journal Stream"
              >
                <List size={13} /> Diary
              </button>
            </div>

            {/* Quick Shelves vs Flat Grid Toggle (Wall Mode) */}
            {mobileView === 'grid' && filterType === 'all' && (
              <div style={{ display: 'flex', background: '#121214', padding: '2px', borderRadius: '8px', border: '1px solid #242426' }}>
                <button
                  onClick={() => setWallMode('shelves')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    background: wallMode === 'shelves' ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color: wallMode === 'shelves' ? '#FFFFFF' : '#8E8E93',
                    border: 'none', borderRadius: '6px', padding: '5px 7px',
                    fontSize: '11px', fontWeight: 800, cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Categorized Shelves"
                >
                  <Layers size={13} />
                </button>
                <button
                  onClick={() => setWallMode('grid')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    background: wallMode === 'grid' ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color: wallMode === 'grid' ? '#FFFFFF' : '#8E8E93',
                    border: 'none', borderRadius: '6px', padding: '5px 7px',
                    fontSize: '11px', fontWeight: 800, cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Flat Wall Grid"
                >
                  <LayoutGrid size={13} />
                </button>
              </div>
            )}

            {/* Filter Bottom Sheet Trigger */}
            <button
              onClick={() => setShowMobileFilterSheet(true)}
              style={{
                background: (filterGenre !== 'all' || sortBy !== 'date_added-desc') ? 'rgba(229,9,20,0.15)' : '#141414',
                color: (filterGenre !== 'all' || sortBy !== 'date_added-desc') ? 'var(--accent)' : '#A1A1AA',
                border: `1px solid ${(filterGenre !== 'all' || sortBy !== 'date_added-desc') ? 'var(--accent)' : '#242424'}`,
                borderRadius: '8px',
                width: '36px', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
              title="Filters & Sorting"
            >
              <SlidersHorizontal size={16} />
              {(filterGenre !== 'all' || sortBy !== 'date_added-desc') && (
                <span style={{ position: 'absolute', top: '6px', right: '6px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
              )}
            </button>

            {/* Surprise Me Dice */}
            <button
              onClick={handleRandomSelect}
              style={{
                background: '#141414',
                color: 'var(--gold)',
                border: '1px solid #242424',
                borderRadius: '8px',
                width: '36px', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Surprise Me (Random title)"
            >
              <Dices size={16} />
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Search */}
        {showMobileSearch && (
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Filter by title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input"
              autoFocus
              style={{ width: '100%', paddingLeft: '34px', paddingRight: '32px', height: '36px', fontSize: '13px', borderRadius: '8px', background: '#121212', border: '1px solid #242424' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* Swipeable Status & Type Pills */}
        <div className="mobile-library-chips" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {mobileView === 'list' ? (
            [
              { id: 'all', label: `📖 All Logs (${watchedEntries.length})` },
              { id: 'this_month', label: `📅 This Month (${stats.thisMonth})` },
              { id: 'this_year', label: `📅 ${new Date().getFullYear()} (${watchedThisYearCount})` },
              { id: 'with_review', label: `✍️ With Notes (${reviewedCount})` },
              { id: 'top_rated', label: `★ Top Rated (${topRatedCount})` },
              { id: 'favorites', label: `❤️ Favorites (${favoriteWatchedCount})` },
              { id: 'rewatches', label: `🔄 Rewatches (${rewatchCount})` }
            ].map(chip => {
              const isActive = diaryFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setDiaryFilter(chip.id)}
                  style={{
                    background: isActive ? 'var(--accent)' : '#141414',
                    color: isActive ? '#FFFFFF' : '#A1A1AA',
                    border: `1px solid ${isActive ? 'var(--accent)' : '#242424'}`,
                    borderRadius: '20px',
                    padding: '6px 13px',
                    fontSize: '11.5px',
                    fontWeight: isActive ? 800 : 600,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  {chip.label}
                </button>
              );
            })
          ) : (
            [
              { id: 'all', label: `All (${library.length})` },
              { id: 'watched', label: `✓ Watched (${stats.watched})` },
              { id: 'plan_to_watch', label: `⏳ Watchlist (${stats.watchlist})` },
              { id: 'favorites', label: `❤️ Favs (${stats.favs})` },
              { id: 'movie', label: `🎬 Movies (${movies.length})`, isType: true },
              { id: 'tv', label: `📺 Series (${series.length})`, isType: true },
              { id: 'anime', label: `⛩️ Anime (${anime.length})`, isType: true },
              { id: 'watched_this_month', label: `📅 This Month (${stats.thisMonth})` },
              { id: 'watching', label: '▶ Watching' }
            ].map(chip => {
              const isActive = chip.isType ? filterType === chip.id : (filterType === 'all' && filterStatus === chip.id);
              return (
                <button
                  key={chip.id}
                  onClick={() => {
                    if (chip.isType) {
                      setFilterType(prev => prev === chip.id ? 'all' : chip.id);
                    } else {
                      setFilterType('all');
                      setFilterStatus(chip.id);
                    }
                  }}
                  style={{
                    background: isActive ? 'var(--accent)' : '#141414',
                    color: isActive ? '#FFFFFF' : '#A1A1AA',
                    border: `1px solid ${isActive ? 'var(--accent)' : '#242424'}`,
                    borderRadius: '20px',
                    padding: '6px 13px',
                    fontSize: '11.5px',
                    fontWeight: isActive ? 800 : 600,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  {chip.label}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── DESKTOP STATS ROW ────────────────────────────────────────── */}
      <div className="desktop-only-library-stats library-stats-row" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total', val: stats.total, color: 'var(--accent)' },
          { label: 'Watched', val: stats.watched, color: 'var(--green)' },
          { label: 'This Month', val: stats.thisMonth, color: '#f59e0b' },
          { label: 'Watchlist', val: stats.watchlist, color: 'var(--blue)' },
          { label: 'Avg Rating', val: stats.avg + (stats.avg !== '—' ? '' : ''), color: 'var(--gold)' },
          { label: 'Favorites', val: stats.favs, color: 'var(--red)' },
        ].map(s => (
          <div key={s.label} className="glass library-stat-card" style={{ padding: '12px 18px', borderRadius: 'var(--radius)', flex: 1, minWidth: '100px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>{s.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: s.color, marginTop: '2px' }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* ── DESKTOP FILTER BAR ───────────────────────────────────────── */}
      <div className="desktop-only-library-filter library-filter-bar" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', position: 'relative' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text" placeholder="Search library…"
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ width: '100%', paddingLeft: '36px', height: '38px', fontSize: '13px' }}
          />
        </div>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="form-input"
          style={{ height: '38px', padding: '0 12px', background: 'var(--surface-solid)', color: 'var(--text)', fontSize: '12px' }}>
          <option value="date_added-desc">Newest Added</option>
          <option value="date_added-asc">Oldest Added</option>
          <option value="title-asc">Title A–Z</option>
          <option value="title-desc">Title Z–A</option>
          <option value="rating-desc">Highest Rated</option>
          <option value="year-desc">Newest Year</option>
        </select>

        <select value={filterGenre} onChange={e => setFilterGenre(e.target.value)} className="form-input"
          style={{ height: '38px', padding: '0 12px', background: 'var(--surface-solid)', color: 'var(--text)', fontSize: '12px' }}>
          <option value="all">All Genres</option>
          {availableGenres.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '2px' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'watched', label: '✓ Watched' },
            { id: 'watched_this_month', label: '📅 This Month' },
            { id: 'watching', label: '▶ Watching' },
            { id: 'plan_to_watch', label: '⏳ Watchlist' }
          ].map(s => (
            <button key={s.id} onClick={() => setFilterStatus(s.id)}
              style={{ background: filterStatus === s.id ? 'var(--accent)' : 'transparent', color: filterStatus === s.id ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '8px', padding: '5px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              {s.label}
            </button>
          ))}
        </div>

        <button className="btn btn-secondary" onClick={handleRandomSelect}
          style={{ height: '38px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '0 14px', border: '1px solid rgba(136,8,8,0.3)', background: 'rgba(136,8,8,0.06)' }}
          title="Pick a random movie from your library/watchlist">
          <Dices size={13} color="var(--accent)" /> Surprise Me
        </button>

        <button className="btn btn-secondary" onClick={handleExportJSON}
          style={{ height: '38px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '0 14px' }}>
          <Download size={13} /> JSON
        </button>

        <button className="btn btn-secondary" onClick={handleExportCSV}
          style={{ height: '38px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '0 14px' }}>
          <Download size={13} /> CSV
        </button>

        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2px' }}>
          <button onClick={() => setCompactView(false)} title="Normal View"
            style={{ background: !compactView ? 'rgba(136,8,8,0.2)' : 'none', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: !compactView ? 'var(--accent)' : 'var(--text-dim)', display: 'flex', alignItems: 'center' }}>
            <List size={14} />
          </button>
          <button onClick={() => setCompactView(true)} title="Compact Grid View"
            style={{ background: compactView ? 'rgba(136,8,8,0.2)' : 'none', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: compactView ? 'var(--accent)' : 'var(--text-dim)', display: 'flex', alignItems: 'center' }}>
            <LayoutGrid size={14} />
          </button>
        </div>

        <button className="btn btn-secondary" onClick={() => setShowImport(true)}
          style={{ height: '38px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '0 14px' }}>
          <Upload size={13} /> Import JSON
        </button>
      </div>

      {/* ── MOBILE VIEW: DIARY STREAM (LITERAL WATCHED JOURNAL) ──────── */}
      {mobileView === 'list' && (
        <div className="mobile-only-library-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Milestone Quick Stats Bar */}
          <div style={{
            background: 'linear-gradient(135deg, #181520 0%, #0d0c11 100%)',
            border: '1px solid #282534',
            borderRadius: '14px',
            padding: '14px 16px',
            marginBottom: '4px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📖</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>Personal Film Diary</div>
                  <div style={{ fontSize: '10.5px', color: '#888' }}>Chronological journal of every watched title</div>
                </div>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '12px', background: 'rgba(229,9,20,0.15)', color: 'var(--accent)', border: '1px solid rgba(229,9,20,0.3)' }}>
                {stats.watched} Logged
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '7px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', fontWeight: 800, color: '#888', textTransform: 'uppercase' }}>Runtime</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff', marginTop: '2px' }}>~{Math.round(stats.watched * 1.9)}h</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '7px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', fontWeight: 800, color: '#888', textTransform: 'uppercase' }}>Avg Rating</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--gold)', marginTop: '2px' }}>★ {stats.avg}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '7px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', fontWeight: 800, color: '#888', textTransform: 'uppercase' }}>Reviews</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>{reviewedCount}</div>
              </div>
            </div>
          </div>

          {diaryFiltered.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-dim)', background: '#0e0d13', borderRadius: '14px', border: '1px dashed #24242c' }}>
              <div style={{ fontSize: '42px', marginBottom: '10px' }}>📖</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>No Watched Entries Found</div>
              <div style={{ fontSize: '12.5px', marginTop: '6px', color: '#8E8E93', maxWidth: '300px', margin: '6px auto 0', lineHeight: 1.45 }}>
                {watchedEntries.length === 0
                  ? 'Your film diary is empty. Mark films as Watched to automatically add them to your chronological journal!'
                  : 'No watched films match this specific diary filter. Try selecting "All Logs" above.'}
              </div>
            </div>
          ) : (
            Object.entries(diaryGroups).map(([monthLabel, items]) => (
              <div key={monthLabel} style={{ marginBottom: '14px' }}>
                {/* Month Timeline Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 6px 6px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  marginBottom: '10px'
                }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 900, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📅</span> {monthLabel}
                  </span>
                  <span style={{ fontSize: '11px', color: '#71717A', fontWeight: 700 }}>
                    {items.length} {items.length === 1 ? 'film' : 'films'}
                  </span>
                </div>

                {/* Diary Cards in Month */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {items.map(movie => {
                    const cleanReview = (movie.review || '').replace(/__EPISODE_DATA__:.+$/s, '').replace(/__EPISODE_RATINGS__:.+$/s, '').trim();
                    const dObj = movie.watch_date ? new Date(movie.watch_date) : (movie.date_added ? new Date(movie.date_added) : null);
                    const dayNum = dObj && !isNaN(dObj.getTime()) ? dObj.getDate() : '—';
                    const dayName = dObj && !isNaN(dObj.getTime()) ? dObj.toLocaleDateString(undefined, { weekday: 'short' }) : '';
                    const fullDateStr = dObj && !isNaN(dObj.getTime()) ? dObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';

                    return (
                      <div
                        key={movie.id || movie.tmdb_id}
                        onClick={() => onEditClick(movie)}
                        style={{
                          display: 'flex',
                          gap: '12px',
                          padding: '12px',
                          background: '#121118',
                          borderRadius: '12px',
                          border: '1px solid #23212b',
                          cursor: 'pointer',
                          alignItems: 'flex-start',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                          transition: 'border-color 0.15s ease'
                        }}
                      >
                        {/* Calendar Date Leaf (Left) */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '42px',
                          height: '52px',
                          background: '#17161f',
                          border: '1px solid #2c2a38',
                          borderRadius: '8px',
                          flexShrink: 0,
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                          marginTop: '2px'
                        }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--accent)' }} />
                          <span style={{ fontSize: '16px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1, marginTop: '4px' }}>{dayNum}</span>
                          <span style={{ fontSize: '8px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginTop: '2px', letterSpacing: '0.4px' }}>{dayName}</span>
                        </div>

                        {/* Poster Thumbnail */}
                        <div style={{ width: '56px', height: '84px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, background: '#1c1c1c', position: 'relative', boxShadow: '0 6px 14px rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          {movie.poster_path ? (
                            <img src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                          ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎬</div>
                          )}
                          {movie.favorite && (
                            <div style={{ position: 'absolute', top: '3px', left: '3px', fontSize: '11px', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))' }}>❤️</div>
                          )}
                          {movie.rating > 0 && (
                            <div style={{ position: 'absolute', bottom: '3px', right: '3px', background: 'rgba(0,0,0,0.85)', borderRadius: '3px', padding: '1px 3px', fontSize: '8.5px', fontWeight: 900, color: 'var(--gold)', letterSpacing: '-0.2px' }}>
                              ★{Number(movie.rating).toFixed(1)}
                            </div>
                          )}
                        </div>

                        {/* Info Column & Journal Book Entry */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                              {movie.title}
                            </h4>
                            {movie.release_year && (
                              <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', flexShrink: 0 }}>
                                ({movie.release_year})
                              </span>
                            )}
                          </div>

                          {/* Logged Date & Star Ratings */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                            {fullDateStr && (
                              <span style={{ fontSize: '10.5px', color: '#8E8E93' }}>
                                Logged {fullDateStr}
                              </span>
                            )}

                            {movie.rating > 0 && (
                              <span style={{ color: 'var(--gold)', fontSize: '11.5px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '2px' }}>
                                ★ {Number(movie.rating).toFixed(1)}/10
                              </span>
                            )}

                            {movie.is_rewatch && (
                              <span style={{ fontSize: '9px', fontWeight: 800, color: '#A78BFA', background: 'rgba(167,139,250,0.15)', padding: '1px 5px', borderRadius: '3px' }}>
                                🔄 Rewatch
                              </span>
                            )}

                            {(movie.media_type === 'tv' || movie.type === 'tv') && (
                              <span style={{ fontSize: '9px', fontWeight: 900, color: '#60A5FA', border: '1px solid rgba(96,165,250,0.4)', borderRadius: '3px', padding: '0 3px' }}>
                                TV
                              </span>
                            )}
                          </div>

                          {/* The Literal Journal Note Block */}
                          {cleanReview ? (
                            <div style={{
                              marginTop: '7px',
                              background: '#17161f',
                              border: '1px solid #282635',
                              borderLeft: '3px solid var(--accent)',
                              borderRadius: '6px',
                              padding: '7px 10px',
                              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)'
                            }}>
                              <div style={{ fontSize: '9.5px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                ✍️ Journal Note
                              </div>
                              <p style={{
                                fontSize: '11.5px',
                                color: '#E4E4E7',
                                margin: 0,
                                lineHeight: 1.45,
                                fontStyle: 'italic'
                              }}>
                                "{cleanReview}"
                              </p>
                            </div>
                          ) : (
                            <div style={{
                              marginTop: '7px',
                              background: 'rgba(255,255,255,0.015)',
                              border: '1px dashed #282736',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '11px',
                              color: '#636270'
                            }}>
                              <span style={{ fontStyle: 'italic' }}>No written thoughts logged yet…</span>
                              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent)' }}>+ Pen notes</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── MOBILE VIEW: CATEGORIZED SHELVES / VAULT / WALL ──────── */}
      {mobileView === 'grid' && (
        <div className="mobile-only-library-grid" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* If filtering by a single medium, show Dedicated Vault Grid */}
          {filterType !== 'all' ? (
            <DedicatedCategoryVault
              type={filterType}
              items={filtered}
              onBackToShelves={() => setFilterType('all')}
              onEditClick={onEditClick}
            />
          ) : wallMode === 'shelves' ? (
            <div className="library-shelves-container">
              {/* Quick Shelves Jump Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.3) 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '8px 12px'
              }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Shelves
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setFilterType('movie')}
                    style={{
                      background: 'rgba(229,9,20,0.12)',
                      border: '1px solid rgba(229,9,20,0.3)',
                      color: '#fff',
                      borderRadius: '14px',
                      padding: '3px 9px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    🎬 Films ({movies.length})
                  </button>
                  <button
                    onClick={() => setFilterType('tv')}
                    style={{
                      background: 'rgba(37,99,235,0.12)',
                      border: '1px solid rgba(37,99,235,0.3)',
                      color: '#fff',
                      borderRadius: '14px',
                      padding: '3px 9px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    📺 Series ({series.length})
                  </button>
                  <button
                    onClick={() => setFilterType('anime')}
                    style={{
                      background: 'rgba(245,158,11,0.12)',
                      border: '1px solid rgba(245,158,11,0.3)',
                      color: '#fff',
                      borderRadius: '14px',
                      padding: '3px 9px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    ⛩️ Anime ({anime.length})
                  </button>
                </div>
              </div>

              {/* 1. Feature Films Shelf */}
              <LibraryShelfRow
                title="Feature Films"
                icon="🎬"
                badgeColor="var(--accent)"
                accentGlow="#ef4444"
                items={movies}
                onSeeAll={() => setFilterType('movie')}
                onEditClick={onEditClick}
                emptyPrompt="No feature films in this list. Explore movies →"
              />

              {/* 2. Television Series Shelf */}
              <LibraryShelfRow
                title="Television Series"
                icon="📺"
                badgeColor="#3b82f6"
                accentGlow="#3b82f6"
                items={series}
                onSeeAll={() => setFilterType('tv')}
                onEditClick={onEditClick}
                emptyPrompt="No television series saved. Explore series →"
              />

              {/* 3. Anime & Animation Shelf */}
              <LibraryShelfRow
                title="Anime & Animation"
                icon="⛩️"
                badgeColor="#f59e0b"
                accentGlow="#f59e0b"
                items={anime}
                onSeeAll={() => setFilterType('anime')}
                onEditClick={onEditClick}
                emptyPrompt="No anime titles saved. Explore anime →"
              />
            </div>
          ) : (
            /* Flat Grid Mode Fallback */
            filtered.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎬</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>No titles match your filter</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>Try resetting filters or adding titles from Explore</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {filtered.map(movie => (
                  <MediaPosterCard
                    key={movie.id || movie.tmdb_id}
                    movie={movie}
                    onEditClick={onEditClick}
                    layout="grid"
                  />
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* ── DESKTOP 3-COLUMN LIBRARY ─────────────────────────────────── */}
      <div className="desktop-only-3col-library" style={{ display: 'flex', gap: '14px', flex: 1, minHeight: 0 }}>
        {compactView ? (
          <div className="library-grid-container" style={{ overflowY: 'auto', flex: 1 }}>
            {filterType !== 'all' ? (
              <DedicatedCategoryVault
                type={filterType}
                items={filtered}
                onBackToShelves={() => setFilterType('all')}
                onEditClick={onEditClick}
              />
            ) : (
              <div className="library-shelves-container">
                <LibraryShelfRow
                  title="Feature Films"
                  icon="🎬"
                  badgeColor="var(--accent)"
                  accentGlow="#ef4444"
                  items={movies}
                  onSeeAll={() => setFilterType('movie')}
                  onEditClick={onEditClick}
                  emptyPrompt="No feature films in this list."
                />
                <LibraryShelfRow
                  title="Television Series"
                  icon="📺"
                  badgeColor="#3b82f6"
                  accentGlow="#3b82f6"
                  items={series}
                  onSeeAll={() => setFilterType('tv')}
                  onEditClick={onEditClick}
                  emptyPrompt="No television series saved."
                />
                <LibraryShelfRow
                  title="Anime & Animation"
                  icon="⛩️"
                  badgeColor="#f59e0b"
                  accentGlow="#f59e0b"
                  items={anime}
                  onSeeAll={() => setFilterType('anime')}
                  onEditClick={onEditClick}
                  emptyPrompt="No anime titles saved."
                />
              </div>
            )}
          </div>
        ) : (
          <>
            <LibraryColumn label="Movies"  icon="🎬" color="var(--accent)" movies={movies} onEditClick={onEditClick} onRemove={onRemove} searchQuery={searchQuery} sortBy={sortBy} />
            <LibraryColumn label="Series"  icon="📺" color="var(--blue)"   movies={series} onEditClick={onEditClick} onRemove={onRemove} searchQuery={searchQuery} sortBy={sortBy} />
            <LibraryColumn label="Anime"   icon="⛩"  color="#f97316"       movies={anime}  onEditClick={onEditClick} onRemove={onRemove} searchQuery={searchQuery} sortBy={sortBy} />
          </>
        )}
      </div>


      {/* ── MOBILE FILTER & SORT BOTTOM SHEET ────────────────────────── */}
      {showMobileFilterSheet && (
        <div className="mobile-drawer-overlay" onClick={() => setShowMobileFilterSheet(false)}>
          <div className="mobile-drawer-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '82vh', overflowY: 'auto' }}>
            <div className="mobile-drawer-handle" />
            <div className="mobile-drawer-header">
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={18} color="var(--accent)" />
                Filter & Sort
              </h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  onClick={() => { setSortBy('date_added-desc'); setFilterGenre('all'); setFilterStatus('all'); setFilterType('all'); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Reset
                </button>
                <button className="mobile-drawer-close-btn" onClick={() => setShowMobileFilterSheet(false)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Sort Order */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
                  Sort By
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                  {[
                    { id: 'date_added-desc', label: 'Newest Added' },
                    { id: 'date_added-asc', label: 'Oldest Added' },
                    { id: 'rating-desc', label: 'Highest Rated ★' },
                    { id: 'year-desc', label: 'Release Year' },
                    { id: 'title-asc', label: 'Title (A–Z)' },
                    { id: 'title-desc', label: 'Title (Z–A)' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSortBy(s.id)}
                      style={{
                        background: sortBy === s.id ? 'var(--accent)' : '#161616',
                        color: sortBy === s.id ? '#FFFFFF' : '#A1A1AA',
                        border: `1px solid ${sortBy === s.id ? 'var(--accent)' : '#242424'}`,
                        borderRadius: '8px',
                        padding: '8px 10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genre Filter */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
                  Filter by Genre
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <button
                    onClick={() => setFilterGenre('all')}
                    style={{
                      background: filterGenre === 'all' ? 'var(--accent)' : '#161616',
                      color: filterGenre === 'all' ? '#FFFFFF' : '#A1A1AA',
                      border: `1px solid ${filterGenre === 'all' ? 'var(--accent)' : '#242424'}`,
                      borderRadius: '16px',
                      padding: '5px 12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    All Genres
                  </button>
                  {availableGenres.map(g => (
                    <button
                      key={g}
                      onClick={() => setFilterGenre(g)}
                      style={{
                        background: filterGenre === g ? 'var(--accent)' : '#161616',
                        color: filterGenre === g ? '#FFFFFF' : '#A1A1AA',
                        border: `1px solid ${filterGenre === g ? 'var(--accent)' : '#242424'}`,
                        borderRadius: '16px',
                        padding: '5px 12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collection Tools */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
                  Tools & Backup
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => { setShowMobileFilterSheet(false); setShowImport(true); }}
                    style={{ fontSize: '11px', padding: '8px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    <Upload size={13} /> Import
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleExportCSV}
                    style={{ fontSize: '11px', padding: '8px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    <Download size={13} /> CSV
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleExportJSON}
                    style={{ fontSize: '11px', padding: '8px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    <Download size={13} /> JSON
                  </button>
                </div>
              </div>

              {/* Apply / View Button */}
              <button
                className="btn btn-primary"
                onClick={() => setShowMobileFilterSheet(false)}
                style={{ width: '100%', padding: '12px', fontWeight: 900, borderRadius: '10px', marginTop: '6px' }}
              >
                View {filtered.length} {filtered.length === 1 ? 'Title' : 'Titles'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import modal */}
      {showImport && <ImportModal onClose={() => setShowImport(false)} onImport={entries => onImportMovies ? onImportMovies(entries) : Promise.resolve(false)} />}
    </div>
  );
}

