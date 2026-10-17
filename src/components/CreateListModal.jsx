import React, { useState } from 'react';
import { X, Plus, Search, Trash2, ArrowUp, ArrowDown, Trophy, Sparkles, Film } from 'lucide-react';

const TMDB_KEY = '6a2fd6b9b1bb3befbb9f14c203732225';

export default function CreateListModal({
  currentUser,
  library = [],
  onClose,
  onSaveList
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isRanked, setIsRanked] = useState(true);
  const [entries, setEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearchTMDB = async (q) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}&page=1`);
      const data = await res.json();
      const results = (data.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv');
      setSearchResults(results.slice(0, 8));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddMovie = (movie) => {
    if (entries.some(e => e.tmdb_id === movie.id || e.id === movie.id)) return;
    const newEntry = {
      tmdb_id: movie.id,
      id: movie.id,
      title: movie.title || movie.name,
      poster_path: movie.poster_path,
      release_year: (movie.release_date || movie.first_air_date || '').slice(0, 4),
      rating: movie.vote_average ? Number(movie.vote_average.toFixed(1)) : null,
      media_type: movie.media_type || 'movie',
      note: ''
    };
    setEntries(prev => [...prev, newEntry]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveEntry = (idx) => {
    setEntries(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMoveEntry = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= entries.length) return;
    setEntries(prev => {
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
  };

  const handleUpdateNote = (idx, note) => {
    setEntries(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], note };
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newList = {
      id: 'list-user-' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      author: {
        id: currentUser?.id || 'user',
        username: currentUser?.username || 'cinephile',
        displayName: currentUser?.displayName || currentUser?.username || 'Cinephile',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop&q=80'
      },
      createdAt: new Date().toISOString(),
      isRanked,
      isPublic: true,
      likesCount: 0,
      entries,
      comments: []
    };

    if (onSaveList) onSaveList(newList);
    onClose();
  };

  return (
    <div
      className="modal-backdrop animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 920,
        background: 'rgba(5, 3, 10, 0.88)',
        backdropFilter: 'blur(16px)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        justifyContent: 'center',
        padding: '24px 16px 80px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '740px',
          background: 'linear-gradient(180deg, #13101c 0%, #0d0b13 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="var(--accent)" />
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', margin: 0 }}>
              Create New Letterboxd-Style List
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* List Title */}
          <div>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
              List Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Definitive Top 10 Sci-Fi Films of the 21st Century"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="form-input"
              required
              style={{ width: '100%', fontSize: '14px', padding: '12px 16px' }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
              Description & Rules
            </label>
            <textarea
              placeholder="What is this list about? Explain your criteria, favorite aspects, or themes..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="form-input"
              rows={3}
              style={{ width: '100%', fontSize: '13.5px', resize: 'vertical' }}
            />
          </div>

          {/* Ranked Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '12px 18px',
            borderRadius: '12px'
          }}>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Trophy size={14} color="var(--gold)" /> Ranked Mode
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                Numbers films 1, 2, 3... in definitive order (great for favorites & year-end bests)
              </div>
            </div>
            <input
              type="checkbox"
              checked={isRanked}
              onChange={e => setIsRanked(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
          </div>

          {/* Film Search & Add */}
          <div>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
              Search & Add Films ({entries.length} added)
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Type movie or TV show title..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  handleSearchTMDB(e.target.value);
                }}
                className="form-input"
                style={{ width: '100%', paddingLeft: '38px' }}
              />
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div style={{
                marginTop: '8px',
                background: '#191524',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: '12px',
                overflow: 'hidden',
                maxHeight: '260px',
                overflowY: 'auto',
                boxShadow: '0 12px 30px rgba(0,0,0,0.8)'
              }}>
                {searchResults.map(movie => (
                  <div
                    key={movie.id}
                    onClick={() => handleAddMovie(movie)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                        alt=""
                        style={{ width: '28px', height: '42px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    ) : (
                      <div style={{ width: '28px', height: '42px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎬</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#fff' }}>
                        {movie.title || movie.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        {(movie.release_date || movie.first_air_date || '').slice(0, 4)} · ⭐ {movie.vote_average?.toFixed(1) || '—'}
                      </div>
                    </div>
                    <button
                      type="button"
                      style={{
                        background: 'rgba(136,8,8,0.2)',
                        border: '1px solid var(--accent)',
                        color: '#fff',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Entries List with Reordering & Notes */}
          {entries.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-dim)' }}>
                List Entries (Drag or use arrows to rank)
              </div>
              {entries.map((entry, idx) => (
                <div
                  key={entry.tmdb_id || idx}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isRanked && (
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.06)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 900
                      }}>
                        {idx + 1}
                      </div>
                    )}
                    {entry.poster_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${entry.poster_path}`}
                        alt=""
                        style={{ width: '28px', height: '42px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>
                        {entry.title} {entry.release_year ? `(${entry.release_year})` : ''}
                      </div>
                    </div>
                    {/* Reorder Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleMoveEntry(idx, idx - 1)}
                        disabled={idx === 0}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: idx === 0 ? 'var(--text-dim)' : '#fff',
                          cursor: idx === 0 ? 'default' : 'pointer',
                          padding: '4px'
                        }}
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveEntry(idx, idx + 1)}
                        disabled={idx === entries.length - 1}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: idx === entries.length - 1 ? 'var(--text-dim)' : '#fff',
                          cursor: idx === entries.length - 1 ? 'default' : 'pointer',
                          padding: '4px'
                        }}
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveEntry(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--red)',
                          cursor: 'pointer',
                          padding: '4px',
                          marginLeft: '6px'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Optional Note / Commentary for this entry */}
                  <input
                    type="text"
                    placeholder="Optional entry note (e.g. why is this movie on your list?)"
                    value={entry.note || ''}
                    onChange={e => handleUpdateNote(idx, e.target.value)}
                    className="form-input"
                    style={{ fontSize: '12.5px', padding: '6px 12px', background: 'rgba(0,0,0,0.3)' }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={!title.trim()} className="btn btn-primary" style={{ padding: '0 24px' }}>
              Publish List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
