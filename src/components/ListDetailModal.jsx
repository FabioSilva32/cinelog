import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Heart, MessageSquare, Share2, ArrowLeft, X, Trophy, Film, Send, Trash2 } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

export default function ListDetailModal({
  list,
  currentUser,
  onClose,
  onMovieClick,
  onOpenUserProfile,
  onUpdateList,
  onDeleteList
}) {
  useBodyScrollLock(true);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState(list?.comments || []);
  const [liked, setLiked] = useState(() => {
    try {
      const likedSet = JSON.parse(localStorage.getItem('cinelog_liked_lists') || '[]');
      return likedSet.includes(list?.id);
    } catch {
      return false;
    }
  });
  const [likesCount, setLikesCount] = useState(list?.likesCount || 0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadSupabaseComments() {
      if (!isSupabaseConfigured || !list?.id) return;
      try {
        const { data, error } = await supabase
          .from('list_comments')
          .select('*')
          .eq('list_id', String(list.id))
          .order('created_at', { ascending: true });
        if (!error && data && data.length > 0 && isMounted) {
          const mapped = data.map(c => ({
            id: c.id,
            user_id: c.user_id,
            user: {
              id: c.user_id,
              username: c.username,
              displayName: c.display_name || c.username,
              avatar: c.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop&q=80'
            },
            text: c.comment_text,
            createdAt: c.created_at
          }));
          setLocalComments(mapped);
        }
      } catch (err) {
        console.warn('Could not load comments from Supabase:', err);
      }
    }
    loadSupabaseComments();
    return () => { isMounted = false; };
  }, [list?.id]);

  useEffect(() => {
    let isMounted = true;
    async function checkUserLike() {
      if (!isSupabaseConfigured || !currentUser?.id || !list?.id) return;
      try {
        const { data } = await supabase
          .from('list_likes')
          .select('list_id')
          .eq('list_id', String(list.id))
          .eq('user_id', currentUser.id)
          .maybeSingle();
        if (data && isMounted) {
          setLiked(true);
        }
      } catch {}
    }
    checkUserLike();
    return () => { isMounted = false; };
  }, [list?.id, currentUser?.id]);

  if (!list || typeof document === 'undefined') return null;

  const isOwner = currentUser?.username && (
    list.author?.username === currentUser.username ||
    list.author?.id === currentUser.id
  );

  const handleToggleLike = async () => {
    const nextLiked = !liked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      const likedSet = new Set(JSON.parse(localStorage.getItem('cinelog_liked_lists') || '[]'));
      if (nextLiked) likedSet.add(list.id);
      else likedSet.delete(list.id);
      localStorage.setItem('cinelog_liked_lists', JSON.stringify([...likedSet]));
    } catch {}

    if (onUpdateList) {
      onUpdateList({
        ...list,
        likesCount: nextCount
      });
    }

    if (isSupabaseConfigured && currentUser?.id && list?.id) {
      try {
        if (nextLiked) {
          await supabase.from('list_likes').upsert({
            list_id: String(list.id),
            user_id: currentUser.id
          });
        } else {
          await supabase.from('list_likes').delete().eq('list_id', String(list.id)).eq('user_id', currentUser.id);
        }
      } catch (err) {
        console.warn('Could not sync list like to Supabase:', err);
      }
    }
  };

  const handleShare = () => {
    const url = window.location.origin + '?list=' + list.id;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    const tempId = 'comm-' + Date.now();
    const newComment = {
      id: tempId,
      user_id: currentUser?.id || 'anon',
      user: {
        id: currentUser?.id || 'anon',
        username: currentUser?.username || 'cinephile',
        displayName: currentUser?.displayName || currentUser?.username || 'Cinephile',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop&q=80'
      },
      text: text,
      createdAt: new Date().toISOString()
    };

    const nextList = [...(localComments || []), newComment];
    setLocalComments(nextList);
    setCommentText('');

    if (onUpdateList) {
      onUpdateList({
        ...list,
        comments: nextList
      });
    }

    if (isSupabaseConfigured && currentUser?.id) {
      try {
        const { data, error } = await supabase
          .from('list_comments')
          .insert({
            list_id: String(list.id),
            user_id: currentUser.id,
            username: currentUser.username || 'cinephile',
            display_name: currentUser.displayName || currentUser.username || 'Cinephile',
            avatar_url: currentUser.avatar || '',
            comment_text: text
          })
          .select()
          .single();
        if (!error && data) {
          setLocalComments(prev => prev.map(c => c.id === tempId ? { ...c, id: data.id } : c));
        }
      } catch (err) {
        console.warn('Could not save comment to Supabase:', err);
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    const nextList = (localComments || []).filter(c => c.id !== commentId);
    setLocalComments(nextList);
    if (onUpdateList) {
      onUpdateList({
        ...list,
        comments: nextList
      });
    }
    if (isSupabaseConfigured && currentUser?.id) {
      try {
        await supabase.from('list_comments').delete().eq('id', commentId).eq('user_id', currentUser.id);
      } catch (err) {
        console.warn('Could not delete comment from Supabase:', err);
      }
    }
  };

  const entries = list.entries || [];

  return createPortal(
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        background: 'rgba(5, 3, 10, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        animation: 'fadeInOverlay 0.18s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass"
        style={{
          width: '100%',
          maxWidth: '880px',
          height: 'min(92dvh, 860px)',
          maxHeight: 'min(92dvh, 860px)',
          background: 'linear-gradient(180deg, #13101c 0%, #0d0b13 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          margin: 'auto',
          animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Top Header Bar (Pinned) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)',
            flexShrink: 0
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '8px',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
          >
            <ArrowLeft size={16} /> Back to Lists
          </button>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '6px'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Container (Smooth Scroll on Wheel & Touch) */}
        <div style={{
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.2) transparent'
        }}>
          {/* List Info Hero */}
          <div style={{ padding: '24px 30px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {/* Creator Chip */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
              <div
                onClick={() => {
                  if (onOpenUserProfile && list.author) {
                    onClose();
                    onOpenUserProfile(list.author);
                  }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '5px 14px 5px 6px',
                  borderRadius: '50px',
                  cursor: onOpenUserProfile ? 'pointer' : 'default',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => { if (onOpenUserProfile) e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onMouseLeave={e => { if (onOpenUserProfile) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; }}
              >
                <img
                  src={list.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop&q=80'}
                  alt=""
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
                  {list.author?.displayName || list.author?.username || 'Cinephile'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700 }}>
                  @{list.author?.username || 'user'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {list.isRanked && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'rgba(245, 158, 11, 0.14)',
                    color: 'var(--gold)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.5px'
                  }}>
                    <Trophy size={12} /> RANKED
                  </span>
                )}
                <span style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-dim)'
                }}>
                  {entries.length} films
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: '26px',
              fontWeight: 900,
              letterSpacing: '-0.5px',
              color: '#fff',
              margin: '0 0 10px',
              lineHeight: 1.25
            }}>
              {list.title}
            </h1>

            {/* Description */}
            {list.description && (
              <p style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.72)',
                lineHeight: 1.55,
                margin: '0 0 18px',
                maxWidth: '740px'
              }}>
                {list.description}
              </p>
            )}

            {/* Action Row: Like, Share, Delete */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={handleToggleLike}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: liked ? 'rgba(136,8,8,0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${liked ? 'var(--accent)' : 'rgba(255, 255, 255, 0.12)'}`,
                  color: liked ? '#ff4d4d' : '#fff',
                  padding: '7px 16px',
                  borderRadius: '30px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Heart size={14} fill={liked ? '#ff4d4d' : 'none'} color={liked ? '#ff4d4d' : '#fff'} />
                <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
              </button>

              <button
                onClick={handleShare}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  padding: '7px 16px',
                  borderRadius: '30px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Share2 size={13} />
                <span>{copied ? 'Link Copied!' : 'Share'}</span>
              </button>

              {isOwner && onDeleteList && (
                <button
                  onClick={() => onDeleteList(list.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#ef4444',
                    padding: '7px 16px',
                    borderRadius: '30px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginLeft: 'auto'
                  }}
                >
                  <Trash2 size={13} /> Delete List
                </button>
              )}
            </div>
          </div>

          {/* SIDE-BY-SIDE POSTER GRID (Letterboxd Style, No Giant Review Blocks) */}
          <div style={{ padding: 'clamp(16px, 3vw, 24px) clamp(16px, 3vw, 30px)' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(102px, 1fr))',
              gap: '12px'
            }}>
              {entries.map((entry, index) => {
                const rankNum = index + 1;
                return (
                  <div
                    key={entry.tmdb_id || entry.id || index}
                    onClick={() => onMovieClick && onMovieClick(entry.tmdb_id || entry.id, entry.media_type || 'movie')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      position: 'relative',
                      transition: 'transform 0.18s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.18s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = 'var(--accent)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                  >
                    {/* Poster with Rank Badge Overlaid */}
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '2/3',
                      background: 'linear-gradient(145deg, #1f1b2e 0%, #120f1c 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      {/* Underlay fallback placeholder */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px 8px',
                        textAlign: 'center',
                        gap: '6px',
                        background: 'linear-gradient(145deg, #1d1929 0%, #110e19 100%)'
                      }}>
                        <span style={{ fontSize: '24px', opacity: 0.85 }}>🎬</span>
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          color: 'rgba(255, 255, 255, 0.75)',
                          lineHeight: 1.25,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {entry.title}
                        </span>
                      </div>

                      {entry.poster_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w342${entry.poster_path}`}
                          alt={entry.title}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.style.display = 'none';
                          }}
                          style={{
                            position: 'relative',
                            zIndex: 1,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      )}

                      {/* Prominent Ranked Number Badge #1..N */}
                      {list.isRanked && (
                        <div style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          zIndex: 10,
                          background: rankNum <= 3
                            ? 'linear-gradient(135deg, rgba(245,158,11,0.98) 0%, rgba(217,119,6,0.98) 100%)'
                            : 'rgba(10, 8, 20, 0.92)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          border: `1.5px solid ${rankNum <= 3 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.25)'}`,
                          color: rankNum <= 3 ? '#000' : '#fff',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          fontSize: '11px',
                          fontWeight: 900,
                          letterSpacing: '0.3px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.7)',
                          pointerEvents: 'none'
                        }}>
                          #{rankNum}
                        </div>
                      )}

                      {/* Rating Badge */}
                      {entry.rating && (
                        <div style={{
                          position: 'absolute',
                          bottom: '6px',
                          left: '6px',
                          zIndex: 10,
                          background: 'rgba(10, 8, 20, 0.88)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255, 255, 255, 0.18)',
                          borderRadius: '6px',
                          padding: '2px 6px',
                          fontSize: '10px',
                          fontWeight: 800,
                          color: 'var(--gold)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                          pointerEvents: 'none'
                        }}>
                          ★ {entry.rating}
                        </div>
                      )}
                    </div>

                    {/* Meta info underneath */}
                    <div style={{ padding: '8px 10px 10px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{
                        fontSize: '12.5px',
                        fontWeight: 800,
                        color: '#fff',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {entry.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '3px' }}>
                        {entry.release_year || '—'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comments Section */}
          <div style={{
            padding: '24px 30px 32px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <MessageSquare size={16} color="var(--accent)" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>
                Discussion & Comments ({localComments?.length || 0})
              </h3>
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop&q=80'}
                alt=""
                style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              />
              <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Leave a comment, debate a ranking, or suggest a film..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  className="form-input"
                  style={{ flex: 1, padding: '9px 14px', fontSize: '13px', borderRadius: '10px' }}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="btn btn-primary"
                  style={{ padding: '0 18px', borderRadius: '10px', gap: '6px', fontSize: '13px' }}
                >
                  <Send size={13} /> Post
                </button>
              </div>
            </form>

            {/* Comment List */}
            {(localComments && localComments.length > 0) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {localComments.map(comm => {
                  const isAuthor = currentUser?.id && (comm.user_id === currentUser.id || comm.user?.id === currentUser.id);
                  const isUsernameMatch = currentUser?.username && comm.user?.username === currentUser.username;
                  const canDelete = isAuthor || isUsernameMatch;

                  return (
                    <div
                      key={comm.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        position: 'relative'
                      }}
                    >
                      <img
                        src={comm.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop&q=80'}
                        alt=""
                        style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#fff' }}>
                            {comm.user?.displayName || comm.user?.username || 'Cinephile'}
                          </span>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            @{comm.user?.username || 'user'}
                          </span>
                          {comm.createdAt && (
                            <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                              {new Date(comm.createdAt).toLocaleDateString()}
                            </span>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteComment(comm.id)}
                              title="Delete comment"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-dim)',
                                cursor: 'pointer',
                                padding: '2px 4px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'color 0.15s ease'
                              }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.45 }}>
                          {comm.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '12.5px' }}>
                No comments yet. Be the first to share your thoughts on this list!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
