import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowLeft, CheckCircle2, Film, Sparkles, Filter } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export default function CollectionDetailModal({
  collection,
  onClose,
  onMovieClick
}) {
  useBodyScrollLock(true);
  const [filterUnwatched, setFilterUnwatched] = useState(false);

  if (!collection || typeof document === 'undefined') return null;

  const movies = collection.movies || [];
  const watchedCount = movies.filter(m => m.status === 'watched').length;
  const totalCount = movies.length;
  const pct = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

  const displayedMovies = filterUnwatched
    ? movies.filter(m => m.status !== 'watched')
    : movies;

  return createPortal(
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        background: 'rgba(5, 3, 10, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        animation: 'fadeInOverlay 0.18s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass"
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: 'min(90vh, 880px)',
          background: 'linear-gradient(180deg, #13101c 0%, #0d0b13 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          margin: 'auto',
          animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Top Header Bar (Pinned) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)',
            flexShrink: 0
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '8px',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
          >
            <ArrowLeft size={16} /> Back to Collections
          </button>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '6px'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Container (Smooth Scroll on Wheel & Touch) */}
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
          {/* Collection Hero */}
          <div style={{ padding: '24px 30px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px', lineHeight: 1 }}>{collection.emoji || '🎬'}</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: 'rgba(136,8,8,0.2)',
                    border: '1px solid var(--accent)',
                    color: 'var(--accent)',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '20px',
                    letterSpacing: '0.5px'
                  }}>
                    CINELOG ORIGINAL
                  </span>
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-dim)'
                  }}>
                    {totalCount} {totalCount === 1 ? 'film' : 'films'}
                  </span>
                </div>
                <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#fff', margin: '6px 0 0', letterSpacing: '-0.5px' }}>
                  {collection.title}
                </h1>
              </div>
            </div>

            {collection.desc && (
              <p style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.55, margin: '10px 0 16px', maxWidth: '720px' }}>
                {collection.desc}
              </p>
            )}

            {/* Progress & Filter Row */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: '16px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>Your Collection Progress</span>
                  <span style={{ color: pct === 100 ? 'var(--green)' : 'var(--text-muted)', fontWeight: 800 }}>
                    {watchedCount}/{totalCount} watched ({pct}%)
                  </span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: pct === 100 ? 'var(--green)' : 'linear-gradient(90deg, var(--accent), #880808)',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {totalCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterUnwatched(p => !p)}
                  style={{
                    background: filterUnwatched ? 'rgba(136,8,8,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${filterUnwatched ? 'var(--accent)' : 'rgba(255,255,255,0.12)'}`,
                    color: filterUnwatched ? '#fff' : 'var(--text-muted)',
                    borderRadius: '10px',
                    padding: '7px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                >
                  <Filter size={13} />
                  <span>{filterUnwatched ? `Show All (${totalCount})` : `Unwatched Only (${totalCount - watchedCount})`}</span>
                </button>
              )}
            </div>
          </div>

          {/* Films Grid */}
          <div style={{ padding: 'clamp(16px, 3vw, 24px) clamp(16px, 3vw, 30px) 36px' }}>
            {displayedMovies.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(102px, 1fr))',
                gap: '12px'
              }}>
                {displayedMovies.map(movie => {
                  const isWatched = movie.status === 'watched';
                  return (
                    <div
                      key={movie.id || movie.tmdb_id}
                      onClick={() => onMovieClick && onMovieClick(movie.tmdb_id || movie.id, movie.media_type || (movie.first_air_date || movie.name ? 'tv' : 'movie'))}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        position: 'relative',
                        transition: 'transform 0.18s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.18s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = 'var(--accent)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                      }}
                    >
                      {/* Poster */}
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', background: '#1c1926' }}>
                        {movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                            alt={movie.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                            🎬
                          </div>
                        )}

                        {/* Watched Badge */}
                        {isWatched && (
                          <div style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: 'rgba(34, 197, 94, 0.92)',
                            color: '#fff',
                            borderRadius: '50%',
                            width: '22px',
                            height: '22px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.6)'
                          }}>
                            <CheckCircle2 size={14} />
                          </div>
                        )}

                        {/* Rating Badge */}
                        {movie.rating && (
                          <div style={{
                            position: 'absolute',
                            bottom: '6px',
                            left: '6px',
                            background: 'rgba(10, 8, 20, 0.85)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '6px',
                            padding: '2px 6px',
                            fontSize: '10px',
                            fontWeight: 800,
                            color: 'var(--gold)'
                          }}>
                            ★ {movie.rating}
                          </div>
                        )}
                      </div>

                      {/* Meta info */}
                      <div style={{ padding: '8px 10px 10px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{
                          fontSize: '12.5px',
                          fontWeight: 800,
                          color: '#fff',
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {movie.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                          {movie.release_year || (movie.release_date || '').slice(0, 4) || '—'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-dim)' }}>
                <div style={{ fontSize: '38px', marginBottom: '12px' }}>🎬</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
                  {filterUnwatched ? 'You have watched all films in this collection!' : 'No titles found in this collection yet.'}
                </div>
                <div style={{ fontSize: '13px' }}>
                  Add more films from Explore or your Library to expand this vault.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
