import React, { useState, useEffect, useMemo } from 'react';
import { Play, Flame, Heart, Star, Trophy, Users, List, Clock, CheckCircle, TrendingUp, Film, Tv, Award, BarChart3, Sparkles } from 'lucide-react';
import { COMMUNITY_COLLECTIONS } from '../mockData';
import { triggerBackdropHover } from '../utils/backdrop';

const TMDB_KEY = '6a2fd6b9b1bb3befbb9f14c203732225';

const HERO_MOVIES = [
  { tmdb_id: 27205, title: 'Inception', backdrop_path: '/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg', overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as payment for the impossible: inception.', year: '2010', rating: '8.4', genre: 'Sci-Fi Thriller', media_type: 'movie' },
  { tmdb_id: 157336, title: 'Interstellar', backdrop_path: '/2ssWTSVklAEc98frZUQhgtGHx7s.jpg', overview: 'A group of explorers make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.', year: '2014', rating: '8.4', genre: 'Sci-Fi Drama', media_type: 'movie' },
  { tmdb_id: 603, title: 'The Matrix', backdrop_path: '/oMsxZEvz9a708d49b6UdZK1KAo5.jpg', overview: 'Set in the 22nd century, The Matrix tells the story of a computer hacker who joins underground insurgents fighting against a vast computer-generated reality.', year: '1999', rating: '8.2', genre: 'Action Sci-Fi', media_type: 'movie' },
  { tmdb_id: 278, title: 'The Shawshank Redemption', backdrop_path: '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg', overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.', year: '1994', rating: '9.3', genre: 'Drama', media_type: 'movie' },
];

function StatCounter({ value, suffix = '', duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const end = typeof value === 'number' ? value : parseInt(value) || 0;
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * end));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{display}{suffix}</>;
}

function GenreBar({ genre, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
      <div style={{ width: '72px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right', flexShrink: 0 }}>{genre}</div>
      <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
        <div
          style={{ width: `${pct}%`, height: '100%', background: color || 'var(--accent)', borderRadius: '3px', transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </div>
      <div style={{ width: '28px', fontSize: '11px', color, fontWeight: 800 }}>{count}</div>
    </div>
  );
}

export default function LandingPage({ onMovieClick, setActiveTab, library = [] }) {
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroTransitioning, setHeroTransitioning] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const goToHero = (idx) => {
    if (idx === heroIndex) return;
    setHeroTransitioning(true);
    setTimeout(() => {
      setHeroIndex(idx);
      setHeroTransitioning(false);
    }, 280);
  };

  useEffect(() => {
    const p = new URLSearchParams({ api_key: TMDB_KEY, language: 'en-US' });
    Promise.all([
      fetch(`https://api.themoviedb.org/3/trending/movie/week?${p}`).then(r => r.json()),
      fetch(`https://api.themoviedb.org/3/movie/now_playing?${p}`).then(r => r.json()),
    ]).then(([trendData, nowData]) => {
      setTrendingMovies(trendData.results || []);
      setNewReleases(nowData.results || []);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroTransitioning(true);
      setTimeout(() => {
        setHeroIndex(prev => (prev + 1) % HERO_MOVIES.length);
        setHeroTransitioning(false);
      }, 280);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const activeHero = HERO_MOVIES[heroIndex];

  // Stats
  const watchedCount = library.filter(m => m.status === 'watched').length;
  const watchlistCount = library.filter(m => m.status === 'plan_to_watch').length;
  const favCount = library.filter(m => m.favorite).length;
  const avgRating = useMemo(() => {
    const rated = library.filter(m => m.rating);
    if (rated.length === 0) return 0;
    return rated.reduce((s, m) => s + Number(m.rating), 0) / rated.length;
  }, [library]);

  // Genre breakdown
  const genreStats = useMemo(() => {
    const map = {};
    library.forEach(m => (m.genres || []).forEach(g => { map[g] = (map[g] || 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [library]);

  const GENRE_COLORS = ['#7c6ff7', '#10b981', '#ef4444', '#fbbf24', '#3b82f6', '#ec4899'];

  const recentActivity = [...library]
    .sort((a, b) => new Date(b.date_added || 0) - new Date(a.date_added || 0))
    .slice(0, 6);

  const topRated = [...library]
    .filter(m => m.rating && m.status === 'watched')
    .sort((a, b) => Number(b.rating) - Number(a.rating))
    .slice(0, 5);

  const inLib = (tmdbId) => library.some(x => String(x.tmdb_id) === String(tmdbId));

  const displayTrending = useMemo(() => {
    return trendingMovies.filter(m => !inLib(m.id)).slice(0, 10);
  }, [trendingMovies, library]);

  const displayNew = useMemo(() => {
    return newReleases.filter(m => !inLib(m.id)).slice(0, 8);
  }, [newReleases, library]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '44px' }}>

      {/* ── HERO CAROUSEL ─────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', height: '480px', borderRadius: 'var(--radius-xl)',
        overflow: 'hidden', border: '1px solid var(--border)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
      }}>
        {/* Background image */}
        <div style={{
          position: 'absolute', inset: 0, opacity: heroTransitioning ? 0 : 0.35,
          transition: 'opacity 0.3s ease',
        }}>
          <img
            key={activeHero.tmdb_id}
            src={`https://image.tmdb.org/t/p/original${activeHero.backdrop_path}`}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Gradient overlays */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,7,11,0.95) 0%, rgba(8,7,11,0.5) 60%, transparent 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg) 0%, transparent 50%)' }} />

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 2, padding: '48px 52px',
          maxWidth: '680px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          opacity: heroTransitioning ? 0 : 1, transition: 'opacity 0.3s ease',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '14px',
            background: 'rgba(124,111,247,0.15)', border: '1px solid rgba(124,111,247,0.3)',
            color: '#a78bfa', borderRadius: '20px', padding: '5px 13px',
            fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
            width: 'fit-content',
          }}>
            <Flame size={11} /> Spotlight · {activeHero.genre}
          </div>

          <h1 style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1.05, marginBottom: '10px', letterSpacing: '-1.5px' }}>
            {activeHero.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
            <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '15px' }}>★ {activeHero.rating}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{activeHero.year}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>TMDB</span>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: 1.65, marginBottom: '28px', maxWidth: '520px' }}>
            {activeHero.overview}
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-primary"
              onClick={() => onMovieClick(activeHero.tmdb_id, activeHero.media_type)}
              style={{ padding: '10px 24px', fontSize: '14px' }}
            >
              <Play size={15} fill="white" /> Log This Film
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setActiveTab('explore')}
              style={{ padding: '10px 20px', fontSize: '13px' }}
            >
              <Compass size={14} /> Explore More
            </button>
          </div>
        </div>

        {/* Dot navigation */}
        <div style={{ position: 'absolute', right: '40px', bottom: '40px', display: 'flex', gap: '8px', zIndex: 10 }}>
          {HERO_MOVIES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToHero(idx)}
              style={{
                width: idx === heroIndex ? '24px' : '8px', height: '8px',
                borderRadius: '4px',
                background: heroIndex === idx ? 'var(--accent)' : 'rgba(255,255,255,0.3)',
                border: 'none', cursor: 'pointer', transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.08)' }}>
          <div style={{
            height: '100%', background: 'var(--accent)',
            animation: 'heroProgress 7s linear infinite',
          }} />
          <style>{`@keyframes heroProgress { from { width: 0% } to { width: 100% } }`}</style>
        </div>
      </div>

      {/* ── STATS ROW ───────────────────────────────────────────────── */}
      {library.length > 0 && (
        <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Total Titles', val: library.length, color: 'var(--accent)', glow: 'rgba(124,111,247,0.25)', icon: Film },
            { label: 'Watched', val: watchedCount, color: 'var(--green)', glow: 'rgba(16,185,129,0.25)', icon: CheckCircle },
            { label: 'Watchlist', val: watchlistCount, color: 'var(--blue)', glow: 'rgba(59,130,246,0.25)', icon: Clock },
            { label: 'Favorites', val: favCount, color: 'var(--red)', glow: 'rgba(239,68,68,0.25)', icon: Heart },
            { label: 'Avg Rating', val: avgRating > 0 ? avgRating.toFixed(1) : '—', color: 'var(--gold)', glow: 'rgba(251,191,36,0.25)', icon: Star },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 'var(--radius)',
                padding: '16px 18px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.25s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = s.color.replace('var(', '').replace(')', ''); e.currentTarget.style.boxShadow = `0 0 20px ${s.glow}`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Background glow */}
                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at top, ${s.glow.replace('0.25', '0.05')} 0%, transparent 70%)`, pointerEvents: 'none' }} />
                <Icon size={18} color={s.color} style={{ marginBottom: '8px', opacity: 0.8 }} />
                <div style={{ fontSize: '28px', fontWeight: 900, color: s.color, fontFamily: 'var(--font-heading)', letterSpacing: '-1px', lineHeight: 1, marginBottom: '4px' }}>
                  {typeof s.val === 'number' ? <StatCounter value={s.val} /> : s.val}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.07em' }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MAIN GRID ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '44px' }}>

          {/* ── TRENDING ── */}
          <div>
            <div className="section-header">
              <Flame size={20} color="var(--red)" />
              <h2 className="section-title">Trending This Week</h2>
              <button
                onClick={() => setActiveTab('explore')}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--accent)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                See All →
              </button>
            </div>

            {isLoading ? (
              <div style={{ display: 'flex', gap: '12px' }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ width: '120px', flexShrink: 0 }}>
                    <div className="skeleton" style={{ width: '120px', height: '180px', borderRadius: 'var(--radius)' }} />
                    <div className="skeleton" style={{ height: '12px', marginTop: '8px', width: '80%' }} />
                  </div>
                ))}
              </div>
            ) : (
            <div className="shelf-row stagger-children" style={{ display: 'flex', gap: '12px', paddingBottom: '8px' }}>
              {displayTrending.map((movie, i) => (
                <div
                  key={movie.id}
                  className="movie-card shelf-item animate-hover-scale"
                  onClick={() => onMovieClick(movie.id, 'movie')}
                  onMouseEnter={() => triggerBackdropHover(movie.backdrop_path)}
                  onMouseLeave={() => triggerBackdropHover(null)}
                  style={{ width: '120px', flexShrink: 0, background: 'var(--surface-solid)', border: '1px solid var(--border)' }}
                >
                    <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden' }}>
                      {movie.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                          alt={movie.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                          loading="lazy"
                        />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🎬</div>
                      )}
                      {/* Rank badge */}
                      <div style={{
                        position: 'absolute', top: '6px', left: '6px',
                        background: i < 3 ? 'var(--accent)' : 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(4px)',
                        color: '#fff', fontSize: '10px', fontWeight: 900,
                        padding: '2px 6px', borderRadius: '5px',
                        boxShadow: i < 3 ? '0 0 10px var(--accent-glow)' : 'none',
                      }}>
                        #{i + 1}
                      </div>
                      {/* Rating badge */}
                      <div style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(4px)', padding: '2px 6px', borderRadius: '5px', fontSize: '10px', fontWeight: 800, color: 'var(--gold)' }}>
                        ★{movie.vote_average?.toFixed(1)}
                      </div>
                      <div className="movie-card-overlay">
                        <div style={{ padding: '8px', width: '100%' }}>
                          <div style={{ fontSize: '11px', fontWeight: 800, lineHeight: 1.3 }}>{movie.title}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '8px 9px' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movie.title}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{(movie.release_date || '').slice(0, 4)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── NEW IN CINEMAS ── */}
          {displayNew.length > 0 && (
            <div>
              <div className="section-header">
                <Film size={20} color="var(--accent)" />
                <h2 className="section-title">In Cinemas Now</h2>
                <button
                  onClick={() => setActiveTab('explore')}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--accent)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  See All →
                </button>
              </div>
              <div className="shelf-row stagger-children" style={{ display: 'flex', gap: '12px', paddingBottom: '8px' }}>
                {displayNew.map(movie => (
                  <div
                    key={movie.id}
                    className="movie-card shelf-item animate-hover-scale"
                    onClick={() => onMovieClick(movie.id, 'movie')}
                    onMouseEnter={() => triggerBackdropHover(movie.backdrop_path)}
                    onMouseLeave={() => triggerBackdropHover(null)}
                    style={{ width: '120px', flexShrink: 0, background: 'var(--surface-solid)', border: '1px solid var(--border)' }}
                  >
                    <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden' }}>
                      {movie.poster_path ? (
                        <img src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🎬</div>
                      )}
                      <div style={{
                        position: 'absolute', top: '6px', left: '6px',
                        background: 'rgba(16,185,129,0.9)', backdropFilter: 'blur(4px)',
                        color: '#fff', fontSize: '9px', fontWeight: 900,
                        padding: '2px 6px', borderRadius: '5px', letterSpacing: '0.5px', textTransform: 'uppercase',
                      }}>
                        NOW
                      </div>
                      <div className="movie-card-overlay">
                        <div style={{ padding: '8px', width: '100%' }}>
                          <div style={{ fontSize: '11px', fontWeight: 800, lineHeight: 1.3 }}>{movie.title}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '8px 9px' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movie.title}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{(movie.release_date || '').slice(0, 4)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── RECENT ACTIVITY ── */}
          <div>
            <div className="section-header">
              <Clock size={20} color="var(--accent)" />
              <h2 className="section-title">Your Recent Activity</h2>
            </div>

            {recentActivity.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentActivity.map((movie, i) => (
                  <div
                    key={movie.id}
                    onClick={() => onMovieClick(movie.tmdb_id, movie.media_type || 'movie')}
                    className="glass"
                    style={{
                      borderRadius: 'var(--radius)', padding: '12px 16px',
                      display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer',
                      transition: 'all 0.2s', animationDelay: `${i * 40}ms`,
                      animation: 'fadeIn 0.3s ease backwards',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.borderColor = 'rgba(124,111,247,0.25)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = ''; }}
                  >
                    <div style={{ width: '38px', height: '57px', borderRadius: '5px', overflow: 'hidden', flexShrink: 0, background: 'var(--surface-solid)', border: '1px solid var(--border)' }}>
                      {movie.poster_path ? (
                        <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🎬</div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '13.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movie.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{movie.release_year || '—'}</span>
                        <span className={`badge ${movie.status === 'watched' ? 'badge-green' : 'badge-blue'}`}>
                          {movie.status === 'watched' ? '✓ Watched' : movie.status === 'watching' ? '▶ Watching' : '⏳ Watchlist'}
                        </span>
                        {movie.rating && (
                          <span style={{ fontSize: '11.5px', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
                            <Star size={10} fill="currentColor" /> {Number(movie.rating).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', flexShrink: 0 }}>
                      {movie.date_added ? new Date(movie.date_added).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass" style={{ borderRadius: 'var(--radius)', padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🍿</div>
                <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>Your Cinema Journey Starts Here</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginBottom: '20px' }}>
                  Start tracking movies to see your activity here.
                </p>
                <button className="btn btn-primary" onClick={() => setActiveTab('explore')}>
                  <Flame size={15} /> Explore Films
                </button>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}

// Needed for Compass import
function Compass(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
}
