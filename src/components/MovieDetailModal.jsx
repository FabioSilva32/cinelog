import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Heart, Film, Tag, Star, Clock, Users, ExternalLink, Play, FolderHeart, Plus, Check, Eye, Bookmark, XCircle, ChevronDown, Repeat, EyeOff } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { MOCK_REVIEWS, ELENA_PROFILE, ELENA_LIBRARY } from '../mockData';
import { getMovieCollections, getSuggestedTags } from '../utils/collections';
import { getEnhancedMovieTitle } from '../utils/movieTitles';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const IGNORED_USERNAMES = new Set([
  'fabiosilva',
  'tester',
  'cinelog.importer.test+75284',
  'marracarrao',
  'itzfabiopt2006',
  'tester99'
]);

const TMDB_KEY = '6a2fd6b9b1bb3befbb9f14c203732225';

const POPULAR_CINE_TAGS = [
  'Rewatch', 'Masterpiece', 'Cinema Trip', 'Comfort Watch', 'Mind-Bending',
  'Plot Twist', 'Cult Classic', 'Must-See', 'Visually Stunning', 'Soundtrack',
  'Atmospheric', 'Slow Burn', 'Tearjerker', 'Guilty Pleasure', 'Underrated'
];

function getRatingColor(r) {
  if (!r) return 'var(--text-dim)';
  const n = Number(r);
  if (n >= 8.5) return '#a855f7'; // Highest: Amethyst Purple (8.5 - 10.0)
  if (n >= 7.0) return '#38bdf8'; // Sky Blue (7.0 - 8.4)
  if (n >= 5.5) return '#059669'; // Deeper Green (5.5 - 6.9)
  if (n >= 4.0) return '#f97316'; // Sunset Orange (4.0 - 5.4)
  return '#ef4444'; // Deep Red (< 4.0)
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

const formatMoney = (n) => {
  if (!n || n <= 0) return null;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  return `$${(n / 1e6).toFixed(1)}M`;
};

export default function MovieDetailModal({ movie, currentUser, onClose, onSave, onToggleFavorite, isFavorite, onOpenUserProfile, onOpenMovie, inLibrary }) {
  useBodyScrollLock(true);

  // Close modal when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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

  const episodeRatings = useMemo(() => episodeData.ratings || {}, [episodeData.ratings]);
  const episodeNotes = useMemo(() => episodeData.notes || {}, [episodeData.notes]);
  const episodeWatchDates = useMemo(() => episodeData.dates || {}, [episodeData.dates]);

  // Season-level ratings, notes, and completion dates
  const [seasonRatings, setSeasonRatings] = useState(() => {
    return movie.season_ratings || (movie.episode_data && movie.episode_data.season_ratings) || (episodeData && episodeData.season_ratings) || {};
  });
  const [seasonNotes, setSeasonNotes] = useState(() => {
    return movie.season_notes || (movie.episode_data && movie.episode_data.season_notes) || (episodeData && episodeData.season_notes) || {};
  });
  const [seasonDates, setSeasonDates] = useState(() => {
    return movie.season_dates || (movie.episode_data && movie.episode_data.season_dates) || (episodeData && episodeData.season_dates) || {};
  });
  const [showEpisodesList, setShowEpisodesList] = useState(true);
  const [expandedSeasonLog, setExpandedSeasonLog] = useState(false);
  const [episodesFilter, setEpisodesFilter] = useState('all'); // 'all' | 'rated' | 'unrated'

  const updateSeasonRating = (seasonNum, ratingVal) => {
    const sKey = String(seasonNum);
    setSeasonRatings(prev => {
      const copy = { ...prev };
      if (ratingVal === 0 || ratingVal == null) delete copy[sKey];
      else copy[sKey] = ratingVal;
      return copy;
    });
  };

  const updateSeasonNote = (seasonNum, noteVal) => {
    const sKey = String(seasonNum);
    setSeasonNotes(prev => {
      const copy = { ...prev };
      if (!noteVal || !noteVal.trim()) delete copy[sKey];
      else copy[sKey] = noteVal;
      return copy;
    });
  };

  const updateSeasonWatchDate = (seasonNum, dateVal) => {
    const sKey = String(seasonNum);
    setSeasonDates(prev => {
      const copy = { ...prev };
      if (!dateVal) delete copy[sKey];
      else copy[sKey] = dateVal;
      return copy;
    });
  };

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
  const [customCollections, setCustomCollections] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cinelog_collections_v1')) || {}; }
    catch { return {}; }
  });

  const matchedCollections = React.useMemo(() => {
    return getMovieCollections(movie, customCollections);
  }, [movie, customCollections]);

  const suggestedFranchiseTags = React.useMemo(() => {
    return getSuggestedTags(movie);
  }, [movie]);

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
  const [activeSection, setActiveSection] = useState('overview');
  const [logOpen, setLogOpen] = useState(true);
  const [publicReviews, setPublicReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [revealedReviews, setRevealedReviews] = useState({});
  const [reviewLikesCounts, setReviewLikesCounts] = useState({});
  const [userLikedReviews, setUserLikedReviews] = useState({});
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

      let allReviews = [];
      if (userReviewObj) {
        allReviews.push(userReviewObj);
      }

      if (isSupabaseConfigured && targetTmdbId) {
        try {
          const tmdbIdNum = Number(targetTmdbId);
          const isValidNum = !isNaN(tmdbIdNum);

          let dbQuery = supabase
            .from('library')
            .select('id, rating, review, date_added, user_id, profiles(username, display_name, avatar_url)')
            .not('review', 'is', null)
            .neq('review', '');

          if (isValidNum) {
            dbQuery = dbQuery.or(`tmdb_id.eq.${tmdbIdNum},tmdb_id.eq.${targetTmdbId}`);
          } else {
            dbQuery = dbQuery.eq('title', movie.title);
          }

          let { data, error } = await dbQuery;

          // Fallback if joined query has syntax/relationship error
          if (error) {
            let fallbackQuery = supabase
              .from('library')
              .select('id, rating, review, date_added, user_id')
              .not('review', 'is', null)
              .neq('review', '');
            if (isValidNum) fallbackQuery = fallbackQuery.or(`tmdb_id.eq.${tmdbIdNum},tmdb_id.eq.${targetTmdbId}`);
            else fallbackQuery = fallbackQuery.eq('title', movie.title);
            const res = await fallbackQuery;
            data = res.data;
          }

          if (data && data.length > 0) {
            // Fetch missing profiles if not already joined
            const missingProfileUserIds = data
              .filter(d => !d.profiles && d.user_id)
              .map(d => d.user_id);

            let profilesMap = {};
            if (missingProfileUserIds.length > 0) {
              const { data: profs } = await supabase
                .from('profiles')
                .select('id, username, display_name, avatar_url')
                .in('id', [...new Set(missingProfileUserIds)]);
              if (profs) {
                profs.forEach(p => { profilesMap[p.id] = p; });
              }
            }

            data.forEach(item => {
              // Only skip if the current user review was already added at top
              if (userReviewObj && currentUser?.id && item.user_id === currentUser.id) return;

              let cleanReview = (item.review || '')
                .replace(/__EPISODE_DATA__:.+$/s, '')
                .replace(/__EPISODE_RATINGS__:.+$/s, '')
                .trim();

              if (!cleanReview) return;

              const prof = item.profiles || profilesMap[item.user_id];
              const uname = (prof?.username || '').toLowerCase();
              if (IGNORED_USERNAMES.has(uname)) return;

              allReviews.push({
                id: item.id,
                user_id: item.user_id,
                username: prof?.username || (item.user_id ? 'user_' + String(item.user_id).slice(0, 6) : 'cinephile'),
                displayName: prof?.display_name || prof?.username || 'CineLog Member',
                avatar: prof?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
                rating: item.rating,
                review: cleanReview,
                date_added: item.date_added,
                contains_spoilers: item.contains_spoilers
              });
            });
          }
        } catch (err) {
          console.error("Error loading public reviews from Supabase:", err);
        }
      }

      // Include Elena Rodriguez's review for this movie if reviewed
      const elenaEntry = ELENA_LIBRARY.find(m => String(m.tmdb_id) === String(targetTmdbId));
      if (elenaEntry && elenaEntry.review && (currentUser?.username || '').toLowerCase() !== ELENA_PROFILE.username) {
        if (!allReviews.some(r => r.username === ELENA_PROFILE.username)) {
          allReviews.push({
            id: `elena-rev-${targetTmdbId}`,
            user_id: ELENA_PROFILE.id,
            username: ELENA_PROFILE.username,
            displayName: ELENA_PROFILE.displayName,
            avatar: ELENA_PROFILE.avatar,
            rating: elenaEntry.rating,
            review: elenaEntry.review,
            date_added: elenaEntry.date_added,
            contains_spoilers: false
          });
        }
      }

      if (active) {
        setPublicReviews(allReviews);
        setLoadingReviews(false);
        if (isSupabaseConfigured) {
          supabase.from('review_likes').select('library_id, user_id').then(({ data: rLikes }) => {
            if (rLikes && active) {
              const counts = {};
              const userMap = {};
              rLikes.forEach(l => {
                counts[l.library_id] = (counts[l.library_id] || 0) + 1;
                if (currentUser?.id && l.user_id === currentUser.id) {
                  userMap[l.library_id] = true;
                }
              });
              setReviewLikesCounts(counts);
              setUserLikedReviews(userMap);
            }
          }).catch(() => {});
        }
      }
    };

    loadReviews();
    return () => { active = false; };
  }, [targetTmdbId, review, rating, containsSpoilers, currentUser?.id, movie.review]);

  const handleToggleReviewLike = async (reviewId) => {
    if (!currentUser?.id) return;
    const isLiked = !!userLikedReviews[reviewId];
    const nextLiked = !isLiked;
    setUserLikedReviews(prev => ({ ...prev, [reviewId]: nextLiked }));
    setReviewLikesCounts(prev => ({
      ...prev,
      [reviewId]: Math.max(0, (prev[reviewId] || 0) + (nextLiked ? 1 : -1))
    }));

    if (isSupabaseConfigured) {
      try {
        if (nextLiked) {
          await supabase.from('review_likes').upsert({ library_id: String(reviewId), user_id: currentUser.id });
        } else {
          await supabase.from('review_likes').delete().eq('library_id', String(reviewId)).eq('user_id', currentUser.id);
        }
      } catch (err) {
        console.warn('Error toggling review like in Supabase:', err);
      }
    }
  };

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
      fetch(`${base}/recommendations${p}`).then(r => r.json()).then(async rec => {
        const good = (rec.results || []).filter(x => x.poster_path && x.vote_average > 0);
        if (good.length >= 4) return { results: good };
        const sim = await fetch(`${base}/similar${p}`).then(r => r.json()).catch(() => ({ results: [] }));
        const merged = [...good, ...(sim.results || []).filter(x => x.poster_path && x.vote_average > 0 && !good.some(g => g.id === x.id))];
        return { results: merged };
      }).catch(() => ({ results: [] })),
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

  // Auto-calculate main TV series rating average:
  // 1. If season ratings exist, average the seasons!
  // 2. Otherwise if episode ratings exist, average the episodes!
  useEffect(() => {
    if (movie.media_type !== 'tv') return;
    const sKeys = Object.keys(seasonRatings).filter(k => seasonRatings[k] > 0);
    if (sKeys.length > 0) {
      const sum = sKeys.reduce((acc, k) => acc + Number(seasonRatings[k]), 0);
      const avg = Math.round((sum / sKeys.length) * 10) / 10;
      setRating(avg);
      return;
    }
    const eKeys = Object.keys(episodeRatings).filter(k => episodeRatings[k] > 0);
    if (eKeys.length > 0) {
      const sum = eKeys.reduce((acc, k) => acc + Number(episodeRatings[k]), 0);
      const avg = Math.round((sum / eKeys.length) * 10) / 10;
      setRating(avg);
    }
  }, [seasonRatings, episodeRatings, movie.media_type]);

  const getSeasonAverage = (seasonNum) => {
    const prefix = `S${String(seasonNum).padStart(2, '0')}E`;
    const keys = Object.keys(episodeRatings).filter(k => k.startsWith(prefix) && episodeRatings[k] > 0);
    if (keys.length === 0) return null;
    const sum = keys.reduce((acc, k) => acc + Number(episodeRatings[k]), 0);
    return Math.round((sum / keys.length) * 10) / 10;
  };

  const getSeasonRatedEpCount = (seasonNum) => {
    const prefix = `S${String(seasonNum).padStart(2, '0')}E`;
    return Object.keys(episodeRatings).filter(k => k.startsWith(prefix) && episodeRatings[k] > 0).length;
  };

  const availableTagSuggestions = useMemo(() => {
    const q = newTag.trim().toLowerCase();
    const active = new Set(tags.map(t => t.toLowerCase()));
    return POPULAR_CINE_TAGS.filter(t => !active.has(t.toLowerCase()) && (!q || t.toLowerCase().includes(q)));
  }, [newTag, tags]);

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && newTag.trim()) {
      e.preventDefault();
      const clean = newTag.trim().replace(/^#/, '');
      if (clean && !tags.includes(clean)) setTags([...tags, clean]);
      setNewTag('');
    }
  };

  const handleSave = () => {
    const isTv = movie.media_type === 'tv' ||
                 movie.number_of_seasons !== undefined ||
                 movie.first_air_date !== undefined ||
                 Boolean(details && (details.number_of_seasons !== undefined || details.first_air_date));
    const resolvedType = isTv ? 'tv' : (movie.media_type || 'movie');
    const genres = movie.genres || details?.genres?.map(g => g.name) || [];
    const directorName = movie.director || details?.credits?.crew?.find(c => c.job === 'Director')?.name || null;

    const mergedEpisodeData = {
      ...episodeData,
      ratings: episodeData.ratings || {},
      notes: episodeData.notes || {},
      dates: episodeData.dates || {},
      season_ratings: seasonRatings,
      season_notes: seasonNotes,
      season_dates: seasonDates
    };

    onSave({
      ...movie,
      media_type: resolvedType,
      status,
      rating: status === 'watched' ? rating : null,
      review,
      episode_data: mergedEpisodeData,
      episode_ratings: mergedEpisodeData.ratings,
      episode_notes: mergedEpisodeData.notes,
      episode_watch_dates: mergedEpisodeData.dates,
      season_ratings: seasonRatings,
      season_notes: seasonNotes,
      season_dates: seasonDates,
      tags,
      genres,
      director: directorName,
      watch_date: status === 'watched' ? watchDate : null,
      contains_spoilers: containsSpoilers,
      is_rewatch: isRewatch,
      rewatch_count: isRewatch ? rewatchCount : null,
    });

    if (isSupabaseConfigured && currentUser?.id) {
      try {
        supabase.from('activity_feed').insert({
          user_id: currentUser.id,
          action_type: status === 'watched' ? (rating ? 'rated' : 'watched') : status,
          title: getEnhancedMovieTitle(movie) || movie.title || movie.name,
          media_type: resolvedType,
          poster_path: movie.poster_path,
          rating: status === 'watched' ? rating : null,
          details: { review: review ? review.slice(0, 200) : '' }
        }).then(() => {}).catch(() => {});
      } catch {}
    }
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
    { id: 'overview', label: 'Overview' },
    { id: 'episodes', label: 'Seasons & Episodes', hidden: movie.media_type !== 'tv' },
    { id: 'details', label: 'Details' },
    { id: 'cast', label: 'Cast' },
    { id: 'reviews', label: publicReviews.length > 0 ? `Reviews (${publicReviews.length})` : 'Reviews' },
    { id: 'trailer', label: 'Trailer', hidden: !trailerKey },
    { id: 'similar', label: 'Similar', hidden: similar.length === 0 },
  ].filter(s => !s.hidden);

  const STATUS_ICONS = { watched: Eye, plan_to_watch: Bookmark, watching: Play, dropped: XCircle };
  const STATUS_SHORT = { watched: 'Watched', plan_to_watch: 'Watchlist', watching: 'Watching', dropped: 'Dropped' };

  const touchStartRef = useRef(null);

  return (
    <div
      className="modal-backdrop movie-detail-modal-backdrop"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', paddingTop: '3vh', overscrollBehaviorY: 'contain' }}
      onClick={e => e.target === e.currentTarget && onClose()}
      onWheel={e => e.stopPropagation()}
      onTouchStart={e => {
        if (e.touches.length === 1) {
          touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
        }
      }}
      onTouchEnd={e => {
        if (!touchStartRef.current) return;
        const start = touchStartRef.current;
        touchStartRef.current = null;
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - start.x;
        const deltaY = Math.abs(touch.clientY - start.y);
        const duration = Date.now() - start.time;
        // Edge swipe right to go back / close modal
        if (start.x < 120 && deltaX > 50 && deltaX > deltaY * 1.2 && duration < 600) {
          onClose();
        }
      }}
    >
      <div
        className="movie-detail-modal-dialog animate-fade-in-scale"
        style={{ width: '100%', maxWidth: '1120px', maxHeight: '94vh', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative', display: 'flex', flexDirection: 'column', background: '#121212', overscrollBehaviorY: 'contain' }}
        onWheel={e => e.stopPropagation()}
      >
        {/* Mobile Grabber Handle */}
        <div className="mobile-modal-grabber" />

        {/* ── BACKDROP HERO ── */}
        <div className="movie-detail-hero" style={{ position: 'relative', height: '220px', flexShrink: 0, overflow: 'hidden' }}>
          {backdropUrl ? (
            <img src={backdropUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }} />
          ) : (
            <div style={{ height: '100%', background: '#181818' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 60%, #121212 100%)' }} />

          {/* Close button */}
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: '14px', right: '14px', background: '#181818', border: '1px solid #333333', color: 'var(--text)', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', zIndex: 10 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#181818'; e.currentTarget.style.borderColor = '#333333'; e.currentTarget.style.color = 'var(--text)'; }}
          >
            <X size={18} />
          </button>


          {/* Movie info overlay */}
          <div className="movie-detail-header-overlay" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '0 28px 18px', display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
            {/* Poster */}
            <div className="movie-detail-poster-wrap" style={{ width: '100px', height: '150px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, border: '2px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.7)', marginBottom: '-30px' }}>
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
                {getEnhancedMovieTitle(movie) || movie.title}
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

        {/* ── SYNOPSIS + ACTION ROW (fixed) ── */}
        <div className="movie-detail-actions-row" style={{ flexShrink: 0, padding: '38px 28px 0' }}>
          {(details?.overview || movie.overview) && (
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.65, margin: '0 0 18px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {details?.overview || movie.overview}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingBottom: '18px' }}>
            <button
              id="modal-save-btn"
              className="btn btn-primary"
              onClick={handleSave}
              style={{ fontSize: '14px', padding: '11px 26px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}
            >
              <Plus size={17} /> {movie.date_added && inLibrary ? 'Save Changes' : 'Add to Library'}
            </button>

            <div style={{ display: 'flex', background: '#1a1a1a', border: '1px solid var(--border)', borderRadius: '10px', padding: '3px', gap: '2px' }}>
              {STATUS_OPTS.map(s => {
                const Icon = STATUS_ICONS[s.val];
                const active = status === s.val;
                return (
                  <button
                    key={s.val}
                    id={`modal-status-${s.val}`}
                    type="button"
                    title={STATUS_SHORT[s.val]}
                    onClick={() => { setStatus(s.val); if (s.val === 'watched') setLogOpen(true); }}
                    style={{ background: active ? `${s.color}22` : 'transparent', border: `1px solid ${active ? s.color : 'transparent'}`, color: active ? s.color : 'var(--text-muted)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', fontSize: '10.5px', fontWeight: 700, transition: 'all 0.15s', minWidth: '66px' }}
                  >
                    <Icon size={16} />
                    {STATUS_SHORT[s.val]}
                  </button>
                );
              })}
            </div>

            <button
              id="modal-favorite-btn"
              onClick={() => onToggleFavorite(movie.id)}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              style={{ background: isFavorite ? 'var(--accent)' : '#1a1a1a', border: `1px solid ${isFavorite ? 'var(--accent)' : 'var(--border)'}`, color: isFavorite ? '#fff' : 'var(--text)', cursor: 'pointer', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
            >
              <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div className="movie-detail-scroll-body" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', padding: '0 28px 28px', display: 'flex', flexDirection: 'column', gap: '22px', borderTop: '1px solid var(--border)', paddingTop: '16px', width: '100%', boxSizing: 'border-box' }}>
          {/* Underlined tabs (smooth horizontal scroll on mobile) */}
          <div
            className="movie-detail-tabs-bar"
            style={{
              display: 'flex',
              flexShrink: 0,
              gap: '24px',
              borderBottom: '1px solid var(--border)',
              overflowX: 'auto',
              overflowY: 'hidden',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
          >
            {SECTIONS.map(s => (
              <button
                key={s.id}
                id={`modal-tab-${s.id}`}
                onClick={(e) => {
                  setActiveSection(s.id);
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                style={{
                  background: 'transparent',
                  color: activeSection === s.id ? '#fff' : 'var(--text-muted)',
                  border: 'none',
                  borderBottom: `2px solid ${activeSection === s.id ? 'var(--accent)' : 'transparent'}`,
                  marginBottom: '-1px',
                  padding: '8px 4px 11px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* ── LOG (rating, tags, review) ── */}
          <div style={{ display: activeSection === 'overview' ? 'block' : 'none', flexShrink: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '26px', padding: '4px 0 8px' }}>

              {/* Vertical Stack: 1. Full-Width Score Bar, 2. Date Watched, 3. Review */}
              {(status === 'watched' || status === 'watching') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                  {/* 1. Score Bar at the top spanning left to right */}
                  <div style={{
                    background: '#151515',
                    border: '1px solid #282828',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div className="form-label" style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fff' }}>Your Rating</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: 600 }}>{ratingLabel(rating)}</span>
                        <span style={{ fontSize: '32px', fontWeight: 900, color: ratingColor, fontFamily: 'var(--font-heading)', letterSpacing: '-1px', lineHeight: 1 }}>
                          {rating > 0 ? rating.toFixed(1) : '—'}
                        </span>
                      </div>
                    </div>

                    <div style={{ position: 'relative', padding: '4px 0', width: '100%' }}>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={Number(rating) || 0}
                        onChange={e => setRating(parseFloat(e.target.value) || 0)}
                        onInput={e => setRating(parseFloat(e.target.value) || 0)}
                        className="cinelog-rating-slider"
                        style={{
                          width: '100%',
                          '--track-fill': rating > 0
                            ? `linear-gradient(to right, ${ratingColor} 0%, ${ratingColor} ${rating * 10}%, rgba(255,255,255,0.08) ${rating * 10}%, rgba(255,255,255,0.08) 100%)`
                            : 'rgba(255,255,255,0.08)',
                          '--thumb-color': ratingColor,
                          '--thumb-glow': rating > 0 ? `${ratingColor}88` : 'rgba(255,255,255,0.2)',
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', width: '100%' }}>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setRating(n)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '2px 4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              color: Math.abs(rating - n) < 0.6 ? ratingColor : 'var(--text-dim)',
                              fontWeight: Math.abs(rating - n) < 0.6 ? 800 : 400,
                              transition: 'color 0.15s'
                            }}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                      {[
                        { label: '💀 1', val: 1 },
                        { label: '😐 5', val: 5 },
                        { label: '👍 7', val: 7 },
                        { label: '🔥 8.5', val: 8.5 },
                        { label: '⭐ 10', val: 10 },
                      ].map(q => {
                        const chipColor = getRatingColor(q.val);
                        const isActive = Math.abs(rating - q.val) < 0.2;
                        return (
                          <button
                            key={q.label}
                            type="button"
                            onClick={() => setRating(q.val)}
                            style={{
                              background: isActive ? `${chipColor}26` : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${isActive ? chipColor : 'var(--border)'}`,
                              borderRadius: '20px',
                              padding: '4px 12px',
                              fontSize: '12px',
                              color: isActive ? chipColor : 'var(--text-muted)',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              fontWeight: 700
                            }}
                          >
                            {q.label}
                          </button>
                        );
                      })}
                      {rating > 0 && (
                        <button type="button" onClick={() => setRating(0)}
                          style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 700 }}>
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2. Date Watched directly under score bar */}
                  <div style={{
                    background: '#151515',
                    border: '1px solid #282828',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fff' }}>
                      Date Watched
                    </div>
                    <input
                      type="date"
                      value={watchDate}
                      onChange={e => setWatchDate(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '13.5px', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', padding: '9px 12px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              {/* Row 2: Prominent Review Box */}
              <div style={{
                background: '#151515',
                border: '1px solid #282828',
                borderRadius: '12px',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fff' }}>
                      Your Review
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      · {review.trim() ? review.trim().split(/\s+/).length : 0} words
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      id="modal-rewatch-toggle"
                      type="button"
                      onClick={() => setIsRewatch(v => !v)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: isRewatch ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isRewatch ? 'var(--text-muted)' : '#303030'}`,
                        color: isRewatch ? '#fff' : 'var(--text-muted)',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <Repeat size={13} /> Rewatch
                    </button>
                    {isRewatch && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Times:</span>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={rewatchCount}
                          onChange={e => setRewatchCount(Number(e.target.value))}
                          style={{
                            width: '44px',
                            background: 'rgba(0,0,0,0.4)',
                            border: '1px solid #333',
                            borderRadius: '6px',
                            color: '#fff',
                            padding: '3px 6px',
                            fontSize: '11.5px',
                            textAlign: 'center'
                          }}
                        />
                      </div>
                    )}

                    <button
                      id="modal-spoiler-toggle"
                      type="button"
                      onClick={() => setContainsSpoilers(v => !v)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: containsSpoilers ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${containsSpoilers ? '#f59e0b' : '#303030'}`,
                        color: containsSpoilers ? '#fbbf24' : 'var(--text-muted)',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <EyeOff size={13} /> Contains spoilers
                    </button>
                  </div>
                </div>

                <textarea
                  id="review-textarea"
                  rows={3}
                  placeholder="What did you think about this title? Share your thoughts, highlights, or critique..."
                  value={review}
                  onChange={e => setReview(e.target.value)}
                  onInput={e => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 220) + 'px';
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.parentElement.style.borderColor = '#444';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.parentElement.style.borderColor = '#282828';
                  }}
                  style={{
                    width: '100%',
                    resize: 'none',
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    outline: 'none',
                    color: '#fff',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    fontFamily: 'inherit',
                    padding: '12px 14px',
                    minHeight: '90px',
                    maxHeight: '220px',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>

              {/* Row 3: Tags + Franchises (under Review Box) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
                {/* Tags */}
                <div>
                  <div className="form-label" style={{ marginBottom: '10px' }}>Tags <span style={{ color: 'var(--text-dim)', fontWeight: 400, textTransform: 'none', fontSize: '11px' }}>(Enter or click pill to add)</span></div>
                  <input type="text" placeholder="Add tags: Rewatch, Comfort, Must-See…" value={newTag}
                    onChange={e => setNewTag(e.target.value)} onKeyDown={handleAddTag}
                    className="form-input" style={{ fontSize: '13.5px', width: '100%' }} />

                  {/* Suggestions Chips */}
                  {availableTagSuggestions.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Suggested:</span>
                      {availableTagSuggestions.slice(0, 5).map(suggestion => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            if (!tags.includes(suggestion)) setTags(prev => [...prev, suggestion]);
                            setNewTag('');
                          }}
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'var(--text-muted)',
                            borderRadius: '14px',
                            padding: '2px 9px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'var(--accent)';
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.style.background = 'rgba(229,9,20,0.12)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.color = 'var(--text-muted)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                          }}
                          title={`Click to add #${suggestion}`}
                        >
                          + {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                      {tags.map(tag => (
                        <span key={tag} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', padding: '4px 10px 4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          #{tag}
                          <button onClick={() => setTags(tags.filter(t => t !== tag))} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '12px', padding: 0, lineHeight: 1, transition: 'color 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                          >✕</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Collections & Franchise Tagging */}
                <div>
                  <div className="form-label" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FolderHeart size={12} color="var(--accent)" /> Franchises &amp; Collections
                  </div>

                  {matchedCollections.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                      {matchedCollections.map(col => (
                        <span key={col.id} style={{ fontSize: '12px', fontWeight: 600, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '20px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {col.emoji} {col.shortTitle || col.title}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '10px' }}>
                      No predefined franchise detected.
                    </div>
                  )}

                  {suggestedFranchiseTags.filter(t => !tags.includes(t)).length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tag with:</span>
                      {suggestedFranchiseTags.filter(t => !tags.includes(t)).map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setTags(prev => [...prev, st])}
                          style={{ background: 'transparent', border: '1px dashed var(--text-dim)', color: 'var(--text-muted)', borderRadius: '20px', padding: '3px 10px', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--text-dim)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                          title={`Click to add #${st} tag to this movie`}
                        >
                          + {st}
                        </button>
                      ))}
                    </div>
                  )}

                  {Object.keys(customCollections).length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Custom list:</span>
                      <select
                        onChange={e => {
                          const collName = e.target.value;
                          if (!collName) return;
                          const mId = String(movie.id || movie.tmdb_id);
                          const colData = customCollections[collName] || { movieIds: [] };
                          const curIds = colData.movieIds || [];
                          const updatedIds = curIds.includes(mId)
                            ? curIds.filter(id => id !== mId)
                            : [...curIds, mId];
                          const updated = {
                            ...customCollections,
                            [collName]: { ...colData, movieIds: updatedIds }
                          };
                          setCustomCollections(updated);
                          localStorage.setItem('cinelog_collections_v1', JSON.stringify(updated));
                          window.dispatchEvent(new Event('cinelog_collections_updated'));
                          e.target.value = '';
                        }}
                        defaultValue=""
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '12px', padding: '5px 10px', cursor: 'pointer' }}
                      >
                        <option value="" disabled>Add/Remove from list…</option>
                        {Object.entries(customCollections).map(([name, data]) => {
                          const mId = String(movie.id || movie.tmdb_id);
                          const inList = (data.movieIds || []).includes(mId);
                          return (
                            <option key={name} value={name} style={{ background: '#0a0813' }}>
                              {inList ? '✓ ' : '+ '} {data.emoji || '🎬'} {name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ── EPISODES & SEASONS SECTION ── */}
          {activeSection === 'episodes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Seasons Selector Header */}
              {details?.seasons && details.seasons.length > 0 ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      Select Season
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      Rate the whole season or individual episodes below
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                    {details.seasons.map(s => {
                      const directSeasonRating = seasonRatings[String(s.season_number)];
                      const seasonAvg = getSeasonAverage(s.season_number);
                      const isSel = selectedSeason === s.season_number;
                      const sRatingColor = directSeasonRating > 0 ? getRatingColor(directSeasonRating) : seasonAvg !== null ? getRatingColor(seasonAvg) : null;
                      return (
                        <button
                          key={s.season_number}
                          type="button"
                          onClick={() => setSelectedSeason(s.season_number)}
                          style={{
                            background: isSel ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${isSel ? (sRatingColor || accentColor) : 'var(--border)'}`,
                            color: isSel ? '#fff' : 'var(--text)',
                            borderRadius: '8px', padding: '7px 14px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', gap: '6px'
                          }}
                          onMouseEnter={e => { if (!isSel) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                          onMouseLeave={e => { if (!isSel) e.currentTarget.style.borderColor = 'var(--border)'; }}
                        >
                          <span>{s.name || `Season ${s.season_number}`}</span>
                          <span style={{ fontSize: '11px', opacity: 0.7 }}>({s.episode_count} eps)</span>
                          {directSeasonRating > 0 ? (
                            <span style={{ background: `${getRatingColor(directSeasonRating)}22`, border: `1px solid ${getRatingColor(directSeasonRating)}55`, color: getRatingColor(directSeasonRating), padding: '1px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: 900 }}>
                              ★ {Number(directSeasonRating).toFixed(1)}
                            </span>
                          ) : seasonAvg !== null ? (
                            <span style={{ background: `${getRatingColor(seasonAvg)}18`, border: `1px solid ${getRatingColor(seasonAvg)}40`, color: getRatingColor(seasonAvg), padding: '1px 7px', borderRadius: '10px', fontSize: '10.5px', fontWeight: 800 }} title="Average of rated episodes">
                              ★ {seasonAvg.toFixed(1)} <span style={{ fontSize: '9px', opacity: 0.75 }}>avg</span>
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No seasons found.</div>
              )}

              {/* ── CURRENT SEASON RATING & REVIEW CARD ── */}
              {(() => {
                const curSeasonKey = String(selectedSeason);
                const currentSeasonRating = seasonRatings[curSeasonKey] || 0;
                const currentSeasonNote = seasonNotes[curSeasonKey] || '';
                const currentSeasonDate = seasonDates[curSeasonKey] || '';
                const epAvg = getSeasonAverage(selectedSeason);
                const ratedEpCount = getSeasonRatedEpCount(selectedSeason);
                const hasSeasonReviewOrDate = Boolean(currentSeasonNote || currentSeasonDate);
                const curSeasonInfo = details?.seasons?.find(s => s.season_number === selectedSeason);
                const seasonColor = currentSeasonRating > 0 ? getRatingColor(currentSeasonRating) : 'var(--text-dim)';
                const seasonTrackFill = currentSeasonRating > 0
                  ? `linear-gradient(to right, ${seasonColor} 0%, ${seasonColor} ${currentSeasonRating * 10}%, rgba(255,255,255,0.08) ${currentSeasonRating * 10}%, rgba(255,255,255,0.08) 100%)`
                  : 'rgba(255,255,255,0.08)';

                return (
                  <div
                    className="glass"
                    style={{
                      padding: '18px 20px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(20,20,30,0.4) 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
                    }}
                  >
                    {/* Header row: Season Name + Score badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '17px', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>
                          {curSeasonInfo?.name || `Season ${selectedSeason}`} Overall Rating
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                          Full Season Score
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>
                          {ratingLabel(currentSeasonRating)}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          <span style={{ fontSize: '30px', fontWeight: 900, color: seasonColor, fontFamily: 'var(--font-heading)', letterSpacing: '-0.5px', lineHeight: 1 }}>
                            {currentSeasonRating > 0 ? currentSeasonRating.toFixed(1) : '—'}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>/ 10</span>
                        </div>
                        {currentSeasonRating > 0 && (
                          <button
                            type="button"
                            onClick={() => updateSeasonRating(selectedSeason, 0)}
                            style={{
                              background: 'rgba(239,68,68,0.1)',
                              border: '1px solid rgba(239,68,68,0.2)',
                              color: 'var(--red)',
                              fontSize: '11px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              transition: 'all 0.15s'
                            }}
                            title="Clear season rating"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Season Rating Slider */}
                    <div style={{ position: 'relative', padding: '4px 0' }}>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={Number(currentSeasonRating) || 0}
                        onChange={e => updateSeasonRating(selectedSeason, parseFloat(e.target.value) || 0)}
                        onInput={e => updateSeasonRating(selectedSeason, parseFloat(e.target.value) || 0)}
                        className="cinelog-rating-slider"
                        style={{
                          '--track-fill': seasonTrackFill,
                          '--thumb-color': seasonColor,
                          '--thumb-glow': currentSeasonRating > 0 ? `${seasonColor}88` : 'rgba(255,255,255,0.2)',
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => updateSeasonRating(selectedSeason, n)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '2px 4px',
                              cursor: 'pointer',
                              fontSize: '10px',
                              color: Math.abs(currentSeasonRating - n) < 0.6 ? seasonColor : 'var(--text-dim)',
                              fontWeight: Math.abs(currentSeasonRating - n) < 0.6 ? 800 : 400,
                              transition: 'color 0.15s'
                            }}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Rating Chips + Use Episode Avg button */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, marginRight: '2px' }}>Quick:</span>
                        {[
                          { label: '💀 1', val: 1.0 },
                          { label: '😐 5', val: 5.0 },
                          { label: '👍 7', val: 7.0 },
                          { label: '🔥 8.5', val: 8.5 },
                          { label: '⭐ 10', val: 10.0 }
                        ].map(chip => {
                          const chipColor = getRatingColor(chip.val);
                          const isActive = Math.abs(currentSeasonRating - chip.val) < 0.2;
                          return (
                            <button
                              key={chip.val}
                              type="button"
                              onClick={() => updateSeasonRating(selectedSeason, chip.val)}
                              style={{
                                background: isActive ? `${chipColor}26` : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${isActive ? chipColor : 'rgba(255,255,255,0.08)'}`,
                                color: isActive ? chipColor : 'var(--text-muted)',
                                borderRadius: '6px',
                                padding: '4px 10px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                            >
                              {chip.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* If user rated episodes in this season, offer to adopt the average */}
                      {epAvg !== null && (
                        <button
                          type="button"
                          onClick={() => updateSeasonRating(selectedSeason, epAvg)}
                          style={{
                            background: `${getRatingColor(epAvg)}18`,
                            border: `1px solid ${getRatingColor(epAvg)}45`,
                            color: getRatingColor(epAvg),
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = `${getRatingColor(epAvg)}28`}
                          onMouseLeave={e => e.currentTarget.style.background = `${getRatingColor(epAvg)}18`}
                          title={`Set season score to the average of your ${ratedEpCount} rated episode(s)`}
                        >
                          <span>★ Set to Episode Avg ({epAvg.toFixed(1)})</span>
                        </button>
                      )}

                      {/* Season Review / Date toggle */}
                      <button
                        type="button"
                        onClick={() => setExpandedSeasonLog(prev => !prev)}
                        style={{
                          background: expandedSeasonLog ? 'rgba(255,255,255,0.08)' : 'transparent',
                          border: `1px solid ${expandedSeasonLog ? 'rgba(255,255,255,0.18)' : 'var(--border)'}`,
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: hasSeasonReviewOrDate || expandedSeasonLog ? '#fff' : 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s'
                        }}
                      >
                        ✍️ {expandedSeasonLog ? 'Hide Season Review' : (hasSeasonReviewOrDate ? 'Edit Season Review & Date' : '+ Add Season Review & Date')}
                        <span style={{ fontSize: '9px', opacity: 0.6, transform: expandedSeasonLog ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                      </button>
                    </div>

                    {/* Expandable Season Review & Date */}
                    {expandedSeasonLog && (
                      <div
                        style={{
                          background: 'rgba(0,0,0,0.2)',
                          border: '1px dashed rgba(255,255,255,0.09)',
                          borderRadius: '8px',
                          padding: '12px 14px',
                          display: 'flex',
                          gap: '14px',
                          flexWrap: 'wrap',
                          animation: 'fadeIn 0.2s ease-out'
                        }}
                      >
                        <div style={{ flex: '1 1 160px', minWidth: '150px' }}>
                          <label style={{ display: 'block', fontSize: '9.5px', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                            Season Completed / Watched Date
                          </label>
                          <input
                            type="date"
                            value={currentSeasonDate}
                            onChange={e => updateSeasonWatchDate(selectedSeason, e.target.value)}
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

                        <div style={{ flex: '3 1 300px', minWidth: '240px' }}>
                          <label style={{ display: 'block', fontSize: '9.5px', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                            Season Review &amp; Verdict
                          </label>
                          <textarea
                            placeholder={`What did you think of Season ${selectedSeason} as a whole? Pacing, stand-out moments, arc...`}
                            value={currentSeasonNote}
                            onChange={e => updateSeasonNote(selectedSeason, e.target.value)}
                            className="form-input"
                            style={{
                              fontSize: '12.5px',
                              padding: '8px 10px',
                              minHeight: '65px',
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
              })()}

              {/* ── EPISODE-BY-EPISODE BREAKDOWN (COLLAPSIBLE) ── */}
              <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Header with expand/collapse and filter controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setShowEpisodesList(prev => !prev)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>Episode Breakdown ({seasonEpisodes.length})</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', transform: showEpisodesList ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        ▼
                      </span>
                    </button>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>
                      {showEpisodesList ? '(Optional: rate individual episodes)' : '(Collapsed — click to show)'}
                    </span>
                  </div>

                  {showEpisodesList && seasonEpisodes.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginRight: '2px' }}>Filter:</span>
                      {[
                        { id: 'all', label: `All (${seasonEpisodes.length})` },
                        {
                          id: 'rated',
                          label: `Rated (${seasonEpisodes.filter(ep => {
                            const k = `S${String(selectedSeason).padStart(2, '0')}E${String(ep.episode_number).padStart(2, '0')}`;
                            return episodeRatings[k] > 0;
                          }).length})`
                        },
                        {
                          id: 'unrated',
                          label: `Unrated (${seasonEpisodes.filter(ep => {
                            const k = `S${String(selectedSeason).padStart(2, '0')}E${String(ep.episode_number).padStart(2, '0')}`;
                            return !episodeRatings[k];
                          }).length})`
                        }
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setEpisodesFilter(f.id)}
                          style={{
                            background: episodesFilter === f.id ? 'rgba(255,255,255,0.12)' : 'transparent',
                            border: `1px solid ${episodesFilter === f.id ? 'rgba(255,255,255,0.25)' : 'var(--border)'}`,
                            color: episodesFilter === f.id ? '#fff' : 'var(--text-muted)',
                            borderRadius: '12px',
                            padding: '2px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Episodes List */}
                {showEpisodesList && (
                  <>
                    {loadingEpisodes ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading episodes…</div>
                    ) : seasonEpisodes && seasonEpisodes.length > 0 ? (
                      (() => {
                        const filteredEpisodes = seasonEpisodes.filter(ep => {
                          const epKey = `S${String(selectedSeason).padStart(2, '0')}E${String(ep.episode_number).padStart(2, '0')}`;
                          const isRated = episodeRatings[epKey] > 0;
                          if (episodesFilter === 'rated') return isRated;
                          if (episodesFilter === 'unrated') return !isRated;
                          return true;
                        });

                        if (filteredEpisodes.length === 0) {
                          return (
                            <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-dim)', fontSize: '13px' }}>
                              No {episodesFilter} episodes in this season.
                            </div>
                          );
                        }

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '45vh', overflowY: 'auto', paddingRight: '6px' }}>
                            {filteredEpisodes.map(ep => {
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
                                            <span style={{ background: 'rgba(136,8,8,0.15)', border: '1px solid rgba(136,8,8,0.3)', color: '#c0392b', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800 }}>
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
                                        {(() => {
                                          const epColor = epRating > 0 ? getRatingColor(epRating) : 'var(--text-dim)';
                                          const epTrackFill = epRating > 0
                                            ? `linear-gradient(to right, ${epColor} 0%, ${epColor} ${epRating * 10}%, rgba(255,255,255,0.06) ${epRating * 10}%, rgba(255,255,255,0.06) 100%)`
                                            : 'rgba(255,255,255,0.06)';

                                          return (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '220px' }}>
                                              <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rating:</span>
                                              <div style={{ flex: 1, position: 'relative', padding: '4px 0' }}>
                                                <input
                                                  type="range"
                                                  min="0"
                                                  max="10"
                                                  step="0.1"
                                                  value={Number(epRating) || 0}
                                                  onChange={e => updateEpisodeRating(epKey, parseFloat(e.target.value) || 0)}
                                                  onInput={e => updateEpisodeRating(epKey, parseFloat(e.target.value) || 0)}
                                                  className="cinelog-rating-slider cinelog-rating-slider-sm"
                                                  style={{
                                                    '--track-fill': epTrackFill,
                                                    '--thumb-color': epColor,
                                                    '--thumb-glow': epRating > 0 ? `${epColor}88` : 'rgba(255,255,255,0.2)',
                                                  }}
                                                />
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                                                  {[0, 2, 4, 6, 8, 10].map(n => (
                                                    <button
                                                      key={n}
                                                      type="button"
                                                      onClick={() => updateEpisodeRating(epKey, n)}
                                                      style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        padding: '1px 3px',
                                                        cursor: 'pointer',
                                                        fontSize: '9px',
                                                        color: Math.abs(epRating - n) < 0.6 ? epColor : 'var(--text-dim)',
                                                        fontWeight: Math.abs(epRating - n) < 0.6 ? 800 : 400,
                                                        transition: 'color 0.15s'
                                                      }}
                                                    >
                                                      {n}
                                                    </button>
                                                  ))}
                                                </div>
                                              </div>
                                              <span style={{ fontSize: '13px', fontWeight: 900, color: epColor, minWidth: '48px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
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
                                          );
                                        })()}

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
                        );
                      })()
                    ) : (
                      <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No episodes found for this season.</div>
                    )}
                  </>
                )}
              </div>
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
                    { label: 'Budget', val: formatMoney(details.budget) },
                    { label: 'Box Office', val: formatMoney(details.revenue) },
                    { label: 'Seasons', val: details.number_of_seasons ? `${details.number_of_seasons} seasons` : null },
                    { label: 'Episodes', val: details.number_of_episodes ? `${details.number_of_episodes} episodes` : null },
                    { label: 'Language', val: details.original_language?.toUpperCase() },
                    { label: 'Production', val: details.production_companies?.slice(0, 2).map(c => c.name).join(', ') },
                    { label: 'Countries', val: details.production_countries?.slice(0, 2).map(c => c.name).join(', ') },
                    { label: 'TMDB Score', val: details.vote_average ? `${details.vote_average.toFixed(1)} (${details.vote_count?.toLocaleString()} votes)` : null },
                    { label: 'Popularity', val: details.popularity ? `${details.popularity.toFixed(0)}` : null, hint: 'TMDB popularity index: a live score based on recent views, searches, watchlist adds and ratings. Higher = more buzz right now.' },
                  ].filter(r => r.val).map(row => (
                    <div key={row.label} title={row.hint} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', cursor: row.hint ? 'help' : 'default' }}>
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
          {activeSection === 'overview' && (
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

              {/* ── Community Reviews Spotlight on Overview ── */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                marginTop: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--accent)' }}>💬 Community Reviews</span>
                    {publicReviews.length > 0 && (
                      <span style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(var(--accent-rgb, 229,9,20), 0.15)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '12px' }}>
                        {publicReviews.length}
                      </span>
                    )}
                  </div>
                  {publicReviews.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveSection('reviews')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '4px 6px'
                      }}
                    >
                      View all ({publicReviews.length}) →
                    </button>
                  )}
                </div>

                {loadingReviews ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'center', padding: '16px 0' }}>
                    Loading community reviews…
                  </div>
                ) : publicReviews.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {publicReviews.slice(0, 2).map(r => (
                      <div
                        key={r.id}
                        onClick={() => setActiveSection('reviews')}
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '8px',
                          padding: '12px 14px',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'flex-start',
                          transition: 'border-color 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                      >
                        <img
                          src={r.avatar}
                          alt={r.displayName}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#fff' }}>{r.displayName}</span>
                            {r.rating && (
                              <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--gold)' }}>★ {Number(r.rating).toFixed(1)}</span>
                            )}
                          </div>
                          <p style={{
                            fontSize: '12px',
                            color: 'var(--text-muted)',
                            lineHeight: 1.45,
                            margin: '4px 0 0',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {r.review}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '12.5px', color: 'var(--text-dim)', textAlign: 'center', padding: '12px 0' }}>
                    No reviews yet · Share your thoughts on this title above!
                  </div>
                )}
              </div>
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                          {r.date_added ? (
                            <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                              {new Date(r.date_added).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                          ) : <div />}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleToggleReviewLike(r.id); }}
                            style={{
                              background: userLikedReviews[r.id] ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${userLikedReviews[r.id] ? 'var(--red)' : 'rgba(255,255,255,0.08)'}`,
                              borderRadius: '12px',
                              padding: '3px 9px',
                              color: userLikedReviews[r.id] ? 'var(--red)' : 'var(--text-muted)',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span>{userLikedReviews[r.id] ? '❤️' : '🤍'}</span>
                            <span>{reviewLikesCounts[r.id] || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>✍️</div>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>No Reviews Yet</div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '280px', margin: '0 auto' }}>
                    Be the first to share your thoughts on this title under "Your log"!
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
                  onClick={() => { if (onOpenMovie) onOpenMovie(item.id, movie.media_type === 'tv' ? 'tv' : 'movie'); }}
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

      </div>
    </div>
  );
}


