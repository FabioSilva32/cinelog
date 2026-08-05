import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Flame, TrendingUp, Star, Clock, Compass, User, Plus, Check, Film, Tv, Zap, X, BarChart3, Award, Shuffle } from 'lucide-react';
import { triggerBackdropHover } from '../utils/backdrop';

const TMDB_KEY = '6a2fd6b9b1bb3befbb9f14c203732225';

const GENRE_MAP = {
  28:'Action', 12:'Adventure', 16:'Animation', 35:'Comedy', 80:'Crime',
  99:'Documentary', 18:'Drama', 10751:'Family', 14:'Fantasy', 36:'History',
  27:'Horror', 10402:'Music', 9648:'Mystery', 10749:'Romance', 878:'Sci-Fi',
  53:'Thriller', 10752:'War', 37:'Western', 10759:'Action & Adventure',
  10765:'Sci-Fi & Fantasy', 10764:'Reality',
};

function getRatingColor(r) {
  const n = Number(r);
  if (n >= 8) return '#10b981';
  if (n >= 6.5) return '#fbbf24';
  return '#f97316';
}

function ExploreCard({ item, type, saved, onAdd, onClick }) {
  const [hover, setHover] = useState(false);
  const mediaType = type === 'tv' ? 'Series' : type === 'anime' ? 'Anime' : 'Movie';
  const badge = {
    movie: { bg: 'rgba(124,111,247,0.85)', label: 'Movie' },
    tv: { bg: 'rgba(59,130,246,0.85)', label: 'Series' },
    anime: { bg: 'rgba(249,115,22,0.85)', label: 'Anime' },
  }[type] || { bg: 'rgba(124,111,247,0.85)', label: 'Movie' };

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer',
        background: 'var(--surface-solid)', border: `1px solid ${hover ? 'rgba(124,111,247,0.35)' : 'var(--border)'}`,
        transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s, border-color 0.2s',
        transform: hover ? 'translateY(-5px) scale(1.01)' : 'none',
        boxShadow: hover ? '0 16px 40px rgba(0,0,0,0.55)' : 'none',
      }}
      onMouseEnter={() => { setHover(true); triggerBackdropHover(item.backdrop_path); }}
      onMouseLeave={() => { setHover(false); triggerBackdropHover(null); }}
    >
      <div style={{ aspectRatio: '2/3', position: 'relative', overflow: 'hidden' }}>
        {item.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
            alt={item.title || item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hover ? 'scale(1.06)' : 'scale(1)' }}
            loading="lazy"
          />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', background: 'var(--surface)' }}>🎬</div>
        )}

        {/* Rating badge */}
        <div style={{ position: 'absolute', top: '7px', right: '7px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', padding: '3px 7px', borderRadius: '6px', fontSize: '11px', fontWeight: 900, color: item.vote_average ? getRatingColor(item.vote_average) : 'var(--text-dim)' }}>
          ★ {item.vote_average ? item.vote_average.toFixed(1) : '—'}
        </div>

        {/* Type badge */}
        <div style={{ position: 'absolute', top: '7px', left: '7px', background: badge.bg, backdropFilter: 'blur(4px)', padding: '2px 7px', borderRadius: '4px', fontSize: '9px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {badge.label}
        </div>

        {/* Hover overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)', opacity: hover ? 1 : 0, transition: 'opacity 0.22s', display: 'flex', alignItems: 'flex-end', padding: '10px' }}>
          <div style={{ width: '100%' }}>
            <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.75)', marginBottom: '7px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>
              {item.overview}
            </div>
            <button
              onClick={e => { e.stopPropagation(); !saved && onAdd(item, type); }}
              style={{
                width: '100%', background: saved ? 'rgba(16,185,129,0.9)' : 'var(--accent)', border: 'none', color: '#fff',
                borderRadius: '7px', padding: '7px', fontSize: '11px', fontWeight: 800, cursor: saved ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', backdropFilter: 'blur(4px)',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => !saved && (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={e => (e.currentTarget.style.transform = '')}
            >
              {saved ? <><Check size={11} /> In Library</> : <><Plus size={11} /> Add to Library</>}
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '9px 10px' }}>
        <div style={{ fontSize: '12px', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title || item.name}</div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {(item.release_date || item.first_air_date || '').slice(0, 4)}
          {(item.genre_ids || []).length > 0 && ` · ${GENRE_MAP[item.genre_ids[0]] || ''}`}
        </div>
      </div>
    </div>
  );
}

function HorizontalRow({ title, icon: Icon, iconColor, items, type, inLib, onAdd, onViewAll, onCardClick }) {
  const filteredItems = (items || []).filter(item => !inLib(item.id)).slice(0, 8);

  if (filteredItems.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon size={18} color={iconColor || 'var(--accent)'} />
        <h3 style={{ fontSize: '17px', fontWeight: 800 }}>{title}</h3>
        {onViewAll && (
          <button onClick={onViewAll} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            View all →
          </button>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
        {filteredItems.map(item => (
          <ExploreCard key={item.id} item={item} type={type || item.media_type || 'movie'} saved={inLib(item.id)} onAdd={onAdd} onClick={() => onCardClick(item, type || item.media_type || 'movie')} />
        ))}
      </div>
    </div>
  );
}

const NAV_TABS = [
  { id: 'discover', label: 'Discover', icon: Flame },
  { id: 'smart', label: 'Smart Finder', icon: Zap },
  { id: 'people', label: 'By Person', icon: User },
  { id: 'search', label: 'Search', icon: Search },
];

export default function ExploreTab({ onAddMovie, library = [], onMovieClick }) {
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('movie');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedNotif, setAddedNotif] = useState(null);

  // Search History stored in localStorage
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cinelog_search_history') || '[]');
    } catch { return []; }
  });

  const saveSearchHistory = (term) => {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    setSearchHistory(prev => {
      const filtered = prev.filter(t => t.toLowerCase() !== clean.toLowerCase());
      const next = [clean, ...filtered].slice(0, 6);
      localStorage.setItem('cinelog_search_history', JSON.stringify(next));
      return next;
    });
  };

  // Smart Finder
  const [recType, setRecType] = useState('movie');
  const [recGenre, setRecGenre] = useState('');
  const [recMood, setRecMood] = useState('');
  const [recDecade, setRecDecade] = useState('');
  const [recResults, setRecResults] = useState([]);
  const [isRecsLoading, setIsRecsLoading] = useState(false);

  // People
  const [peopleQuery, setPeopleQuery] = useState('');

  const handleExploreCardClick = (item, type) => {
    if (!onMovieClick) return;
    const mediaType = type || item.media_type || 'movie';
    onMovieClick(item.id || item.tmdb_id, mediaType);
  };
  const [peopleInfo, setPeopleInfo] = useState(null);
  const [peopleResults, setPeopleResults] = useState([]);
  const [isPeopleLoading, setIsPeopleLoading] = useState(false);

  // Discover rows
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [isDiscoverLoading, setIsDiscoverLoading] = useState(true);

  const searchRef = useRef(null);

  const inLib = (tmdbId) => library.some(x => String(x.tmdb_id) === String(tmdbId));

  const filteredRecs = useMemo(() => {
    return recResults.filter(item => !inLib(item.id)).slice(0, 12);
  }, [recResults, library]);

  useEffect(() => {
    const p = new URLSearchParams({ api_key: TMDB_KEY, language: 'en-US' });
    Promise.all([
      fetch(`https://api.themoviedb.org/3/trending/movie/week?${p}`).then(r => r.json()),
      fetch(`https://api.themoviedb.org/3/movie/top_rated?${p}`).then(r => r.json()),
      fetch(`https://api.themoviedb.org/3/movie/upcoming?${p}`).then(r => r.json()),
      fetch(`https://api.themoviedb.org/3/trending/tv/week?${p}`).then(r => r.json()),
      fetch(`https://api.themoviedb.org/3/movie/now_playing?${p}`).then(r => r.json()),
    ]).then(([t, tr, u, tv, np]) => {
      setTrending(t.results || []);
      setTopRated(tr.results || []);
      setUpcoming(u.results || []);
      setTrendingTV(tv.results || []);
      setNowPlaying(np.results || []);
      setIsDiscoverLoading(false);
    }).catch(() => setIsDiscoverLoading(false));
  }, []);

  const handleSearch = (queryOverride, typeOverride) => {
    const q = queryOverride ?? searchQuery;
    const t = typeOverride ?? searchType;
    if (!q.trim()) return;
    saveSearchHistory(q);
    setIsSearching(true);
    const p = new URLSearchParams({ api_key: TMDB_KEY, language: 'en-US', query: q, include_adult: 'false' });
    const endpoint = t === 'movie' ? 'search/movie' : t === 'tv' ? 'search/tv' : 'search/multi';
    fetch(`https://api.themoviedb.org/3/${endpoint}?${p}`)
      .then(r => r.json())
      .then(d => {
        const results = (d.results || []).filter(x => !x.media_type || x.media_type === 'movie' || x.media_type === 'tv');
        setSearchResults(results);
        setIsSearching(false);
        setActiveTab('search');
      })
      .catch(() => setIsSearching(false));
  };

  // View All: use discover endpoint for a category and show results
  const viewAllCategory = (endpoint, type, label) => {
    setIsSearching(true);
    setActiveTab('search');
    setSearchQuery(label);
    const p = new URLSearchParams({ api_key: TMDB_KEY, language: 'en-US', page: 1 });
    fetch(`https://api.themoviedb.org/3/${endpoint}?${p}`)
      .then(r => r.json())
      .then(d => {
        setSearchResults((d.results || []).map(x => ({ ...x, media_type: x.media_type || type })));
        setIsSearching(false);
      })
      .catch(() => setIsSearching(false));
  };

  const handleSmartRecs = () => {
    setIsRecsLoading(true);
    const endpoint = recType === 'movie' ? 'discover/movie' : 'discover/tv';
    const params = new URLSearchParams({ api_key: TMDB_KEY, language: 'en-US', include_adult: 'false' });
    if (recGenre) params.set('with_genres', recGenre);
    if (recMood === 'popular') params.set('sort_by', 'popularity.desc');
    else if (recMood === 'top_rated') { params.set('sort_by', 'vote_average.desc'); params.set('vote_count.gte', '500'); }
    else if (recMood === 'hidden') { params.set('sort_by', 'vote_average.desc'); params.set('vote_count.gte', '50'); params.set('vote_count.lte', '800'); params.set('vote_average.gte', '7'); }
    else if (recMood === 'new') params.set('sort_by', 'release_date.desc');
    if (recDecade) {
      const end = String(parseInt(recDecade) + 9);
      if (recType === 'movie') { params.set('primary_release_date.gte', `${recDecade}-01-01`); params.set('primary_release_date.lte', `${end}-12-31`); }
      else { params.set('first_air_date.gte', `${recDecade}-01-01`); params.set('first_air_date.lte', `${end}-12-31`); }
    }
    params.set('page', Math.floor(Math.random() * 5) + 1);
    fetch(`https://api.themoviedb.org/3/${endpoint}?${params}`)
      .then(r => r.json())
      .then(d => { setRecResults(d.results || []); setIsRecsLoading(false); })
      .catch(() => setIsRecsLoading(false));
  };

  const handlePeopleSearch = () => {
    if (!peopleQuery.trim()) return;
    setIsPeopleLoading(true);
    const p = new URLSearchParams({ api_key: TMDB_KEY, language: 'en-US', query: peopleQuery });
    fetch(`https://api.themoviedb.org/3/search/person?${p}`)
      .then(r => r.json())
      .then(d => {
        const person = d.results?.[0];
        if (person) {
          setPeopleInfo(person);
          fetch(`https://api.themoviedb.org/3/person/${person.id}/combined_credits?api_key=${TMDB_KEY}`)
            .then(r => r.json())
            .then(c => {
              setPeopleResults(c.cast?.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 16) || []);
              setIsPeopleLoading(false);
            });
        } else { setPeopleResults([]); setIsPeopleLoading(false); }
      })
      .catch(() => setIsPeopleLoading(false));
  };

  const quickAdd = (item, type = 'movie') => {
    const entry = {
      id: crypto.randomUUID(),
      tmdb_id: item.id,
      media_type: type,
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

  const LoadingSkeleton = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
      {[...Array(8)].map((_, i) => (
        <div key={i}>
          <div className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 'var(--radius)' }} />
          <div className="skeleton" style={{ height: '12px', marginTop: '8px', borderRadius: '4px', width: '80%' }} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Added notification toast */}
      {addedNotif && (
        <div className="toast" style={{ bottom: '80px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', fontWeight: 600 }}>{addedNotif}</span>
        </div>
      )}

      {/* ── TOP SEARCH BAR ── */}
      <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search movies, TV series, actors, directors…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="form-input"
              style={{ width: '100%', paddingLeft: '40px', height: '44px', fontSize: '14px' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            )}
          </div>
          <select
            value={searchType}
            onChange={e => setSearchType(e.target.value)}
            className="form-input"
            style={{ height: '44px', padding: '0 12px', fontSize: '13px', background: 'var(--surface-solid)', color: 'var(--text)' }}
          >
            <option value="multi">All Types</option>
            <option value="movie">Movies</option>
            <option value="tv">Series</option>
          </select>
          <button className="btn btn-primary" onClick={() => handleSearch()} style={{ height: '44px', padding: '0 20px', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {isSearching ? (
              <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            ) : <><Search size={14} /> Search</>}
          </button>
        </div>

        {/* Search history chips */}
        {searchHistory.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-dim)', fontWeight: 700 }}>Recent:</span>
            {searchHistory.map(term => (
              <button
                key={term}
                onClick={() => { setSearchQuery(term); handleSearch(term); }}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                  borderRadius: '12px', padding: '2px 10px', fontSize: '11px', color: 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                {term}
              </button>
            ))}
            <button
              onClick={() => { setSearchHistory([]); localStorage.removeItem('cinelog_search_history'); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '10px', marginLeft: 'auto' }}
            >
              Clear history
            </button>
          </div>
        )}
      </div>

      {/* ── SUB-NAV TABS ── */}
      <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '4px', width: 'fit-content' }}>
        {NAV_TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ background: activeTab === t.id ? 'var(--accent)' : 'transparent', color: activeTab === t.id ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '8px', padding: '7px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', boxShadow: activeTab === t.id ? '0 4px 12px var(--accent-glow)' : 'none' }}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ── DISCOVER ── */}
      {activeTab === 'discover' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          {isDiscoverLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="skeleton" style={{ height: '22px', width: '200px', borderRadius: '6px', marginBottom: '14px' }} />
                  <LoadingSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <>
              <HorizontalRow title="Trending This Week" icon={Flame} iconColor="var(--red)" items={trending} type="movie" inLib={inLib} onAdd={quickAdd} onCardClick={handleExploreCardClick} onViewAll={() => viewAllCategory('trending/movie/week', 'movie', 'Trending Movies')} />
              <HorizontalRow title="In Cinemas Now" icon={Film} iconColor="var(--accent)" items={nowPlaying} type="movie" inLib={inLib} onAdd={quickAdd} onCardClick={handleExploreCardClick} onViewAll={() => viewAllCategory('movie/now_playing', 'movie', 'Now Playing')} />
              <HorizontalRow title="All-Time Classics" icon={Star} iconColor="var(--gold)" items={topRated} type="movie" inLib={inLib} onAdd={quickAdd} onCardClick={handleExploreCardClick} onViewAll={() => viewAllCategory('movie/top_rated', 'movie', 'Top Rated Movies')} />
              <HorizontalRow title="Coming Soon" icon={Clock} iconColor="var(--blue)" items={upcoming} type="movie" inLib={inLib} onAdd={quickAdd} onCardClick={handleExploreCardClick} onViewAll={() => viewAllCategory('movie/upcoming', 'movie', 'Coming Soon')} />
              <HorizontalRow title="Trending Series" icon={Tv} iconColor="var(--blue)" items={trendingTV} type="tv" inLib={inLib} onAdd={quickAdd} onCardClick={handleExploreCardClick} onViewAll={() => viewAllCategory('trending/tv/week', 'tv', 'Trending Series')} />
            </>
          )}
        </div>
      )}

      {/* ── SEARCH RESULTS ── */}
      {activeTab === 'search' && (
        <div>
          {searchResults.length > 0 ? (
            <>
              <div style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={14} />
                Found <strong style={{ color: 'var(--text)' }}>{searchResults.length}</strong> results for
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>"{searchQuery}"</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '14px' }}>
                {searchResults.map(item => (
                  <ExploreCard key={item.id} item={item} type={item.media_type || 'movie'} saved={inLib(item.id)} onAdd={quickAdd} onClick={() => handleExploreCardClick(item, item.media_type || 'movie')} />
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '52px', marginBottom: '14px', opacity: 0.4 }}>🔍</div>
              <div style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px', color: 'var(--text)' }}>Start Searching</div>
              <div style={{ fontSize: '14px' }}>Use the search bar above to find movies, series or anime</div>
            </div>
          )}
        </div>
      )}

      {/* ── SMART FINDER ── */}
      {activeTab === 'smart' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '28px', background: 'rgba(124,111,247,0.04)', border: '1px solid rgba(124,111,247,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="#fff" />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Smart Movie Finder</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '1px' }}>Mix filters to discover your perfect next watch</p>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--border)', margin: '20px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Content Type', val: recType, setter: setRecType, opts: [['movie','🎬 Movie'],['tv','📺 TV Series']] },
                { label: 'Genre', val: recGenre, setter: setRecGenre, opts: [['','Any Genre'],['28','Action'],['35','Comedy'],['18','Drama'],['27','Horror'],['878','Sci-Fi'],['10749','Romance'],['53','Thriller'],['16','Animation'],['99','Documentary'],['80','Crime'],['14','Fantasy'],['9648','Mystery']] },
                { label: 'Mood', val: recMood, setter: setRecMood, opts: [['','Any'],['popular','🔥 Trending'],['top_rated','⭐ Acclaimed'],['hidden','💎 Hidden Gems'],['new','🆕 Latest Releases']] },
                { label: 'Era / Decade', val: recDecade, setter: setRecDecade, opts: [['','Any Era'],['2020','2020s'],['2010','2010s'],['2000','2000s'],['1990','1990s'],['1980','1980s'],['1970','1970s'],['1960','1960s']] },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>{f.label}</div>
                  <select value={f.val} onChange={e => f.setter(e.target.value)} className="form-input"
                    style={{ width: '100%', background: 'var(--surface-solid)', color: 'var(--text)', fontSize: '12.5px' }}>
                    {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <button className="btn btn-primary" onClick={handleSmartRecs} style={{ width: '100%', height: '46px', fontSize: '14.5px', gap: '8px' }}>
              {isRecsLoading ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Finding Matches…
                </>
              ) : (
                <><Shuffle size={16} /> Generate Recommendations</>
              )}
            </button>
          </div>

          {filteredRecs.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Showing <strong style={{ color: 'var(--text)' }}>{filteredRecs.length}</strong> matches
                </div>
                <button className="btn btn-ghost" onClick={handleSmartRecs} style={{ fontSize: '12px', padding: '5px 12px' }}>
                  <Shuffle size={13} /> Refresh
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                {filteredRecs.map(item => (
                  <ExploreCard key={item.id} item={item} type={recType} saved={inLib(item.id)} onAdd={quickAdd} onClick={() => handleExploreCardClick(item, recType)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PEOPLE ── */}
      {activeTab === 'people' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} color="#fff" />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Filmmaker Deep Dive</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '1px' }}>Explore any actor or director's complete filmography</p>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--border)', margin: '18px 0' }} />

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <User size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" placeholder="e.g. Christopher Nolan, Scarlett Johansson…"
                  value={peopleQuery} onChange={e => setPeopleQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePeopleSearch()}
                  className="form-input" style={{ width: '100%', height: '44px', paddingLeft: '40px', fontSize: '13.5px' }} />
              </div>
              <button className="btn btn-primary" onClick={handlePeopleSearch} style={{ height: '44px', padding: '0 20px', flexShrink: 0 }}>
                {isPeopleLoading ? (
                  <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                ) : 'Search'}
              </button>
            </div>
          </div>

          {peopleInfo && (
            <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '18px', display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid var(--accent)', boxShadow: '0 0 16px var(--accent-glow)' }}>
                {peopleInfo.profile_path ? (
                  <img src={`https://image.tmdb.org/t/p/w185${peopleInfo.profile_path}`} alt={peopleInfo.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>👤</div>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '18px', letterSpacing: '-0.3px' }}>{peopleInfo.name}</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                  {peopleInfo.known_for_department}
                  {peopleInfo.birthday && ` · Born ${peopleInfo.birthday}`}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '2px' }}>
                  {peopleResults.length} credits shown
                </div>
              </div>
            </div>
          )}

          {peopleResults.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
              {peopleResults.map(item => (
                <ExploreCard key={item.id} item={item} type={item.media_type || 'movie'} saved={inLib(item.id)} onAdd={quickAdd} onClick={() => handleExploreCardClick(item, item.media_type || 'movie')} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
