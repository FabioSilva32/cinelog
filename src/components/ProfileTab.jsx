import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Edit2, Check, Heart, Calendar, Star, Film, Trophy, BarChart3, X, Search, Plus, Upload } from 'lucide-react';
import { ACHIEVEMENTS, BORDER_STYLES, BADGE_COLORS } from '../utils/achievements';
import AvatarWithBorder, { DEFAULT_GREY_AVATAR } from './AvatarWithBorder';
import { supabase } from '../supabaseClient';

const MOCK_FRIENDS = [];


const DEFAULT_AVATARS = [
  { id: 'cinephile', name: 'Cinephile', path: '/avatar_cinephile.png', border: '2px solid #ec4899', glow: 'rgba(236,72,153,0.4)' },
  { id: 'reviewer', name: 'Reviewer', path: '/avatar_reviewer.png', border: '2px solid #06b6d4', glow: 'rgba(6,182,212,0.4)' },
  { id: 'watcher', name: 'Watcher', path: '/avatar_watcher.png', border: '2px solid #0ea5e9', glow: 'rgba(14,165,233,0.4)' },
  { id: 'critic', name: 'Critic', path: '/avatar_critic.png', border: '2px solid #a855f7', glow: 'rgba(168,85,247,0.4)' },
];

const GENRE_COLORS = {
  'Action': '#ef4444', 'Adventure': '#f97316', 'Comedy': '#eab308',
  'Drama': '#10b981', 'Sci-Fi': '#3b82f6', 'Horror': '#8b5cf6',
  'Romance': '#ec4899', 'Thriller': '#f59e0b', 'Animation': '#06b6d4',
  'Fantasy': '#a78bfa', 'Crime': '#6b7280', 'Documentary': '#84cc16',
  'Mystery': '#c084fc', 'Family': '#fde68a',
};

function formatRelativeDate(dateStr) {
  if (!dateStr) return 'Recently';
  const dateObj = new Date(dateStr);
  const today = new Date();
  
  // Set times to 0 for pure day comparison
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
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 7);
  }, [library]);

  const max = genreMap[0]?.[1] || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {genreMap.map(([genre, count]) => (
        <div key={genre} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '80px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right', flexShrink: 0 }}>{genre}</div>
          <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${(count / max) * 100}%`, height: '100%', background: GENRE_COLORS[genre] || 'var(--accent)', borderRadius: '3px', transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
          </div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: GENRE_COLORS[genre] || 'var(--accent)', width: '24px' }}>{count}</div>
        </div>
      ))}
    </div>
  );
}

function RatingDistributionChart({ library = [] }) {
  const dist = useMemo(() => {
    const d = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
    library.forEach(m => {
      if (m.rating) {
        const rounded = Math.min(10, Math.max(1, Math.round(Number(m.rating))));
        d[rounded] = (d[rounded] || 0) + 1;
      }
    });
    return d;
  }, [library]);

  const maxCount = Math.max(1, ...Object.values(dist));
  const totalRated = Object.values(dist).reduce((a, b) => a + b, 0);

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BarChart3 size={15} /> Rating Distribution
        </h4>
        <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 700 }}>
          {totalRated} rated film{totalRated === 1 ? '' : 's'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '100px', paddingTop: '10px' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => {
          const count = dist[score] || 0;
          const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
          const isHigh = score >= 8;
          const isMid = score >= 5 && score < 8;
          const color = isHigh ? '#34d399' : isMid ? '#fbbf24' : '#f43f5e';

          return (
            <div key={score} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '4px', fontWeight: 800 }}>
                {count > 0 ? count : ''}
              </div>
              <div
                title={`${score}/10 Stars: ${count} films`}
                style={{
                  width: '100%',
                  height: `${Math.max(count > 0 ? 12 : 3, heightPercent)}%`,
                  background: count > 0 ? color : 'rgba(255,255,255,0.05)',
                  borderRadius: '4px 4px 2px 2px',
                  transition: 'all 0.4s ease',
                  cursor: 'pointer'
                }}
              />
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginTop: '6px' }}>
                {score}★
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProfileTab({ targetUser, currentUser, onUpdateProfile, library = [], onMovieClick, onOpenUserProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [equippedBorder, setEquippedBorder] = useState(currentUser?.equippedBorder || 'none');
  const [bannerUrl, setBannerUrl] = useState(currentUser?.bannerUrl || '');
  const [bannerFitMode, setBannerFitMode] = useState(currentUser?.bannerFitMode || 'cover');
  const [bannerPosPercent, setBannerPosPercent] = useState(currentUser?.bannerPosPercent ?? 20);
  const [bannerPosition, setBannerPosition] = useState(currentUser?.bannerPosition || 'top');
  const [showBannerSelector, setShowBannerSelector] = useState(false);
  const [profileActiveSubTab, setProfileActiveSubTab] = useState('overview'); // 'overview','diary','watchlist','stats','shop'
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
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch(e){}
      }
    };
  }, []);

  // P2 Fix: re-sync banner state from currentUser whenever it changes (e.g. after Supabase load)
  // Only sync when not actively editing to avoid overwriting in-progress changes
  useEffect(() => {
    if (!isEditing) {
      setBannerUrl(currentUser?.bannerUrl || '');
      setBannerFitMode(currentUser?.bannerFitMode || 'cover');
      setBannerPosPercent(currentUser?.bannerPosPercent ?? 20);
      setBannerPosition(currentUser?.bannerPosition || 'top');
    }
  }, [currentUser?.bannerUrl, currentUser?.bannerFitMode, currentUser?.bannerPosPercent, currentUser?.bannerPosition, isEditing]);

  // Fetch other-user profile + library when targetUser is set and is not the current user
  const isViewingOther = targetUser && targetUser.id !== currentUser?.id;
  useEffect(() => {
    if (!isViewingOther) {
      setViewedProfile(null);
      setViewedLibrary([]);
      return;
    }
    let mounted = true;
    setViewedLoading(true);
    const userId = targetUser?.id;
    const fetchData = async () => {
      try {
        if (userId && supabase) {
          const [{ data: prof }, { data: lib }, { data: followRow }] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
            supabase.from('library').select('*').eq('user_id', userId).order('date_added', { ascending: false }),
            currentUser?.id ? supabase.from('follows').select('*').eq('follower_id', currentUser.id).eq('following_id', userId).maybeSingle() : Promise.resolve({ data: null })
          ]);
          if (!mounted) return;
          if (prof) {
            setViewedProfile({
              id: prof.id,
              username: prof.username || prof.display_name || 'user',
              displayName: prof.display_name || prof.username || 'CineLog Member',
              avatar: prof.avatar_url || '',
              bio: prof.bio || '',
              equippedBorder: prof.equipped_border || 'none',
              bannerUrl: prof.banner_url || '',
              bannerFitMode: prof.banner_fit_mode || 'cover',
              bannerPosPercent: prof.banner_pos_percent ?? 20,
              favorites: prof.favorites || [],
              purchasedBadges: prof.purchased_badges || [],
            });
          } else {
            setViewedProfile(targetUser);
          }
          setViewedLibrary(lib || []);
          setIsFollowing(!!followRow);
        } else {
          // No supabase â‚¬â€ just use targetUser object directly
          if (mounted) setViewedProfile(targetUser);
        }
      } catch (err) {
        console.warn('Error fetching viewed user profile:', err);
        if (mounted) setViewedProfile(targetUser);
      } finally {
        if (mounted) setViewedLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [targetUser, isViewingOther, currentUser?.id]);

  const handleVolumeChange = (type, val) => {
    setSoundVolumes(prev => ({ ...prev, [type]: val }));
    
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      if (!gainNodesRef.current[type]) {
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNodesRef.current[type] = gainNode;
        startSynthesizerLoop(type, ctx, gainNode);
      }
      
      gainNodesRef.current[type].gain.setValueAtTime(val * 0.15, ctx.currentTime); // Scale max volume slightly to keep it ambient
    } catch (e) {
      console.warn("Web Audio Mixer failed to initialize:", e);
    }
  };

  const startSynthesizerLoop = (type, ctx, targetGainNode) => {
    try {
      if (type === 'projector') {
        const clickInterval = 0.18;
        const triggerClick = () => {
          try {
            if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(targetGainNode);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(140 + Math.random() * 20, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
          } catch(e){}
          setTimeout(triggerClick, clickInterval * 1000);
        };
        const motorOsc = ctx.createOscillator();
        const motorFilter = ctx.createBiquadFilter();
        const motorGain = ctx.createGain();
        motorOsc.connect(motorGain);
        motorGain.connect(motorFilter);
        motorFilter.connect(targetGainNode);
        motorOsc.type = 'sawtooth';
        motorOsc.frequency.setValueAtTime(32.7, ctx.currentTime);
        motorFilter.type = 'lowpass';
        motorFilter.frequency.setValueAtTime(60, ctx.currentTime);
        motorGain.gain.setValueAtTime(0.2, ctx.currentTime);
        motorOsc.start();
        triggerClick();
        sourcesRef.current[type] = [motorOsc, motorGain];
      } else if (type === 'scifi') {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        osc.connect(filter);
        filter.connect(targetGainNode);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
        lfoGain.gain.setValueAtTime(30, ctx.currentTime);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200, ctx.currentTime);
        filter.Q.setValueAtTime(1.0, ctx.currentTime);
        osc.start();
        lfo.start();
        sourcesRef.current[type] = [osc, lfo];
      } else if (type === 'orchestral') {
        const frequencies = [130.81, 164.81, 196.00, 261.63];
        const nodes = [];
        frequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const oscGain = ctx.createGain();
          osc.connect(oscGain);
          oscGain.connect(filter);
          filter.connect(targetGainNode);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          const vLfo = ctx.createOscillator();
          const vLfoGain = ctx.createGain();
          vLfo.connect(vLfoGain);
          vLfoGain.connect(oscGain.gain);
          vLfo.type = 'sine';
          vLfo.frequency.setValueAtTime(0.1 + idx * 0.05, ctx.currentTime);
          vLfoGain.gain.setValueAtTime(0.08, ctx.currentTime);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(250, ctx.currentTime);
          oscGain.gain.setValueAtTime(0.15, ctx.currentTime);
          osc.start();
          vLfo.start();
          nodes.push(osc, vLfo);
        });
        sourcesRef.current[type] = nodes;
      } else if (type === 'lofi') {
        const bufferSize = ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.Q.setValueAtTime(0.6, ctx.currentTime);
        noise.connect(filter);
        filter.connect(targetGainNode);
        const triggerCrackles = () => {
          try {
            if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
            if (Math.random() < 0.25) {
              const crackOsc = ctx.createOscillator();
              const crackGain = ctx.createGain();
              crackOsc.connect(crackGain);
              crackGain.connect(targetGainNode);
              crackOsc.type = 'sawtooth';
              crackOsc.frequency.setValueAtTime(800 + Math.random() * 2000, ctx.currentTime);
              crackGain.gain.setValueAtTime(0.06, ctx.currentTime);
              crackGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);
              crackOsc.start();
              crackOsc.stop(ctx.currentTime + 0.02);
            }
          } catch(e){}
          setTimeout(triggerCrackles, 50 + Math.random() * 300);
        };
        noise.start();
        triggerCrackles();
        sourcesRef.current[type] = [noise];
      }
    } catch (e) {
      console.warn("Synth voice failed to start:", e);
    }
  };
  
  // Custom Favorites Showcase Slots (Exactly 6 elements)
  const [favorites, setFavorites] = useState(() => {
    const arr = currentUser?.favorites || [];
    // Ensure it has exactly 6 slots (filled with null if not selected)
    return Array.from({ length: 6 }, (_, i) => arr[i] || null);
  });

  // Modal selector state
  const [selectingSlotIdx, setSelectingSlotIdx] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [popupActiveTab, setPopupActiveTab] = useState('movie'); // 'movie', 'tv', 'anime'


  const watchedMovies = library.filter(m => m.status === 'watched');
  const watchedCount = watchedMovies.length;
  const reviewsCount = library.filter(m => m.review?.trim()).length;
  const favoritesCount = library.filter(m => m.favorite).length;
  const watchlistCount = library.filter(m => m.status === 'plan_to_watch').length;

  const avgRating = useMemo(() => {
    const rated = watchedMovies.filter(m => m.rating);
    if (!rated.length) return null;
    return (rated.reduce((s, m) => s + Number(m.rating), 0) / rated.length).toFixed(1);
  }, [watchedMovies]);

  const topRated = useMemo(() =>
    [...library].filter(m => m.rating && m.status === 'watched').sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 6),
    [library]
  );

  const recentDiary = useMemo(() => {
    return [...library]
      .filter(m => m.status === 'watched')
      .sort((a, b) => {
        const dateA = new Date(a.watch_date || a.date_added || 0);
        const dateB = new Date(b.watch_date || b.date_added || 0);
        return dateB - dateA;
      })
      .slice(0, 8);
  }, [library]);

  // Compute unlocked badges dynamically + purchased ones
  const unlockedBadges = useMemo(() => {
    const list = [];
    ACHIEVEMENTS.forEach(ach => {
      if (ach.check(library) >= ach.target) {
        list.push(ach.reward.badgeName);
      }
    });

    const purchased = currentUser?.purchasedBadges || [];
    purchased.forEach(badge => {
      if (!list.includes(badge)) list.push(badge);
    });

    if (currentUser?.email === 'fabioz262006@gmail.com' || currentUser?.username === 'fabioz262006') {
      if (!list.includes('Creator')) list.push('Creator');
    }

    return list;
  }, [library, currentUser]);

  // Compute unlocked border IDs dynamically + purchased ones
  const unlockedBorders = useMemo(() => {
    const borders = new Set(['none']);
    ACHIEVEMENTS.forEach(ach => {
      if (ach.check(library) >= ach.target && ach.reward.borderId) {
        borders.add(ach.reward.borderId);
      }
    });

    const purchased = currentUser?.purchasedBorders || [];
    purchased.forEach(borderId => borders.add(borderId));

    const isCreatorAccount = 
      currentUser?.username?.toLowerCase() === 'lynnx' ||
      currentUser?.username?.toLowerCase() === 'marracarrao' ||
      currentUser?.username?.toLowerCase() === 'fabioz262006' ||
      currentUser?.email?.includes('itzfabio') ||
      currentUser?.email?.includes('fabio') ||
      currentUser?.is_creator ||
      true; // Auto-unlock Creator Border for logged-in user!

    if (isCreatorAccount) {
      borders.add('creator');
    }

    return borders;
  }, [library, currentUser]);

  const currentStreak = useMemo(() => {
    const watchDates = [...new Set(library
      .map(m => m.watch_date || m.date_added)
      .filter(Boolean)
      .map(d => d.slice(0, 10))
    )].sort();
    
    if (watchDates.length === 0) return 0;
    
    let longest = 0;
    let temp = 0;
    let prevDate = null;
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    for (const dStr of watchDates) {
      const d = new Date(dStr);
      if (prevDate) {
        const diff = d - prevDate;
        if (diff <= oneDayMs + 10000) {
          temp++;
        } else {
          if (temp > longest) longest = temp;
          temp = 1;
        }
      } else {
        temp = 1;
      }
      prevDate = d;
    }
    if (temp > longest) longest = temp;
    
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - oneDayMs).toISOString().slice(0, 10);
    const hasToday = watchDates.includes(today);
    const hasYesterday = watchDates.includes(yesterday);
    return (hasToday || hasYesterday) ? temp : 0;
  }, [library]);

  const streakMultiplier = currentStreak >= 5 ? 1.5 : currentStreak >= 2 ? 1.2 : 1.0;

  // Compute CinePoints dynamically
  const cinePoints = useMemo(() => {
    const loggedPoints = watchedCount * 10;
    const reviewPoints = reviewsCount * 10;
    
    let achievementCount = 0;
    ACHIEVEMENTS.forEach(ach => {
      if (ach.check(library) >= ach.target) {
        achievementCount++;
      }
    });
    const achPoints = achievementCount * 25;
    const triviaPoints = currentUser?.triviaCinePoints || 0;
    const basePoints = loggedPoints + reviewPoints + achPoints + triviaPoints;
    const multiplierBonus = Math.round(basePoints * (streakMultiplier - 1));
    const spent = currentUser?.spentCinePoints || 0;
    return Math.max(0, basePoints + multiplierBonus - spent);
  }, [library, watchedCount, reviewsCount, currentUser, streakMultiplier]);

  const handlePurchaseBorder = (borderId, cost) => {
    if (cinePoints < cost) return;
    const currentPurchased = currentUser?.purchasedBorders || [];
    if (currentPurchased.includes(borderId)) return;

    const newPurchased = [...currentPurchased, borderId];
    const newSpent = (currentUser?.spentCinePoints || 0) + cost;

    const updatedUser = {
      ...currentUser,
      purchasedBorders: newPurchased,
      spentCinePoints: newSpent,
      equippedBorder: borderId
    };

    setEquippedBorder(borderId);
    if (onUpdateProfile) onUpdateProfile(updatedUser);

    if (currentUser?.id && supabase) {
      supabase.from('profiles').update({
        equipped_border: borderId,
        purchased_borders: newPurchased,
        spent_cine_points: newSpent
      }).eq('id', currentUser.id).then(({ error }) => {
        if (error) console.warn('Failed to update shop border in Supabase:', error.message);
      });
    }
  };

  const handlePurchaseBadge = (badgeName, cost) => {
    if (cinePoints < cost) return;
    const currentPurchased = currentUser?.purchasedBadges || [];
    if (currentPurchased.includes(badgeName)) return;

    const newPurchased = [...currentPurchased, badgeName];
    const newSpent = (currentUser?.spentCinePoints || 0) + cost;

    const updatedUser = {
      ...currentUser,
      purchasedBadges: newPurchased,
      spentCinePoints: newSpent
    };

    if (onUpdateProfile) onUpdateProfile(updatedUser);

    if (currentUser?.id && supabase) {
      supabase.from('profiles').update({
        purchased_badges: newPurchased,
        spent_cine_points: newSpent
      }).eq('id', currentUser.id).then(({ error }) => {
        if (error) console.warn('Failed to update shop badge in Supabase:', error.message);
      });
    }
  };

  const handlePurchaseBanner = (bannerId, cost) => {
    if (cinePoints < cost) return;
    const currentPurchased = currentUser?.purchasedBanners || [];
    if (currentPurchased.includes(bannerId)) return;

    const newPurchased = [...currentPurchased, bannerId];
    const newSpent = (currentUser?.spentCinePoints || 0) + cost;

    const updatedUser = {
      ...currentUser,
      purchasedBanners: newPurchased,
      spentCinePoints: newSpent,
      bannerUrl: bannerId
    };

    setBannerUrl(bannerId);
    if (onUpdateProfile) onUpdateProfile(updatedUser);

    if (currentUser?.id && supabase) {
      supabase.from('profiles').update({
        banner_url: bannerId,
        purchased_banners: newPurchased,
        spent_cine_points: newSpent
      }).eq('id', currentUser.id).then(({ error }) => {
        if (error) console.warn('Failed to update shop banner in Supabase:', error.message);
      });
    }
  };


  const handleSave = () => {
    // Strip trailing nulls or keep array representation
    const savedFavorites = favorites.filter(f => f !== null);
    onUpdateProfile({ displayName, username, bio, avatar, favorites: savedFavorites, equippedBorder, bannerUrl, bannerPosition, bannerPosPercent, bannerFitMode });
    setIsEditing(false);
  };

  const handleToggleFollow = async () => {
    if (!currentUser?.id || !viewedProfile?.id || currentUser.id === viewedProfile.id) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase.from('follows').delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', viewedProfile.id);
        setIsFollowing(false);
      } else {
        await supabase.from('follows').upsert(
          { follower_id: currentUser.id, following_id: viewedProfile.id },
          { onConflict: 'follower_id,following_id' }
        );
        setIsFollowing(true);
      }
    } catch (err) {
      console.warn('Follow toggle error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const selectMovieForSlot = (movie) => {
    setFavorites(prev => {
      const copy = [...prev];
      copy[selectingSlotIdx] = {
        id: movie.id,
        tmdb_id: movie.tmdb_id,
        title: movie.title,
        poster_path: movie.poster_path,
        score: movie.rating || movie.tmdb_score || null
      };
      return copy;
    });
    setSelectingSlotIdx(null);
    setSearchQuery('');
  };

  const removeMovieFromSlot = (idx, e) => {
    e.stopPropagation();
    setFavorites(prev => {
      const copy = [...prev];
      copy[idx] = null;
      return copy;
    });
  };

  // Convert uploaded image file to base64 Data URL
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Limit to 2MB for base64 storage limits
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large! Please choose an image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setAvatar(uploadEvent.target.result); // Base64 data URL
    };
    reader.readAsDataURL(file);
  };

  // Convert uploaded banner image file to base64 Data URL
  const handleBannerFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Limit to 3MB for base64 storage limits
    if (file.size > 3 * 1024 * 1024) {
      alert("Image is too large! Please choose an image file smaller than 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setBannerUrl(uploadEvent.target.result); // Base64 data URL
    };
    reader.readAsDataURL(file);
  };

  // Filter watched library titles for showcase search matching current popupActiveTab (media_type)
  const filteredLibrary = useMemo(() => {
    // Collect all movie IDs currently assigned to other showcase slots
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

      {/* â€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Â
          OTHER USER PROFILE â‚¬â€ Letterboxd full-page read-only view
          â€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Â */}
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
              â€ Â Back to my profile
            </button>
          </div>

          {viewedLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '14px' }}>
              Loading profile"¦
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {/* â€â‚¬â€â‚¬ BANNER â€â‚¬â€â‚¬ */}
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
                {/* Gradient fade overlay at bottom */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(10,8,19,0.7) 70%, #0a0813 100%)' }} />
              </div>

              {/* â€â‚¬â€â‚¬ PROFILE HEADER ROW â€â‚¬â€â‚¬ */}
              <div style={{ background: '#0a0813', padding: '0 28px 24px', borderRadius: '0 0 20px 20px', border: '1px solid var(--border)', borderTop: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', marginTop: '-55px', flexWrap: 'wrap' }}>
                  {/* Avatar */}
                  <div style={{ flexShrink: 0 }}>
                    <AvatarWithBorder
                      src={viewedProfile?.avatar || DEFAULT_GREY_AVATAR}
                      username={viewedProfile?.username || 'user'}
                      borderId={viewedProfile?.equippedBorder || 'none'}
                      size={110}
                    />
                  </div>

                  {/* Name / bio / badges */}
                  <div style={{ flex: 1, minWidth: 0, paddingBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', margin: 0 }}>
                        {viewedProfile?.displayName || viewedProfile?.username || 'CineLog User'}
                      </h2>
                    </div>
                    <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                      @{viewedProfile?.username || 'user'}
                    </div>
                    {(viewedProfile?.purchasedBadges || []).length > 0 && (
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        {(viewedProfile.purchasedBadges).map(b => {
                          const colors = BADGE_COLORS[b] || { border: '1px solid var(--border)', color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.03)' };
                          return <span key={b} style={{ fontSize: '10px', fontWeight: 800, padding: '2.5px 8.5px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.04em', ...colors }}>{b}</span>;
                        })}
                      </div>
                    )}
                    {viewedProfile?.bio && (
                      <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0, maxWidth: '480px' }}>
                        {viewedProfile.bio}
                      </p>
                    )}
                  </div>

                  {/* Stats + Follow button */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '14px', paddingBottom: '4px' }}>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {[
                        { label: 'Films', val: viewedLibrary.filter(m => m.status === 'watched').length, color: 'var(--green)' },
                        { label: 'Reviews', val: viewedLibrary.filter(m => m.review?.trim()).length, color: 'var(--accent)' },
                        { label: 'Watchlist', val: viewedLibrary.filter(m => m.status === 'plan_to_watch').length, color: 'var(--blue)' },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: 900, color: s.color, fontFamily: 'var(--font-heading)' }}>{s.val}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    {currentUser?.id && currentUser.id !== viewedProfile?.id && (
                      <button
                        onClick={handleToggleFollow}
                        disabled={followLoading}
                        style={{
                          background: isFollowing ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #7c6ff7, #a855f7)',
                          border: isFollowing ? '1px solid var(--border)' : 'none',
                          color: '#fff', padding: '9px 22px', borderRadius: '50px',
                          fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
                          cursor: followLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                          opacity: followLoading ? 0.6 : 1, boxShadow: isFollowing ? 'none' : '0 4px 14px rgba(124,111,247,0.4)'
                        }}
                      >
                        {isFollowing ? 'Å“â€œ Following' : '+ Follow'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* â€â‚¬â€â‚¬ OTHER USER CONTENT â€â‚¬â€â‚¬ */}
              <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
                {/* Left: Favorites + Recent activity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Favorites */}
                  {(viewedProfile?.favorites || []).filter(f => f).length > 0 && (
                    <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '20px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <Heart size={16} color="var(--red)" fill="var(--red)" />
                        <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Favorite Films</h3>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                        {Array.from({ length: 6 }).map((_, i) => {
                          const fav = (viewedProfile?.favorites || [])[i];
                          return (
                            <div key={i} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-solid)' }}>
                              <div style={{ aspectRatio: '2/3', overflow: 'hidden', position: 'relative' }}>
                                {fav ? (
                                  <img src={`https://image.tmdb.org/t/p/w300${fav.poster_path}`} alt={fav.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                                ) : (
                                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', opacity: 0.1 }}>°Å¸Å½Â¬</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recent activity */}
                  <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '20px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <Film size={16} color="var(--accent)" />
                      <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Recent Activity</h3>
                    </div>
                    {viewedLibrary.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px', padding: '20px 0' }}>No public activity yet</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {viewedLibrary.slice(0, 8).map(m => (
                          <div
                            key={m.id}
                            onClick={() => onMovieClick && onMovieClick(m.tmdb_id, m.media_type)}
                            style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px', cursor: onMovieClick ? 'pointer' : 'default', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                          >
                            {m.poster_path ? (
                              <img src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} alt="" style={{ width: '38px', height: '56px', objectFit: 'cover', borderRadius: '5px', border: '1px solid var(--border)', flexShrink: 0 }} />
                            ) : (
                              <div style={{ width: '38px', height: '56px', background: 'rgba(255,255,255,0.04)', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>°Å¸Å½Â¬</div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 800, fontSize: '13.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>{m.release_year}</div>
                              {m.review && <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>"{m.review}"</div>}
                            </div>
                            {m.rating && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(245,158,11,0.1)', color: 'var(--gold)', padding: '4px 9px', borderRadius: '20px', fontWeight: 800, fontSize: '12px', flexShrink: 0 }}>
                                ★ {Number(m.rating).toFixed(1)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: stats sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '20px', border: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '16px' }}>Stats</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {[
                        { label: 'Watched', val: viewedLibrary.filter(m => m.status === 'watched').length, color: 'var(--green)' },
                        { label: 'Reviews', val: viewedLibrary.filter(m => m.review?.trim()).length, color: 'var(--accent)' },
                        { label: 'Watchlist', val: viewedLibrary.filter(m => m.status === 'plan_to_watch').length, color: '#60a5fa' },
                        { label: 'Avg Rating', val: (() => { const r = viewedLibrary.filter(m => m.rating); return r.length ? '★ ' + (r.reduce((s, m) => s + Number(m.rating), 0) / r.length).toFixed(1) : 'â‚¬â€'; })(), color: 'var(--gold)' },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', padding: '12px' }}>
                          <div style={{ fontSize: '18px', fontWeight: 900, color: s.color }}>{s.val}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginTop: '2px' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <RatingDistributionChart library={viewedLibrary} />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
      // â€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Â
      // OWN PROFILE â‚¬â€ Letterboxd-style full page
      // â€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Ââ€¢Â
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

        {/* â€â‚¬â€â‚¬ BANNER (320px immersive) â€â‚¬â€â‚¬ */}
        <div
          className={bannerUrl && bannerUrl.startsWith('animated-') ? `banner-${bannerUrl.replace('animated-', '')}` : ''}
          style={{
            height: '320px',
            width: '100%',
            borderRadius: '20px 20px 0 0',
            overflow: 'hidden',
            position: 'relative',
            background: (bannerUrl && !bannerUrl.startsWith('animated-'))
              ? `url("${bannerUrl}") center ${bannerPosPercent ?? 20}% / ${bannerFitMode === 'contain' ? 'contain' : 'cover'} no-repeat`
              : (!bannerUrl ? 'linear-gradient(135deg, #1a1040 0%, #2d1b69 50%, #0f172a 100%)' : '#08070e')
          }}
        >
          {/* Cinematic gradient fade at bottom */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(10,8,19,0.65) 70%, #0a0813 100%)' }} />
          <button
            type="button"
            onClick={() => {
              setSelectingSlotIdx('banner');
              setIsBannerSelectorOpen(true);
            }}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              zIndex: 3,
              background: 'rgba(10,8,19,0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            <Camera size={14} /> Change Banner
          </button>
        </div>

        {/* â€â‚¬â€â‚¬ PROFILE HEADER ROW â€â‚¬â€â‚¬ */}
        <div style={{ background: '#0a0813', padding: '0 28px 20px', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', marginTop: '-55px', flexWrap: 'wrap' }}>
            {/* Avatar with edit camera */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <AvatarWithBorder
                src={avatar || DEFAULT_GREY_AVATAR}
                username={currentUser?.username || 'Profile'}
                borderId={isEditing ? equippedBorder : (currentUser?.equippedBorder || 'none')}
                size={110}
              />
              {!isEditing && (
                <button
                  onClick={() => {
                    setDisplayName(currentUser?.displayName || '');
                    setUsername(currentUser?.username || '');
                    setBio(currentUser?.bio || '');
                    setAvatar(currentUser?.avatar || '');
                    setFavorites(Array.from({ length: 6 }, (_, i) => (currentUser?.favorites || [])[i] || null));
                    setEquippedBorder(currentUser?.equippedBorder || 'none');
                    setBannerUrl(currentUser?.bannerUrl || '');
                    setBannerFitMode(currentUser?.bannerFitMode || 'cover');
                    setBannerPosPercent(currentUser?.bannerPosPercent ?? 20);
                    setIsEditing(true);
                  }}
                  style={{ position: 'absolute', bottom: '3px', right: '3px', width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent)', border: '2px solid #0a0813', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
                >
                  <Camera size={14} color="#fff" />
                </button>
              )}
            </div>

            {/* Name / handle / badges / bio */}
            <div style={{ flex: 1, minWidth: 0, paddingBottom: '4px' }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '520px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700 }}>DISPLAY NAME</label>
                      <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                        placeholder="Display Name" className="form-input" style={{ fontSize: '13px' }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700 }}>USERNAME</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span style={{ position: 'absolute', left: '10px', fontSize: '13px', color: 'var(--accent)', fontWeight: 800 }}>@</span>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                          placeholder="username" className="form-input" style={{ fontSize: '13px', paddingLeft: '24px' }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700 }}>AVATAR URL</label>
                      <input type="text" value={avatar} onChange={e => setAvatar(e.target.value)}
                        placeholder="Paste image URL" className="form-input" style={{ fontSize: '12px' }} />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: 'rgba(124,111,247,0.1)', border: '1px dashed var(--accent)', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                      <Upload size={13} color="var(--accent)" /> Upload
                      <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700 }}>BIO</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell your cinema story..."
                      className="form-input" style={{ minHeight: '54px', fontSize: '13px', lineHeight: 1.5 }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700 }}>EQUIPPED BORDER</label>
                    <select value={equippedBorder} onChange={e => setEquippedBorder(e.target.value)} className="form-input"
                      style={{ fontSize: '13px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid var(--border)' }}>
                      {Object.entries(BORDER_STYLES).map(([id, config]) => {
                        const isUnlocked = unlockedBorders.has(id);
                        return (
                          <option key={id} value={id} disabled={!isUnlocked} style={{ background: '#0d0b18', color: isUnlocked ? '#fff' : 'var(--text-dim)' }}>
                            {config.name} â‚¬â€ {isUnlocked ? 'Å“â€œ Unlocked' : '°Å¸â€â€™ Locked'}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700 }}>SHOWCASE SLOTS</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '7px' }}>
                      {favorites.map((fav, idx) => (
                        <div key={idx} onClick={() => setSelectingSlotIdx(idx)}
                          style={{ aspectRatio: '2/3', borderRadius: '6px', border: '1px dashed var(--border)', background: 'rgba(255,255,255,0.01)', position: 'relative', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                          {fav ? (
                            <>
                              <img src={`https://image.tmdb.org/t/p/w200${fav.poster_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button type="button" onClick={(e) => removeMovieFromSlot(idx, e)}
                                style={{ position: 'absolute', top: '3px', right: '3px', width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(0,0,0,0.8)', border: 'none', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
                                <X size={10} />
                              </button>
                            </>
                          ) : (
                            <Plus size={13} color="var(--text-muted)" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-primary" onClick={handleSave} style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={14} /> Save Profile
                    </button>
                    <button className="btn btn-ghost" onClick={() => setIsEditing(false)} style={{ padding: '8px 14px', fontSize: '13px' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>{currentUser?.displayName || 'CineLog Fan'}</h2>
                    <button onClick={() => { setDisplayName(currentUser?.displayName || ''); setUsername(currentUser?.username || ''); setBio(currentUser?.bio || ''); setAvatar(currentUser?.avatar || ''); setFavorites(Array.from({ length: 6 }, (_, i) => (currentUser?.favorites || [])[i] || null)); setEquippedBorder(currentUser?.equippedBorder || 'none'); setBannerUrl(currentUser?.bannerUrl || ''); setBannerFitMode(currentUser?.bannerFitMode || 'cover'); setBannerPosPercent(currentUser?.bannerPosPercent ?? 20); setIsEditing(true); }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <Edit2 size={14} />
                    </button>
                  </div>
                  <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>@{currentUser?.username || 'cinelog_user'}</div>
                  {unlockedBadges.length > 0 && (
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '9px' }}>
                      {unlockedBadges.map(badgeName => {
                        const colors = BADGE_COLORS[badgeName] || { border: '1px solid var(--border)', color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.03)' };
                        return <span key={badgeName} style={{ fontSize: '10px', fontWeight: 800, padding: '2.5px 8.5px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.04em', ...colors }}>{badgeName}</span>;
                      })}
                    </div>
                  )}
                  <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '420px', margin: 0 }}>
                    {currentUser?.bio || 'No bio yet. Click the edit button to tell your cinema story.'}
                  </p>
                </div>
              )}
            </div>

            {/* Stats pills */}
            {!isEditing && (
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
            )}
          </div>
        </div>

        {/* â€â‚¬â€â‚¬ 5-TAB SUB-NAV â€â‚¬â€â‚¬ */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '0', marginBottom: '0', background: '#0a0813', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', overflowX: 'auto' }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'diary', label: 'Diary' },
            { id: 'watchlist', label: 'Watchlist' },
            { id: 'stats', label: 'Stats' },
            { id: 'shop', label: 'Shop' },
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

        {/* â€â‚¬â€â‚¬ TAB CONTENT â€â‚¬â€â‚¬ */}
        <div style={{ padding: '28px 0', display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬ OVERVIEW TAB â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬ */}
          {profileActiveSubTab === 'overview' && (
            <div style={{ display: 'flex', gap: '24px', alignItems: 'start' }}>

              {/* LEFT COLUMN */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Favorites Showcase */}
                <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '20px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Heart size={16} color="var(--red)" fill="var(--red)" />
                    <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Favorites Showcase</h3>
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
                              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', opacity: 0.12 }}>°Å¸Å½Â¬</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {(currentUser?.favorites || []).length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px', marginTop: '10px' }}>
                      Click the edit camera icon to assign films to your showcase slots
                    </div>
                  )}
                </div>

                {/* Recent Diary (top 6) */}
                {recentDiary.length > 0 && (
                  <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '20px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={16} color="var(--accent)" />
                        <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Recent Diary</h3>
                      </div>
                      <button onClick={() => setProfileActiveSubTab('diary')}
                        style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                        View all â€ â€™
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
                    <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Genre Breakdown</h3>
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
                      <span style={{ fontSize: '22px' }}>°Å¸â€Â¥</span>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#f97316' }}>{currentStreak}-day streak</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>{streakMultiplier > 1 ? `${streakMultiplier}ƒâ€” CinePoints multiplier active` : 'Keep it going!'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬ DIARY TAB â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬ */}
          {profileActiveSubTab === 'diary' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Calendar size={18} color="var(--accent)" />
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Watch Diary & History</h3>
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
                                °Å¸â€Â {item.rewatch_count ? `${item.rewatch_count}x` : 'Rewatch'}
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
                              °Å¸Å½Â¬ Trailer
                            </a>
                            <button onClick={() => setActiveShareCard(item)}
                              style={{ fontSize: '10.5px', color: 'var(--accent)', background: 'rgba(124,111,247,0.06)', border: '1px solid rgba(124,111,247,0.18)', borderRadius: '4px', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700, cursor: 'pointer' }}>
                              °Å¸â€œÂ¤ Share Card
                            </button>
                          </div>

                          {item.review && (
                            <div style={{ marginTop: '8px' }}>
                              {item.contains_spoilers ? (
                                <details style={{ cursor: 'pointer' }}>
                                  <summary style={{ fontSize: '11.5px', color: 'var(--red)', fontWeight: 800, listStyle: 'none' }}>Å¡Â ¯Â¸Â Contains spoilers (click to show)</summary>
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

          {/* â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬ WATCHLIST TAB â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬ */}
          {profileActiveSubTab === 'watchlist' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Film size={18} color="#60a5fa" />
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Your Watchlist</h3>
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
                          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>°Å¸Å½Â¬</div>
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

          {/* â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬ STATS TAB â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬ */}
          {profileActiveSubTab === 'stats' && (
            <div style={{ display: 'flex', gap: '24px', alignItems: 'start', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Overview stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {[
                    { label: 'Films Watched', val: watchedCount, color: 'var(--green)', icon: 'Å“â€¦' },
                    { label: 'Reviews Written', val: reviewsCount, color: 'var(--accent)', icon: 'Å“Â¯Â¸Â' },
                    { label: 'Favorites', val: favoritesCount, color: 'var(--red)', icon: 'ÂÂ¤¯Â¸Â' },
                    { label: 'Watchlist', val: watchlistCount, color: '#60a5fa', icon: '📋' },
                    { label: 'Avg Rating', val: avgRating ? `★ ${avgRating}` : 'N/A', color: 'var(--gold)', icon: 'Â­Â' },
                    { label: 'Current Streak', val: currentStreak > 0 ? `${currentStreak}d °Å¸â€Â¥` : 'â‚¬â€', color: '#f97316', icon: '°Å¸â€Â¥' },
                  ].map(s => (
                    <div key={s.label} className="glass" style={{ borderRadius: '14px', padding: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ fontSize: '20px' }}>{s.icon}</div>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: s.color }}>{s.val}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Top Rated Films */}
                {topRated.length > 0 && (
                  <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '20px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <Trophy size={16} color="var(--gold)" />
                      <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Your Top Rated Films</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px' }}>
                      {topRated.map((m, i) => (
                        <div key={m.id} onClick={() => onMovieClick && onMovieClick(m.tmdb_id, m.media_type)}
                          style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-solid)', cursor: onMovieClick ? 'pointer' : 'default' }}>
                          <div style={{ aspectRatio: '2/3', overflow: 'hidden', position: 'relative' }}>
                            {m.poster_path ? <img src={`https://image.tmdb.org/t/p/w300${m.poster_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>°Å¸Å½Â¬</div>}
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
                    <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Genre Breakdown</h3>
                  </div>
                  {library.length > 0 ? <MiniGenreChart library={library} /> : <div style={{ color: 'var(--text-muted)', fontSize: '12.5px', textAlign: 'center', padding: '16px' }}>Add movies to see breakdown</div>}
                </div>
                <RatingDistributionChart library={library} />
              </div>
            </div>
          )}

          {/* â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬ SHOP TAB â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬ */}
          {profileActiveSubTab === 'shop' && (
            <div className="glass animate-fade-in" style={{ borderRadius: 'var(--radius-xl)', padding: '28px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Shop header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    °Å¸ÂÂª CinePoints 2.0 Reward Shop
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span>Earn points by tracking movies (+10) and writing reviews (+10). Complete quests for bonus rewards!</span>
                    {streakMultiplier > 1.0 && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'rgba(249,115,22,0.12)', color: '#f97316', border: '1px solid rgba(249,115,22,0.25)', fontSize: '10.5px', padding: '1.5px 8px', borderRadius: '12px', fontWeight: 800 }}>
                        °Å¸â€Â¥ {streakMultiplier}ƒâ€” Streak Multiplier Active
                      </span>
                    )}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(124,111,247,0.1)', border: '1px solid rgba(124,111,247,0.25)', padding: '8px 16px', borderRadius: '30px' }}>
                  <span style={{ fontSize: '18px' }}>🪙</span>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>{cinePoints}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>CinePoints</span>
                </div>
              </div>

              {/* Quests */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '14px' }}>Å¡Â¡ Daily & Weekly Quests</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {[
                    { label: 'Log a Movie Today', icon: '°Å¸Å½Â¬', reward: 10, progress: library.filter(m => m.date_added?.slice(0, 10) === new Date().toISOString().slice(0, 10)).length, target: 1, type: 'Daily' },
                    { label: 'Write 2 Reviews', icon: 'Å“Â¯Â¸Â', reward: 20, progress: library.filter(m => m.review?.trim()).length, target: 2, type: 'Daily' },
                    { label: 'Rate 5 Movies This Week', icon: 'Â­Â', reward: 30, progress: Math.min(5, library.filter(m => m.rating && m.date_added && (Date.now() - new Date(m.date_added).getTime()) < 7 * 24 * 60 * 60 * 1000).length), target: 5, type: 'Weekly' },
                    { label: 'Explore 3 New Genres', icon: '°Å¸Å’Â', reward: 25, progress: Object.keys(library.reduce((acc, m) => { (m.genres || []).forEach(g => acc[g] = true); return acc; }, {})).length, target: 3, type: 'Weekly' },
                    { label: 'Watch 10 Films', icon: '°Å¸â€œÂº', reward: 50, progress: watchedCount, target: 10, type: 'Challenge' },
                    { label: 'Build a 5-Day Streak', icon: '°Å¸â€Â¥', reward: 75, progress: currentStreak, target: 5, type: 'Challenge' },
                  ].map(quest => {
                    const pct = Math.min(100, Math.round((quest.progress / quest.target) * 100));
                    const done = quest.progress >= quest.target;
                    return (
                      <div key={quest.label} style={{ background: done ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`, borderRadius: '12px', padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>{quest.icon} {quest.label}</span>
                          <span style={{ fontSize: '10px', background: quest.type === 'Daily' ? 'rgba(59,130,246,0.15)' : quest.type === 'Weekly' ? 'rgba(124,111,247,0.15)' : 'rgba(251,191,36,0.15)', color: quest.type === 'Daily' ? '#3b82f6' : quest.type === 'Weekly' ? 'var(--accent)' : 'var(--gold)', borderRadius: '20px', padding: '1px 7px', fontWeight: 800 }}>{quest.type}</span>
                        </div>
                        <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: done ? 'var(--green)' : 'var(--accent)', borderRadius: '3px', transition: 'width 0.6s ease' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)' }}>
                          <span>{quest.progress}/{quest.target} {done && 'Å“â€œ'}</span>
                          <span style={{ color: done ? 'var(--green)' : 'var(--gold)', fontWeight: 700 }}>+🪙 {quest.reward}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Soundscape Mixer */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '14px' }}>°Å¸Å½Âµ Ambient Cinema Soundscapes Mixer</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  {[
                    { id: 'projector', name: '°Å¸Å½Â¬ Film Projector Hum', color: '#f59e0b', desc: 'Clicking reel mechanics & low rumbling motor' },
                    { id: 'scifi', name: '°Å¸Å¡â‚¬ Sci-Fi Ambience', color: '#3b82f6', desc: 'Slightly modulated space wave frequency sweeps' },
                    { id: 'orchestral', name: '°Å¸Ââ€¯Â¸Â Epic Orchestral Chords', color: '#ec4899', desc: 'Swelling warm pad C-major chord harmonies' },
                    { id: 'lofi', name: '°Å¸Å’â„¢ Lo-Fi Midnight Rain', color: '#a78bfa', desc: 'Soft bandpass record white noise & pops' },
                  ].map(track => {
                    const vol = soundVolumes[track.id] || 0;
                    return (
                      <div key={track.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: `${track.color}08`, border: `1px solid ${track.color}25`, borderRadius: '10px', padding: '12px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800 }}>{track.name}</span>
                          <span style={{ fontSize: '10px', color: track.color, fontWeight: 900 }}>{Math.round(vol * 100)}%</span>
                        </div>
                        <p style={{ fontSize: '10px', color: 'var(--text-dim)', margin: 0, minHeight: '28px', lineHeight: 1.3 }}>{track.desc}</p>
                        <input type="range" min="0" max="1" step="0.05" value={vol} onChange={e => handleVolumeChange(track.id, parseFloat(e.target.value))}
                          style={{ width: '100%', cursor: 'pointer', accentColor: track.color, height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', outline: 'none' }} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Premium Borders */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '14px' }}>Premium Avatar Borders</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {[
                    { id: 'cyber-violet', name: '°Å¸Å’Å’ Cyber Violet Aura', cost: 150, desc: 'Glowing neon violet border with high-intensity pulse.' },
                    { id: 'plasma-red', name: 'Å¡Â¡ Plasma Crimson Pulse', cost: 250, desc: 'An electric blazing plasma red border.' },
                    { id: 'matrix-code', name: '°Å¸â€œÅ¸ Matrix Code Shift', cost: 350, desc: 'Cascading digital green hacker border.' },
                    { id: 'hyper-drive', name: '°Å¸Å¡â‚¬ Hyperdrive Speed', cost: 500, desc: 'Cosmic cyan-blue speed particle glow.' },
                    { id: 'royal-amethyst', name: '°Å¸â€™Å½ Royal Amethyst Crown', cost: 750, desc: 'Luxurious deep purple-gold glowing crown border.' }
                  ].map(item => {
                    const purchased = (currentUser?.purchasedBorders || []).includes(item.id) || equippedBorder === item.id;
                    return (
                      <div key={item.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#fff' }}>{item.name}</span>
                          <span style={{ fontSize: '11px', color: purchased ? 'var(--green)' : 'var(--gold)', fontWeight: 800 }}>{purchased ? 'Å“â€œ Unlocked' : `🪙 ${item.cost}`}</span>
                        </div>
                        <p style={{ fontSize: '11.5px', color: 'var(--text-dim)', lineHeight: 1.4 }}>{item.desc}</p>
                        {!purchased ? (
                          <button onClick={() => handlePurchaseBorder(item.id, item.cost)} disabled={cinePoints < item.cost} className="btn"
                            style={{ marginTop: 'auto', background: cinePoints < item.cost ? 'rgba(255,255,255,0.04)' : 'var(--accent)', border: 'none', color: cinePoints < item.cost ? 'var(--text-dim)' : '#fff', padding: '6px 0', fontSize: '12px', fontWeight: 700, borderRadius: '6px', cursor: cinePoints < item.cost ? 'not-allowed' : 'pointer', transition: 'all 0.2s', width: '100%', textAlign: 'center' }}>
                            Unlock for 🪙 {item.cost}
                          </button>
                        ) : (
                          <button disabled className="btn" style={{ marginTop: 'auto', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--green)', padding: '6px 0', fontSize: '12px', fontWeight: 700, borderRadius: '6px', cursor: 'default', width: '100%', textAlign: 'center' }}>Purchased</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shop Badges */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '14px' }}>Exclusive Shop Badges</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {[
                    { name: 'VIP Cinephile', cost: 100, desc: 'A royal purple title for dedicated cinema enthusiasts.' },
                    { name: 'Popcorn Overlord', cost: 200, desc: 'An exclusive gold badge for heavy movie marathoners.' },
                    { name: 'Midnight Binger', cost: 300, desc: 'A cosmic blue title for late night film watchers.' },
                    { name: 'Cinema Tycoon', cost: 500, desc: 'A prestigious emerald badge for CinePoints collectors.' }
                  ].map(item => {
                    const purchased = (currentUser?.purchasedBadges || []).includes(item.name);
                    return (
                      <div key={item.name} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#fff' }}>{item.name}</span>
                          <span style={{ fontSize: '11px', color: purchased ? 'var(--green)' : 'var(--gold)', fontWeight: 800 }}>{purchased ? 'Å“â€œ Unlocked' : `🪙 ${item.cost}`}</span>
                        </div>
                        <p style={{ fontSize: '11.5px', color: 'var(--text-dim)', lineHeight: 1.4 }}>{item.desc}</p>
                        {!purchased ? (
                          <button onClick={() => handlePurchaseBadge(item.name, item.cost)} disabled={cinePoints < item.cost} className="btn"
                            style={{ marginTop: 'auto', background: cinePoints < item.cost ? 'rgba(255,255,255,0.04)' : 'var(--accent)', border: 'none', color: cinePoints < item.cost ? 'var(--text-dim)' : '#fff', padding: '6px 0', fontSize: '12px', fontWeight: 700, borderRadius: '6px', cursor: cinePoints < item.cost ? 'not-allowed' : 'pointer', transition: 'all 0.2s', width: '100%', textAlign: 'center' }}>
                            Unlock for 🪙 {item.cost}
                          </button>
                        ) : (
                          <button disabled className="btn" style={{ marginTop: 'auto', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--green)', padding: '6px 0', fontSize: '12px', fontWeight: 700, borderRadius: '6px', cursor: 'default', width: '100%', textAlign: 'center' }}>Purchased</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Animated Banners */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '14px' }}>Premium Animated Banners</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {[
                    { id: 'animated-scanlines', name: '°Å¸Å½Â¬ Film Reel Scanlines Banner', cost: 200, desc: 'Projector scanlines with retro flicker noise.' },
                    { id: 'animated-stars', name: '°Å¸Å’Â  Neon Shooting Stars Banner', cost: 300, desc: 'Rotating neon stars and cosmic meteors.' },
                    { id: 'animated-matrix', name: '°Å¸Å¸Â¢ Retro Matrix Code Banner', cost: 400, desc: 'Cascading digital green binary drops.' }
                  ].map(item => {
                    const purchased = (currentUser?.purchasedBanners || []).includes(item.id);
                    return (
                      <div key={item.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#fff' }}>{item.name}</span>
                          <span style={{ fontSize: '11px', color: purchased ? 'var(--green)' : 'var(--gold)', fontWeight: 800 }}>{purchased ? 'Å“â€œ Unlocked' : `🪙 ${item.cost}`}</span>
                        </div>
                        <p style={{ fontSize: '11.5px', color: 'var(--text-dim)', lineHeight: 1.4 }}>{item.desc}</p>
                        {!purchased ? (
                          <button onClick={() => handlePurchaseBanner(item.id, item.cost)} disabled={cinePoints < item.cost} className="btn"
                            style={{ marginTop: 'auto', background: cinePoints < item.cost ? 'rgba(255,255,255,0.04)' : 'var(--accent)', border: 'none', color: cinePoints < item.cost ? 'var(--text-dim)' : '#fff', padding: '6px 0', fontSize: '12px', fontWeight: 700, borderRadius: '6px', cursor: cinePoints < item.cost ? 'not-allowed' : 'pointer', transition: 'all 0.2s', width: '100%', textAlign: 'center' }}>
                            Unlock for 🪙 {item.cost}
                          </button>
                        ) : (
                          <button disabled className="btn" style={{ marginTop: 'auto', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--green)', padding: '6px 0', fontSize: '12px', fontWeight: 700, borderRadius: '6px', cursor: 'default', width: '100%', textAlign: 'center' }}>Purchased</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      )} {/* end isViewingOther ternary */}


      {/* â€â‚¬â€â‚¬ SHOWCASE SEARCH MODAL â€â‚¬â€â‚¬ */}
      {selectingSlotIdx !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,3,8,0.85)', backdropFilter: 'blur(12px)', zIndex: 1100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', paddingTop: '10vh' }}
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
                  style={{ flex: 1, background: 'none', border: 'none', padding: '8px 0', fontSize: '12px', fontWeight: 700, color: popupActiveTab === tab.id ? 'var(--accent)' : 'var(--text-dim)', borderBottom: popupActiveTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {tab.label}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} color="var(--text-dim)" style={{ position: 'absolute', left: '12px' }} />
              <input type="text" placeholder={`Search watched ${popupActiveTab === 'movie' ? 'movies' : popupActiveTab === 'tv' ? 'series' : 'anime'}...`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: '#fff', fontSize: '13px', outline: 'none' }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '50vh' }}>
              {filteredLibrary.length > 0 ? filteredLibrary.map(movie => (
                <div key={movie.id} onClick={() => selectMovieForSlot(movie)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s', background: 'rgba(255,255,255,0.01)', border: '1px solid transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; e.currentTarget.style.borderColor = 'transparent'; }}>
                  {movie.poster_path ? <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt="" style={{ width: '28px', height: '42px', objectFit: 'cover', borderRadius: '4px' }} /> : <div style={{ width: '28px', height: '42px', background: 'var(--surface-solid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', borderRadius: '4px' }}>°Å¸Å½Â¬</div>}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movie.title}</div>
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

      {/* â€â‚¬â€â‚¬ BANNER SELECTOR MODAL (with fit-mode + position restored) â€â‚¬â€â‚¬ */}
      {showBannerSelector && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'rgba(4,3,8,0.88)', backdropFilter: 'blur(16px)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setShowBannerSelector(false)}>
          <div className="glass" style={{ width: '92vw', maxWidth: '760px', maxHeight: '90vh', borderRadius: '20px', border: '1px solid var(--border)', background: '#0c0a17', padding: '28px', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.85)', position: 'relative' }}
            onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>°Å¸â€“Â¼¯Â¸Â Choose Profile Banner</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>Select a preset, animated shop banner, or a backdrop from your library.</p>
              </div>
              <button onClick={() => setShowBannerSelector(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                <X size={18} />
              </button>
            </div>

            {/* Live preview */}
            {bannerUrl && !bannerUrl.startsWith('animated-') && (
              <div style={{ marginBottom: '16px', borderRadius: '10px', overflow: 'hidden', height: '100px', position: 'relative', border: '1px solid var(--border)',
                background: `url("${bannerUrl}") center ${bannerPosPercent ?? 20}% / ${bannerFitMode === 'contain' ? 'contain' : 'cover'} no-repeat #08070e` }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
                <span style={{ position: 'absolute', bottom: '6px', left: '10px', fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Preview</span>
              </div>
            )}

            {/* Banner Display & Framing Mode */}
            {bannerUrl && !bannerUrl.startsWith('animated-') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '11.5px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>BANNER FRAMING MODE</label>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>Vertical: {bannerPosPercent}%</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[
                    { id: 'cover', label: '°Å¸â€“Â¼¯Â¸Â Full-Bleed Fill', desc: 'Crops to fill banner' },
                    { id: 'contain', label: '°Å¸ÂÂ¿ Show Entire Image', desc: 'No cropping, ambient glow' },
                  ].map(opt => (
                    <button key={opt.id} type="button"
                      onClick={() => { setBannerFitMode(opt.id); if (onUpdateProfile) onUpdateProfile({ bannerFitMode: opt.id }); }}
                      style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, border: bannerFitMode === opt.id ? '2px solid var(--accent)' : '1px solid var(--border)', background: bannerFitMode === opt.id ? 'rgba(124,111,247,0.2)' : 'rgba(0,0,0,0.3)', color: bannerFitMode === opt.id ? '#fff' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' }}>
                      {opt.label}
                      <div style={{ fontSize: '10px', fontWeight: 400, color: 'var(--text-dim)', marginTop: '2px' }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>
                    <span>Â¬â€ ¯Â¸Â Top (heads/titles)</span><span>â€ â€¯Â¸Â Center</span><span>Â¬â€¡¯Â¸Â Bottom</span>
                  </div>
                  <input type="range" min="0" max="100" step="5" value={bannerPosPercent}
                    onChange={e => { const val = Number(e.target.value); setBannerPosPercent(val); if (onUpdateProfile) onUpdateProfile({ bannerPosPercent: val }); }}
                    style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px', maxHeight: '44vh', overflowY: 'auto', paddingRight: '8px' }}>
              {/* Animated shop banners owned */}
              {(() => {
                const owned = (currentUser?.purchasedBanners || []).filter(id => id.startsWith('animated-'));
                if (owned.length === 0) return null;
                const BANNERS_MAP = {
                  'animated-scanlines': { name: 'Film Reel Scanlines Banner', bg: 'linear-gradient(rgba(124,111,247,0.1),rgba(184,124,248,0.05)),#08070b' },
                  'animated-stars': { name: 'Neon Shooting Stars Banner', bg: 'linear-gradient(135deg,#090615 0%,#150d30 100%)' },
                  'animated-matrix': { name: 'Retro Matrix Code Banner', bg: '#030a05' }
                };
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11.5px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>EQUIP UNLOCKED ANIMATED SHOP BANNER</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {owned.map(id => {
                        const info = BANNERS_MAP[id] || { name: 'Animated Banner', bg: '#111' };
                        const isActive = bannerUrl === id;
                        return (
                          <div key={id} onClick={() => setBannerUrl(id)}
                            style={{ aspectRatio: '16/9', borderRadius: '10px', cursor: 'pointer', border: isActive ? '2px solid var(--accent)' : '1px solid var(--border)', boxShadow: isActive ? '0 0 14px var(--accent)' : 'none', background: info.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', textAlign: 'center', overflow: 'hidden' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: isActive ? 'var(--accent)' : '#fff', lineHeight: 1.2 }}>{info.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Preset cinematic banners */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11.5px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>PRESET HIGH-RES CINEMATIC BANNERS</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[
                    { name: '°Å¸Å½Â® Pro Gaming Setup', url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&h=340&q=80' },
                    { name: '°Å¸Å’Å’ Cosmic Nebula', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&h=340&q=80' },
                    { name: '°Å¸Å½Â¬ Classic Cinema Theater', url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&h=340&q=80' },
                    { name: '°Å¸Ââ„¢¯Â¸Â Tokyo Neon City', url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&h=340&q=80' },
                    { name: 'â€ºÂ°¯Â¸Â Alpine Mountain Peaks', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&h=340&q=80' },
                    { name: '°Å¸ÂÂ¿ Cinema Audience', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&h=340&q=80' },
                    { name: '°Å¸Å’â€¦ Sunset Ocean Horizon', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=340&q=80' },
                    { name: '°Å¸â€Â® Sci-Fi Warp Tunnel', url: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=1200&h=340&q=80' },
                    { name: '°Å¸â€œÂ½¯Â¸Â Vintage Film Studio', url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&h=340&q=80' },
                  ].map(b => (
                    <div key={b.name} onClick={() => { setBannerUrl(b.url); setBannerFitMode('cover'); }}
                      style={{ aspectRatio: '16/9', borderRadius: '10px', overflow: 'hidden', border: bannerUrl === b.url ? '2px solid var(--accent)' : '1px solid var(--border)', boxShadow: bannerUrl === b.url ? '0 0 14px var(--accent)' : 'none', cursor: 'pointer', position: 'relative', background: '#110e1f' }}>
                      <img src={b.url} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(180deg,transparent 0%,rgba(0,0,0,0.85) 100%)', padding: '6px', fontSize: '10.5px', fontWeight: 800, textAlign: 'center', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom URL + file upload */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontWeight: 700 }}>PASTE CUSTOM IMAGE URL OR UPLOAD BANNER FILE</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" placeholder="https://example.com/banner.jpg"
                    value={bannerUrl && bannerUrl.startsWith('animated-') ? '' : (bannerUrl || '')}
                    onChange={e => setBannerUrl(e.target.value)}
                    className="form-input"
                    style={{ flex: 1, fontSize: '13px', padding: '10px 14px' }} />
                  <label style={{ background: 'rgba(124,111,247,0.18)', border: '1px solid var(--accent)', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 800, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(124,111,247,0.2)' }}>
                    <Upload size={14} /> Upload Banner File...
                    <input type="file" accept="image/*" onChange={handleBannerFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* Library backdrops */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11.5px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SELECT WIDESCREEN BACKDROP FROM YOUR LIBRARY</label>
                {(() => {
                  const validItems = library.filter(m => {
                    const path = m.backdrop_path || m.details?.backdrop_path;
                    if (!path) return false;
                    // Only 16:9 landscape backdrops (no portrait posters)
                    return true;
                  });
                  if (validItems.length === 0) {
                    return <div style={{ fontSize: '12.5px', color: 'var(--text-dim)', textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border)' }}>No widescreen backdrops found in your library yet.</div>;
                  }
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {validItems.slice(0, 18).map(m => {
                        const path = m.backdrop_path || m.details?.backdrop_path;
                        const coverUrl = `https://image.tmdb.org/t/p/w1280${path}`;
                        const thumbUrl = `https://image.tmdb.org/t/p/w500${path}`;
                        const isSelected = bannerUrl === coverUrl;
                        return (
                          <div key={m.id || m.tmdb_id} onClick={() => { setBannerUrl(coverUrl); setBannerFitMode('cover'); }}
                            style={{ aspectRatio: '16/9', borderRadius: '10px', overflow: 'hidden', border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)', boxShadow: isSelected ? '0 0 14px var(--accent)' : 'none', cursor: 'pointer', position: 'relative', background: '#151224' }}>
                            <img src={thumbUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.9 }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(180deg,transparent 0%,rgba(0,0,0,0.85) 100%)', padding: '6px', fontSize: '10.5px', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center', color: '#fff' }}>{m.title}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-secondary"
                onClick={() => { setBannerUrl(''); if (onUpdateProfile) onUpdateProfile({ bannerUrl: '', bannerFitMode: 'cover', bannerPosPercent: 20 }); setShowBannerSelector(false); }}
                style={{ padding: '8px 16px', fontSize: '12.5px' }}>
                Reset Banner
              </button>
              <button className="btn btn-primary"
                onClick={() => { if (onUpdateProfile) onUpdateProfile({ bannerUrl, bannerFitMode, bannerPosPercent }); setShowBannerSelector(false); }}
                style={{ padding: '8px 22px', fontSize: '12.5px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* â€â‚¬â€â‚¬ SHARE CARD MODAL â€â‚¬â€â‚¬ */}
      {activeShareCard && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(16px)' }}
          onClick={() => setActiveShareCard(null)}>
          <div className="glass animate-fade-in-scale" style={{ width: '100%', maxWidth: '380px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)', background: 'rgba(10,8,19,0.98)', boxShadow: 'var(--shadow-xl)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>CineLog Chronicles</span>
              <button onClick={() => setActiveShareCard(null)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '18px', cursor: 'pointer' }}>ƒâ€”</button>
            </div>
            <div id="share-card-content" style={{ background: 'linear-gradient(135deg, rgba(124,111,247,0.12) 0%, rgba(236,72,153,0.06) 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', gap: '16px', position: 'relative' }}>
              {activeShareCard.poster_path && <img src={`https://image.tmdb.org/t/p/w92${activeShareCard.poster_path}`} alt="" style={{ width: '70px', height: '105px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)', flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>{activeShareCard.title}</h3>
                <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '2px' }}>{activeShareCard.release_year}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  {activeShareCard.rating && <span style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '13px' }}>★ {activeShareCard.rating}</span>}
                  {activeShareCard.is_rewatch && <span style={{ fontSize: '9px', background: 'rgba(236,72,153,0.1)', color: '#ec4899', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>°Å¸â€Â Rewatched</span>}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '10px', lineHeight: 1.4, borderLeft: '2px solid var(--accent)', paddingLeft: '8px' }}>"{activeShareCard.review || 'No review notes written yet.'}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                  <img src={currentUser?.avatar || DEFAULT_GREY_AVATAR} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid var(--border)' }} />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>{currentUser?.displayName || currentUser?.username}</span>
                </div>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => window.print()} style={{ width: '100%', fontSize: '12px', padding: '8px 0' }}>°Å¸â€“Â¨¯Â¸Â Print or Save as PDF</button>
          </div>
        </div>
      )}

    </div>
  );
}

