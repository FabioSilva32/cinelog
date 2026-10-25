import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Heart, Calendar, Star, Film, Trophy, BarChart3, X,
  Search, Plus, Upload, Flame, Coins, ArrowLeft, SlidersHorizontal,
  Image as ImageIcon, Trash2, CheckCircle2, User, Award, Check, Edit2, Sparkles,
  ChevronDown, ChevronUp, Crown, ExternalLink, List, BookOpen, Layers,
  MessageSquare, Library, Bookmark
} from 'lucide-react';
import { ACHIEVEMENTS, BORDER_STYLES, BADGE_COLORS, getBadgeColors, isUserCreator } from '../utils/achievements';
import AvatarWithBorder, { DEFAULT_GREY_AVATAR } from './AvatarWithBorder';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { ELENA_PROFILE, ELENA_LIBRARY, TESTER_PROFILE, TESTER_LIBRARY } from '../mockData';
import { INITIAL_COMMUNITY_LISTS } from '../mockListsData';
import ListDetailModal from './ListDetailModal';
import CreateListModal from './CreateListModal';
import StatsTab from './StatsTab';
import WatchCalendarTab from './WatchCalendarTab';
import WrappedTab from './WrappedTab';
import AchievementsTab from './AchievementsTab';
import ConstellationTab from './ConstellationTab';
import ProfileCustomizerModal from './ProfileCustomizerModal';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { getEnhancedMovieTitle, enhanceMovie, normalizeSearchQuery } from '../utils/movieTitles';

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

// ── Letterboxd-style Reviews List View ──────────────────────────────
function ReviewsListView({ reviews = [], onMovieClick }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '50px 20px',
        color: 'var(--text-dim)',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        border: '1px dashed rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ fontSize: '38px', marginBottom: '10px' }}>✍️</div>
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>No Reviews Logged Yet</div>
        <div style={{ fontSize: '12.5px', opacity: 0.7 }}>Logged reviews, star ratings, and reflections will appear here in list format.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {reviews.map(m => {
        const cleanReview = (m.review || '')
          .replace(/__EPISODE_DATA__:.+$/s, '')
          .replace(/__EPISODE_RATINGS__:.+$/s, '')
          .trim();
        if (!cleanReview) return null;

        const dateStr = m.watch_date || m.date_added;
        const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }) : null;

        return (
          <div
            key={m.id || m.tmdb_id}
            onClick={() => onMovieClick && onMovieClick(m.tmdb_id, m.media_type || 'movie')}
            className="glass"
            style={{
              display: 'flex',
              gap: '18px',
              padding: '16px 20px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(20, 16, 28, 0.5) 100%)',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(229, 9, 20, 0.45)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Poster Thumbnail */}
            <div style={{
              width: '64px',
              aspectRatio: '2/3',
              borderRadius: '9px',
              overflow: 'hidden',
              flexShrink: 0,
              background: '#191522',
              position: 'relative',
              boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {m.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w185${m.poster_path}`}
                  alt={m.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🎬</div>
              )}
            </div>

            {/* Review Content */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', minWidth: 0 }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.2px' }}>
                    {m.title}
                  </h4>
                  {m.release_year && (
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>
                      ({m.release_year})
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {m.rating > 0 && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: 'var(--gold)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      padding: '2px 9px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 900
                    }}>
                      ★ {Number(m.rating).toFixed(1)}
                    </span>
                  )}
                  {formattedDate && (
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>
                      {formattedDate}
                    </span>
                  )}
                </div>
              </div>

              {/* Review Text Body */}
              <div style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.88)',
                lineHeight: 1.6,
                padding: '9px 13px',
                background: 'rgba(229, 9, 20, 0.05)',
                borderLeft: '3px solid var(--accent)',
                borderRadius: '0 8px 8px 0',
                marginTop: '4px',
                marginBottom: '8px',
                whiteSpace: 'pre-line'
              }}>
                "{cleanReview}"
              </div>

              {/* Tags & Favorite indicator if any */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {m.favorite && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '10.5px',
                      fontWeight: 800,
                      color: 'var(--red)',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '1px 7px',
                      borderRadius: '6px'
                    }}>
                      <Heart size={10} fill="currentColor" /> Favorite
                    </span>
                  )}
                  {(m.tags || []).slice(0, 4).map(t => (
                    <span key={t} style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: 'var(--text-dim)',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '1px 7px',
                      borderRadius: '6px'
                    }}>
                      #{t}
                    </span>
                  ))}
                </div>

                <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700 }}>
                  View Film Details →
                </span>
              </div>
            </div>
          </div>
        );
      })}
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

  // Foreign user profile sub-tab navigation
  const [foreignActiveTab, setForeignActiveTab] = useState('overview');
  const [foreignFilmsMode, setForeignFilmsMode] = useState('watched'); // 'watched' | 'watchlist'
  const [showAllForeignBadges, setShowAllForeignBadges] = useState(false);
  const [selectedBadgeModal, setSelectedBadgeModal] = useState(null);

  useEffect(() => {
    setForeignActiveTab('overview');
    setForeignFilmsMode('watched');
    setShowAllForeignBadges(false);
  }, [targetUser?.id, targetUser?.username]);

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
    (targetUser.username && targetUser.username.toLowerCase() !== currentUser?.username?.toLowerCase())
  );

  useEffect(() => {
    if (!isViewingOther) {
      setViewedProfile(null);
      setViewedLibrary([]);
      return;
    }
    setViewedLoading(true);

    // If current logged-in user is viewing their own profile via targetUser
    if (currentUser?.id && (targetUser?.id === currentUser?.id || (targetUser?.username && targetUser?.username.toLowerCase() === currentUser?.username.toLowerCase()))) {
      setViewedProfile(currentUser);
      setViewedLibrary((library || []).map(enhanceMovie));
      setViewedLoading(false);
      return;
    }

    if (targetUser?.id === ELENA_PROFILE.id || targetUser?.username === 'elena_films' || targetUser?.displayName === 'Elena Rodriguez') {
      setViewedProfile(ELENA_PROFILE);
      setViewedLibrary(ELENA_LIBRARY.map(enhanceMovie));
      setViewedLoading(false);
      return;
    }

    const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str || ''));
    const targetId = targetUser?.id;
    const targetUsername = targetUser?.username;

    if (supabase) {
      let profPromise;
      if (isUUID(targetId)) {
        profPromise = supabase.from('profiles').select('*').eq('id', targetId).maybeSingle();
      } else if (targetUsername) {
        profPromise = supabase.from('profiles').select('*').ilike('username', targetUsername).maybeSingle();
      } else {
        profPromise = Promise.resolve({ data: null, error: null });
      }

      profPromise.then(async ({ data: prof }) => {
        const resolvedUserId = prof?.id || (isUUID(targetId) ? targetId : null);
        let lib = [];
        let actData = [];
        if (resolvedUserId) {
          const [libRes, actRes] = await Promise.all([
            supabase
              .from('library')
              .select('*')
              .eq('user_id', resolvedUserId)
              .order('date_added', { ascending: false }),
            supabase
              .from('activity_feed')
              .select('title, media_type, created_at, action_type')
              .eq('user_id', resolvedUserId)
              .in('action_type', ['watched', 'rated', 'reviewed'])
              .order('created_at', { ascending: false })
          ]);
          lib = libRes.data || [];
          actData = actRes.data || [];
        }

        const actMap = {};
        for (const a of (actData || [])) {
          const key = (a.title || '').trim().toLowerCase();
          if (!actMap[key]) actMap[key] = a.created_at;
        }

        if (prof) {
          setViewedProfile({
            id: prof.id,
            username: prof.username || targetUser?.username,
            displayName: prof.display_name || prof.username || targetUser?.displayName || targetUser?.username,
            avatar: prof.avatar_url || targetUser?.avatar || DEFAULT_GREY_AVATAR,
            bio: prof.bio || '',
            favorites: prof.favorites || [],
            followersCount: prof.followers_count || 0,
            followingCount: prof.following_count || 0,
            equippedBorder: prof.equipped_border || 'none',
            bannerUrl: prof.banner_url || '',
            bannerFitMode: prof.banner_fit_mode || 'cover',
            bannerPosPercent: prof.banner_pos_percent ?? 20,
            featuredBadges: prof.featured_badges || [],
            purchasedBadges: prof.purchased_badges || [],
          });
        } else {
          setViewedProfile(targetUser);
        }

        const cleanLib = (lib || []).map(row => {
          let watchDate = row.watch_date;
          if (!watchDate && row.review) {
            try {
              const match = row.review.match(/__EPISODE_DATA__:(.+)$/s);
              if (match) {
                const parsed = JSON.parse(match[1]);
                if (parsed.watch_date) watchDate = parsed.watch_date;
                if (!watchDate && parsed.dates) {
                  const epDates = Object.values(parsed.dates).filter(Boolean).sort();
                  if (epDates.length) watchDate = epDates[epDates.length - 1];
                }
              }
            } catch {}
          }

          // Check if activity_feed has a newer log/rating timestamp
          const matchTitle = (row.title || '').trim().toLowerCase();
          const activityTimestamp = actMap[matchTitle];
          let effectiveWatchDate = watchDate || (row.status === 'watched' ? row.date_added : null);
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
            ...row,
            watch_date: effectiveWatchDate,
            date_added: effectiveDateAdded,
            title: getEnhancedMovieTitle(row) || row.title,
            review: (row.review || '').replace(/__EPISODE_DATA__:.+$/s, '').replace(/__EPISODE_RATINGS__:.+$/s, '').trim()
          };
        });
        setViewedLibrary(cleanLib);
        setViewedLoading(false);
      }).catch(err => {
        console.error('Error fetching viewed profile:', err);
        setViewedProfile(targetUser);
        setViewedLibrary([]);
        setViewedLoading(false);
      });

      // Follow status checked independently with UUID safety
      if (currentUser?.id && isUUID(currentUser.id) && isUUID(targetId)) {
        supabase.from('follows').select('*').match({ follower_id: currentUser.id, following_id: targetId }).maybeSingle()
          .then(({ data: followRel }) => setIsFollowing(!!followRel))
          .catch(() => setIsFollowing(false));
      } else {
        setIsFollowing(false);
      }
    } else {
      setViewedProfile(targetUser);
      setViewedLibrary([]);
      setViewedLoading(false);
    }
  }, [targetUser, isViewingOther, currentUser?.id, library]);

  // ── Custom Lists State (Letterboxd-style lists on Profile) ──
  const [lists, setLists] = useState(() => {
    try {
      const stored = localStorage.getItem('cinelog_community_lists_v2');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_COMMUNITY_LISTS;
  });
  const [selectedListModal, setSelectedListModal] = useState(null);
  const [showCreateListModal, setShowCreateListModal] = useState(false);

  // Sync latest custom_lists from Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadCloudLists() {
      if (!supabase || !isSupabaseConfigured) return;
      try {
        const { data, error } = await supabase
          .from('custom_lists')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0 && isMounted) {
          const mapped = data.map(row => ({
            id: row.id,
            user_id: row.user_id,
            title: row.title,
            description: row.description,
            coverImage: row.cover_image,
            isPublic: row.is_public,
            isRanked: row.is_ranked,
            entries: row.entries || [],
            tags: row.tags || [],
            likesCount: row.likes_count || 0,
            author: row.author_info || { id: row.user_id, username: 'cinephile' },
            createdAt: row.created_at
          }));

          setLists(prev => {
            const merged = [...mapped];
            prev.forEach(p => {
              if (!merged.some(m => String(m.id) === String(p.id))) merged.push(p);
            });
            try { localStorage.setItem('cinelog_community_lists_v2', JSON.stringify(merged)); } catch {}
            return merged;
          });
        }
      } catch (err) {
        console.warn('Error loading custom_lists in ProfileTab:', err);
      }
    }
    loadCloudLists();
    return () => { isMounted = false; };
  }, [currentUser?.id]);

  // Determine lists created by the profile being viewed
  const userCreatedLists = useMemo(() => {
    const target = isViewingOther ? viewedProfile : currentUser;
    if (!target) return [];

    const targetId = String(target.id || target.user_id || '');
    const targetUsername = String(target.username || '').toLowerCase();
    const isElena = targetUsername === 'elena_films' || target.displayName === 'Elena Rodriguez';

    return lists.filter(l => {
      const listUserId = String(l.user_id || l.author?.id || '');
      const listUsername = String(l.author?.username || '').toLowerCase();
      const listAuthorName = String(l.author?.displayName || '');

      if (targetId && listUserId === targetId) return true;
      if (targetUsername && listUsername === targetUsername) return true;
      if (isElena && (listUsername === 'elena_films' || listAuthorName === 'Elena Rodriguez')) return true;
      return false;
    });
  }, [lists, isViewingOther, viewedProfile, currentUser]);

  const handleSaveNewListFromProfile = async (newList) => {
    setLists(prev => {
      const next = [newList, ...prev];
      try { localStorage.setItem('cinelog_community_lists_v2', JSON.stringify(next)); } catch {}
      return next;
    });
    setSelectedListModal(newList);

    if (currentUser?.id && supabase && isSupabaseConfigured) {
      try {
        await supabase.from('custom_lists').upsert({
          id: String(newList.id),
          user_id: currentUser.id,
          title: newList.title,
          description: newList.description || '',
          cover_image: newList.coverImage || null,
          is_public: newList.isPublic !== false,
          is_ranked: !!newList.isRanked,
          entries: newList.entries || [],
          tags: newList.tags || [],
          likes_count: newList.likesCount || 0,
          author_info: newList.author || {
            id: currentUser.id,
            username: currentUser.username,
            displayName: currentUser.displayName,
            avatar: currentUser.avatar
          }
        });
      } catch (e) {
        console.warn('Could not save custom_list to Supabase from Profile:', e);
      }
    }
  };

  const handleUpdateListFromProfile = async (updatedList) => {
    setLists(prev => {
      const next = prev.map(l => l.id === updatedList.id ? updatedList : l);
      try { localStorage.setItem('cinelog_community_lists_v2', JSON.stringify(next)); } catch {}
      return next;
    });
    if (selectedListModal && selectedListModal.id === updatedList.id) {
      setSelectedListModal(updatedList);
    }
    if (currentUser?.id && supabase && isSupabaseConfigured) {
      try {
        await supabase.from('custom_lists').update({
          title: updatedList.title,
          description: updatedList.description || '',
          cover_image: updatedList.coverImage || null,
          is_public: updatedList.isPublic !== false,
          is_ranked: !!updatedList.isRanked,
          entries: updatedList.entries || [],
          tags: updatedList.tags || [],
          likes_count: updatedList.likesCount || 0,
          updated_at: new Date().toISOString()
        }).eq('id', String(updatedList.id)).eq('user_id', currentUser.id);
      } catch (e) {
        console.warn('Could not update custom_list in Supabase:', e);
      }
    }
  };

  const handleDeleteListFromProfile = async (listId) => {
    setLists(prev => {
      const next = prev.filter(l => l.id !== listId);
      try { localStorage.setItem('cinelog_community_lists_v2', JSON.stringify(next)); } catch {}
      return next;
    });
    if (selectedListModal && selectedListModal.id === listId) {
      setSelectedListModal(null);
    }
    if (currentUser?.id && supabase && isSupabaseConfigured) {
      try {
        await supabase.from('custom_lists').delete().eq('id', String(listId)).eq('user_id', currentUser.id);
      } catch (e) {
        console.warn('Could not delete custom_list from Supabase:', e);
      }
    }
  };

  // TMDB backdrop search in studio modal
  const handleTmdbSearch = async (e) => {
    e?.preventDefault();
    if (!tmdbSearchQuery.trim()) return;
    setTmdbSearching(true);
    try {
      const q = normalizeSearchQuery(tmdbSearchQuery);
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}&page=1`);
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
        if (onOpenUserProfile) onOpenUserProfile(null);
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
    const list = [];
    library.filter(m => m.status === 'watched').forEach(m => {
      const scr = m.screenings || m.episode_data?.screenings;
      if (Array.isArray(scr) && scr.length > 1) {
        scr.forEach((s, idx) => {
          list.push({
            ...m,
            id: `${m.id || m.tmdb_id}_scr_${s.id || idx}`,
            watch_date: s.date || m.watch_date,
            rating: s.rating != null ? s.rating : m.rating,
            review: s.review || m.review,
            is_rewatch: (scr.length - idx) > 1 || s.is_rewatch
          });
        });
      } else if (m.watch_date || m.date_added) {
        list.push(m);
      }
    });
    return list.sort((a, b) => new Date(b.watch_date || b.date_added) - new Date(a.watch_date || a.date_added));
  }, [library]);

  // Streak & CinePoints
  const currentStreak = useMemo(() => {
    const watchDates = new Set();
    library.filter(m => m.status === 'watched').forEach(m => {
      const scr = m.screenings || m.episode_data?.screenings;
      if (Array.isArray(scr) && scr.length > 0) {
        scr.forEach(s => {
          if (s.date) watchDates.add(s.date.split('T')[0]);
        });
      }
      if (m.watch_date || m.date_added) {
        watchDates.add((m.watch_date || m.date_added).split('T')[0]);
      }
    });
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
      const purchased = currentUser?.purchasedBadges || currentUser?.purchased_badges || [];
      purchased.forEach(b => earned.push(b));
      const featured = currentUser?.featuredBadges || currentUser?.featured_badges || [];
      featured.forEach(b => earned.push(b));
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

  const isViewedCreator = useMemo(() => isUserCreator(viewedProfile), [viewedProfile]);

  const viewedWatched = useMemo(() => {
    return viewedLibrary
      .filter(m => m.status === 'watched')
      .map(enhanceMovie)
      .sort((a, b) => {
        const timeB = new Date(b.watch_date || b.date_added || b.created_at || 0).getTime() || 0;
        const timeA = new Date(a.watch_date || a.date_added || a.created_at || 0).getTime() || 0;
        if (timeB !== timeA) return timeB - timeA;
        return (b.id || '').localeCompare(a.id || '');
      });
  }, [viewedLibrary]);

  const viewedWatchlist = useMemo(() => {
    return viewedLibrary
      .filter(m => m.status === 'plan_to_watch')
      .map(enhanceMovie)
      .sort((a, b) => {
        const timeB = new Date(b.date_added || b.created_at || 0).getTime() || 0;
        const timeA = new Date(a.date_added || a.created_at || 0).getTime() || 0;
        if (timeB !== timeA) return timeB - timeA;
        return (b.id || '').localeCompare(a.id || '');
      });
  }, [viewedLibrary]);

  const viewedReviewsList = useMemo(() => {
    return viewedLibrary
      .filter(m => m.review && m.review.trim().length > 0)
      .sort((a, b) => {
        const timeB = new Date(b.watch_date || b.date_added || 0).getTime() || 0;
        const timeA = new Date(a.watch_date || a.date_added || 0).getTime() || 0;
        if (timeB !== timeA) return timeB - timeA;
        return (b.id || '').localeCompare(a.id || '');
      });
  }, [viewedLibrary]);

  const viewedPublicLists = useMemo(() => userCreatedLists.filter(l => l.isPublic !== false), [userCreatedLists]);

  const viewedBadges = useMemo(() => {
    const earned = [];
    if (isViewedCreator) {
      // 👑 Creator account automatically unlocks all title badges!
      Object.keys(BADGE_COLORS).forEach(b => earned.push(b));
    } else {
      ACHIEVEMENTS.forEach(ach => {
        if (ach.check(viewedLibrary) >= ach.target) {
          if (ach.reward.badgeName) earned.push(ach.reward.badgeName);
        }
      });
      const purchased = viewedProfile?.purchasedBadges || viewedProfile?.purchased_badges || [];
      const featured = viewedProfile?.featuredBadges || [];
      return Array.from(new Set([...featured, ...purchased, ...earned]));
    }
    return Array.from(new Set(earned));
  }, [viewedLibrary, viewedProfile, isViewedCreator]);

  const ownReviews = useMemo(() => library.filter(m => m.review && m.review.trim().length > 0).sort((a, b) => new Date(b.watch_date || b.date_added || 0) - new Date(a.watch_date || a.date_added || 0)), [library]);

  return (
    <div className="animate-fade-in profile-tab-root" style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>

      {/* ─────────────────────────────────────────────────────────────
          OTHER USER PROFILE — Letterboxd full-page view
          ───────────────────────────────────────────────────────────── */}
      {isViewingOther ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {viewedLoading ? (
            <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              Loading profile...
            </div>
          ) : (
            <div>
              {/* BANNER (Same grand marquee as normal profile) */}
              <div
                className="profile-banner"
                style={{
                  height: 'clamp(200px, 28vw, 360px)',
                  width: '100%',
                  borderRadius: '24px 24px 0 0',
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
                    onError={e => { e.currentTarget.style.display = 'none'; }}
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

                {/* Follow / Following button on top-right of banner */}
                {currentUser?.id && (
                  <button
                    type="button"
                    onClick={handleToggleFollow}
                    disabled={followLoading}
                    className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                    style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      zIndex: 15,
                      borderRadius: '30px',
                      padding: '9px 24px',
                      fontSize: '13px',
                      fontWeight: 800,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                      cursor: 'pointer'
                    }}
                  >
                    {followLoading ? '…' : isFollowing ? 'Following' : '+ Follow'}
                  </button>
                )}
              </div>

              {/* PROFILE HEADER ROW (Same Polished Studio Card as normal profile) */}
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
                      filter: isViewedCreator ? 'drop-shadow(0 0 22px rgba(251,191,36,0.35))' : 'drop-shadow(0 12px 26px rgba(0,0,0,0.85))'
                    }}>
                      <AvatarWithBorder
                        src={viewedProfile?.avatar || DEFAULT_GREY_AVATAR}
                        username={viewedProfile?.username || 'User'}
                        borderId={viewedProfile?.equippedBorder || 'none'}
                        size={118}
                      />
                    </div>

                    <div style={{ paddingTop: '16px', minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2 }}>
                          {viewedProfile?.displayName || viewedProfile?.username || 'CineLog Fan'}
                        </h2>
                        {isViewedCreator && (
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
                        @{viewedProfile?.username || 'user'}
                      </div>

                      <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, maxWidth: '580px', margin: 0 }}>
                        {viewedProfile?.bio || 'No cinema story written yet.'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Modern Frosted Stat Capsules (Identical to normal profile) */}
                  <div className="profile-stats-capsules-grid">
                    {[
                      { label: 'Films', val: viewedWatched.length, color: 'var(--green)' },
                      { label: 'Reviews', val: viewedReviewsList.length, color: 'var(--accent)' },
                      { label: 'Favorites', val: (viewedProfile?.favorites || []).filter(Boolean).length, color: 'var(--red)' },
                      { label: 'Watchlist', val: viewedWatchlist.length, color: '#60a5fa' },
                      { label: 'Followers', val: viewedProfile?.followersCount || 0, color: '#fbbf24' },
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

                {/* BADGES RIBBON */}
                {(() => {
                  const allBadges = viewedBadges;
                  if (allBadges.length === 0) return null;

                  const featured = viewedProfile?.featuredBadges || [];
                  const userChosen = featured.filter(b => allBadges.includes(b));
                  const effective = userChosen.length > 0 ? userChosen : allBadges;
                  const displayedBadges = showAllForeignBadges ? allBadges : effective.slice(0, 5);

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
                            {showAllForeignBadges ? `${allBadges.length} Total` : `${displayedBadges.length} of ${allBadges.length}`}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button
                            type="button"
                            onClick={() => setForeignActiveTab('badges')}
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
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        {displayedBadges.map(b => {
                          const colors = getBadgeColors(b);
                          return (
                            <button
                              key={b}
                              type="button"
                              onClick={() => setSelectedBadgeModal(b)}
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
                                cursor: 'pointer',
                                background: colors.background,
                                backgroundColor: colors.background,
                                color: colors.color,
                                border: colors.border
                              }}
                              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                              onMouseLeave={e => e.currentTarget.style.transform = ''}
                              title={`Click to view details for ${b}`}
                            >
                              🎖️ {b}
                            </button>
                          );
                        })}

                        {allBadges.length > 5 && (
                          <button
                            type="button"
                            onClick={() => setShowAllForeignBadges(!showAllForeignBadges)}
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '4px 12px',
                              borderRadius: '14px',
                              background: showAllForeignBadges ? 'rgba(255,255,255,0.08)' : 'rgba(136,8,8,0.18)',
                              border: showAllForeignBadges ? '1px solid rgba(255,255,255,0.22)' : '1px solid rgba(136,8,8,0.4)',
                              color: showAllForeignBadges ? '#fff' : 'var(--accent)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {showAllForeignBadges ? 'Show Less' : `+${allBadges.length - 5} More`}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* FOREIGN PROFILE SUBNAV PILL BAR */}
              <div className="profile-subnav" style={{
                display: 'flex',
                marginTop: '20px',
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
                  { id: 'films', label: `Films (${viewedWatched.length + viewedWatchlist.length})`, icon: Library },
                  { id: 'reviews', label: `Reviews (${viewedReviewsList.length})`, icon: MessageSquare },
                  { id: 'lists', label: `Lists (${viewedPublicLists.length})`, icon: List },
                  { id: 'stats', label: 'Statistics', icon: BarChart3 },
                  { id: 'badges', label: `Badges & XP (${viewedBadges.length})`, icon: Trophy },
                ].map(tab => {
                  const isActive = foreignActiveTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setForeignActiveTab(tab.id)}
                      style={{
                        background: isActive ? 'rgba(136,8,8,0.24)' : 'transparent',
                        border: isActive ? '1px solid rgba(136,8,8,0.55)' : '1px solid transparent',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: isActive ? 800 : 600,
                        whiteSpace: 'nowrap',
                        color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                        flexShrink: 0
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          e.currentTarget.style.color = '#fff';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
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

              {/* FOREIGN PROFILE TAB CONTENT */}
              <div className="profile-tab-content" style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '28px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>

                {/* ── 1. FOREIGN OVERVIEW TAB (Letterboxd 2-Column Split) ── */}
                {foreignActiveTab === 'overview' && (
                  <div className="profile-overview-columns animate-fade-in" style={{ display: 'flex', gap: '24px', alignItems: 'start' }}>

                    {/* LEFT COLUMN: Showcase + Recents */}
                    <div className="profile-overview-main-col" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>

                      {/* Top Favorites Showcase (Exact match with own profile showcase) */}
                      <div className="glass profile-showcase-card" style={{
                        borderRadius: '20px',
                        padding: '24px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'linear-gradient(180deg, rgba(20,16,28,0.7) 0%, rgba(12,10,18,0.85) 100%)',
                        boxShadow: '0 12px 36px rgba(0,0,0,0.4)'
                      }}>
                        <div className="profile-showcase-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                          <div className="profile-showcase-title-group" style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '10px',
                              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                              <Heart size={16} color="var(--red)" fill="var(--red)" />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Favorites Showcase</h3>
                              <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>Top 6 cinematic masterpieces</span>
                            </div>
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 700, flexShrink: 0 }}>
                            {(viewedProfile?.favorites || []).filter(Boolean).length} titles
                          </span>
                        </div>

                        <div className="profile-favorites-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
                          {Array.from({ length: 6 }).map((_, i) => {
                            const fav = (viewedProfile?.favorites || [])[i];
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
                                        onError={e => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
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
                                        color: 'rgba(255,255,255,0.25)'
                                      }}
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
                      </div>

                      {/* Recent Watched Preview */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Library size={17} color="var(--accent)" />
                            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#fff' }}>Recent Films</h3>
                          </div>
                          {viewedWatched.length > 0 && (
                            <button
                              onClick={() => {
                                setForeignActiveTab('films');
                                setForeignFilmsMode('watched');
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--accent)',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              See All ({viewedWatched.length}) →
                            </button>
                          )}
                        </div>

                        {viewedWatched.length === 0 ? (
                          <div className="glass" style={{ textAlign: 'center', padding: '36px 20px', borderRadius: '16px', color: 'var(--text-dim)', fontSize: '13px' }}>
                            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎬</div>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>No watched films yet</div>
                            <div>This user hasn't logged any films yet.</div>
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                            {viewedWatched.slice(0, 6).map(m => (
                              <div key={m.id || m.tmdb_id} onClick={() => onMovieClick && onMovieClick(m.tmdb_id, m.media_type)}
                                style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-solid)', cursor: 'pointer', transition: 'transform 0.15s, border-color 0.15s' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.borderColor = 'rgba(136,8,8,0.5)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}
                              >
                                <div style={{ aspectRatio: '2/3', position: 'relative', background: '#1a1030', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🎬</div>
                                  {m.poster_path && (
                                    <img
                                      src={`https://image.tmdb.org/t/p/w300${m.poster_path}`}
                                      alt={getEnhancedMovieTitle(m) || m.title}
                                      style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', objectFit: 'cover' }}
                                      loading="lazy"
                                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                                    />
                                  )}
                                  {m.rating > 0 && <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.85)', color: 'var(--gold)', fontSize: '10px', fontWeight: 900, padding: '2px 6px', borderRadius: '4px' }}>★ {Number(m.rating).toFixed(1)}</div>}
                                </div>
                                <div style={{ padding: '7px 8px' }}>
                                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={getEnhancedMovieTitle(m) || m.title}>
                                    {getEnhancedMovieTitle(m) || m.title}
                                  </div>
                                  <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{m.release_year || ''}</span>
                                    {(m.watch_date || m.date_added) && (
                                      <span style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.45)' }}>{formatRelativeDate(m.watch_date || m.date_added)}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Recent Reviews Preview */}
                      {viewedReviewsList.length > 0 && (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <MessageSquare size={17} color="var(--accent)" />
                              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#fff' }}>Recent Reviews</h3>
                            </div>
                            <button
                              onClick={() => setForeignActiveTab('reviews')}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--accent)',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              See All ({viewedReviewsList.length}) →
                            </button>
                          </div>
                          <ReviewsListView reviews={viewedReviewsList.slice(0, 3)} onMovieClick={onMovieClick} />
                        </div>
                      )}

                      {/* Lists Preview */}
                      {viewedPublicLists.length > 0 && (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <List size={17} color="var(--accent)" />
                              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#fff' }}>Lists by {viewedProfile?.displayName || viewedProfile?.username}</h3>
                            </div>
                            <button
                              onClick={() => setForeignActiveTab('lists')}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--accent)',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              See All ({viewedPublicLists.length}) →
                            </button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                            {viewedPublicLists.slice(0, 2).map(list => {
                              const entries = list.entries || [];
                              const previewPosters = entries.filter(e => e.poster_path).slice(0, 5);
                              return (
                                <div
                                  key={list.id}
                                  onClick={() => setSelectedListModal(list)}
                                  className="glass"
                                  style={{
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                                    background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'rgba(136,8,8,0.45)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#fff', margin: 0 }}>{list.title}</h4>
                                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{entries.length} films</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '2px 0 10px', overflow: 'hidden' }}>
                                    {previewPosters.map((movie, idx) => (
                                      <div key={movie.tmdb_id || idx} style={{ flex: '1 1 0', aspectRatio: '2/3', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#191522' }}>
                                        <img src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      </div>
                                    ))}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', fontSize: '11px', color: 'var(--text-dim)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <Heart size={12} color="var(--red)" fill="var(--red)" /> {list.likesCount || 0}
                                    </span>
                                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>View list →</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN: Letterboxd-style Statistics Sidebar */}
                    <div className="profile-overview-side-col" style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

                      {/* Genre Breakdown */}
                      <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '20px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                          <BarChart3 size={16} color="var(--accent)" />
                          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>Genre Breakdown</h3>
                        </div>
                        {viewedLibrary.length > 0 ? (
                          <MiniGenreChart library={viewedLibrary} />
                        ) : (
                          <div style={{ color: 'var(--text-muted)', fontSize: '12.5px', textAlign: 'center', padding: '20px' }}>
                            Add movies to see genre breakdown
                          </div>
                        )}
                      </div>

                      {/* Rating Distribution */}
                      <RatingDistributionChart library={viewedLibrary} />

                      {/* Cinema Quick Stats Summary */}
                      <div className="glass" style={{
                        borderRadius: 'var(--radius-xl)',
                        padding: '20px',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Award size={16} color="var(--gold)" />
                          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>Cinema Footprint</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>Hours Logged</div>
                            <div style={{ fontSize: '17px', fontWeight: 900, color: 'var(--accent)', marginTop: '2px' }}>
                              ~{Math.round(viewedWatched.length * 1.9)} hrs
                            </div>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>Completion</div>
                            <div style={{ fontSize: '17px', fontWeight: 900, color: 'var(--green)', marginTop: '2px' }}>
                              {viewedWatched.length + viewedWatchlist.length > 0
                                ? `${Math.round((viewedWatched.length / (viewedWatched.length + viewedWatchlist.length)) * 100)}%`
                                : '0%'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setForeignActiveTab('stats')}
                          className="btn btn-secondary"
                          style={{
                            width: '100%',
                            fontSize: '12px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            marginTop: '4px'
                          }}
                        >
                          <BarChart3 size={13} /> Full Letterboxd Stats →
                        </button>
                      </div>

                    </div>

                  </div>
                )}

                {/* ── 2. FOREIGN FILMS TAB (WATCHED / WATCHLIST TOGGLE) ── */}
                {foreignActiveTab === 'films' && (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {foreignFilmsMode === 'watched' ? <Library size={18} color="var(--accent)" /> : <Bookmark size={18} color="var(--blue)" />}
                        <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#fff' }}>
                          {foreignFilmsMode === 'watched' ? 'Watched History' : 'Watchlist (Plan to Watch)'}
                        </h3>
                        <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 700 }}>
                          {foreignFilmsMode === 'watched' ? `${viewedWatched.length} films` : `${viewedWatchlist.length} films`}
                        </span>
                      </div>

                      {/* Segmented Switcher for Watched vs Watchlist */}
                      <div style={{
                        display: 'inline-flex',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '3px',
                        gap: '4px'
                      }}>
                        <button
                          type="button"
                          onClick={() => setForeignFilmsMode('watched')}
                          style={{
                            background: foreignFilmsMode === 'watched' ? 'rgba(136,8,8,0.35)' : 'transparent',
                            border: foreignFilmsMode === 'watched' ? '1px solid rgba(136,8,8,0.6)' : '1px solid transparent',
                            color: foreignFilmsMode === 'watched' ? '#fff' : 'var(--text-muted)',
                            padding: '6px 14px',
                            borderRadius: '9px',
                            fontSize: '12.5px',
                            fontWeight: foreignFilmsMode === 'watched' ? 800 : 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Library size={13} />
                          Watched ({viewedWatched.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setForeignFilmsMode('watchlist')}
                          style={{
                            background: foreignFilmsMode === 'watchlist' ? 'rgba(56,189,248,0.22)' : 'transparent',
                            border: foreignFilmsMode === 'watchlist' ? '1px solid rgba(56,189,248,0.5)' : '1px solid transparent',
                            color: foreignFilmsMode === 'watchlist' ? '#fff' : 'var(--text-muted)',
                            padding: '6px 14px',
                            borderRadius: '9px',
                            fontSize: '12.5px',
                            fontWeight: foreignFilmsMode === 'watchlist' ? 800 : 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Bookmark size={13} />
                          Watchlist ({viewedWatchlist.length})
                        </button>
                      </div>
                    </div>

                    {/* Content Grid */}
                    {(() => {
                      const activeList = foreignFilmsMode === 'watched' ? viewedWatched : viewedWatchlist;
                      if (activeList.length === 0) {
                        return (
                          <div className="glass" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '20px', color: 'var(--text-dim)' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>{foreignFilmsMode === 'watched' ? '🎬' : '📋'}</div>
                            <div style={{ fontWeight: 800, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>
                              {foreignFilmsMode === 'watched' ? 'No watched films yet' : 'Watchlist is empty'}
                            </div>
                            <div style={{ fontSize: '13px' }}>
                              {foreignFilmsMode === 'watched'
                                ? "This user hasn't logged any films in their watched history."
                                : "This user doesn't have any films saved to their watchlist yet."}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '14px' }}>
                          {activeList.map(m => (
                            <div key={m.id || m.tmdb_id} onClick={() => onMovieClick && onMovieClick(m.tmdb_id, m.media_type)}
                              style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-solid)', cursor: 'pointer', transition: 'transform 0.15s, border-color 0.15s, box-shadow 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(136,8,8,0.5)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)'; }}
                              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = ''; }}
                            >
                              <div style={{ aspectRatio: '2/3', position: 'relative', background: '#1a1030', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🎬</div>
                                {m.poster_path && (
                                  <img
                                    src={`https://image.tmdb.org/t/p/w300${m.poster_path}`}
                                    alt={getEnhancedMovieTitle(m) || m.title}
                                    style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', objectFit: 'cover' }}
                                    loading="lazy"
                                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                                  />
                                )}
                                {m.rating > 0 && (
                                  <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', color: 'var(--gold)', fontSize: '10.5px', fontWeight: 900, padding: '2px 7px', borderRadius: '5px' }}>
                                    ★ {Number(m.rating).toFixed(1)}
                                  </div>
                                )}
                              </div>
                              <div style={{ padding: '8px 10px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={getEnhancedMovieTitle(m) || m.title}>
                                  {getEnhancedMovieTitle(m) || m.title}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                                  <span>{m.release_year || ''}</span>
                                  {(m.watch_date || m.date_added) && (
                                    <span style={{ fontSize: '10px' }}>{formatRelativeDate(m.watch_date || m.date_added)}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* ── 3. FOREIGN REVIEWS TAB (LIST STYLE) ── */}
                {foreignActiveTab === 'reviews' && (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquare size={18} color="var(--accent)" />
                        <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#fff' }}>Reviews by {viewedProfile?.displayName || viewedProfile?.username}</h3>
                        <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 700 }}>{viewedReviewsList.length} reviews</span>
                      </div>
                    </div>

                    <ReviewsListView reviews={viewedReviewsList} onMovieClick={onMovieClick} />
                  </div>
                )}

                {/* ── 4. FOREIGN LISTS TAB ── */}
                {foreignActiveTab === 'lists' && (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <List size={18} color="var(--accent)" />
                        <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#fff' }}>Curated Lists</h3>
                        <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 700 }}>{viewedPublicLists.length} public lists</span>
                      </div>
                    </div>

                    {viewedPublicLists.length === 0 ? (
                      <div className="glass" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '20px', color: 'var(--text-dim)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📚</div>
                        <div style={{ fontWeight: 800, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>No lists created yet</div>
                        <div style={{ fontSize: '13px' }}>This user hasn't published any public movie lists.</div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                        {viewedPublicLists.map(list => {
                          const entries = list.entries || [];
                          const previewPosters = entries.filter(e => e.poster_path).slice(0, 5);
                          return (
                            <div
                              key={list.id}
                              onClick={() => setSelectedListModal(list)}
                              className="glass"
                              style={{
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.08)',
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'rgba(136,8,8,0.45)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#fff', margin: 0 }}>{list.title}</h4>
                                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{entries.length} films</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '2px 0 10px', overflow: 'hidden' }}>
                                {previewPosters.map((movie, idx) => (
                                  <div key={movie.tmdb_id || idx} style={{ flex: '1 1 0', aspectRatio: '2/3', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#191522' }}>
                                    <img src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  </div>
                                ))}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', fontSize: '11px', color: 'var(--text-dim)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Heart size={12} color="var(--red)" fill="var(--red)" /> {list.likesCount || 0}
                                </span>
                                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>View list →</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ── 5. FOREIGN STATISTICS TAB (LETTERBOXD STATS) ── */}
                {foreignActiveTab === 'stats' && (
                  <div className="animate-fade-in">
                    <StatsTab library={viewedLibrary} onMovieClick={onMovieClick} />
                  </div>
                )}

                {/* ── 6. FOREIGN BADGES & ACHIEVEMENTS TAB ── */}
                {foreignActiveTab === 'badges' && (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Unlocked Title Badges Showcase */}
                    <div className="glass" style={{
                      borderRadius: '20px',
                      padding: '24px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'linear-gradient(135deg, rgba(20,16,30,0.85) 0%, rgba(12,10,18,0.95) 100%)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Trophy size={18} color="var(--gold)" />
                          <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#fff' }}>Unlocked Title Badges ({viewedBadges.length})</h3>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Click any badge to view milestone requirements</span>
                      </div>

                      {viewedBadges.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-dim)', fontSize: '13px' }}>
                          No title badges unlocked yet.
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '12px' }}>
                          {viewedBadges.map(badge => {
                            const colors = getBadgeColors(badge);
                            const ach = ACHIEVEMENTS.find(a => a.reward?.badgeName === badge);
                            return (
                              <div
                                key={badge}
                                onClick={() => setSelectedBadgeModal(badge)}
                                className="glass"
                                style={{
                                  padding: '14px 16px',
                                  borderRadius: '14px',
                                  border: colors.border,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  background: colors.background,
                                  backgroundColor: colors.background,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = colors.color || 'var(--accent)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                              >
                                <div style={{ fontSize: '22px' }}>🎖️</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: colors.color || '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {badge}
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {ach ? ach.title : 'Prestige Milestone'}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Full Achievements Breakdown */}
                    <AchievementsTab
                      library={viewedLibrary}
                      currentUser={viewedProfile}
                      readOnly={true}
                    />
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
        <div className="profile-tab-root" style={{ display: 'flex', flexDirection: 'column', gap: '0', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>

          {/* BANNER (grand cinematic marquee with fallback ambiance) */}
          <div
            className="profile-banner"
            style={{
              height: 'clamp(200px, 28vw, 360px)',
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
                      const colors = getBadgeColors(badgeName);
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
                            background: colors.background,
                            backgroundColor: colors.background,
                            color: colors.color,
                            border: colors.border
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
              { id: 'reviews', label: `Reviews (${reviewsCount})`, icon: MessageSquare },
              { id: 'lists', label: `Lists (${userCreatedLists.length})`, icon: List },
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
          <div className="profile-tab-content" style={{ padding: '28px 0', display: 'flex', flexDirection: 'column', gap: '28px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>

            {/* ── OVERVIEW TAB ── */}
            {profileActiveSubTab === 'overview' && (
              <div className="profile-overview-columns" style={{ display: 'flex', gap: '24px', alignItems: 'start' }}>

                {/* LEFT COLUMN */}
                <div className="profile-overview-main-col" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>

                  {/* Favorites Showcase */}
                  <div className="glass profile-showcase-card" style={{
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'linear-gradient(180deg, rgba(20,16,28,0.7) 0%, rgba(12,10,18,0.85) 100%)',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.4)'
                  }}>
                    <div className="profile-showcase-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div className="profile-showcase-title-group" style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '10px',
                          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          <Heart size={16} color="var(--red)" fill="var(--red)" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Favorites Showcase</h3>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>Top 6 cinematic masterpieces</span>
                        </div>
                      </div>
                      <button
                        className="profile-showcase-edit-btn"
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
                    <div className="glass profile-diary-card" style={{ borderRadius: 'var(--radius-xl)', padding: '20px', border: '1px solid var(--border)' }}>
                      <div className="profile-diary-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
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
                          <div key={item.id || item.tmdb_id} className="profile-diary-item" style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '9px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px', transition: 'background 0.2s', cursor: 'pointer' }}
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
                <div className="profile-overview-side-col" style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

            {/* ── LISTS TAB (Letterboxd-style lists on Profile) ── */}
            {profileActiveSubTab === 'lists' && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <List size={20} color="var(--accent)" />
                      <h3 style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.3px', margin: 0, color: '#fff' }}>
                        My Lists
                      </h3>
                      <span style={{
                        background: 'rgba(136,8,8,0.18)',
                        border: '1px solid rgba(136,8,8,0.4)',
                        color: 'var(--accent)',
                        borderRadius: '20px',
                        padding: '2px 9px',
                        fontSize: '11px',
                        fontWeight: 800
                      }}>
                        {userCreatedLists.length}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                      Letterboxd-style custom lists, rankings, and marathon watchlists you've created.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowCreateListModal(true)}
                    className="btn btn-primary"
                    style={{
                      padding: '9px 18px',
                      borderRadius: '50px',
                      gap: '8px',
                      fontSize: '13px',
                      fontWeight: 800,
                      boxShadow: '0 6px 20px rgba(136,8,8,0.3)',
                      flexShrink: 0
                    }}
                  >
                    <Plus size={15} /> Create New List
                  </button>
                </div>

                {userCreatedLists.length === 0 ? (
                  <div className="glass" style={{
                    borderRadius: '20px',
                    padding: '48px 24px',
                    textAlign: 'center',
                    border: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.015)'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                    <h4 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 8px', color: '#fff' }}>
                      No Lists Created Yet
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                      Rank your all-time favorites, curate director filmographies, or build themed marathons with custom notes for every movie.
                    </p>
                    <button
                      onClick={() => setShowCreateListModal(true)}
                      className="btn btn-primary"
                      style={{ padding: '9px 22px', borderRadius: '50px', fontSize: '13px', fontWeight: 800 }}
                    >
                      <Plus size={15} style={{ marginRight: '6px' }} /> Create Your First List
                    </button>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '20px'
                  }}>
                    {userCreatedLists.map(list => {
                      const entries = list.entries || [];
                      const previewPosters = entries.filter(e => e.poster_path).slice(0, 5);

                      return (
                        <div
                          key={list.id}
                          onClick={() => setSelectedListModal(list)}
                          className="glass"
                          style={{
                            borderRadius: '18px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            padding: '18px',
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                            position: 'relative'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'rgba(136,8,8,0.45)';
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,0,0,0.55)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '';
                          }}
                        >
                          {/* List Status & Entry Badges */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {list.isRanked && (
                                <span style={{
                                  background: 'rgba(245, 158, 11, 0.14)',
                                  color: 'var(--gold)',
                                  border: '1px solid rgba(245, 158, 11, 0.3)',
                                  borderRadius: '6px',
                                  padding: '2px 7px',
                                  fontSize: '10px',
                                  fontWeight: 800
                                }}>
                                  🏆 RANKED
                                </span>
                              )}
                              <span style={{
                                background: list.isPublic !== false ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
                                color: list.isPublic !== false ? 'var(--green)' : 'var(--text-dim)',
                                border: `1px solid ${list.isPublic !== false ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}`,
                                borderRadius: '6px',
                                padding: '2px 7px',
                                fontSize: '10px',
                                fontWeight: 800
                              }}>
                                {list.isPublic !== false ? '🌐 PUBLIC' : '🔒 PRIVATE'}
                              </span>
                            </div>

                            <span style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '6px',
                              padding: '2px 8px',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: 'var(--text-dim)'
                            }}>
                              {entries.length} films
                            </span>
                          </div>

                          {/* 5-Poster Overlapping Showcase */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            margin: '2px 0 14px',
                            overflow: 'hidden',
                            paddingBottom: '2px'
                          }}>
                            {previewPosters.map((movie, idx) => (
                              <div
                                key={movie.tmdb_id || idx}
                                style={{
                                  flex: '1 1 0',
                                  minWidth: 0,
                                  aspectRatio: '2/3',
                                  borderRadius: '6px',
                                  overflow: 'hidden',
                                  border: '1px solid rgba(255, 255, 255, 0.12)',
                                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                                  background: '#191522',
                                  position: 'relative'
                                }}
                              >
                                <img
                                  src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                                  alt=""
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.style.display = 'none';
                                  }}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {list.isRanked && (
                                  <div style={{
                                    position: 'absolute',
                                    top: '3px',
                                    left: '3px',
                                    zIndex: 5,
                                    background: idx < 3 ? 'rgba(245, 158, 11, 0.95)' : 'rgba(0,0,0,0.85)',
                                    color: idx < 3 ? '#000' : '#fff',
                                    borderRadius: '4px',
                                    padding: '1px 4px',
                                    fontSize: '9px',
                                    fontWeight: 900,
                                    pointerEvents: 'none',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                                  }}>
                                    #{idx + 1}
                                  </div>
                                )}
                              </div>
                            ))}
                            {Array.from({ length: Math.max(0, 5 - previewPosters.length) }).map((_, idx) => (
                              <div
                                key={idx}
                                style={{
                                  flex: '1 1 0',
                                  minWidth: 0,
                                  aspectRatio: '2/3',
                                  borderRadius: '6px',
                                  background: 'rgba(255,255,255,0.03)',
                                  border: '1px dashed rgba(255,255,255,0.08)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '13px',
                                  color: 'var(--text-dim)'
                                }}
                              >
                                🎬
                              </div>
                            ))}
                          </div>

                          {/* List Title & Description */}
                          <h4 style={{
                            fontSize: '15.5px',
                            fontWeight: 800,
                            color: '#fff',
                            margin: '0 0 6px',
                            lineHeight: 1.3
                          }}>
                            {list.title}
                          </h4>

                          {list.description && (
                            <p style={{
                              fontSize: '12px',
                              color: 'rgba(255, 255, 255, 0.65)',
                              lineHeight: 1.45,
                              margin: '0 0 14px',
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              flex: 1
                            }}>
                              {list.description}
                            </p>
                          )}

                          {/* Bottom Stats */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: 'auto',
                            paddingTop: '10px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                            fontSize: '11.5px',
                            color: 'var(--text-dim)'
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Heart size={13} color="var(--red)" fill="var(--red)" /> {list.likesCount || 0}
                            </span>
                            <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '11.5px' }}>
                              View list →
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── REVIEWS TAB (LETTERBOXD-STYLE LIST) ── */}
            {profileActiveSubTab === 'reviews' && (
              <div className="animate-fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: 'rgba(136,8,8,0.18)', border: '1px solid rgba(136,8,8,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <MessageSquare size={18} color="var(--accent)" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#fff' }}>My Film Reviews</h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>
                        {ownReviews.length} thoughts and critiques logged
                      </span>
                    </div>
                  </div>
                </div>

                <ReviewsListView reviews={ownReviews} onMovieClick={onMovieClick} />
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

      {selectedListModal && (
        <ListDetailModal
          list={selectedListModal}
          currentUser={currentUser}
          onClose={() => setSelectedListModal(null)}
          onMovieClick={onMovieClick}
          onOpenUserProfile={onOpenUserProfile}
          onUpdateList={handleUpdateListFromProfile}
          onDeleteList={handleDeleteListFromProfile}
        />
      )}

      {showCreateListModal && (
        <CreateListModal
          currentUser={currentUser}
          library={library}
          franchiseCollections={[]}
          onClose={() => setShowCreateListModal(false)}
          onSaveList={handleSaveNewListFromProfile}
        />
      )}

      {selectedBadgeModal && (() => {
        const badgeName = selectedBadgeModal;
        const ach = ACHIEVEMENTS.find(a => a.reward?.badgeName === badgeName);
        const shopItem = SHOP_BADGES.find(b => b.name === badgeName);
        const colors = getBadgeColors(badgeName);
        
        const description = ach?.description || shopItem?.desc || (isViewedCreator ? 'Exclusive title unlocked for CineLog Creator.' : 'Prestige badge earned through cinephile milestones.');
        const targetRequirement = ach ? `${ach.target} ${ach.category === 'director' ? 'films by this director' : 'films logged'}` : (shopItem ? `Shop Unlock (${shopItem.cost} CinePoints)` : 'Milestone Achievement');
        const unlockedBy = isViewingOther ? (viewedProfile?.displayName || viewedProfile?.username || 'User') : (currentUser?.displayName || currentUser?.username || 'You');

        return (
          <div
            className="modal-overlay animate-fade-in"
            onClick={() => setSelectedBadgeModal(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(5, 3, 10, 0.85)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <div
              className="glass animate-scale-up"
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '440px',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'linear-gradient(145deg, #161224 0%, #0c0915 100%)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 30px rgba(136,8,8,0.15)',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              <button
                onClick={() => setSelectedBadgeModal(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                ✕
              </button>

              <div style={{
                width: '76px',
                height: '76px',
                borderRadius: '22px',
                background: colors.background,
                backgroundColor: colors.background,
                border: colors.border,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '38px',
                marginBottom: '16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                filter: 'drop-shadow(0 0 16px rgba(251,191,36,0.25))'
              }}>
                🎖️
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.3px' }}>
                {badgeName}
              </h3>

              <div style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 12px',
                borderRadius: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '18px',
                background: colors.background,
                backgroundColor: colors.background,
                color: colors.color,
                border: colors.border
              }}>
                {ach?.category ? `${ach.category} Badge` : 'Title Badge'}
              </div>

              <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, margin: '0 0 20px', maxWidth: '380px' }}>
                {description}
              </p>

              <div style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Requirement</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{targetRequirement}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Status</span>
                  <span style={{ color: 'var(--green)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ✓ Unlocked by @{unlockedBy}
                  </span>
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => setSelectedBadgeModal(null)}
                style={{ width: '100%', padding: '10px 0', fontSize: '13px', fontWeight: 800, borderRadius: '12px' }}
              >
                Got it
              </button>
            </div>
          </div>
        );
      })()}

    </div>
  );
}

