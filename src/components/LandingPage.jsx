import React, { useState, useEffect, useMemo } from 'react';
import { Play, Flame, Heart, Star, Trophy, Users, List, Clock, CheckCircle, TrendingUp, Film, Tv, Award, BarChart3, Sparkles } from 'lucide-react';
import { COMMUNITY_COLLECTIONS } from '../mockData';
import { triggerBackdropHover } from '../utils/backdrop';

const TMDB_KEY = '6a2fd6b9b1bb3befbb9f14c203732225';

const HERO_MOVIES = [
  {
    tmdb_id: 693134,
    title: 'DUNE: PART TWO',
    backdrop_path: '/eZ239CUp1d6OryZEBPnO2n87gMG.jpg',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while seeking vengeance against the conspirators who destroyed his family, facing a choice between the love of his life and the fate of the known universe.',
    year: '2024',
    rating: '8.2',
    genre: 'Sci-Fi',
    runtime: '2h 47m',
    media_type: 'movie'
  },
  {
    tmdb_id: 872585,
    title: 'OPPENHEIMER',
    backdrop_path: '/neeNHeXjMF5fXoCJRsOmkNGC7q.jpg',
    overview: 'The story of J. Robert Oppenheimer’s role in the Manhattan Project and the development of the atomic bomb during World War II.',
    year: '2023',
    rating: '8.1',
    genre: 'Biography · Drama',
    runtime: '3h 01m',
    media_type: 'movie'
  },
  {
    tmdb_id: 157336,
    title: 'INTERSTELLAR',
    backdrop_path: '/2ssWTSVklAEc98frZUQhgtGHx7s.jpg',
    overview: 'A group of explorers make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    year: '2014',
    rating: '8.4',
    genre: 'Sci-Fi · Drama',
    runtime: '2h 49m',
    media_type: 'movie'
  },
  {
    tmdb_id: 27205,
    title: 'INCEPTION',
    backdrop_path: '/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as payment for the impossible: inception.',
    year: '2010',
    rating: '8.4',
    genre: 'Sci-Fi · Thriller',
    runtime: '2h 28m',
    media_type: 'movie'
  },
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

  const GENRE_COLORS = ['#880808', '#10b981', '#ef4444', '#fbbf24', '#3b82f6', '#c0392b'];

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

      {/* ── HERO BILLBOARD (MATCHING RED MOCKUP) ── */}
      <div style={{
        position: 'relative',
        minHeight: '380px',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #222222',
        background: '#0a0a0a',
        boxShadow: '0 24px 60px rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Background image & horizontal gradient fade */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: heroTransitioning ? 0 : 0.85,
          transition: 'opacity 0.3s ease',
          zIndex: 1
        }}>
          <img
            key={activeHero.tmdb_id}
            src={`https://image.tmdb.org/t/p/original${activeHero.backdrop_path}`}
            alt=""
            style={{ width: '65%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Gradient overlays to achieve clean fade from image to pitch black on the right */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(10,10,10,0.1) 0%, rgba(10,10,10,0.7) 45%, #0a0a0a 65%, #0a0a0a 100%)',
          zIndex: 2
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(10,10,10,0.6) 0%, transparent 60%)',
          zIndex: 2
        }} />

        {/* Right Billboard Content */}
        <div style={{
          position: 'relative',
          zIndex: 3,
          marginLeft: 'auto',
          width: '50%',
          minWidth: '380px',
          padding: '40px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          opacity: heroTransitioning ? 0 : 1,
          transition: 'opacity 0.3s ease'
        }}>
          <h1 style={{
            fontSize: '40px',
            fontWeight: 900,
            lineHeight: 1.05,
            marginBottom: '10px',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            letterSpacing: '-0.5px'
          }}>
            {activeHero.title}
          </h1>

          {/* Stars & Meta line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span style={{ color: '#FFFFFF', fontSize: '14px', letterSpacing: '1px' }}>★★★★★</span>
            <span style={{ color: '#888888', fontSize: '13px', fontWeight: 600 }}>
              {activeHero.year} · {activeHero.genre} · {activeHero.runtime || '2h 46m'}
            </span>
          </div>

          <p style={{
            color: '#9E9E9E',
            fontSize: '13.5px',
            lineHeight: 1.6,
            marginBottom: '26px',
            maxWidth: '460px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {activeHero.overview}
          </p>

          {/* Sharp Solid Buttons matching mockup */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => onMovieClick(activeHero.tmdb_id, activeHero.media_type)}
              style={{
                background: 'var(--accent)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '11px 22px',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 10px rgba(229,9,20,0.35)',
                transition: 'opacity 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              + ADD TO LIBRARY
            </button>
            <button
              onClick={() => onMovieClick(activeHero.tmdb_id, activeHero.media_type)}
              style={{
                background: '#181818',
                color: '#FFFFFF',
                border: '1px solid #333333',
                borderRadius: '6px',
                padding: '11px 22px',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'border-color 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#333333'}
            >
              ☆ LOG / RATE
            </button>
          </div>
        </div>

        {/* Dot navigation */}
        <div style={{ position: 'absolute', right: '32px', bottom: '24px', display: 'flex', gap: '6px', zIndex: 10 }}>
          {HERO_MOVIES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToHero(idx)}
              style={{
                width: idx === heroIndex ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: heroIndex === idx ? 'var(--accent)' : '#444444',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                padding: 0
              }}
            />
          ))}
        </div>
      </div>

      {/* ── STATS ROW (IF LIBRARY HAS ITEMS) ── */}
      {library.length > 0 && (
        <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Total Titles', val: library.length, color: 'var(--accent)', icon: Film },
            { label: 'Watched', val: watchedCount, color: 'var(--green)', icon: CheckCircle },
            { label: 'Watchlist', val: watchlistCount, color: 'var(--blue)', icon: Clock },
            { label: 'Favorites', val: favCount, color: 'var(--red)', icon: Heart },
            { label: 'Avg Rating', val: avgRating > 0 ? avgRating.toFixed(1) : '—', color: 'var(--gold)', icon: Star },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{
                background: '#121212',
                border: '1px solid #242424',
                borderRadius: '10px',
                padding: '16px 18px',
                textAlign: 'center',
                transition: 'border-color 0.2s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#242424'}
              >
                <Icon size={18} color={s.color} style={{ marginBottom: '8px', opacity: 0.9 }} />
                <div style={{ fontSize: '26px', fontWeight: 900, color: s.color, letterSpacing: '-0.5px', lineHeight: 1, marginBottom: '4px' }}>
                  {typeof s.val === 'number' ? <StatCounter value={s.val} /> : s.val}
                </div>
                <div style={{ fontSize: '10px', color: '#777777', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.07em' }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MAIN CONTENT: TRENDING THIS WEEK (MATCHING RED MOCKUP) ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '44px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h2 style={{
              fontSize: '15px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#FFFFFF',
              margin: 0
            }}>
              Trending This Week
            </h2>
            <button
              onClick={() => setActiveTab('explore')}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              See All →
            </button>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', gap: '16px' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ width: '180px', flexShrink: 0 }}>
                  <div className="skeleton" style={{ width: '180px', height: '270px', borderRadius: '8px' }} />
                  <div className="skeleton" style={{ height: '14px', marginTop: '10px', width: '80%' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="shelf-row stagger-children" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px' }}>
              {displayTrending.map((movie, i) => {
                const tag = i === 0 || i === 3 ? 'POPULAR' : i === 1 || i === 2 || i === 4 ? 'NEW RELEASE' : 'TOP RATED';
                return (
                  <div
                    key={movie.id}
                    onClick={() => onMovieClick(movie.id, 'movie')}
                    onMouseEnter={() => triggerBackdropHover(movie.backdrop_path)}
                    onMouseLeave={() => triggerBackdropHover(null)}
                    style={{
                      width: '180px',
                      flexShrink: 0,
                      cursor: 'pointer',
                      transition: 'transform 0.18s ease'
                    }}
                  >
                    <div style={{
                      position: 'relative',
                      aspectRatio: '2/3',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#121212',
                      border: '1px solid #222222',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
                    }}>
                      {movie.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          alt={movie.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                        />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🎬</div>
                      )}

                      {/* Solid Red Badge matching Mockup */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: 'var(--accent)',
                        color: '#FFFFFF',
                        fontSize: '9.5px',
                        fontWeight: 900,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
                      }}>
                        {tag}
                      </div>

                      {/* Bottom-left badge if rating is high */}
                      {movie.vote_average >= 7.8 && (
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          left: '8px',
                          background: 'var(--accent)',
                          color: '#FFFFFF',
                          fontSize: '9px',
                          fontWeight: 900,
                          padding: '2px 7px',
                          borderRadius: '4px',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase'
                        }}>
                          TOP RATED
                        </div>
                      )}
                    </div>

                    {/* Movie info matching red mockup */}
                    <div style={{ paddingTop: '8px' }}>
                      <div style={{
                        fontSize: '12.5px',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {movie.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#888888', marginTop: '2px' }}>
                        ({(movie.release_date || '').slice(0, 4) || '2024'})
                      </div>
                    </div>
                  </div>
                );
              })}
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
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.borderColor = 'rgba(136,8,8,0.25)'; }}
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

