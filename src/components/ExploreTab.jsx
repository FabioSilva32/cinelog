import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Star, Plus, Check, Shuffle, ChevronLeft, ChevronRight, Film, Sparkles } from 'lucide-react';
import { triggerBackdropHover } from '../utils/backdrop';

const TMDB_KEY = '6a2fd6b9b1bb3befbb9f14c203732225';

const GENRE_MAP = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  53: 'Thriller', 10752: 'War', 37: 'Western', 10759: 'Action & Adventure',
  10765: 'Sci-Fi & Fantasy', 10764: 'Reality',
};

function SharpPosterRow({ title, items = [], onCardClick, inLib, onAdd, actionButton }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const amount = direction === 'left' ? -760 : 760;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(checkScroll, 250);
  };

  const displayItems = (items || []).slice(0, 15);
  if (displayItems.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: 900,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#FFFFFF',
          margin: 0
        }}>
          {title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {actionButton}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#141414',
              border: '1px solid #242424',
              color: canScrollLeft ? '#FFFFFF' : '#444444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canScrollLeft ? 'pointer' : 'default',
              transition: 'all 0.15s',
              fontSize: '16px',
              lineHeight: 1
            }}
          >
            ‹
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#141414',
              border: '1px solid #242424',
              color: canScrollRight ? '#FFFFFF' : '#444444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canScrollRight ? 'pointer' : 'default',
              transition: 'all 0.15s',
              fontSize: '16px',
              lineHeight: 1
            }}
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {displayItems.map((movie) => {
          const year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
          const isSaved = inLib ? inLib(movie.id) : false;

          return (
            <div
              key={movie.id}
              onClick={() => onCardClick(movie, movie.media_type || (movie.first_air_date || movie.name ? 'tv' : 'movie'))}
              style={{
                width: '180px',
                flexShrink: 0,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                triggerBackdropHover(movie.backdrop_path);
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                triggerBackdropHover(null);
              }}
            >
              {/* Poster Container - 100% Clean Cinema Artwork */}
              <div style={{
                width: '180px',
                aspectRatio: '2/3',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#141414',
                border: '1px solid #242424',
                position: 'relative'
              }}>
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                    alt={movie.title || movie.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', background: '#181818' }}>🎬</div>
                )}

                {/* Media Type Badge: highlight TV series clearly */}
                {(movie.media_type === 'tv' || Boolean(movie.first_air_date) || Boolean(movie.name && !movie.title)) && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(10, 10, 14, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(59, 130, 246, 0.45)',
                    color: '#60A5FA',
                    fontSize: '9px',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                    pointerEvents: 'none',
                    zIndex: 2
                  }}>
                    TV Series
                  </div>
                )}

                {/* Subtle Add Quick Button on hover corner */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSaved && onAdd) {
                      onAdd(movie, movie.media_type || (movie.first_air_date || movie.name ? 'tv' : 'movie'));
                    }
                  }}
                  title={isSaved ? 'In Library' : 'Add to Library'}
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: isSaved ? '#10b981' : 'rgba(0,0,0,0.75)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isSaved ? 'default' : 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => {
                    if (!isSaved) e.currentTarget.style.background = 'var(--accent)';
                  }}
                  onMouseLeave={e => {
                    if (!isSaved) e.currentTarget.style.background = 'rgba(0,0,0,0.75)';
                  }}
                >
                  {isSaved ? <Check size={13} strokeWidth={3} /> : <Plus size={13} strokeWidth={3} />}
                </button>
              </div>

              {/* Title & Release Year / Rating */}
              <div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.3
                }}>
                  {movie.title || movie.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#777777',
                  marginTop: '2px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>{year || '2024'}</span>
                  {movie.vote_average > 0 && (
                    <span style={{ color: '#888888', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      · ★ {movie.vote_average.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ExploreTab({ onAddMovie, library = [], onMovieClick }) {
  const [addedNotif, setAddedNotif] = useState(null);

  // Discover rows
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [hiddenGems, setHiddenGems] = useState([]);
  const [roulettePicks, setRoulettePicks] = useState([]);
  const [isShufflingRoulette, setIsShufflingRoulette] = useState(false);
  const [isDiscoverLoading, setIsDiscoverLoading] = useState(true);

  const inLib = (tmdbId) => library.some(x => String(x.tmdb_id) === String(tmdbId));

  const handleExploreCardClick = (item, type) => {
    if (!onMovieClick) return;
    const mediaType = type || item.media_type || (item.first_air_date || item.name ? 'tv' : 'movie');
    onMovieClick(item.id || item.tmdb_id, mediaType);
  };

  useEffect(() => {
    const p = new URLSearchParams({ api_key: TMDB_KEY, language: 'en-US' });
    const randomPage = Math.floor(Math.random() * 6) + 1;
    Promise.all([
      fetch(`https://api.themoviedb.org/3/trending/movie/week?${p}`).then(r => r.json()),
      fetch(`https://api.themoviedb.org/3/movie/top_rated?${p}`).then(r => r.json()),
      fetch(`https://api.themoviedb.org/3/movie/upcoming?${p}`).then(r => r.json()),
      fetch(`https://api.themoviedb.org/3/trending/tv/week?${p}`).then(r => r.json()),
      fetch(`https://api.themoviedb.org/3/movie/now_playing?${p}`).then(r => r.json()),
      fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&language=en-US&sort_by=vote_average.desc&vote_count.gte=350&vote_count.lte=3500&vote_average.gte=7.8&page=1`).then(r => r.json()),
      fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&language=en-US&sort_by=popularity.desc&vote_average.gte=7.3&vote_count.gte=200&page=${randomPage}`).then(r => r.json()),
    ]).then(([t, tr, u, tv, np, hg, rp]) => {
      setTrending(t.results || []);
      setTopRated(tr.results || []);
      setUpcoming(u.results || []);
      setTrendingTV(tv.results || []);
      setNowPlaying(np.results || []);
      setHiddenGems(hg.results || []);
      setRoulettePicks(rp.results || []);
      setIsDiscoverLoading(false);
    }).catch(() => setIsDiscoverLoading(false));
  }, []);

  // Genre filtering state
  const [activeGenreFilter, setActiveGenreFilter] = useState('all');
  const [genreMovies, setGenreMovies] = useState([]);
  const [isGenreLoading, setIsGenreLoading] = useState(false);

  const GENRE_BAR = [
    { id: 'all', label: 'All Cinema' },
    { id: 878, label: 'Sci-Fi' },
    { id: 28, label: 'Action' },
    { id: 53, label: 'Thriller' },
    { id: 27, label: 'Horror' },
    { id: 18, label: 'Drama' },
    { id: 16, label: 'Animation' },
    { id: 35, label: 'Comedy' },
    { id: 80, label: 'Crime' },
    { id: 14, label: 'Fantasy' },
  ];

  const handleSelectGenre = (genreId) => {
    setActiveGenreFilter(genreId);
    if (genreId === 'all') {
      setGenreMovies([]);
      return;
    }
    setIsGenreLoading(true);
    fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${genreId}&vote_count.gte=150&page=1`)
      .then(r => r.json())
      .then(d => {
        setGenreMovies(d.results || []);
        setIsGenreLoading(false);
      })
      .catch(() => setIsGenreLoading(false));
  };

  const handleShuffleRoulette = () => {
    setIsShufflingRoulette(true);
    const randomPage = Math.floor(Math.random() * 8) + 1;
    fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&language=en-US&sort_by=popularity.desc&vote_average.gte=7.2&vote_count.gte=150&page=${randomPage}`)
      .then(r => r.json())
      .then(d => {
        if (d.results && d.results.length > 0) {
          const shuffled = [...d.results].sort(() => 0.5 - Math.random());
          setRoulettePicks(shuffled);
        }
        setIsShufflingRoulette(false);
      })
      .catch(() => setIsShufflingRoulette(false));
  };

  const quickAdd = (item, type = 'movie') => {
    const isTv = type === 'tv' ||
                 item.media_type === 'tv' ||
                 item.number_of_seasons !== undefined ||
                 item.first_air_date !== undefined;
    const finalType = isTv ? 'tv' : (item.media_type || type || 'movie');
    const entry = {
      id: crypto.randomUUID(),
      tmdb_id: item.id,
      media_type: finalType,
      title: item.title || item.name || 'Unknown',
      poster_path: item.poster_path || null,
      backdrop_path: item.backdrop_path || null,
      overview: item.overview || '',
      release_year: (item.release_date || item.first_air_date || '').slice(0, 4),
      genres: (item.genre_ids || []).map(id => GENRE_MAP[id]).filter(Boolean),
      tmdb_score: Math.round((item.vote_average || 0) * 10) / 10,
      status: 'plan_to_watch',
      rating: null, review: '', favorite: false,
      date_added: new Date().toISOString(), tags: [], rewatched: 0
    };
    onAddMovie(entry);
    setAddedNotif(`"${entry.title}" added to library!`);
    setTimeout(() => setAddedNotif(''), 3000);
  };

  // Dynamic Hero Carousel of New In-Cinema & Trending Releases
  const heroMovies = useMemo(() => {
    const pool = [...(nowPlaying || []), ...(trending || [])];
    const seen = new Set();
    const list = [];
    for (const m of pool) {
      if (m && m.id && m.backdrop_path && m.title && m.overview && !seen.has(m.id)) {
        seen.add(m.id);
        list.push(m);
        if (list.length >= 7) break;
      }
    }
    if (list.length === 0) {
      list.push({
        id: 693134,
        title: 'Dune: Part Two',
        backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s520bvw.jpg',
        poster_path: '/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
        overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while seeking vengeance against the conspirators who destroyed his family, facing a choice between the love of his life and the fate of the known universe.',
        release_date: '2024-03-01',
        vote_average: 8.2,
        genre_ids: [878, 12]
      });
    }
    return list;
  }, [nowPlaying, trending]);

  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  useEffect(() => {
    if (heroMovies.length <= 1 || isHeroPaused) return;
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroMovies.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [heroMovies.length, isHeroPaused]);

  const currentHero = heroMovies[heroIndex % heroMovies.length] || heroMovies[0];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Added notification toast */}
      {addedNotif && (
        <div className="toast" style={{ bottom: '80px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', fontWeight: 600 }}>{addedNotif}</span>
        </div>
      )}

      {/* ── DYNAMIC NEW RELEASES HERO CAROUSEL ── */}
      <div
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
        style={{
          background: '#121212',
          border: '1px solid #242424',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          height: '380px',
          minHeight: '380px',
          maxHeight: '380px',
          boxSizing: 'border-box',
          boxShadow: '0 16px 40px rgba(0,0,0,0.7)'
        }}
      >
        {/* Left: High-Res Movie Backdrop with cinematic gradient overlay */}
        <div style={{
          width: '52%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <img
            key={currentHero.id}
            src={`https://image.tmdb.org/t/p/w1280${currentHero.backdrop_path}`}
            alt={currentHero.title || currentHero.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              transition: 'opacity 0.4s ease'
            }}
            onError={(e) => { e.currentTarget.src = '/dune_artwork_sharp.jpg'; }}
          />
          {/* Smooth fade overlay into right side */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(18,18,18,0.15) 0%, transparent 45%, rgba(18,18,18,0.75) 80%, #121212 100%)'
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.6) 100%)'
          }} />
        </div>

        {/* Right: Movie Info, Controls & Actions */}
        <div style={{
          flex: 1,
          height: '100%',
          boxSizing: 'border-box',
          padding: '28px 36px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#121212',
          zIndex: 2,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Badge & Carousel Controls Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{
              background: 'var(--accent)',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 900,
              letterSpacing: '0.08em',
              padding: '3px 9px',
              borderRadius: '4px',
              textTransform: 'uppercase'
            }}>
              NEW IN CINEMAS & TRENDING
            </span>

            {/* Prev / Next arrows */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setHeroIndex(prev => (prev - 1 + heroMovies.length) % heroMovies.length)}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #303030',
                  color: '#FFFFFF',
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                title="Previous film"
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = '#252525'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#303030'; e.currentTarget.style.background = '#1a1a1a'; }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '11px', color: '#888888', fontWeight: 800, padding: '0 4px', fontFamily: 'monospace' }}>
                {heroIndex + 1}/{heroMovies.length}
              </span>
              <button
                onClick={() => setHeroIndex(prev => (prev + 1) % heroMovies.length)}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #303030',
                  color: '#FFFFFF',
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                title="Next film"
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = '#252525'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#303030'; e.currentTarget.style.background = '#1a1a1a'; }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Movie Title */}
          <h1 style={{
            fontSize: '26px',
            fontWeight: 900,
            letterSpacing: '-0.5px',
            color: '#FFFFFF',
            margin: '0 0 8px 0',
            textTransform: 'uppercase',
            lineHeight: 1.15,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '60px',
            maxHeight: '60px'
          }}>
            {currentHero.title || currentHero.name}
          </h1>

          {/* Rating & Metadata */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13px',
            color: '#9E9E9E',
            marginBottom: '10px',
            fontWeight: 600
          }}>
            {currentHero.vote_average > 0 && (
              <span style={{ color: '#FFB800', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '3px' }}>
                ★ {(currentHero.vote_average).toFixed(1)}
              </span>
            )}
            <span>
              {(currentHero.release_date || currentHero.first_air_date || '').slice(0, 4)}
              {(currentHero.genre_ids || []).length > 0 && ` · ${(currentHero.genre_ids || []).map(g => GENRE_MAP[g]).filter(Boolean).slice(0, 2).join(' · ')}`}
            </span>
          </div>

          {/* Overview text */}
          <p style={{
            fontSize: '13px',
            color: '#A0A0A0',
            lineHeight: 1.6,
            margin: '0 0 16px 0',
            maxWidth: '520px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: '62px'
          }}>
            {currentHero.overview}
          </p>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <button
              onClick={() => quickAdd(currentHero, currentHero.media_type || (currentHero.first_air_date || currentHero.name ? 'tv' : 'movie'))}
              style={{
                background: inLib(currentHero.id) ? '#10b981' : 'var(--accent)',
                border: 'none',
                color: '#FFFFFF',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.15s, opacity 0.15s',
                boxShadow: '0 4px 14px rgba(229,9,20,0.35)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              {inLib(currentHero.id) ? <Check size={15} strokeWidth={3} /> : <Plus size={15} strokeWidth={3} />}
              {inLib(currentHero.id) ? 'In Library' : 'Add to Library'}
            </button>

            <button
              onClick={() => onMovieClick(currentHero.id, currentHero.media_type || (currentHero.first_air_date || currentHero.name ? 'tv' : 'movie'))}
              style={{
                background: '#1A1A1A',
                border: '1px solid #333333',
                color: '#FFFFFF',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#555555'; e.currentTarget.style.background = '#222222'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#333333'; e.currentTarget.style.background = '#1A1A1A'; }}
            >
              <Star size={14} color="#FFB800" />
              Log / Rate
            </button>
          </div>

          {/* Slide Indicator Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {heroMovies.map((m, idx) => (
              <button
                key={m.id || idx}
                onClick={() => setHeroIndex(idx)}
                style={{
                  height: '4px',
                  width: idx === heroIndex ? '28px' : '8px',
                  borderRadius: '2px',
                  background: idx === heroIndex ? 'var(--accent)' : '#2e2e2e',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
                title={m.title}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── TRENDING THIS WEEK SHELF ── */}
      <SharpPosterRow
        title="Trending This Week"
        items={trending}
        onCardClick={handleExploreCardClick}
        inLib={inLib}
        onAdd={quickAdd}
      />

      {/* ── IN CINEMAS NOW SHELF ── */}
      <SharpPosterRow
        title="In Cinemas Now"
        items={nowPlaying}
        onCardClick={handleExploreCardClick}
        inLib={inLib}
        onAdd={quickAdd}
      />

      {/* ── GENRE DISCOVERY PILLS ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#777777' }}>
            Filter by Genre
          </span>
          {activeGenreFilter !== 'all' && (
            <button
              onClick={() => handleSelectGenre('all')}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              Reset to all
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {GENRE_BAR.map(g => {
            const isSelected = activeGenreFilter === g.id;
            return (
              <button
                key={g.id}
                onClick={() => handleSelectGenre(g.id)}
                style={{
                  background: isSelected ? 'var(--accent)' : '#141414',
                  border: `1px solid ${isSelected ? 'var(--accent)' : '#242424'}`,
                  color: isSelected ? '#FFFFFF' : '#AAAAAA',
                  padding: '7px 16px',
                  borderRadius: '20px',
                  fontSize: '12.5px',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#444444';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#242424';
                    e.currentTarget.style.color = '#AAAAAA';
                  }
                }}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SELECTED GENRE SPOTLIGHT ── */}
      {activeGenreFilter !== 'all' && genreMovies.length > 0 && (
        <SharpPosterRow
          title={`${GENRE_MAP[activeGenreFilter] || 'Genre'} Masterpieces`}
          items={genreMovies}
          onCardClick={handleExploreCardClick}
          inLib={inLib}
          onAdd={quickAdd}
        />
      )}

      {/* ── TOP RATED CLASSICS SHELF ── */}
      <SharpPosterRow
        title="Top Rated Classics"
        items={topRated}
        onCardClick={handleExploreCardClick}
        inLib={inLib}
        onAdd={quickAdd}
      />

      {/* ── COMING SOON TO THEATERS SHELF ── */}
      <SharpPosterRow
        title="Coming Soon to Theaters"
        items={upcoming}
        onCardClick={handleExploreCardClick}
        inLib={inLib}
        onAdd={quickAdd}
      />

      {/* ── TRENDING SERIES & SHOWS SHELF ── */}
      <SharpPosterRow
        title="Trending Series & Shows"
        items={trendingTV}
        onCardClick={handleExploreCardClick}
        inLib={inLib}
        onAdd={quickAdd}
      />

      {/* ── HIDDEN GEMS & CULT FAVORITES SHELF ── */}
      <SharpPosterRow
        title="Hidden Gems & Cult Favorites"
        items={hiddenGems}
        onCardClick={handleExploreCardClick}
        inLib={inLib}
        onAdd={quickAdd}
      />

      {/* ── CINEROULETTE RANDOM SURPRISE PICKS SHELF ── */}
      <SharpPosterRow
        title="CineRoulette Surprise Vault"
        items={roulettePicks}
        onCardClick={handleExploreCardClick}
        inLib={inLib}
        onAdd={quickAdd}
        actionButton={
          <button
            onClick={handleShuffleRoulette}
            disabled={isShufflingRoulette}
            style={{
              background: '#181818',
              border: '1px solid #303030',
              color: '#FFFFFF',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: isShufflingRoulette ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              if (!isShufflingRoulette) {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.background = '#222222';
              }
            }}
            onMouseLeave={e => {
              if (!isShufflingRoulette) {
                e.currentTarget.style.borderColor = '#303030';
                e.currentTarget.style.background = '#181818';
              }
            }}
          >
            <Shuffle size={12} className={isShufflingRoulette ? 'animate-spin' : ''} />
            {isShufflingRoulette ? 'Shuffling...' : 'Reshuffle'}
          </button>
        }
      />

      {/* ── CLEAN CINEMA FOOTER ── */}
      <div style={{
        marginTop: '20px',
        padding: '32px 0 24px',
        borderTop: '1px solid #1c1c1c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '18px',
            height: '18px',
            background: 'var(--accent)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '11px',
            color: '#FFFFFF'
          }}>
            C
          </div>
          <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '-0.2px', color: '#FFFFFF' }}>
            CINELOG
          </span>
          <span style={{ fontSize: '12px', color: '#555555' }}>
            · Continuous Cinema Discovery & Archiving
          </span>
        </div>
        <div style={{ fontSize: '11px', color: '#555555', fontWeight: 600 }}>
          Powered by live TMDb cinema catalog · All posters rendered in razor-sharp 180px format
        </div>
      </div>

    </div>
  );
}
