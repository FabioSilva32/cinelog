import {useSaveFeedback} from './hooks/useSaveFeedback';
import SaveIndicator from './components/SaveIndicator';
import {reviewSpoilerFlag} from './utils/reviews';
import {BORDER_STYLES,isUserCreator} from './utils/achievements';
import { withViewingStatus } from './utils/quickStatus';
import {tmdbMediaType} from './utils/screeningDetails';
import SearchWorkspace from './components/SearchWorkspace';
import QuickLogDialog from './components/QuickLogDialog';
import {catalogueKey,newLibraryRow} from './utils/catalogue';
import {useDismissiblePopovers} from './hooks/useDismissiblePopovers';
import {useDialogFocus} from './hooks/useDialogFocus';
import { publishProfile } from './utils/publishProfile';
import { ownBannerUrl } from './utils/profileBanner';
import { readHistoryDestination, pagePath, profilePath, filmPath, canonicalPath, isAuthCallbackURL, listPath } from './utils/navigation';
import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { App as CapApp } from '@capacitor/app';
import Header from './components/StudioNavigation';
import LandingPage from './components/LandingPage';
import { DEFAULT_GREY_AVATAR } from './components/AvatarWithBorder';
import LibraryTab from './components/LibraryTab';
import ExploreTab from './components/ExploreTab';
const CollectionsTab = lazy(() => import('./components/CollectionsTab'));
const TierListTab = lazy(() => import('./components/TierListTab'));
const ProfileTab = lazy(() => import('./components/ProfileTab'));
const AchievementsTab = lazy(() => import('./components/AchievementsTab'));
const ConstellationTab = lazy(() => import('./components/ConstellationTab'));
const WatchCalendarTab = lazy(() => import('./components/WatchCalendarTab'));
import MovieDetailModal from './components/MovieDetailModal';
const StatsTab = lazy(() => import('./components/StatsTab'));
import AuthModal from './components/AuthModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import ConfirmModal from './components/ConfirmModal';
const TriviaTab = lazy(() => import('./components/TriviaTab'));
const ChallengesTab = lazy(() => import('./components/ChallengesTab'));
const WrappedTab = lazy(() => import('./components/WrappedTab'));
const ForYouTab = lazy(() => import('./components/ForYouTab'));
const SocialTab = lazy(() => import('./components/SocialTab'));
import UserProfileModal from './components/UserProfileModal';

import SettingsPanel, { applyTheme, THEMES } from './components/SettingsPanel';
import { ToastProvider, useToast } from './components/ToastSystem';
import { useBodyScrollLock } from './hooks/useBodyScrollLock';

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getSuggestedTags } from './utils/collections';
import { getEnhancedMovieTitle, enhanceMovie, normalizeSearchQuery } from './utils/movieTitles';
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
  const [activeTab, setActiveTab] = useState(() => readHistoryDestination(window.location.href).tab);
  const [profileSubTab, setProfileSubTab] = useState(() => readHistoryDestination(window.location.href).sub);
  const [tabHistory, setTabHistory] = useState(['explore']);
  const [viewingUserProfile, setViewingUserProfile] = useState(() => {const route=readHistoryDestination(window.location.href);return route.modal==='user'?route.target:null;});

  // Synchronize tab navigation with browser history (enables browser Back < and Forward > buttons)
  const handleTabChange = useCallback((newTab, replace = false, keepViewedUser = false) => {
    // Whenever changing tabs or opening stats/calendar/stars/etc., clear any viewed other user profile!
    if (!keepViewedUser) {
      setViewingUserProfile(null);
    }

    // If navigating to a personal tracking tab that now lives inside Profile, redirect to profile sub-tab!
    if (['shop', 'diary', 'watchlist', 'reviews'].includes(newTab)) {
      setProfileSubTab(newTab);
      setActiveTab('profile');
      if (!replace) {
        setTabHistory(prev => (prev[prev.length - 1] === 'profile' ? prev : [...prev, 'profile']));
      }
      try {
        const url = new URL(window.location.href);
        url.hash = "";
        url.pathname=pagePath('profile',newTab);url.search='';
        if (replace) {
          window.history.replaceState({ tab: 'profile', sub: newTab }, '', url.toString());
        } else {
          window.history.pushState({ tab: 'profile', sub: newTab }, '', url.toString());
        }
      } catch (e) {}
      return;
    }

    // Always reset to Overview when navigating back to Profile
    if (newTab === 'profile') {
      setProfileSubTab('overview');
    }

    const resolved = newTab === 'landing' ? 'explore' : newTab;
    setActiveTab(resolved);
    if (!replace) {
      setTabHistory(prev => (prev[prev.length - 1] === resolved ? prev : [...prev, resolved]));
    }
    try {
      const url = new URL(window.location.href);
        url.hash = "";
      url.pathname=pagePath(resolved);url.search='';
      if (replace) {
        window.history.replaceState({ tab: resolved }, '', url.toString());
      } else {
        window.history.pushState({ tab: resolved }, '', url.toString());
      }
    } catch (e) {}
    window.dispatchEvent(new Event('cinelog:route-change'));
  }, []);

  const initialRoute = useRef(readHistoryDestination(window.location.href,window.history.state||{}));
  const restoredInitialMovie=useRef(false);
  useEffect(() => {
    const route=initialRoute.current;
    if(isAuthCallbackURL(window.location.href))return;
    window.history.replaceState({...window.history.state,root:true,tab:route.tab,sub:route.sub},'',canonicalPath(route));
  },[]);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommandCenter, setShowCommandCenter] = useState(false);
  useBodyScrollLock(showCommandCenter);
  useDismissiblePopovers();
  const searchDialogRef=useDialogFocus(showCommandCenter);

  const [cmdQuery, setCmdQuery] = useState('');
  const [cmdSearchResults, setCmdSearchResults] = useState([]);
  const [isCmdSearching, setIsCmdSearching] = useState(false);
  const [cmdPage, setCmdPage] = useState(1);
  const [cmdTotalPages, setCmdTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [trendingQuickPicks, setTrendingQuickPicks] = useState([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const quickDialogRef=useDialogFocus(showQuickAdd);
  useBodyScrollLock(showQuickAdd);
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

  // Synchronize theme changes from Settings
  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e.detail?.id) {
        setActiveComboId(e.detail.id);
      }
    };
    window.addEventListener('cinelog-theme-change', handleThemeChange);
    return () => window.removeEventListener('cinelog-theme-change', handleThemeChange);
  }, []);

  // Apply razor-sharp solid color combo to root variables
  useEffect(() => {
    const combo = SHARP_SOLID_COMBOS.find(c => c.id === activeComboId) || SHARP_SOLID_COMBOS[0];
    const root = document.documentElement;
    root.style.setProperty('--accent', combo.accent);
    root.style.setProperty('--accent-contrast', combo.contrast || '#ffffff');
    root.style.setProperty('--accent-rgb', combo.rgb || '229, 9, 20');
    root.style.setProperty('--accent-gradient', combo.accent);
    root.style.setProperty('--accent-hover', combo.accent);
    root.style.setProperty('--accent-glow', `rgba(${combo.rgb || '229, 9, 20'}, 0.4)`);
    root.style.setProperty('--red', combo.accent);
    root.style.setProperty('--red-glow', `rgba(${combo.rgb || '229, 9, 20'}, 0.35)`);
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
    const searchParam = normalizeSearchQuery(quickSearch);
    const timer = setTimeout(() => {
      fetch(`https://api.themoviedb.org/3/search/multi?api_key=6a2fd6b9b1bb3befbb9f14c203732225&query=${encodeURIComponent(searchParam)}&page=1`)
        .then(r => r.json())
        .then(data => {
          const enhanced = (data.results || [])
            .filter(r => r.media_type === 'movie' || r.media_type === 'tv')
            .map(enhanceMovie)
            .slice(0, 6);
          setQuickResults(enhanced);
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

  // Global keyboard shortcuts (Ctrl/Cmd+K for search)
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if(window.location.pathname==='/search')document.querySelector('input[aria-label="Search catalogue"]')?.focus();else handleTabChange('search');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleTabChange]);

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
    const rawQ = cmdQuery.trim();
    if (!rawQ || rawQ.length < 2) {
      setCmdSearchResults([]);
      setIsCmdSearching(false);
      setCmdPage(1);
      setCmdTotalPages(1);
      return;
    }
    const q = normalizeSearchQuery(rawQ);
    setIsCmdSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=6a2fd6b9b1bb3befbb9f14c203732225&query=${encodeURIComponent(q)}&page=1`);
        if (res.ok) {
          const data = await res.json();
          const filtered = (data.results || [])
            .filter(item =>
              (item.media_type === 'movie' || item.media_type === 'tv' || item.media_type === 'person') &&
              (item.title || item.name)
            )
            .map(enhanceMovie);
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
    const rawQ = cmdQuery.trim();
    if (!rawQ) return;
    const q = normalizeSearchQuery(rawQ);
    setIsLoadingMore(true);
    const nextPage = cmdPage + 1;
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=6a2fd6b9b1bb3befbb9f14c203732225&query=${encodeURIComponent(q)}&page=${nextPage}`);
      if (res.ok) {
        const data = await res.json();
        const filtered = (data.results || [])
          .filter(item =>
            (item.media_type === 'movie' || item.media_type === 'tv' || item.media_type === 'person') &&
            (item.title || item.name)
          )
          .map(enhanceMovie);
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

  const [currentUser, setCurrentUser] = useState(()=>{try{if(!localStorage.getItem('cinelog_tier_legacy_owner')){const cached=JSON.parse(localStorage.getItem('cinelog_supabase_cached_user')||'null');localStorage.setItem('cinelog_tier_legacy_owner',cached?.id||'unclaimed');}}catch{}return null;});

  const activeOwner=useRef(currentUser?.id);activeOwner.current=currentUser?.id;
  const sync=useSaveFeedback(currentUser?.id);

  const [library, setLibrary] = useState(() => {
    return [];
  });
  const [showAuth, setShowAuth] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [activeEditMovie, setActiveEditMovie] = useState(null);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);

  // Safety: Guarantee page scroll is never frozen when modals are closed
  useEffect(() => {
    if (!activeEditMovie && !showAuth && !showCommandCenter && !showSettings && !showRecoveryModal && !confirmConfig?.isOpen && !viewingUserProfile) {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      delete document.body.dataset.scrollLocks;
    }
  }, [activeEditMovie, showAuth, showCommandCenter, showSettings, showRecoveryModal, confirmConfig?.isOpen, viewingUserProfile, activeTab]);

  // Global Escape key listener to close active top-level menus and modals
  useEffect(() => {
    const handleKeyDown = (e) => {
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
          if(document.querySelector('.account-dialog form[aria-busy=true]'))return;
          setShowAuth(false);
          return;
        }
        if (showRecoveryModal) {
          setShowRecoveryModal(false);
          return;
        }
        if (activeEditMovie) {
          if (readHistoryDestination(window.location.href,window.history.state||{}).modal==='movie') { if(window.history.state?.modal&&!window.history.state?.root){window.history.back();return;} window.history.replaceState({tab:activeTab},'',pagePath(activeTab)); }
          setActiveEditMovie(null);
          return;
        }
        if (viewingUserProfile && window.location.hash.startsWith('#user-')) {
          if (window.location.hash.startsWith('#user-') && window.history.state?.modal) { window.history.back(); return; }
          setViewingUserProfile(null);
          return;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showQuickAdd, showCommandCenter, showSettings, showAuth, showRecoveryModal, activeEditMovie, viewingUserProfile, activeTab]);

  // Synchronize state references for hardware / swipe back handling
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  const profileSubTabRef = useRef(profileSubTab);
  profileSubTabRef.current = profileSubTab;

  const tabHistoryRef = useRef(tabHistory);
  tabHistoryRef.current = tabHistory;

  const activeEditMovieRef = useRef(activeEditMovie);
  activeEditMovieRef.current = activeEditMovie;

  const viewingUserProfileRef = useRef(viewingUserProfile);
  viewingUserProfileRef.current = viewingUserProfile;

  const showQuickAddRef = useRef(showQuickAdd);
  showQuickAddRef.current = showQuickAdd;

  const showCommandCenterRef = useRef(showCommandCenter);
  showCommandCenterRef.current = showCommandCenter;

  const showSettingsRef = useRef(showSettings);
  showSettingsRef.current = showSettings;

  const showAuthRef = useRef(showAuth);
  showAuthRef.current = showAuth;

  const showRecoveryModalRef = useRef(showRecoveryModal);
  showRecoveryModalRef.current = showRecoveryModal;

  const confirmConfigRef = useRef(confirmConfig);
  confirmConfigRef.current = confirmConfig;

  const lastBackPressRef = useRef(0);
  const lastBackActionTimeRef = useRef(0);
  const touchSwipeStartRef = useRef(null);

  // ── Unified Movie Click / Opener Helper ──
  const handleMovieClick = useCallback((movieOrId, mediaType, navigation = {}) => {
    lastBackPressRef.current = 0;
    if (typeof movieOrId === 'object' && movieOrId !== null) {
      setActiveEditMovie(enhanceMovie(movieOrId));
      const tmdbId = movieOrId.tmdb_id || movieOrId.id;
      try {
        if (!navigation.restore) window.history[window.history.state?.modal==='movie'||window.history.state?.modal==='quickadd'?'replaceState':'pushState']({ modal: 'movie', id: tmdbId, movie: typeof movieOrId === 'object' ? movieOrId : null, mediaType, tab: activeTabRef.current, sub: profileSubTabRef.current }, '', filmPath(tmdbId,typeof movieOrId==='object'?tmdbMediaType(movieOrId):tmdbMediaType(library.find(item=>String(item.tmdb_id)===String(tmdbId))||{media_type:mediaType||'movie'})));
      } catch (e) {}
      return;
    }

    const tmdbId = movieOrId;
    try {
      if (!navigation.restore) window.history[window.history.state?.modal==='movie'||window.history.state?.modal==='quickadd'?'replaceState':'pushState']({ modal: 'movie', id: tmdbId, movie: typeof movieOrId === 'object' ? movieOrId : null, mediaType, tab: activeTabRef.current, sub: profileSubTabRef.current }, '', filmPath(tmdbId,mediaType || movieOrId?.media_type || 'movie'));
    } catch (e) {}

    let resolvedType = mediaType;
    if (!resolvedType) {
      const match = library.find(m => String(m.tmdb_id) === String(tmdbId));
      if (match) resolvedType = match.media_type;
    }
    const existing = library.find(m => String(m.tmdb_id) === String(tmdbId) && (!resolvedType || m.media_type === resolvedType)) || library.find(m=>String(m.tmdb_id)===String(tmdbId)&&tmdbMediaType(m)===resolvedType);
    if (existing) { setActiveEditMovie(enhanceMovie(existing)); return; }

    const targetType = tmdbMediaType({media_type:resolvedType||'movie'});
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
        const enhancedItem = enhanceMovie({
          id: crypto.randomUUID(), tmdb_id: data.id, media_type: finalType,
          title: getEnhancedMovieTitle(data) || data.title || data.name, poster_path: data.poster_path,
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
        const destination=readHistoryDestination(window.location.href,window.history.state||{});
        if(destination.modal!=='movie'||String(destination.target.tmdb_id||destination.target.id||destination.target)!==String(tmdbId))return;
        setActiveEditMovie(enhancedItem);
        window.history.replaceState({ ...window.history.state, movie: enhancedItem }, '', window.location.href);
      })
      .catch(err => console.error('Error fetching movie details:', err));
  }, [library]);

  useEffect(()=>{if(initialRoute.current?.modal==='movie'&&!restoredInitialMovie.current){restoredInitialMovie.current=true;const route=initialRoute.current;handleMovieClick(route.target,route.mediaType,{restore:true});}},[handleMovieClick]);
  const openMovieDetail = handleMovieClick;

  const openSettings = useCallback(() => {
    lastBackPressRef.current = 0;
    try {
      window.history.pushState({ modal: 'settings' }, '', '#settings');
    } catch (e) {}
    setShowSettings(true);
  }, []);

  const openCommandCenter = useCallback(() => {
    lastBackPressRef.current = 0;
    setShowCommandCenter(false);
    if(window.location.pathname==='/search')document.querySelector('input[aria-label="Search catalogue"]')?.focus();else handleTabChange('search');
  }, [handleTabChange]);

  const openQuickAdd = useCallback(() => {
    lastBackPressRef.current = 0;
    try {
      window.history.pushState({ modal: 'quickadd' }, '', '#quickadd');
    } catch (e) {}
    setShowQuickAdd(true);
  }, []);

  const openAuth = useCallback(() => {
    lastBackPressRef.current = 0;
    try {
      window.history.pushState({ modal: 'auth' }, '', '#auth');
    } catch (e) {}
    setShowAuth(true);
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if ((!showCommandCenter && hash === '#search')) {
      window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
    }
  }, [showCommandCenter, activeEditMovie, activeTab]);

  // ── Modal Closer Helper (cleanly synchronizes history hash with state) ──
  const closeModal = useCallback((modalType) => {
    if(modalType==='auth'&&document.querySelector('.account-dialog form[aria-busy=true]'))return;
    lastBackPressRef.current = 0;
    if(modalType==='user'){if(!window.history.state?.root){window.history.back();return;}setViewingUserProfile(null);setActiveTab('social');window.history.replaceState({tab:'social'},'',pagePath('social'));return;}
    const hash = window.location.hash || '';
    const hasModalHash =
      (modalType === 'movie' && (hash.startsWith('#movie-') || window.location.pathname.startsWith('/film/'))) ||
      (modalType === 'settings' && hash === '#settings') ||
      (modalType === 'search' && hash === '#search') ||
      (modalType === 'quickadd' && hash === '#quickadd') ||
      (modalType === 'auth' && hash === '#auth') ||
      (modalType === 'user' && hash.startsWith('#user-')) ||
      (modalType === 'recovery' && hash === '#recovery');

    if (hasModalHash && ['movie', 'user', 'quickadd'].includes(modalType) && window.history.state?.modal && !window.history.state?.root) {
      window.history.back();
      return;
    }
    if (hasModalHash) {
      try {
        const cleanUrl = modalType==='movie'?pagePath(activeTabRef.current,profileSubTabRef.current):window.location.pathname + window.location.search;
        const {modal,movie,id,mediaType,targetUser,...pageState}=window.history.state||{};
        window.history.replaceState({...pageState,tab:activeTabRef.current,sub:profileSubTabRef.current}, '', cleanUrl);
      } catch (e) {}
    }

    if (modalType === 'movie') setActiveEditMovie(null);
    if (modalType === 'settings') setShowSettings(false);
    if (modalType === 'search') setShowCommandCenter(false);
    if (modalType === 'quickadd') setShowQuickAdd(false);
    if (modalType === 'auth') setShowAuth(false);
    if (modalType === 'recovery') setShowRecoveryModal(false);
    if (modalType === 'user') setViewingUserProfile(null);
    if (modalType === 'confirm') setConfirmConfig(prev => ({ ...prev, isOpen: false }));
  }, []);

  // ── Native Android CloseWatcher Integration (Official W3C standard for Android edge swipe) ──
  useEffect(() => {
    const isAnyModalOpen = Boolean(
      activeEditMovie ||
      showSettings ||
      showCommandCenter ||
      showQuickAdd ||
      showAuth ||
      showRecoveryModal ||
      confirmConfig?.isOpen
    );

    if (!isAnyModalOpen) return;

    if (typeof window !== 'undefined' && 'CloseWatcher' in window) {
      try {
        const watcher = new window.CloseWatcher();
        watcher.onclose = () => {
          lastBackPressRef.current = 0;
          const openDrawerCloseBtn = document.querySelector('.studio-sidebar.is-open .studio-mobile-close') || document.querySelector('.mobile-drawer-close-btn') ||
            document.querySelector('.mobile-drawer-overlay');
          if (openDrawerCloseBtn) { openDrawerCloseBtn.click(); return; }
          if (showQuickAdd) { closeModal('quickadd'); return; }
          if (showCommandCenter) { closeModal('search'); return; }
          if (showSettings) { closeModal('settings'); return; }
          if (showAuth) { closeModal('auth'); return; }
          if (showRecoveryModal) { closeModal('recovery'); return; }
          if (confirmConfig?.isOpen) { closeModal('confirm'); return; }
          if (activeEditMovie) { closeModal('movie'); return; }
          if (viewingUserProfile) { closeModal('user'); return; }
        };
        return () => {
          try { watcher.destroy(); } catch (e) {}
        };
      } catch (err) {}
    }
  }, [activeEditMovie, showSettings, showCommandCenter, showQuickAdd, showAuth, showRecoveryModal, viewingUserProfile, confirmConfig?.isOpen, closeModal]);

  // ── Universal Back Handler (for Capacitor, Android hardware back & WebView) ──
  const handleUniversalBack = useCallback(() => {
    const now = Date.now();
    if (now - lastBackActionTimeRef.current < 250) {
      return 'throttled';
    }
    lastBackActionTimeRef.current = now;

    const alertDialog=document.querySelector('[role="alertdialog"]');
    if(alertDialog){alertDialog.querySelector('.screening-dialog-close')?.click();lastBackPressRef.current=0;return 'handled';}
    // Check if child modals want to handle it first (e.g. ProfileCustomizerModal)
    const backEvent = new CustomEvent('cinelog-back-handled', { cancelable: true });
    window.dispatchEvent(backEvent);
    if (backEvent.defaultPrevented) {
      lastBackPressRef.current = 0;
      return 'handled';
    }

    // 1. Close open overlay modals or bottom sheets first (guarantees app never closes/navigates background while a modal/drawer is up)
    const openDrawerCloseBtn = document.querySelector('.mobile-drawer-close-btn') ||
      document.querySelector('.mobile-drawer-overlay');
    if (openDrawerCloseBtn) {
      lastBackPressRef.current = 0;
      openDrawerCloseBtn.click();
      return 'handled';
    }

    if (showQuickAddRef.current) { closeModal('quickadd'); return 'handled'; }
    if (showCommandCenterRef.current) { closeModal('search'); return 'handled'; }
    if (showSettingsRef.current) { closeModal('settings'); return 'handled'; }
    if (showAuthRef.current) { closeModal('auth'); return 'handled'; }
    if (showRecoveryModalRef.current) { closeModal('recovery'); return 'handled'; }
    if (activeEditMovieRef.current) { closeModal('movie'); return 'handled'; }
    if (viewingUserProfileRef.current) { closeModal('user'); return 'handled'; }
    if (confirmConfigRef.current?.isOpen) { closeModal('confirm'); return 'handled'; }

    // Check if an open custom modal close button exists in DOM
    const dialogCloseButtons=[...document.querySelectorAll('[role=dialog] button[aria-label^="Close"]')];
    const openModalCloseBtn=dialogCloseButtons.at(-1)||document.querySelector('.modal-backdrop button.btn-ghost');
    if (openModalCloseBtn) {
      lastBackPressRef.current = 0;
      openModalCloseBtn.click();
      return 'handled';
    }

    // 2. Subtab or tab navigation
    if (activeTabRef.current === 'profile' && profileSubTabRef.current !== 'overview') {
      lastBackPressRef.current = 0;
      setProfileSubTab('overview');
      try {
        const url = new URL(window.location.href);
        url.hash = "";
        url.pathname=pagePath('profile');url.search='';
        window.history.replaceState({ tab: 'profile' }, '', url.toString());
      } catch (e) {}
      return 'handled';
    }

    if (tabHistoryRef.current.length > 1) {
      lastBackPressRef.current = 0;
      const nextHistory = [...tabHistoryRef.current];
      nextHistory.pop();
      const prevTab = nextHistory[nextHistory.length - 1];
      setTabHistory(nextHistory);
      handleTabChange(prevTab, true);
      return 'handled';
    }

    if (activeTabRef.current !== 'explore') {
      lastBackPressRef.current = 0;
      handleTabChange('explore', true);
      return 'handled';
    }

    // 3. At root (explore tab, no modals, no subtabs): Double-tap back to exit
    if (lastBackPressRef.current > 0 && (now - lastBackPressRef.current < 2000)) {
      try {
        CapApp.minimizeApp();
      } catch (err) {}
      return 'exit';
    } else {
      lastBackPressRef.current = now;
      if (toast?.info) {
        toast.info('Exit CineLog', 'Swipe back again to exit');
      }
      return 'warned';
    }
  }, [closeModal, handleTabChange, toast]);

  // Expose directly to window for Android WebView evaluateJavascript invocation
  useEffect(() => {
    window.cinelogHandleBack = () => handleUniversalBack();
    return () => {
      delete window.cinelogHandleBack;
    };
  }, [handleUniversalBack]);

  // ── Synchronized PopState Handler (Navigates backwards cleanly without creating history loops) ──
  useEffect(() => {
    const onPopState = (e) => {
      // Restore the destination entry, for both Back and Forward.
      const destination = readHistoryDestination(window.location.href, e.state || {});
      setActiveTab(destination.tab);
      setProfileSubTab(destination.sub);
      setActiveEditMovie(null);
      setViewingUserProfile(null);
      setShowSettings(destination.modal === 'settings');
      setShowCommandCenter(destination.modal === 'search');
      setShowQuickAdd(destination.modal === 'quickadd');
      setShowAuth(destination.modal === 'auth');
      setShowRecoveryModal(destination.modal === 'recovery');
      setConfirmConfig(p => ({ ...p, isOpen: false }));
      if (destination.modal === 'user') setViewingUserProfile(destination.target);
      else if (destination.modal === 'movie') handleMovieClick(destination.target, destination.mediaType, { restore: true });
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [handleMovieClick]);

  // ── Universal Mobile Left-Edge Touch Swipe Listener ──
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isLeftEdgeSwipe = false;

    const onTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      // Only initiate gesture if touch starts within 45px of the left screen edge
      if (touch.clientX <= 45) {
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartTime = Date.now();
        isLeftEdgeSwipe = true;
      } else {
        isLeftEdgeSwipe = false;
      }
    };

    const onTouchMove = (e) => {
      if (!isLeftEdgeSwipe || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = Math.abs(touch.clientY - touchStartY);
      // Cancel gesture if user is dragging vertically (scrolling)
      if (deltaY > 30 && deltaY > deltaX) {
        isLeftEdgeSwipe = false;
      }
    };

    const onTouchEnd = (e) => {
      if (!isLeftEdgeSwipe) return;
      isLeftEdgeSwipe = false;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = Math.abs(touch.clientY - touchStartY);
      const elapsed = Date.now() - touchStartTime;

      // Swipe right gesture: moved > 45px right, mostly horizontal, under 500ms
      if (deltaX > 45 && deltaX > deltaY * 1.2 && elapsed < 500) {
        handleUniversalBack();
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleUniversalBack]);

  // ── Hardware Back Listener for Capacitor & Android WebView ──
  useEffect(() => {
    let backListener = null;

    const setupCapacitorBack = async () => {
      try {
        backListener = await CapApp.addListener('backButton', () => handleUniversalBack());
      } catch (err) {
        // Web browser environment
      }
    };

    setupCapacitorBack();

    const docBackHandler = (e) => {
      e?.preventDefault?.();
      handleUniversalBack();
    };

    document.addEventListener('backbutton', docBackHandler);
    window.addEventListener('cinelog-hardware-back', docBackHandler);

    return () => {
      if (backListener && backListener.remove) {
        backListener.remove();
      }
      document.removeEventListener('backbutton', docBackHandler);
      window.removeEventListener('cinelog-hardware-back', docBackHandler);
    };
  }, [handleUniversalBack]);

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

    const restoreSession = async (event, session, version) => {
      if(!alive||version!==sessionVersion)return;
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
            featuredBadges: (() => {
              try {
                const raw = localStorage.getItem(`cinelog_featured_badges_${session.user.id}`);
                return raw ? JSON.parse(raw) : [];
              } catch { return []; }
            })(),
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
            if(!alive||version!==sessionVersion)return;
            if (profile) {
              const fullUser = {
                id: session.user.id,
                username: profile.username || (session.user.email ? session.user.email.split('@')[0] : 'user'),
                displayName: profile.display_name || (session.user.email ? session.user.email.split('@')[0] : 'User'),
                avatar: profile.avatar_url || initialUser.avatar || DEFAULT_GREY_AVATAR,
                bio: profile.bio || '',
                favorites: profile.favorites || [],
                featuredBadges: profile.featured_badges || (() => {
                  try {
                    const raw = localStorage.getItem(`cinelog_featured_badges_${session.user.id}`);
                    return raw ? JSON.parse(raw) : [];
                  } catch { return []; }
                })(),
                equippedBorder: profile.equipped_border || localShop.equippedBorder || localStorage.getItem(`equipped_border_${session.user.id}`) || 'none',
                bannerUrl: ownBannerUrl(profile,session.user.id,localStorage,localShop),
                bannerFitMode: profile.banner_fit_mode ?? localShop.bannerFitMode ?? localStorage.getItem(`cinelog_banner_fit_${session.user.id}`) ?? 'cover',
                bannerPosPercent: profile.banner_pos_percent ?? localShop.bannerPosPercent ?? Number(localStorage.getItem(`cinelog_banner_pos_${session.user.id}`) ?? 20),
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

        // Two-way sync custom lists with Supabase cloud user_metadata (cross-device sync between web and app)
        try {
          const cloudCustomLists = session.user.user_metadata?.cinelog_custom_lists;
          const localListsStr = localStorage.getItem('cinelog_community_lists_v2');
          let localLists = [];
          try { if (localListsStr) localLists = JSON.parse(localListsStr); } catch {}
          if (!Array.isArray(localLists)) localLists = [];

          if (cloudCustomLists && Array.isArray(cloudCustomLists) && cloudCustomLists.length > 0) {
            const merged = [...localLists];
            cloudCustomLists.forEach(cList => {
              const idx = merged.findIndex(l => l.id === cList.id);
              if (idx !== -1) {
                merged[idx] = cList;
              } else {
                merged.unshift(cList);
              }
            });
            localStorage.setItem('cinelog_community_lists_v2', JSON.stringify(merged));
            window.dispatchEvent(new CustomEvent('cinelog_collections_updated'));
          } else if (localLists.length > 0) {
            const userLists = localLists.filter(l =>
              l.author?.id === session.user.id
            );
            if (userLists.length > 0) {
              supabase.auth.updateUser({
                data: { cinelog_custom_lists: userLists }
              }).catch(e => console.warn('Custom lists cloud upload error:', e));
            }
          }
        } catch (e) {
          console.warn('Custom lists session sync error:', e);
        }

        // Parallel load of movie entries & latest activity logs from Supabase
        Promise.all([
          supabase.from('library').select('*').eq('user_id', session.user.id),
          supabase.from('activity_feed').select('title, media_type, created_at, action_type').eq('user_id', session.user.id).in('action_type', ['watched', 'rated', 'reviewed']).order('created_at', { ascending: false })
        ])
          .then(([{ data: libRows, error: libErr }, { data: actRows }]) => {
            if(!alive||version!==sessionVersion)return;
            if (libErr) {
              console.error('Supabase library load error:', libErr);
            }

            const actMap = {};
            for (const a of (actRows || [])) {
              const key = (a.title || '').trim().toLowerCase();
              if (!actMap[key]) actMap[key] = a.created_at;
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
                const matchTitle = (row.title || '').trim().toLowerCase();
                const activityTimestamp = actMap[matchTitle];
                let effectiveWatchDate = parsedEpisodeData.watch_date || (row.status === 'watched' ? row.date_added : null);
                let effectiveDateAdded = row.date_added;
                if (activityTimestamp) {
                  const actTime = new Date(activityTimestamp).getTime();
                  const currWatchTime = new Date(effectiveWatchDate || 0).getTime();
                  if (actTime > currWatchTime) {
                    effectiveWatchDate = activityTimestamp;
                  }
                  const currAddedTime = new Date(effectiveDateAdded || 0).getTime();
                  if (actTime > currAddedTime) {
                    effectiveDateAdded = activityTimestamp;
                  }
                }

                return {
                  id: row.id,
                  tmdb_id: row.tmdb_id,
                  media_type: row.media_type,
                  title: getEnhancedMovieTitle(row) || row.title,
                  poster_path: row.poster_path,
                  release_year: row.release_year,
                  genres: row.genres,
                  status: row.status,
                  // DB rating is now directly 0-10 scale matching the UI
                  rating: row.rating != null ? Number(row.rating) : null,
                  review: cleanReview,contains_spoilers:reviewSpoilerFlag(row),
                  episode_ratings: parsedEpisodeData.ratings || {},
                  episode_notes: parsedEpisodeData.notes || {},
                  episode_watch_dates: parsedEpisodeData.dates || {},
                  season_ratings: parsedEpisodeData.season_ratings || row.season_ratings || {},
                  season_notes: parsedEpisodeData.season_notes || row.season_notes || {},
                  season_dates: parsedEpisodeData.season_dates || row.season_dates || {},
                  episode_data: parsedEpisodeData,
                  screenings: parsedEpisodeData.screenings || row.screenings || [],
                  is_rewatch: (parsedEpisodeData.screenings && parsedEpisodeData.screenings.length > 1) || parsedEpisodeData.is_rewatch || row.is_rewatch || false,
                  rewatch_count: (parsedEpisodeData.screenings && parsedEpisodeData.screenings.length) || parsedEpisodeData.rewatch_count || row.rewatch_count || 1,
                  favorite: row.favorite,
                  date_added: effectiveDateAdded,
                  watch_date: effectiveWatchDate,
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
            if(!alive||version!==sessionVersion)return;
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
    };

    let alive=true,sessionVersion=0,sessionUserId=null;const timers=new Set();
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{if(session?.user?.id===sessionUserId&&['TOKEN_REFRESHED','USER_UPDATED','SIGNED_IN'].includes(event))return;if(session?.user?.id!==sessionUserId){setLibrary([]);setIsLibraryLoaded(false);}sessionUserId=session?.user?.id||null;const version=++sessionVersion;const timer=setTimeout(()=>{timers.delete(timer);if(alive)restoreSession(event,session,version).catch(()=>{if(alive){setCurrentUser(null);setIsLibraryLoaded(true);}});},0);timers.add(timer);});
    return()=>{alive=false;for(const timer of timers)clearTimeout(timer);subscription.unsubscribe();};
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

  const saveMovieToCloud = async (updatedMovie, options = {}) => {
    if(!currentUser?.id){openAuth();return false;}
    const { keepOpen = false,requireCloudSuccess=false,statusOnly=false } = options;
    const tmdbId = updatedMovie.tmdb_id || updatedMovie.id;
    const isTv = updatedMovie.media_type === 'tv' ||
                 updatedMovie.type === 'tv' ||
                 updatedMovie.number_of_seasons !== undefined ||
                 updatedMovie.first_air_date !== undefined ||
                 Boolean(updatedMovie.details && (updatedMovie.details.number_of_seasons !== undefined || updatedMovie.details.first_air_date));
    const mediaType = updatedMovie.media_type==='anime'?'anime':isTv ? 'tv' : (updatedMovie.media_type || 'movie');

    const enhancedTitle = getEnhancedMovieTitle(updatedMovie) || updatedMovie.title;
    const normalizedMovie = {
      ...updatedMovie,
      title: enhancedTitle,
      tmdb_id: tmdbId ? Number(tmdbId) : null,
      media_type: mediaType,
    };

    const epData = structuredClone(normalizedMovie.episode_data || {
      ratings: normalizedMovie.episode_ratings || {},
      notes: normalizedMovie.episode_notes || {},
      dates: normalizedMovie.episode_watch_dates || {},
      season_ratings: normalizedMovie.season_ratings || {},
      season_notes: normalizedMovie.season_notes || {},
      season_dates: normalizedMovie.season_dates || {},
      screenings: normalizedMovie.screenings || []
    });

    if (normalizedMovie.screenings) {
      epData.screenings = normalizedMovie.screenings;
    }

    if ('watch_date' in normalizedMovie) epData.watch_date = normalizedMovie.watch_date;

    const baseCleanReview = (normalizedMovie.review || '')
      .replace(/__EPISODE_DATA__:.+$/s, '')
      .replace(/__EPISODE_RATINGS__:.+$/s, '')
      .trim();

    epData.contains_spoilers=normalizedMovie.contains_spoilers??epData.contains_spoilers??reviewSpoilerFlag(normalizedMovie);
    normalizedMovie.review = baseCleanReview;
    normalizedMovie.screenings = epData.screenings || [];
    normalizedMovie.is_rewatch = epData.screenings ? epData.screenings.length>1 : Boolean(normalizedMovie.is_rewatch);
    normalizedMovie.rewatch_count = epData.screenings ? epData.screenings.length : normalizedMovie.rewatch_count || 1;

    if (useSupabase && currentUser) {
      const hasEpisodeData = typeof epData.contains_spoilers==='boolean' || epData.watch_date ||
                             (epData.screenings && epData.screenings.length > 0) ||
                             Object.keys(epData.ratings || {}).length > 0 ||
                             Object.keys(epData.notes || {}).length > 0 ||
                             Object.keys(epData.dates || {}).length > 0 ||
                             Object.keys(epData.season_ratings || {}).length > 0 ||
                             Object.keys(epData.season_notes || {}).length > 0 ||
                             Object.keys(epData.season_dates || {}).length > 0;

      const dbReview = hasEpisodeData
        ? `${baseCleanReview}\n\n__EPISODE_DATA__:${JSON.stringify(epData)}`
        : baseCleanReview;

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const cleanId = (normalizedMovie.id && uuidRegex.test(normalizedMovie.id)) ? normalizedMovie.id : crypto.randomUUID();
      normalizedMovie.id = cleanId;

      const nowIso = new Date().toISOString();
      const watchDateIso = normalizedMovie.watch_date
        ? (normalizedMovie.watch_date.includes('T') ? normalizedMovie.watch_date : `${normalizedMovie.watch_date}T12:00:00Z`)
        : nowIso;

      normalizedMovie.watch_date = normalizedMovie.status === 'watched' ? watchDateIso : null;
      normalizedMovie.date_added = normalizedMovie.status === 'watched' ? watchDateIso : (normalizedMovie.date_added || nowIso);

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
        date_added: normalizedMovie.status === 'watched' ? watchDateIso : (normalizedMovie.date_added || nowIso),
      };

      // Robust check-and-update/insert to avoid any unique constraint or onConflict errors
      const { data: existingRows,error:lookupError } = await supabase
        .from('library')
        .select('id, date_added')
        .eq('user_id', currentUser.id)
        .eq('tmdb_id', normalizedMovie.tmdb_id).eq('media_type',normalizedMovie.media_type);
      if(lookupError){if(requireCloudSuccess)throw new Error('Your library could not be checked. Please try again.');toast.error('Could not save','Your library could not be checked. Please try again.');return false;}

      let data, error;
      if (existingRows && existingRows.length > 0) {
        const targetId = existingRows[0].id;
        const origDateAdded = existingRows[0].date_added;
        normalizedMovie.id = targetId;
        const res = await supabase
          .from('library')
          .update({
            ...payload,
            id: targetId,
            date_added: origDateAdded || payload.date_added
          })
          .eq('id', targetId)
          .eq('user_id', currentUser.id)
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

      if (error||!data?.[0]) {
        console.error("Supabase save failed in handleSaveMovie:", error?.message, error?.details);
        if(requireCloudSuccess)throw new Error('Your viewing history could not be updated. Please try again.',{cause:error});
        toast.error('Could not save','Your changes are still in the editor. Please retry.');return false;
      } else if (data && data[0]) {
        normalizedMovie.id = data[0].id;
      }
    }
    if(activeOwner.current!==currentUser?.id)return false;
    setLibrary(prev => {
      const idx = prev.findIndex(m => m.id === normalizedMovie.id || (String(m.tmdb_id) === String(normalizedMovie.tmdb_id) && m.media_type === normalizedMovie.media_type));
      let updatedList;
      if (idx !== -1) {
        updatedList = [...prev];
        updatedList[idx] = normalizedMovie;
      } else {
        updatedList = [normalizedMovie, ...prev];
      }
      try {
        localStorage.setItem('cinelog_library_v2', JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });

    if (statusOnly) {
      // Keep browsing in place after a quick status edit.
    } else if (!keepOpen) {
      setActiveEditMovie(null);
    } else {
      setActiveEditMovie(normalizedMovie);
    }

    const statusLabel = normalizedMovie.status === 'watched' ? 'Marked as Watched' : normalizedMovie.status === 'plan_to_watch' ? 'Added to Watchlist' : 'Saved';
    if(!options.silent)toast.success(statusLabel, normalizedMovie.title);
    return true;
  };

  const handleSaveMovie = async (movie, options={}) => {
    if(!currentUser?.id){openAuth();return false;}
    const owner=currentUser.id;
    const previous=library.find(m=>m.id===movie.id);
    const perform=async()=>{if(activeOwner.current!==owner)throw Error('Sign in to the same account to retry.');return saveMovieToCloud(movie,options);};
    try {
      const saved=await sync.run(perform,'Viewing changes','library:'+catalogueKey(movie));
      if(saved&&options.statusOnly&&previous&&previous.status!==movie.status&&!options.silent){
        toast.success('Status updated',movie.title,{duration:10000,action:{label:'Undo',onClick:async()=>{if(activeOwner.current!==owner)throw Error('Sign in to the same account to undo.');const ok=await handleSaveMovie(previous,{statusOnly:true,requireCloudSuccess:true,silent:true});if(!ok)throw Error('Status could not be restored.');}}});
      }
      return saved;
    }catch(error){if(options.requireCloudSuccess)throw error;return false;}
  };

  const addMovieToCloud = async (newMovie, mediaTypeFromProp, options = {}) => {
    if(!currentUser?.id){openAuth();return false;}
    const tmdbId = newMovie.tmdb_id || newMovie.id;
    const isTv = mediaTypeFromProp === 'tv' ||
                 newMovie.media_type === 'tv' ||
                 newMovie.type === 'tv' ||
                 newMovie.number_of_seasons !== undefined ||
                 newMovie.first_air_date !== undefined;
    const mediaType = isTv ? 'tv' : (mediaTypeFromProp || newMovie.media_type || 'movie');

    const enhancedTitle = getEnhancedMovieTitle(newMovie) || newMovie.title || newMovie.name || 'Unknown Title';

    // Normalizing raw search items to standard library items
    const cleanMovie = {
      id: (newMovie.id && typeof newMovie.id === 'string' && newMovie.id.includes('-')) ? newMovie.id : crypto.randomUUID(),
      tmdb_id: Number(tmdbId),
      media_type: mediaType,
      title: enhancedTitle,
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
        const detected = getSuggestedTags({ title: enhancedTitle, tags: raw });
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

      const { data: existingAddRows, error: lookupError } = await supabase
        .from('library')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('tmdb_id', cleanMovie.tmdb_id).eq('media_type',cleanMovie.media_type);
      if(lookupError){if(!options.silent)toast.error('Could not add title','Your library could not be checked. Please try again.');return false;}

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
          .eq('user_id', currentUser.id)
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

      if (error||!data?.[0]) {
        if(!options.silent)toast.error("Could not add title","The cloud save failed. Please try again.");return false;
      } else if (data && data[0]) {
        cleanMovie.id = data[0].id;
      }
    }

    if(activeOwner.current!==currentUser?.id)return false;
    setLibrary(prev => {
      const idx = prev.findIndex(m => String(m.tmdb_id) === String(cleanMovie.tmdb_id) && m.media_type === cleanMovie.media_type);
      if (idx !== -1) {
        const c = [...prev];
        c[idx] = { ...c[idx], ...cleanMovie };
        return c;
      }
      return [cleanMovie, ...prev];
    });

    if (!options.silent && !alreadyExists) {
      toast.success('Added to Library', cleanMovie.title);
    } else if(!options.silent) {
      toast.info('Already in Library', cleanMovie.title);
    }
  };

  const handleAddMovie=async(movie,type,options={})=>{if(!currentUser?.id){openAuth();return false;}const owner=currentUser.id;try{return await sync.run(async()=>{if(activeOwner.current!==owner)throw Error('Sign in to the same account to retry.');const result=await addMovieToCloud(movie,type,options);return result===false?false:true;},'Library addition','library:'+catalogueKey({...movie,media_type:type||movie.media_type}));}catch{return false;}};
  const batchBusyRef=useRef(false);
  const accountIdentityRef=useRef(currentUser?.id);accountIdentityRef.current=currentUser?.id;
  const batchAddToCloud=async(items,status='plan_to_watch')=>{
    if(!currentUser?.id){openAuth();return false;}
    if(batchBusyRef.current)throw new Error('A batch is already being saved.');
    batchBusyRef.current=true;
    const owner=currentUser.id,result={added:0,skipped:0,failed:0};
    const unique=[...new Map(items.map(m=>[catalogueKey(m),m])).values()];
    try{
      for(let i=0;i<unique.length;i+=25){
        const chunk=unique.slice(i,i+25);
        if(accountIdentityRef.current!==owner){result.failed+=unique.length-i;break;}
        const {data:existing,error:lookupError}=await supabase.from('library').select('id,tmdb_id,media_type').eq('user_id',owner).in('tmdb_id',chunk.map(m=>Number(m.tmdb_id||m.id)));
        if(lookupError){result.failed+=chunk.length;continue;}
        const saved=new Set((existing||[]).map(catalogueKey));
        const missing=chunk.filter(m=>!saved.has(catalogueKey(m)));
        result.skipped+=chunk.length-missing.length;
        if(!missing.length)continue;
        const rows=missing.map(m=>newLibraryRow(m,owner,status,GENRE_MAP));
        const {data,error}=await supabase.from('library').insert(rows).select();
        if(error){result.failed+=rows.length;continue;}
        result.added+=(data||[]).length;result.failed+=rows.length-(data||[]).length;
        if(accountIdentityRef.current===owner)setLibrary(prev=>{const keys=new Set(prev.map(catalogueKey));return [...(data||[]).filter(m=>!keys.has(catalogueKey(m))),...prev];});
      }
      return result;
    }finally{batchBusyRef.current=false;}
  };
  const handleBatchAdd=async(items,status='plan_to_watch')=>{if(!currentUser?.id){openAuth();return false;}const owner=currentUser.id;try{return await sync.run(()=>{if(activeOwner.current!==owner)throw Error('Sign in to the same account to retry.');return batchAddToCloud(items,status);},'Batch library save','batch:'+items.map(catalogueKey).sort().join('|'));}catch(e){if(e.result)return e.result;throw e;}};
  const openSearchCollection=id=>{
    setShowQuickAdd(false);setShowCommandCenter(false);setActiveTab('collections');
    const path='/collections/franchise/tmdb-'+encodeURIComponent(id);
    const method=window.history.state?.modal==='quickadd'?'replaceState':'pushState';
    window.history[method]({tab:'collections',entity:true},'',path);
    window.dispatchEvent(new Event('cinelog:route-change'));window.scrollTo({top:0});
  };
  const handleRemoveMovie = async (movieId) => {
    const movie = library.find(m => m.id === movieId);
    if (!movie) return;

    setConfirmConfig({
      isOpen: true,
      title: 'Remove from your library?',
      confirmText: 'Remove title',
      item: movie,
      message: `Are you sure you want to remove "${movie.title}" from your library? This will delete all its ratings and reviews.`,
      onConfirm: async () => {
        try {
          if (useSupabase && currentUser?.id) {
            const { error } = await supabase.from('library').delete().eq('id', movieId).eq('user_id', currentUser.id);
            if (error) throw error;
          }
        } catch (err) {
          throw new Error('Could not remove this title. Your library is intact. Please try again.', { cause: err });
        }
        if (activeEditMovie && (activeEditMovie.id === movieId || String(activeEditMovie.tmdb_id) === String(movie.tmdb_id))) {
          closeModal('movie');
        }
        setLibrary(prev => prev.filter(m => m.id !== movieId));
        if (toast && toast.warning) {
          const owner=currentUser?.id;
          toast.warning('Removed', movie.title || 'Title removed from library',{duration:10000,action:{label:'Undo',onClick:async()=>{if(owner!==activeOwner.current)throw Error('Sign back into the same account to restore this title.');const ok=await handleSaveMovie(movie,{statusOnly:true,requireCloudSuccess:true,silent:true});if(!ok)throw Error('Could not restore this title. Please retry.');}}});
        }
      }
    });
  };

  const handleToggleFavorite=async movieId=>{const movie=library.find(m=>m.id===movieId||String(m.tmdb_id)===String(movieId));if(!movie)return false;const favorite=!movie.favorite;try{if(currentUser?.id){const {data,error}=await supabase.from('library').update({favorite}).eq('id',movie.id).eq('user_id',currentUser.id).select('id').maybeSingle();if(error||!data)throw new Error('Could not save favorite. Please try again.');}setLibrary(prev=>prev.map(m=>m.id===movie.id?{...m,favorite}:m));return true;}catch(error){toast.error('Favorite not saved',error.message);return false;}};

  const handleOpenUserProfile = useCallback((userObjOrUsername) => {
    if (!userObjOrUsername) {
      setViewingUserProfile(null);
      return;
    }
    let target = userObjOrUsername;
    if (typeof userObjOrUsername === 'string') {
      target = { username: userObjOrUsername };
    }
    setViewingUserProfile(target);
    setActiveTab('profile');setProfileSubTab('overview');window.scrollTo({top:0});
    try {
      window.history.pushState({tab:'profile',targetUser:target},'',profilePath(target.username || target.id));
    } catch (e) {}
  }, []);

  const handleOpenListPage = list => {
    setViewingUserProfile(null);setActiveTab('collections');
    window.history.pushState({tab:'collections',entity:true},'',listPath(list.id));
    window.dispatchEvent(new Event('cinelog:route-change'));window.scrollTo({top:0});
  };

  const updateProfileInCloud = async (updatedDetails) => {
    if(BORDER_STYLES[updatedDetails.equippedBorder]?.category==='creator'&&!isUserCreator(currentUser))return {saved:false,error:'This frame is reserved for the CineLog creator.'};
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
        trivia_cine_points: updatedDetails.triviaCinePoints !== undefined ? updatedDetails.triviaCinePoints : (currentUser.triviaCinePoints || 0),
        purchased_themes: updatedDetails.purchasedThemes !== undefined ? updatedDetails.purchasedThemes : (currentUser.purchasedThemes || [])
      };

      if (updatedDetails.featuredBadges !== undefined) {
        fullPayload.featured_badges = updatedDetails.featuredBadges;
      }

      const shopFieldNames={spentCinePoints:'spent_cine_points',purchasedBorders:'purchased_borders',purchasedBadges:'purchased_badges',purchasedBanners:'purchased_banners',purchasedThemes:'purchased_themes',triviaCinePoints:'trivia_cine_points'};
      const requiredFields=Object.entries(shopFieldNames).filter(([key])=>updatedDetails[key]!==undefined).map(([,field])=>field);
      try { await publishProfile(supabase,currentUser.id,fullPayload,{requiredFields}); }
      catch(error){toast.error('Profile not published',error.message);return {saved:false,error:error.message};}
    }
    if(activeOwner.current!==currentUser?.id)return {saved:false,error:'Your account changed. Please reopen the editor.'};
    setCurrentUser(prev => {
      const nextUser = { ...prev, ...updatedDetails };
      const bannerPos = nextUser.bannerPosPercent !== undefined ? nextUser.bannerPosPercent : (prev?.bannerPosPercent ?? 20);
      const bannerFit = nextUser.bannerFitMode || prev?.bannerFitMode || 'cover';
      const bannerUrlVal = nextUser.bannerUrl !== undefined ? nextUser.bannerUrl : (prev?.bannerUrl || '');





      if (nextUser.id) {
        localStorage.setItem(`cinelog_banner_pos_${nextUser.id}`, bannerPos);
        localStorage.setItem(`cinelog_banner_fit_${nextUser.id}`, bannerFit);
        localStorage.setItem(`cinelog_banner_url_${nextUser.id}`, bannerUrlVal);
        localStorage.setItem(`equipped_border_${nextUser.id}`, nextUser.equippedBorder || 'none');
        if (nextUser.featuredBadges !== undefined) {
          localStorage.setItem(`cinelog_featured_badges_${nextUser.id}`, JSON.stringify(nextUser.featuredBadges));
        }
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
        if (nextUser.featuredBadges !== undefined) {
          localStorage.setItem('cinelog_featured_badges_sandbox', JSON.stringify(nextUser.featuredBadges));
        }
        localStorage.setItem('cinelog_sandbox_user', JSON.stringify(nextUser));
      }
      return nextUser;
    });

    return true;
  };

  const handleUpdateProfile=async(details)=>{const owner=currentUser?.id;if(!owner)return {saved:false,error:'Please sign in.'};try{return await sync.run(()=>{if(activeOwner.current!==owner)throw Error('Sign in to the same account to retry.');return updateProfileInCloud(details);},'Profile changes','profile:'+owner);}catch(e){return {saved:false,error:e.message};}};
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
    window.history.replaceState({tab:activeTab},'',viewingUserProfile?profilePath(viewingUserProfile.username):pagePath(activeTab,profileSubTab));

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
        className={`app-container studio-shell ${layoutMode === 'top-nav' ? 'layout-topnav' : 'layout-sidebar'}`}
        style={{ position: 'relative', flex: 1, minHeight: 0 }}
      >
        <SaveIndicator sync={sync}/>
        <Header
          profileSubTab={profileSubTab}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenAuth={openAuth}
          onOpenSettings={openSettings}
          onOpenCommandCenter={openCommandCenter} onOpenQuickAdd={openQuickAdd}
          useSupabase={useSupabase}
          setUseSupabase={handleSetUseSupabase}
          layoutMode={layoutMode}
          library={library}
          onMovieClick={handleMovieClick}
        />

      <main data-screen={activeTab} className="page-content studio-main" id="main-content">
        <Suspense fallback={<div className="studio-loading" role="status"><span/>Bringing your cinema into focus…</div>}>
        {activeTab === 'landing' && (
          <LandingPage onMovieClick={handleMovieClick} setActiveTab={handleTabChange} library={library} />
        )}
        {activeTab === 'library' && (
          <LibraryTab
            library={library}
            onRemove={handleRemoveMovie}
            onStatusChange={(movie,status)=>handleSaveMovie(withViewingStatus(movie,status),{requireCloudSuccess:true,statusOnly:true})}
            onEditClick={openMovieDetail}
            onOpenExplore={() => handleTabChange('explore')}
            onImportMovies={handleImportMovies}
          />
        )}
        {activeTab === 'search' && <SearchWorkspace  initialQuery={new URL(window.location.href).searchParams.get('q')||''} onQueryChange={query=>{const url=new URL(window.location.href);url.pathname='/search';url.search='';if(query.trim())url.searchParams.set('q',query);window.history.replaceState({tab:'search'},'',url);}} library={library} onAddMovie={handleAddMovie} onBatchAdd={handleBatchAdd} onStatusChange={(movie,status)=>handleSaveMovie(withViewingStatus(movie,status),{requireCloudSuccess:true,statusOnly:true,silent:true})} onMovieClick={handleMovieClick} onOpenCollection={openSearchCollection}/>}
        {activeTab === 'explore' && (
          <ExploreTab onSaveMovie={handleSaveMovie} modalOpen={Boolean(activeEditMovie || showAuth || showSettings || showCommandCenter || showQuickAdd || viewingUserProfile || confirmConfig.isOpen)} onAddMovie={handleAddMovie} library={library} onMovieClick={handleMovieClick} />
        )}
        {activeTab === 'collections' && (
          <CollectionsTab
            library={library}
            currentUser={currentUser}
            onMovieClick={handleMovieClick}
            onOpenUserProfile={handleOpenUserProfile} onOpenListPage={handleOpenListPage}
            onSaveMovie={handleSaveMovie} onBatchAdd={handleBatchAdd}
          />
        )}
        {activeTab === 'tierlist' && (
          <TierListTab key={currentUser?.id||'guest'} onOpenExplore={() => handleTabChange('explore')} library={library} currentUser={currentUser} onOpenAuth={openAuth} />
        )}
        {activeTab === 'constellation' && (
          <ConstellationTab library={library} onMovieClick={handleMovieClick} onOpenExplore={() => handleTabChange('explore')} />
        )}
        {activeTab === 'calendar' && (
          <WatchCalendarTab library={library} onSaveMovie={handleSaveMovie} onMovieClick={handleMovieClick}/>
        )}
        {activeTab === 'stats' && (
          <StatsTab library={library} onNavigate={handleTabChange} onMovieClick={handleMovieClick} />
        )}
        {activeTab === 'profile' && !viewingUserProfile && (
          <ProfileTab
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
            onSaveMovie={handleSaveMovie}
            library={library}
            onMovieClick={handleMovieClick}
            onOpenUserProfile={handleOpenUserProfile} onOpenListPage={handleOpenListPage}
            initialSubTab={profileSubTab}
            onSubTabChange={sub=>{setProfileSubTab(sub);window.history.pushState({tab:'profile',sub},'',pagePath('profile',sub));}}
          />
        )}
        {activeTab === 'achievements' && (
          <AchievementsTab library={library} currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />
        )}
        {activeTab === 'trivia' && (
          <TriviaTab currentUser={currentUser} onUpdateProfile={handleUpdateProfile} onOpenAuth={openAuth} />
        )}
        {activeTab === 'challenges' && (
          <ChallengesTab library={library} currentUser={currentUser} />
        )}
        {activeTab === 'wrapped' && (
          <WrappedTab library={library} onMovieClick={handleMovieClick} />
        )}
        {activeTab === 'foryou' && (
          <ForYouTab library={library} currentUser={currentUser} onAddMovie={handleAddMovie} onMovieClick={handleMovieClick} />
        )}
        {activeTab === 'social' && !viewingUserProfile && (
          <SocialTab onOpenAuth={openAuth} currentUser={currentUser} onMovieClick={handleMovieClick} onOpenUserProfile={handleOpenUserProfile} onOpenListPage={handleOpenListPage} />
        )}
        {viewingUserProfile && <ProfileTab key={viewingUserProfile.username||viewingUserProfile.id} targetUser={viewingUserProfile} currentUser={currentUser} library={library} onMovieClick={handleMovieClick} onOpenUserProfile={handleOpenUserProfile} onOpenListPage={handleOpenListPage} onOpenAuth={openAuth} onUpdateProfile={handleUpdateProfile}/>}
        </Suspense>
      </main>

      {activeEditMovie && (
        <MovieDetailModal
          key={activeEditMovie.tmdb_id}
          inLibrary={library.some(m => String(m.tmdb_id) === String(activeEditMovie.tmdb_id))}
          onOpenMovie={handleMovieClick}
          movie={activeEditMovie}
          currentUser={currentUser}
          onClose={() => closeModal('movie')}
          onSave={handleSaveMovie}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={library.find(m => String(m.tmdb_id) === String(activeEditMovie.tmdb_id))?.favorite || false}
          onOpenUserProfile={handleOpenUserProfile} onOpenListPage={handleOpenListPage}
        />
      )}

      {showAuth && (
        <AuthModal
          onClose={() => closeModal('auth')}
          onLoginSuccess={handleLoginSuccess}
          useSupabase={useSupabase}
          setUseSupabase={handleSetUseSupabase}
        />
      )}
      {showRecoveryModal && (
        <ResetPasswordModal
          onClose={() => closeModal('recovery')}
        />
      )}
      {showSettings && (
        <SettingsPanel onNavigate={handleTabChange} onClose={() => closeModal('settings')} />
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        item={confirmConfig.item}
        isDanger={confirmConfig.isDanger!==false}
        confirmText={confirmConfig.confirmText}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => closeModal('confirm')}
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
            overscrollBehaviorY: 'contain'
          }}
          onClick={e => e.target === e.currentTarget && closeModal('search')}
          onWheel={e => e.stopPropagation()}
        >
          <div
            className="cine-dialog cine-search" ref={searchDialogRef} role="dialog" aria-modal="true" aria-label="Search cinema" tabIndex={-1}
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
                  if (e.key === 'Escape'){e.stopPropagation();closeModal('search');}
                  if (e.key === 'Enter') {
                    if (cmdSearchResults.length > 0) {
                      const first = cmdSearchResults[0];
                      if (first.media_type === 'movie' || first.media_type === 'tv') {
                        handleMovieClick(first.id, first.media_type);
                        closeModal('search');
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
                            closeModal('search');
                          } else if (item.media_type === 'person') {
                            if (item.known_for?.[0]?.id) {
                              handleMovieClick(item.known_for[0].id, item.known_for[0].media_type || 'movie');
                            }
                            closeModal('search');
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
                              color: isTv ? '#93c5fd' : (isPerson ? '#cccccc' : 'var(--accent-contrast, #ffffff)')
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
                              closeModal('search');
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
          {showQuickAdd&&<QuickLogDialog library={library} onClose={()=>closeModal('quickadd')} onAddMovie={handleAddMovie} onBatchAdd={handleBatchAdd} onStatusChange={(movie,status)=>handleSaveMovie(withViewingStatus(movie,status),{requireCloudSuccess:true,statusOnly:true,silent:true})} onMovieClick={(id,type)=>{setShowQuickAdd(false);handleMovieClick(id,type);}} onOpenCollection={openSearchCollection}/>}
          {/* The FAB button itself */}
          <button
            id="quick-add-fab"
            onClick={() => showQuickAdd ? closeModal('quickadd') : openQuickAdd()}
            title="Quick Add Movie"
            style={{
              position: 'fixed', bottom: '24px', right: '24px',
              width: '52px', height: '52px',
              borderRadius: '50%',
              background: 'var(--accent)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 6px 20px rgba(var(--accent-rgb, 229,9,20), 0.45)',
              cursor: 'pointer',
              zIndex: 9000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 400,
              color: 'var(--accent-contrast, #ffffff)',
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
