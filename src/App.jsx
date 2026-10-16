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
import { useBodyScrollLock } from './hooks/useBodyScrollLock';
import { MOCK_USERS } from './mockData';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getSuggestedTags } from './utils/collections';
import { Search, Compass, Library, Award, Trophy, CalendarDays, BarChart3, Users, User, Settings, Film, Tv, X, Loader2, ArrowRight, Flame } from 'lucide-react';

const GENRE_MAP = {
  28:'Action', 12:'Adventure', 16:'Animation', 35:'Comedy', 80:'Crime',
  99:'Documentary', 18:'Drama', 10751:'Family', 14:'Fantasy', 36:'History',
  27:'Horror', 10402:'Music', 9648:'Mystery', 10749:'Romance', 878:'Sci-Fi',
  53:'Thriller', 10752:'War', 37:'Western', 10759:'Action & Adventure',
  10765:'Sci-Fi & Fantasy', 10764:'Reality',
};

import { SHARP_SOLID_COMBOS } from './utils/themePresets';

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}

function AppInner() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('explore');
  const [profileSubTab, setProfileSubTab] = useState('overview');

  // Synchronize tab navigation with browser history (enables browser Back < and Forward > buttons)
  const handleTabChange = useCallback((newTab, replace = false) => {
    // If navigating to a personal tracking tab that now lives inside Profile, redirect to profile sub-tab!
    if (['stats', 'calendar', 'wrapped', 'achievements', 'constellation', 'shop', 'diary', 'watchlist'].includes(newTab)) {
      setProfileSubTab(newTab);
      setActiveTab('profile');
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', 'profile');
        url.searchParams.set('sub', newTab);
        if (replace) {
          window.history.replaceState({ tab: 'profile', sub: newTab }, '', url.toString());
        } else {
          window.history.pushState({ tab: 'profile', sub: newTab }, '', url.toString());
        }
      } catch (e) {}
      return;
    }

    const resolved = newTab === 'landing' ? 'explore' : newTab;
    setActiveTab(resolved);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', resolved);
      url.searchParams.delete('sub');
      if (replace) {
        window.history.replaceState({ tab: resolved }, '', url.toString());
      } else {
        window.history.pushState({ tab: resolved }, '', url.toString());
      }
    } catch (e) {}
  }, []);

  // Listen for browser Back/Forward (popstate) events
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const initialTab = params.get('tab');
      const initialSub = params.get('sub');
      if (['stats', 'calendar', 'wrapped', 'achievements', 'constellation', 'shop', 'diary', 'watchlist'].includes(initialTab)) {
        setProfileSubTab(initialTab);
        setActiveTab('profile');
      } else if (initialTab === 'profile') {
        if (initialSub) setProfileSubTab(initialSub);
        setActiveTab('profile');
      } else if (initialTab && initialTab !== 'landing') {
        setActiveTab(initialTab);
        window.history.replaceState({ tab: initialTab }, '', window.location.href);
      } else {
        setActiveTab('explore');
        window.history.replaceState({ tab: 'explore' }, '', window.location.href);
      }
    } catch (e) {}

    const handlePopState = (e) => {
      if (e.state && e.state.tab) {
        if (e.state.sub) setProfileSubTab(e.state.sub);
        setActiveTab(e.state.tab === 'landing' ? 'explore' : e.state.tab);
      } else {
        try {
          const p = new URLSearchParams(window.location.search);
          const t = p.get('tab') || 'explore';
          const s = p.get('sub');
          if (s) setProfileSubTab(s);
          setActiveTab(t === 'landing' ? 'explore' : t);
        } catch (err) {}
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommandCenter, setShowCommandCenter] = useState(false);
  useBodyScrollLock(showCommandCenter);
  const [cmdQuery, setCmdQuery] = useState('');
  const [cmdSearchResults, setCmdSearchResults] = useState([]);
  const [isCmdSearching, setIsCmdSearching] = useState(false);
  const [cmdPage, setCmdPage] = useState(1);
  const [cmdTotalPages, setCmdTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [trendingQuickPicks, setTrendingQuickPicks] = useState([]);
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

  const [activeComboId, setActiveComboId] = useState(() => localStorage.getItem('cinelog_active_combo') || 'crimson');
  const [layoutMode, setLayoutMode] = useState(() => localStorage.getItem('cinelog_layout_mode') || 'top-nav');

  useEffect(() => {
    localStorage.setItem('cinelog_layout_mode', layoutMode);
  }, [layoutMode]);

  // Apply razor-sharp solid color combo to root variables
  useEffect(() => {
    const combo = SHARP_SOLID_COMBOS.find(c => c.id === activeComboId) || SHARP_SOLID_COMBOS[0];
    const root = document.documentElement;
    root.style.setProperty('--accent', combo.accent);
    root.style.setProperty('--accent-gradient', combo.accent);
    root.style.setProperty('--accent-hover', combo.accent);
    root.style.setProperty('--border-focus', combo.borderFocus);
    root.style.setProperty('--bg', combo.bg);
    root.style.setProperty('--surface', combo.surface);
    root.style.setProperty('--border', combo.border);
    root.style.setProperty('--text', combo.text);
    localStorage.setItem('cinelog_active_combo', combo.id);
  }, [activeComboId]);

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

  // Global keyboard shortcuts (Ctrl/Cmd+K for search, Escape to close menus & modals)
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandCenter(prev => !prev);
        setCmdQuery('');
      }
      if (e.key === 'Escape') {
        if (showQuickAdd) {
          setShowQuickAdd(false);
          return;
        }
        if (showCommandCenter) {
          setShowCommandCenter(false);
          return;
        }
        if (showSettings) {
          setShowSettings(false);
          return;
        }
        if (showAuth) {
          setShowAuth(false);
          return;
        }
        if (showRecoveryModal) {
          setShowRecoveryModal(false);
          return;
        }
        if (activeEditMovie) {
          setActiveEditMovie(null);
          return;
        }
        if (viewingUserProfile) {
          setViewingUserProfile(null);
          return;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showQuickAdd, showCommandCenter, showSettings, showAuth, showRecoveryModal, activeEditMovie, viewingUserProfile]);

  // Reset search when modal closes
  useEffect(() => {
    if (!showCommandCenter) {
      setCmdQuery('');
      setCmdSearchResults([]);
      setIsCmdSearching(false);
      setCmdPage(1);
      setCmdTotalPages(1);
      setIsLoadingMore(false);
    }
  }, [showCommandCenter]);

  // Fetch trending movies for empty-state cinema search
  useEffect(() => {
    fetch('https://api.themoviedb.org/3/trending/movie/day?api_key=6a2fd6b9b1bb3befbb9f14c203732225')
      .then(r => r.json())
      .then(d => {
        setTrendingQuickPicks((d.results || []).slice(0, 4));
      })
      .catch(() => {});
  }, []);

  // Omnisearch TMDB debounced multi-search (initial page)
  useEffect(() => {
    const q = cmdQuery.trim();
    if (!q || q.length < 2) {
      setCmdSearchResults([]);
      setIsCmdSearching(false);
      setCmdPage(1);
      setCmdTotalPages(1);
      return;
    }
    setIsCmdSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=6a2fd6b9b1bb3befbb9f14c203732225&query=${encodeURIComponent(q)}&page=1`);
        if (res.ok) {
          const data = await res.json();
          const filtered = (data.results || []).filter(item =>
            (item.media_type === 'movie' || item.media_type === 'tv' || item.media_type === 'person') &&
            (item.title || item.name)
          );
          setCmdSearchResults(filtered);
          setCmdPage(1);
          setCmdTotalPages(data.total_pages || 1);
        }
      } catch (err) {
        console.error('Command center search error:', err);
      } finally {
        setIsCmdSearching(false);
      }
    }, 240);
    return () => clearTimeout(timer);
  }, [cmdQuery]);

  // Infinite scroll loader for search results
  const handleLoadMoreSearch = async () => {
    if (isLoadingMore || isCmdSearching || cmdPage >= cmdTotalPages) return;
    const q = cmdQuery.trim();
    if (!q) return;
    setIsLoadingMore(true);
    const nextPage = cmdPage + 1;
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=6a2fd6b9b1bb3befbb9f14c203732225&query=${encodeURIComponent(q)}&page=${nextPage}`);
      if (res.ok) {
        const data = await res.json();
        const filtered = (data.results || []).filter(item =>
          (item.media_type === 'movie' || item.media_type === 'tv' || item.media_type === 'person') &&
          (item.title || item.name)
        );
        setCmdSearchResults(prev => {
          const existingIds = new Set(prev.map(p => `${p.media_type}-${p.id}`));
          const newItems = filtered.filter(f => !existingIds.has(`${f.media_type}-${f.id}`));
          return [...prev, ...newItems];
        });
        setCmdPage(nextPage);
        setCmdTotalPages(data.total_pages || nextPage);
      }
    } catch (err) {
      console.error('Failed to load more search results:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

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
        // Immediately set cached user or fallback to keep UI responsive without resetting avatar on F5
        const cachedStr = localStorage.getItem('cinelog_supabase_cached_user');
        let initialUser = null;
        if (cachedStr) {
          try {
            const parsed = JSON.parse(cachedStr);
            if (parsed.id === session.user.id) initialUser = parsed;
          } catch {}
        }
        if (!initialUser) {
          initialUser = {
            id: session.user.id,
            username: session.user.email ? session.user.email.split('@')[0] : 'user',
            displayName: session.user.email ? session.user.email.split('@')[0] : 'User',
            avatar: DEFAULT_GREY_AVATAR,
            bio: '',
            favorites: [],
            followersCount: 0,
            followingCount: 0,
          };
        }
        setCurrentUser(initialUser);

        // Load local shop persistence for this user
        const localShopStr = localStorage.getItem(`cinelog_shop_${session.user.id}`);
        let localShop = {};
        try { if (localShopStr) localShop = JSON.parse(localShopStr); } catch {}

        // Parallel load of profile details from cloud DB
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data: profile }) => {
            if (profile) {
              const fullUser = {
                id: session.user.id,
                username: profile.username || (session.user.email ? session.user.email.split('@')[0] : 'user'),
                displayName: profile.display_name || (session.user.email ? session.user.email.split('@')[0] : 'User'),
                avatar: profile.avatar_url || initialUser.avatar || DEFAULT_GREY_AVATAR,
                bio: profile.bio || '',
                favorites: profile.favorites || [],
                equippedBorder: profile.equipped_border || localShop.equippedBorder || localStorage.getItem(`equipped_border_${session.user.id}`) || 'none',
                bannerUrl: ((profile.banner_url || localShop.bannerUrl || localStorage.getItem(`cinelog_banner_url_${session.user.id}`) || localStorage.getItem('cinelog_banner_url') || '').startsWith('animated-') ? '' : (profile.banner_url || localShop.bannerUrl || localStorage.getItem(`cinelog_banner_url_${session.user.id}`) || localStorage.getItem('cinelog_banner_url') || '')),
                bannerFitMode: profile.banner_fit_mode || localShop.bannerFitMode || localStorage.getItem(`cinelog_banner_fit_${session.user.id}`) || localStorage.getItem('cinelog_banner_fit') || 'cover',
                bannerPosPercent: profile.banner_pos_percent ?? localShop.bannerPosPercent ?? (localStorage.getItem(`cinelog_banner_pos_${session.user.id}`) !== null ? Number(localStorage.getItem(`cinelog_banner_pos_${session.user.id}`)) : (localStorage.getItem('cinelog_banner_pos') !== null ? Number(localStorage.getItem('cinelog_banner_pos')) : 20)),
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
                  season_ratings: parsedEpisodeData.season_ratings || row.season_ratings || {},
                  season_notes: parsedEpisodeData.season_notes || row.season_notes || {},
                  season_dates: parsedEpisodeData.season_dates || row.season_dates || {},
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
    const isTv = updatedMovie.media_type === 'tv' ||
                 updatedMovie.type === 'tv' ||
                 updatedMovie.number_of_seasons !== undefined ||
                 updatedMovie.first_air_date !== undefined ||
                 Boolean(updatedMovie.details && (updatedMovie.details.number_of_seasons !== undefined || updatedMovie.details.first_air_date));
    const mediaType = isTv ? 'tv' : (updatedMovie.media_type || 'movie');

    const normalizedMovie = {
      ...updatedMovie,
      tmdb_id: tmdbId ? Number(tmdbId) : null,
      media_type: mediaType,
    };

    if (useSupabase && currentUser) {
      const epData = normalizedMovie.episode_data || {
        ratings: normalizedMovie.episode_ratings || {},
        notes: normalizedMovie.episode_notes || {},
        dates: normalizedMovie.episode_watch_dates || {},
        season_ratings: normalizedMovie.season_ratings || {},
        season_notes: normalizedMovie.season_notes || {},
        season_dates: normalizedMovie.season_dates || {}
      };

      const hasEpisodeData = Object.keys(epData.ratings || {}).length > 0 ||
                             Object.keys(epData.notes || {}).length > 0 ||
                             Object.keys(epData.dates || {}).length > 0 ||
                             Object.keys(epData.season_ratings || {}).length > 0 ||
                             Object.keys(epData.season_notes || {}).length > 0 ||
                             Object.keys(epData.season_dates || {}).length > 0;

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
    const isTv = mediaTypeFromProp === 'tv' ||
                 newMovie.media_type === 'tv' ||
                 newMovie.type === 'tv' ||
                 newMovie.number_of_seasons !== undefined ||
                 newMovie.first_air_date !== undefined;
    const mediaType = isTv ? 'tv' : (mediaTypeFromProp || newMovie.media_type || 'movie');

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
      tags: (() => {
        const raw = Array.isArray(newMovie.tags) ? newMovie.tags : [];
        const detected = getSuggestedTags({ title: newMovie.title || newMovie.name, tags: raw });
        return Array.from(new Set([...raw, ...detected]));
      })(),
      episode_ratings: newMovie.episode_ratings || {},
      episode_notes: newMovie.episode_notes || {},
      episode_watch_dates: newMovie.episode_watch_dates || {},
      season_ratings: newMovie.season_ratings || {},
      season_notes: newMovie.season_notes || {},
      season_dates: newMovie.season_dates || {},
      episode_data: newMovie.episode_data || null,
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
        setConfirmConfig({ isOpen: false });
        if (activeEditMovie && (activeEditMovie.id === movieId || String(activeEditMovie.tmdb_id) === String(movie.tmdb_id))) {
          setActiveEditMovie(null);
        }
        try {
          if (useSupabase && currentUser) {
            await supabase.from('library').delete().eq('id', movieId);
          }
        } catch (err) {
          console.error('Failed to delete movie from Supabase:', err);
        }
        setLibrary(prev => prev.filter(m => m.id !== movieId));
        if (toast && toast.warning) {
          toast.warning('Removed', movie.title || 'Title removed from library');
        }
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
    let resolvedType = mediaType;
    if (!resolvedType) {
      const match = library.find(m => String(m.tmdb_id) === String(tmdbId));
      if (match) resolvedType = match.media_type;
    }
    const existing = library.find(m => String(m.tmdb_id) === String(tmdbId) && (!resolvedType || m.media_type === resolvedType));
    if (existing) { setActiveEditMovie(existing); return; }

    const targetType = resolvedType || 'movie';
    const primaryUrl = `https://api.themoviedb.org/3/${targetType}/${tmdbId}?api_key=6a2fd6b9b1bb3befbb9f14c203732225&append_to_response=videos,credits`;

    fetch(primaryUrl)
      .then(async r => {
        if (!r.ok && targetType === 'movie') {
          const fallbackRes = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=6a2fd6b9b1bb3befbb9f14c203732225&append_to_response=videos,credits`);
          if (fallbackRes.ok) return fallbackRes.json();
        }
        return r.json();
      })
      .then(data => {
        if (!data || data.status_code === 34) return;
        const isTv = data.number_of_seasons !== undefined || data.first_air_date !== undefined || targetType === 'tv';
        const finalType = isTv ? 'tv' : 'movie';
        const directorName = data.credits?.crew?.find(c => c.job === 'Director')?.name || null;
        setActiveEditMovie({
          id: crypto.randomUUID(), tmdb_id: data.id, media_type: finalType,
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
      })
      .catch(err => console.error('Error fetching movie details:', err));
  };

  const handleOpenUserProfile = useCallback((userObjOrUsername) => {
    let target = userObjOrUsername;
    if (typeof userObjOrUsername === 'string') {
      target = { username: userObjOrUsername };
    }
    setViewingUserProfile(target);
    handleTabChange('profile');
  }, [handleTabChange]);

  const handleUpdateProfile = async (updatedDetails) => {
    // Immediately update local state & local storage cache
    setCurrentUser(prev => {
      const nextUser = { ...prev, ...updatedDetails };
      const bannerPos = nextUser.bannerPosPercent !== undefined ? nextUser.bannerPosPercent : (prev?.bannerPosPercent ?? 20);
      const bannerFit = nextUser.bannerFitMode || prev?.bannerFitMode || 'cover';
      const bannerUrlVal = nextUser.bannerUrl !== undefined ? nextUser.bannerUrl : (prev?.bannerUrl || '');

      localStorage.setItem('cinelog_banner_pos', bannerPos);
      localStorage.setItem('cinelog_banner_fit', bannerFit);
      localStorage.setItem('cinelog_banner_url', bannerUrlVal);

      if (nextUser.id) {
        localStorage.setItem(`cinelog_banner_pos_${nextUser.id}`, bannerPos);
        localStorage.setItem(`cinelog_banner_fit_${nextUser.id}`, bannerFit);
        localStorage.setItem(`cinelog_banner_url_${nextUser.id}`, bannerUrlVal);
        localStorage.setItem(`equipped_border_${nextUser.id}`, nextUser.equippedBorder || 'none');
        localStorage.setItem(`cinelog_shop_${nextUser.id}`, JSON.stringify({
          equippedBorder: nextUser.equippedBorder || 'none',
          bannerUrl: bannerUrlVal,
          bannerFitMode: bannerFit,
          bannerPosPercent: bannerPos,
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
        localStorage.setItem('cinelog_sandbox_user', JSON.stringify(nextUser));
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
        banner_fit_mode: updatedDetails.bannerFitMode !== undefined ? updatedDetails.bannerFitMode : (currentUser.bannerFitMode || 'cover'),
        banner_pos_percent: updatedDetails.bannerPosPercent !== undefined ? updatedDetails.bannerPosPercent : (currentUser.bannerPosPercent ?? 20),
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

  const POPULAR_SUGGESTIONS = [
    'Dune: Part Two', 'Oppenheimer', 'Interstellar', 'The Batman', 'Gladiator II', 'Blade Runner 2049', 'Inception'
  ];

  const GENRE_QUICK_FILTERS = [
    'Sci-Fi', 'Action', 'Thriller', 'Horror', 'Drama', 'Animation', 'Crime'
  ];

  return (
    <div style={{ background: '#000000', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Main app container with layout class */}
      <div
        className={`app-container ${layoutMode === 'top-nav' ? 'layout-topnav' : 'layout-sidebar'}`}
        style={{ position: 'relative', flex: 1, minHeight: 0 }}
      >
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
          layoutMode={layoutMode}
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
          <CollectionsTab library={library} onMovieClick={handleMovieClick} onSaveMovie={handleSaveMovie} />
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
          <ProfileTab
            targetUser={viewingUserProfile}
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
            library={library}
            onMovieClick={handleMovieClick}
            onOpenUserProfile={handleOpenUserProfile}
            initialSubTab={profileSubTab}
            onSubTabChange={setProfileSubTab}
          />
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
          <SocialTab currentUser={currentUser} onMovieClick={handleMovieClick} onOpenUserProfile={handleOpenUserProfile} />
        )}
      </main>

      {activeEditMovie && (
        <MovieDetailModal
          key={activeEditMovie.tmdb_id}
          inLibrary={library.some(m => String(m.tmdb_id) === String(activeEditMovie.tmdb_id))}
          onOpenMovie={handleMovieClick}
          movie={activeEditMovie}
          currentUser={currentUser}
          onClose={() => setActiveEditMovie(null)}
          onSave={handleSaveMovie}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={library.find(m => String(m.tmdb_id) === String(activeEditMovie.tmdb_id))?.favorite || false}
          onOpenUserProfile={handleOpenUserProfile}
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

      {/* ── CINEMA SEARCH & DISCOVERY MODAL ───────────────────── */}
      {showCommandCenter && (
        <div
          className="modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(16px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '12vh',
            paddingLeft: '16px',
            paddingRight: '16px',
            overscrollBehavior: 'contain'
          }}
          onClick={e => e.target === e.currentTarget && setShowCommandCenter(false)}
          onWheel={e => e.stopPropagation()}
        >
          <div
            className="animate-fade-in-scale"
            style={{
              width: '100%',
              maxWidth: '580px',
              background: '#0f0f0f',
              border: '1px solid #242424',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 28px 80px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.04)',
              display: 'flex',
              flexDirection: 'column',
              overscrollBehavior: 'contain'
            }}
            onWheel={e => e.stopPropagation()}
          >
            {/* Search Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 20px',
              borderBottom: '1px solid #1e1e1e',
              background: '#131313'
            }}>
              <Search size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
              <input
                autoFocus
                type="text"
                placeholder="Search films, series, actors, directors..."
                value={cmdQuery}
                onChange={e => setCmdQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') setShowCommandCenter(false);
                  if (e.key === 'Enter') {
                    if (cmdSearchResults.length > 0) {
                      const first = cmdSearchResults[0];
                      if (first.media_type === 'movie' || first.media_type === 'tv') {
                        handleMovieClick(first.id, first.media_type);
                        setShowCommandCenter(false);
                      }
                    }
                  }
                }}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 600,
                  fontFamily: 'inherit'
                }}
              />
              {cmdQuery && (
                <button
                  onClick={() => setCmdQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#666666',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
              <kbd style={{
                fontSize: '10px',
                color: '#777777',
                background: '#1c1c1c',
                border: '1px solid #282828',
                borderRadius: '4px',
                padding: '2px 7px',
                fontFamily: 'monospace',
                fontWeight: 600
              }}>
                ESC
              </kbd>
            </div>

            {/* Results / Discovery Body */}
            <div
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                if (scrollHeight - scrollTop - clientHeight < 80) {
                  handleLoadMoreSearch();
                }
              }}
              style={{ maxHeight: '440px', overflowY: 'auto', overscrollBehavior: 'contain', padding: '12px' }}
            >
              {/* TMDB Loading state */}
              {isCmdSearching && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 12px', color: '#888888', fontSize: '13px' }}>
                  <Loader2 size={16} className="animate-spin" color="var(--accent)" />
                  <span>Searching TMDB cinema database...</span>
                </div>
              )}

              {/* TMDB Live Results */}
              {cmdSearchResults.length > 0 && (
                <div>
                  <div style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#666666',
                    padding: '4px 10px 8px'
                  }}>
                    Search Results ({cmdSearchResults.length})
                  </div>
                  {cmdSearchResults.map((item) => {
                    const poster = item.poster_path
                      ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                      : (item.profile_path ? `https://image.tmdb.org/t/p/w92${item.profile_path}` : null);
                    const title = item.title || item.name;
                    const year = (item.release_date || item.first_air_date || '').slice(0, 4);
                    const isTv = item.media_type === 'tv';
                    const isPerson = item.media_type === 'person';
                    const inLib = library.some(m => String(m.tmdb_id) === String(item.id));

                    return (
                      <div
                        key={`${item.media_type}-${item.id}`}
                        onClick={() => {
                          if (item.media_type === 'movie' || item.media_type === 'tv') {
                            handleMovieClick(item.id, item.media_type);
                            setShowCommandCenter(false);
                          } else if (item.media_type === 'person') {
                            if (item.known_for?.[0]?.id) {
                              handleMovieClick(item.known_for[0].id, item.known_for[0].media_type || 'movie');
                            }
                            setShowCommandCenter(false);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background 0.12s ease',
                          marginBottom: '3px'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#181818'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Poster Thumbnail */}
                        <div style={{
                          width: '38px',
                          height: '54px',
                          borderRadius: '4px',
                          background: '#1c1c1c',
                          overflow: 'hidden',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #262626'
                        }}>
                          {poster ? (
                            <img src={poster} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Film size={16} color="#555" />
                          )}
                        </div>

                        {/* Title & metadata */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: '#ffffff', fontSize: '13.5px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: '9px',
                              fontWeight: 900,
                              letterSpacing: '0.04em',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              background: isTv ? '#1e3a8a' : (isPerson ? '#2d2d2d' : 'var(--accent)'),
                              color: isTv ? '#93c5fd' : (isPerson ? '#cccccc' : '#ffffff')
                            }}>
                              {isTv ? 'SERIES' : (isPerson ? 'PERSON' : 'MOVIE')}
                            </span>
                            {year && <span style={{ color: '#888888', fontSize: '12px' }}>{year}</span>}
                            {item.vote_average > 0 && (
                              <span style={{ color: '#eab308', fontSize: '12px', fontWeight: 700 }}>
                                ★ {(Math.round(item.vote_average * 10) / 10).toFixed(1)}
                              </span>
                            )}
                            {isPerson && item.known_for_department && (
                              <span style={{ color: '#888888', fontSize: '11.5px' }}>{item.known_for_department}</span>
                            )}
                            {inLib && (
                              <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 600 }}>
                                ✓ In Library
                              </span>
                            )}
                          </div>
                        </div>

                        <ArrowRight size={14} color="#555" style={{ flexShrink: 0 }} />
                      </div>
                    );
                  })}

                  {/* Infinite scroll loading indicator */}
                  {isLoadingMore && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', color: '#888888', fontSize: '12px' }}>
                      <Loader2 size={15} className="animate-spin" color="var(--accent)" />
                      <span>Loading more titles...</span>
                    </div>
                  )}

                  {/* End of results message */}
                  {cmdPage >= cmdTotalPages && cmdSearchResults.length >= 15 && (
                    <div style={{ textAlign: 'center', padding: '12px', color: '#666666', fontSize: '11px', fontWeight: 600 }}>
                      All {cmdSearchResults.length} titles loaded
                    </div>
                  )}
                </div>
              )}

              {/* When no query is typed: Show Trending Movies, Popular Searches & Genre Discovery */}
              {!cmdQuery.trim() && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Trending Movies Quick Picks */}
                  {trendingQuickPicks.length > 0 && (
                    <div>
                      <div style={{
                        fontSize: '10.5px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#666666',
                        padding: '4px 10px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <Flame size={13} color="var(--accent)" />
                        <span>Trending Today</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {trendingQuickPicks.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => {
                              handleMovieClick(m.id, 'movie');
                              setShowCommandCenter(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'background 0.12s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#181818'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{
                              width: '36px',
                              height: '50px',
                              borderRadius: '4px',
                              background: '#1c1c1c',
                              overflow: 'hidden',
                              flexShrink: 0,
                              border: '1px solid #262626'
                            }}>
                              {m.poster_path ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w92${m.poster_path}`}
                                  alt={m.title}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <Film size={15} color="#555" />
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ color: '#ffffff', fontSize: '13.5px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {m.title}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                <span style={{ color: '#888888', fontSize: '12px' }}>
                                  {(m.release_date || '').slice(0, 4)}
                                </span>
                                {m.vote_average > 0 && (
                                  <span style={{ color: '#eab308', fontSize: '12px', fontWeight: 700 }}>
                                    ★ {(Math.round(m.vote_average * 10) / 10).toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight size={14} color="#555" style={{ flexShrink: 0 }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Searches */}
                  <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '10px' }}>
                    <div style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#666666',
                      padding: '2px 10px 8px'
                    }}>
                      Popular Searches
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0 8px' }}>
                      {POPULAR_SUGGESTIONS.map(chip => (
                        <button
                          key={chip}
                          onClick={() => setCmdQuery(chip)}
                          style={{
                            background: '#181818',
                            border: '1px solid #282828',
                            color: '#cccccc',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#222222';
                            e.currentTarget.style.borderColor = 'var(--accent)';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = '#181818';
                            e.currentTarget.style.borderColor = '#282828';
                            e.currentTarget.style.color = '#cccccc';
                          }}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Explore by Genre */}
                  <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '10px' }}>
                    <div style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#666666',
                      padding: '2px 10px 8px'
                    }}>
                      Browse by Genre
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0 8px' }}>
                      {GENRE_QUICK_FILTERS.map(g => (
                        <button
                          key={g}
                          onClick={() => setCmdQuery(g)}
                          style={{
                            background: '#161616',
                            border: '1px solid #262626',
                            color: '#aaaaaa',
                            borderRadius: '6px',
                            padding: '4px 9px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'var(--accent)';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#262626';
                            e.currentTarget.style.color = '#aaaaaa';
                          }}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* No results */}
              {cmdQuery.trim() && cmdSearchResults.length === 0 && !isCmdSearching && (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: '#777777', fontSize: '13px' }}>
                  No films, series or actors found matching "{cmdQuery}"
                </div>
              )}
            </div>

            {/* Clean Footer */}
            <div style={{
              padding: '10px 18px',
              borderTop: '1px solid #1e1e1e',
              background: '#0d0d0d',
              fontSize: '11px',
              color: '#666666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', gap: '14px' }}>
                <span>↵ Open Title</span>
                <span>ESC Close</span>
              </div>
              <span style={{ color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.04em' }}>
                Cinema Search
              </span>
            </div>
          </div>
        </div>
      )}
      {/* ── FLOATING ACTION BUTTON (Quick Add) ──────────────────── */}
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
              border: '1px solid rgba(136,8,8,0.35)',
              borderRadius: '20px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(136,8,8,0.12)',
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
                      border: '1px solid rgba(136,8,8,0.25)',
                      borderRadius: '12px',
                      padding: '10px 12px 10px 36px',
                      color: '#fff', fontSize: '14px', fontWeight: 600,
                      outline: 'none',
                      fontFamily: 'var(--font-heading)',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(136,8,8,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(136,8,8,0.25)'}
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
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(136,8,8,0.1)'}
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
                        background: inLibrary ? 'rgba(16,185,129,0.15)' : 'rgba(136,8,8,0.15)',
                        color: inLibrary ? '#10b981' : '#c0392b',
                        border: `1px solid ${inLibrary ? 'rgba(16,185,129,0.3)' : 'rgba(136,8,8,0.3)'}`,
                      }}>{inLibrary ? '✓ In Library' : '+ Add'}</div>
                    </button>
                  );
                })}
              </div>

              {/* Footer shortcut hint */}
              <div style={{ padding: '8px 18px 12px', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center' }}>
                Tap a result to log it · <span style={{ color: '#c0392b' }}>Explore</span> for full search
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
              width: '52px', height: '52px',
              borderRadius: '50%',
              background: 'var(--accent)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.8)',
              cursor: 'pointer',
              zIndex: 9000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 400,
              color: '#fff',
              transform: showQuickAdd ? 'rotate(45deg)' : 'rotate(0deg)',
              transition: 'transform 0.18s ease, background 0.15s ease',
            }}
          >
            +
          </button>
        </>

      </div>
    </div>
  );
}

