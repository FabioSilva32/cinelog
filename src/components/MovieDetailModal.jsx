import EpisodeTracker from './EpisodeTracker';
import {episodeKey,isEpisodeWatched} from '../utils/viewingHistory';
import {reviewSpoilerFlag} from '../utils/reviews';
import {persistReaction} from '../utils/reactions';
import { getRatingColor } from '../utils/ratingColors';
import {filmPath} from '../utils/navigation';
import {loadScreeningDetails,tmdbMediaType,selectTrailer} from '../utils/screeningDetails';
import ConfirmModal from './ConfirmModal';
import { initialWatchDate } from '../utils/dates';
import TrailerPlayer from './TrailerPlayer';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { CountrySelector } from './CountrySelector';
import { useCountry } from '../utils/useCountry';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Heart, Film, Tag, Star, Clock, Users, ExternalLink, Play, FolderHeart, Plus, Check, Eye, Bookmark, XCircle, Repeat, EyeOff, RotateCcw, History, Calendar, Trash2, Edit3, ArrowUpRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

import { getMovieCollections, getSuggestedTags } from '../utils/collections';
import { getEnhancedMovieTitle } from '../utils/movieTitles';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useToast } from './ToastSystem';

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
  const [mediaApiType,setMediaApiType]=useState(()=>tmdbMediaType(movie));
  const [detailsStatus,setDetailsStatus]=useState('loading'),[detailsError,setDetailsError]=useState(''),[detailsRetry,setDetailsRetry]=useState(0),[overviewLanguage,setOverviewLanguage]=useState('en'),[trailerInfo,setTrailerInfo]=useState(null);
  const [screeningRemoval,setScreeningRemoval]=useState(null);

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


  const episodeRatings = useMemo(() => episodeData.ratings || {}, [episodeData.ratings]);

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

  const [review, setReview] = useState(() => {
    if (!movie.review) return '';
    return movie.review
      .replace(/__EPISODE_DATA__:.+$/s, '')
      .replace(/__EPISODE_RATINGS__:.+$/s, '')
      .trim();
  });
  const toast = useToast();
  const [watchDate, setWatchDate] = useState(() => initialWatchDate(movie));
  const [containsSpoilers, setContainsSpoilers] = useState(reviewSpoilerFlag(movie));

  // Parse existing screenings (re-log history)
  const [screenings, setScreenings] = useState(() => {
    if (Array.isArray(movie.screenings) && movie.screenings.length > 0) {
      return movie.screenings;
    }
    if (movie.episode_data?.screenings && Array.isArray(movie.episode_data.screenings) && movie.episode_data.screenings.length > 0) {
      return movie.episode_data.screenings;
    }
    // Seed initial screening if movie was previously logged/watched
    if (movie.status === 'watched' && (movie.watch_date || movie.rating > 0 || movie.date_added)) {
      const d = movie.watch_date ? movie.watch_date.slice(0, 10) : (movie.date_added ? movie.date_added.slice(0, 10) : new Date().toISOString().slice(0, 10));
      const cleanR = (movie.review || '')
        .replace(/__EPISODE_DATA__:.+$/s, '')
        .replace(/__EPISODE_RATINGS__:.+$/s, '')
        .trim();
      return [{
        id: 'screening_1',
        date: d,
        rating: movie.rating != null ? Number(movie.rating) : null,
        review: cleanR,
        is_rewatch: Boolean(movie.is_rewatch),
        created_at: movie.date_added || new Date().toISOString()
      }];
    }
    return [];
  });

  const [isRewatch, setIsRewatch] = useState(() => (screenings.length > 1 || movie.is_rewatch || false));
  const [rewatchCount, setRewatchCount] = useState(() => (screenings.length > 1 ? screenings.length : (movie.rewatch_count || 1)));

  // Re-log Form State (Letterboxd-style log again with new score)
  const [showRelogForm, setShowRelogForm] = useState(false);
  const [relogDate, setRelogDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [relogRating, setRelogRating] = useState(() => (movie.rating != null && Number(movie.rating) > 0 ? Number(movie.rating) : 7.0));
  const [relogReview, setRelogReview] = useState('');
  const [savePending,setSavePending]=useState(false),[saveError,setSaveError]=useState('');const saveBusy=useRef(false),reactionBusy=useRef(new Set());

  const handleAddRelog = async (e) => {
    e?.preventDefault?.();if(saveBusy.current)return;saveBusy.current=true;setSavePending(true);setSaveError('');
    const newRatingNum = Number(relogRating) || 0;
    const newScreening = {
      id: `scr_${Date.now()}`,
      date: relogDate,
      rating: newRatingNum > 0 ? newRatingNum : null,
      review: relogReview.trim(),
      is_rewatch: true,
      created_at: new Date().toISOString()
    };

    // Ensure initial watch is preserved in screening history if it wasn't already seeded
    let baseScreenings = Array.isArray(screenings) ? [...screenings] : [];
    if (baseScreenings.length === 0 && (movie.status === 'watched' || rating > 0 || watchDate || movie.watch_date || movie.rating > 0 || movie.date_added)) {
      const initialDate = (watchDate || movie.watch_date || movie.date_added || new Date().toISOString()).slice(0, 10);
      const cleanR = (movie.review || '')
        .replace(/__EPISODE_DATA__:.+$/s, '')
        .replace(/__EPISODE_RATINGS__:.+$/s, '')
        .trim();
      baseScreenings = [{
        id: 'screening_1',
        date: initialDate,
        rating: (rating != null && Number(rating) > 0) ? Number(rating) : (movie.rating != null ? Number(movie.rating) : null),
        review: cleanR,
        is_rewatch: false,
        created_at: movie.date_added || new Date().toISOString()
      }];
    }

    const updated = [newScreening, ...baseScreenings];
    const finalReview = relogReview.trim() || review;

    // Construct the complete updated movie payload to persist immediately
    const isTv = mediaApiType === 'tv' ||
                 movie.number_of_seasons !== undefined ||
                 movie.first_air_date !== undefined ||
                 Boolean(details && (details.number_of_seasons !== undefined || details.first_air_date));
    const resolvedType = movie.media_type==='anime'?'anime':isTv ? 'tv' : (movie.media_type || 'movie');
    const resolvedGenres = movie.genres || details?.genres?.map(g => g.name) || [];
    const directorName = movie.director || details?.credits?.crew?.find(c => c.job === 'Director')?.name || null;

    const mergedEpisodeData = {
      ...episodeData,
      ratings: episodeData.ratings || {},
      notes: episodeData.notes || {},
      dates: episodeData.dates || {},
      season_ratings: seasonRatings,
      season_notes: seasonNotes,
      season_dates: seasonDates,
      screenings: updated
    };

    const updatedMoviePayload = {
      ...movie,
      media_type: resolvedType,
      status: 'watched',
      rating: newRatingNum > 0 ? newRatingNum : null,
      review: finalReview,
      screenings: updated,
      episode_data: mergedEpisodeData,
      episode_ratings: mergedEpisodeData.ratings,
      episode_notes: mergedEpisodeData.notes,
      episode_watch_dates: mergedEpisodeData.dates,
      season_ratings: seasonRatings,
      season_notes: seasonNotes,
      season_dates: seasonDates,
      tags,
      genres: resolvedGenres,
      director: directorName,
      watch_date: relogDate,
      contains_spoilers: containsSpoilers,
      is_rewatch: true,
      rewatch_count: updated.length,
    };

    try{const saved=await onSave(updatedMoviePayload,{keepOpen:true,requireCloudSuccess:true});if(saved===false)throw new Error('Your screening could not be saved. Please try again.');
    setScreenings(updated);

    // Update active movie state to this latest watch
    setStatus('watched');
    setRating(newRatingNum);
    setWatchDate(relogDate);
    if (relogReview.trim()) {
      setReview(relogReview.trim());
    }
    setIsRewatch(true);
    setRewatchCount(updated.length);
    setShowRelogForm(false);
    setRelogReview('');


    }catch(error){setSaveError(error.message);}finally{saveBusy.current=false;setSavePending(false);}
  };

  const handleDeleteScreening = async (scrId, e) => {
    e?.stopPropagation?.();
    const remaining = screenings.filter(s => s.id !== scrId);
    let newLatestRating = rating;
    let newLatestDate = watchDate;
    let newLatestReview = review;
    if (remaining.length > 0) {
      const latest = remaining[0];
      newLatestRating = latest.rating != null ? Number(latest.rating) : 0;
      newLatestDate = latest.date || watchDate;
      if (latest.review) newLatestReview = latest.review;
    }

    const isTv = mediaApiType === 'tv' ||
                 movie.number_of_seasons !== undefined ||
                 movie.first_air_date !== undefined ||
                 Boolean(details && (details.number_of_seasons !== undefined || details.first_air_date));
    const resolvedType = movie.media_type==='anime'?'anime':isTv ? 'tv' : (movie.media_type || 'movie');
    const resolvedGenres = movie.genres || details?.genres?.map(g => g.name) || [];
    const directorName = movie.director || details?.credits?.crew?.find(c => c.job === 'Director')?.name || null;

    const mergedEpisodeData = {
      ...episodeData,
      ratings: episodeData.ratings || {},
      notes: episodeData.notes || {},
      dates: episodeData.dates || {},
      season_ratings: seasonRatings,
      season_notes: seasonNotes,
      season_dates: seasonDates,
      screenings: remaining
    };

    const updatedMoviePayload = {
      ...movie,
      media_type: resolvedType,
      status: remaining.length > 0 ? 'watched' : status,
      rating: newLatestRating > 0 ? newLatestRating : null,
      review: newLatestReview,
      screenings: remaining,
      episode_data: mergedEpisodeData,
      episode_ratings: mergedEpisodeData.ratings,
      episode_notes: mergedEpisodeData.notes,
      episode_watch_dates: mergedEpisodeData.dates,
      season_ratings: seasonRatings,
      season_notes: seasonNotes,
      season_dates: seasonDates,
      tags,
      genres: resolvedGenres,
      director: directorName,
      watch_date: newLatestDate,
      contains_spoilers: containsSpoilers,
      is_rewatch: remaining.length > 1,
      rewatch_count: Math.max(1, remaining.length),
    };

    // Persist screening removal to database and library
    if (onSave) {
      const result=await onSave(updatedMoviePayload, { keepOpen: true,requireCloudSuccess:true });
      if(result===false)throw new Error('This screening could not be removed. Please try again.');
    }
  };
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
  const [trailerKey,setTrailerKey]=useState(()=>selectTrailer(movie.videos?.results||movie.details?.videos?.results)?.key||'');
  const [country, setCountry] = useCountry();
  const [activeSection, setActiveSection] = useState(movie.screening_start_section==='episodes'?'episodes':'overview');
  const [logOpen, setLogOpen] = useState(true);
  const [publicReviews, setPublicReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [revealedReviews, setRevealedReviews] = useState({});
  const [reviewLikesCounts, setReviewLikesCounts] = useState({});
  const [userLikedReviews, setUserLikedReviews] = useState({});
  const [selectedSeason, setSelectedSeason] = useState(Number(movie.screening_start_season)||1);
  const [seasonEpisodes, setSeasonEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [episodeLoadError,setEpisodeLoadError]=useState(''),[episodeRetry,setEpisodeRetry]=useState(0);
  const [watchProviders, setWatchProviders] = useState(null);
  const [providerStatus,setProviderStatus]=useState('loading');
  const [providerRetry,setProviderRetry]=useState(0);

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
        id: movie.id || 'user-current-review',
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
                contains_spoilers: reviewSpoilerFlag(item)
              });
            });
          }
        } catch (err) {
          console.error("Error loading public reviews from Supabase:", err);
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
  }, [targetTmdbId, review, rating, containsSpoilers, currentUser?.id, currentUser?.username,currentUser?.displayName,currentUser?.display_name,currentUser?.avatar,currentUser?.avatar_url,movie.review,movie.id,movie.title,movie.rating,movie.date_added,watchDate]);

  const handleToggleReviewLike=async reviewId=>{if(!currentUser?.id||reactionBusy.current.has(reviewId))return;reactionBusy.current.add(reviewId);try{const next=!userLikedReviews[reviewId];await persistReaction(supabase,'review_likes',reviewId,currentUser.id,next);setUserLikedReviews(prev=>({...prev,[reviewId]:next}));setReviewLikesCounts(prev=>({...prev,[reviewId]:Math.max(0,(prev[reviewId]||0)+(next?1:-1))}));}catch(error){toast?.error?.('Reaction not saved',error.message);}finally{reactionBusy.current.delete(reviewId);}};

  useEffect(()=>{
    let live=true;const controller=new AbortController();setDetailsStatus('loading');setDetailsError('');setDetails(movie.details||null);setTrailerKey('');setTrailerInfo(null);setCast([]);
    const timeout=setTimeout(()=>controller.abort(),15000);
    loadScreeningDetails(movie,{apiKey:TMDB_KEY,signal:controller.signal}).then(result=>{if(!live)return;const route=new URL(window.location.href);if(route.pathname.startsWith('/film/')&&decodeURIComponent(route.pathname.split('/')[3]||'')===String(movie.tmdb_id||movie.id)){route.pathname=filmPath(movie.tmdb_id||movie.id,result.mediaType);window.history.replaceState({...window.history.state,mediaType:result.mediaType},'',route.pathname+route.search+route.hash);}setDetails(result.details);setMediaApiType(result.mediaType);setTrailerKey(result.trailer?.key||'');setTrailerInfo(result.trailer);setOverviewLanguage(result.overviewLanguage);setCast(result.details.credits?.cast||[]);setDetailsStatus('ready');if(result.refreshFailed)setDetailsError('Could not refresh details. Showing saved information.');else if(result.partialFailure)setDetailsError('Some story or trailer information could not be loaded. Please try again.');}).catch(error=>{if(!live)return;setDetailsStatus('error');setDetailsError(error.name==='AbortError'?'Loading took too long. Please try again.':error.message);}).finally(()=>clearTimeout(timeout));
    return()=>{live=false;clearTimeout(timeout);controller.abort();};
  },[movie,detailsRetry]);

  useEffect(()=>{if(!targetTmdbId||detailsStatus!=='ready')return;let live=true;const base='https://api.themoviedb.org/3/'+mediaApiType+'/'+targetTmdbId;const query='?api_key='+TMDB_KEY+'&language=en-US';const request=path=>fetch(base+path+query).then(response=>{if(!response.ok)throw new Error();return response.json();});setSimilar([]);request('/recommendations').then(async data=>{const good=(data.results||[]).filter(item=>item.poster_path&&item.vote_average>0);if(good.length>=4)return good;const extra=await request('/similar').catch(()=>({results:[]}));return [...good,...(extra.results||[]).filter(item=>item.poster_path&&item.vote_average>0&&!good.some(existing=>existing.id===item.id))];}).then(items=>{if(live)setSimilar(items.slice(0,8));}).catch(()=>{if(live)setSimilar([]);});return()=>{live=false;};},[targetTmdbId,mediaApiType,detailsStatus]);

  useEffect(() => {
    if (mediaApiType !== 'tv' || !targetTmdbId || detailsStatus!=='ready') return;
    
    let active = true;
    setLoadingEpisodes(true);setSeasonEpisodes([]);setEpisodeLoadError('');
    
    const url = `https://api.themoviedb.org/3/tv/${targetTmdbId}/season/${selectedSeason}?api_key=${TMDB_KEY}&language=en-US`;
    
    fetch(url)
      .then(r => {if(!r.ok)throw Error('Season details could not be loaded.');return r.json();})
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
          setSeasonEpisodes([]);setEpisodeLoadError('This season could not be loaded. Try again.');
          setLoadingEpisodes(false);
        }
      });

    return()=>{active=false;};
  }, [targetTmdbId, mediaApiType, selectedSeason,detailsStatus,episodeRetry]);

  // Fetch only the selected country's availability; ignore stale responses.
  useEffect(() => {
    if (!targetTmdbId) return;
    if(detailsStatus!=='ready'){setWatchProviders(null);setProviderStatus(detailsStatus==='error'?'error':'loading');return;}
    let cancelled = false;
    setWatchProviders(null);
    setProviderStatus('loading');
    const mt = mediaApiType;
    fetch(`https://api.themoviedb.org/3/${mt}/${targetTmdbId}/watch/providers?api_key=${TMDB_KEY}`)
      .then(r => { if (!r.ok) throw new Error('Providers unavailable'); return r.json(); })
      .then(data => { if (!cancelled){setWatchProviders(data.results?.[country] || null);setProviderStatus('ready');} })
      .catch(() => { if (!cancelled){setWatchProviders(null);setProviderStatus('error');} });
    return () => { cancelled = true; };
  }, [targetTmdbId, mediaApiType, country, providerRetry,detailsStatus]);

  // Auto-calculate main TV series rating average:
  // 1. If season ratings exist, average the seasons!
  // 2. Otherwise if episode ratings exist, average the episodes!
  useEffect(() => {
    if (mediaApiType !== 'tv') return;
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
  }, [seasonRatings, episodeRatings, mediaApiType]);

  const availableTagSuggestions = useMemo(() => {
    const q = newTag.trim().toLowerCase();
    const active = new Set(tags.map(t => t.toLowerCase()));
    return POPULAR_CINE_TAGS.filter(t => !active.has(t.toLowerCase()) && (!q || t.toLowerCase().includes(q)));
  }, [newTag, tags]);

  const addCurrentTag = () => {
    const clean = newTag.trim().replace(/^#/, '');
    if (clean && !tags.some(tag => tag.toLowerCase() === clean.toLowerCase())) setTags(prev => [...prev, clean]);
    setNewTag('');
  };
  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && newTag.trim()) {
      e.preventDefault();
      addCurrentTag();
    }
  };

  const handleSave = async ({progressOnly=false}={}) => {
    if(saveBusy.current)return;saveBusy.current=true;setSavePending(true);setSaveError('');try{
    const isTv = mediaApiType === 'tv' ||
                 movie.number_of_seasons !== undefined ||
                 movie.first_air_date !== undefined ||
                 Boolean(details && (details.number_of_seasons !== undefined || details.first_air_date));
    const resolvedType = movie.media_type==='anime'?'anime':isTv ? 'tv' : (movie.media_type || 'movie');
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

    const activeScreenings = progressOnly ? screenings : screenings.length > 0 ? screenings.map((s, idx) => {
      if (idx === 0) {
        return { ...s, date: watchDate, rating: status === 'watched' ? rating : null, review };
      }
      return s;
    }) : (status === 'watched' ? [{
      id: 'screening_1',
      date: watchDate,
      rating: rating != null ? rating : null,
      review,
      is_rewatch: isRewatch,
      created_at: new Date().toISOString()
    }] : []);

    const saved=await onSave({
      ...movie,
      media_type: resolvedType,
      status,
      rating: status === 'watched' ? rating : null,
      review,
      screenings: activeScreenings,
      episode_data: {
        ...mergedEpisodeData,
        screenings: activeScreenings
      },
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
      is_rewatch: activeScreenings.length > 1 || isRewatch,
      rewatch_count: activeScreenings.length > 1 ? activeScreenings.length : (isRewatch ? rewatchCount : null),
    },{keepOpen:progressOnly,requireCloudSuccess:true,silent:progressOnly});

    if(saved===false){setSaveError('Your changes could not be saved. Please retry.');return;}
    if (!progressOnly && isSupabaseConfigured && currentUser?.id) {
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
    }catch(error){setSaveError(error.message||'Your changes could not be saved.');}finally{saveBusy.current=false;setSavePending(false);}
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
    { id: 'log', label: 'Log / Rate' },
    { id: 'streaming', label: 'Streaming' },
    { id: 'episodes', label: 'Episode tracker', hidden: mediaApiType !== 'tv' },
    { id: 'details', label: 'Details' },
    { id: 'cast', label: 'Cast' },
    { id: 'reviews', label: publicReviews.length > 0 ? `Reviews (${publicReviews.length})` : 'Reviews' },
    { id: 'similar', label: 'Similar', hidden: similar.length === 0 },
  ].filter(s => !s.hidden);

  const STATUS_ICONS = { watched: Eye, plan_to_watch: Bookmark, watching: Play, dropped: XCircle };
  const STATUS_SHORT = { watched: 'Watched', plan_to_watch: 'Watchlist', watching: 'Watching', dropped: 'Dropped' };

  const touchStartRef = useRef(null);
  const dialogRef = useDialogFocus(!screeningRemoval);

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
        className="movie-detail-modal-dialog studio-film-dialog v2-film-workspace animate-fade-in-scale"
        ref={dialogRef} role="dialog" aria-modal="true" aria-label={movie.title || movie.name || "Film details"} tabIndex={-1}
        style={{ width: '100%', maxWidth: '1120px', maxHeight: '94vh', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative', display: 'flex', flexDirection: 'column', background: '#121212', overscrollBehaviorY: 'contain' }}
        onWheel={e => e.stopPropagation()}
      >
        <header className="v2-film-command"><span>CINELOG <i>/</i> THE SCREENING ROOM</span><button onClick={onClose} aria-label="Close film details"><X size={17}/> Back to browsing</button></header>
        <aside className="v2-film-rail">
          <div className="v2-film-identity">{(details?.poster_path || movie.poster_path) && <img src={`https://image.tmdb.org/t/p/w342${details?.poster_path || movie.poster_path}`} alt=""/>}<div><span className="studio-eyebrow">{mediaApiType === 'tv' ? 'THE SERIES' : 'THE FILM'}</span><h1>{movie.title || movie.name || details?.title || details?.name}</h1><p>{String(details?.release_date || details?.first_air_date || movie.release_year || '').slice(0,4)} {details?.runtime ? ` · ${details.runtime} min` : ''}</p>{details?.vote_average > 0 && <strong>★ {details.vote_average.toFixed(1)} <small>TMDB</small></strong>}</div></div>
          <nav aria-label="Film sections" className="v2-film-sections">{SECTIONS.map((section,index)=><button id={`modal-tab-${section.id}`} key={section.id} aria-current={activeSection===section.id?'page':undefined} onClick={()=>setActiveSection(section.id)}><span>0{index+1}</span>{section.id==='overview'?'The story':section.id==='log'?'Your screening':section.id==='streaming'?'Where to watch':section.label}<span>↗</span></button>)}</nav>
          <div className="v2-film-log-label">YOUR LIBRARY</div>
        {/* ── SYNOPSIS + ACTION ROW (fixed) ── */}
        <div className="movie-detail-actions-row" style={{ flexShrink: 0, padding: '20px 28px 0' }}>
          {saveError&&<p className="screening-error" role="alert">{saveError}</p>}<div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingBottom: '18px' }}>
            <button
              id="modal-save-btn"
              className="btn btn-primary"
              onClick={handleSave} disabled={savePending}
              style={{ fontSize: '14px', padding: '11px 26px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}
            >
              <Plus size={17} /> {savePending?'Saving…':movie.date_added && inLibrary ? 'Save Changes' : 'Add to Library'}
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

            {status === 'watched' && (
              <button
                id="modal-relog-btn"
                type="button"
                onClick={() => {
                  setActiveSection('log');
                  setShowRelogForm(prev => !prev);
                  if (!showRelogForm) {
                    setRelogDate(new Date().toISOString().split('T')[0]);
                    setRelogRating(rating > 0 ? rating : 7.0);
                  }
                }}
                style={{
                  background: showRelogForm ? 'var(--accent)' : '#1a1a1a',
                  border: `1px solid ${showRelogForm ? 'var(--accent)' : 'var(--border)'}`,
                  color: showRelogForm ? '#fff' : 'var(--text)',
                  borderRadius: '10px',
                  padding: '0 14px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap'
                }}
                title="Log another screening with a new date and score"
              >
                <RotateCcw size={16} />
                <span>{showRelogForm ? 'Close Re-log' : 'Re-log'}</span>
                {screenings.length > 1 && (
                  <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.18)', padding: '2px 6px', borderRadius: '10px', fontWeight: 900 }}>
                    {screenings.length}x
                  </span>
                )}
              </button>
            )}

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


          <p className="v2-rail-note">Choose a status, then save.<br/>Your story with this film starts here.</p>
        </aside>
        {/* ── SCROLLABLE BODY ── */}
        <div className="movie-detail-scroll-body v2-film-content" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', padding: '0 28px 28px', display: 'flex', flexDirection: 'column', gap: '22px', borderTop: '1px solid var(--border)', paddingTop: '16px', width: '100%', boxSizing: 'border-box' }}>
          {mediaApiType==='tv'&&['overview','log'].includes(activeSection)&&<button className="episode-tracker-entry" onClick={()=>setActiveSection('episodes')}><span><strong>Episode tracker</strong><small>Track what you’ve watched, season by season.</small></span><span>{seasonEpisodes.filter(ep=>isEpisodeWatched(episodeData,episodeKey(selectedSeason,ep.episode_number))).length} watched in {selectedSeason===0?'Specials':'Season '+selectedSeason} · Open tracker ↗</span></button>}
          {activeSection!=='episodes'&&<div className="v2-film-masthead" style={backdropUrl ? {backgroundImage:`linear-gradient(90deg,#13131577,#131315dd),url(${backdropUrl})`} : undefined}><span className="studio-eyebrow">{activeSection==='log'?(status==='plan_to_watch'?'ON YOUR WATCHLIST':'A MOMENT WORTH REMEMBERING'):'GO A LITTLE DEEPER'}</span><h2>{activeSection==='overview'?'Behind the story.':activeSection==='log'?(status==='plan_to_watch'?'A story for another night.':'Make it part of your story.'):activeSection==='streaming'?'Find your next screening.':SECTIONS.find(section=>section.id===activeSection)?.label}</h2><p>{activeSection==='overview'?'The people, the world, and the moments behind this story.':activeSection==='log'?(status==='plan_to_watch'?'Keep it on your list. Log your thoughts after you watch.':'A rating, a date, a few words. Keep what mattered.'):'A closer look, all in one place.'}</p></div>}
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
                id={`legacy-film-tab-${s.id}`}
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

          {activeSection === 'log' && <p className="studio-log-help">{status==='plan_to_watch'?'Save to your watchlist, or organise it with tags below.':'Choose your status, rating, and notes.'} Select {movie.date_added && inLibrary ? 'Save Changes' : 'Add to Library'} when you're ready.</p>}
          {/* ── LOG (rating, tags, review) ── */}
          <div className="screening-editor" style={{ display: activeSection === 'log' ? 'block' : 'none', flexShrink: 0 }}>
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
                    gap: '14px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="form-label" style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fff', margin: 0 }}>
                          Your Rating
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowRelogForm(v => !v);
                            if (!showRelogForm) {
                              setRelogDate(new Date().toISOString().split('T')[0]);
                              setRelogRating(rating > 0 ? rating : 7.0);
                            }
                          }}
                          style={{
                            background: showRelogForm ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                            border: `1px solid ${showRelogForm ? 'var(--accent)' : 'var(--border)'}`,
                            color: '#fff',
                            borderRadius: '16px',
                            padding: '3px 10px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s'
                          }}
                          title="Log another viewing with its own date and rating"
                        >
                          <RotateCcw size={12} />
                          <span>{showRelogForm ? 'Cancel Re-log' : 'Log Again'}</span>
                          {screenings.length > 1 && (
                            <span style={{ fontSize: '9.5px', background: 'rgba(0,0,0,0.3)', padding: '1px 5px', borderRadius: '8px', fontWeight: 900 }}>
                              {screenings.length}x
                            </span>
                          )}
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: 600 }}>{ratingLabel(rating)}</span>
                        <span style={{ fontSize: '32px', fontWeight: 900, color: ratingColor, fontFamily: 'var(--font-heading)', letterSpacing: '-1px', lineHeight: 1 }}>
                          {rating > 0 ? rating.toFixed(1) : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Re-log Form (Letterboxd-style log again with new score) */}
                    {showRelogForm && (
                      <div className="relog-card-container">
                        <div className="relog-card-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="relog-icon-bubble">
                              <RotateCcw size={16} color="var(--accent)" />
                            </div>
                            <div>
                              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#fff' }}>
                                Log Another Screening <span style={{ color: 'var(--accent)' }}>#{screenings.length + 1}</span>
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                Watched again? Record a new viewing date, updated score, and screening note.
                              </div>
                            </div>
                          </div>
                          <button type="button" onClick={() => setShowRelogForm(false)} className="relog-close-btn" title="Cancel">
                            ✕
                          </button>
                        </div>

                        {/* Live Score Comparison Banner */}
                        {rating > 0 && (
                          <div className="relog-comparison-banner">
                            <span>Previous: <strong>★ {rating.toFixed(1)}</strong></span>
                            <span>➔</span>
                            <span>This Watch: <strong style={{ color: getRatingColor(relogRating) }}>★ {Number(relogRating).toFixed(1)}</strong></span>
                            {Number(relogRating) !== Number(rating) && (
                              <span className={`relog-diff-pill ${relogRating > rating ? 'up' : 'down'}`}>
                                {relogRating > rating ? `+${(relogRating - rating).toFixed(1)}` : `${(relogRating - rating).toFixed(1)}`} ★
                              </span>
                            )}
                          </div>
                        )}

                        {/* Screening Date */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)' }}>
                            Screening Date
                          </label>
                          <input
                            type="date"
                            value={relogDate}
                            onChange={e => setRelogDate(e.target.value)}
                            className="form-input"
                            style={{ fontSize: '13px', padding: '8px 12px', background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid #333', borderRadius: '8px' }}
                          />
                        </div>

                        {/* Screening Score Slider */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)' }}>
                              Score for This Watch
                            </label>
                            <span style={{ fontSize: '24px', fontWeight: 900, color: getRatingColor(relogRating), fontFamily: 'var(--font-heading)' }}>
                              ★ {Number(relogRating).toFixed(1)}
                            </span>
                          </div>

                          <input
                            type="range"
                            aria-label="Rewatch rating"
                            min="0"
                            max="10"
                            step="0.1"
                            value={Number(relogRating) || 0}
                            onChange={e => setRelogRating(parseFloat(e.target.value) || 0)}
                            className="cinelog-rating-slider"
                            style={{
                              width: '100%',
                              '--track-fill': `linear-gradient(to right, ${getRatingColor(relogRating)} 0%, ${getRatingColor(relogRating)} ${relogRating * 10}%, rgba(255,255,255,0.08) ${relogRating * 10}%, rgba(255,255,255,0.08) 100%)`,
                              '--thumb-color': getRatingColor(relogRating),
                              '--thumb-glow': `${getRatingColor(relogRating)}88`,
                            }}
                          />

                          {/* Quick rating chips */}
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {[
                              { label: '1', val: 1 },
                              { label: '5', val: 5 },
                              { label: '7', val: 7 },
                              { label: '8.5', val: 8.5 },
                              { label: '10', val: 10 },
                            ].map(q => (
                              <button
                                key={q.label}
                                type="button"
                                onClick={() => setRelogRating(q.val)}
                                style={{
                                  background: Math.abs(relogRating - q.val) < 0.2 ? `${getRatingColor(q.val)}26` : 'rgba(255,255,255,0.05)',
                                  border: `1px solid ${Math.abs(relogRating - q.val) < 0.2 ? getRatingColor(q.val) : 'var(--border)'}`,
                                  borderRadius: '20px',
                                  padding: '3px 10px',
                                  fontSize: '11px',
                                  color: Math.abs(relogRating - q.val) < 0.2 ? getRatingColor(q.val) : 'var(--text-muted)',
                                  cursor: 'pointer',
                                  fontWeight: 700
                                }}
                              >
                                {q.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Optional Note */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)' }}>
                            Screening Note (Optional)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="How did this viewing compare? Noticed anything new on rewatch?"
                            value={relogReview}
                            onChange={e => setRelogReview(e.target.value)}
                            className="form-input"
                            style={{ fontSize: '13px', padding: '8px 12px', background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid #333', borderRadius: '8px', resize: 'vertical' }}
                          />
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setShowRelogForm(false)}
                            className="btn btn-secondary"
                            style={{ padding: '8px 16px', fontSize: '12.5px' }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddRelog}
                            className="btn btn-primary"
                            style={{ padding: '8px 20px', fontSize: '12.5px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Check size={15} /> Save Screening
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Standard Rating Slider (for active screening) */}
                    <div style={{ position: 'relative', padding: '4px 0', width: '100%' }}>
                      <input
                        type="range"
                        aria-label="Your rating"
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
                        { label: '1', val: 1 },
                        { label: '5', val: 5 },
                        { label: '7', val: 7 },
                        { label: '8.5', val: 8.5 },
                        { label: '10', val: 10 },
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

                    {/* Screening History Timeline (Letterboxd-style multi-watch records) */}
                    {screenings.length > 0 && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', marginTop: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <History size={13} color="var(--accent)" />
                            <span>Screening History ({screenings.length} {screenings.length === 1 ? 'watch' : 'watches'})</span>
                          </div>
                          {!showRelogForm && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowRelogForm(true);
                                setRelogDate(new Date().toISOString().split('T')[0]);
                                setRelogRating(rating > 0 ? rating : 7.0);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent)',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Plus size={13} /> Re-log Film
                            </button>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {screenings.map((scr, idx) => {
                            const isLatest = idx === 0;
                            const sColor = scr.rating ? getRatingColor(scr.rating) : 'var(--text-dim)';
                            const watchNum = screenings.length - idx;
                            const prevScr = screenings[idx + 1];
                            const diff = (prevScr && scr.rating && prevScr.rating) ? (scr.rating - prevScr.rating).toFixed(1) : null;

                            return (
                              <div
                                key={scr.id || idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 12px',
                                  background: isLatest ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                                  border: `1px solid ${isLatest ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
                                  borderRadius: '8px',
                                  gap: '10px',
                                  flexWrap: 'wrap'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                                  <span style={{ fontSize: '10.5px', fontWeight: 800, color: isLatest ? 'var(--accent)' : 'var(--text-dim)', background: isLatest ? 'rgba(var(--accent-rgb, 229,9,20), 0.15)' : 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '12px', whiteSpace: 'nowrap' }}>
                                    Watch #{watchNum} {watchNum > 1 && '🔄'}
                                  </span>
                                  <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>
                                    {scr.date || '—'}
                                  </span>
                                  {scr.review && (
                                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic', maxWidth: '220px' }}>
                                      "{scr.review}"
                                    </span>
                                  )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                  {scr.rating > 0 ? (
                                    <span style={{ fontSize: '12px', fontWeight: 900, color: sColor, background: `${sColor}18`, padding: '2px 8px', borderRadius: '6px', border: `1px solid ${sColor}33` }}>
                                      ★ {Number(scr.rating).toFixed(1)}
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>No rating</span>
                                  )}

                                  {diff && Number(diff) !== 0 && (
                                    <span style={{ fontSize: '10px', fontWeight: 800, color: Number(diff) > 0 ? 'var(--green)' : 'var(--red)', background: Number(diff) > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '1px 5px', borderRadius: '4px' }}>
                                      {Number(diff) > 0 ? `+${diff}` : diff}
                                    </span>
                                  )}

                                  {screenings.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={e=>{e.stopPropagation();setScreeningRemoval(scr);}}
                                      style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                                      title="Remove this screening"
                                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
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
                      Date Watched (Latest)
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

              {status==='plan_to_watch'&&!review.trim()&&<section className="watchlist-planning"><Bookmark size={22}/><div><h3>Save it for the right night.</h3><p>Your review starts after the credits. Find where to watch, or mark it watched when you're ready to log it.</p><div><button className="studio-secondary" onClick={()=>setActiveSection('streaming')}>Where to watch <ArrowUpRight size={14}/></button><button className="studio-text-button" onClick={()=>{setStatus('watched');setLogOpen(true);}}>I've watched this</button></div></div></section>}
              {/* Keep any existing review accessible without showing an empty editor on Watchlist. */}
              {(status!=='plan_to_watch'||Boolean(review.trim()))&&<div className="screening-review" style={{
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
                      Your take
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
                  aria-label="Screening notes"
                  rows={7}
                  placeholder="The scene you keep thinking about. The ending you loved. Your take, in your own words."
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
              </div>}

              {/* Organise this screening */}
              <div className="screening-tags" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
                {/* Tags */}
                <div>
                  <div className="form-label" style={{ marginBottom: '10px' }}>Organise your film <span style={{ color: 'var(--text-dim)', fontWeight: 400, textTransform: 'none', fontSize: '11px' }}>(Enter or click pill to add)</span></div>
                  <div className="screening-tag-input"><input aria-label="Film tag" type="text" placeholder="Add tags: Rewatch, Comfort, Must-See…" value={newTag}
                    onChange={e => setNewTag(e.target.value)} onKeyDown={handleAddTag}
                    className="form-input" style={{ fontSize: '13.5px', width: '100%' }} /><button className="studio-secondary" type="button" disabled={!newTag.trim().replace(/^#/, '')} onClick={addCurrentTag}>Add</button></div>

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

          {activeSection==='episodes'&&<EpisodeTracker seasons={details?.seasons||[]} selectedSeason={selectedSeason} onSelectSeason={setSelectedSeason} episodes={seasonEpisodes} loading={loadingEpisodes} error={episodeLoadError} onRetry={()=>setEpisodeRetry(n=>n+1)} data={episodeData} onChange={setEpisodeData} seasonRatings={seasonRatings} seasonNotes={seasonNotes} seasonDates={seasonDates} onSeasonRating={updateSeasonRating} onSeasonNote={updateSeasonNote} onSeasonDate={updateSeasonWatchDate} onSave={()=>handleSave({progressOnly:true})} saving={savePending}/>}

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
          {activeSection === 'streaming' && (
            <div className="streaming-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="streaming-panel-header">
                <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--accent)' }}>📺 Where to Watch</span>
                <CountrySelector country={country} onChange={setCountry} />
                {watchProviders?.link && (
                  <a href={watchProviders.link} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    More on JustWatch
                  </a>
                )}
              </div>

              {providerStatus==='loading'?<div className="workspace-state" role="status">Checking streaming availability…</div>:providerStatus==='error'?<div className="workspace-state" role="alert"><h3>Streaming services could not be loaded</h3><p>Please retry. A connection error does not mean this title is unavailable.</p><button className="studio-secondary" onClick={()=>{setProviderRetry(value=>value+1);if(detailsStatus==='error')setDetailsRetry(value=>value+1);}}>Try again</button></div>:!watchProviders || !['flatrate','rent','buy'].some(key=>watchProviders[key]?.length) ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
                  <div style={{ fontWeight: 700, marginBottom: '6px' }}>No services listed for this country</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Our provider has no streaming, rental or purchase listings here. Try another country or check JustWatch.</div>
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

          {activeSection === 'overview' && (
            <section className="film-overview">
              {detailsError&&<div className="film-info-error" role="alert"><p>{detailsError}</p><button className="studio-secondary" onClick={()=>setDetailsRetry(value=>value+1)}>Try again</button></div>}
              <div className="film-story"><h3>Story</h3><p>{String(details?.overview||'').trim() || String(movie.overview||'').trim() || (detailsStatus==='loading'?'Loading the story…':detailsStatus==='error'||detailsError?'Story information could not be loaded.':'No synopsis has been listed for this title yet.')}</p>{overviewLanguage!=='en'&&details?.overview&&<small>Synopsis available in {new Intl.DisplayNames(['en'],{type:'language'}).of(overviewLanguage)}.</small>}</div>
              {trailerKey?<div className="screening-trailer"><div className="screening-section-heading"><h3>{trailerInfo?.official?'Official '+(trailerInfo.type||'trailer').toLowerCase():trailerInfo?.type||'Trailer'}</h3><a href={'https://www.youtube.com/watch?v='+encodeURIComponent(trailerKey)} target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a></div><TrailerPlayer videoId={trailerKey} title={(movie.title||movie.name||'Film')+' trailer'}/></div>:<div className="film-trailer-empty" role="status"><h3>{detailsStatus==='loading'?'Finding a trailer…':'Trailer'}</h3><p>{detailsStatus==='loading'?'Checking the available videos for this title.':detailsStatus==='error'||detailsError?'Trailer information could not be loaded. Try again above.':'No trailer or teaser is listed for this title yet.'}</p>{detailsStatus==='ready'&&<a href={'https://www.youtube.com/results?search_query='+encodeURIComponent((movie.title||movie.name||'')+' official trailer')} target="_blank" rel="noopener noreferrer">Find a trailer on YouTube ↗</a>}</div>}
              {cast.length > 0 && <div className="film-overview-cast"><div className="screening-section-heading"><h3>Starring</h3><button className="studio-text-button" onClick={() => setActiveSection('cast')}>View full cast →</button></div><div className="overview-cast">{cast.slice(0,6).map(person => <div key={person.id}>{person.profile_path && <img src={`https://image.tmdb.org/t/p/w185`+person.profile_path} alt="" loading="lazy" />}<strong>{person.name}</strong><span>{person.character}</span></div>)}</div></div>}
              <button className="btn btn-secondary" onClick={() => setActiveSection('streaming')}>Where to watch →</button>
            </section>
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

          {/* ── SIMILAR SECTION ── */}
          {activeSection === 'similar' && similar.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' }}>
              {similar.map(item => (
                <div key={item.id} style={{ borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer', background: 'var(--surface-solid)', border: '1px solid var(--border)', transition: 'transform 0.2s' }}
                  onClick={() => { if (onOpenMovie) onOpenMovie(item.id, mediaApiType === 'tv' ? 'tv' : 'movie'); }}
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
      <ConfirmModal isOpen={Boolean(screeningRemoval)} title="Remove this screening?" message="This removes the selected entry from your viewing history. The film stays in your library. Any remaining screening becomes your active log." confirmText="Remove screening" cancelText="Keep screening" item={{...movie,title:movie.title||movie.name}} onCancel={()=>setScreeningRemoval(null)} onConfirm={()=>handleDeleteScreening(screeningRemoval.id)}/>
    </div>
  );
}


