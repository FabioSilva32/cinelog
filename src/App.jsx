import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import { DEFAULT_GREY_AVATAR } from './components/AvatarWithBorder';
import LibraryTab from './components/LibraryTab';
import ExploreTab from './components/ExploreTab';
import CollectionsTab from './components/CollectionsTab';
import TierListTab from './components/TierListTab';
import ProfileTab from './components/ProfileTab';
import AchievementsTab from './components/AchievementsTab';
import ConstellationTab from './components/ConstellationTab';
import WatchCalendarTab from './components/WatchCalendarTab';
import MovieDetailModal from './components/MovieDetailModal';
import StatsTab from './components/StatsTab';
import AuthModal from './components/AuthModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import ConfirmModal from './components/ConfirmModal';
import TriviaTab from './components/TriviaTab';
import ChallengesTab from './components/ChallengesTab';
import WrappedTab from './components/WrappedTab';
import ForYouTab from './components/ForYouTab';
import SocialTab from './components/SocialTab';
import UserProfileModal from './components/UserProfileModal';
import SettingsPanel, { applyTheme, THEMES } from './components/SettingsPanel';
import { ToastProvider, useToast } from './components/ToastSystem';
import { MOCK_USERS } from './mockData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const GENRE_MAP = {
  28:'Action', 12:'Adventure', 16:'Animation', 35:'Comedy', 80:'Crime',
  99:'Documentary', 18:'Drama', 10751:'Family', 14:'Fantasy', 36:'History',
  27:'Horror', 10402:'Music', 9648:'Mystery', 10749:'Romance', 878:'Sci-Fi',
  53:'Thriller', 10752:'War', 37:'Western', 10759:'Action & Adventure',
  10765:'Sci-Fi & Fantasy', 10764:'Reality',
};

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}

function AppInner() {
  const [activeTab, setActiveTab] = useState('landing');

  // Synchronize tab navigation with browser history (enables browser Back < and Forward > buttons)
  const handleTabChange = useCallback((newTab, replace = false) => {
    setActiveTab(newTab);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTab);
      if (replace) {
        window.history.replaceState({ tab: newTab }, '', url.toString());
      } else {
        window.history.pushState({ tab: newTab }, '', url.toString());
      }
    } catch (e) {}
  }, []);

  // Listen for browser Back/Forward (popstate) events
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const initialTab = params.get('tab');
      if (initialTab) {
        setActiveTab(initialTab);
        window.history.replaceState({ tab: initialTab }, '', window.location.href);
      } else {
        window.history.replaceState({ tab: 'landing' }, '', window.location.href);
      }
    } catch (e) {}

    const handlePopState = (e) => {
      if (e.state && e.state.tab) {
        setActiveTab(e.state.tab);
      } else {
        try {
          const p = new URLSearchParams(window.location.search);
          const t = p.get('tab') || 'landing';
          setActiveTab(t);
        } catch (err) {}
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommandCenter, setShowCommandCenter] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [quickResults, setQuickResults] = useState([]);
  const [quickLoading, setQuickLoading] = useState(false);
  const quickSearchRef = useRef(null);
  const [hoveredBackdrop, setHoveredBackdrop] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      setHoveredBackdrop(e.detail);
    };
    window.addEventListener('cinelogBackdropHover', handler);
    return () => window.removeEventListener('cinelogBackdropHover', handler);
  }, []);

  // Apply saved theme on startup
  React.useEffect(() => {
    const saved = localStorage.getItem('cinelog_theme');
    if (saved) {
      const theme = THEMES.find(t => t.id === saved);
      if (theme) applyTheme(theme);
    }
  }, []);

  // Quick-add search
  useEffect(() => {
    if (!quickSearch.trim()) { setQuickResults([]); return; }
    setQuickLoading(true);
    const timer = setTimeout(() => {
      fetch(`https://api.themoviedb.org/3/search/multi?api_key=6a2fd6b9b1bb3befbb9f14c203732225&query=${encodeURIComponent(quickSearch)}&page=1`)
        .then(r => r.json())
        .then(data => {
          setQuickResults((data.results || []).filter(r => r.media_type === 'movie' || r.media_type === 'tv').slice(0, 6));
          setQuickLoading(false);
        })
        .catch(() => setQuickLoading(false));
    }, 380);
    return () => clearTimeout(timer);
  }, [quickSearch]);

  useEffect(() => {
    if (showQuickAdd) {
      setTimeout(() => quickSearchRef.current?.focus(), 120);
    } else {
      setQuickSearch('');
      setQuickResults([]);
    }
  }, [showQuickAdd]);

  // Global keyboard shortcut for command center
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandCenter(prev => !prev);
        setCmdQuery('');
      }
      if (e.key === 'Escape') setShowCommandCenter(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Supabase database sync enabled
  const useSupabase = true;
  const handleSetUseSupabase = () => {};

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cinelog_supabase_cached_user');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  const [library, setLibrary] = useState(() => {
    return [];
  });
  const [showAuth, setShowAuth] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [activeEditMovie, setActiveEditMovie] = useState(null);
  const [viewingUserProfile, setViewingUserProfile] = useState(null);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);

  useEffect(() => {
    localStorage.setItem('cinelog_mode', 'supabase');
  }, []);

  useEffect(() => {
    if (!useSupabase) {
      setLibrary([]);
      setCurrentUser(null);
      setIsLibraryLoaded(true);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowRecoveryModal(true);
      }
      if (session?.user) {
        // Immediately set a fallback user representation to keep UI responsive
        setCurrentUser({
          id: session.user.id,
          username: session.user.email ? session.user.email.split('@')[0] : 'user',
          displayName: session.user.email ? session.user.email.split('@')[0] : 'User',
          avatar: DEFAULT_GREY_AVATAR,
          bio: '',
          favorites: [],
          followersCount: 0,
          followingCount: 0,
        });

        // Load local shop persistence for this user
        const localShopStr = localStorage.getItem(`cinelog_shop_${session.user.id}`);
        let localShop = {};
        try { if (localShopStr) localShop = JSON.parse(localShopStr); } catch {}

        // Parallel load of profile details
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data: profile }) => {
            if (profile) {
              const fullUser = {
                id: session.user.id,
                username: profile.username || (session.user.email ? session.user.email.split('@')[0] : 'user'),
                displayName: profile.display_name || (session.user.email ? session.user.email.split('@')[0] : 'User'),
                avatar: profile.avatar_url || DEFAULT_GREY_AVATAR,
                bio: profile.bio || '',
                favorites: profile.favorites || [],
                equippedBorder: profile.equipped_border || localShop.equippedBorder || localStorage.getItem(`equipped_border_${session.user.id}`) || 'none',
                bannerUrl: profile.banner_url || localShop.bannerUrl || '',
                spentCinePoints: profile.spent_cine_points ?? localShop.spentCinePoints ?? 0,
                purchasedBorders: profile.purchased_borders || localShop.purchasedBorders || [],
                purchasedBadges: profile.purchased_badges || localShop.purchasedBadges || [],
                purchasedBanners: profile.purchased_banners || localShop.purchasedBanners || [],
                purchasedThemes: profile.purchased_themes || localShop.purchasedThemes || [],
                triviaCinePoints: profile.trivia_cine_points ?? localShop.triviaCinePoints ?? 0,
              };
              setCurrentUser(fullUser);
              localStorage.setItem('cinelog_supabase_cached_user', JSON.stringify(fullUser));
            }
          })
          .catch(err => console.error("Error loading user profile:", err));

        // Parallel load of movie entries from Supabase
        supabase.from('library').select('*').eq('user_id', session.user.id)
          .then(({ data: libRows, error: libErr }) => {
            if (libErr) {
              console.error('Supabase library load error:', libErr);
            }

            if (libRows && libRows.length > 0) {
              // Cloud has data — use it and cache to localStorage
              const mapped = libRows.map(row => {
                let parsedEpisodeData = { ratings: {}, notes: {}, dates: {} };
                let cleanReview = row.review || '';
                if (row.review) {
                  const match = row.review.match(/__EPISODE_DATA__:(.+)$/s);
                  if (match) {
                    try {
                      parsedEpisodeData = JSON.parse(match[1]);
                      cleanReview = row.review.replace(/__EPISODE_DATA__:.+$/s, '').trim();
                    } catch {}
                  } else {
                    const oldMatch = row.review.match(/__EPISODE_RATINGS__:(.+)$/s);
                    if (oldMatch) {
                      try {
                        const oldRatings = JSON.parse(oldMatch[1]);
                        parsedEpisodeData = { ratings: oldRatings, notes: {}, dates: {} };
                        cleanReview = row.review.replace(/__EPISODE_RATINGS__:.+$/s, '').trim();
                      } catch {}
                    }
                  }
                }
                return {
                  id: row.id,
                  tmdb_id: row.tmdb_id,
                  media_type: row.media_type,
                  title: row.title,
                  poster_path: row.poster_path,
                  release_year: row.release_year,
                  genres: row.genres,
                  status: row.status,
                  // DB rating is now directly 0-10 scale matching the UI
                  rating: row.rating != null ? Number(row.rating) : null,
                  review: cleanReview,
                  episode_ratings: parsedEpisodeData.ratings || {},
                  episode_notes: parsedEpisodeData.notes || {},
                  episode_watch_dates: parsedEpisodeData.dates || {},
                  episode_data: parsedEpisodeData,
                  favorite: row.favorite,
                  date_added: row.date_added,
                  tags: row.tags,
                  director: row.director,
                };
              });
              setLibrary(mapped);
              // Keep localStorage in sync as a local cache
              localStorage.setItem('cinelog_library_v2', JSON.stringify(mapped));
            } else {
              // New user or empty library in cloud database: start with clean empty library
              setLibrary([]);
              localStorage.removeItem('cinelog_library_v2');
            }
            setIsLibraryLoaded(true);
          })
          .catch(err => {
            console.error('Error loading library from cloud database:', err);
            setLibrary([]);
            setIsLibraryLoaded(true);
          });
      } else {
        // Logged out in Supabase mode: clean empty library
        setCurrentUser(null);
        localStorage.removeItem('cinelog_supabase_cached_user');
        localStorage.removeItem('cinelog_library_v2');
        setLibrary([]);
        setIsLibraryLoaded(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [useSupabase]);

  useEffect(() => {
    // Always write to localStorage as a local cache backup
    // This ensures data survives even if Supabase sync fails
    if (!isLibraryLoaded) return;
    localStorage.setItem('cinelog_library_v2', JSON.stringify(library));
  }, [library, isLibraryLoaded]);

  useEffect(() => {
    if (!useSupabase) {
      if (currentUser) localStorage.setItem('cinelog_current_user_v1', JSON.stringify(currentUser));
      else localStorage.removeItem('cinelog_current_user_v1');
    }
  }, [currentUser, useSupabase]);

  const getDefaultSeeds = () => [];

  const handleSaveMovie = async (updatedMovie) => {
    const tmdbId = updatedMovie.tmdb_id || updatedMovie.id;
    const mediaType = updatedMovie.media_type || 'movie';

    const normalizedMovie = {
      ...updatedMovie,
      tmdb_id: tmdbId ? Number(tmdbId) : null,
      media_type: mediaType,
    };

    if (useSupabase && currentUser) {
      const epData = normalizedMovie.episode_data || {
        ratings: normalizedMovie.episode_ratings || {},
        notes: normalizedMovie.episode_notes || {},
        dates: normalizedMovie.episode_watch_dates || {}
      };

      const hasEpisodeData = Object.keys(epData.ratings || {}).length > 0 ||
                             Object.keys(epData.notes || {}).length > 0 ||
                             Object.keys(epData.dates || {}).length > 0;

      const dbReview = hasEpisodeData
        ? `${(normalizedMovie.review || '').trim()}\n\n__EPISODE_DATA__:${JSON.stringify(epData)}`
        : normalizedMovie.review;

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const cleanId = (normalizedMovie.id && uuidRegex.test(normalizedMovie.id)) ? normalizedMovie.id : crypto.randomUUID();
      normalizedMovie.id = cleanId;

      const payload = {
        id: cleanId,
        user_id: currentUser.id,
        tmdb_id: normalizedMovie.tmdb_id,
        media_type: normalizedMovie.media_type,
        title: normalizedMovie.title,
        poster_path: normalizedMovie.poster_path,
        release_year: normalizedMovie.release_year,
        genres: normalizedMovie.genres,
        status: normalizedMovie.status,
        rating: normalizedMovie.rating,
        review: dbReview,
        favorite: normalizedMovie.favorite,
        tags: normalizedMovie.tags,
      };

      // Robust check-and-update/insert to avoid any unique constraint or onConflict errors
      const { data: existingRows } = await supabase
        .from('library')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('tmdb_id', normalizedMovie.tmdb_id);

      let data, error;
      if (existingRows && existingRows.length > 0) {
        const targetId = existingRows[0].id;
        normalizedMovie.id = targetId;
        const res = await supabase
          .from('library')
          .update({
            ...payload,
            id: targetId
          })
          .eq('id', targetId)
          .select();
        data = res.data;
        error = res.error;
      } else {
        const res = await supabase
          .from('library')
          .insert(payload)
          .select();
        data = res.data;
        error = res.error;
      }

      if (error) {
        console.error("Supabase save failed in handleSaveMovie:", error.message, error.details);
      } else if (data && data[0]) {
        normalizedMovie.id = data[0].id;
      }
    }
    setLibrary(prev => {
      const idx = prev.findIndex(m => m.id === normalizedMovie.id || (String(m.tmdb_id) === String(normalizedMovie.tmdb_id) && m.media_type === normalizedMovie.media_type));
      if (idx !== -1) { const c = [...prev]; c[idx] = normalizedMovie; return c; }
      return [normalizedMovie, ...prev];
    });
    setActiveEditMovie(null);
    const statusLabel = normalizedMovie.status === 'watched' ? 'Marked as Watched' : normalizedMovie.status === 'plan_to_watch' ? 'Added to Watchlist' : 'Saved';
    toast.success(statusLabel, normalizedMovie.title);
  };

  const handleAddMovie = async (newMovie, mediaTypeFromProp) => {
    const tmdbId = newMovie.tmdb_id || newMovie.id;
    const mediaType = mediaTypeFromProp || newMovie.media_type || 'movie';

    // Normalizing raw search items to standard library items
    const cleanMovie = {
      id: (newMovie.id && typeof newMovie.id === 'string' && newMovie.id.includes('-')) ? newMovie.id : crypto.randomUUID(),
      tmdb_id: Number(tmdbId),
      media_type: mediaType,
      title: newMovie.title || newMovie.name || 'Unknown Title',
      poster_path: newMovie.poster_path || null,
      backdrop_path: newMovie.backdrop_path || null,
      overview: newMovie.overview || '',
      release_year: newMovie.release_year || (newMovie.release_date || newMovie.first_air_date || '').slice(0, 4) || '—',
      genres: newMovie.genres || (newMovie.genre_ids || []).map(id => GENRE_MAP[id]).filter(Boolean),
      director: newMovie.director || null,
      tmdb_score: newMovie.tmdb_score || (newMovie.vote_average ? Math.round(newMovie.vote_average * 10) / 10 : null),
      status: newMovie.status || 'plan_to_watch',
      rating: newMovie.rating !== undefined ? newMovie.rating : null,
      review: newMovie.review || '',
      favorite: newMovie.favorite || false,
      date_added: newMovie.date_added || new Date().toISOString(),
      tags: newMovie.tags || [],
      episode_ratings: newMovie.episode_ratings || {},
      episode_notes: newMovie.episode_notes || {},
      episode_watch_dates: newMovie.episode_watch_dates || {},
    };

    const alreadyExists = library.some(m => String(m.tmdb_id) === String(cleanMovie.tmdb_id) && m.media_type === cleanMovie.media_type);

    if (useSupabase && currentUser) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const cleanId = (cleanMovie.id && uuidRegex.test(cleanMovie.id)) ? cleanMovie.id : crypto.randomUUID();
      cleanMovie.id = cleanId;

      const addPayload = {
        id: cleanId,
        user_id: currentUser.id,
        tmdb_id: cleanMovie.tmdb_id,
        media_type: cleanMovie.media_type,
        title: cleanMovie.title,
        poster_path: cleanMovie.poster_path,
        release_year: cleanMovie.release_year,
        genres: cleanMovie.genres,
        status: cleanMovie.status,
        rating: cleanMovie.rating,
        review: cleanMovie.review,
        favorite: cleanMovie.favorite,
        tags: cleanMovie.tags,
      };

      const { data: existingAddRows } = await supabase
        .from('library')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('tmdb_id', cleanMovie.tmdb_id);

      let data, error;
      if (existingAddRows && existingAddRows.length > 0) {
        const targetId = existingAddRows[0].id;
        cleanMovie.id = targetId;
        const res = await supabase
          .from('library')
          .update({
            ...addPayload,
            id: targetId
          })
          .eq('id', targetId)
          .select();
        data = res.data;
        error = res.error;
      } else {
        const res = await supabase
          .from('library')
          .insert(addPayload)
          .select();
        data = res.data;
        error = res.error;
      }

      if (error) {
        console.error("Supabase upsert failed in handleAddMovie:", error.message, error.details);
      } else if (data && data[0]) {
        cleanMovie.id = data[0].id;
      }
    }

    setLibrary(prev => {
      const idx = prev.findIndex(m => String(m.tmdb_id) === String(cleanMovie.tmdb_id) && m.media_type === cleanMovie.media_type);
      if (idx !== -1) {
        const c = [...prev];
        c[idx] = { ...c[idx], ...cleanMovie };
        return c;
      }
      return [cleanMovie, ...prev];
    });

    if (!alreadyExists) {
      toast.success('Added to Library', cleanMovie.title);
    } else {
      toast.info('Already in Library', cleanMovie.title);
    }
  };

  const handleRemoveMovie = async (movieId) => {
    const movie = library.find(m => m.id === movieId);
    if (!movie) return;
    
    setConfirmConfig({
      isOpen: true,
      title: 'Remove Movie?',
      message: `Are you sure you want to remove "${movie.title}" from your library? This will delete all its ratings and reviews.`,
      onConfirm: async () => {
        if (useSupabase && currentUser) {
          await supabase.from('library').delete().eq('id', movieId);
        }
        setLibrary(prev => prev.filter(m => m.id !== movieId));
        toast.warning('Removed', movie.title || 'Title removed from library');
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleToggleFavorite = async (movieId) => {
    let favState = false;
    setLibrary(prev => prev.map(m => {
      if (m.id === movieId || String(m.tmdb_id) === String(movieId)) {
        favState = !m.favorite;
        return { ...m, favorite: favState };
      }
      return m;
    }));
    if (useSupabase && currentUser) {
      await supabase.from('library').update({ favorite: favState }).eq('id', movieId);
    }
  };

  const handleMovieClick = (tmdbId, mediaType) => {
    const existing = library.find(m => String(m.tmdb_id) === String(tmdbId) && m.media_type === mediaType);
    if (existing) { setActiveEditMovie(existing); return; }
    fetch(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=6a2fd6b9b1bb3befbb9f14c203732225&append_to_response=videos,credits`)
      .then(r => r.json())
      .then(data => {
        const directorName = data.credits?.crew?.find(c => c.job === 'Director')?.name || null;
        setActiveEditMovie({
          id: crypto.randomUUID(), tmdb_id: data.id, media_type: mediaType,
          title: data.title || data.name, poster_path: data.poster_path,
          backdrop_path: data.backdrop_path, overview: data.overview,
          release_year: (data.release_date || data.first_air_date || '').slice(0, 4),
          genres: (data.genres || []).map(g => g.name),
          director: directorName,
          tmdb_score: Math.round((data.vote_average || 0) * 10) / 10,
          status: 'plan_to_watch', rating: null, review: '', favorite: false,
          date_added: new Date().toISOString(), tags: [],
          details: data,
          videos: data.videos
        });
      });
  };

  const handleUpdateProfile = async (updatedDetails) => {
    // Immediately update local state & local storage cache
    setCurrentUser(prev => {
      const nextUser = { ...prev, ...updatedDetails };
      if (nextUser.id) {
        localStorage.setItem(`equipped_border_${nextUser.id}`, nextUser.equippedBorder || 'none');
        localStorage.setItem(`cinelog_shop_${nextUser.id}`, JSON.stringify({
          equippedBorder: nextUser.equippedBorder || 'none',
          bannerUrl: nextUser.bannerUrl || '',
          spentCinePoints: nextUser.spentCinePoints || 0,
          purchasedBorders: nextUser.purchasedBorders || [],
          purchasedBadges: nextUser.purchasedBadges || [],
          purchasedBanners: nextUser.purchasedBanners || [],
          purchasedThemes: nextUser.purchasedThemes || [],
          triviaCinePoints: nextUser.triviaCinePoints || 0
        }));
        localStorage.setItem('cinelog_supabase_cached_user', JSON.stringify(nextUser));
      } else {
        localStorage.setItem('equipped_border_sandbox', nextUser.equippedBorder || 'none');
      }
      return nextUser;
    });

    if (useSupabase && currentUser) {
      const fullPayload = {
        username: updatedDetails.username !== undefined ? updatedDetails.username : currentUser.username,
        display_name: updatedDetails.displayName !== undefined ? updatedDetails.displayName : currentUser.displayName,
        bio: updatedDetails.bio !== undefined ? updatedDetails.bio : currentUser.bio,
        avatar_url: updatedDetails.avatar !== undefined ? updatedDetails.avatar : currentUser.avatar,
        favorites: updatedDetails.favorites !== undefined ? updatedDetails.favorites : (currentUser.favorites || []),
        equipped_border: updatedDetails.equippedBorder !== undefined ? updatedDetails.equippedBorder : (currentUser.equippedBorder || 'none'),
        banner_url: updatedDetails.bannerUrl !== undefined ? updatedDetails.bannerUrl : (currentUser.bannerUrl || ''),
        spent_cine_points: updatedDetails.spentCinePoints !== undefined ? updatedDetails.spentCinePoints : (currentUser.spentCinePoints || 0),
        purchased_borders: updatedDetails.purchasedBorders !== undefined ? updatedDetails.purchasedBorders : (currentUser.purchasedBorders || []),
        purchased_badges: updatedDetails.purchasedBadges !== undefined ? updatedDetails.purchasedBadges : (currentUser.purchasedBadges || []),
        purchased_banners: updatedDetails.purchasedBanners !== undefined ? updatedDetails.purchasedBanners : (currentUser.purchasedBanners || []),
        purchased_themes: updatedDetails.purchasedThemes !== undefined ? updatedDetails.purchasedThemes : (currentUser.purchasedThemes || [])
      };

      const { error } = await supabase.from('profiles').update(fullPayload).eq('id', currentUser.id);

      if (error) {
        console.warn("Retrying profile save with basic fields...", error.message);
        await supabase.from('profiles').update({
          username: fullPayload.username,
          display_name: fullPayload.display_name,
          bio: fullPayload.bio,
          avatar_url: fullPayload.avatar_url,
          favorites: fullPayload.favorites
        }).eq('id', currentUser.id);
      }
    }
  };

  const handleLogout = async () => {
    if (useSupabase) {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setLibrary([]);
      localStorage.removeItem('cinelog_supabase_cached_user');
    } else {
      setCurrentUser(null);
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setShowAuth(false);
  };

  const handleImportMovies = async (importedMovies) => {
    // ── Normalize status: DB allows 'watched', 'plan_to_watch', 'watching', 'dropped' ──
    const normalizeStatus = (raw) => {
      const s = String(raw || '').toLowerCase().trim();
      if (s === 'watched' || s === 'completed' || s === 'completed_watching') return 'watched';
      if (s === 'watching' || s === 'currently_watching') return 'watching';
      if (s === 'dropped') return 'dropped';
      return 'plan_to_watch'; // want_to_watch, planned, watchlist, etc.
    };

    // ── Normalize media_type: DB only allows 'movie', 'tv', 'anime' ──
    const normalizeMediaType = (raw) => {
      const s = String(raw || '').toLowerCase().trim();
      if (s === 'tv' || s === 'series' || s === 'show' || s === 'tv_series') return 'tv';
      if (s === 'anime') return 'anime';
      return 'movie'; // default
    };

    // ── Clamp rating to 0–10 range, return null if invalid ──
    const normalizeRating = (raw) => {
      if (raw === null || raw === undefined || raw === '') return null;
      const n = Number(raw);
      if (isNaN(n)) return null;
      if (n > 10) return 10;
      if (n < 0) return 0;
      return parseFloat(n.toFixed(1));
    };

    try {
      const updatedLibrary = [...library];
      const supabaseRows = [];

      for (const imported of importedMovies) {
        const existingIndex = updatedLibrary.findIndex(
          m => String(m.tmdb_id) === String(imported.tmdb_id) && m.media_type === imported.media_type
        );

        // Always generate a proper UUID — never reuse numeric tmdb_id as UUID
        let uuid;
        if (existingIndex !== -1 && updatedLibrary[existingIndex].id?.includes('-')) {
          uuid = updatedLibrary[existingIndex].id;
        } else if (imported.id && String(imported.id).includes('-')) {
          uuid = imported.id;
        } else {
          uuid = crypto.randomUUID();
        }

        const normalizedItem = {
          ...imported,
          id: uuid,
          tmdb_id: imported.tmdb_id ? Number(imported.tmdb_id) : null,
          media_type: normalizeMediaType(imported.media_type),
          title: imported.title || 'Unknown',
          poster_path: imported.poster_path || null,
          release_year: imported.release_year || '—',
          genres: Array.isArray(imported.genres) ? imported.genres : [],
          status: normalizeStatus(imported.status),
          rating: normalizeRating(imported.rating),
          review: imported.review || '',
          favorite: imported.favorite || false,
          date_added: imported.date_added || new Date().toISOString(),
          tags: Array.isArray(imported.tags) ? imported.tags : [],
        };

        if (existingIndex !== -1) {
          updatedLibrary[existingIndex] = normalizedItem;
        } else {
          updatedLibrary.push(normalizedItem);
        }

        if (useSupabase && currentUser) {
          // Only include columns that match the Supabase schema
          supabaseRows.push({
            id: uuid,
            user_id: currentUser.id,
            tmdb_id: normalizedItem.tmdb_id,
            media_type: normalizedItem.media_type,
            title: normalizedItem.title,
            poster_path: normalizedItem.poster_path,
            release_year: normalizedItem.release_year,
            genres: normalizedItem.genres,
            status: normalizedItem.status,
            rating: normalizedItem.rating,
            review: normalizedItem.review,
            favorite: normalizedItem.favorite,
            tags: normalizedItem.tags,
            date_added: normalizedItem.date_added,
          });
        }
      }

      setLibrary(updatedLibrary);
      localStorage.setItem('cinelog_library_v2', JSON.stringify(updatedLibrary));

      if (useSupabase && currentUser && supabaseRows.length > 0) {
        let successCount = 0;
        let failCount = 0;
        const BATCH_SIZE = 50;

        for (let i = 0; i < supabaseRows.length; i += BATCH_SIZE) {
          const batch = supabaseRows.slice(i, i + BATCH_SIZE);
          const { error } = await supabase.from('library').upsert(batch, { onConflict: 'id' });
          if (error) {
            console.error(`Supabase batch ${i}–${i + BATCH_SIZE} error:`, error.message, error.details);
            for (const row of batch) {
              const { error: rowErr } = await supabase.from('library').upsert(row, { onConflict: 'id' });
              if (rowErr) {
                console.warn(`Skipping row "${row.title}":`, rowErr.message);
                failCount++;
              } else {
                successCount++;
              }
            }
          } else {
            successCount += batch.length;
          }
        }

        if (failCount > 0) {
          toast.warning(
            'Partial Cloud Sync',
            `${successCount}/${supabaseRows.length} titles synced to cloud. ${failCount} items skipped. All data saved locally.`
          );
          return true;
        } else {
          toast.success('Import Complete', `${importedMovies.length} titles saved to library & cloud`);
          return true;
        }
      }

      toast.success('Import Complete', `${importedMovies.length} titles added to your library`);
      return true;
    } catch (err) {
      console.error('Failed to import movies:', err);
      toast.error('Import Failed', err.message || 'An error occurred during import');
      return false;
    }
  };

  const CMD_ACTIONS = [
    { label: '🏠 Home / Landing', shortcut: 'H', action: () => { setActiveTab('landing'); setShowCommandCenter(false); } },
    { label: '🎬 My Library', shortcut: 'L', action: () => { setActiveTab('library'); setShowCommandCenter(false); } },
    { label: '🔍 Explore Movies', shortcut: 'E', action: () => { setActiveTab('explore'); setShowCommandCenter(false); } },
    { label: '📊 Analytics & Stats', shortcut: 'S', action: () => { setActiveTab('stats'); setShowCommandCenter(false); } },
    { label: '🏆 Tier Lists', shortcut: 'T', action: () => { setActiveTab('tierlist'); setShowCommandCenter(false); } },
    { label: '🌠 Constellation Map', shortcut: 'C', action: () => { setActiveTab('constellation'); setShowCommandCenter(false); } },
    { label: '📅 Watch Calendar', shortcut: 'W', action: () => { setActiveTab('calendar'); setShowCommandCenter(false); } },
    { label: '🗂️ Collections', shortcut: 'O', action: () => { setActiveTab('collections'); setShowCommandCenter(false); } },
    { label: '👤 My Profile', shortcut: 'P', action: () => { setActiveTab('profile'); setShowCommandCenter(false); } },
    { label: '🏅 Achievements', shortcut: 'A', action: () => { setActiveTab('achievements'); setShowCommandCenter(false); } },
    { label: '🎮 Daily Trivia Game', shortcut: 'V', action: () => { setActiveTab('trivia'); setShowCommandCenter(false); } },
    { label: '🔥 Weekly Challenges & XP', shortcut: 'X', action: () => { setActiveTab('challenges'); setShowCommandCenter(false); } },
    { label: '🎬 Yearly Wrapped', shortcut: 'Y', action: () => { setActiveTab('wrapped'); setShowCommandCenter(false); } },
    { label: '🤖 For You — AI Picks', shortcut: 'F', action: () => { setActiveTab('foryou'); setShowCommandCenter(false); } },
    { label: '👥 Social & Friends', shortcut: 'N', action: () => { setActiveTab('social'); setShowCommandCenter(false); } },
    { label: '⚙️ Open Settings', shortcut: ',', action: () => { setShowSettings(true); setShowCommandCenter(false); } },
    { label: '🪙 CinePoints Shop', shortcut: null, action: () => { setActiveTab('profile'); setShowCommandCenter(false); } },
  ];

  const filteredCmds = cmdQuery.trim()
    ? CMD_ACTIONS.filter(a => a.label.toLowerCase().includes(cmdQuery.toLowerCase()))
    : CMD_ACTIONS;

  return (
    <div className="app-container" style={{ position: 'relative' }}>
      {/* Dynamic blurred movie backdrop overlay */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: hoveredBackdrop ? `url(https://image.tmdb.org/t/p/w1280${hoveredBackdrop})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: hoveredBackdrop ? 0.12 : 0,
        filter: 'blur(40px) saturate(130%)',
        zIndex: -2,
        transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), background-image 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none'
      }} />
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setShowAuth(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenCommandCenter={() => { setShowCommandCenter(true); setCmdQuery(''); }}
        useSupabase={useSupabase}
        setUseSupabase={handleSetUseSupabase}
      />

      <main className="page-content">
        {activeTab === 'landing' && (
          <LandingPage onMovieClick={handleMovieClick} setActiveTab={handleTabChange} library={library} />
        )}
        {activeTab === 'library' && (
          <LibraryTab
            library={library}
            onRemove={handleRemoveMovie}
            onEditClick={setActiveEditMovie}
            onOpenExplore={() => handleTabChange('explore')}
            onImportMovies={handleImportMovies}
          />
        )}
        {activeTab === 'explore' && (
          <ExploreTab onAddMovie={handleAddMovie} library={library} onMovieClick={handleMovieClick} />
        )}
        {activeTab === 'collections' && (
          <CollectionsTab library={library} onMovieClick={handleMovieClick} />
        )}
        {activeTab === 'tierlist' && (
          <TierListTab library={library} />
        )}
        {activeTab === 'constellation' && (
          <ConstellationTab library={library} onMovieClick={handleMovieClick} />
        )}
        {activeTab === 'calendar' && (
          <WatchCalendarTab library={library} />
        )}
        {activeTab === 'stats' && (
          <StatsTab library={library} onMovieClick={handleMovieClick} />
        )}
        {activeTab === 'profile' && (
          <ProfileTab currentUser={currentUser} onUpdateProfile={handleUpdateProfile} library={library} />
        )}
        {activeTab === 'achievements' && (
          <AchievementsTab library={library} currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />
        )}
        {activeTab === 'trivia' && (
          <TriviaTab currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />
        )}
        {activeTab === 'challenges' && (
          <ChallengesTab library={library} currentUser={currentUser} />
        )}
        {activeTab === 'wrapped' && (
          <WrappedTab library={library} />
        )}
        {activeTab === 'foryou' && (
          <ForYouTab library={library} currentUser={currentUser} onAddMovie={handleAddMovie} onMovieClick={handleMovieClick} />
        )}
        {activeTab === 'social' && (
          <SocialTab currentUser={currentUser} onMovieClick={handleMovieClick} onOpenUserProfile={setViewingUserProfile} />
        )}
      </main>

      {activeEditMovie && (
        <MovieDetailModal
          movie={activeEditMovie}
          currentUser={currentUser}
          onClose={() => setActiveEditMovie(null)}
          onSave={handleSaveMovie}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={library.find(m => String(m.tmdb_id) === String(activeEditMovie.tmdb_id))?.favorite || false}
          onOpenUserProfile={setViewingUserProfile}
        />
      )}

      {viewingUserProfile && (
        <UserProfileModal
          targetUser={viewingUserProfile}
          currentUser={currentUser}
          onClose={() => setViewingUserProfile(null)}
          onMovieClick={handleMovieClick}
        />
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLoginSuccess={handleLoginSuccess}
          useSupabase={useSupabase}
          setUseSupabase={handleSetUseSupabase}
        />
      )}
      {showRecoveryModal && (
        <ResetPasswordModal
          onClose={() => setShowRecoveryModal(false)}
        />
      )}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* ── COMMAND CENTER ─────────────────────────────────────── */}
      {showCommandCenter && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(4,3,8,0.88)', backdropFilter: 'blur(20px)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '18vh' }}
          onClick={e => e.target === e.currentTarget && setShowCommandCenter(false)}
        >
          <div className="animate-fade-in-scale" style={{ width: '100%', maxWidth: '540px', background: '#100d1e', border: '1px solid rgba(124,111,247,0.35)', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(124,111,247,0.1)' }}>
            {/* Search header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '18px', opacity: 0.5 }}>⌘</span>
              <input
                autoFocus
                type="text"
                placeholder="Search actions, pages, shortcuts…"
                value={cmdQuery}
                onChange={e => setCmdQuery(e.target.value)}
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-heading)' }}
              />
              <kbd style={{ fontSize: '10px', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 7px', fontFamily: 'monospace' }}>ESC</kbd>
            </div>
            {/* Action list */}
            <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '8px' }}>
              {filteredCmds.map((cmd, i) => (
                <button key={i} onClick={cmd.action}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', borderRadius: '10px', padding: '10px 14px', cursor: 'pointer', color: '#fff', fontSize: '14px', fontWeight: 600, textAlign: 'left', transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,111,247,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span>{cmd.label}</span>
                  {cmd.shortcut && <kbd style={{ fontSize: '10px', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1px 7px', fontFamily: 'monospace' }}>{cmd.shortcut}</kbd>}
                </button>
              ))}
              {filteredCmds.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)', fontSize: '13px' }}>No results for "{cmdQuery}"</div>
              )}
            </div>
            <div style={{ padding: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '11px', color: 'var(--text-dim)', display: 'flex', gap: '16px' }}>
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
              <span style={{ marginLeft: 'auto' }}>⌘K Toggle</span>
            </div>
          </div>
        </div>
      )}
      {/* ── FLOATING ACTION BUTTON (Quick Add) ──────────────────── */}
      {true && (
        <>
          {/* FAB backdrop */}
          {showQuickAdd && (
            <div
              onClick={() => setShowQuickAdd(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 8998, background: 'rgba(4,3,8,0.6)', backdropFilter: 'blur(4px)' }}
            />
          )}

          {/* Quick-add panel */}
          {showQuickAdd && (
            <div style={{
              position: 'fixed', bottom: '90px', right: '24px',
              width: 'min(380px, calc(100vw - 48px))',
              background: 'rgba(16,13,30,0.96)',
              border: '1px solid rgba(124,111,247,0.35)',
              borderRadius: '20px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(124,111,247,0.12)',
              backdropFilter: 'blur(24px)',
              zIndex: 8999,
              overflow: 'hidden',
              animation: 'fabPanelIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
              {/* Panel header */}
              <div style={{ padding: '16px 18px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>⚡ Quick Add</div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', pointerEvents: 'none' }}>🔍</span>
                  <input
                    ref={quickSearchRef}
                    type="text"
                    placeholder="Search movie or show…"
                    value={quickSearch}
                    onChange={e => setQuickSearch(e.target.value)}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(124,111,247,0.25)',
                      borderRadius: '12px',
                      padding: '10px 12px 10px 36px',
                      color: '#fff', fontSize: '14px', fontWeight: 600,
                      outline: 'none',
                      fontFamily: 'var(--font-heading)',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(124,111,247,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(124,111,247,0.25)'}
                  />
                  {quickLoading && (
                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>⟳</span>
                  )}
                </div>
              </div>

              {/* Results */}
              <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '6px 8px 10px' }}>
                {quickResults.length === 0 && !quickSearch && (
                  <div style={{ textAlign: 'center', padding: '20px 16px', color: 'var(--text-dim)', fontSize: '13px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎬</div>
                    <div>Type a movie or show name to log it fast</div>
                  </div>
                )}
                {quickResults.length === 0 && quickSearch && !quickLoading && (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '13px' }}>No results for "{quickSearch}"</div>
                )}
                {quickResults.map(result => {
                  const inLibrary = library.some(m => String(m.tmdb_id) === String(result.id));
                  const title = result.title || result.name;
                  const year = (result.release_date || result.first_air_date || '').slice(0, 4);
                  const type = result.media_type === 'tv' ? 'TV' : 'Film';
                  return (
                    <button
                      key={result.id}
                      onClick={() => {
                        handleMovieClick(result.id, result.media_type);
                        setShowQuickAdd(false);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        width: '100%', background: 'none', border: 'none',
                        borderRadius: '12px', padding: '8px 10px', cursor: 'pointer',
                        color: '#fff', textAlign: 'left', transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,111,247,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      {/* Poster */}
                      <div style={{ flexShrink: 0, width: '38px', height: '54px', borderRadius: '7px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                        {result.poster_path
                          ? <img src={`https://image.tmdb.org/t/p/w92${result.poster_path}`} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🎬</div>
                        }
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '2px' }}>{year} · {type}</div>
                      </div>
                      {/* Status badge */}
                      <div style={{ flexShrink: 0, fontSize: '11px', fontWeight: 700,
                        padding: '3px 9px', borderRadius: '20px',
                        background: inLibrary ? 'rgba(16,185,129,0.15)' : 'rgba(124,111,247,0.15)',
                        color: inLibrary ? '#10b981' : '#a78bfa',
                        border: `1px solid ${inLibrary ? 'rgba(16,185,129,0.3)' : 'rgba(124,111,247,0.3)'}`,
                      }}>{inLibrary ? '✓ In Library' : '+ Add'}</div>
                    </button>
                  );
                })}
              </div>

              {/* Footer shortcut hint */}
              <div style={{ padding: '8px 18px 12px', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center' }}>
                Tap a result to log it · <span style={{ color: '#a78bfa' }}>Explore</span> for full search
              </div>
            </div>
          )}

          {/* The FAB button itself */}
          <button
            id="quick-add-fab"
            onClick={() => setShowQuickAdd(p => !p)}
            title="Quick Add Movie"
            style={{
              position: 'fixed', bottom: '24px', right: '24px',
              width: '58px', height: '58px',
              borderRadius: '50%',
              background: showQuickAdd
                ? 'linear-gradient(135deg, #6d5ce7, #a855f7)'
                : 'linear-gradient(135deg, #7c6ff7, #c084fc)',
              border: 'none',
              boxShadow: showQuickAdd
                ? '0 8px 32px rgba(124,111,247,0.7), 0 0 0 4px rgba(124,111,247,0.25)'
                : '0 8px 24px rgba(124,111,247,0.5), 0 0 0 0px rgba(124,111,247,0)',
              cursor: 'pointer',
              zIndex: 9000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px',
              color: '#fff',
              transform: showQuickAdd ? 'rotate(45deg) scale(1.05)' : 'rotate(0deg) scale(1)',
              transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
              animation: 'fabPulse 3s ease-in-out infinite',
            }}
          >
            +
          </button>
        </>
      )}

    </div>
  );
}
