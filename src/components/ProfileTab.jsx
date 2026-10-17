import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Heart, Calendar, Star, Film, Trophy, BarChart3, X,
  Search, Plus, Upload, Flame, Coins, ArrowLeft, SlidersHorizontal,
  Image as ImageIcon, Trash2, CheckCircle2, User, Award, Check, Edit2, Sparkles,
  ChevronDown, ChevronUp, Crown, ExternalLink
} from 'lucide-react';
import { ACHIEVEMENTS, BORDER_STYLES, BADGE_COLORS, isUserCreator } from '../utils/achievements';
import AvatarWithBorder, { DEFAULT_GREY_AVATAR } from './AvatarWithBorder';
import { supabase } from '../supabaseClient';
import { TESTER_PROFILE, TESTER_LIBRARY } from '../mockData';
import StatsTab from './StatsTab';
import WatchCalendarTab from './WatchCalendarTab';
import WrappedTab from './WrappedTab';
import AchievementsTab from './AchievementsTab';
import ConstellationTab from './ConstellationTab';
import ProfileCustomizerModal from './ProfileCustomizerModal';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const TMDB_KEY = '6a2fd6b9b1bb3befbb9f14c203732225';

export const DEFAULT_AVATARS = [
  { id: 'spiderman', name: 'Spider-Man', movie: 'Spider-Verse', category: 'Action', url: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=260&fit=crop&q=80' },
  { id: 'batman', name: 'The Dark Knight', movie: 'Batman', category: 'Action', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=260&fit=crop&q=80' },
  { id: 'neo', name: 'Neo', movie: 'The Matrix', category: 'Sci-Fi', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=260&fit=crop&q=80' },
  { id: 'dune', name: 'Paul Atreides', movie: 'Dune: Part Two', category: 'Sci-Fi', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=260&fit=crop&q=80' },
  { id: 'oppenheimer', name: 'J. Robert Oppenheimer', movie: 'Oppenheimer', category: 'Drama', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=260&fit=crop&q=80' },
  { id: 'joker', name: 'Arthur Fleck', movie: 'Joker', category: 'Drama', url: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?w=260&fit=crop&q=80' },
  { id: 'officer_k', name: 'Officer K', movie: 'Blade Runner 2049', category: 'Sci-Fi', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=260&fit=crop&q=80' },
  { id: 'killbill', name: 'The Bride', movie: 'Kill Bill', category: 'Action', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=260&fit=crop&q=80' },
  { id: 'mia_wallace', name: 'Mia Wallace', movie: 'Pulp Fiction', category: 'Classics', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=260&fit=crop&q=80' },
  { id: 'tyler_durden', name: 'Tyler Durden', movie: 'Fight Club', category: 'Drama', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=260&fit=crop&q=80' },
  { id: 'mononoke', name: 'San', movie: 'Princess Mononoke', category: 'Anime', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=260&fit=crop&q=80' },
  { id: 'cooper', name: 'Cooper', movie: 'Interstellar', category: 'Sci-Fi', url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=260&fit=crop&q=80' },
  { id: 'alien', name: 'Ellen Ripley', movie: 'Alien', category: 'Sci-Fi', url: 'https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=260&fit=crop&q=80' },
  { id: 'ghost_shell', name: 'Motoko Kusanagi', movie: 'Ghost in the Shell', category: 'Anime', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=260&fit=crop&q=80' },
  { id: 'trooper', name: 'Imperial Trooper', movie: 'Star Wars', category: 'Sci-Fi', url: 'https://images.unsplash.com/photo-1579566346927-c68383817a25?w=260&fit=crop&q=80' },
  { id: 'noir_detective', name: 'Sam Spade', movie: 'The Maltese Falcon', category: 'Classics', url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=260&fit=crop&q=80' },
  { id: 'cinematographer', name: 'Cinematographer', movie: '35mm Film Vault', category: 'Classics', url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=260&fit=crop&q=80' },
  { id: 'cyber_armor', name: 'Iron Warrior', movie: 'Avengers', category: 'Action', url: 'https://images.unsplash.com/photo-1626278664285-f796b9ee7806?w=260&fit=crop&q=80' }
];

const GENRE_COLORS = {
  'Action': '#ef4444', 'Adventure': '#f97316', 'Comedy': '#eab308',
  'Drama': '#10b981', 'Sci-Fi': '#3b82f6', 'Horror': '#880808',
  'Romance': '#c0392b', 'Thriller': '#f59e0b', 'Animation': '#06b6d4',
  'Fantasy': '#c0392b', 'Crime': '#6b7280', 'Documentary': '#84cc16',
  'Mystery': '#c0392b', 'Family': '#fde68a',
};

const SHOP_BADGES = [
  { name: 'VIP Cinephile', cost: 100, desc: 'Exclusive VIP member status badge' },
  { name: 'Popcorn Overlord', cost: 150, desc: 'For dedicated snack connoisseurs' },
  { name: 'Midnight Binger', cost: 200, desc: 'Night owl cinema marathoner' },
  { name: 'Cinema Tycoon', cost: 300, desc: 'High-ranking film empire master' },
  { name: "Director's Cut", cost: 450, desc: 'Auteur visionary prestige rank' }
];

export const PRESET_BANNERS = [
  { name: 'Blade Runner 2049', tag: 'Cyberpunk Neon', url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Interstellar Deep Space', tag: 'Cosmic Wormhole', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Dune: Arrakis Dunes', tag: 'Desert Horizon', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Grand IMAX Cinema Hall', tag: 'Velvet Theater', url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Cyberpunk Tokyo Rain', tag: 'Midnight Neon', url: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Vintage 35mm Studio', tag: 'Analog Archive', url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Apocalypse Golden Sunset', tag: 'Epic Cinema', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Alpine Peak Vista', tag: 'Dramatic Drama', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Retro Synthwave Arcade', tag: '80s Nostalgia', url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Film Premiere Gala', tag: 'Red Carpet', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Deep Nebula Vortex', tag: 'Astrophotography', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Matrix Digital Grid', tag: 'Cyber Dystopia', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&h=600&q=85' }
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
                  background: count > 0 ? 'linear-gradient(to top, var(--accent), #c0392b)' : 'rgba(255,255,255,0.05)',
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

export default function ProfileTab({
  targetUser,
  currentUser,
  onUpdateProfile,
  library = [],
  onOpenUserProfile,
  onMovieClick,
  initialSubTab = 'overview',
  onSubTabChange
}) {
  // Single All-in-One Customizer Modal state
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customizerTab, setCustomizerTab] = useState('banner'); // 'banner' | 'avatar' | 'info' | 'showcase'

  // Editable Profile Draft State
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [equippedBorder, setEquippedBorder] = useState(currentUser?.equippedBorder || 'none');
  const [bannerUrl, setBannerUrl] = useState(() => currentUser?.bannerUrl || localStorage.getItem('cinelog_banner_url') || '');
  const [bannerFitMode, setBannerFitMode] = useState(() => currentUser?.bannerFitMode || localStorage.getItem('cinelog_banner_fit') || 'cover');
  const [bannerPosPercent, setBannerPosPercent] = useState(() => {
    if (currentUser?.bannerPosPercent !== undefined) return currentUser.bannerPosPercent;
    const local = localStorage.getItem('cinelog_banner_pos');
    return local !== null ? Number(local) : 20;
  });

  // Banner Studio internal state
  const [bannerSourceTab, setBannerSourceTab] = useState('upload'); // 'upload' | 'tmdb' | 'library' | 'presets' | 'animated'
  const [tmdbSearchQuery, setTmdbSearchQuery] = useState('');
  const [tmdbSearchResults, setTmdbSearchResults] = useState([]);
  const [tmdbSearching, setTmdbSearching] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Page sub-tab navigation
  const [profileActiveSubTab, setProfileActiveSubTab] = useState(initialSubTab || 'overview');

  useEffect(() => {
    if (initialSubTab) {
      setProfileActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSubTabChange = (tabId) => {
    setProfileActiveSubTab(tabId);
    if (onSubTabChange) onSubTabChange(tabId);
  };
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
      setBannerUrl(currentUser?.bannerUrl || localStorage.getItem('cinelog_banner_url') || '');
      setBannerFitMode(currentUser?.bannerFitMode || localStorage.getItem('cinelog_banner_fit') || 'cover');
      const resolvedPos = currentUser?.bannerPosPercent !== undefined
        ? currentUser.bannerPosPercent
        : (localStorage.getItem('cinelog_banner_pos') !== null ? Number(localStorage.getItem('cinelog_banner_pos')) : 20);
      setBannerPosPercent(resolvedPos);
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
    setBannerUrl(currentUser?.bannerUrl || localStorage.getItem('cinelog_banner_url') || '');
    setBannerFitMode(currentUser?.bannerFitMode || localStorage.getItem('cinelog_banner_fit') || 'cover');
    const resolvedPos = currentUser?.bannerPosPercent !== undefined
      ? currentUser.bannerPosPercent
      : (localStorage.getItem('cinelog_banner_pos') !== null ? Number(localStorage.getItem('cinelog_banner_pos')) : 20);
    setBannerPosPercent(resolvedPos);
    setFavorites(Array.from({ length: 6 }, (_, i) => (currentUser?.favorites || [])[i] || null));
    setCustomizerTab(initialTab);
    setShowCustomizer(true);
  };

  // Fetch other-user profile + library when targetUser is set and is not the logged-in user
  const isViewingOther = targetUser && (
    (targetUser.id && targetUser.id !== currentUser?.id) ||
    (targetUser.username && targetUser.username !== currentUser?.username)
  );

  useEffect(() => {
    if (!isViewingOther) {
      setViewedProfile(null);
      setViewedLibrary([]);
      return;
    }
    setViewedLoading(true);

    const isTester = (targetUser?.username?.toLowerCase() === 'tester') || (targetUser?.id === TESTER_PROFILE.id);
    if (isTester) {
      setViewedProfile(TESTER_PROFILE);
      setViewedLibrary(TESTER_LIBRARY);
      setViewedLoading(false);
      return;
    }

    if (supabase) {
      // Load profile and library in parallel; follow check is separate so it never blocks
      Promise.all([
        supabase.from('profiles').select('*').eq('id', targetUser.id).single(),
        supabase.from('library').select('*').eq('user_id', targetUser.id),
      ]).then(([{ data: prof, error: profErr }, { data: lib }]) => {
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
            bannerPosPercent: prof.banner_pos_percent ?? 20,
            purchasedBadges: prof.purchased_badges || [],
          });
        } else {
          setViewedProfile(targetUser);
        }
        // Strip episode data blob from reviews before storing
        const cleanLib = (lib || []).map(row => ({
          ...row,
          review: (row.review || '').replace(/__EPISODE_DATA__:.+$/s, '').replace(/__EPISODE_RATINGS__:.+$/s, '').trim()
        }));
        setViewedLibrary(cleanLib);
        setViewedLoading(false);
      }).catch(err => {
        console.error('Error fetching viewed profile:', err);
        setViewedProfile(targetUser);
        setViewedLibrary([]);
        setViewedLoading(false);
      });

      // Follow status checked independently so a missing 'follows' table doesn't crash profile load
      if (currentUser?.id) {
        supabase.from('follows').select('*').match({ follower_id: currentUser.id, following_id: targetUser.id }).maybeSingle()
          .then(({ data: followRel }) => setIsFollowing(!!followRel))
          .catch(() => setIsFollowing(false));
      }
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
        await supabase.from('follows').delete().match({ follower_id: currentUser.id, following_id: viewedProfile.id });
        setIsFollowing(false);
        setViewedProfile(prev => prev ? { ...prev, followersCount: Math.max(0, (prev.followersCount || 1) - 1) } : prev);
      } else {
        await supabase.from('follows').upsert({ follower_id: currentUser.id, following_id: viewedProfile.id }, { onConflict: 'follower_id,following_id' });
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

  // Prevent background scroll when choosing favorite film or viewing share card
  useBodyScrollLock(selectingSlotIdx !== null || activeShareCard !== null);

  // Handle Escape key to close slot picker, share card modal, or viewed foreign profile
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectingSlotIdx !== null) {
          setSelectingSlotIdx(null);
          setSearchQuery('');
        } else if (showCustomizer) {
          setShowCustomizer(false);
        } else if (activeShareCard !== null) {
          setActiveShareCard(null);
        } else if (viewedProfile !== null) {
          setViewedProfile(null);
        }
      }
    };
    if (selectingSlotIdx !== null || showCustomizer || activeShareCard !== null || viewedProfile !== null) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectingSlotIdx, showCustomizer, activeShareCard, viewedProfile]);

  // Intercept Android swipe-to-go-back for internal ProfileTab modals
  useEffect(() => {
    const handleHardwareBack = (e) => {
      if (selectingSlotIdx !== null) {
        setSelectingSlotIdx(null);
        setSearchQuery('');
        e.preventDefault();
        return;
      }
      if (showCustomizer) {
        setShowCustomizer(false);
        e.preventDefault();
        return;
      }
      if (activeShareCard !== null) {
        setActiveShareCard(null);
        e.preventDefault();
        return;
      }
      if (viewedProfile !== null) {
        setViewedProfile(null);
        e.preventDefault();
        return;
      }
    };
    window.addEventListener('cinelog-back-handled', handleHardwareBack);
    return () => window.removeEventListener('cinelog-back-handled', handleHardwareBack);
  }, [selectingSlotIdx, showCustomizer, activeShareCard, viewedProfile]);

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
      // 👑 Creator account automatically unlocks all title badges!
      Object.keys(BADGE_COLORS).forEach(b => earned.push(b));
    } else {
      ACHIEVEMENTS.forEach(ach => {
        if (ach.check(library) >= ach.target) {
          if (ach.reward.badgeName) earned.push(ach.reward.badgeName);
        }
      });
      const purchased = currentUser?.purchasedBadges || [];
      purchased.forEach(b => earned.push(b));
    }
    return Array.from(new Set(earned));
  }, [library, currentUser, isCreator]);

  const [showAllBadges, setShowAllBadges] = useState(false);

  const BADGE_PRESTIGE_ORDER = useMemo(() => [
    'Creator', 'The Maker.',
    'Cinema Overlord', 'Film Legend', 'Hall of Famer', 'Diamond Legend',
    'Gold Watcher', 'Absolute Critic', 'Master Essayist', 'Grand Essayist',
    'Genre Master', 'Streak Master', 'Silver Watcher', 'Dedicated Critic',
    'Elite Critic', 'Critic', 'Bronze Watcher'
  ], []);

  const sortedBadges = useMemo(() => {
    return [...unlockedBadges].sort((a, b) => {
      const idxA = BADGE_PRESTIGE_ORDER.indexOf(a);
      const idxB = BADGE_PRESTIGE_ORDER.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [unlockedBadges, BADGE_PRESTIGE_ORDER]);

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
  const handleSaveAll = (updatedData) => {
    const savedFavorites = favorites.filter(fav => fav !== null);
    if (onUpdateProfile) {
      onUpdateProfile({
        ...(updatedData || {
          displayName,
          username,
          bio,
          avatar,
          equippedBorder,
          bannerUrl,
          bannerFitMode,
          bannerPosPercent
        }),
        favorites: savedFavorites
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
                style={{
                  height: '320px',
                  width: '100%',
                  borderRadius: '20px 20px 0 0',
                  overflow: 'hidden',
                  position: 'relative',
                  background: '#08070e'
                }}
              >
                {viewedProfile?.bannerUrl && !viewedProfile.bannerUrl.startsWith('animated-') ? (
                  <img
                    src={(viewedProfile.bannerUrl || '').replace('/w1280/', '/original/').replace('/w500/', '/original/')}
                    alt="Profile Banner"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: viewedProfile.bannerFitMode || 'cover',
                      objectPosition: `center ${viewedProfile.bannerPosPercent ?? 20}%`,
                      display: 'block',
                      imageRendering: 'auto',
                      backfaceVisibility: 'hidden'
                    }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #181818 0%, #101010 50%, #000000 100%)' }} />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 80%, rgba(10,8,19,0.9) 100%)', pointerEvents: 'none' }} />
              </div>

              {/* PROFILE HEADER ROW */}
              <div style={{
                background: 'linear-gradient(180deg, #13111b 0%, #0d0b13 100%)',
                padding: '0 28px 24px',
                border: '1px solid rgba(255,255,255,0.08)',
                borderTop: 'none',
                borderRadius: '0 0 24px 24px',
                boxShadow: '0 24px 60px rgba(0,0,0,0.7)'
              }}>
                {/* Top Row: Avatar + Name on Left, Stats Capsules on Right */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>

                  {/* Left: Avatar + Name / Handle / Follow */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', minWidth: '240px' }}>
                    <div style={{ marginTop: '-55px', flexShrink: 0, zIndex: 10, position: 'relative' }}>
                      <AvatarWithBorder
                        src={viewedProfile?.avatar || DEFAULT_GREY_AVATAR}
                        username={viewedProfile?.username || 'User'}
                        borderId={viewedProfile?.equippedBorder || 'none'}
                        size={110}
                      />
                    </div>

                    <div style={{ paddingTop: '14px', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                          {viewedProfile?.displayName || viewedProfile?.username || 'CineLog User'}
                        </h2>
                        {currentUser?.id && (
                          <button
                            onClick={handleToggleFollow}
                            disabled={followLoading}
                            className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                            style={{ padding: '6px 18px', fontSize: '12px', fontWeight: 800, borderRadius: '20px', flexShrink: 0 }}
                          >
                            {followLoading ? '…' : isFollowing ? 'Following' : '+ Follow'}
                          </button>
                        )}
                      </div>
                      <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>
                        @{viewedProfile?.username}
                      </div>
                    </div>
                  </div>

                  {/* Right: Modern Frosted Stat Capsules */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end', paddingTop: '14px' }}>
                    {[
                      { label: 'Films', val: viewedLibrary.filter(m => m.status === 'watched').length, color: 'var(--green)' },
                      { label: 'Reviews', val: viewedLibrary.filter(m => m.review && m.review.trim().length > 0).length, color: 'var(--accent)' },
                      { label: 'Favorites', val: (viewedProfile?.favorites || []).filter(Boolean).length, color: 'var(--red)' },
                      { label: 'Watchlist', val: viewedLibrary.filter(m => m.status === 'plan_to_watch').length, color: '#60a5fa' },
                      {
                        label: 'Avg Rating',
                        val: (() => {
                          const r = viewedLibrary.filter(m => m.rating && Number(m.rating) > 0);
                          return r.length ? '★ ' + (r.reduce((s, m) => s + Number(m.rating), 0) / r.length).toFixed(1) : '—';
                        })(),
                        color: 'var(--gold)'
                      },
                    ].map(s => (
                      <div
                        key={s.label}
                        style={{
                          textAlign: 'center',
                          minWidth: '65px',
                          padding: '8px 12px',
                          background: 'rgba(255,255,255,0.035)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '14px',
                          backdropFilter: 'blur(8px)',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
                        }}
                      >
                        <div style={{ fontSize: '18px', fontWeight: 900, color: s.color, fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>{s.val}</div>
                        <div style={{ fontSize: '9px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 800, marginTop: '3px' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full-width Bio & Badges Card (full square box spanning whole width, no blank left side) */}
                {viewedProfile?.bio && (
                  <div style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'rgba(255, 255, 255, 0.035)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    marginTop: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <p style={{
                      fontSize: '13.5px',
                      color: 'rgba(255,255,255,0.85)',
                      lineHeight: 1.6,
                      margin: 0,
                      fontWeight: 500
                    }}>
                      {viewedProfile.bio}
                    </p>
                    {/* Badges inside the full square bio box */}
                    {(() => {
                      const vBadges = (viewedProfile?.purchasedBadges || []);
                      if (vBadges.length === 0) return null;
                      return (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '2px' }}>
                          {vBadges.map(b => (
                            <span key={b} style={{
                              fontSize: '11px', fontWeight: 800, padding: '4px 12px',
                              borderRadius: '20px',
                              border: '1px solid rgba(229, 9, 20, 0.35)',
                              color: 'var(--accent)',
                              background: 'rgba(229, 9, 20, 0.08)'
                            }}>{b}</span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Sub tabs & Content */}
              <div style={{ padding: '24px 0' }}>
                {/* Top Favorites row if present */}
                {viewedProfile?.favorites && viewedProfile.favorites.filter(Boolean).length > 0 && (
                  <div style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Heart size={16} color="var(--accent)" fill="var(--accent)" />
                        Top Favorites
                      </h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 700 }}>
                        {viewedProfile.favorites.filter(Boolean).length} titles
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' }}>
                      {viewedProfile.favorites.filter(Boolean).map(fav => (
                        <div
                          key={fav.id || fav.tmdb_id}
                          onClick={() => onMovieClick && onMovieClick(fav.tmdb_id || fav.id, fav.media_type || 'movie')}
                          style={{
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '1px solid rgba(229, 9, 20, 0.35)',
                            background: 'var(--surface-solid)',
                            cursor: 'pointer',
                            transition: 'transform 0.15s, border-color 0.15s',
                            position: 'relative'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(229, 9, 20, 0.35)'; }}
                        >
                          <div style={{ aspectRatio: '2/3', position: 'relative', background: '#120d1c' }}>
                            {fav.poster_path ? (
                              <img src={`https://image.tmdb.org/t/p/w300${fav.poster_path}`} alt={fav.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                            ) : (
                              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎬</div>
                            )}
                            {fav.score && (
                              <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.85)', color: 'var(--gold)', fontSize: '10px', fontWeight: 900, padding: '2px 5px', borderRadius: '4px' }}>
                                ★ {Number(fav.score).toFixed(1)}
                              </div>
                            )}
                          </div>
                          <div style={{ padding: '6px 8px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {fav.title}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewedLibrary.filter(m => m.status === 'watched').length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)', fontSize: '14px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎬</div>
                    <div style={{ fontWeight: 700, marginBottom: '6px' }}>No watched films yet</div>
                    <div style={{ fontSize: '13px', opacity: 0.7 }}>This user hasn't logged any films yet.</div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Watched Films</h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 700 }}>{viewedLibrary.filter(m => m.status === 'watched').length} films</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                      {viewedLibrary.filter(m => m.status === 'watched').map(m => (
                        <div key={m.id || m.tmdb_id} onClick={() => onMovieClick && onMovieClick(m.tmdb_id, m.media_type)}
                          style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-solid)', cursor: 'pointer', transition: 'transform 0.15s, border-color 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.borderColor = 'rgba(136,8,8,0.5)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        >
                          <div style={{ aspectRatio: '2/3', position: 'relative', background: '#1a1030' }}>
                            {m.poster_path
                              ? <img src={`https://image.tmdb.org/t/p/w300${m.poster_path}`} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                              : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🎬</div>
                            }
                            {m.rating > 0 && <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.85)', color: 'var(--gold)', fontSize: '10px', fontWeight: 900, padding: '2px 6px', borderRadius: '4px' }}>★ {Number(m.rating).toFixed(1)}</div>}
                          </div>
                          <div style={{ padding: '6px 8px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</div>
                            {m.release_year && <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{m.release_year}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Reviews section */}
                {viewedLibrary.filter(m => m.review && m.review.trim().length > 0).length > 0 && (
                  <div style={{ marginTop: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Recent Reviews</h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 700 }}>{viewedLibrary.filter(m => m.review && m.review.trim().length > 0).length} reviews</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {viewedLibrary
                        .filter(m => m.review && m.review.trim().length > 0)
                        .sort((a, b) => new Date(b.date_added || 0) - new Date(a.date_added || 0))
                        .slice(0, 5)
                        .map(m => (
                          <div key={m.id || m.tmdb_id}
                            onClick={() => onMovieClick && onMovieClick(m.tmdb_id, m.media_type)}
                            style={{ display: 'flex', gap: '12px', padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '14px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(136,8,8,0.35)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                          >
                            {m.poster_path && (
                              <img src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} alt={m.title} style={{ width: '44px', height: '64px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '3px' }}>{m.title}</div>
                              {m.rating > 0 && <div style={{ color: 'var(--gold)', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>★ {Number(m.rating).toFixed(1)}</div>}
                              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', lineHeight: 1.5, padding: '6px 10px', background: 'rgba(136,8,8,0.06)', borderLeft: '3px solid rgba(136,8,8,0.5)', borderRadius: '0 6px 6px 0' }}>
                                "{m.review.slice(0, 160)}{m.review.length > 160 ? '…' : ''}"
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            OWN PROFILE — Letterboxd-style full page
            ───────────────────────────────────────────────────────────── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

          {/* BANNER (grand cinematic marquee with fallback ambiance) */}
          <div
            className="profile-banner"
            style={{
              height: '520px',
              width: '100%',
              borderRadius: '24px 24px 0 0',
              overflow: 'hidden',
              position: 'relative',
              background: '#08070e'
            }}
          >
            {currentUser?.bannerUrl && !currentUser.bannerUrl.startsWith('animated-') ? (
              <img
                src={(currentUser.bannerUrl || '').replace('/w1280/', '/original/').replace('/w500/', '/original/')}
                alt="Profile Banner"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: currentUser?.bannerFitMode || localStorage.getItem('cinelog_banner_fit') || 'cover',
                  objectPosition: `center ${currentUser?.bannerPosPercent !== undefined ? currentUser.bannerPosPercent : (localStorage.getItem('cinelog_banner_pos') !== null ? Number(localStorage.getItem('cinelog_banner_pos')) : 20)}%`,
                  display: 'block',
                  imageRendering: 'auto',
                  backfaceVisibility: 'hidden'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                background: 'radial-gradient(ellipse at 50% 25%, rgba(136,8,8,0.32) 0%, rgba(18,14,28,0.9) 65%, #08060d 100%)'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.18,
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.25) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                  pointerEvents: 'none'
                }} />
              </div>
            )}

            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 75%, rgba(13,11,20,0.7) 90%, rgba(13,11,20,0.96) 100%)', pointerEvents: 'none' }} />

            {/* SINGLE UNIFIED CUSTOMIZE BUTTON */}
            <button
              type="button"
              className="profile-banner-customize-btn"
              onClick={() => handleOpenCustomizer('banner')}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                zIndex: 5,
                background: 'rgba(10,8,22,0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.22)',
                color: '#fff',
                borderRadius: '30px',
                padding: '9px 22px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(136,8,8,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.6)';
              }}
            >
              <SlidersHorizontal size={15} color="var(--accent)" /> Customize Studio
            </button>
          </div>

          {/* PROFILE HEADER ROW (Polished Studio Card) */}
          <div className="profile-card-header" style={{
            background: 'linear-gradient(180deg, #13111b 0%, #0d0b13 100%)',
            padding: '0 32px 28px',
            border: '1px solid rgba(255,255,255,0.08)',
            borderTop: 'none',
            borderRadius: '0 0 24px 24px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
            position: 'relative'
          }}>
            
            {/* Top Bar: Avatar + Name/Bio on Left, Stats Capsules on Right */}
            <div className="profile-header-top-bar" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '28px', flexWrap: 'wrap' }}>
              
              {/* Left: Avatar (overlapping banner with glowing presence) + Name & Bio */}
              <div className="profile-user-info" style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flex: 1, minWidth: '320px' }}>
                <div style={{
                  marginTop: '-65px',
                  position: 'relative',
                  flexShrink: 0,
                  zIndex: 10,
                  filter: isCreator ? 'drop-shadow(0 0 22px rgba(251,191,36,0.35))' : 'drop-shadow(0 12px 26px rgba(0,0,0,0.85))'
                }}>
                  <AvatarWithBorder
                    src={currentUser?.avatar || DEFAULT_GREY_AVATAR}
                    username={currentUser?.username || 'Profile'}
                    borderId={currentUser?.equippedBorder || 'none'}
                    size={118}
                  />
                </div>

                <div style={{ paddingTop: '16px', minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2 }}>
                      {(currentUser?.displayName && !currentUser.displayName.includes('-----') && currentUser.displayName.trim() !== '—') ? currentUser.displayName : (currentUser?.username || 'CineLog Fan')}
                    </h2>
                    {isCreator && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(168,85,247,0.2) 100%)',
                        border: '1px solid rgba(251,191,36,0.5)',
                        color: '#fbbf24',
                        fontSize: '11px',
                        fontWeight: 900,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase'
                      }}>
                        <Crown size={12} fill="#fbbf24" /> Creator
                      </span>
                    )}
                  </div>

                  <div style={{ color: 'var(--accent)', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>
                    @{currentUser?.username || 'cinelog_user'}
                  </div>

                  <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, maxWidth: '580px', margin: 0 }}>
                    {currentUser?.bio || 'No cinema story written yet. Click Customize Studio to personalize your bio.'}
                  </p>
                </div>
              </div>

              {/* Right: Modern Frosted Stat Capsules */}
              <div className="profile-stats-capsules-grid">
                {[
                  { label: 'Films', val: watchedCount, color: 'var(--green)' },
                  { label: 'Reviews', val: reviewsCount, color: 'var(--accent)' },
                  { label: 'Favorites', val: favoritesCount, color: 'var(--red)' },
                  { label: 'Watchlist', val: watchlistCount, color: '#60a5fa' },
                  { label: 'CinePoints', val: `🪙 ${cinePoints}`, color: '#fbbf24' },
                  ...(avgRating ? [{ label: 'Avg Rating', val: `★ ${avgRating}`, color: 'var(--gold)' }] : []),
                ].map(s => (
                  <div
                    key={s.label}
                    className="profile-stat-capsule"
                    style={{
                      textAlign: 'center',
                      minWidth: '68px',
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.035)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '14px',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                      transition: 'transform 0.15s ease, border-color 0.15s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  >
                    <div style={{ fontSize: '20px', fontWeight: 900, color: s.color, fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>{s.val}</div>
                    <div style={{ fontSize: '9.5px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 800, marginTop: '4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* BADGES RIBBON WITH LIMIT AND SHOW MORE TOGGLE */}
            {sortedBadges.length > 0 && (() => {
              const BADGE_LIMIT = 5;
              const userChosen = (currentUser?.featuredBadges && Array.isArray(currentUser.featuredBadges))
                ? currentUser.featuredBadges.filter(b => unlockedBadges.includes(b))
                : [];
              const effectiveBadges = userChosen.length > 0 ? userChosen : sortedBadges;
              const displayedBadges = showAllBadges ? sortedBadges : effectiveBadges.slice(0, BADGE_LIMIT);
              const remainingCount = Math.max(0, sortedBadges.length - displayedBadges.length);

              return (
                <div style={{
                  marginTop: '22px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
                        🎖️ {userChosen.length > 0 ? 'Pinned Titles & Badges' : 'Featured Titles & Badges'}
                      </span>
                      <span style={{
                        fontSize: '10.5px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '1px 8px',
                        borderRadius: '10px',
                        color: 'rgba(255,255,255,0.7)',
                        fontWeight: 800
                      }}>
                        {showAllBadges ? `${sortedBadges.length} Total` : `${displayedBadges.length} of ${sortedBadges.length}`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSubTabChange('achievements')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent)',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: 0
                      }}
                    >
                      View All in Badges & XP <ExternalLink size={12} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%', alignItems: 'center' }}>
                    {displayedBadges.map(badgeName => {
                      const colors = BADGE_COLORS[badgeName] || { border: '1px solid var(--border)', color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.03)' };
                      return (
                        <span
                          key={badgeName}
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '4px 12px',
                            borderRadius: '14px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.2s ease',
                            ...colors
                          }}
                        >
                          {badgeName}
                        </span>
                      );
                    })}

                    {sortedBadges.length > BADGE_LIMIT && (
                      <button
                        type="button"
                        onClick={() => setShowAllBadges(!showAllBadges)}
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '4px 12px',
                          borderRadius: '14px',
                          background: showAllBadges ? 'rgba(255,255,255,0.08)' : 'rgba(136,8,8,0.18)',
                          border: showAllBadges ? '1px solid rgba(255,255,255,0.22)' : '1px solid rgba(136,8,8,0.4)',
                          color: showAllBadges ? '#fff' : 'var(--accent)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {showAllBadges ? (
                          <>Show Less <ChevronUp size={13} /></>
                        ) : (
                          <>+{remainingCount} more <ChevronDown size={13} /></>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

          </div>

          {/* FULL CINEMATIC SUB-NAV (MODERN FLOATING PILL BAR) */}
          <div className="profile-subnav" style={{
            display: 'flex',
            marginTop: '24px',
            background: 'rgba(15, 12, 22, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
            padding: '6px',
            gap: '4px',
            overflowX: 'auto',
            boxShadow: '0 8px 30px rgba(0,0,0,0.35)'
          }}>
            {[
              { id: 'overview', label: 'Overview', icon: Film },
              { id: 'stats', label: 'Statistics', icon: BarChart3 },
              { id: 'calendar', label: 'Watch Calendar', icon: Calendar },
              { id: 'wrapped', label: 'Yearly Wrapped', icon: Award },
              { id: 'achievements', label: 'Badges & XP', icon: Trophy },
              { id: 'constellation', label: 'Stars Map', icon: Sparkles },
              { id: 'shop', label: 'Shop & Quests', icon: Coins },
            ].map(tab => {
              const isActive = profileActiveSubTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSubTabChange(tab.id)}
                  style={{
                    background: isActive ? 'rgba(136,8,8,0.24)' : 'transparent',
                    border: isActive ? '1px solid rgba(136,8,8,0.55)' : '1px solid transparent',
                    padding: '11px 18px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: isActive ? 800 : 600,
                    whiteSpace: 'nowrap',
                    color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 0 18px rgba(136,8,8,0.3)' : 'none',
                    transition: 'all 0.18s ease'
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <Icon size={14} color={isActive ? 'var(--accent)' : 'currentColor'} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT */}
          <div style={{ padding: '28px 0', display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* ── OVERVIEW TAB ── */}
            {profileActiveSubTab === 'overview' && (
              <div className="profile-overview-columns" style={{ display: 'flex', gap: '24px', alignItems: 'start' }}>

                {/* LEFT COLUMN */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>

                  {/* Favorites Showcase */}
                  <div className="glass" style={{
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'linear-gradient(180deg, rgba(20,16,28,0.7) 0%, rgba(12,10,18,0.85) 100%)',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.4)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '10px',
                          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Heart size={16} color="var(--red)" fill="var(--red)" />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#fff' }}>Favorites Showcase</h3>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>Top 6 cinematic masterpieces</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenCustomizer('showcase')}
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: '20px',
                          padding: '6px 14px',
                          color: 'var(--accent)',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(136,8,8,0.15)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                      >
                        <Edit2 size={12} /> Edit Showcase Slots
                      </button>
                    </div>

                    <div className="profile-favorites-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
                      {Array.from({ length: 6 }).map((_, i) => {
                        const fav = (currentUser?.favorites || [])[i];
                        return (
                          <div
                            key={i}
                            style={{
                              borderRadius: '12px',
                              overflow: 'hidden',
                              border: fav ? '1px solid rgba(255,255,255,0.14)' : '1.5px dashed rgba(255,255,255,0.12)',
                              background: fav ? '#0a0812' : 'rgba(255,255,255,0.02)',
                              transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s ease, border-color 0.2s ease',
                              cursor: fav ? 'pointer' : 'default',
                              position: 'relative'
                            }}
                            onClick={() => {
                              if (fav && onMovieClick) onMovieClick(fav.tmdb_id || fav.id, fav.media_type);
                            }}
                            onMouseEnter={e => {
                              if (fav) {
                                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.6)';
                                e.currentTarget.style.borderColor = 'var(--accent)';
                              }
                            }}
                            onMouseLeave={e => {
                              if (fav) {
                                e.currentTarget.style.transform = '';
                                e.currentTarget.style.boxShadow = '';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
                              }
                            }}
                          >
                            <div style={{ aspectRatio: '2/3', position: 'relative', overflow: 'hidden' }}>
                              {fav ? (
                                <>
                                  <img
                                    src={`https://image.tmdb.org/t/p/w300${fav.poster_path}`}
                                    alt={fav.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    loading="lazy"
                                  />
                                  <div style={{
                                    position: 'absolute',
                                    top: '6px',
                                    left: '6px',
                                    background: 'rgba(0,0,0,0.7)',
                                    backdropFilter: 'blur(6px)',
                                    padding: '1px 6px',
                                    borderRadius: '6px',
                                    fontSize: '9.5px',
                                    fontWeight: 900,
                                    color: 'rgba(255,255,255,0.7)'
                                  }}>
                                    0{i + 1}
                                  </div>
                                  <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
                                    padding: '20px 8px 8px'
                                  }}>
                                    <div style={{ fontSize: '10px', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center', color: '#fff' }}>
                                      {fav.title}
                                    </div>
                                    {fav.score && (
                                      <div style={{ fontSize: '9.5px', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', fontWeight: 900, marginTop: '2px' }}>
                                        <Star size={10} fill="currentColor" /> {Number(fav.score).toFixed(1)}
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <div
                                  style={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    color: 'rgba(255,255,255,0.25)',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => handleOpenCustomizer('showcase')}
                                >
                                  <div style={{ fontSize: '18px', opacity: 0.5 }}>🎬</div>
                                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em' }}>Slot {i + 1}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {(currentUser?.favorites || []).length === 0 && (
                      <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px', marginTop: '16px' }}>
                        Click <strong>Edit Showcase Slots</strong> above to assign your 6 all-time favorite films.
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
                        <button onClick={() => handleSubTabChange('calendar')}
                          style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                          View calendar →
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', position: 'relative', paddingLeft: '14px', borderLeft: '2px solid rgba(136,8,8,0.12)' }}>
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
                                <span style={{ fontSize: '10px', background: 'rgba(136,8,8,0.1)', color: 'var(--accent)', borderRadius: '4px', padding: '2px 6px', marginLeft: '8px', fontWeight: 700 }}>
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
                                <span style={{ fontSize: '10px', background: 'rgba(192,57,43,0.1)', color: '#c0392b', borderRadius: '12px', padding: '1px 8px', fontWeight: 700 }}>
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
                                style={{ fontSize: '10.5px', color: 'var(--accent)', background: 'rgba(136,8,8,0.06)', border: '1px solid rgba(136,8,8,0.18)', borderRadius: '4px', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700, cursor: 'pointer' }}>
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
              <div className="animate-fade-in" style={{ width: '100%' }}>
                <StatsTab library={library} onMovieClick={onMovieClick} />
              </div>
            )}

            {/* ── WATCH CALENDAR TAB ── */}
            {profileActiveSubTab === 'calendar' && (
              <div className="animate-fade-in" style={{ width: '100%' }}>
                <WatchCalendarTab library={library} onMovieClick={onMovieClick} />
              </div>
            )}

            {/* ── YEARLY WRAPPED TAB ── */}
            {profileActiveSubTab === 'wrapped' && (
              <div className="animate-fade-in" style={{ width: '100%' }}>
                <WrappedTab library={library} />
              </div>
            )}

            {/* ── ACHIEVEMENTS & XP TAB ── */}
            {profileActiveSubTab === 'achievements' && (
              <div className="animate-fade-in" style={{ width: '100%' }}>
                <AchievementsTab library={library} currentUser={currentUser} onUpdateProfile={onUpdateProfile} />
              </div>
            )}

            {/* ── STARS MAP / CONSTELLATION TAB ── */}
            {profileActiveSubTab === 'constellation' && (
              <div className="animate-fade-in" style={{ width: '100%' }}>
                <ConstellationTab library={library} onMovieClick={onMovieClick} />
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
                            <span style={{ fontSize: '10px', background: quest.type === 'Daily' ? 'rgba(136,8,8,0.1)' : quest.type === 'Weekly' ? 'rgba(192,57,43,0.1)' : 'rgba(245,158,11,0.1)', color: quest.type === 'Daily' ? 'var(--accent)' : quest.type === 'Weekly' ? '#c0392b' : 'var(--gold)', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>{quest.type}</span>
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

                {/* 2. Exclusive Shop Borders */}
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
                            <button disabled className="btn" style={{ marginTop: 'auto', background: 'rgba(136,8,8,0.1)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '6px 0', fontSize: '12px', fontWeight: 800, borderRadius: '6px', cursor: 'default' }}>✓ Equipped</button>
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
                      { id: 'orchestral', name: '🎻 Epic Orchestral Chords', color: '#c0392b', desc: 'Swell tones from film score' },
                      { id: 'lofi', name: '🌧️ Lo-Fi Midnight Rain', color: '#c0392b', desc: 'Warm vinyl rainfall texture' }
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
          UPGRADED CINELOG STUDIO PROFILE CUSTOMIZER MODAL
          ───────────────────────────────────────────────────────────── */}
      <ProfileCustomizerModal
        show={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        currentUser={currentUser}
        onSave={handleSaveAll}
        library={library}
        watchedCount={watchedCount}
        avgRating={avgRating}
        cinePoints={cinePoints}
        isCreator={isCreator}
        unlockedBorders={unlockedBorders}
        unlockedBadges={unlockedBadges}
        sortedBadges={sortedBadges}
        favorites={favorites}
        setFavorites={setFavorites}
        onSelectSlot={idx => setSelectingSlotIdx(idx)}
        initialTab={customizerTab}
      />

      {/* ─────────────────────────────────────────────────────────────
          SHOWCASE SEARCH MODAL (PORTALED DIRECTLY TO BODY WITH HIGHEST Z-INDEX)
          ───────────────────────────────────────────────────────────── */}
      {selectingSlotIdx !== null && createPortal(
        <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', background: 'rgba(4,3,8,0.88)', backdropFilter: 'blur(16px)', zIndex: 9999999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', paddingTop: '10vh', overscrollBehavior: 'contain' }}
          onClick={() => { setSelectingSlotIdx(null); setSearchQuery(''); }}
          onWheel={e => e.stopPropagation()}>
          <div className="glass animate-fade-in-scale" style={{ width: '100%', maxWidth: '440px', maxHeight: '80vh', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: '#0d0b18', display: 'flex', flexDirection: 'column', padding: '20px', gap: '16px', boxShadow: '0 25px 70px rgba(0,0,0,0.95)', overscrollBehavior: 'contain' }}
            onClick={e => e.stopPropagation()}
            onWheel={e => e.stopPropagation()}>
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
        </div>,
        document.body
      )}

      {/* ─────────────────────────────────────────────────────────────
          SHARE CARD MODAL
          ───────────────────────────────────────────────────────────── */}
      {activeShareCard && createPortal(
        <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.88)', zIndex: 9999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(16px)', overscrollBehavior: 'contain' }}
          onClick={() => setActiveShareCard(null)}
          onWheel={e => e.stopPropagation()}>
          <div className="glass animate-fade-in-scale" style={{ width: '100%', maxWidth: '380px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)', background: 'rgba(10,8,19,0.98)', boxShadow: 'var(--shadow-xl)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overscrollBehavior: 'contain' }}
            onClick={e => e.stopPropagation()}
            onWheel={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>CineLog Chronicles</span>
              <button onClick={() => setActiveShareCard(null)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <div id="share-card-content" style={{ background: 'linear-gradient(135deg, rgba(136,8,8,0.12) 0%, rgba(192,57,43,0.06) 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', gap: '16px', position: 'relative' }}>
              {activeShareCard.poster_path && <img src={`https://image.tmdb.org/t/p/w92${activeShareCard.poster_path}`} alt="" style={{ width: '70px', height: '105px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)', flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>{activeShareCard.title}</h3>
                <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '2px' }}>{activeShareCard.release_year}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  {activeShareCard.rating && <span style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '13px' }}>★ {activeShareCard.rating}</span>}
                  {activeShareCard.is_rewatch && <span style={{ fontSize: '9px', background: 'rgba(192,57,43,0.1)', color: '#c0392b', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}> Rewatched</span>}
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

