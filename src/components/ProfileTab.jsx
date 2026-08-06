import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
// Version: 2.4.0 - Banner Alignment Controls
import { Camera, Edit2, Check, Heart, Calendar, Star, Film, Trophy, BarChart3, TrendingUp, X, Search, Plus, Trash2, Upload } from 'lucide-react';
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

export default function ProfileTab({ currentUser, onUpdateProfile, library = [] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [equippedBorder, setEquippedBorder] = useState(currentUser?.equippedBorder || 'none');
  const [bannerUrl, setBannerUrl] = useState(currentUser?.bannerUrl || '');
  const [showBannerSelector, setShowBannerSelector] = useState(false);
  const [profileActiveSubTab, setProfileActiveSubTab] = useState('showcase'); // 'showcase', 'shop'
  const [selectedFriend, setSelectedFriend] = useState(MOCK_FRIENDS[0]);
  const [activeShareCard, setActiveShareCard] = useState(null);

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
  const [bannerPosition, setBannerPosition] = useState(currentUser?.bannerPosition || 'top');

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

  const matcherStats = useMemo(() => {
    if (!selectedFriend) return null;
    const common = library.filter(m => 
      m.status === 'watched' && 
      selectedFriend.library.some(fl => String(fl.tmdb_id) === String(m.tmdb_id))
    );
    let ratingDiffSum = 0;
    let ratingCount = 0;
    common.forEach(m => {
      const friendMovie = selectedFriend.library.find(fl => String(fl.tmdb_id) === String(m.tmdb_id));
      if (m.rating && friendMovie && friendMovie.rating) {
        const friendScoreTen = friendMovie.rating * 2;
        const userScoreTen = Number(m.rating);
        ratingDiffSum += Math.abs(friendScoreTen - userScoreTen);
        ratingCount++;
      }
    });
    const ratingSimilarity = ratingCount > 0 
      ? Math.max(0, Math.min(100, Math.round(100 - (ratingDiffSum / ratingCount) * 10))) 
      : 75;
    const userGenres = {};
    library.forEach(m => (m.genres || []).forEach(g => userGenres[g] = (userGenres[g] || 0) + 1));
    const userTopGenres = Object.entries(userGenres).sort((a,b)=>b[1]-a[1]).slice(0, 3).map(x=>x[0]);
    const genreOverlap = selectedFriend.genres.filter(g => userTopGenres.includes(g));
    const genreSimilarity = Math.round((genreOverlap.length / Math.max(1, selectedFriend.genres.length)) * 100);
    const totalScore = Math.round((ratingSimilarity * 0.6) + (genreSimilarity * 0.4));
    let level = 'Casual Acquaintance';
    if (totalScore >= 90) level = 'Film Soulmate 🌌';
    else if (totalScore >= 75) level = 'Cinema Twin 🎬';
    else if (totalScore >= 60) level = 'Similar Taste 🍿';
    else if (totalScore >= 40) level = 'Casual Talker 💬';
    return {
      common,
      ratingSimilarity,
      genreSimilarity,
      totalScore,
      level
    };
  }, [library, selectedFriend]);


  const handleSave = () => {
    // Strip trailing nulls or keep array representation
    const savedFavorites = favorites.filter(f => f !== null);
    onUpdateProfile({ displayName, username, bio, avatar, favorites: savedFavorites, equippedBorder, bannerUrl, bannerPosition });
    setIsEditing(false);
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

  // Determine if user has a custom avatar (not one of the 4 defaults)
  const isDefaultAvatar = DEFAULT_AVATARS.some(item => item.path === avatar);
  const hasCustomAvatar = avatar && !isDefaultAvatar;
  const avatarSrc = avatar || DEFAULT_GREY_AVATAR;

  // Profile PFP Border Styles
  const activeBorder = isEditing ? equippedBorder : (currentUser?.equippedBorder || 'none');
  const borderStyle = BORDER_STYLES[activeBorder]?.style || BORDER_STYLES.none.style;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>

      {/* ── PROFILE HERO CARD ── */}
      <div className="glass" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)', background: '#0a0813', position: 'relative' }}>
        
        {/* Banner Cover Area */}
        <div
          className={bannerUrl && bannerUrl.startsWith('animated-') ? `banner-${bannerUrl.replace('animated-', '')}` : ''}
          style={{
            height: '220px',
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
            background: (bannerUrl && !bannerUrl.startsWith('animated-'))
              ? `linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(10,8,19,0.5) 65%, rgba(10,8,19,0.96) 100%), url("${bannerUrl}") center ${bannerPosition === 'center' ? 'center' : bannerPosition === 'bottom' ? 'bottom' : 'top'} / cover no-repeat`
              : (!bannerUrl ? 'linear-gradient(135deg, #1e1b4b 0%, #311b92 50%, #0f172a 100%)' : '#08070e')
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (!isEditing) {
                setDisplayName(currentUser?.displayName || '');
                setUsername(currentUser?.username || '');
                setBio(currentUser?.bio || '');
                setAvatar(currentUser?.avatar || '');
                setFavorites(Array.from({ length: 6 }, (_, i) => (currentUser?.favorites || [])[i] || null));
                setEquippedBorder(currentUser?.equippedBorder || 'none');
                setBannerUrl(currentUser?.bannerUrl || '');
                setIsEditing(true);
              }
              setShowBannerSelector(true);
            }}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'rgba(8,7,11,0.85)', border: '1px solid var(--accent)',
              borderRadius: '8px', padding: '8px 16px', fontSize: '12px',
              fontWeight: 800, color: '#fff', cursor: 'pointer', zIndex: 10,
              transition: 'all 0.2s', backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 14px rgba(124,111,247,0.3)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            🖼️ Change Profile Banner
          </button>
        </div>

        <div style={{ padding: '0 28px 28px', position: 'relative' }}>
          {/* Avatar Header */}
          <div style={{ position: 'relative', width: '96px', marginTop: '-48px', marginBottom: '16px' }}>
            <AvatarWithBorder
              src={avatarSrc}
              username={currentUser?.username || 'Profile'}
              borderId={activeBorder}
              size={96}
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
                  setIsEditing(true);
                }}
                style={{ position: 'absolute', bottom: '2px', right: '2px', width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent)', border: '2px solid #0a0813', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
              >
                <Camera size={14} color="#fff" />
              </button>
            )}
          </div>

          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '560px' }}>
              
              <div style={{ display: 'flex', gap: '14px' }}>
                {/* Display Name */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>DISPLAY NAME</label>
                  <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                    placeholder="Display Name" className="form-input" style={{ fontSize: '13.5px' }} />
                </div>
                
                {/* Username handle */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>USERNAME HANDLE</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '12px', fontSize: '13px', color: 'var(--accent)', fontWeight: 800 }}>@</span>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                      placeholder="username" className="form-input" style={{ fontSize: '13.5px', paddingLeft: '26px' }} />
                  </div>
                </div>
              </div>

              {/* Avatar URL & File Upload row */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>AVATAR IMAGE URL</label>
                  <input type="text" value={avatar} onChange={e => setAvatar(e.target.value)}
                    placeholder="Paste image URL or choose file below" className="form-input" style={{ fontSize: '12px' }} />
                </div>
                <div style={{ flexShrink: 0 }}>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                    background: 'rgba(124,111,247,0.1)', border: '1px dashed var(--accent)',
                    borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                    color: '#fff', transition: 'all 0.2s', height: '38px', boxSizing: 'border-box'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,111,247,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,111,247,0.1)'}
                  >
                    <Upload size={14} color="var(--accent)" />
                    Upload File...
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* Border Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>EQUIPPED AVATAR BORDER</label>
                <select
                  value={equippedBorder}
                  onChange={e => setEquippedBorder(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '13.5px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid var(--border)' }}
                >
                  {Object.entries(BORDER_STYLES).map(([id, config]) => {
                    const isUnlocked = unlockedBorders.has(id);
                    let statusTag = isUnlocked ? '✓ Unlocked' : '(Locked - Check Achievements)';
                    if (!isUnlocked && ['cyber-violet', 'plasma-red', 'matrix-code', 'hyper-drive', 'royal-amethyst'].includes(id)) {
                      statusTag = '(Locked - CinePoints Shop)';
                    } else if (!isUnlocked && id === 'creator') {
                      statusTag = '(Exclusive Creator Perk)';
                    }
                    return (
                      <option key={id} value={id} disabled={!isUnlocked} style={{ background: '#0d0b18', color: isUnlocked ? '#fff' : 'var(--text-dim)' }}>
                        {config.name} - {statusTag}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Premium Badge Selector */}
              <div style={{ padding: '14px', background: 'rgba(124,111,247,0.04)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '12px' }}>✨ Or choose a premium badge:</div>
                <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
                  {DEFAULT_AVATARS.map(item => (
                    <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                      <button type="button" onClick={() => setAvatar(item.path)}
                        style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', border: avatar === item.path ? item.border : '2px solid transparent', boxShadow: avatar === item.path ? `0 0 14px ${item.glow}` : 'none', padding: 0, transition: 'all 0.22s', transform: avatar === item.path ? 'scale(1.12)' : 'scale(1)' }}
                        title={item.name}
                      >
                        <img src={item.path} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                      <span style={{ fontSize: '9.5px', fontWeight: 800, color: avatar === item.path ? 'var(--accent)' : 'var(--text-dim)', textTransform: 'uppercase' }}>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit Bio */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>BIO & CINEMA STORY</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell your cinema story…"
                  className="form-input" style={{ minHeight: '60px', fontSize: '13px', lineHeight: 1.5 }} />
              </div>

              {/* Edit Showcase Slots */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Heart size={12} color="var(--red)" fill="var(--red)" />
                  CUSTOMIZE SHOWCASE SLOTS (6 SLOTS)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                  {favorites.map((fav, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectingSlotIdx(idx)}
                      style={{
                        aspectRatio: '2/3', borderRadius: '6px', border: '1px dashed var(--border)',
                        background: 'rgba(255,255,255,0.01)', position: 'relative', overflow: 'hidden',
                        cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', transition: 'all 0.2s'
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
                              position: 'absolute', top: '3px', right: '3px',
                              width: '16px', height: '16px', borderRadius: '50%',
                              background: 'rgba(0,0,0,0.8)', border: 'none',
                              color: 'var(--red)', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', cursor: 'pointer', padding: 0
                            }}
                            title="Remove movie"
                          >
                            <X size={10} />
                          </button>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <Plus size={14} color="var(--text-muted)" />
                          <span style={{ fontSize: '8px', color: 'var(--text-dim)', fontWeight: 700 }}>SLOT {idx + 1}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button className="btn btn-primary" onClick={handleSave} style={{ padding: '8px 18px', fontSize: '13px' }}>
                  <Check size={14} /> Save Profile
                </button>
                <button className="btn btn-ghost" onClick={() => setIsEditing(false)} style={{ padding: '8px 14px', fontSize: '13px' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '22px', letterSpacing: '-0.3px' }}>{currentUser?.displayName || 'CineLog Fan'}</h2>
                <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <Edit2 size={14} />
                </button>
              </div>
              <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>@{currentUser?.username || 'cinelog_user'}</div>
              
              {/* Unlocked Badges under username handle */}
              {unlockedBadges.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {unlockedBadges.map(badgeName => {
                    const colors = BADGE_COLORS[badgeName] || { border: '1px solid var(--border)', color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.03)' };
                    return (
                      <span
                        key={badgeName}
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2.5px 8.5px',
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          ...colors
                        }}
                      >
                        {badgeName}
                      </span>
                    );
                  })}
                </div>
              )}

              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '480px' }}>
                {currentUser?.bio || 'No bio yet. Click the edit button to tell your cinema story.'}
              </p>

              {/* If no custom avatar, show badge picker inline */}
              {!hasCustomAvatar && (
                <div style={{ marginTop: '18px', padding: '14px 16px', background: 'rgba(124,111,247,0.03)', border: '1px dashed rgba(124,111,247,0.3)', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '2px' }}>✨ Pick your badge:</div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', width: '100%', maxWidth: '380px' }}>
                    {DEFAULT_AVATARS.map(item => (
                      <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <button type="button"
                          onClick={() => { setAvatar(item.path); onUpdateProfile({ displayName: currentUser?.displayName || 'CineLog Fan', username: currentUser?.username || 'cinelog_user', bio: currentUser?.bio || '', avatar: item.path, favorites: currentUser?.favorites || [] }); }}
                          style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', border: '2px solid transparent', padding: 0, transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.border = item.border; e.currentTarget.style.transform = 'scale(1.1)'; }}
                          onMouseLeave={e => { e.currentTarget.style.border = '2px solid transparent'; e.currentTarget.style.transform = ''; }}
                          title={item.name}
                        >
                          <img src={item.path} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats pills */}
              <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
                {[
                  {label: 'Watched', val: watchedCount, color: 'var(--green)'},
                  {label: 'Reviews', val: reviewsCount, color: 'var(--accent)'},
                  {label: 'Favorites', val: favoritesCount, color: 'var(--red)'},
                  {label: 'Watchlist', val: watchlistCount, color: 'var(--blue)'},
                  {label: 'CinePoints', val: `🪙 ${cinePoints}`, color: 'var(--accent)'},
                  ...(avgRating ? [{label: 'Avg Rating', val: `★ ${avgRating}`, color: 'var(--gold)'}] : []),
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: s.color, fontFamily: 'var(--font-heading)' }}>{s.val}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub-tab selection bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '16px', marginBottom: '8px' }}>
        <button
          onClick={() => setProfileActiveSubTab('showcase')}
          style={{
            background: 'none', border: 'none', padding: '10px 4px', fontSize: '14px', fontWeight: 800,
            color: profileActiveSubTab === 'showcase' ? 'var(--accent)' : 'var(--text-dim)',
            borderBottom: profileActiveSubTab === 'showcase' ? '2.5px solid var(--accent)' : '2.5px solid transparent',
            cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          🏆 Showcase & History
        </button>
        <button
          onClick={() => setProfileActiveSubTab('shop')}
          style={{
            background: 'none', border: 'none', padding: '10px 4px', fontSize: '14px', fontWeight: 800,
            color: profileActiveSubTab === 'shop' ? 'var(--accent)' : 'var(--text-dim)',
            borderBottom: profileActiveSubTab === 'shop' ? '2.5px solid var(--accent)' : '2.5px solid transparent',
            cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          🏪 CinePoints Shop
        </button>
        <button
          onClick={() => setProfileActiveSubTab('matcher')}
          style={{
            background: 'none', border: 'none', padding: '10px 4px', fontSize: '14px', fontWeight: 800,
            color: profileActiveSubTab === 'matcher' ? 'var(--accent)' : 'var(--text-dim)',
            borderBottom: profileActiveSubTab === 'matcher' ? '2.5px solid var(--accent)' : '2.5px solid transparent',
            cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          🔗 Compatibility Matcher
        </button>
      </div>

      {profileActiveSubTab === 'showcase' ? (
        <>
          {/* ── MAIN GRID ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>

            {/* Left: Customizable Favorites Showcase (6 Slots Grid) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Heart size={17} color="var(--red)" fill="var(--red)" />
                <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Favorites Showcase</h3>
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
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)', padding: '16px 6px 6px' }}>
                              <div style={{ fontSize: '9px', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{fav.title}</div>
                              {fav.score && (
                                <div style={{ fontSize: '9px', color: 'var(--gold)', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', fontWeight: 800 }}>
                                  ★ {Number(fav.score).toFixed(1)}
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', opacity: 0.15 }}>🎬</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {(currentUser?.favorites || []).length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '12.5px', marginTop: '10px' }}>
                  Click the profile edit camera icon to assign custom films to your showcase!
                </div>
              )}
            </div>

            {/* Right: Genre Breakdown */}
            <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <BarChart3 size={17} color="var(--accent)" />
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Genre Breakdown</h3>
              </div>
              {library.length > 0 ? (
                <MiniGenreChart library={library} />
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '24px' }}>
                  Add movies to see your genre breakdown
                </div>
              )}
            </div>

          </div>

          {/* ── TOP RATED FILMS ── */}
          {topRated.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Trophy size={17} color="var(--gold)" />
                <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Your Top Rated Films</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                {topRated.map((m, i) => (
                  <div key={m.id} style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-solid)', position: 'relative' }}>
                    <div style={{ aspectRatio: '2/3', overflow: 'hidden', position: 'relative' }}>
                      {m.poster_path ? (
                        <img src={`https://image.tmdb.org/t/p/w300${m.poster_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🎬</div>
                      )}
                      <div style={{ position: 'absolute', top: '6px', left: '6px', background: i < 3 ? 'rgba(251,191,36,0.9)' : 'rgba(0,0,0,0.8)', color: i < 3 ? '#000' : '#fff', fontSize: '10px', fontWeight: 900, padding: '1px 6px', borderRadius: '4px' }}>#{i + 1}</div>
                      <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.88)', color: 'var(--gold)', fontSize: '11px', fontWeight: 900, padding: '2px 6px', borderRadius: '4px' }}>★{Number(m.rating).toFixed(1)}</div>
                    </div>
                    <div style={{ padding: '6px 8px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── WATCH DIARY ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Calendar size={18} color="var(--accent)" />
              <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Watch Diary & History</h3>
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
                        animationDelay: `${idx * 0.12}s`,
                        opacity: 0
                      }}
                    >
                      {/* Timeline Node dot */}
                      <span style={{
                        position: 'absolute', left: '-20px', top: '5px', width: '10px', height: '10px',
                        borderRadius: '50%', background: 'var(--accent)', border: '2px solid #0a0813',
                        boxShadow: '0 0 6px var(--accent)'
                      }} />

                      {item.poster_path && (
                        <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="" style={{ width: '42px', height: '62px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                          <div>
                            <span style={{ fontWeight: 800, fontSize: '14.5px', color: '#fff' }}>{item.title}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: '8px' }}>({item.release_year})</span>
                            <span style={{ fontSize: '10px', background: 'rgba(124,111,247,0.1)', color: 'var(--accent)', borderRadius: '4px', padding: '2px 6px', marginLeft: '8px', fontWeight: 700 }}>
                              {item.media_type === 'tv' ? 'Series' : item.media_type === 'anime' ? 'Anime' : 'Film'}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)' }}>{relDate}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                          {item.rating ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--gold)', fontWeight: 900, fontSize: '13px' }}>
                              <Star size={12} fill="currentColor" /> {Number(item.rating).toFixed(1)}
                            </div>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>No Rating</span>
                          )}
                          {item.is_rewatch && (
                            <span style={{ fontSize: '10px', background: 'rgba(236,72,153,0.1)', color: '#ec4899', borderRadius: '12px', padding: '1px 8px', fontWeight: 700 }}>
                              🔁 {item.rewatch_count ? `${item.rewatch_count}x watch` : 'Rewatch'}
                            </span>
                          )}
                          {item.tags && item.tags.slice(0, 3).map(t => (
                            <span key={t} style={{ fontSize: '9.5px', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1px 7px' }}>
                              #{t}
                            </span>
                          ))}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                          <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.title + ' ' + (item.release_year || '') + ' official trailer')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '10.5px', color: 'var(--red)', background: 'rgba(239,68,68,0.06)',
                              border: '1px solid rgba(239,68,68,0.18)', borderRadius: '4px',
                              padding: '2px 8px', textDecoration: 'none', display: 'inline-flex',
                              alignItems: 'center', gap: '4px', fontWeight: 700
                            }}
                            title="Watch Official Trailer"
                          >
                            🎬 Trailer
                          </a>

                          <button
                            onClick={() => setActiveShareCard(item)}
                            style={{
                              fontSize: '10.5px', color: 'var(--accent)', background: 'rgba(124,111,247,0.06)',
                              border: '1px solid rgba(124,111,247,0.18)', borderRadius: '4px',
                              padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                              fontWeight: 700, cursor: 'pointer'
                            }}
                            title="Generate Shareable Review Card"
                          >
                            📤 Share Card
                          </button>
                        </div>

                        {item.review && (
                          <div style={{ marginTop: '8px' }}>
                            {item.contains_spoilers ? (
                              <details style={{ cursor: 'pointer' }}>
                                <summary style={{ fontSize: '11.5px', color: 'var(--red)', fontWeight: 800, listStyle: 'none' }}>
                                  ⚠️ Contains spoilers (click to show notes)
                                </summary>
                                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5, background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', marginTop: '4px' }}>
                                  "{item.review}"
                                </p>
                              </details>
                            ) : (
                              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
                                "{item.review}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass" style={{ padding: '36px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>📓</div>
                <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>Your Diary is Empty</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Log watched titles with a date to populate your chronological watch history feed.</p>
              </div>
            )}
          </div>
        </>
      ) : profileActiveSubTab === 'shop' ? (
        <div className="glass animate-fade-in" style={{ borderRadius: 'var(--radius-xl)', padding: '28px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🏪 CinePoints 2.0 Reward Shop
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span>Earn points by tracking movies (+10) and writing reviews (+10). Complete quests for bonus rewards!</span>
                {streakMultiplier > 1.0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'rgba(249,115,22,0.12)', color: '#f97316', border: '1px solid rgba(249,115,22,0.25)', fontSize: '10.5px', padding: '1.5px 8px', borderRadius: '12px', fontWeight: 800 }}>
                    🔥 {streakMultiplier}x Streak Multiplier Active
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

          {/* Daily & Weekly Quests */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '14px' }}>
              ⚡ Daily & Weekly Quests
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              {[
                { label: 'Log a Movie Today', icon: '🎬', reward: 10, progress: library.filter(m => m.date_added?.slice(0,10) === new Date().toISOString().slice(0,10)).length, target: 1, type: 'Daily' },
                { label: 'Write 2 Reviews', icon: '✍️', reward: 20, progress: library.filter(m => m.review?.trim()).length, target: 2, type: 'Daily' },
                { label: 'Rate 5 Movies This Week', icon: '⭐', reward: 30, progress: Math.min(5, library.filter(m => m.rating && m.date_added && (Date.now() - new Date(m.date_added).getTime()) < 7*24*60*60*1000).length), target: 5, type: 'Weekly' },
                { label: 'Explore 3 New Genres', icon: '🌐', reward: 25, progress: Object.keys(library.reduce((acc, m) => { (m.genres || []).forEach(g => acc[g] = true); return acc; }, {})).length, target: 3, type: 'Weekly' },
                { label: 'Watch 10 Films', icon: '📺', reward: 50, progress: watchedCount, target: 10, type: 'Challenge' },
                { label: 'Build a 5-Day Streak', icon: '🔥', reward: 75, progress: currentStreak, target: 5, type: 'Challenge' },
              ].map(quest => {
                const pct = Math.min(100, Math.round((quest.progress / quest.target) * 100));
                const done = quest.progress >= quest.target;
                return (
                  <div key={quest.label} style={{ background: done ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`, borderRadius: '12px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {quest.icon} {quest.label}
                      </span>
                      <span style={{ fontSize: '10px', background: quest.type === 'Daily' ? 'rgba(59,130,246,0.15)' : quest.type === 'Weekly' ? 'rgba(124,111,247,0.15)' : 'rgba(251,191,36,0.15)', color: quest.type === 'Daily' ? '#3b82f6' : quest.type === 'Weekly' ? 'var(--accent)' : 'var(--gold)', borderRadius: '20px', padding: '1px 7px', fontWeight: 800 }}>
                        {quest.type}
                      </span>
                    </div>
                    <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: done ? 'var(--green)' : 'var(--accent)', borderRadius: '3px', transition: 'width 0.6s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)' }}>
                      <span>{quest.progress}/{quest.target} {done && '✓'}</span>
                      <span style={{ color: done ? 'var(--green)' : 'var(--gold)', fontWeight: 700 }}>+🪙 {quest.reward}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ambient Cinema Soundscapes */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '14px' }}>
              🎵 Ambient Cinema Soundscapes Mixer
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {[
                { id: 'projector', name: '🎬 Film Projector Hum', color: '#f59e0b', desc: 'Clicking reel mechanics & low rumbling motor' },
                { id: 'scifi', name: '🚀 Sci-Fi Ambience', color: '#3b82f6', desc: 'Slightly modulated space wave frequency sweeps' },
                { id: 'orchestral', name: '🏔️ Epic Orchestral Chords', color: '#ec4899', desc: 'Swelling warm pad C-major chord harmonies' },
                { id: 'lofi', name: '🌙 Lo-Fi Midnight Rain', color: '#a78bfa', desc: 'Soft bandpass record white noise & pops' },
              ].map(track => {
                const vol = soundVolumes[track.id] || 0;
                return (
                  <div key={track.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: `${track.color}08`, border: `1px solid ${track.color}25`, borderRadius: '10px', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800 }}>{track.name}</span>
                      <span style={{ fontSize: '10px', color: track.color, fontWeight: 900 }}>{Math.round(vol * 100)}%</span>
                    </div>
                    <p style={{ fontSize: '10px', color: 'var(--text-dim)', margin: 0, minHeight: '28px', lineHeight: 1.3 }}>{track.desc}</p>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={vol}
                      onChange={e => handleVolumeChange(track.id, parseFloat(e.target.value))}
                      style={{
                        width: '100%',
                        cursor: 'pointer',
                        accentColor: track.color,
                        height: '4px',
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: '2px',
                        outline: 'none'
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Borders Section */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Premium Avatar Borders
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {[
                { id: 'cyber-violet', name: '🌌 Cyber Violet Aura', cost: 150, desc: 'Glowing neon violet border with high-intensity pulse.' },
                { id: 'plasma-red', name: '⚡ Plasma Crimson Pulse', cost: 250, desc: 'An electric blazing plasma red border.' },
                { id: 'matrix-code', name: '📟 Matrix Code Shift', cost: 350, desc: 'Cascading digital green hacker border.' },
                { id: 'hyper-drive', name: '🚀 Hyperdrive Speed', cost: 500, desc: 'Cosmic cyan-blue speed particle glow.' },
                { id: 'royal-amethyst', name: '💎 Royal Amethyst Crown', cost: 750, desc: 'Luxurious deep purple-gold glowing crown border.' }
              ].map(item => {
                const purchased = (currentUser?.purchasedBorders || []).includes(item.id) || equippedBorder === item.id;
                return (
                  <div key={item.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#fff' }}>{item.name}</span>
                      <span style={{ fontSize: '11px', color: purchased ? 'var(--green)' : 'var(--gold)', fontWeight: 800 }}>
                        {purchased ? '✓ Unlocked' : `🪙 ${item.cost}`}
                      </span>
                    </div>
                    <p style={{ fontSize: '11.5px', color: 'var(--text-dim)', lineHeight: 1.4 }}>{item.desc}</p>
                    {!purchased ? (
                      <button
                        onClick={() => handlePurchaseBorder(item.id, item.cost)}
                        disabled={cinePoints < item.cost}
                        className="btn"
                        style={{ marginTop: 'auto', background: cinePoints < item.cost ? 'rgba(255,255,255,0.04)' : 'var(--accent)', border: 'none', color: cinePoints < item.cost ? 'var(--text-dim)' : '#fff', padding: '6px 0', fontSize: '12px', fontWeight: 700, borderRadius: '6px', cursor: cinePoints < item.cost ? 'not-allowed' : 'pointer', transition: 'all 0.2s', width: '100%', textAlign: 'center' }}
                      >
                        Unlock for 🪙 {item.cost}
                      </button>
                    ) : (
                      <button disabled className="btn" style={{ marginTop: 'auto', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--green)', padding: '6px 0', fontSize: '12px', fontWeight: 700, borderRadius: '6px', cursor: 'default', width: '100%', textAlign: 'center' }}>
                        Purchased
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badges Section */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Exclusive Shop Badges
            </h4>
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
                      <span style={{ fontSize: '11px', color: purchased ? 'var(--green)' : 'var(--gold)', fontWeight: 800 }}>
                        {purchased ? '✓ Unlocked' : `🪙 ${item.cost}`}
                      </span>
                    </div>
                    <p style={{ fontSize: '11.5px', color: 'var(--text-dim)', lineHeight: 1.4 }}>{item.desc}</p>
                    {!purchased ? (
                      <button
                        onClick={() => handlePurchaseBadge(item.name, item.cost)}
                        disabled={cinePoints < item.cost}
                        className="btn"
                        style={{ marginTop: 'auto', background: cinePoints < item.cost ? 'rgba(255,255,255,0.04)' : 'var(--accent)', border: 'none', color: cinePoints < item.cost ? 'var(--text-dim)' : '#fff', padding: '6px 0', fontSize: '12px', fontWeight: 700, borderRadius: '6px', cursor: cinePoints < item.cost ? 'not-allowed' : 'pointer', transition: 'all 0.2s', width: '100%', textAlign: 'center' }}
                      >
                        Unlock for 🪙 {item.cost}
                      </button>
                    ) : (
                      <button disabled className="btn" style={{ marginTop: 'auto', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--green)', padding: '6px 0', fontSize: '12px', fontWeight: 700, borderRadius: '6px', cursor: 'default', width: '100%', textAlign: 'center' }}>
                        Purchased
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Animated Banners Section */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Premium Animated Banners
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {[
                { id: 'animated-scanlines', name: '🎬 Film Reel Scanlines Banner', cost: 200, desc: 'Projector scanlines with retro flicker noise.' },
                { id: 'animated-stars', name: '🌠 Neon Shooting Stars Banner', cost: 300, desc: 'Rotating neon stars and cosmic meteors.' },
                { id: 'animated-matrix', name: '🟢 Retro Matrix Code Banner', cost: 400, desc: 'Cascading digital green binary drops.' }
              ].map(item => {
                const purchased = (currentUser?.purchasedBanners || []).includes(item.id);
                return (
                  <div key={item.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#fff' }}>{item.name}</span>
                      <span style={{ fontSize: '11px', color: purchased ? 'var(--green)' : 'var(--gold)', fontWeight: 800 }}>
                        {purchased ? '✓ Unlocked' : `🪙 ${item.cost}`}
                      </span>
                    </div>
                    <p style={{ fontSize: '11.5px', color: 'var(--text-dim)', lineHeight: 1.4 }}>{item.desc}</p>
                    {!purchased ? (
                      <button
                        onClick={() => handlePurchaseBanner(item.id, item.cost)}
                        disabled={cinePoints < item.cost}
                        className="btn"
                        style={{ marginTop: 'auto', background: cinePoints < item.cost ? 'rgba(255,255,255,0.04)' : 'var(--accent)', border: 'none', color: cinePoints < item.cost ? 'var(--text-dim)' : '#fff', padding: '6px 0', fontSize: '12px', fontWeight: 700, borderRadius: '6px', cursor: cinePoints < item.cost ? 'not-allowed' : 'pointer', transition: 'all 0.2s', width: '100%', textAlign: 'center' }}
                      >
                        Unlock for 🪙 {item.cost}
                      </button>
                    ) : (
                      <button disabled className="btn" style={{ marginTop: 'auto', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--green)', padding: '6px 0', fontSize: '12px', fontWeight: 700, borderRadius: '6px', cursor: 'default', width: '100%', textAlign: 'center' }}>
                        Purchased
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass animate-fade-in" style={{ borderRadius: 'var(--radius-xl)', padding: '28px', border: '1px solid var(--border)' }}>
          
          {/* Matcher Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🔗 Friend Taste Compatibility Matcher
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', marginTop: '3px' }}>
                Select a friend's profile from the list to calculate taste compatibility, overlapping movies, and score matching.
              </p>
            </div>
            
            {/* Share Link Button */}
            <button
              onClick={() => {
                const shareUrl = `${window.location.origin}/share/profile?user=${currentUser?.username || 'cinelog_fan'}`;
                navigator.clipboard.writeText(shareUrl);
                alert(`Public profile share link copied to clipboard:\n${shareUrl}`);
              }}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', padding: '8px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '20px' }}
            >
              📋 Copy Profile Share Link
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '28px', alignItems: 'start' }}>
            
            {/* Friends Selector Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Friends List</span>
              {MOCK_FRIENDS.map(friend => {
                const isActive = selectedFriend.username === friend.username;
                return (
                  <div
                    key={friend.username}
                    onClick={() => setSelectedFriend(friend)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                      borderRadius: '10px', border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                      background: isActive ? 'rgba(124,111,247,0.08)' : 'rgba(255,255,255,0.01)',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    <AvatarWithBorder
                      src={friend.avatar}
                      username={friend.username}
                      borderId={friend.equippedBorder}
                      size={40}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontWeight: 800, fontSize: '13px', color: '#fff' }}>{friend.displayName}</span>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>@{friend.username}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Compatibility Dashboard Column */}
            {matcherStats && (
              <div className="glass" style={{ borderRadius: '12px', padding: '24px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                {/* Score Circle & Meter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '28px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                      <circle cx="50" cy="50" r="42" stroke="var(--accent)" strokeWidth="8" fill="none"
                        strokeDasharray={2 * Math.PI * 42}
                        strokeDashoffset={2 * Math.PI * 42 * (1 - matcherStats.totalScore / 100)}
                        strokeLinecap="round"
                        style={{ filter: 'drop-shadow(0 0 4px var(--accent))' }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '22px', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-heading)' }}>{matcherStats.totalScore}%</span>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>Compatibility Match: {matcherStats.level}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', marginTop: '4px' }}>
                      Based on shared titles, rating scores, and favorite movie genres.
                    </p>
                  </div>
                </div>

                {/* Overlap Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--gold)' }}>{matcherStats.ratingSimilarity}%</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginTop: '2px' }}>Rating Similarity</div>
                  </div>
                  <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--accent)' }}>{matcherStats.genreSimilarity}%</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginTop: '2px' }}>Genre Alignment</div>
                  </div>
                </div>

                {/* Overlapping Titles list */}
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overlapping Watched Titles</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  {matcherStats.common.length > 0 ? (
                    matcherStats.common.map(movie => {
                      const friendMovie = selectedFriend.library.find(fl => String(fl.tmdb_id) === String(movie.tmdb_id));
                      return (
                        <div key={movie.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800 }}>{movie.title}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px' }}>
                            <span style={{ color: 'var(--text-dim)' }}>You: <strong style={{ color: 'var(--gold)' }}>★{Number(movie.rating).toFixed(1)}</strong></span>
                            <span style={{ color: 'var(--text-dim)' }}>{selectedFriend.displayName}: <strong style={{ color: 'var(--gold)' }}>★{(friendMovie.rating * 2).toFixed(1)}</strong></span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '12.5px', fontStyle: 'italic', padding: '10px 0' }}>
                      No overlapping watched movies found yet. Add movies watched by both users to compare score differences!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SHOWCASE SEARCH MODAL OVERLAY ── */}
      {selectingSlotIdx !== null && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(4,3,8,0.85)',
            backdropFilter: 'blur(12px)', zIndex: 1100, display: 'flex',
            alignItems: 'flex-start', justifyContent: 'center', padding: '20px',
            paddingTop: '10vh'
          }}
          onClick={() => { setSelectingSlotIdx(null); setSearchQuery(''); }}
        >
          <div
            className="glass"
            style={{
              width: '100%', maxWidth: '440px', maxHeight: '80vh',
              borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
              background: '#0d0b18', display: 'flex', flexDirection: 'column',
              padding: '20px', gap: '16px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14.5px', fontWeight: 800 }}>Choose Film for Slot {selectingSlotIdx + 1}</span>
              <button
                className="btn btn-ghost"
                onClick={() => { setSelectingSlotIdx(null); setSearchQuery(''); }}
                style={{ padding: '4px', width: '24px', height: '24px', borderRadius: '50%' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Media Type Tabs (Movies, Series, Anime) */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '4px' }}>
              {[
                { id: 'movie', label: 'Movies' },
                { id: 'tv', label: 'Series' },
                { id: 'anime', label: 'Anime' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setPopupActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    padding: '8px 0',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: popupActiveTab === tab.id ? 'var(--accent)' : 'var(--text-dim)',
                    borderBottom: popupActiveTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} color="var(--text-dim)" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="text"
                placeholder={`Search watched ${popupActiveTab === 'movie' ? 'movies' : popupActiveTab === 'tv' ? 'series' : 'anime'}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px 8px 32px', borderRadius: '8px',
                  background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)',
                  color: '#fff', fontSize: '13px', outline: 'none'
                }}
              />
            </div>

            {/* Movies List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '50vh' }}>
              {filteredLibrary.length > 0 ? (
                filteredLibrary.map(movie => (
                  <div
                    key={movie.id}
                    onClick={() => selectMovieForSlot(movie)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '6px',
                      borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s',
                      background: 'rgba(255,255,255,0.01)', border: '1px solid transparent'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; e.currentTarget.style.borderColor = 'transparent'; }}
                  >
                    {movie.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt="" style={{ width: '28px', height: '42px', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      <div style={{ width: '28px', height: '42px', background: 'var(--surface-solid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', borderRadius: '4px' }}>🎬</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movie.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{movie.release_year}</div>
                    </div>
                    {movie.rating && <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '12px' }}>★ {Number(movie.rating).toFixed(1)}</span>}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '12.5px', padding: '20px 0' }}>
                  No watched {popupActiveTab === 'movie' ? 'movies' : popupActiveTab === 'tv' ? 'series' : 'anime'} found in library.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── BANNER SELECTOR MODAL ── */}
      {showBannerSelector && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(4,3,8,0.88)',
            backdropFilter: 'blur(16px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
          onClick={() => setShowBannerSelector(false)}
        >
          <div
            className="glass"
            style={{
              width: '92vw',
              maxWidth: '740px',
              maxHeight: '88vh',
              borderRadius: '20px',
              border: '1px solid var(--border)',
              background: '#0c0a17',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 60px rgba(0,0,0,0.85)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🖼️ Choose Profile Banner
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Select a preset cinematic cover, an animated shop banner, or a backdrop from your library.
                </p>
              </div>
              <button
                onClick={() => setShowBannerSelector(false)}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
              >
                <X size={18} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px', maxHeight: '58vh', overflowY: 'auto', paddingRight: '8px' }}>
              
              {/* Vertical Position Adjustment Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <label style={{ fontSize: '11.5px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  BANNER VERTICAL ALIGNMENT (FOCUS HEADS / FACES / LOGOS)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'top', label: '⬆️ Top (Faces & Heads)' },
                    { id: 'center', label: '↔️ Center' },
                    { id: 'bottom', label: '⬇️ Bottom' }
                  ].map(pos => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => {
                        setBannerPosition(pos.id);
                        if (onUpdateProfile) onUpdateProfile({ bannerPosition: pos.id });
                      }}
                      style={{
                        flex: 1, padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800,
                        border: bannerPosition === pos.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                        background: bannerPosition === pos.id ? 'rgba(124,111,247,0.2)' : 'rgba(0,0,0,0.3)',
                        color: bannerPosition === pos.id ? '#fff' : 'var(--text-muted)', cursor: 'pointer',
                        transition: 'all 0.15s', boxShadow: bannerPosition === pos.id ? '0 0 12px rgba(124,111,247,0.3)' : 'none'
                      }}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
              {(() => {
                const owned = (currentUser?.purchasedBanners || []).filter(id => id.startsWith('animated-'));
                if (owned.length === 0) return null;
                const BANNERS_MAP = {
                  'animated-scanlines': { name: 'Film Reel Scanlines Banner', bg: 'linear-gradient(rgba(124, 111, 247, 0.1), rgba(184, 124, 248, 0.05)), #08070b' },
                  'animated-stars': { name: 'Neon Shooting Stars Banner', bg: 'linear-gradient(135deg, #090615 0%, #150d30 100%)' },
                  'animated-matrix': { name: 'Retro Matrix Code Banner', bg: '#030a05' }
                };
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11.5px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      EQUIP UNLOCKED ANIMATED SHOP BANNER
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {owned.map(id => {
                        const info = BANNERS_MAP[id] || { name: 'Animated Banner', bg: '#111' };
                        const isActive = bannerUrl === id;
                        return (
                          <div
                            key={id}
                            onClick={() => setBannerUrl(id)}
                            style={{
                              aspectRatio: '16/9', borderRadius: '10px', cursor: 'pointer',
                              border: isActive ? '2px solid var(--accent)' : '1px solid var(--border)',
                              boxShadow: isActive ? '0 0 14px var(--accent)' : 'none',
                              background: info.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              padding: '8px', textAlign: 'center', overflow: 'hidden'
                            }}
                          >
                            <span style={{ fontSize: '11px', fontWeight: 800, color: isActive ? 'var(--accent)' : '#fff', lineHeight: 1.2 }}>{info.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11.5px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  PRESET HIGH-RES CINEMATIC BANNERS
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[
                    { name: 'Cyberpunk Skyline', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&h=220&q=80' },
                    { name: 'Cosmic Nebula', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&h=220&q=80' },
                    { name: 'Classic Cinema Theater', url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&h=220&q=80' },
                    { name: 'Tokyo Neon City', url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&h=220&q=80' },
                    { name: 'Synthwave Sunset', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&h=220&q=80' },
                    { name: 'Alpine Mountain Peaks', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&h=220&q=80' },
                    { name: 'Retro Drive-In Marquee', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&h=220&q=80' },
                    { name: 'Sunset Ocean Horizon', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=220&q=80' },
                    { name: 'Sci-Fi Warp Tunnel', url: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=1200&h=220&q=80' }
                  ].map(b => (
                    <div
                      key={b.name}
                      onClick={() => setBannerUrl(b.url)}
                      style={{
                        aspectRatio: '16/9', borderRadius: '10px', overflow: 'hidden',
                        border: bannerUrl === b.url ? '2px solid var(--accent)' : '1px solid var(--border)',
                        boxShadow: bannerUrl === b.url ? '0 0 14px var(--accent)' : 'none',
                        cursor: 'pointer', position: 'relative', background: '#110e1f'
                      }}
                    >
                      <img src={b.url} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%)', padding: '6px', fontSize: '10.5px', fontWeight: 800, textAlign: 'center', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {b.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontWeight: 700 }}>PASTE CUSTOM IMAGE URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/banner.jpg"
                  value={bannerUrl && bannerUrl.startsWith('animated-') ? '' : (bannerUrl || '')}
                  onChange={e => setBannerUrl(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '13px', padding: '10px 14px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11.5px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  SELECT WIDESCREEN BACKDROP FROM YOUR LIBRARY
                </label>
                {library.filter(m => m.backdrop_path).length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {library.filter(m => m.backdrop_path).slice(0, 18).map(m => {
                      const coverUrl = `https://image.tmdb.org/t/p/w1280${m.backdrop_path}`;
                      const thumbUrl = `https://image.tmdb.org/t/p/w500${m.backdrop_path}`;
                      const isSelected = bannerUrl === coverUrl;
                      return (
                        <div
                          key={m.id || m.tmdb_id}
                          onClick={() => setBannerUrl(coverUrl)}
                          style={{
                            aspectRatio: '16/9',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                            boxShadow: isSelected ? '0 0 14px var(--accent)' : 'none',
                            cursor: 'pointer',
                            position: 'relative',
                            background: '#151224'
                          }}
                        >
                          <img src={thumbUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.9 }} />
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%)', padding: '6px', fontSize: '10.5px', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center', color: '#fff' }}>
                            {m.title}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: '12.5px', color: 'var(--text-dim)', textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    No movies or series found in your watched library yet. Add titles to pick your favorite film cover backdrops!
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setBannerUrl('');
                  if (onUpdateProfile) onUpdateProfile({ bannerUrl: '' });
                  setShowBannerSelector(false);
                }}
                style={{ padding: '8px 16px', fontSize: '12.5px' }}
              >
                Reset Banner
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (onUpdateProfile) onUpdateProfile({ bannerUrl });
                  setShowBannerSelector(false);
                }}
                style={{ padding: '8px 22px', fontSize: '12.5px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Share Card Modal Infographic Overlay */}
      {activeShareCard && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyOrigin: 'center', justifyContent: 'center', padding: '20px',
          backdropFilter: 'blur(16px)'
        }} onClick={() => setActiveShareCard(null)}>
          <div className="glass animate-fade-in-scale" style={{
            width: '100%', maxWidth: '380px', borderRadius: 'var(--radius-xl)',
            overflow: 'hidden', border: '1px solid var(--border)', background: 'rgba(10,8,19,0.98)',
            boxShadow: 'var(--shadow-xl)', padding: '24px', display: 'flex', flexDirection: 'column',
            gap: '16px'
          }} onClick={e => e.stopPropagation()}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>CineLog Chronicles</span>
              <button onClick={() => setActiveShareCard(null)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '18px', cursor: 'pointer' }}>×</button>
            </div>

            <div id="share-card-content" style={{
              background: 'linear-gradient(135deg, rgba(124,111,247,0.12) 0%, rgba(236,72,153,0.06) 100%)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)',
              padding: '20px', display: 'flex', gap: '16px', position: 'relative'
            }}>
              {activeShareCard.poster_path && (
                <img src={`https://image.tmdb.org/t/p/w92${activeShareCard.poster_path}`} alt="" style={{ width: '70px', height: '105px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>{activeShareCard.title}</h3>
                <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '2px' }}>{activeShareCard.release_year}</div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  {activeShareCard.rating && (
                    <span style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '13px' }}>★ {activeShareCard.rating}</span>
                  )}
                  {activeShareCard.is_rewatch && (
                    <span style={{ fontSize: '9px', background: 'rgba(236,72,153,0.1)', color: '#ec4899', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>🔁 Rewatched</span>
                  )}
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '10px', lineHeight: 1.4, borderLeft: '2px solid var(--accent)', paddingLeft: '8px' }}>
                  "{activeShareCard.review || 'No review notes written yet.'}"
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                  <img src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid var(--border)' }} />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>{currentUser?.displayName || currentUser?.username}</span>
                </div>
              </div>
            </div>

            <button className="btn btn-primary" onClick={() => window.print()} style={{ width: '100%', fontSize: '12px', padding: '8px 0' }}>
              🖨️ Print or Save as PDF
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
