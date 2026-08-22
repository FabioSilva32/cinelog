import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Heart, Calendar, Star, Film, Trophy, BarChart3, X,
  Search, Plus, Upload, Flame, Coins, ArrowLeft, SlidersHorizontal,
  Image as ImageIcon, Trash2, CheckCircle2, User, Award, Check, Edit2, Sparkles
} from 'lucide-react';
import { ACHIEVEMENTS, BORDER_STYLES, BADGE_COLORS, isUserCreator } from '../utils/achievements';
import AvatarWithBorder, { DEFAULT_GREY_AVATAR } from './AvatarWithBorder';
import AnimatedBannerBackground from './AnimatedBannerBackground';
import { supabase } from '../supabaseClient';

const TMDB_KEY = '6a2fd6b9b1bb3befbb9f14c203732225';

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=200&fit=crop&q=80', // Spider-Hero
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200&fit=crop&q=80', // Dark Knight
  'https://images.unsplash.com/photo-1626278664285-f796b9ee7806?w=200&fit=crop&q=80', // Cyber Armor
  'https://images.unsplash.com/photo-1579566346927-c68383817a25?w=200&fit=crop&q=80', // Galactic Trooper
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&fit=crop&q=80', // Cyberpunk Anime
  'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=200&fit=crop&q=80', // Midnight Mask
  'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=200&fit=crop&q=80', // Space Voyager
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&fit=crop&q=80', // Matrix Hacker
  'https://images.unsplash.com/photo-1563089145-599997674d42?w=200&fit=crop&q=80', // Anime Spirit
  'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=200&fit=crop&q=80', // Vintage 35mm
  '/avatar_cinephile.png', // Cinephile Mascot
  '/avatar_critic.png', // Critic Mascot
  '/avatar_reviewer.png', // Reviewer Mascot
  '/avatar_watcher.png', // Watcher Mascot
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200&fit=crop&q=80', // Merc Hero
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=200&fit=crop&q=80', // Dune Nomad
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&fit=crop&q=80', // Cyber Samurai
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&fit=crop&q=80', // Kaiju Beast
  'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?w=200&fit=crop&q=80', // Joker Smile
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200&fit=crop&q=80', // Noir Detective
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=200&fit=crop&q=80', // Cosmic Vortex
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&fit=crop&q=80'  // Retro Arcade
];

const GENRE_COLORS = {
  'Action': '#ef4444', 'Adventure': '#f97316', 'Comedy': '#eab308',
  'Drama': '#10b981', 'Sci-Fi': '#3b82f6', 'Horror': '#8b5cf6',
  'Romance': '#ec4899', 'Thriller': '#f59e0b', 'Animation': '#06b6d4',
  'Fantasy': '#a78bfa', 'Crime': '#6b7280', 'Documentary': '#84cc16',
  'Mystery': '#c084fc', 'Family': '#fde68a',
};

const ALL_ANIMATED_BANNERS = [
  { id: 'animated-scanlines', name: '🎞️ 35mm Projector Scanlines', cost: 200, desc: 'Analog 35mm cinematic projector scanline sweep', className: 'banner-scanlines' },
  { id: 'animated-stars', name: '✨ Interstellar Shooting Stars', cost: 300, desc: 'Deep cosmic starfield with falling meteors', className: 'banner-stars' },
  { id: 'animated-matrix', name: '💻 Cyber Matrix Rain', cost: 400, desc: 'Cascading digital phosphorescent code stream', className: 'banner-matrix' },
  { id: 'animated-synthwave', name: '🌆 Retro Synthwave Grid', cost: 500, desc: 'Moving perspective wireframe grid with neon sun', className: 'banner-synthwave' },
  { id: 'animated-aurora', name: '🌌 Cosmic Aurora Borealis', cost: 600, desc: 'Iridescent undulating multi-colored aurora waves', className: 'banner-aurora' },
  { id: 'animated-plasma', name: '⚡ Electric Plasma Surge', cost: 700, desc: 'Crackling neon cyan and magenta plasma vortex', className: 'banner-plasma' }
];

const SHOP_BADGES = [
  { name: 'VIP Cinephile', cost: 100, desc: 'Exclusive VIP member status badge' },
  { name: 'Popcorn Overlord', cost: 150, desc: 'For dedicated snack connoisseurs' },
  { name: 'Midnight Binger', cost: 200, desc: 'Night owl cinema marathoner' },
  { name: 'Cinema Tycoon', cost: 300, desc: 'High-ranking film empire master' },
  { name: "Director's Cut", cost: 450, desc: 'Auteur visionary prestige rank' }
];

const PRESET_BANNERS = [
  { name: 'Blade Runner 2049', url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1600&h=450&q=85' },
  { name: 'Interstellar Deep Space', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&h=450&q=85' },
  { name: 'Classic IMAX Cinema', url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&h=450&q=85' },
  { name: 'Cyberpunk Neon Alley', url: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=1600&h=450&q=85' },
  { name: 'Alpine Sunset Peak', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&h=450&q=85' },
  { name: 'Vintage 35mm Studio', url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1600&h=450&q=85' },
  { name: 'Ocean Horizon Twilight', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&h=450&q=85' },
  { name: 'Retro Arcade Lounge', url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1600&h=450&q=85' },
  { name: 'Cinema Hall Premiere', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&h=450&q=85' },
];

function formatRelativeDate(dateStr) {
  if (!dateStr) return 'Recently';
  const dateObj = new Date(dateStr);
  const today = new Date();
  
  const d1 = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
  return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function MiniGenreChart({ library }) {
  const genreMap = useMemo(() => {
    const m = {};
    library.forEach(item => (item.genres || []).forEach(g => { m[g] = (m[g] || 0) + 1; }));
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [library]);

  const max = genreMap[0]?.[1] || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {genreMap.map(([genre, count]) => (
        <div key={genre}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '3px', fontWeight: 600 }}>
            <span>{genre}</span>
            <span style={{ color: 'var(--text-dim)' }}>{count}</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(count / max) * 100}%`, background: GENRE_COLORS[genre] || 'var(--accent)', borderRadius: '2px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function RatingDistributionChart({ library = [] }) {
  const dist = useMemo(() => {
    const counts = {};
    for (let r = 1; r <= 10; r++) counts[r] = 0;
    library.forEach(item => {
      if (item.rating && item.rating >= 1 && item.rating <= 10) {
        const rounded = Math.round(Number(item.rating));
        if (counts[rounded] !== undefined) counts[rounded]++;
      }
    });
    return counts;
  }, [library]);

  const maxCount = Math.max(1, ...Object.values(dist));
  const totalRated = Object.values(dist).reduce((a, b) => a + b, 0);

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BarChart3 size={15} /> Rating Distribution
        </h4>
        <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 700 }}>
          {totalRated} rated film{totalRated === 1 ? '' : 's'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px', padding: '0 4px' }}>
        {Object.entries(dist).map(([score, count]) => {
          const heightPct = (count / maxCount) * 100;
          return (
            <div key={score} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '4px' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 700 }}>{count > 0 ? count : ''}</span>
              <div
                style={{
                  width: '100%',
                  height: `${Math.max(4, heightPct)}%`,
                  background: count > 0 ? 'linear-gradient(to top, var(--accent), #b87cf8)' : 'rgba(255,255,255,0.05)',
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.3s ease',
                  border: count > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                }}
                title={`Score ${score}: ${count} movie${count === 1 ? '' : 's'}`}
              />
              <span style={{ fontSize: '10px', fontWeight: 800, color: Number(score) >= 8 ? 'var(--gold)' : 'var(--text-muted)' }}>
                {score}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProfileTab({ targetUser, currentUser, onUpdateProfile, library = [], onOpenUserProfile, onMovieClick }) {
  // Single All-in-One Customizer Modal state
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customizerTab, setCustomizerTab] = useState('banner'); // 'banner' | 'avatar' | 'info' | 'showcase'

  // Editable Profile Draft State
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [equippedBorder, setEquippedBorder] = useState(currentUser?.equippedBorder || 'none');
  const [bannerUrl, setBannerUrl] = useState(currentUser?.bannerUrl || '');
  const [bannerFitMode, setBannerFitMode] = useState(currentUser?.bannerFitMode || 'cover');
  const [bannerPosPercent, setBannerPosPercent] = useState(currentUser?.bannerPosPercent ?? 20);

  // Banner Studio internal state
  const [bannerSourceTab, setBannerSourceTab] = useState('upload'); // 'upload' | 'tmdb' | 'library' | 'presets' | 'animated'
  const [tmdbSearchQuery, setTmdbSearchQuery] = useState('');
  const [tmdbSearchResults, setTmdbSearchResults] = useState([]);
  const [tmdbSearching, setTmdbSearching] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Page sub-tab navigation
  const [profileActiveSubTab, setProfileActiveSubTab] = useState('overview');
  const [activeShareCard, setActiveShareCard] = useState(null);

  // Other-user profile state (Letterboxd-style full-page view)
  const [viewedProfile, setViewedProfile] = useState(null);
  const [viewedLibrary, setViewedLibrary] = useState([]);
  const [viewedLoading, setViewedLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Soundscape Mixer Audio State
  const [soundVolumes, setSoundVolumes] = useState({ projector: 0, scifi: 0, orchestral: 0, lofi: 0 });
  const audioCtxRef = useRef(null);
  const gainNodesRef = useRef({});
  const sourcesRef = useRef({});

  // Cleanup audio nodes on unmount
  useEffect(() => {
    return () => {
      Object.values(sourcesRef.current).forEach(src => {
        try { src.stop(); src.disconnect(); } catch (_) {}
      });
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Sync draft states from currentUser whenever currentUser updates
  useEffect(() => {
    if (!showCustomizer) {
      setBannerUrl(currentUser?.bannerUrl || '');
      setBannerFitMode(currentUser?.bannerFitMode || 'cover');
      setBannerPosPercent(currentUser?.bannerPosPercent ?? 20);
      setEquippedBorder(currentUser?.equippedBorder || 'none');
      setDisplayName(currentUser?.displayName || '');
      setUsername(currentUser?.username || '');
      setBio(currentUser?.bio || '');
      setAvatar(currentUser?.avatar || '');
    }
  }, [currentUser?.bannerUrl, currentUser?.bannerFitMode, currentUser?.bannerPosPercent, currentUser?.equippedBorder, currentUser?.displayName, currentUser?.username, currentUser?.bio, currentUser?.avatar, showCustomizer]);

  // Open customizer and seed with current user values
  const handleOpenCustomizer = (initialTab = 'banner') => {
    setDisplayName(currentUser?.displayName || '');
    setUsername(currentUser?.username || '');
    setBio(currentUser?.bio || '');
    setAvatar(currentUser?.avatar || '');
    setEquippedBorder(currentUser?.equippedBorder || 'none');
    setBannerUrl(currentUser?.bannerUrl || '');
    setBannerFitMode(currentUser?.bannerFitMode || 'cover');
    setBannerPosPercent(currentUser?.bannerPosPercent ?? 20);
    setFavorites(Array.from({ length: 6 }, (_, i) => (currentUser?.favorites || [])[i] || null));
    setCustomizerTab(initialTab);
    setShowCustomizer(true);
  };

  // Fetch other-user profile + library when targetUser is set and is not the logged-in user
  const isViewingOther = targetUser && targetUser.id !== currentUser?.id;

  useEffect(() => {
    if (!isViewingOther) {
      setViewedProfile(null);
      setViewedLibrary([]);
      return;
    }
    setViewedLoading(true);

    if (supabase) {
      Promise.all([
        supabase.from('profiles').select('*').eq('id', targetUser.id).single(),
        supabase.from('library').select('*').eq('user_id', targetUser.id),
        currentUser?.id ? supabase.from('followers').select('*').match({ follower_id: currentUser.id, following_id: targetUser.id }).maybeSingle() : Promise.resolve({ data: null })
      ]).then(([{ data: prof }, { data: lib }, { data: followRel }]) => {
        if (prof) {
          setViewedProfile({
            id: prof.id,
            username: prof.username || targetUser.username,
            displayName: prof.display_name || targetUser.displayName || targetUser.username,
            avatar: prof.avatar_url || targetUser.avatar || DEFAULT_GREY_AVATAR,
            bio: prof.bio || '',
            favorites: prof.favorites || [],
            followersCount: prof.followers_count || 0,
            followingCount: prof.following_count || 0,
            equippedBorder: prof.equipped_border || 'none',
            bannerUrl: prof.banner_url || '',
            bannerFitMode: prof.banner_fit_mode || 'cover',
            bannerPosPercent: prof.banner_pos_percent ?? 20
          });
        } else {
          setViewedProfile(targetUser);
        }
        setViewedLibrary(lib || []);
        setIsFollowing(!!followRel);
        setViewedLoading(false);
      }).catch(err => {
        console.error('Error fetching viewed profile:', err);
        setViewedProfile(targetUser);
        setViewedLibrary([]);
        setViewedLoading(false);
      });
    } else {
      setViewedProfile(targetUser);
      setViewedLibrary([]);
      setViewedLoading(false);
    }
  }, [targetUser, isViewingOther, currentUser?.id]);

  // TMDB backdrop search in studio modal
  const handleTmdbSearch = async (e) => {
    e?.preventDefault();
    if (!tmdbSearchQuery.trim()) return;
    setTmdbSearching(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(tmdbSearchQuery)}&page=1`);
      const data = await res.json();
      const resultsWithBackdrops = (data.results || []).filter(item => item.backdrop_path);
      setTmdbSearchResults(resultsWithBackdrops);
    } catch (err) {
      console.error('TMDB Search error:', err);
    } finally {
      setTmdbSearching(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!currentUser?.id || !viewedProfile?.id) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase.from('followers').delete().match({ follower_id: currentUser.id, following_id: viewedProfile.id });
        setIsFollowing(false);
        setViewedProfile(prev => prev ? { ...prev, followersCount: Math.max(0, (prev.followersCount || 1) - 1) } : prev);
      } else {
        await supabase.from('followers').insert({ follower_id: currentUser.id, following_id: viewedProfile.id });
        setIsFollowing(true);
        setViewedProfile(prev => prev ? { ...prev, followersCount: (prev.followersCount || 0) + 1 } : prev);
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  // Soundscape audio generation
  const initAudioTrack = (trackId) => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    if (!gainNodesRef.current[trackId]) {
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0;
      gainNode.connect(ctx.destination);
      gainNodesRef.current[trackId] = gainNode;

      if (trackId === 'projector') {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) output[i] = (Math.random() * 2 - 1) * 0.2;
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 400;
        filter.Q.value = 3;
        whiteNoise.connect(filter);
        filter.connect(gainNode);
        whiteNoise.start();
        sourcesRef.current[trackId] = whiteNoise;
      } else if (trackId === 'scifi') {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = 55;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 120;
        osc.connect(filter);
        filter.connect(gainNode);
        osc.start();
        sourcesRef.current[trackId] = osc;
      } else if (trackId === 'orchestral') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 110;
        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.value = 164.81;
        osc.connect(gainNode);
        osc2.connect(gainNode);
        osc.start();
        osc2.start();
        sourcesRef.current[trackId] = osc;
      } else if (trackId === 'lofi') {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 0.8;
        }
        const pinkNoise = ctx.createBufferSource();
        pinkNoise.buffer = noiseBuffer;
        pinkNoise.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        pinkNoise.connect(filter);
        filter.connect(gainNode);
        pinkNoise.start();
        sourcesRef.current[trackId] = pinkNoise;
      }
    }
  };

  const handleVolumeChange = (trackId, val) => {
    const num = parseFloat(val);
    setSoundVolumes(prev => ({ ...prev, [trackId]: num }));
    initAudioTrack(trackId);
    if (gainNodesRef.current[trackId] && audioCtxRef.current) {
      gainNodesRef.current[trackId].gain.setTargetAtTime(num * 0.4, audioCtxRef.current.currentTime, 0.05);
    }
  };

  // 6 Showcase Slots
  const [favorites, setFavorites] = useState(() => {
    const arr = Array.from({ length: 6 }, () => null);
    if (currentUser?.favorites && Array.isArray(currentUser.favorites)) {
      currentUser.favorites.forEach((fav, i) => { if (i < 6) arr[i] = fav; });
    }
    return arr;
  });

  const [selectingSlotIdx, setSelectingSlotIdx] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [popupActiveTab, setPopupActiveTab] = useState('movie');

  // Stats calculations
  const watchedCount = useMemo(() => library.filter(m => m.status === 'watched').length, [library]);
  const reviewsCount = useMemo(() => library.filter(m => m.review && m.review.trim()).length, [library]);
  const favoritesCount = useMemo(() => library.filter(m => m.is_favorite).length, [library]);
  const watchlistCount = useMemo(() => library.filter(m => m.status === 'plan_to_watch').length, [library]);

  const avgRating = useMemo(() => {
    const rated = library.filter(m => m.rating && Number(m.rating) > 0);
    if (rated.length === 0) return null;
    const total = rated.reduce((acc, m) => acc + Number(m.rating), 0);
    return (total / rated.length).toFixed(1);
  }, [library]);

  const topRated = useMemo(() => {
    return [...library]
      .filter(m => m.rating && Number(m.rating) > 0)
      .sort((a, b) => Number(b.rating) - Number(a.rating))
      .slice(0, 10);
  }, [library]);

  const recentDiary = useMemo(() => {
    return [...library]
      .filter(m => m.status === 'watched' && (m.watch_date || m.date_added))
      .sort((a, b) => new Date(b.watch_date || b.date_added) - new Date(a.watch_date || a.date_added));
  }, [library]);

  // Streak & CinePoints
  const currentStreak = useMemo(() => {
    const watchDates = new Set(
      library
        .filter(m => m.status === 'watched' && (m.watch_date || m.date_added))
        .map(m => (m.watch_date || m.date_added).split('T')[0])
    );
    let streak = 0;
    let checkDate = new Date();
    const todayStr = checkDate.toISOString().split('T')[0];
    if (!watchDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (watchDates.has(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [library]);

  const streakMultiplier = useMemo(() => {
    if (currentStreak >= 30) return 2.5;
    if (currentStreak >= 14) return 2.0;
    if (currentStreak >= 7) return 1.5;
    if (currentStreak >= 3) return 1.25;
    return 1.0;
  }, [currentStreak]);

  const cinePoints = useMemo(() => {
    const basePoints = (watchedCount * 10) + (reviewsCount * 10) + (favoritesCount * 5);
    const streakBonus = Math.floor(currentStreak * 15 * streakMultiplier);
    const triviaPoints = currentUser?.triviaCinePoints || 0;
    const spent = currentUser?.spentCinePoints || 0;
    return Math.max(0, basePoints + streakBonus + triviaPoints - spent);
  }, [watchedCount, reviewsCount, favoritesCount, currentStreak, streakMultiplier, currentUser]);

  const isCreator = useMemo(() => isUserCreator(currentUser), [currentUser]);

  const unlockedBadges = useMemo(() => {
    const earned = [];
    if (isCreator) {
      earned.push('Creator');
    }
    ACHIEVEMENTS.forEach(ach => {
      if (ach.check(library) >= ach.target) {
        if (ach.reward.badgeName) earned.push(ach.reward.badgeName);
      }
    });
    const purchased = currentUser?.purchasedBadges || [];
    return Array.from(new Set([...earned, ...purchased]));
  }, [library, currentUser, isCreator]);

  const unlockedBorders = useMemo(() => {
    const unlocked = new Set(['none', 'bronze', 'silver', 'gold']);
    if (isCreator) {
      unlocked.add('creator');
    }
    ACHIEVEMENTS.forEach(ach => {
      if (ach.check(library) >= ach.target) {
        if (ach.reward.borderId) unlocked.add(ach.reward.borderId);
      }
    });
    (currentUser?.purchasedBorders || []).forEach(b => unlocked.add(b));
    return unlocked;
  }, [library, currentUser, isCreator]);

  // Save profile from unified customizer
  const handleSaveAll = () => {
    const savedFavorites = favorites.filter(fav => fav !== null);
    if (onUpdateProfile) {
      onUpdateProfile({
        displayName,
        username,
        bio,
        avatar,
        favorites: savedFavorites,
        equippedBorder,
        bannerUrl,
        bannerFitMode,
        bannerPosPercent
      });
    }
    setShowCustomizer(false);
  };

  // Avatar file upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large! Please choose an avatar under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setAvatar(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Banner file upload handler
  const handleBannerFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large! Please choose a banner under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setBannerUrl(uploadEvent.target.result);
      setBannerFitMode('cover');
    };
    reader.readAsDataURL(file);
  };

  const handleSlotSelect = (movie) => {
    if (selectingSlotIdx === null) return;
    const newFavorites = [...favorites];
    newFavorites[selectingSlotIdx] = {
      id: movie.id || movie.tmdb_id,
      tmdb_id: movie.tmdb_id || movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      score: movie.rating || movie.vote_average,
      media_type: movie.media_type || popupActiveTab
    };
    setFavorites(newFavorites);
    setSelectingSlotIdx(null);
    setSearchQuery('');
  };

  const removeMovieFromSlot = (idx, e) => {
    e.stopPropagation();
    const newFavorites = [...favorites];
    newFavorites[idx] = null;
    setFavorites(newFavorites);
  };

  const filteredLibrary = useMemo(() => {
    const selectedIds = new Set(
      favorites
        .filter((fav, idx) => fav !== null && idx !== selectingSlotIdx)
        .map(fav => String(fav.id || fav.tmdb_id))
    );
    const watched = library.filter(m => {
      if (m.status !== 'watched' || m.media_type !== popupActiveTab) return false;
      const mId = String(m.id || m.tmdb_id);
      return !selectedIds.has(mId);
    });
    if (!searchQuery.trim()) return watched;
    return watched.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [library, searchQuery, popupActiveTab, favorites, selectingSlotIdx]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative' }}>

      {/* ─────────────────────────────────────────────────────────────
          OTHER USER PROFILE — Letterboxd full-page view
          ───────────────────────────────────────────────────────────── */}
      {isViewingOther ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {/* Back button */}
          <div style={{ padding: '0 0 16px 0' }}>
            <button
              onClick={() => { if (onOpenUserProfile) onOpenUserProfile(null); }}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                color: 'var(--text-muted)', borderRadius: '20px', padding: '7px 16px',
                fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: '6px', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <ArrowLeft size={14} /> Back to my profile
            </button>
          </div>

          {viewedLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '14px' }}>
              Loading profile…
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {/* BANNER */}
              <div
                className={viewedProfile?.bannerUrl?.startsWith('animated-') ? `banner-${viewedProfile.bannerUrl.replace('animated-', '')}` : ''}
                style={{
                  height: '320px',
                  width: '100%',
                  borderRadius: '20px 20px 0 0',
                  overflow: 'hidden',
                  position: 'relative',
                  background: (viewedProfile?.bannerUrl && !viewedProfile.bannerUrl.startsWith('animated-'))
                    ? `url("${viewedProfile.bannerUrl}") center ${viewedProfile.bannerPosPercent ?? 20}% / ${viewedProfile.bannerFitMode === 'contain' ? 'contain' : 'cover'} no-repeat`
                    : (!viewedProfile?.bannerUrl ? 'linear-gradient(135deg, #1a1040 0%, #2d1b69 50%, #0f172a 100%)' : '#08070e')
                }}
              >
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(10,8,19,0.65) 70%, #0a0813 100%)' }} />
              </div>

              {/* PROFILE HEADER ROW */}
              <div style={{ background: '#0a0813', padding: '0 28px 20px', border: '1px solid var(--border)', borderTop: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', marginTop: '-55px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <AvatarWithBorder
                      src={viewedProfile?.avatar || DEFAULT_GREY_AVATAR}
                      username={viewedProfile?.username || 'User'}
                      borderId={viewedProfile?.equippedBorder || 'none'}
                      size={110}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>{viewedProfile?.displayName || viewedProfile?.username}</h2>
                      {currentUser?.id && (
                        <button
                          onClick={handleToggleFollow}
                          disabled={followLoading}
                          className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ padding: '6px 18px', fontSize: '12px', fontWeight: 800, borderRadius: '20px' }}
                        >
                          {isFollowing ? 'Following' : '+ Follow'}
                        </button>
                      )}
                    </div>
                    <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 700, marginTop: '2px' }}>@{viewedProfile?.username}</div>
                    {viewedProfile?.bio && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', maxWidth: '500px', lineHeight: 1.5 }}>{viewedProfile.bio}</p>}
                  </div>

                  {/* Stats pills */}
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {[
                      { label: 'Films', val: viewedLibrary.filter(m => m.status === 'watched').length, color: 'var(--green)' },
                      { label: 'Reviews', val: viewedLibrary.filter(m => m.review).length, color: 'var(--accent)' },
                      { label: 'Watchlist', val: viewedLibrary.filter(m => m.status === 'plan_to_watch').length, color: '#60a5fa' },
                      {
                        label: 'Avg Rating',
                        val: (() => {
                          const r = viewedLibrary.filter(m => m.rating);
                          return r.length ? '★ ' + (r.reduce((s, m) => s + Number(m.rating), 0) / r.length).toFixed(1) : '—';
                        })(),
                        color: 'var(--gold)'
                      },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: s.color, fontFamily: 'var(--font-heading)' }}>{s.val}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sub tabs & Content */}
              <div style={{ padding: '24px 0' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '14px' }}>Watched Films</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '14px' }}>
                  {viewedLibrary.filter(m => m.status === 'watched').map(m => (
                    <div key={m.id} onClick={() => onMovieClick && onMovieClick(m.tmdb_id, m.media_type)}
                      style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-solid)', cursor: 'pointer' }}>
                      <div style={{ aspectRatio: '2/3', position: 'relative' }}>
                        {m.poster_path ? <img src={`https://image.tmdb.org/t/p/w300${m.poster_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎬</div>}
                        {m.rating && <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.85)', color: 'var(--gold)', fontSize: '10px', fontWeight: 900, padding: '1px 5px', borderRadius: '4px' }}>★ {Number(m.rating).toFixed(1)}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            OWN PROFILE — Letterboxd-style full page
            ───────────────────────────────────────────────────────────── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

          {/* BANNER (320px immersive) */}
          <div
            style={{
              height: '320px',
              width: '100%',
              borderRadius: '20px 20px 0 0',
              overflow: 'hidden',
              position: 'relative',
              background: (currentUser?.bannerUrl && !currentUser.bannerUrl.startsWith('animated-'))
                ? `url("${currentUser.bannerUrl}") center ${currentUser.bannerPosPercent ?? 20}% / ${currentUser.bannerFitMode === 'contain' ? 'contain' : 'cover'} no-repeat`
                : (!currentUser?.bannerUrl ? 'linear-gradient(135deg, #1a1040 0%, #2d1b69 50%, #0f172a 100%)' : '#08070e')
            }}
          >
            {currentUser?.bannerUrl && currentUser.bannerUrl.startsWith('animated-') && (
              <AnimatedBannerBackground bannerId={currentUser.bannerUrl} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 80%, rgba(10,8,19,0.9) 100%)', pointerEvents: 'none' }} />

            {/* SINGLE UNIFIED CUSTOMIZE BUTTON */}
            <button
              type="button"
              onClick={() => handleOpenCustomizer('banner')}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                zIndex: 5,
                background: 'rgba(10,8,22,0.85)',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.22)',
                color: '#fff',
                borderRadius: '30px',
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; }}
            >
              <SlidersHorizontal size={14} color="var(--accent)" /> Customize
            </button>
          </div>

          {/* PROFILE HEADER ROW (Always clean, no inline messy forms) */}
          <div style={{ background: '#0a0813', padding: '0 28px 20px', border: '1px solid var(--border)', borderTop: 'none', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', marginTop: '-55px', flexWrap: 'wrap' }}>
              {/* Avatar without messy buttons on it */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <AvatarWithBorder
                  src={currentUser?.avatar || DEFAULT_GREY_AVATAR}
                  username={currentUser?.username || 'Profile'}
                  borderId={currentUser?.equippedBorder || 'none'}
                  size={110}
                />
              </div>

              {/* Name / handle / badges / bio */}
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px', margin: 0 }}>
                    {currentUser?.displayName || 'CineLog Fan'}
                  </h2>
                </div>
                <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                  @{currentUser?.username || 'cinelog_user'}
                </div>
                {unlockedBadges.length > 0 && (
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '9px' }}>
                    {unlockedBadges.map(badgeName => {
                      const colors = BADGE_COLORS[badgeName] || { border: '1px solid var(--border)', color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.03)' };
                      return <span key={badgeName} style={{ fontSize: '10px', fontWeight: 800, padding: '2.5px 8.5px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.04em', ...colors }}>{badgeName}</span>;
                    })}
                  </div>
                )}
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '460px', margin: 0 }}>
                  {currentUser?.bio || 'No bio written yet. Click the Customize button above to personalize your profile.'}
                </p>
              </div>

              {/* Stats counters */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'flex-end', paddingBottom: '4px' }}>
                {[
                  { label: 'Films', val: watchedCount, color: 'var(--green)' },
                  { label: 'Reviews', val: reviewsCount, color: 'var(--accent)' },
                  { label: 'Favorites', val: favoritesCount, color: 'var(--red)' },
                  { label: 'Watchlist', val: watchlistCount, color: '#60a5fa' },
                  { label: 'CinePoints', val: `🪙 ${cinePoints}`, color: 'var(--accent)' },
                  ...(avgRating ? [{ label: 'Avg Rating', val: `★ ${avgRating}`, color: 'var(--gold)' }] : []),
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: s.color, fontFamily: 'var(--font-heading)' }}>{s.val}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5-TAB SUB-NAV */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '0', marginBottom: '0', background: '#0a0813', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', overflowX: 'auto' }}>
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'diary', label: `Diary (${recentDiary.length})` },
              { id: 'watchlist', label: `Watchlist (${watchlistCount})` },
              { id: 'stats', label: 'Stats & Charts' },
              { id: 'shop', label: 'Shop & Quests' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setProfileActiveSubTab(tab.id)}
                style={{
                  background: 'none', border: 'none', padding: '13px 20px', fontSize: '13.5px', fontWeight: 800, whiteSpace: 'nowrap',
                  color: profileActiveSubTab === tab.id ? 'var(--accent)' : 'var(--text-dim)',
                  borderBottom: profileActiveSubTab === tab.id ? '2.5px solid var(--accent)' : '2.5px solid transparent',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <div style={{ padding: '28px 0', display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* ── OVERVIEW TAB ── */}
            {profileActiveSubTab === 'overview' && (
              <div style={{ display: 'flex', gap: '24px', alignItems: 'start' }}>

                {/* LEFT COLUMN */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>

                  {/* Favorites Showcase */}
                  <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '20px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Heart size={16} color="var(--red)" fill="var(--red)" />
                        <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>Favorites Showcase</h3>
                      </div>
                      <button
                        onClick={() => handleOpenCustomizer('showcase')}
                        style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Edit Slots →
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                      {Array.from({ length: 6 }).map((_, i) => {
                        const fav = (currentUser?.favorites || [])[i];
                        return (
                          <div key={i} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-solid)' }}>
                            <div style={{ aspectRatio: '2/3', position: 'relative', overflow: 'hidden' }}>
                              {fav ? (
                                <>
                                  <img src={`https://image.tmdb.org/t/p/w300${fav.poster_path}`} alt={fav.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)', padding: '14px 6px 5px' }}>
                                    <div style={{ fontSize: '9px', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{fav.title}</div>
                                    {fav.score && <div style={{ fontSize: '9px', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', fontWeight: 800 }}>★ {Number(fav.score).toFixed(1)}</div>}
                                  </div>
                                </>
                              ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', opacity: 0.12 }}>🎬</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {(currentUser?.favorites || []).length === 0 && (
                      <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px', marginTop: '10px' }}>
                        Click Customize at the top of the page to assign films to your showcase slots.
                      </div>
                    )}
                  </div>

                  {/* Recent Diary (top 5) */}
                  {recentDiary.length > 0 && (
                    <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '20px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={16} color="var(--accent)" />
                          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>Recent Diary</h3>
                        </div>
                        <button onClick={() => setProfileActiveSubTab('diary')}
                          style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                          View all →
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {recentDiary.slice(0, 5).map(item => (
                          <div key={item.id || item.tmdb_id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '9px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px', transition: 'background 0.2s', cursor: 'pointer' }}
                            onClick={() => onMovieClick && onMovieClick(item.tmdb_id, item.media_type)}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                            {item.poster_path && <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="" style={{ width: '36px', height: '52px', objectFit: 'cover', borderRadius: '5px', border: '1px solid var(--border)', flexShrink: 0 }} />}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 800, fontSize: '13.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>{formatRelativeDate(item.watch_date || item.date_added)}</div>
                            </div>
                            {item.rating && <span style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '13px', flexShrink: 0 }}>★ {Number(item.rating).toFixed(1)}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN */}
                <div style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Genre Breakdown */}
                  <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '20px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <BarChart3 size={16} color="var(--accent)" />
                      <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>Genre Breakdown</h3>
                    </div>
                    {library.length > 0 ? <MiniGenreChart library={library} /> : (
                      <div style={{ color: 'var(--text-muted)', fontSize: '12.5px', textAlign: 'center', padding: '20px' }}>Add movies to see genre breakdown</div>
                    )}
                  </div>

                  {/* Rating Distribution */}
                  <RatingDistributionChart library={library} />

                  {/* Streak widget */}
                  {currentStreak > 0 && (
                    <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '16px 20px', border: '1px solid rgba(249,115,22,0.25)', background: 'rgba(249,115,22,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Flame size={22} color="#f97316" />
                        <div>
                          <div style={{ fontSize: '20px', fontWeight: 900, color: '#f97316' }}>{currentStreak}-day streak</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>{streakMultiplier > 1 ? `${streakMultiplier}x CinePoints multiplier active` : 'Keep it going!'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── DIARY TAB ── */}
            {profileActiveSubTab === 'diary' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <Calendar size={18} color="var(--accent)" />
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Watch Diary & History</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 700 }}>{recentDiary.length} entries</span>
                </div>

                {recentDiary.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', position: 'relative', paddingLeft: '14px', borderLeft: '2px solid rgba(124,111,247,0.12)' }}>
                    {recentDiary.map((item, idx) => {
                      const relDate = formatRelativeDate(item.watch_date || item.date_added);
                      return (
                        <div
                          key={item.id || item.tmdb_id}
                          style={{
                            position: 'relative',
                            paddingBottom: '24px',
                            display: 'flex',
                            gap: '16px',
                            alignItems: 'flex-start',
                            animation: 'slideIn 0.5s ease-out forwards',
                            animationDelay: `${idx * 0.08}s`,
                            opacity: 0
                          }}
                        >
                          <span style={{ position: 'absolute', left: '-20px', top: '5px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)', border: '2px solid #0a0813', boxShadow: '0 0 6px var(--accent)' }} />

                          {item.poster_path && (
                            <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="" style={{ width: '44px', height: '64px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)', flexShrink: 0 }} />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                              <div>
                                <span style={{ fontWeight: 800, fontSize: '14.5px', color: '#fff', cursor: onMovieClick ? 'pointer' : 'default' }}
                                  onClick={() => onMovieClick && onMovieClick(item.tmdb_id, item.media_type)}>
                                  {item.title}
                                </span>
                                <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: '8px' }}>({item.release_year})</span>
                                <span style={{ fontSize: '10px', background: 'rgba(124,111,247,0.1)', color: 'var(--accent)', borderRadius: '4px', padding: '2px 6px', marginLeft: '8px', fontWeight: 700 }}>
                                  {item.media_type === 'tv' ? 'Series' : item.media_type === 'anime' ? 'Anime' : 'Film'}
                                </span>
                              </div>
                              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>{relDate}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                              {item.rating ? (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--gold)', fontWeight: 900, fontSize: '13px' }}>
                                  <Star size={12} fill="currentColor" /> {Number(item.rating).toFixed(1)}
                                </div>
                              ) : <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>No rating</span>}
                              {item.is_rewatch && (
                                <span style={{ fontSize: '10px', background: 'rgba(236,72,153,0.1)', color: '#ec4899', borderRadius: '12px', padding: '1px 8px', fontWeight: 700 }}>
                                  🔄 {item.rewatch_count ? `${item.rewatch_count}x` : 'Rewatch'}
                                </span>
                              )}
                              {(item.tags || []).slice(0, 3).map(t => (
                                <span key={t} style={{ fontSize: '9.5px', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1px 7px' }}>#{t}</span>
                              ))}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.title + ' ' + (item.release_year || '') + ' official trailer')}`}
                                target="_blank" rel="noopener noreferrer"
                                style={{ fontSize: '10.5px', color: 'var(--red)', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '4px', padding: '2px 8px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                                Trailer
                              </a>
                              <button onClick={() => setActiveShareCard(item)}
                                style={{ fontSize: '10.5px', color: 'var(--accent)', background: 'rgba(124,111,247,0.06)', border: '1px solid rgba(124,111,247,0.18)', borderRadius: '4px', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700, cursor: 'pointer' }}>
                                Share Card
                              </button>
                            </div>

                            {item.review && (
                              <div style={{ marginTop: '8px' }}>
                                {item.contains_spoilers ? (
                                  <details style={{ cursor: 'pointer' }}>
                                    <summary style={{ fontSize: '11.5px', color: 'var(--red)', fontWeight: 800, listStyle: 'none' }}>⚠️ Contains spoilers (click to show)</summary>
                                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5, background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', marginTop: '4px' }}>"{item.review}"</p>
                                  </details>
                                ) : (
                                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>"{item.review}"</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="glass" style={{ padding: '40px', borderRadius: 'var(--radius-xl)', textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', marginBottom: '10px' }}>📖</div>
                    <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>Your Diary is Empty</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Log watched titles with a date to populate your chronological watch history.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── WATCHLIST TAB ── */}
            {profileActiveSubTab === 'watchlist' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <Film size={18} color="#60a5fa" />
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Your Watchlist</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 700 }}>{watchlistCount} titles</span>
                </div>
                {watchlistCount === 0 ? (
                  <div className="glass" style={{ padding: '40px', borderRadius: 'var(--radius-xl)', textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', marginBottom: '10px' }}>📋</div>
                    <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>Watchlist is Empty</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Add movies to your watchlist from the Explore or Library tabs.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '14px' }}>
                    {library.filter(m => m.status === 'plan_to_watch').map(m => (
                      <div key={m.id} onClick={() => onMovieClick && onMovieClick(m.tmdb_id, m.media_type)}
                        style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-solid)', cursor: onMovieClick ? 'pointer' : 'default', transition: 'transform 0.2s, box-shadow 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                        <div style={{ aspectRatio: '2/3', overflow: 'hidden', position: 'relative' }}>
                          {m.poster_path ? (
                            <img src={`https://image.tmdb.org/t/p/w300${m.poster_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                          ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🎬</div>
                          )}
                          <div style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(96,165,250,0.9)', color: '#fff', fontSize: '9px', fontWeight: 900, padding: '1px 6px', borderRadius: '4px' }}>Plan</div>
                        </div>
                        <div style={{ padding: '7px 9px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>{m.release_year}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── STATS TAB ── */}
            {profileActiveSubTab === 'stats' && (
              <div style={{ display: 'flex', gap: '24px', alignItems: 'start', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Overview stat cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {[
                      { label: 'Films Watched', val: watchedCount, color: 'var(--green)', icon: <Film size={20} color="var(--green)" /> },
                      { label: 'Reviews Written', val: reviewsCount, color: 'var(--accent)', icon: <Edit2 size={20} color="var(--accent)" /> },
                      { label: 'Favorites', val: favoritesCount, color: 'var(--red)', icon: <Heart size={20} color="var(--red)" fill="var(--red)" /> },
                      { label: 'Watchlist', val: watchlistCount, color: '#60a5fa', icon: <Calendar size={20} color="#60a5fa" /> },
                      { label: 'Avg Rating', val: avgRating ? `★ ${avgRating}` : 'N/A', color: 'var(--gold)', icon: <Star size={20} color="var(--gold)" fill="var(--gold)" /> },
                      { label: 'Current Streak', val: currentStreak > 0 ? `${currentStreak}d` : '—', color: '#f97316', icon: <Flame size={20} color="#f97316" /> },
                    ].map(s => (
                      <div key={s.label} className="glass" style={{ borderRadius: '14px', padding: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>{s.icon}</div>
                        <div style={{ fontSize: '22px', fontWeight: 900, color: s.color }}>{s.val}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {topRated.length > 0 && (
                    <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '20px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <Trophy size={16} color="var(--gold)" />
                        <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>Your Top Rated Films</h3>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px' }}>
                        {topRated.map((m, i) => (
                          <div key={m.id} onClick={() => onMovieClick && onMovieClick(m.tmdb_id, m.media_type)}
                            style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-solid)', cursor: onMovieClick ? 'pointer' : 'default' }}>
                            <div style={{ aspectRatio: '2/3', overflow: 'hidden', position: 'relative' }}>
                              {m.poster_path ? <img src={`https://image.tmdb.org/t/p/w300${m.poster_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎬</div>}
                              <div style={{ position: 'absolute', top: '4px', left: '4px', background: i < 3 ? 'rgba(251,191,36,0.9)' : 'rgba(0,0,0,0.8)', color: i < 3 ? '#000' : '#fff', fontSize: '9px', fontWeight: 900, padding: '1px 5px', borderRadius: '4px' }}>#{i + 1}</div>
                              <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.9)', color: 'var(--gold)', fontSize: '10px', fontWeight: 900, padding: '1px 5px', borderRadius: '4px' }}>★{Number(m.rating).toFixed(1)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: genre + rating distribution */}
                <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '20px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <BarChart3 size={16} color="var(--accent)" />
                      <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>Genre Breakdown</h3>
                    </div>
                    {library.length > 0 ? <MiniGenreChart library={library} /> : <div style={{ color: 'var(--text-muted)', fontSize: '12.5px', textAlign: 'center', padding: '16px' }}>Add movies to see breakdown</div>}
                  </div>
                  <RatingDistributionChart library={library} />
                </div>
              </div>
            )}

            {/* ── SHOP TAB ── */}
            {profileActiveSubTab === 'shop' && (
              <div className="glass animate-fade-in" style={{ borderRadius: 'var(--radius-xl)', padding: '28px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* Shop header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                      <Coins size={22} color="var(--gold)" /> CinePoints 2.0 Vault & Shop
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                      <span>Earn CinePoints by tracking films (+10), writing reviews (+10), and completing quests. </span>
                      {streakMultiplier > 1.0 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#f97316', fontWeight: 800 }}>
                          <Flame size={13} color="#f97316" /> {streakMultiplier}x Multiplier Active!
                        </span>
                      )}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '12px 22px', borderRadius: '16px', border: '1px solid rgba(251,191,36,0.3)', boxShadow: '0 0 16px rgba(251,191,36,0.1)' }}>
                    <Coins size={22} color="var(--gold)" />
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{cinePoints}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Points</div>
                    </div>
                  </div>
                </div>

                {/* 1. Daily & Weekly Quests */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} /> CinePoints Quests & Bounties
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                    {[
                      { label: 'Log a Film Today', icon: '🎬', reward: 10, progress: library.filter(m => (m.watch_date || m.date_added)?.startsWith(new Date().toISOString().split('T')[0])).length, target: 1, type: 'Daily' },
                      { label: 'Write 2 Reviews', icon: '✍️', reward: 20, progress: reviewsCount, target: 2, type: 'Daily' },
                      { label: 'Rate 5 Movies This Week', icon: '⭐', reward: 30, progress: Math.min(5, watchedCount), target: 5, type: 'Weekly' },
                      { label: 'Explore 3 New Genres', icon: '🌌', reward: 25, progress: Object.keys(library.reduce((acc, m) => { (m.genres || []).forEach(g => acc[g] = true); return acc; }, {})).length, target: 3, type: 'Weekly' },
                      { label: 'Watch 10 Films', icon: '📺', reward: 50, progress: watchedCount, target: 10, type: 'Milestone' },
                      { label: 'Build a 5-Day Streak', icon: '🔥', reward: 75, progress: currentStreak, target: 5, type: 'Milestone' }
                    ].map(quest => {
                      const pct = Math.min(100, Math.round((quest.progress / quest.target) * 100));
                      const done = quest.progress >= quest.target;
                      return (
                        <div key={quest.label} style={{ background: done ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)', border: done ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>{quest.icon} {quest.label}</span>
                            <span style={{ fontSize: '10px', background: quest.type === 'Daily' ? 'rgba(124,111,247,0.1)' : quest.type === 'Weekly' ? 'rgba(236,72,153,0.1)' : 'rgba(245,158,11,0.1)', color: quest.type === 'Daily' ? 'var(--accent)' : quest.type === 'Weekly' ? '#ec4899' : 'var(--gold)', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>{quest.type}</span>
                          </div>
                          <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: done ? 'var(--green)' : 'var(--accent)', borderRadius: '3px' }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)' }}>
                            <span>{quest.progress}/{quest.target} {done && '✓'}</span>
                            <span style={{ color: done ? 'var(--green)' : 'var(--gold)', fontWeight: 800 }}>+{quest.reward} CinePoints</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Exclusive Animated Banners Shop */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={16} /> Live Animated Profile Banners
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    {ALL_ANIMATED_BANNERS.map(banner => {
                      const isUnlocked = isCreator || (currentUser?.purchasedBanners || []).includes(banner.id);
                      const isEquipped = (currentUser?.bannerUrl || '') === banner.id;
                      return (
                        <div key={banner.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: isEquipped ? '2px solid var(--accent)' : '1px solid var(--border)' }}>
                          <div style={{ height: '75px', borderRadius: '8px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <AnimatedBannerBackground bannerId={banner.id} />
                            <div style={{ position: 'absolute', bottom: '4px', left: '8px', fontSize: '10px', fontWeight: 800, color: '#fff', zIndex: 10, background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: '4px' }}>Live Motion</div>
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#fff' }}>{banner.name}</span>
                              <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 800 }}>🪙 {banner.cost} pts</span>
                            </div>
                            <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: '4px 0 0', lineHeight: 1.4 }}>{banner.desc}</p>
                          </div>
                          {isEquipped ? (
                            <button disabled className="btn" style={{ marginTop: 'auto', background: 'rgba(124,111,247,0.15)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '7px 0', fontSize: '12px', fontWeight: 800, borderRadius: '8px', cursor: 'default' }}>✓ Equipped</button>
                          ) : isUnlocked ? (
                            <button className="btn btn-secondary" onClick={() => { if (onUpdateProfile) onUpdateProfile({ bannerUrl: banner.id, bannerFitMode: 'cover' }); }} style={{ marginTop: 'auto', padding: '7px 0', fontSize: '12px', fontWeight: 800, borderRadius: '8px' }}>Equip Banner</button>
                          ) : (
                            <button className="btn btn-primary"
                              onClick={() => {
                                if (cinePoints < banner.cost) { alert("Not enough CinePoints!"); return; }
                                const nextPurchased = [...(currentUser?.purchasedBanners || []), banner.id];
                                const nextSpent = (currentUser?.spentCinePoints || 0) + banner.cost;
                                if (onUpdateProfile) onUpdateProfile({ purchasedBanners: nextPurchased, spentCinePoints: nextSpent, bannerUrl: banner.id, bannerFitMode: 'cover' });
                              }}
                              style={{ marginTop: 'auto', padding: '7px 0', fontSize: '12px', fontWeight: 800, borderRadius: '8px' }}>
                              Unlock ({banner.cost} pts)
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Exclusive Shop Borders */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={16} /> Exclusive Shop Avatar Borders
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    {Object.entries(BORDER_STYLES).filter(([_, config]) => config.category === 'shop').map(([id, item]) => {
                      const isUnlocked = isCreator || unlockedBorders.has(id);
                      const isEquipped = (currentUser?.equippedBorder || 'none') === id;
                      return (
                        <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: isEquipped ? '1.5px solid var(--accent)' : '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <AvatarWithBorder src={currentUser?.avatar || DEFAULT_GREY_AVATAR} username="Me" borderId={id} size={42} />
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 800 }}>{item.name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 800 }}>🪙 {item.cost} pts</div>
                            </div>
                          </div>
                          <p style={{ fontSize: '10.5px', color: 'var(--text-dim)', margin: 0 }}>{item.desc}</p>
                          {isEquipped ? (
                            <button disabled className="btn" style={{ marginTop: 'auto', background: 'rgba(124,111,247,0.1)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '6px 0', fontSize: '12px', fontWeight: 800, borderRadius: '6px', cursor: 'default' }}>✓ Equipped</button>
                          ) : isUnlocked ? (
                            <button className="btn btn-secondary" onClick={() => { if (onUpdateProfile) onUpdateProfile({ equippedBorder: id }); }} style={{ marginTop: 'auto', padding: '6px 0', fontSize: '12px', fontWeight: 800, borderRadius: '6px' }}>Equip Border</button>
                          ) : (
                            <button className="btn btn-primary"
                              onClick={() => {
                                if (cinePoints < item.cost) { alert("Not enough CinePoints!"); return; }
                                const nextPurchased = [...(currentUser?.purchasedBorders || []), id];
                                const nextSpent = (currentUser?.spentCinePoints || 0) + item.cost;
                                if (onUpdateProfile) onUpdateProfile({ purchasedBorders: nextPurchased, spentCinePoints: nextSpent, equippedBorder: id });
                              }}
                              style={{ marginTop: 'auto', padding: '6px 0', fontSize: '12px', fontWeight: 800, borderRadius: '6px' }}>
                              Unlock ({item.cost} pts)
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Exclusive Profile Badges */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Trophy size={16} /> Exclusive Profile Title Badges
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' }}>
                    {SHOP_BADGES.map(badge => {
                      const isUnlocked = isCreator || (currentUser?.purchasedBadges || []).includes(badge.name);
                      return (
                        <div key={badge.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{badge.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 800 }}>🪙 {badge.cost}</span>
                          </div>
                          <p style={{ fontSize: '10.5px', color: 'var(--text-dim)', margin: 0 }}>{badge.desc}</p>
                          {isUnlocked ? (
                            <span style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 800, marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>✓ Unlocked & Displayed</span>
                          ) : (
                            <button className="btn btn-primary"
                              onClick={() => {
                                if (cinePoints < badge.cost) { alert("Not enough CinePoints!"); return; }
                                const nextPurchased = [...(currentUser?.purchasedBadges || []), badge.name];
                                const nextSpent = (currentUser?.spentCinePoints || 0) + badge.cost;
                                if (onUpdateProfile) onUpdateProfile({ purchasedBadges: nextPurchased, spentCinePoints: nextSpent });
                              }}
                              style={{ marginTop: 'auto', padding: '5px 0', fontSize: '11.5px', fontWeight: 800, borderRadius: '6px' }}>
                              Unlock Badge
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Soundscape Mixer */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: '14px' }}>Cinema Ambient Soundscapes</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    {[
                      { id: 'projector', name: '🎬 Film Projector Hum', color: '#f59e0b', desc: 'Analog 35mm projector clicker' },
                      { id: 'scifi', name: '🚀 Sci-Fi Ambience', color: '#3b82f6', desc: 'Deep interstellar synth drone' },
                      { id: 'orchestral', name: '🎻 Epic Orchestral Chords', color: '#ec4899', desc: 'Swell tones from film score' },
                      { id: 'lofi', name: '🌧️ Lo-Fi Midnight Rain', color: '#a78bfa', desc: 'Warm vinyl rainfall texture' }
                    ].map(track => {
                      const vol = soundVolumes[track.id] || 0;
                      return (
                        <div key={track.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800 }}>{track.name}</span>
                            <span style={{ fontSize: '10px', color: track.color, fontWeight: 900 }}>{Math.round(vol * 100)}%</span>
                          </div>
                          <p style={{ fontSize: '10px', color: 'var(--text-dim)', margin: 0, minHeight: '26px' }}>{track.desc}</p>
                          <input type="range" min="0" max="1" step="0.05" value={vol} onChange={e => handleVolumeChange(track.id, e.target.value)}
                            style={{ width: '100%', cursor: 'pointer', accentColor: track.color, height: '4px' }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          UNIFIED DELUXE PROFILE CUSTOMIZER MODAL
          ───────────────────────────────────────────────────────────── */}
      {showCustomizer && createPortal(
        <div
          style={{
            position: 'fixed', inset: 0, width: '100vw', height: '100vh',
            background: 'rgba(4,3,10,0.92)', backdropFilter: 'blur(20px)',
            zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}
          onClick={() => setShowCustomizer(false)}
        >
          <div
            className="glass animate-fade-in-scale"
            style={{
              width: '92vw', maxWidth: '860px', maxHeight: '92vh',
              borderRadius: '24px', border: '1px solid rgba(255,255,255,0.18)',
              background: '#0c0a18', padding: '26px', display: 'flex', flexDirection: 'column',
              boxShadow: '0 30px 80px rgba(0,0,0,0.95)', position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Customizer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(124,111,247,0.15)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SlidersHorizontal size={18} color="var(--accent)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '19px', fontWeight: 900, color: '#fff', margin: 0 }}>Customize Profile</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Personalize your banner, avatar, border, bio, and favorite film showcase.</p>
                </div>
              </div>
              <button
                onClick={() => setShowCustomizer(false)}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
              >
                <X size={16} />
              </button>
            </div>

            {/* Customizer Main Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '4px', marginBottom: '16px' }}>
              {[
                { id: 'banner', label: '🎨 Banner & Framing', icon: <ImageIcon size={14} /> },
                { id: 'avatar', label: '👤 Avatar & Borders', icon: <User size={14} /> },
                { id: 'info', label: '📝 Name & Bio', icon: <Award size={14} /> },
                { id: 'showcase', label: '⭐ Favorites Showcase (6)', icon: <Heart size={14} /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCustomizerTab(tab.id)}
                  style={{
                    background: customizerTab === tab.id ? 'rgba(124,111,247,0.12)' : 'none',
                    border: 'none', padding: '10px 16px', fontSize: '12.5px', fontWeight: 800,
                    color: customizerTab === tab.id ? 'var(--accent)' : 'var(--text-dim)',
                    borderBottom: customizerTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                    borderRadius: '8px 8px 0 0', cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENTS CONTAINER */}
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '55vh', paddingRight: '8px' }}>

              {/* ── TAB 1: BANNER & FRAMING ── */}
              {customizerTab === 'banner' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Live Banner Preview Box */}
                  <div style={{ borderRadius: '14px', overflow: 'hidden', height: '140px', position: 'relative', border: '1px solid var(--border)', background: '#08070e' }}>
                    {bannerUrl && bannerUrl.startsWith('animated-') ? (
                      <AnimatedBannerBackground bannerId={bannerUrl} />
                    ) : (
                      <div
                        style={{
                          width: '100%', height: '100%',
                          background: bannerUrl
                            ? `url("${bannerUrl}") center ${bannerPosPercent ?? 20}% / ${bannerFitMode === 'contain' ? 'contain' : 'cover'} no-repeat`
                            : 'linear-gradient(135deg, #1a1040 0%, #2d1b69 50%, #0f172a 100%)'
                        }}
                      />
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 70%, rgba(0,0,0,0.8) 100%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '10px', left: '14px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}>
                      <span style={{ fontSize: '10.5px', background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', color: '#fff', fontWeight: 800 }}>
                        {bannerUrl && bannerUrl.startsWith('animated-') ? 'LIVE ANIMATED MOTION' : `Live Framing: ${bannerFitMode.toUpperCase()} (${bannerPosPercent}%)`}
                      </span>
                    </div>
                  </div>

                  {/* Framing & Position Adjustment Toolbar */}
                  {bannerUrl && !bannerUrl.startsWith('animated-') && (
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[
                          { id: 'cover', label: 'Full-Bleed (Cover)' },
                          { id: 'contain', label: 'Letterbox (Contain)' },
                        ].map(opt => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setBannerFitMode(opt.id)}
                            style={{
                              padding: '6px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 800,
                              border: bannerFitMode === opt.id ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                              background: bannerFitMode === opt.id ? 'rgba(124,111,247,0.2)' : 'rgba(0,0,0,0.3)',
                              color: bannerFitMode === opt.id ? '#fff' : 'var(--text-muted)', cursor: 'pointer'
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-dim)', fontWeight: 700 }}>
                          <span>▲ Top Focus</span>
                          <span>Vertical Position: {bannerPosPercent}%</span>
                          <span>▼ Bottom Focus</span>
                        </div>
                        <input
                          type="range" min="0" max="100" step="5"
                          value={bannerPosPercent}
                          onChange={e => setBannerPosPercent(Number(e.target.value))}
                          style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer', height: '5px' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Banner Sub-Sources Tabs */}
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '4px' }}>
                    {[
                      { id: 'upload', label: '📁 Upload & URL' },
                      { id: 'tmdb', label: '🎬 Movie Backdrops' },
                      { id: 'library', label: '🎞️ From Library' },
                      { id: 'presets', label: '✨ Presets' },
                      { id: 'animated', label: '🔥 Animated' },
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => setBannerSourceTab(st.id)}
                        style={{
                          background: 'none', border: 'none', padding: '6px 12px', fontSize: '11.5px', fontWeight: 800,
                          color: bannerSourceTab === st.id ? 'var(--accent)' : 'var(--text-dim)',
                          borderBottom: bannerSourceTab === st.id ? '2px solid var(--accent)' : '2px solid transparent',
                          cursor: 'pointer'
                        }}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  {/* Sub-tab 1: Upload & URL */}
                  {bannerSourceTab === 'upload' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <label
                        style={{
                          border: '2px dashed rgba(124,111,247,0.35)', borderRadius: '14px', padding: '24px 16px',
                          textAlign: 'center', background: 'rgba(124,111,247,0.04)', cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(124,111,247,0.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(124,111,247,0.35)'; e.currentTarget.style.background = 'rgba(124,111,247,0.04)'; }}
                      >
                        <Upload size={20} color="var(--accent)" />
                        <div>
                          <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#fff' }}>Click to Upload Banner Image</span>
                          <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: '2px 0 0' }}>Supports PNG, JPG, WEBP, and Animated GIFs up to 5MB.</p>
                        </div>
                        <input type="file" accept="image/*" onChange={handleBannerFileUpload} style={{ display: 'none' }} />
                      </label>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '10.5px', color: 'var(--text-dim)', fontWeight: 800 }}>OR PASTE DIRECT IMAGE / GIF URL</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/... or https://i.imgur.com/...gif"
                            value={customUrlInput}
                            onChange={e => setCustomUrlInput(e.target.value)}
                            className="form-input"
                            style={{ flex: 1, fontSize: '12px' }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customUrlInput.trim()) {
                                setBannerUrl(customUrlInput.trim());
                                setBannerFitMode('cover');
                              }
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '0 14px', fontSize: '11.5px', fontWeight: 800 }}
                          >
                            Apply URL
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sub-tab 2: TMDB Backdrops */}
                  {bannerSourceTab === 'tmdb' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <form onSubmit={handleTmdbSearch} style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-dim)' }} />
                          <input
                            type="text"
                            placeholder="Search movie/show (e.g. Dune, Blade Runner, Interstellar)..."
                            value={tmdbSearchQuery}
                            onChange={e => setTmdbSearchQuery(e.target.value)}
                            className="form-input"
                            style={{ paddingLeft: '32px', fontSize: '12.5px' }}
                          />
                        </div>
                        <button type="submit" disabled={tmdbSearching} className="btn btn-primary" style={{ padding: '0 16px', fontSize: '12px', fontWeight: 800 }}>
                          {tmdbSearching ? 'Searching…' : 'Search'}
                        </button>
                      </form>

                      {tmdbSearchResults.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                          {tmdbSearchResults.map(item => {
                            const highRes = `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`;
                            const isSelected = bannerUrl === highRes;
                            return (
                              <div
                                key={item.id}
                                onClick={() => { setBannerUrl(highRes); setBannerFitMode('cover'); }}
                                style={{
                                  aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden',
                                  border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                                  boxShadow: isSelected ? '0 0 14px var(--accent)' : 'none',
                                  cursor: 'pointer', position: 'relative', background: '#110e1f'
                                }}
                              >
                                <img src={`https://image.tmdb.org/t/p/w500${item.backdrop_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(180deg,transparent 0%,rgba(0,0,0,0.85) 100%)', padding: '4px 6px', fontSize: '10.5px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {item.title || item.name}
                                </div>
                                {isSelected && (
                                  <div style={{ position: 'absolute', top: '5px', right: '5px', background: 'var(--accent)', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Check size={11} color="#fff" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)', fontSize: '12px' }}>
                          Search any title above to select its official high-res widescreen backdrop.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-tab 3: Library */}
                  {bannerSourceTab === 'library' && (
                    <div>
                      {(() => {
                        // Gather all items from watched library with backdrops or posters
                        const validItems = library.filter(m => m.backdrop_path || m.details?.backdrop_path || m.poster_path);
                        if (validItems.length === 0) {
                          return (
                            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-dim)', fontSize: '12.5px' }}>
                              <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '14px' }}>🎬 Your Watched Films Backdrops</p>
                              <p style={{ marginTop: '6px' }}>When you log movies to your watched library, CineLog automatically extracts their widescreen cinema backdrops here so you can equip your favorite film as your profile banner.</p>
                            </div>
                          );
                        }
                        return (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            {validItems.slice(0, 30).map(m => {
                              const backdropPath = m.backdrop_path || m.details?.backdrop_path;
                              const imageSrc = backdropPath ? `https://image.tmdb.org/t/p/w1280${backdropPath}` : `https://image.tmdb.org/t/p/w780${m.poster_path}`;
                              const isSelected = bannerUrl === imageSrc;
                              return (
                                <div
                                  key={m.id || m.tmdb_id}
                                  onClick={() => { setBannerUrl(imageSrc); setBannerFitMode('cover'); }}
                                  style={{
                                    aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden',
                                    border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                                    boxShadow: isSelected ? '0 0 14px var(--accent)' : 'none',
                                    cursor: 'pointer', position: 'relative', background: '#110e1f'
                                  }}
                                >
                                  <img
                                    src={backdropPath ? `https://image.tmdb.org/t/p/w500${backdropPath}` : `https://image.tmdb.org/t/p/w342${m.poster_path}`}
                                    alt=""
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    loading="lazy"
                                  />
                                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(180deg,transparent 0%,rgba(0,0,0,0.85) 100%)', padding: '4px 6px', fontSize: '10.5px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {m.title}
                                  </div>
                                  {isSelected && (
                                    <div style={{ position: 'absolute', top: '5px', right: '5px', background: 'var(--accent)', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Check size={11} color="#fff" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Sub-tab 4: Presets */}
                  {bannerSourceTab === 'presets' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      {PRESET_BANNERS.map(b => {
                        const isSelected = bannerUrl === b.url;
                        return (
                          <div
                            key={b.name}
                            onClick={() => { setBannerUrl(b.url); setBannerFitMode('cover'); }}
                            style={{
                              aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden',
                              border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                              boxShadow: isSelected ? '0 0 14px var(--accent)' : 'none',
                              cursor: 'pointer', position: 'relative', background: '#110e1f'
                            }}
                          >
                            <img src={b.url} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(180deg,transparent 0%,rgba(0,0,0,0.85) 100%)', padding: '4px 6px', fontSize: '10.5px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {b.name}
                            </div>
                            {isSelected && (
                              <div style={{ position: 'absolute', top: '5px', right: '5px', background: 'var(--accent)', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Check size={11} color="#fff" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Sub-tab 5: Animated */}
                  {bannerSourceTab === 'animated' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                        {isCreator ? '👑 Creator Perk: All live animated ambient banners are unlocked for your profile!' : 'Live animated motion banners (35mm scanlines, shooting stars, matrix code, synthwave, aurora, and plasma).'}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {ALL_ANIMATED_BANNERS.map(item => {
                          const isUnlocked = isCreator || (currentUser?.purchasedBanners || []).includes(item.id);
                          const isSelected = bannerUrl === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                if (isUnlocked) setBannerUrl(item.id);
                              }}
                              className={item.className}
                              style={{
                                height: '90px', borderRadius: '10px',
                                cursor: isUnlocked ? 'pointer' : 'default',
                                border: isSelected ? '2.5px solid var(--accent)' : '1px solid var(--border)',
                                boxShadow: isSelected ? '0 0 16px var(--accent)' : 'none',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                padding: '8px', textAlign: 'center', overflow: 'hidden', position: 'relative',
                                opacity: isUnlocked ? 1 : 0.65
                              }}
                            >
                              <span style={{ fontSize: '11px', fontWeight: 900, color: isSelected ? 'var(--accent)' : '#fff', position: 'relative', zIndex: 10, textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>{item.name}</span>
                              <span style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.8)', marginTop: '2px', position: 'relative', zIndex: 10, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>🪙 {item.cost} pts</span>
                              {isSelected && (
                                <div style={{ position: 'absolute', top: '5px', right: '5px', background: 'var(--accent)', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11 }}>
                                  <Check size={11} color="#fff" />
                                </div>
                              )}
                              {!isUnlocked && (
                                <span style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '9px', background: 'rgba(0,0,0,0.8)', color: 'var(--gold)', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, zIndex: 11 }}>
                                  🔒 Shop
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 2: AVATAR & BORDERS ── */}
              {customizerTab === 'avatar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Live Avatar Preview */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                    <AvatarWithBorder src={avatar || DEFAULT_GREY_AVATAR} username={displayName || 'User'} borderId={equippedBorder} size={80} />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>{displayName || 'Preview'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700 }}>Border: {BORDER_STYLES[equippedBorder]?.name || 'Default Border'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Pick an avatar below or upload your own custom photo.</div>
                    </div>
                  </div>

                  {/* Preset Avatars & Upload */}
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px', display: 'block' }}>
                      Choose Avatar Image ({DEFAULT_AVATARS.length} Movie Character Avatars)
                    </label>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                      {DEFAULT_AVATARS.map((url, i) => {
                        const isSelected = avatar === url;
                        return (
                          <div
                            key={i}
                            onClick={() => setAvatar(url)}
                            style={{
                              position: 'relative', width: '48px', height: '48px', cursor: 'pointer',
                              borderRadius: '50%', padding: '2px',
                              border: isSelected ? '2.5px solid var(--accent)' : '1.5px solid rgba(255,255,255,0.12)',
                              background: isSelected ? 'rgba(124,111,247,0.2)' : 'rgba(255,255,255,0.02)',
                              boxShadow: isSelected ? '0 0 12px var(--accent)' : 'none',
                              transition: 'transform 0.15s ease, border 0.15s ease',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <img
                              src={url}
                              alt=""
                              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            {isSelected && (
                              <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #0c0a18' }}>
                                <Check size={10} color="#fff" />
                              </div>
                            )}
                          </div>
                        );
                      })}

                      <label
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px',
                          background: 'rgba(124,111,247,0.12)', border: '1px dashed var(--accent)',
                          borderRadius: '24px', cursor: 'pointer', fontSize: '12px', fontWeight: 800, color: '#fff',
                          transition: 'all 0.18s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,111,247,0.22)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,111,247,0.12)'}
                      >
                        <Upload size={14} color="var(--accent)" /> Upload Custom Photo
                        <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>

                  {/* Visual Border Picker */}
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Equipped Avatar Border</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                      {Object.entries(BORDER_STYLES).map(([id, config]) => {
                        const isUnlocked = unlockedBorders.has(id);
                        const isEquipped = equippedBorder === id;
                        return (
                          <div
                            key={id}
                            onClick={() => { if (isUnlocked) setEquippedBorder(id); }}
                            style={{
                              padding: '10px 12px', borderRadius: '10px',
                              border: isEquipped ? '2px solid var(--accent)' : '1px solid var(--border)',
                              background: isEquipped ? 'rgba(124,111,247,0.12)' : isUnlocked ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.3)',
                              opacity: isUnlocked ? 1 : 0.45,
                              cursor: isUnlocked ? 'pointer' : 'not-allowed',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              transition: 'all 0.15s'
                            }}
                          >
                            <span style={{ fontSize: '12px', fontWeight: 700, color: isEquipped ? 'var(--accent)' : '#fff' }}>
                              {config.name}
                            </span>
                            <span style={{ fontSize: '10px', color: isUnlocked ? 'var(--green)' : 'var(--text-dim)', fontWeight: 800 }}>
                              {isEquipped ? '✓ Active' : isUnlocked ? 'Unlocked' : '🔒'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: NAME & BIO ── */}
              {customizerTab === 'info' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 800 }}>DISPLAY NAME</label>
                      <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="form-input" style={{ fontSize: '13px' }} placeholder="e.g. Cinema Enthusiast" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 800 }}>USERNAME (HANDLE)</label>
                      <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="form-input" style={{ fontSize: '13px' }} placeholder="e.g. cinephile" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 800 }}>BIO & CINEMA STORY</label>
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="Write a brief bio about your favorite genres, directors, and cinematic taste..."
                      className="form-input"
                      style={{ minHeight: '90px', fontSize: '13px', lineHeight: 1.5 }}
                    />
                  </div>
                </div>
              )}

              {/* ── TAB 4: FAVORITES SHOWCASE ── */}
              {customizerTab === 'showcase' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                    Click on any of the 6 showcase slots to select a movie or series from your watched library.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                    {favorites.map((fav, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectingSlotIdx(idx)}
                        style={{
                          aspectRatio: '2/3', borderRadius: '8px', border: '1px dashed var(--border)',
                          background: 'rgba(255,255,255,0.01)', position: 'relative', overflow: 'hidden',
                          cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        {fav ? (
                          <>
                            <img src={`https://image.tmdb.org/t/p/w200${fav.poster_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                              type="button"
                              onClick={(e) => removeMovieFromSlot(idx, e)}
                              style={{
                                position: 'absolute', top: '4px', right: '4px', width: '18px', height: '18px',
                                borderRadius: '50%', background: 'rgba(0,0,0,0.85)', border: 'none',
                                color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', padding: 0
                              }}
                            >
                              <X size={11} />
                            </button>
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)', padding: '8px 4px 3px' }}>
                              <div style={{ fontSize: '8.5px', fontWeight: 800, color: '#fff', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {fav.title}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <Plus size={16} color="var(--text-muted)" />
                            <span style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 700 }}>Slot {idx + 1}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* MODAL FOOTER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)', marginTop: '14px' }}>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setBannerUrl('');
                  setBannerFitMode('cover');
                  setBannerPosPercent(20);
                }}
                style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={13} /> Reset Banner
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowCustomizer(false)}
                  style={{ padding: '8px 18px', fontSize: '12.5px' }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveAll}
                  style={{ padding: '8px 24px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}
                >
                  <CheckCircle2 size={15} /> Save Changes
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ─────────────────────────────────────────────────────────────
          SHOWCASE SEARCH MODAL
          ───────────────────────────────────────────────────────────── */}
      {selectingSlotIdx !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,3,8,0.85)', backdropFilter: 'blur(12px)', zIndex: 1000000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', paddingTop: '10vh' }}
          onClick={() => { setSelectingSlotIdx(null); setSearchQuery(''); }}>
          <div className="glass" style={{ width: '100%', maxWidth: '440px', maxHeight: '80vh', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: '#0d0b18', display: 'flex', flexDirection: 'column', padding: '20px', gap: '16px' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14.5px', fontWeight: 800 }}>Choose Film for Slot {selectingSlotIdx + 1}</span>
              <button className="btn btn-ghost" onClick={() => { setSelectingSlotIdx(null); setSearchQuery(''); }} style={{ padding: '4px', width: '24px', height: '24px', borderRadius: '50%' }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '4px' }}>
              {[{ id: 'movie', label: 'Movies' }, { id: 'tv', label: 'Series' }, { id: 'anime', label: 'Anime' }].map(tab => (
                <button key={tab.id} onClick={() => setPopupActiveTab(tab.id)}
                  style={{ background: 'none', border: 'none', padding: '6px 12px', fontSize: '12px', fontWeight: 700, color: popupActiveTab === tab.id ? 'var(--accent)' : 'var(--text-dim)', borderBottom: popupActiveTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer' }}>
                  {tab.label}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-dim)' }} />
              <input type="text" placeholder="Search watched library..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="form-input" style={{ paddingLeft: '32px', fontSize: '12.5px', padding: '8px 8px 8px 32px' }} autoFocus />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '350px' }}>
              {filteredLibrary.length > 0 ? filteredLibrary.map(movie => (
                <div key={movie.id || movie.tmdb_id} onClick={() => handleSlotSelect(movie)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 10px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.15s', border: '1px solid transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {movie.poster_path ? <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt="" style={{ width: '28px', height: '42px', objectFit: 'cover', borderRadius: '4px' }} /> : <div style={{ width: '28px', height: '42px', background: '#1c182e', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🎬</div>}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movie.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{movie.release_year}</div>
                  </div>
                  {movie.rating && <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '12px' }}>★ {Number(movie.rating).toFixed(1)}</span>}
                </div>
              )) : (
                <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '12.5px', padding: '20px 0' }}>
                  No watched {popupActiveTab === 'movie' ? 'movies' : popupActiveTab === 'tv' ? 'series' : 'anime'} found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SHARE CARD MODAL
          ───────────────────────────────────────────────────────────── */}
      {activeShareCard && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(16px)' }}
          onClick={() => setActiveShareCard(null)}>
          <div className="glass animate-fade-in-scale" style={{ width: '100%', maxWidth: '380px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)', background: 'rgba(10,8,19,0.98)', boxShadow: 'var(--shadow-xl)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>CineLog Chronicles</span>
              <button onClick={() => setActiveShareCard(null)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <div id="share-card-content" style={{ background: 'linear-gradient(135deg, rgba(124,111,247,0.12) 0%, rgba(236,72,153,0.06) 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', gap: '16px', position: 'relative' }}>
              {activeShareCard.poster_path && <img src={`https://image.tmdb.org/t/p/w92${activeShareCard.poster_path}`} alt="" style={{ width: '70px', height: '105px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)', flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>{activeShareCard.title}</h3>
                <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '2px' }}>{activeShareCard.release_year}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  {activeShareCard.rating && <span style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '13px' }}>★ {activeShareCard.rating}</span>}
                  {activeShareCard.is_rewatch && <span style={{ fontSize: '9px', background: 'rgba(236,72,153,0.1)', color: '#ec4899', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}> Rewatched</span>}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '10px', lineHeight: 1.4, borderLeft: '2px solid var(--accent)', paddingLeft: '8px' }}>"{activeShareCard.review || 'No review notes written yet.'}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                  <img src={currentUser?.avatar || DEFAULT_GREY_AVATAR} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid var(--border)' }} />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>{currentUser?.displayName || currentUser?.username}</span>
                </div>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => window.print()} style={{ width: '100%', fontSize: '12px', padding: '8px 0' }}>🖨️ Print or Save as PDF</button>
          </div>
        </div>
      )}

    </div>
  );
}
