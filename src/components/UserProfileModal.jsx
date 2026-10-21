import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserMinus, Film, Star, Heart, Calendar, Award } from 'lucide-react';
import AvatarWithBorder from './AvatarWithBorder';
import { supabase } from '../supabaseClient';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export default function UserProfileModal({ targetUser, currentUser, onClose, onMovieClick }) {
  useBodyScrollLock(true);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [profile, setProfile] = useState(targetUser || null);
  const [userLibrary, setUserLibrary] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const userId = targetUser?.id || targetUser?.user_id;

  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      setLoading(true);
      try {
        let profileData = targetUser;

        // Fetch full profile from Supabase if we only have minimal info or an ID
        if (userId && supabase) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (data && !error) {
            profileData = {
              id: data.id,
              username: data.username || data.display_name,
              displayName: data.display_name || data.username || 'CineLog Member',
              avatar: data.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
              bio: data.bio || '',
              equippedBorder: data.equipped_border || 'none',
              bannerUrl: data.banner_url || '',
              favorites: data.favorites || []
            };
          }
        }

        if (isMounted) setProfile(profileData);

        // Fetch public library for this user
        if (userId && supabase) {
          const { data: libData } = await supabase
            .from('library')
            .select('*')
            .eq('user_id', userId)
            .order('date_added', { ascending: false });

          if (isMounted) setUserLibrary(libData || []);
        }

        // Fetch badges from user_badges table
        if (userId && supabase) {
          try {
            const { data: bData } = await supabase
              .from('user_badges')
              .select('*')
              .eq('user_id', userId);

            if (isMounted && bData && bData.length > 0) {
              setBadges(bData);
            }
          } catch {}
        }

        // Check follow status
        if (currentUser?.id && userId && supabase && currentUser.id !== userId) {
          const { data: followData } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', currentUser.id)
            .eq('following_id', userId)
            .maybeSingle();

          if (isMounted) setIsFollowing(!!followData);
        }
      } catch (err) {
        console.warn('Error fetching user profile modal data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserData();
    return () => { isMounted = false; };
  }, [userId, currentUser?.id]);

  const handleToggleFollow = async () => {
    if (!currentUser?.id || !userId || currentUser.id === userId) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', userId);
        setIsFollowing(false);
      } else {
        await supabase.from('follows').upsert({ follower_id: currentUser.id, following_id: userId }, { onConflict: 'follower_id,following_id' });
        setIsFollowing(true);
      }
    } catch (err) {
      console.warn('Follow toggle error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const displayName = profile?.displayName || profile?.display_name || profile?.username || 'CineLog User';
  const username = profile?.username || 'user';
  const avatarUrl = profile?.avatar || profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
  const bio = profile?.bio || 'Passionate film lover tracking movies on CineLog.';
  const equippedBorder = profile?.equippedBorder || profile?.equipped_border || 'none';

  const watchedCount = userLibrary.filter(m => m.status === 'watched').length;
  const ratingMovies = userLibrary.filter(m => m.rating);
  const avgRating = ratingMovies.length > 0
    ? (ratingMovies.reduce((s, m) => s + Number(m.rating), 0) / ratingMovies.length).toFixed(1)
    : null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      onWheel={e => e.stopPropagation()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(0, 0, 0, 0.82)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', animation: 'fadeIn 0.2s ease-out',
        overscrollBehavior: 'contain'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        onWheel={e => e.stopPropagation()}
        className="glass animate-fade-in-scale"
        style={{
          width: '100%', maxWidth: '640px', maxHeight: '88vh',
          borderRadius: '24px', border: '1px solid var(--border)',
          background: 'rgba(18, 18, 24, 0.95)', overflowY: 'auto',
          position: 'relative', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
          overscrollBehavior: 'contain'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px', zIndex: 10,
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', borderRadius: '50%', width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <X size={18} />
        </button>

        {/* Profile Header / Banner */}
        <div
          style={{
            height: '140px', width: '100%',
            background: profile?.bannerUrl
              ? `url(${profile.bannerUrl}) center/cover`
              : 'linear-gradient(135deg, rgba(136,8,8,0.3) 0%, rgba(136,8,8,0.2) 100%)',
            position: 'relative', flexShrink: 0
          }}
        />

        {/* User Details */}
        <div style={{ padding: '0 24px 24px', marginTop: '-44px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '14px' }}>
            <AvatarWithBorder
              src={avatarUrl}
              username={username}
              borderId={equippedBorder}
              size={88}
            />

            {currentUser?.id && currentUser.id !== userId && (
              <button
                onClick={handleToggleFollow}
                disabled={followLoading}
                className="btn"
                style={{
                  background: isFollowing ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #880808, #880808)',
                  border: isFollowing ? '1px solid var(--border)' : 'none',
                  color: '#fff', padding: '9px 20px', borderRadius: '50px',
                  fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {isFollowing ? <><UserMinus size={15} /> Following</> : <><UserPlus size={15} /> Follow</>}
              </button>
            )}
          </div>

          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {displayName}
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: 600, marginTop: '2px' }}>
              @{username}
            </div>
            {bio && (
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '10px', lineHeight: 1.5, margin: '10px 0 0 0' }}>
                {bio}
              </p>
            )}
          </div>

          {/* User Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', padding: '14px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>{loading ? '...' : watchedCount}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px' }}>Watched</div>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--gold)' }}>{loading ? '...' : (avgRating ? `${avgRating} ★` : 'N/A')}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px' }}>Avg Rating</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--accent)' }}>{loading ? '...' : userLibrary.length}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px' }}>Total Logs</div>
            </div>
          </div>

          {/* User Badges Ribbon */}
          {badges.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={13} color="var(--gold)" /> Unlocked Badges & Trophies ({badges.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {badges.map(b => (
                  <div
                    key={b.id || b.badge_id}
                    style={{
                      background: 'rgba(255, 215, 0, 0.08)',
                      border: '1px solid rgba(255, 215, 0, 0.25)',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      color: 'var(--gold)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>{b.badge_icon || '🎖️'}</span>
                    <span>{b.badge_name || b.badge_id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User's Recent Activity / Library */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Film size={15} /> Recent Movie Activity
            </h3>

            {loading ? (
              <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
                Loading profile activity...
              </div>
            ) : userLibrary.length === 0 ? (
              <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                No public movie logs shared yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {userLibrary.slice(0, 8).map(movie => (
                  <div
                    key={movie.id}
                    onClick={() => { if (onMovieClick) { onMovieClick(movie); onClose(); } }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 14px',
                      background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                      borderRadius: '12px', cursor: onMovieClick ? 'pointer' : 'default',
                      transition: 'transform 0.2s, background 0.2s'
                    }}
                  >
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                        alt={movie.title}
                        style={{ width: '40px', height: '58px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '40px', height: '58px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🎬</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {movie.title} <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 500 }}>({movie.release_year})</span>
                      </div>
                      {movie.review && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          "{movie.review}"
                        </div>
                      )}
                    </div>
                    {movie.rating && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(245,158,11,0.1)', color: 'var(--gold)', padding: '4px 10px', borderRadius: '20px', fontWeight: 800, fontSize: '12.5px' }}>
                        <Star size={13} fill="currentColor" /> {movie.rating}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

