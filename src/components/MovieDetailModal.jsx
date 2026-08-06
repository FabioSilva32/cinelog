import React, { useState, useEffect } from 'react';
import { X, Heart, Film, Tag, Star, Clock, Users, ExternalLink, Play } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { MOCK_REVIEWS } from '../mockData';

const TMDB_KEY = '6a2fd6b9b1bb3befbb9f14c203732225';

function getRatingColor(r) {
  const n = Number(r);
  if (n >= 8.5) return '#10b981';
  if (n >= 7) return '#fbbf24';
  if (n >= 5) return '#f97316';
  return '#ef4444';
}

const STATUS_OPTS = [
  { val: 'watched',      label: '✓ Watched',    color: 'var(--green)' },
  { val: 'plan_to_watch', label: '⏳ Watchlist',  color: 'var(--blue)' },
  { val: 'watching',     label: '▶ Watching',    color: 'var(--accent)' },
  { val: 'dropped',      label: '✕ Dropped',     color: 'var(--red)' },
];

const ratingLabel = (r) => {
  if (r === 0) return 'Not Rated';
  if (r >= 9.5) return '✨ All-Time Masterpiece';
  if (r >= 9) return '🏆 Masterpiece';
  if (r >= 8) return '⭐ Excellent';
  if (r >= 7) return '👍 Great';
  if (r >= 6) return '🙂 Good';
  if (r >= 5) return '😐 Average';
  if (r >= 3) return '👎 Below Average';
  return '💀 Poor';
};

export default function MovieDetailModal({ movie, currentUser, onClose, onSave, onToggleFavorite, isFavorite, onOpenUserProfile }) {
  const [status, setStatus] = useState(movie.status || 'plan_to_watch');
  const [rating, setRating] = useState(movie.rating != null ? Number(movie.rating) : 0);
  const [episodeData, setEpisodeData] = useState(() => {
    if (movie.episode_data) return movie.episode_data;
    
    // Parse new unified metadata from review
    if (movie.review) {
      const match = movie.review.match(/__EPISODE_DATA__:(.+)$/s);
      if (match) {
        try { return JSON.parse(match[1]); } catch {}
      }
      
      // Parse old rating-only format
      const oldMatch = movie.review.match(/__EPISODE_RATINGS__:(.+)$/s);
      if (oldMatch) {
        try {
          const oldRatings = JSON.parse(oldMatch[1]);
          return { ratings: oldRatings, notes: {}, dates: {} };
        } catch {}
      }
    }
    
    // Fallback: legacy fields directly on movie object
    if (movie.episode_ratings) {
      return {
        ratings: movie.episode_ratings || {},
        notes: movie.episode_notes || {},
        dates: movie.episode_watch_dates || {}
      };
    }
    
    return { ratings: {}, notes: {}, dates: {} };
  });

  const [expandedEpisodeLogs, setExpandedEpisodeLogs] = useState({});

  const episodeRatings = episodeData.ratings || {};
  const episodeNotes = episodeData.notes || {};
  const episodeWatchDates = episodeData.dates || {};

  const updateEpisodeRating = (epKey, ratingVal) => {
    setEpisodeData(prev => {
      const copy = {
        ratings: { ...(prev.ratings || {}) },
        notes: { ...(prev.notes || {}) },
        dates: { ...(prev.dates || {}) }
      };
      if (ratingVal === 0) delete copy.ratings[epKey];
      else copy.ratings[epKey] = ratingVal;
      return copy;
    });
  };

  const updateEpisodeNote = (epKey, noteVal) => {
    setEpisodeData(prev => {
      const copy = {
        ratings: { ...(prev.ratings || {}) },
        notes: { ...(prev.notes || {}) },
        dates: { ...(prev.dates || {}) }
      };
      if (!noteVal.trim()) delete copy.notes[epKey];
      else copy.notes[epKey] = noteVal;
      return copy;
    });
  };

  const updateEpisodeWatchDate = (epKey, dateVal) => {
    setEpisodeData(prev => {
      const copy = {
        ratings: { ...(prev.ratings || {}) },
        notes: { ...(prev.notes || {}) },
        dates: { ...(prev.dates || {}) }
      };
      if (!dateVal) delete copy.dates[epKey];
      else copy.dates[epKey] = dateVal;
      return copy;
    });
  };

  const [review, setReview] = useState(() => {
    if (!movie.review) return '';
    return movie.review
      .replace(/__EPISODE_DATA__:.+$/s, '')
      .replace(/__EPISODE_RATINGS__:.+$/s, '')
      .trim();
  });
  const [watchDate, setWatchDate] = useState(movie.watch_date || new Date().toISOString().split('T')[0]);
  const [containsSpoilers, setContainsSpoilers] = useState(movie.contains_spoilers || false);
  const [isRewatch, setIsRewatch] = useState(movie.is_rewatch || false);
  const [rewatchCount, setRewatchCount] = useState(movie.rewatch_count || 1);
  const [accentColor, setAccentColor] = useState('var(--accent)');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState(movie.tags || []);
  const [details, setDetails] = useState(() => movie.details || null);
  const [cast, setCast] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [reviewTab, setReviewTab] = useState('write'); // 'write' | 'preview'
  const [trailerKey, setTrailerKey] = useState(() => {
    if (movie.videos?.results) {
      const t = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
      return t ? t.key : '';
    }
    return '';
  });
  const [activeSection, setActiveSection] = useState('log');
  const [publicReviews, setPublicReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [revealedReviews, setRevealedReviews] = useState({});
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasonEpisodes, setSeasonEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [watchProviders, setWatchProviders] = useState(null);

  // Simple markdown to HTML for preview
  const renderMarkdown = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/~~(.+?)~~/g, '<del>$1</del>')
      .replace(/^# (.+)$/gm, '<h3 style="margin:8px 0 4px">$1</h3>')
      .replace(/^## (.+)$/gm, '<h4 style="margin:6px 0 3px">$1</h4>')
      .replace(/^- (.+)$/gm, '<li style="margin-left:16px">$1</li>')
      .replace(/\n/g, '<br/>');
  };

  const ratingColor = rating > 0 ? getRatingColor(rating) : 'var(--text-dim)';
  const backdropUrl = details?.backdrop_path || movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${details?.backdrop_path || movie.backdrop_path}`
    : null;

  // Dynamic color palette extraction from backdropUrl
  useEffect(() => {
    if (!backdropUrl) {
      setAccentColor('var(--accent)');
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = backdropUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        
        // Convert to HSL and boost saturation
        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;
        const max = Math.max(rNorm, gNorm, bNorm);
        const min = Math.min(rNorm, gNorm, bNorm);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
            case gNorm: h = (bNorm - rNorm) / d + 2; break;
            case bNorm: h = (rNorm - gNorm) / d + 4; break;
          }
          h /= 6;
        }

        const finalH = Math.round(h * 360);
        const finalS = Math.round(Math.max(75, s * 100)); // vibrant color
        const finalL = Math.round(Math.max(50, Math.min(65, l * 100))); // clean brightness
        setAccentColor(`hsl(${finalH}, ${finalS}%, ${finalL}%)`);
      } catch (e) {
        setAccentColor('var(--accent)');
      }
    };
    img.onerror = () => {
      setAccentColor('var(--accent)');
    };
  }, [backdropUrl]);


  const targetTmdbId = movie.tmdb_id || movie.id;

  useEffect(() => {
    if (!targetTmdbId) return;
    let active = true;

    const loadReviews = async () => {
      setLoadingReviews(true);
      
      const tmdbIdNum = Number(targetTmdbId);

      const currentUserReviewText = (review || movie.review || '')
        .replace(/__EPISODE_DATA__:.+$/s, '')
        .replace(/__EPISODE_RATINGS__:.+$/s, '')
        .trim();

      const userReviewObj = currentUserReviewText ? {
        id: 'user-current-review',
        user_id: currentUser?.id || 'me',
        username: currentUser?.username || 'You',
        displayName: currentUser?.display_name || currentUser?.displayName || currentUser?.username || 'You',
        avatar: currentUser?.avatar_url || currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
        rating: rating > 0 ? rating : (movie.rating ? Number(movie.rating) : null),
        review: currentUserReviewText,
        date_added: movie.date_added || watchDate || new Date().toISOString(),
        contains_spoilers: containsSpoilers
      } : null;

      if (isSupabaseConfigured && tmdbIdNum) {
        try {
          const { data, error } = await supabase
            .from('library')
            .select('id, rating, review, date_added, user_id, contains_spoilers')
            .eq('tmdb_id', tmdbIdNum)
            .not('review', 'is', null)
            .neq('review', '');

          if (error) {
            console.warn("Library query error in loadReviews:", error.message);
          }

          if (data && active) {
            const userIds = [...new Set(data.map(d => d.user_id))];
            let profilesMap = {};
            if (userIds.length > 0) {
              const { data: profilesData, error: profErr } = await supabase
                .from('profiles')
                .select('id, username, avatar_url, display_name')
                .in('id', userIds);

              if (profErr) {
                console.warn("Profiles query error in loadReviews:", profErr.message);
              }
              if (profilesData) {
                profilesData.forEach(p => {
                  profilesMap[p.id] = p;
                });
              }
            }

            let formatted = data
              .map(item => {
                const profile = profilesMap[item.user_id];
                let cleanReview = (item.review || '')
                  .replace(/__EPISODE_DATA__:.+$/s, '')
                  .replace(/__EPISODE_RATINGS__:.+$/s, '')
                  .trim();

                if (!cleanReview) return null;

                return {
                  id: item.id,
                  user_id: item.user_id,
                  username: profile?.username || (item.user_id ? 'user_' + String(item.user_id).slice(0, 6) : 'user'),
                  displayName: profile?.display_name || profile?.username || 'CineLog Member',
                  avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
                  rating: item.rating,
                  review: cleanReview,
                  date_added: item.date_added,
                  contains_spoilers: item.contains_spoilers
                };
              })
              .filter(Boolean);

            if (userReviewObj) {
              const existingIdx = formatted.findIndex(r => r.user_id === currentUser?.id || r.id === 'user-current-review');
              if (existingIdx !== -1) {
                formatted[existingIdx] = userReviewObj;
              } else {
                formatted.unshift(userReviewObj);
              }
            }

            setPublicReviews(formatted);
          } else if (active && userReviewObj) {
            setPublicReviews([userReviewObj]);
          }
        } catch (err) {
          console.error("Error loading public reviews:", err);
          if (active) setPublicReviews(userReviewObj ? [userReviewObj] : []);
        }
      } else {
        if (active) {
          setPublicReviews(userReviewObj ? [userReviewObj] : []);
        }
      }
      if (active) setLoadingReviews(false);
    };

    loadReviews();
    return () => { active = false; };
  }, [targetTmdbId, review, rating, containsSpoilers, currentUser?.id, movie.review]);

  useEffect(() => {
    if (!targetTmdbId) return;
    const mt = movie.media_type === 'tv' ? 'tv' : 'movie';
    let active = true;

    // Fetch details + credits + similar in parallel
    const base = `https://api.themoviedb.org/3/${mt}/${targetTmdbId}`;
    const p = `?api_key=${TMDB_KEY}&language=en-US`;

    Promise.all([
      movie.details ? Promise.resolve(movie.details) : fetch(`${base}${p}&append_to_response=videos,credits`).then(r => r.json()),
      fetch(`${base}/credits${p}`).then(r => r.json()).catch(() => ({ cast: [] })),
      fetch(`${base}/similar${p}`).then(r => r.json()).catch(() => ({ results: [] })),
    ]).then(([det, credits, sim]) => {
      if (!active) return;
      setDetails(det);
      if (!trailerKey && det.videos?.results) {
        const t = det.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        if (t) setTrailerKey(t.key);
      }
      setCast((credits.cast || []).slice(0, 12));
      setSimilar((sim.results || []).slice(0, 8));
    }).catch(() => {});

  }, [targetTmdbId, movie.media_type]);

  useEffect(() => {
    if (movie.media_type !== 'tv' || !targetTmdbId) return;
    
    let active = true;
    setLoadingEpisodes(true);
    
    const url = `https://api.themoviedb.org/3/tv/${targetTmdbId}/season/${selectedSeason}?api_key=${TMDB_KEY}&language=en-US`;
    
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (!active) return;
        if (data && Array.isArray(data.episodes)) {
          setSeasonEpisodes(data.episodes);
        } else {
          setSeasonEpisodes([]);
        }
        setLoadingEpisodes(false);
      })
      .catch(err => {
        console.error("Error fetching season episodes:", err);
        if (active) {
          setSeasonEpisodes([]);
          setLoadingEpisodes(false);
        }
      });

  }, [targetTmdbId, movie.media_type, selectedSeason]);

  // Fetch streaming availability
  useEffect(() => {
    if (!targetTmdbId) return;
    const mt = movie.media_type === 'tv' ? 'tv' : 'movie';
    fetch(`https://api.themoviedb.org/3/${mt}/${targetTmdbId}/watch/providers?api_key=${TMDB_KEY}`)
      .then(r => r.json())
      .then(data => {
        // Try to get US providers, fall back to first available country
        const results = data.results || {};
        const providers = results['US'] || results[Object.keys(results)[0]] || null;
        setWatchProviders(providers);
      })
      .catch(() => {});
  }, [targetTmdbId, movie.media_type]);

  // Auto-calculate main TV series rating average from all rated episodes
  useEffect(() => {
    if (movie.media_type !== 'tv') return;
    const keys = Object.keys(episodeRatings);
    if (keys.length > 0) {
      const sum = keys.reduce((acc, k) => acc + episodeRatings[k], 0);
      const avg = Math.round((sum / keys.length) * 10) / 10;
      setRating(avg);
    }
  }, [episodeRatings, movie.media_type]);

  const getSeasonAverage = (seasonNum) => {
    const prefix = `S${String(seasonNum).padStart(2, '0')}E`;
    const keys = Object.keys(episodeRatings).filter(k => k.startsWith(prefix));
    if (keys.length === 0) return null;
    const sum = keys.reduce((acc, k) => acc + episodeRatings[k], 0);
    return Math.round((sum / keys.length) * 10) / 10;
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleSave = () => {
    const genres = movie.genres || details?.genres?.map(g => g.name) || [];
    const directorName = movie.director || details?.credits?.crew?.find(c => c.job === 'Director')?.name || null;
    onSave({
      ...movie,
      status,
      rating: status === 'watched' ? rating : null,
      review,
      episode_data: episodeData,
      episode_ratings: episodeData.ratings || {},
      episode_notes: episodeData.notes || {},
      episode_watch_dates: episodeData.dates || {},
      tags,
      genres,
      director: directorName,
      watch_date: status === 'watched' ? watchDate : null,
      contains_spoilers: containsSpoilers,
      is_rewatch: isRewatch,
      rewatch_count: isRewatch ? rewatchCount : null,
    });
  };

  const insertMarkdown = (wrap, textAreaRef) => {
    const ta = document.getElementById('review-textarea');
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = review.slice(start, end);
    const before = review.slice(0, start);
    const after = review.slice(end);
    const newText = before + wrap + selected + wrap + after;
    setReview(newText);
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = start + wrap.length;
      ta.selectionEnd = end + wrap.length;
    }, 0);
  };

  const director = details?.credits?.crew?.find(c => c.job === 'Director') ||
    (cast.length === 0 ? null : null);

  const SECTIONS = [
    { id: 'log', label: '📋 Log' },
    { id: 'episodes', label: '⭐ Episodes', hidden: movie.media_type !== 'tv' },
    { id: 'streaming', label: '📺 Streaming' },
    { id: 'details', label: '🎬 Details' },
    { id: 'cast', label: '👥 Cast' },
    { id: 'reviews', label: '💬 Reviews' },
    { id: 'trailer', label: '▶ Trailer', hidden: !trailerKey },
    { id: 'similar', label: '🔍 Similar', hidden: similar.length === 0 },
  ].filter(s => !s.hidden);

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(4,3,8,0.92)', backdropFilter: 'blur(16px)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', paddingTop: '3vh' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-fade-in-scale"
        style={{ width: '100%', maxWidth: '940px', maxHeight: '94vh', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative', display: 'flex', flexDirection: 'column', background: '#0a0813' }}
      >
        {/* ── BACKDROP HERO ── */}
        <div style={{ position: 'relative', height: '220px', flexShrink: 0, overflow: 'hidden' }}>
          {backdropUrl ? (
            <img src={backdropUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }} />
          ) : (
            <div style={{ height: '100%', background: 'linear-gradient(135deg, rgba(124,111,247,0.2) 0%, rgba(184,124,248,0.1) 100%)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,8,19,0.2) 0%, rgba(10,8,19,0.7) 60%, #0a0813 100%)' }} />

          {/* Close button */}
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-muted)', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 10 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <X size={18} />
          </button>

          {/* Favorite button */}
          <button
            onClick={() => onToggleFavorite(movie.id)}
            style={{ position: 'absolute', top: '14px', right: '58px', background: isFavorite ? 'rgba(239,68,68,0.4)' : 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', border: `1px solid ${isFavorite ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.12)'}`, color: isFavorite ? 'var(--red)' : 'var(--text-muted)', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 10 }}
          >
            <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          {/* Movie info overlay */}
          <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '0 28px 18px', display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
            {/* Poster */}
            <div style={{ width: '100px', height: '150px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, border: '2px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.7)', marginBottom: '-30px' }}>
              {movie.poster_path ? (
                <img src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ height: '100%', background: 'var(--surface-solid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🎬</div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0, paddingBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                {(details?.genres || movie.genres || []).slice(0, 3).map(g => (
                  <span key={typeof g === 'object' ? g.id : g} className="genre-pill" style={{ fontSize: '10px', padding: '2px 8px' }}>
                    {typeof g === 'object' ? g.name : g}
                  </span>
                ))}
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1.1, marginBottom: '6px', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                {movie.title}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{movie.release_year || movie.year || '—'}</span>
                {details?.runtime && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>· {Math.floor(details.runtime / 60)}h {details.runtime % 60}m</span>}
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>· {movie.media_type === 'tv' ? 'Series' : movie.media_type === 'anime' ? 'Anime' : 'Film'}</span>
                {details?.vote_average > 0 && (
                  <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    ★ {details.vote_average.toFixed(1)}
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>({details.vote_count?.toLocaleString()} votes)</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 28px 24px' }}>
          {/* Overview */}
          {(details?.overview || movie.overview) && (
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '24px' }}>
              {details?.overview || movie.overview}
            </p>
          )}

          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '4px', marginBottom: '24px', width: 'fit-content' }}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                style={{ background: activeSection === s.id ? accentColor : 'transparent', color: activeSection === s.id ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '7px', padding: '7px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* ── LOG SECTION ── */}
          {activeSection === 'log' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Status */}
              <div>
                <div className="form-label" style={{ marginBottom: '10px' }}>Status</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {STATUS_OPTS.map(s => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => setStatus(s.val)}
                      style={{
                        flex: 1, minWidth: '110px', padding: '10px 8px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                        border: `1px solid ${status === s.val ? s.color : 'var(--border)'}`,
                        background: status === s.val ? `${s.color}15` : 'rgba(255,255,255,0.03)',
                        color: status === s.val ? s.color : 'var(--text-muted)',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Two-Column Grid under Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', alignItems: 'start' }}>
                
                {/* Left Column: Rating & Tags */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Rating */}
                  {status === 'watched' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div className="form-label">Your Rating</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontSize: '34px', fontWeight: 900, color: ratingColor, fontFamily: 'var(--font-heading)', letterSpacing: '-1px', lineHeight: 1 }}>
                            {rating > 0 ? rating.toFixed(1) : '—'}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 500 }}>{ratingLabel(rating)}</span>
                        </div>
                      </div>

                      <div style={{ position: 'relative', padding: '8px 0' }}>
                        <input
                          type="range" min="0" max="10" step="0.1" value={rating}
                          onChange={e => setRating(parseFloat(e.target.value))}
                          style={{
                            width: '100%', height: '6px', appearance: 'none',
                            background: rating > 0
                              ? `linear-gradient(to right, ${ratingColor} 0%, ${ratingColor} ${rating * 10}%, rgba(255,255,255,0.08) ${rating * 10}%, rgba(255,255,255,0.08) 100%)`
                              : 'rgba(255,255,255,0.08)',
                            borderRadius: '3px', outline: 'none', cursor: 'pointer', accentColor: ratingColor,
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                            <span key={n} style={{ fontSize: '9px', color: Math.abs(rating - n) < 0.6 ? ratingColor : 'var(--text-dim)', fontWeight: Math.abs(rating - n) < 0.6 ? 800 : 400, transition: 'color 0.2s' }}>{n}</span>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                        {[
                          { label: '💀 1', val: 1 },
                          { label: '😐 5', val: 5 },
                          { label: '👍 7', val: 7 },
                          { label: '🔥 8.5', val: 8.5 },
                          { label: '⭐ 10', val: 10 },
                        ].map(q => (
                          <button key={q.label} type="button" onClick={() => setRating(q.val)}
                            style={{ background: Math.abs(rating - q.val) < 0.2 ? 'var(--accent)' : 'rgba(255,255,255,0.05)', border: `1px solid ${Math.abs(rating - q.val) < 0.2 ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: Math.abs(rating - q.val) < 0.2 ? '#fff' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s', fontWeight: 700 }}>
                            {q.label}
                          </button>
                        ))}
                        {rating > 0 && (
                          <button type="button" onClick={() => setRating(0)}
                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: 'var(--red)', cursor: 'pointer', fontWeight: 700 }}>
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Watch Date */}
                      <div style={{ marginTop: '16px' }}>
                        <div className="form-label" style={{ marginBottom: '8px' }}>Date Watched</div>
                        <input
                          type="date"
                          value={watchDate}
                          onChange={e => setWatchDate(e.target.value)}
                          className="form-input"
                          style={{ fontSize: '13.5px', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', padding: '8px 12px' }}
                        />
                      </div>

                    </div>
                  )}

                  {/* Tags */}
                  <div>
                    <div className="form-label" style={{ marginBottom: '8px' }}>Tags <span style={{ color: 'var(--text-dim)', fontWeight: 400, textTransform: 'none', fontSize: '11px' }}>(Enter to add)</span></div>
                    <input type="text" placeholder="Add tags: Rewatch, Comfort, Must-See…" value={newTag}
                      onChange={e => setNewTag(e.target.value)} onKeyDown={handleAddTag}
                      className="form-input" style={{ fontSize: '13.5px', width: '100%' }} />
                    {tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                        {tags.map(tag => (
                          <span key={tag} style={{ background: 'rgba(124,111,247,0.1)', border: '1px solid rgba(124,111,247,0.25)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {tag}
                            <button onClick={() => setTags(tags.filter(t => t !== tag))} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '12px', padding: 0, lineHeight: 1, transition: 'color 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                            >✕</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Notes & Review */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, flex: 1, alignSelf: 'stretch' }}>
                  {/* Rewatch control */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12.5px', fontWeight: 700, color: isRewatch ? '#ec4899' : 'var(--text-muted)' }}>
                      <input type="checkbox" checked={isRewatch} onChange={e => setIsRewatch(e.target.checked)}
                        style={{ accentColor: '#ec4899', cursor: 'pointer', width: '14px', height: '14px' }} />
                      🔁 Rewatch
                    </label>
                    {isRewatch && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Times watched:</span>
                        <input type="number" min={1} max={99} value={rewatchCount} onChange={e => setRewatchCount(Number(e.target.value))}
                          style={{ width: '46px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', padding: '3px 6px', fontSize: '12px', textAlign: 'center' }} />
                      </div>
                    )}
                  </div>

                  {/* Markdown toolbar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700, marginRight: '4px' }}>NOTES</span>
                    {[
                      { label: 'B', wrap: '**', title: 'Bold' },
                      { label: 'I', wrap: '*', title: 'Italic' },
                      { label: 'S', wrap: '~~', title: 'Strikethrough' },
                    ].map(btn => (
                      <button key={btn.label} type="button" title={btn.title}
                        onClick={() => insertMarkdown(btn.wrap)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 900, padding: '2px 8px', cursor: 'pointer', minWidth: '24px' }}>
                        {btn.label}
                      </button>
                    ))}
                    <div style={{ flex: 1 }} />
                    {['write','preview'].map(t => (
                      <button key={t} type="button" onClick={() => setReviewTab(t)}
                        style={{ background: reviewTab === t ? 'rgba(124,111,247,0.2)' : 'none', border: `1px solid ${reviewTab === t ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '4px', color: reviewTab === t ? 'var(--accent)' : 'var(--text-dim)', fontSize: '10px', fontWeight: 700, padding: '2px 8px', cursor: 'pointer', textTransform: 'capitalize' }}>
                        {t === 'write' ? '✏️ Write' : '👁 Preview'}
                      </button>
                    ))}
                  </div>

                  {reviewTab === 'write' ? (
                    <div>
                      <textarea
                        id="review-textarea"
                        placeholder="What did you think? Supports **bold**, *italic*, ~~strikethrough~~…"
                        value={review} onChange={e => setReview(e.target.value)}
                        className="form-input"
                        style={{
                          width: '100%',
                          minHeight: status === 'watched' ? '180px' : '120px',
                          resize: 'vertical',
                          fontSize: '13.5px',
                          lineHeight: 1.6,
                          fontFamily: 'var(--font-mono, monospace)'
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', fontSize: '10.5px', color: 'var(--text-dim)', marginTop: '4px' }}>
                        <span>{review.length} chars</span>
                        <span>·</span>
                        <span>{review.trim() ? review.trim().split(/\s+/).length : 0} words</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        minHeight: status === 'watched' ? '180px' : '120px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '12px',
                        fontSize: '13.5px',
                        lineHeight: 1.6,
                        color: review ? 'var(--text-muted)' : 'var(--text-dim)',
                        fontStyle: review ? 'normal' : 'italic',
                        flex: 1,
                        overflowY: 'auto'
                      }}
                      dangerouslySetInnerHTML={{ __html: review ? renderMarkdown(review) : 'Nothing written yet…' }}
                    />
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    <input
                      type="checkbox"
                      id="containsSpoilers"
                      checked={containsSpoilers}
                      onChange={e => setContainsSpoilers(e.target.checked)}
                      style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: accentColor }}
                    />
                    <label htmlFor="containsSpoilers" style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', userSelect: 'none' }}>
                      ⚠️ Review contains spoilers
                    </label>
                  </div>


                </div>

              </div>
            </div>
          )}

          {/* ── EPISODES SECTION ── */}
          {activeSection === 'episodes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Seasons Selector */}
              {details?.seasons && details.seasons.length > 0 ? (
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                  {details.seasons.map(s => {
                    const seasonAvg = getSeasonAverage(s.season_number);
                    return (
                      <button
                        key={s.season_number}
                        type="button"
                        onClick={() => setSelectedSeason(s.season_number)}
                        style={{
                          background: selectedSeason === s.season_number ? accentColor : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${selectedSeason === s.season_number ? accentColor : 'var(--border)'}`,
                          color: selectedSeason === s.season_number ? '#fff' : 'var(--text-muted)',
                          borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => { if (selectedSeason !== s.season_number) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                        onMouseLeave={e => { if (selectedSeason !== s.season_number) e.currentTarget.style.borderColor = 'var(--border)'; }}
                      >
                        {s.name || `Season ${s.season_number}`} ({s.episode_count} eps)
                        {seasonAvg !== null && <span style={{ color: 'var(--gold)', marginLeft: '4px', fontWeight: 800 }}>★{seasonAvg.toFixed(1)}</span>}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No seasons found.</div>
              )}

              {/* Episodes List */}
              {loadingEpisodes ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading episodes…</div>
              ) : seasonEpisodes && seasonEpisodes.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '45vh', overflowY: 'auto', paddingRight: '6px' }}>
                  {seasonEpisodes.map(ep => {
                    const epKey = `S${String(selectedSeason).padStart(2, '0')}E${String(ep.episode_number).padStart(2, '0')}`;
                    const epRating = episodeRatings[epKey] || 0;
                    const hasLog = episodeNotes[epKey] || episodeWatchDates[epKey];
                    const isExpanded = expandedEpisodeLogs[epKey];

                    return (
                      <div key={ep.id} className="glass" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', transition: 'all 0.2s', position: 'relative' }}>
                        
                        {/* Upper row: still frame and info */}
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                          {ep.still_path ? (
                            <img src={`https://image.tmdb.org/t/p/w300${ep.still_path}`} alt="" style={{ width: '180px', height: '108px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: '180px', height: '108px', borderRadius: '8px', background: 'var(--surface-solid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'var(--text-dim)', flexShrink: 0 }}>📺</div>
                          )}
                          
                          <div style={{ flex: 1, minWidth: '200px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                              <span style={{ fontSize: '15px', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>
                                E{ep.episode_number}. {ep.name}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {hasLog && (
                                  <span style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#c084fc', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800 }}>
                                    📝 Logged
                                  </span>
                                )}
                                {ep.air_date && (
                                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                    {new Date(ep.air_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {ep.overview || "No overview available for this episode."}
                            </p>

                            {/* Controls row: rating slider & logs toggle */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px' }}>
                              {/* Left side: Rating slider */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '220px' }}>
                                <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rating:</span>
                                <div style={{ flex: 1, position: 'relative', padding: '6px 0' }}>
                                  <input
                                    type="range" min="0" max="10" step="0.1" value={epRating}
                                    onChange={e => updateEpisodeRating(epKey, parseFloat(e.target.value))}
                                    style={{
                                      width: '100%', height: '5px', appearance: 'none',
                                      background: epRating > 0
                                        ? `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${epRating * 10}%, rgba(255,255,255,0.06) ${epRating * 10}%, rgba(255,255,255,0.06) 100%)`
                                        : 'rgba(255,255,255,0.06)',
                                      borderRadius: '3px', outline: 'none', cursor: 'pointer', accentColor: accentColor,
                                    }}
                                  />
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                    {[0, 2, 4, 6, 8, 10].map(n => (
                                      <span key={n} style={{ fontSize: '8px', color: Math.abs(epRating - n) < 0.6 ? accentColor : 'var(--text-dim)', fontWeight: Math.abs(epRating - n) < 0.6 ? 800 : 400 }}>{n}</span>
                                    ))}
                                  </div>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 900, color: epRating > 0 ? 'var(--gold)' : 'var(--text-dim)', minWidth: '48px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                                  {epRating > 0 ? `★ ${epRating.toFixed(1)}` : '—'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateEpisodeRating(epKey, 0)}
                                  disabled={epRating === 0}
                                  style={{
                                    background: 'rgba(239,68,68,0.08)',
                                    border: '1px solid rgba(239,68,68,0.15)',
                                    color: 'var(--red)',
                                    fontSize: '10.5px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    transition: 'opacity 0.15s, background-color 0.15s',
                                    opacity: epRating > 0 ? 1 : 0,
                                    pointerEvents: epRating > 0 ? 'auto' : 'none',
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                                >
                                  Clear
                                </button>
                              </div>

                              {/* Right side: Log toggler */}
                              <button
                                type="button"
                                onClick={() => setExpandedEpisodeLogs(prev => ({ ...prev, [epKey]: !prev[epKey] }))}
                                style={{
                                  background: isExpanded ? 'rgba(255,255,255,0.06)' : 'transparent',
                                  border: `1px solid ${isExpanded ? 'rgba(255,255,255,0.15)' : 'var(--border)'}`,
                                  borderRadius: '6px',
                                  padding: '5px 10px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  color: isExpanded ? '#fff' : 'var(--text-muted)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  transition: 'all 0.15s'
                                }}
                                onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.borderColor = 'var(--border)'; }}
                              >
                                ✍️ {isExpanded ? 'Hide Thoughts' : 'Thoughts & Logs'}
                                <span style={{ fontSize: '9px', opacity: 0.6, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Thoughts & Watch Date panel */}
                        {isExpanded && (
                          <div
                            className="glass"
                            style={{
                              background: 'rgba(0,0,0,0.15)',
                              border: '1px dashed rgba(255,255,255,0.08)',
                              borderRadius: '8px',
                              padding: '12px 14px',
                              marginTop: '4px',
                              display: 'flex',
                              gap: '16px',
                              flexDirection: 'row',
                              flexWrap: 'wrap',
                              animation: 'fadeIn 0.2s ease-out'
                            }}
                          >
                            {/* Watched Date */}
                            <div style={{ flex: '1 1 150px', minWidth: '150px' }}>
                              <label style={{ display: 'block', fontSize: '9px', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                Watched Date
                              </label>
                              <input
                                type="date"
                                value={episodeWatchDates[epKey] || ''}
                                onChange={e => updateEpisodeWatchDate(epKey, e.target.value)}
                                className="form-input"
                                style={{
                                  fontSize: '12px',
                                  padding: '6px 8px',
                                  width: '100%',
                                  background: 'rgba(255,255,255,0.02)',
                                  color: '#fff',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border)'
                                }}
                              />
                            </div>

                            {/* Episode Notes/Thoughts */}
                            <div style={{ flex: '3 1 300px', minWidth: '240px' }}>
                              <label style={{ display: 'block', fontSize: '9px', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                Episode Thoughts
                              </label>
                              <textarea
                                placeholder="What did you think of this episode? Key scenes, theories, rating thoughts…"
                                value={episodeNotes[epKey] || ''}
                                onChange={e => updateEpisodeNote(epKey, e.target.value)}
                                className="form-input"
                                style={{
                                  fontSize: '12.5px',
                                  padding: '8px 10px',
                                  minHeight: '60px',
                                  width: '100%',
                                  resize: 'vertical',
                                  background: 'rgba(255,255,255,0.02)',
                                  color: '#fff',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border)',
                                  lineHeight: '1.4'
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No episodes found for this season.</div>
              )}
            </div>
          )}

          {/* ── DETAILS SECTION ── */}
          {activeSection === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {details ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { label: 'Status', val: details.status },
                    { label: 'Original Title', val: details.original_title || details.original_name },
                    { label: 'Runtime', val: details.runtime ? `${details.runtime} minutes` : details.episode_run_time?.[0] ? `${details.episode_run_time[0]} min/ep` : null },
                    { label: 'Budget', val: details.budget > 0 ? `$${(details.budget / 1000000).toFixed(1)}M` : null },
                    { label: 'Box Office', val: details.revenue > 0 ? `$${(details.revenue / 1000000).toFixed(1)}M` : null },
                    { label: 'Seasons', val: details.number_of_seasons ? `${details.number_of_seasons} seasons` : null },
                    { label: 'Episodes', val: details.number_of_episodes ? `${details.number_of_episodes} episodes` : null },
                    { label: 'Language', val: details.original_language?.toUpperCase() },
                    { label: 'Production', val: details.production_companies?.slice(0, 2).map(c => c.name).join(', ') },
                    { label: 'Countries', val: details.production_countries?.slice(0, 2).map(c => c.name).join(', ') },
                    { label: 'TMDB Score', val: details.vote_average ? `${details.vote_average.toFixed(1)} (${details.vote_count?.toLocaleString()} votes)` : null },
                    { label: 'Popularity', val: details.popularity ? `${details.popularity.toFixed(0)}` : null },
                  ].filter(r => r.val).map(row => (
                    <div key={row.label} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{row.label}</div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{row.val}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading details…</div>
              )}

              {details?.homepage && (
                <a href={details.homepage} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontSize: '13px', fontWeight: 700 }}>
                  <ExternalLink size={14} /> Official Website
                </a>
              )}
            </div>
          )}

          {/* ── STREAMING SECTION ── */}
          {activeSection === 'streaming' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--accent)' }}>📺 Where to Watch</span>
                {watchProviders?.link && (
                  <a href={watchProviders.link} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    More on JustWatch
                  </a>
                )}
              </div>

              {!watchProviders ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
                  <div style={{ fontWeight: 700, marginBottom: '6px' }}>No streaming info available</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>This title may not be available for streaming in your region.</div>
                </div>
              ) : (
                <>
                  {watchProviders.flatrate?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)' }} />
                        Stream Included
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {watchProviders.flatrate.map(p => (
                          <div key={p.provider_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            <img src={`https://image.tmdb.org/t/p/w92${p.logo_path}`} alt={p.provider_name}
                              style={{ width: '52px', height: '52px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }} />
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '60px', lineHeight: 1.2 }}>{p.provider_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {watchProviders.rent?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
                        Rent
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {watchProviders.rent.map(p => (
                          <div key={p.provider_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            <img src={`https://image.tmdb.org/t/p/w92${p.logo_path}`} alt={p.provider_name}
                              style={{ width: '52px', height: '52px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border)', opacity: 0.8 }} />
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '60px', lineHeight: 1.2 }}>{p.provider_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {watchProviders.buy?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa' }} />
                        Buy
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {watchProviders.buy.map(p => (
                          <div key={p.provider_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            <img src={`https://image.tmdb.org/t/p/w92${p.logo_path}`} alt={p.provider_name}
                              style={{ width: '52px', height: '52px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border)', opacity: 0.7 }} />
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '60px', lineHeight: 1.2 }}>{p.provider_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: '10px', color: 'var(--text-dim)', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                    Streaming data provided by <a href="https://www.justwatch.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>JustWatch</a> via TMDB. Availability varies by region.
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── CAST SECTION ── */}
          {activeSection === 'cast' && (
            <div>
              {cast.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                  {cast.map(person => (
                    <div key={person.id} style={{ textAlign: 'center' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 7px', border: '2px solid var(--border)', background: 'var(--surface-solid)' }}>
                        {person.profile_path ? (
                          <img src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                        ) : (
                          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>👤</div>
                        )}
                      </div>
                      <div style={{ fontSize: '11.5px', fontWeight: 700, lineHeight: 1.2 }}>{person.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.2 }}>{person.character}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading cast…</div>
              )}
            </div>
          )}

          {/* ── REVIEWS SECTION ── */}
          {activeSection === 'reviews' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--accent)' }}>
                  Community Reviews ({publicReviews.length})
                </span>
              </div>
              
              {loadingReviews ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-dim)' }}>
                  <Clock className="animate-spin" size={20} style={{ margin: '0 auto 10px' }} />
                  Loading reviews...
                </div>
              ) : publicReviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '42vh', overflowY: 'auto', paddingRight: '6px' }}>
                  {publicReviews.map(r => (
                    <div key={r.id} className="glass animate-fade-in" style={{ padding: '14px 16px', borderRadius: '10px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <img
                        src={r.avatar}
                        alt={r.displayName}
                        onClick={() => { if (onOpenUserProfile) { onOpenUserProfile({ id: r.user_id, username: r.username, displayName: r.displayName, avatar: r.avatar }); onClose(); } }}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                          <div
                            onClick={() => { if (onOpenUserProfile) { onOpenUserProfile({ id: r.user_id, username: r.username, displayName: r.displayName, avatar: r.avatar }); onClose(); } }}
                            style={{ cursor: 'pointer' }}
                          >
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{r.displayName}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: '6px' }}>@{r.username}</span>
                          </div>
                          {r.rating && (
                            <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              ★ {Number(r.rating).toFixed(1)}
                            </span>
                          )}
                        </div>
                        {r.contains_spoilers && !revealedReviews[r.id] ? (
                          <div
                            onClick={() => setRevealedReviews(prev => ({ ...prev, [r.id]: true }))}
                            style={{
                              background: 'rgba(239,68,68,0.07)',
                              border: '1px solid rgba(239,68,68,0.22)',
                              borderRadius: '8px',
                              padding: '12px',
                              marginTop: '8px',
                              cursor: 'pointer',
                              textAlign: 'center',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: 'var(--red)',
                              transition: 'background 0.2s',
                              userSelect: 'none'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}
                          >
                            ⚠️ Review contains spoilers. Click to reveal.
                          </div>
                        ) : (
                          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: '8px', whiteSpace: 'pre-line' }}>
                            {r.review}
                          </p>
                        )}
                        {r.date_added && (
                          <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '8px' }}>
                            {new Date(r.date_added).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>✍️</div>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>No Reviews Yet</div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '280px', margin: '0 auto' }}>
                    Be the first to share your thoughts on this title under the 📋 Log tab!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── TRAILER SECTION ── */}
          {activeSection === 'trailer' && trailerKey && (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailerKey}?rel=0&modestbranding=1`}
                title="Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              />
            </div>
          )}

          {/* ── SIMILAR SECTION ── */}
          {activeSection === 'similar' && similar.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' }}>
              {similar.map(item => (
                <div key={item.id} style={{ borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer', background: 'var(--surface-solid)', border: '1px solid var(--border)', transition: 'transform 0.2s' }}
                  onClick={() => { onClose(); setTimeout(() => onSave?.({ ...movie, tmdb_id: item.id }), 100); }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}
                >
                  <div style={{ aspectRatio: '2/3', overflow: 'hidden', background: 'var(--surface)' }}>
                    {item.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w300${item.poster_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🎬</div>
                    )}
                  </div>
                  <div style={{ padding: '7px 8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title || item.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--gold)', marginTop: '2px', fontWeight: 700 }}>★{item.vote_average?.toFixed(1)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── STICKY FOOTER ── */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 28px', display: 'flex', gap: '10px', justifyContent: 'flex-end', background: 'rgba(10,8,19,0.98)', backdropFilter: 'blur(20px)', flexShrink: 0 }}>
          <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: '13.5px' }}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} style={{ fontSize: '13.5px', padding: '9px 26px' }}>
            Save to Library
          </button>
        </div>
      </div>
    </div>
  );
}
