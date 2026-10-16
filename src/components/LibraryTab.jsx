import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Heart, Star, Edit, Trash, Plus, Upload, Download, Dices, X, Check, AlertCircle, ChevronRight, LayoutGrid, List, SlidersHorizontal, Film, Tv, Clock, RotateCcw } from 'lucide-react';
import { triggerBackdropHover } from '../utils/backdrop';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const GENRE_MAP = {28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Sci-Fi',53:'Thriller',10752:'War',37:'Western',10759:'Action & Adventure',10765:'Sci-Fi & Fantasy'};

function getRatingColor(r) {
  if (!r) return 'var(--text-dim)';
  const n = Number(r);
  if (n >= 8) return '#10b981';
  if (n >= 6) return '#fbbf24';
  if (n >= 4) return '#f97316';
  return '#ef4444';
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

// ── Library Column ────────────────────────────────────────────────────
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
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.015)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      {/* Column Header */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <span style={{ fontWeight: 800, fontSize: '14px', flex: 1 }}>{label}</span>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', padding: '1px 8px', borderRadius: '20px' }}>{filtered.length}</span>
        {avgRating && (
          <span style={{ fontSize: '13px', fontWeight: 900, color: getRatingColor(avgRating) }}>{avgRating}</span>
        )}
        <span style={{ display: 'inline-flex', width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0 }} />
      </div>

      {/* Favorites sub-bar */}
      <div style={{ padding: '4px 14px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)', display: 'flex', gap: '12px', fontSize: '10px', color: 'var(--text-dim)', flexShrink: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: 'var(--green)', fontWeight: 700 }}>{watched.length}</span> watched
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Heart size={9} fill="var(--red)" color="var(--red)" />
          <span style={{ color: 'var(--red)', fontWeight: 700 }}>{filtered.filter(m => m.favorite).length}</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          ⏳ <span style={{ fontWeight: 700 }}>{filtered.filter(m => m.status === 'plan_to_watch').length}</span>
        </span>
      </div>

      {/* Scrollable list */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>
            {searchQuery ? 'No matches' : 'Empty – add titles from Explore'}
          </div>
        ) : filtered.map(movie => {
          const isWatched = movie.status === 'watched';
          const genres = (movie.genres || []).slice(0, 2).join(' · ');
          const isWatching = movie.status === 'watching';
          return (
            <div
              key={movie.id || movie.tmdb_id}
              onClick={() => onEditClick(movie)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                cursor: 'pointer', transition: 'all 0.15s',
                background: isWatching ? 'rgba(136,8,8,0.05)' : 'transparent',
                borderLeft: isWatching ? '3px solid var(--accent)' : '3px solid transparent',
                paddingLeft: isWatching ? '9px' : '12px'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = isWatching ? 'rgba(136,8,8,0.08)' : 'rgba(255,255,255,0.04)'; triggerBackdropHover(movie.backdrop_path || movie.details?.backdrop_path); }}
              onMouseLeave={e => { e.currentTarget.style.background = isWatching ? 'rgba(136,8,8,0.05)' : 'transparent'; triggerBackdropHover(null); }}
            >
              {/* Small poster */}
              <div style={{ width: '32px', height: '48px', borderRadius: '3px', overflow: 'hidden', flexShrink: 0, background: 'var(--surface-solid)' }}>
                {movie.poster_path ? (
                  <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '14px' }}>🎬</div>
                )}
              </div>

              {/* Title + meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '12px', fontWeight: 700,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  textDecoration: isWatched ? 'line-through' : 'none',
                  color: isWatched ? 'var(--text-muted)' : 'var(--text)',
                  display: 'flex', alignItems: 'center'
                }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{movie.title}</span>
                  {isWatching && (
                    <span style={{ flexShrink: 0, fontSize: '8px', background: 'rgba(136,8,8,0.15)', color: 'var(--accent)', border: '1px solid rgba(136,8,8,0.3)', borderRadius: '4px', padding: '1px 5px', fontWeight: 800, marginLeft: '6px', display: 'inline-flex', alignItems: 'center', gap: '2px', animation: 'pulse 2.5s infinite' }}>
                      ▶ Watching
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {movie.release_year || '—'}{genres ? ` · ${genres}` : ''}
                </div>
              </div>

              {/* Right side: rating + fav + remove */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                {movie.theater_seat && (
                  <span
                    title={`Theater Ticket: Row & Seat ${movie.theater_seat}`}
                    style={{
                      cursor: 'help',
                      fontSize: '11px',
                      background: 'rgba(180,83,9,0.15)',
                      border: '1px solid rgba(180,83,9,0.3)',
                      borderRadius: '4px',
                      padding: '1px 3px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      lineHeight: 1
                    }}
                  >
                    🎟️
                  </span>
                )}
                {movie.favorite && <Heart size={10} fill="var(--red)" color="var(--red)" />}
                {movie.rating && (
                  <span style={{ fontSize: '12px', fontWeight: 900, color: getRatingColor(movie.rating), minWidth: '28px', textAlign: 'right' }}>
                    {Number(movie.rating).toFixed(1)}
                  </span>
                )}
                <button
                  onClick={e => { e.stopPropagation(); onRemove(movie.id); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px', opacity: 0.5, transition: 'opacity 0.15s', display: 'flex' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                  title="Remove"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
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
  const [mobileView, setMobileView] = useState('grid'); // 'grid' | 'list'
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

  // Split by type and apply status/genre/type/search filters
  const filtered = useMemo(() => {
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

    if (filterType !== 'all') {
      if (filterType === 'movie') {
        list = list.filter(m => m.media_type === 'movie' || (!m.media_type && m.type !== 'anime' && m.type !== 'tv'));
      } else if (filterType === 'tv') {
        list = list.filter(m => m.media_type === 'tv' || m.type === 'tv');
      } else if (filterType === 'anime') {
        list = list.filter(m => m.media_type === 'anime' || m.type === 'anime');
      }
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
  }, [library, filterStatus, filterType, filterGenre, searchQuery, sortBy]);

  const movies = filtered.filter(m => m.media_type === 'movie' || (!m.media_type && m.type !== 'anime' && m.type !== 'tv'));
  const series = filtered.filter(m => m.media_type === 'tv' || m.type === 'tv');
  const anime  = filtered.filter(m => m.media_type === 'anime' || m.type === 'anime');

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
                title="3-Column Cinema Wall Grid"
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
          {[
            { id: 'all', label: `All (${library.length})` },
            { id: 'watched', label: `✓ Watched (${stats.watched})` },
            { id: 'plan_to_watch', label: `⏳ Watchlist (${stats.watchlist})` },
            { id: 'favorites', label: `❤️ Favs (${stats.favs})` },
            { id: 'movie', label: `🎬 Movies (${movies.length})`, isType: true },
            { id: 'tv', label: `📺 Series (${series.length})`, isType: true },
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
          })}
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

      {/* ── MOBILE VIEW: DIARY STREAM (LIST) ─────────────────────────── */}
      {mobileView === 'list' && (
        <div className="mobile-only-library-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Milestone Quick Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '2px' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, #111016 100%)',
              border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: '12px',
              padding: '10px 14px'
            }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🎬 LOGGED
              </div>
              <div style={{ fontSize: '19px', fontWeight: 900, color: '#FFFFFF', marginTop: '2px' }}>
                {stats.watched} <span style={{ fontSize: '12px', fontWeight: 600, color: '#888' }}>films</span>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(229,9,20,0.1) 0%, #111016 100%)',
              border: '1px solid rgba(229,9,20,0.25)',
              borderRadius: '12px',
              padding: '10px 14px'
            }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                ⏳ WATCH TIME
              </div>
              <div style={{ fontSize: '19px', fontWeight: 900, color: '#FFFFFF', marginTop: '2px' }}>
                ~{Math.round(stats.watched * 1.9)}h <span style={{ fontSize: '12px', fontWeight: 600, color: '#888' }}>runtime</span>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎬</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>No titles match your filter</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>Try resetting filters or adding titles from Explore</div>
            </div>
          ) : (
            filtered.map(movie => {
              const isWatched = movie.status === 'watched';
              const isPlan = movie.status === 'plan_to_watch';
              const cleanReview = (movie.review || '').replace(/__EPISODE_DATA__:.+$/s, '').replace(/__EPISODE_RATINGS__:.+$/s, '').trim();
              const formattedDate = movie.watch_date
                ? new Date(movie.watch_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                : movie.date_added
                ? new Date(movie.date_added).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                : null;

              return (
                <div
                  key={movie.id || movie.tmdb_id}
                  onClick={() => onEditClick(movie)}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '10px 12px',
                    background: '#111015',
                    borderRadius: '12px',
                    border: '1px solid #1e1d24',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s'
                  }}
                >
                  {/* Poster Thumbnail */}
                  <div style={{ width: '58px', height: '87px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#1c1c1c', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                    {movie.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎬</div>
                    )}
                    {movie.favorite && (
                      <div style={{ position: 'absolute', top: '3px', left: '3px', fontSize: '11px', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))' }}>❤️</div>
                    )}
                  </div>

                  {/* Info Column */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                        <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          {movie.title}
                        </h4>
                        {formattedDate && (
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0, marginTop: '2px' }}>
                            {formattedDate}
                          </span>
                        )}
                      </div>

                      {/* Year & Rating Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        {movie.release_year && (
                          <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontWeight: 600 }}>
                            {movie.release_year}
                          </span>
                        )}

                        {movie.rating > 0 ? (
                          <span style={{ color: 'var(--gold)', fontSize: '12px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '2px' }}>
                            ★ {Number(movie.rating).toFixed(1)}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>Unrated</span>
                        )}

                        <span style={{
                          fontSize: '9.5px',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: isWatched ? 'rgba(16,185,129,0.15)' : isPlan ? 'rgba(59,130,246,0.15)' : 'rgba(229,9,20,0.15)',
                          color: isWatched ? '#10B981' : isPlan ? '#60A5FA' : 'var(--accent)'
                        }}>
                          {isWatched ? 'Watched' : isPlan ? 'Watchlist' : 'Watching'}
                        </span>

                        {(movie.media_type === 'tv' || movie.type === 'tv') && (
                          <span style={{ fontSize: '9px', fontWeight: 900, color: '#60A5FA', border: '1px solid rgba(96,165,250,0.4)', borderRadius: '3px', padding: '0 3.5px' }}>
                            TV
                          </span>
                        )}
                      </div>

                      {/* Review snippet if available */}
                      {cleanReview && (
                        <p style={{
                          fontSize: '11.5px',
                          color: '#C4C4C8',
                          margin: '6px 0 0 0',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontStyle: 'italic',
                          borderLeft: '2px solid rgba(229,9,20,0.5)',
                          paddingLeft: '6px'
                        }}>
                          "{cleanReview}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── MOBILE VIEW: 3-COLUMN LETTERBOXD CINEMA WALL (GRID) ──────── */}
      {mobileView === 'grid' && (
        <div className="mobile-only-library-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: 'span 3', padding: '60px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎬</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>No titles match your filter</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>Try resetting filters or adding titles from Explore</div>
            </div>
          ) : (
            filtered.map(movie => {
              const isWatching = movie.status === 'watching';
              return (
                <div
                  key={movie.id || movie.tmdb_id}
                  onClick={() => onEditClick(movie)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: isWatching ? '1px solid var(--accent)' : '1px solid #222222',
                    boxShadow: isWatching ? '0 0 10px rgba(229,9,20,0.35)' : 'none',
                    position: 'relative',
                    aspectRatio: '2/3',
                    background: '#141414',
                    transition: 'transform 0.1s ease'
                  }}
                >
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                      alt={movie.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🎬</div>
                  )}

                  {/* Gradient Title Overlay */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.2) 40%, transparent 60%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '6px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {movie.title}
                    </div>
                  </div>

                  {/* Badges Overlay */}
                  {movie.rating > 0 && (
                    <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '1px 5px', fontSize: '9px', fontWeight: 900, color: 'var(--gold)', letterSpacing: '-0.2px' }}>
                      ★{Number(movie.rating).toFixed(1)}
                    </div>
                  )}

                  {movie.favorite && (
                    <div style={{ position: 'absolute', top: '4px', left: '4px', fontSize: '10px', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }}>❤️</div>
                  )}

                  {isWatching && (
                    <div style={{ position: 'absolute', top: '4px', left: movie.favorite ? '22px' : '4px', background: 'var(--accent)', borderRadius: '3px', padding: '1px 4px', fontSize: '7.5px', fontWeight: 900, color: '#fff' }}>
                      ▶ WATCHING
                    </div>
                  )}

                  {(movie.media_type === 'tv' || movie.type === 'tv') && (
                    <div style={{ position: 'absolute', bottom: '22px', left: '6px', background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(96,165,250,0.5)', color: '#60A5FA', borderRadius: '3px', padding: '0.5px 3.5px', fontSize: '7.5px', fontWeight: 900 }}>
                      TV
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── DESKTOP 3-COLUMN LIBRARY ─────────────────────────────────── */}
      <div className="desktop-only-3col-library" style={{ display: 'flex', gap: '14px', flex: 1, minHeight: 0 }}>
        {compactView ? (
          <div className="library-grid-container" style={{ overflowY: 'auto', flex: 1 }}>
            <div className="library-poster-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px', padding: '4px' }}>
              {filtered.map(movie => (
                <div key={movie.id || movie.tmdb_id} onClick={() => onEditClick(movie)}
                  style={{ cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative', aspectRatio: '2/3', background: 'var(--surface-solid)' }}>
                  {movie.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🎬</div>
                  )}
                  {movie.rating > 0 && (
                    <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.75)', borderRadius: '4px', padding: '1px 5px', fontSize: '9px', fontWeight: 900, color: 'var(--gold)' }}>★{Number(movie.rating).toFixed(1)}</div>
                  )}
                </div>
              ))}
            </div>
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

