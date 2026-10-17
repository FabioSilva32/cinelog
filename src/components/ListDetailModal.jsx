import React, { useState } from 'react';
import { Heart, MessageSquare, Share2, ArrowLeft, X, Trophy, Film, Send, Edit2, Trash2 } from 'lucide-react';

export default function ListDetailModal({
  list,
  currentUser,
  onClose,
  onMovieClick,
  onOpenUserProfile,
  onUpdateList,
  onDeleteList
}) {
  const [commentText, setCommentText] = useState('');
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

  if (!list) return null;

  const isOwner = currentUser?.username && (
    list.author?.username === currentUser.username ||
    list.author?.id === currentUser.id
  );

  const handleToggleLike = () => {
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
  };

  const handleShare = () => {
    const url = window.location.origin + '?list=' + list.id;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: 'comm-' + Date.now(),
      user: {
        id: currentUser?.id || 'anon',
        username: currentUser?.username || 'cinephile',
        displayName: currentUser?.displayName || currentUser?.username || 'Cinephile',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop&q=80'
      },
      text: commentText.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...(list.comments || []), newComment];
    setCommentText('');

    if (onUpdateList) {
      onUpdateList({
        ...list,
        comments: updatedComments
      });
    }
  };

  return (
    <div
      className="modal-backdrop animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 920,
        background: 'rgba(5, 3, 10, 0.88)',
        backdropFilter: 'blur(16px)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        justifyContent: 'center',
        padding: '24px 16px 80px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '860px',
          background: 'linear-gradient(180deg, #13101c 0%, #0d0b13 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)'
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

        {/* List Info Hero */}
        <div style={{ padding: '28px 32px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {/* Creator Chip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
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
                {list.entries?.length || 0} films
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '28px',
            fontWeight: 900,
            letterSpacing: '-0.5px',
            color: '#fff',
            margin: '0 0 12px',
            lineHeight: 1.25
          }}>
            {list.title}
          </h1>

          {/* Description */}
          {list.description && (
            <p style={{
              fontSize: '14.5px',
              color: 'rgba(255, 255, 255, 0.76)',
              lineHeight: 1.6,
              margin: '0 0 20px',
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
                padding: '8px 18px',
                borderRadius: '30px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <Heart size={15} fill={liked ? '#ff4d4d' : 'none'} color={liked ? '#ff4d4d' : '#fff'} />
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
                padding: '8px 16px',
                borderRadius: '30px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <Share2 size={14} />
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
                  padding: '8px 16px',
                  borderRadius: '30px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginLeft: 'auto'
                }}
              >
                <Trash2 size={14} /> Delete List
              </button>
            )}
          </div>
        </div>

        {/* Entries Section */}
        <div style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {(list.entries || []).map((entry, index) => {
              const rankNum = index + 1;
              return (
                <div
                  key={entry.tmdb_id || entry.id || index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '18px',
                    background: 'rgba(255, 255, 255, 0.025)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(136,8,8,0.25)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.025)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                  }}
                >
                  {/* Rank Number Badge */}
                  {list.isRanked ? (
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: rankNum <= 3
                        ? 'linear-gradient(135deg, rgba(245,158,11,0.25) 0%, rgba(136,8,8,0.25) 100%)'
                        : 'rgba(255, 255, 255, 0.06)',
                      border: `1px solid ${rankNum <= 3 ? 'rgba(245,158,11,0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                      color: rankNum <= 3 ? 'var(--gold)' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '16px',
                      flexShrink: 0
                    }}>
                      {rankNum}
                    </div>
                  ) : (
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      marginTop: '10px',
                      flexShrink: 0
                    }} />
                  )}

                  {/* Poster Thumbnail */}
                  <div
                    onClick={() => onMovieClick && onMovieClick(entry.tmdb_id || entry.id, entry.media_type || 'movie')}
                    style={{
                      width: '54px',
                      height: '81px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      cursor: 'pointer',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.5)',
                      transition: 'transform 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    title="Click to view movie details"
                  >
                    {entry.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${entry.poster_path}`}
                        alt={entry.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        🎬
                      </div>
                    )}
                  </div>

                  {/* Film Details & Letterboxd-style entry Note */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span
                        onClick={() => onMovieClick && onMovieClick(entry.tmdb_id || entry.id, entry.media_type || 'movie')}
                        style={{
                          fontSize: '16px',
                          fontWeight: 800,
                          color: '#fff',
                          cursor: 'pointer',
                          transition: 'color 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                        onMouseLeave={e => e.currentTarget.style.color = '#fff'}
                      >
                        {entry.title}
                      </span>
                      {entry.release_year && (
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          ({entry.release_year})
                        </span>
                      )}
                      {entry.rating && (
                        <span style={{
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: 'var(--gold)',
                          borderRadius: '6px',
                          padding: '1px 7px',
                          fontSize: '11px',
                          fontWeight: 800
                        }}>
                          ⭐ {entry.rating}
                        </span>
                      )}
                    </div>

                    {/* Entry Note / Cinephile commentary */}
                    {entry.note ? (
                      <p style={{
                        margin: '6px 0 0',
                        fontSize: '13.5px',
                        color: 'rgba(255, 255, 255, 0.85)',
                        lineHeight: 1.5,
                        fontStyle: 'italic',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderLeft: '3px solid var(--accent)',
                        padding: '6px 12px',
                        borderRadius: '0 8px 8px 0'
                      }}>
                        "{entry.note}"
                      </p>
                    ) : (
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                        Added to list
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comments Section */}
        <div style={{
          padding: '28px 32px 36px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <MessageSquare size={17} color="var(--accent)" />
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0 }}>
              Discussion & Comments ({list.comments?.length || 0})
            </h3>
          </div>

          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop&q=80'}
              alt=""
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
            <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Leave a comment, debate a ranking, or suggest a film..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="form-input"
                style={{ flex: 1, padding: '10px 16px', fontSize: '13.5px', borderRadius: '12px' }}
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="btn btn-primary"
                style={{ padding: '0 20px', borderRadius: '12px', gap: '6px' }}
              >
                <Send size={14} /> Post
              </button>
            </div>
          </form>

          {/* Comment List */}
          {(list.comments && list.comments.length > 0) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {list.comments.map(comm => (
                <div
                  key={comm.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '12px 16px',
                    borderRadius: '12px'
                  }}
                >
                  <img
                    src={comm.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop&q=80'}
                    alt=""
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
                        {comm.user?.displayName || comm.user?.username || 'Cinephile'}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        @{comm.user?.username || 'user'}
                      </span>
                      {comm.createdAt && (
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                          {new Date(comm.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.45 }}>
                      {comm.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)', fontSize: '13px' }}>
              No comments yet. Be the first to share your thoughts on this list!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
