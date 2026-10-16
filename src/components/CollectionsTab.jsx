import React, { useState, useEffect } from 'react';
import { Plus, FolderHeart, Heart, Sparkles, Trash, X, Film, List, Tag, Check, Loader2 } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { FRANCHISE_COLLECTIONS, getSuggestedTags } from '../utils/collections';

const COLLECTION_EMOJIS = ['📚','🎬','⭐','🔥','💎','🎭','🌟','🎪','🏆','🎯','🌙','❤️'];

const MOODS = [
  { id: 'watchlist', label: '⏳ From Watchlist', filter: m => m.status === 'plan_to_watch' },
  { id: 'chill', label: '😌 Chill Night', filter: m => m.genres && (m.genres.includes('Comedy') || m.genres.includes('Animation') || m.genres.includes('Romance')) },
  { id: 'excited', label: '💥 Action Packed', filter: m => m.genres && (m.genres.includes('Action') || m.genres.includes('Thriller')) },
  { id: 'scared', label: '👻 Scare Me', filter: m => m.genres && m.genres.includes('Horror') },
  { id: 'smart', label: '🧠 Brainy', filter: m => m.genres && (m.genres.includes('Sci-Fi') || m.genres.includes('Mystery') || m.genres.includes('Drama')) },
  { id: 'romantic', label: '💖 Romance', filter: m => m.genres && m.genres.includes('Romance') },
  { id: 'adventure', label: '🗺️ Adventure', filter: m => m.genres && m.genres.includes('Adventure') },
  { id: 'favorites', label: '❤️ Re-watch Fav', filter: m => m.favorite && m.status === 'watched' },
  { id: 'unwatched', label: '🎯 Hidden in Library', filter: m => m.status === 'plan_to_watch' && m.rating == null },
  { id: 'any', label: '🎲 Anything!', filter: () => true },
];

function TonightPicker({ library, onMovieClick }) {
  const [mood, setMood] = React.useState('watchlist');
  const [pick, setPick] = React.useState(null);
  const [spinning, setSpinning] = React.useState(false);
  const [pickError, setPickError] = React.useState('');

  const handlePick = () => {
    const moodObj = MOODS.find(m => m.id === mood);
    const pool = library.filter(moodObj.filter);
    if (pool.length === 0) {
      setPickError(`No titles match "${moodObj.label}" in your library. Try a different mood!`);
      setTimeout(() => setPickError(''), 3000);
      return;
    }
    setPickError('');
    setSpinning(true);
    setPick(null);
    setTimeout(() => {
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      setPick(chosen);
      setSpinning(false);
    }, 600);
  };

  return (
    <div>
      {/* Mood Grid */}
      <div className="collections-mood-picker" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {MOODS.map(m => (
          <button key={m.id} onClick={() => { setMood(m.id); setPick(null); }}
            style={{ background: mood === m.id ? 'var(--accent)' : 'rgba(255,255,255,0.04)', color: mood === m.id ? '#fff' : 'var(--text-muted)', border: `1px solid ${mood === m.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={handlePick}
          className="btn btn-primary"
          style={{ height: '44px', padding: '0 24px', fontSize: '14px', gap: '8px', minWidth: '180px' }}
        >
          {spinning ? (
            <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Picking…</>
          ) : (
            <>🎲 Pick for Me!</>
          )}
        </button>
        {pickError && (
          <div className="animate-fade-in" style={{ fontSize: '12px', color: 'var(--red)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '7px 14px', flex: 1 }}>
            {pickError}
          </div>
        )}

        {pick && (
          <div
            onClick={() => onMovieClick && onMovieClick(pick.tmdb_id || pick.id, pick.media_type || (pick.first_air_date || pick.name ? 'tv' : 'movie'))}
            className="animate-fade-in"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(136,8,8,0.08)', border: '1px solid rgba(136,8,8,0.25)', borderRadius: '12px', padding: '10px 16px', cursor: 'pointer', flex: 1, minWidth: '200px', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(136,8,8,0.14)'; e.currentTarget.style.borderColor = 'rgba(136,8,8,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(136,8,8,0.08)'; e.currentTarget.style.borderColor = 'rgba(136,8,8,0.25)'; }}
          >
            {pick.poster_path ? (
              <img src={`https://image.tmdb.org/t/p/w92${pick.poster_path}`} alt={pick.title}
                style={{ width: '36px', height: '54px', objectFit: 'cover', borderRadius: '5px', flexShrink: 0 }} />
            ) : (
              <div style={{ width: '36px', height: '54px', background: 'rgba(136,8,8,0.2)', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🎬</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>🎬 {pick.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {pick.release_year || '—'} · {pick.media_type === 'tv' ? 'Series' : pick.media_type === 'anime' ? 'Anime' : 'Movie'}
                {pick.genres && pick.genres.length > 0 && ` · ${pick.genres.slice(0,2).join(', ')}`}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--accent)', marginTop: '3px', fontWeight: 700 }}>Click to view details →</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CollectionsTab({ library = [], onMovieClick, onSaveMovie }) {
  const [collections, setCollections] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cinelog_collections_v1')) || {}; }
    catch { return {}; }
  });

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEmoji, setNewEmoji] = useState('🎬');
  const [newIsRanked, setNewIsRanked] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedCollection, setExpandedCollection] = useState(null);
  const [autoGroup, setAutoGroup] = useState('franchise');
  const [showEmpty, setShowEmpty] = useState(false);
  const [unwatchedOnlyMap, setUnwatchedOnlyMap] = useState({});
  const [taggingStatus, setTaggingStatus] = useState('');
  const [isTagging, setIsTagging] = useState(false);

  // Real-time synchronization when movies are added to collections anywhere across CineLog
  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('cinelog_collections_v1')) || {};
        setCollections(stored);
      } catch {}
    };
    window.addEventListener('cinelog_collections_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('cinelog_collections_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Auto-tag library movies with their detected franchise tags (MCU, Marvel, DC, Star Wars, etc.)
  const handleAutoTagAll = async () => {
    setIsTagging(true);
    let updatedCount = 0;
    try {
      for (const m of library) {
        const suggested = getSuggestedTags(m);
        if (suggested && suggested.length > 0) {
          const curTags = Array.isArray(m.tags) ? [...m.tags] : [];
          const curLower = new Set(curTags.map(t => String(t).toLowerCase()));
          const newToAdd = suggested.filter(s => !curLower.has(s.toLowerCase()));
          if (newToAdd.length > 0) {
            updatedCount++;
            const updatedMovie = {
              ...m,
              tags: [...curTags, ...newToAdd]
            };
            if (onSaveMovie) {
              await onSaveMovie(updatedMovie);
            }
          }
        }
      }
      setTaggingStatus(`✅ Successfully auto-tagged ${updatedCount} films with their correct franchise collections!`);
    } catch (e) {
      setTaggingStatus('⚠️ Error auto-tagging some titles.');
    } finally {
      setIsTagging(false);
      setTimeout(() => setTaggingStatus(''), 5000);
    }
  };

  // Smart auto-collections from tags
  const smartCollections = React.useMemo(() => {
    const map = {};
    library.forEach(movie => {
      if (Array.isArray(movie.tags)) {
        movie.tags.forEach(tag => {
          if (!map[tag]) map[tag] = [];
          map[tag].push(movie);
        });
      }
    });
    return map;
  }, [library]);

  // Predefined franchise & genre automatic collections powered by centralized registry
  const automaticCollections = React.useMemo(() => {
    const filterByGenre = (genreName) =>
      library.filter(m => m.genres && m.genres.some(g => g.toLowerCase() === genreName.toLowerCase()));

    // Map all franchise collections with robust keyword, tag & studio matching
    const franchiseItems = FRANCHISE_COLLECTIONS.map(f => ({
      id: f.id,
      title: f.title,
      emoji: f.emoji,
      desc: f.desc,
      movies: library.filter(m => f.matcher(m)),
      group: 'franchise'
    }));

    const scifi = filterByGenre('sci-fi').concat(filterByGenre('science fiction'));
    const scifiUnique = scifi.filter((m, index, self) =>
      self.findIndex(t => t.id === m.id || t.tmdb_id === m.tmdb_id) === index
    );

    const horror = filterByGenre('horror');
    const action = filterByGenre('action');
    const romance = filterByGenre('romance');
    const comedy = filterByGenre('comedy');
    const crime = filterByGenre('crime');
    const thriller = filterByGenre('thriller');
    const documentary = filterByGenre('documentary');
    const animation = filterByGenre('animation').filter(m => 
      !(m.tags && m.tags.some(t => t.toLowerCase() === 'anime'))
    );

    const anime = library.filter(m =>
      m.media_type === 'anime' ||
      (m.genres && m.genres.includes('Animation') && m.tags && m.tags.some(t => t.toLowerCase() === 'anime'))
    );

    // Highly rated in library
    const topPicks = library.filter(m => m.rating != null && Number(m.rating) >= 9);

    return [
      ...franchiseItems,
      // ─ Genre Collections ─
      { id: 'scifi', title: 'Sci-Fi Cosmos', emoji: '🌌', desc: 'Venture into deep space, cybernetic worlds, and time loops.', movies: scifiUnique, group: 'genre' },
      { id: 'horror', title: 'Scream Society', emoji: '👻', desc: 'Chill-inducing scares, supernatural entities, and slashers.', movies: horror, group: 'genre' },
      { id: 'action', title: 'Adrenaline Rush', emoji: '💥', desc: 'High-octane stuntwork, chases, and intense combat.', movies: action, group: 'genre' },
      { id: 'romance', title: 'Romance & Beats', emoji: '💖', desc: 'Stories of connections, heartbreaks, and beautiful relations.', movies: romance, group: 'genre' },
      { id: 'comedy', title: 'Chill & Laughs', emoji: '😂', desc: 'Lighthearted humor, situational comedies, and pure joy.', movies: comedy, group: 'genre' },
      { id: 'crime', title: 'Crime & Heist', emoji: '🔫', desc: 'Gangsters, detectives, and masterful cons.', movies: crime, group: 'genre' },
      { id: 'thriller', title: 'Edge of Seat', emoji: '🫀', desc: 'Suspense, tension, and unexpected twists.', movies: thriller, group: 'genre' },
      { id: 'documentary', title: 'Real World Lens', emoji: '📽️', desc: 'Truth is stranger than fiction — powerful real-world stories.', movies: documentary, group: 'genre' },
      { id: 'animation', title: 'Animated Worlds', emoji: '🎨', desc: 'Animation for all ages — Western non-anime animated features.', movies: animation, group: 'genre' },
      { id: 'anime', title: 'Otaku Haven', emoji: '🇯🇵', desc: 'Visual masterpieces from Japanese animation studios.', movies: anime, group: 'genre' },
      // ─ Your Best ─
      { id: 'top', title: 'Your Masterpieces', emoji: '🏆', desc: 'Titles you rated 9/10 or above — the cream of the crop.', movies: topPicks, group: 'best' },
    ];
  }, [library]);

  const getMovie = (id) => library.find(m => String(m.id) === String(id) || String(m.tmdb_id) === String(id));

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const updated = {
      ...collections,
      [newTitle]: {
        description: newDesc,
        emoji: newEmoji,
        movieIds: [],
        isRanked: newIsRanked,
        dateCreated: new Date().toISOString()
      }
    };
    setCollections(updated);
    localStorage.setItem('cinelog_collections_v1', JSON.stringify(updated));
    window.dispatchEvent(new Event('cinelog_collections_updated'));
    setNewTitle(''); setNewDesc(''); setNewEmoji('🎬'); setNewIsRanked(false); setShowCreate(false);
  };

  const handleToggleRanked = (title) => {
    const list = collections[title];
    if (!list) return;
    const updated = {
      ...collections,
      [title]: { ...list, isRanked: !list.isRanked }
    };
    setCollections(updated);
    localStorage.setItem('cinelog_collections_v1', JSON.stringify(updated));
    window.dispatchEvent(new Event('cinelog_collections_updated'));
  };

  const handleMoveMovie = (title, fromIdx, toIdx) => {
    const list = collections[title];
    if (!list || !list.movieIds) return;
    const ids = [...list.movieIds];
    if (toIdx < 0 || toIdx >= ids.length) return;
    const [moved] = ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, moved);
    const updated = {
      ...collections,
      [title]: { ...list, movieIds: ids }
    };
    setCollections(updated);
    localStorage.setItem('cinelog_collections_v1', JSON.stringify(updated));
    window.dispatchEvent(new Event('cinelog_collections_updated'));
  };

  const handleToggleUnwatched = (title) => {
    setUnwatchedOnlyMap(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleAddToList = (title, movieId) => {
    const list = collections[title];
    if (!list) return;
    const updated = { ...collections, [title]: { ...list, movieIds: [...(list.movieIds || []), String(movieId)] } };
    setCollections(updated);
    localStorage.setItem('cinelog_collections_v1', JSON.stringify(updated));
    window.dispatchEvent(new Event('cinelog_collections_updated'));
  };

  const handleRemoveFromList = (title, movieId) => {
    const list = collections[title];
    if (!list) return;
    const updated = { ...collections, [title]: { ...list, movieIds: (list.movieIds || []).filter(id => String(id) !== String(movieId)) } };
    setCollections(updated);
    localStorage.setItem('cinelog_collections_v1', JSON.stringify(updated));
    window.dispatchEvent(new Event('cinelog_collections_updated'));
  };

  const handleDeleteList = (title) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Collection?',
      message: `Are you sure you want to delete the collection "${title}"? This cannot be undone.`,
      onConfirm: () => {
        const updated = { ...collections };
        delete updated[title];
        setCollections(updated);
        localStorage.setItem('cinelog_collections_v1', JSON.stringify(updated));
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '26px', marginBottom: '4px' }}>Collections & Lists</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>Curate your own playlists or browse auto-generated smart collections.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)} style={{ flexShrink: 0 }}>
          <Plus size={15} /> New Collection
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="glass animate-fade-in" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(136,8,8,0.2)', background: 'rgba(136,8,8,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <Sparkles size={16} color="var(--accent)" />
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Create New Collection</h3>
            <button onClick={() => setShowCreate(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div>
                <div className="form-label" style={{ marginBottom: '8px' }}>Icon</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '200px' }}>
                  {COLLECTION_EMOJIS.map(e => (
                    <button key={e} type="button" onClick={() => setNewEmoji(e)}
                      style={{ width: '36px', height: '36px', background: newEmoji === e ? 'rgba(136,8,8,0.2)' : 'rgba(255,255,255,0.03)', border: `1px solid ${newEmoji === e ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '8px', fontSize: '18px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div className="form-label" style={{ marginBottom: '8px' }}>Collection Name *</div>
                  <input type="text" placeholder="e.g. Perfect 10/10 Masterpieces" value={newTitle}
                    onChange={e => setNewTitle(e.target.value)} className="form-input" required />
                </div>
                <div>
                  <div className="form-label" style={{ marginBottom: '8px' }}>Description</div>
                  <textarea placeholder="What makes this collection special?" value={newDesc}
                    onChange={e => setNewDesc(e.target.value)} className="form-input" style={{ minHeight: '70px', resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <input
                    type="checkbox"
                    id="new-collection-ranked"
                    checked={newIsRanked}
                    onChange={e => setNewIsRanked(e.target.checked)}
                    style={{ accentColor: 'var(--accent)', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="new-collection-ranked" style={{ fontSize: '13px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                    🏆 Ranked Mode (Show #1, #2, #3 order & reordering controls)
                  </label>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create Collection</button>
            </div>
          </form>
        </div>
      )}

      {/* Auto-Curated Franchise & Genre Collections */}
      <div>
        {/* Section header with group tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Auto-Curated Smart Collections</h3>
          </div>
          {/* Group Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '3px', marginLeft: 'auto' }}>
            {[
              { id: 'franchise', label: '🎬 Franchises' },
              { id: 'genre', label: '🎭 Genres' },
              { id: 'best', label: '🏆 Your Best' },
            ].map(g => (
              <button key={g.id} onClick={() => setAutoGroup(g.id)}
                style={{ background: autoGroup === g.id ? 'var(--accent)' : 'transparent', color: autoGroup === g.id ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '8px', padding: '5px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                {g.label}
              </button>
            ))}
          </div>
          <button onClick={() => setShowEmpty(p => !p)}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '5px 12px', fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer' }}>
            {showEmpty ? 'Hide empty' : 'Show empty'}
          </button>
          {autoGroup === 'franchise' && (
            <button
              onClick={handleAutoTagAll}
              disabled={isTagging}
              style={{
                background: 'rgba(136,8,8,0.12)',
                border: '1px solid rgba(136,8,8,0.3)',
                borderRadius: '8px',
                padding: '5px 12px',
                fontSize: '11.5px',
                fontWeight: 700,
                color: 'var(--accent)',
                cursor: isTagging ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              title="Automatically scan and tag all matching movies in your library with their franchise collections (MCU, Marvel, DC, Star Wars, etc.)"
            >
              {isTagging ? <Loader2 size={13} className="animate-spin" /> : <Tag size={13} />}
              {isTagging ? 'Tagging films…' : '⚡ Auto-Tag Franchises'}
            </button>
          )}
        </div>

        {/* Status alert if tagged */}
        {taggingStatus && (
          <div style={{
            background: 'rgba(136,8,8,0.12)',
            border: '1px solid rgba(136,8,8,0.35)',
            color: '#FFCDD2',
            borderRadius: '10px',
            padding: '10px 16px',
            fontSize: '12.5px',
            fontWeight: 600,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Check size={16} color="var(--green)" />
            {taggingStatus}
          </div>
        )}

        <div className="collections-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {automaticCollections
            .filter(col => col.group === autoGroup)
            .filter(col => showEmpty || col.movies.length > 0)
            .map(col => (
            <div key={col.id} className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.2s', opacity: col.movies.length === 0 ? 0.55 : 1 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(136,8,8,0.35)'; e.currentTarget.style.background = 'rgba(136,8,8,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = ''; }}>
              
              <div style={{ padding: '16px 16px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontSize: '24px', lineHeight: 1 }}>{col.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '15px' }}>{col.title}</div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>{col.desc}</p>
                    {(() => {
                      const watchedCount = col.movies.filter(m => m.status === 'watched').length;
                      const totalCount = col.movies.length;
                      const pct = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;
                      return (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                            <span style={{ color: col.movies.length > 0 ? 'var(--accent)' : 'var(--text-dim)', fontWeight: 700 }}>
                              {col.movies.length > 0 ? `${col.movies.length} ${col.movies.length === 1 ? 'title' : 'titles'}` : 'No titles yet'}
                            </span>
                            {totalCount > 0 && (
                              <span style={{ color: pct === 100 ? 'var(--green)' : 'var(--text-muted)', fontWeight: 700 }}>
                                {watchedCount}/{totalCount} watched ({pct}%)
                              </span>
                            )}
                          </div>
                          {totalCount > 0 && (
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden', marginTop: '5px' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'var(--green)' : 'linear-gradient(90deg, var(--accent), #880808)', borderRadius: '2px', transition: 'width 0.3s ease' }} />
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {col.movies.length > 0 ? (
                <div style={{ display: 'flex', gap: '6px', padding: '0 16px 16px', overflowX: 'auto', marginTop: '10px' }}>
                  {col.movies.slice(0, 8).map(movie => (
                    <div key={movie.id || movie.tmdb_id} style={{ flexShrink: 0 }}>
                      {movie.poster_path ? (
                        <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title}
                          onClick={() => onMovieClick(movie.tmdb_id || movie.id, movie.media_type || (movie.first_air_date || movie.name ? 'tv' : 'movie'))}
                          style={{ width: '42px', height: '63px', objectFit: 'cover', borderRadius: '5px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'transform 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                          onMouseLeave={e => e.currentTarget.style.transform = ''}
                          title={movie.title}
                        />
                      ) : (
                        <div onClick={() => onMovieClick(movie.tmdb_id || movie.id, movie.media_type || (movie.first_air_date || movie.name ? 'tv' : 'movie'))}
                          style={{ width: '42px', height: '63px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer' }}
                          title={movie.title}>🎬</div>
                      )}
                    </div>
                  ))}
                  {col.movies.length > 8 && (
                    <div style={{ width: '42px', height: '63px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', flexShrink: 0 }}>
                      +{col.movies.length - 8}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '0 16px 16px', fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '8px' }}>
                  Add matching titles to unlock this collection.
                </div>
              )}

            </div>
          ))}
        </div>
        {automaticCollections.filter(col => col.group === autoGroup && (showEmpty || col.movies.length > 0)).length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)', fontSize: '13px' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎬</div>
            No collections have matching titles yet. Add more titles from <strong>Explore</strong> and they'll appear here automatically.
          </div>
        )}
      </div>

      {/* Smart Auto-Tag Collections */}
      {Object.keys(smartCollections).length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sparkles size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Smart Tag Lists</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)', marginLeft: '4px' }}>Auto-generated from your custom tags</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {Object.entries(smartCollections).map(([tag, movies]) => (
              <div key={tag} className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', transition: 'all 0.2s', border: '1px solid var(--border)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(136,8,8,0.35)'; e.currentTarget.style.background = 'rgba(136,8,8,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = ''; }}>
                <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px' }}>🏷️ {tag}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--accent)', marginTop: '2px', fontWeight: 700 }}>{movies.length} films</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', padding: '0 16px 16px', overflowX: 'auto' }}>
                  {movies.slice(0, 8).map(movie => (
                    <div key={movie.id} style={{ flexShrink: 0 }}>
                      <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title}
                        onClick={() => onMovieClick(movie.tmdb_id || movie.id, movie.media_type || (movie.first_air_date || movie.name ? 'tv' : 'movie'))}
                        style={{ width: '42px', height: '63px', objectFit: 'cover', borderRadius: '5px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'transform 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = ''}
                        title={movie.title}
                      />
                    </div>
                  ))}
                  {movies.length > 8 && (
                    <div style={{ width: '42px', height: '63px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', flexShrink: 0 }}>
                      +{movies.length - 8}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TONIGHT'S PICK ───────────────────────────────────────────── */}
      <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid rgba(136,8,8,0.2)', background: 'linear-gradient(135deg, rgba(136,8,8,0.06) 0%, rgba(59,130,246,0.04) 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', background: 'radial-gradient(circle, rgba(136,8,8,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '18px' }}>🎲</span>
          </div>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Tonight's Pick</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '1px' }}>Can't decide? We'll pick something from your watchlist!</p>
          </div>
        </div>

        <TonightPicker library={library} onMovieClick={onMovieClick} />
      </div>

      {/* Custom Collections */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FolderHeart size={18} color="var(--accent)" />
          <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Your Collections</h3>
        </div>

        {Object.keys(collections).length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {Object.entries(collections).map(([title, meta]) => {
              const listMovies = (meta.movieIds || []).map(id => getMovie(id)).filter(Boolean);
              const isRanked = !!meta.isRanked;
              const isOnlyUnwatched = !!unwatchedOnlyMap[title];
              const watchedCount = listMovies.filter(m => m.status === 'watched').length;
              const unwatchedCount = listMovies.length - watchedCount;
              const pct = listMovies.length > 0 ? Math.round((watchedCount / listMovies.length) * 100) : 0;
              const displayedMovies = isOnlyUnwatched
                ? listMovies.filter(m => m.status !== 'watched')
                : listMovies;

              return (
                <div key={title} className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', transition: 'border-color 0.2s', display: 'flex', flexDirection: 'column' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(136,8,8,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>

                  {/* Header */}
                  <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                        {/* 3-Poster stack or Emoji */}
                        {listMovies.filter(m => m.poster_path).length > 0 ? (
                          <div style={{ position: 'relative', width: '60px', height: '44px', flexShrink: 0 }}>
                            {listMovies.filter(m => m.poster_path).slice(0, 3).map((m, idx) => (
                              <img
                                key={m.id || idx}
                                src={`https://image.tmdb.org/t/p/w92${m.poster_path}`}
                                alt=""
                                style={{
                                  position: 'absolute',
                                  top: `${idx * 2}px`,
                                  left: `${idx * 11}px`,
                                  width: '28px',
                                  height: '40px',
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                                  zIndex: idx + 1
                                }}
                              />
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '26px', lineHeight: 1 }}>{meta.emoji || '🎬'}</span>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 800, fontSize: '15.5px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
                            {isRanked && (
                              <span style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--gold)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '6px', fontSize: '9.5px', fontWeight: 800, padding: '1px 5px', letterSpacing: '0.5px' }}>
                                RANKED
                              </span>
                            )}
                          </div>
                          {meta.description && (
                            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meta.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Top Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {/* Toggle Ranked Mode */}
                        <button
                          type="button"
                          onClick={() => handleToggleRanked(title)}
                          title={isRanked ? 'Switch to unranked mode' : 'Switch to ranked 1..N mode'}
                          style={{
                            background: isRanked ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${isRanked ? 'rgba(245,158,11,0.4)' : 'var(--border)'}`,
                            color: isRanked ? 'var(--gold)' : 'var(--text-muted)',
                            borderRadius: '6px', padding: '4px 8px', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s'
                          }}
                        >
                          {isRanked ? '🏆 Ranked' : '🗂️ Unranked'}
                        </button>

                        {/* Toggle Unwatched Only Filter */}
                        {listMovies.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleToggleUnwatched(title)}
                            title={isOnlyUnwatched ? 'Show all titles' : 'Show unwatched titles only'}
                            style={{
                              background: isOnlyUnwatched ? 'rgba(136,8,8,0.2)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${isOnlyUnwatched ? 'var(--accent)' : 'var(--border)'}`,
                              color: isOnlyUnwatched ? '#fff' : 'var(--text-muted)',
                              borderRadius: '6px', padding: '4px 8px', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s'
                            }}
                          >
                            {isOnlyUnwatched ? `👁️ Unwatched (${unwatchedCount})` : '👁️ Filter'}
                          </button>
                        )}

                        {/* Delete button */}
                        <button onClick={() => handleDeleteList(title)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px', transition: 'color 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                          title="Delete Collection">
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Watch Progress Bar */}
                    {listMovies.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-dim)' }}>
                            {listMovies.length} {listMovies.length === 1 ? 'film' : 'films'}
                          </span>
                          <span style={{ color: pct === 100 ? 'var(--green)' : 'var(--text-muted)', fontWeight: 700 }}>
                            {watchedCount}/{listMovies.length} watched ({pct}%)
                          </span>
                        </div>
                        <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'var(--green)' : 'linear-gradient(90deg, var(--accent), #880808)', borderRadius: '2px', transition: 'width 0.3s ease' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Movies Row */}
                  <div style={{ padding: '14px 18px', flex: 1 }}>
                    {displayedMovies.length > 0 ? (
                      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
                        {displayedMovies.map((movie, index) => {
                          const origIndex = (meta.movieIds || []).findIndex(id => String(id) === String(movie.id) || String(id) === String(movie.tmdb_id));
                          const isWatched = movie.status === 'watched';
                          return (
                            <div key={movie.id || movie.tmdb_id || index} style={{ position: 'relative', flexShrink: 0, width: '56px' }}>
                              {/* Rank Tag */}
                              {isRanked && (
                                <div style={{
                                  position: 'absolute', top: '-4px', left: '-4px', zIndex: 3,
                                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                  color: '#000', fontWeight: 900, fontSize: '9px',
                                  padding: '1px 5px', borderRadius: '4px',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.6)'
                                }}>
                                  #{index + 1}
                                </div>
                              )}

                              {/* Watched Indicator Dot */}
                              {isWatched && (
                                <div style={{
                                  position: 'absolute', bottom: '6px', right: '4px', zIndex: 3,
                                  background: 'var(--green)', borderRadius: '50%', width: '8px', height: '8px',
                                  boxShadow: '0 0 6px var(--green)'
                                }} title="Watched" />
                              )}

                              {/* TV badge if TV series */}
                              {(movie.media_type === 'tv' || Boolean(movie.first_air_date)) && (
                                <div style={{
                                  position: 'absolute', top: '4px', left: '4px', zIndex: 3,
                                  background: 'rgba(10, 10, 14, 0.85)',
                                  border: '1px solid rgba(59, 130, 246, 0.5)',
                                  color: '#60A5FA',
                                  borderRadius: '3px', padding: '1px 3.5px',
                                  fontSize: '7px', fontWeight: 900, letterSpacing: '0.04em',
                                  textTransform: 'uppercase', pointerEvents: 'none'
                                }}>
                                  TV
                                </div>
                              )}

                              {/* Poster Image */}
                              <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title}
                                onClick={() => onMovieClick(movie.tmdb_id || movie.id, movie.media_type || (movie.first_air_date || movie.name ? 'tv' : 'movie'))}
                                style={{ width: '56px', height: '84px', objectFit: 'cover', borderRadius: '6px', border: `1px solid ${isWatched ? 'rgba(16,185,129,0.4)' : 'var(--border)'}`, cursor: 'pointer', transition: 'transform 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = ''}
                                title={`${movie.title} (${movie.release_year || '—'})`}
                              />

                              {/* Remove button */}
                              <button
                                onClick={e => { e.stopPropagation(); handleRemoveFromList(title, movie.id || movie.tmdb_id); }}
                                style={{
                                  position: 'absolute', top: '-4px', right: '-4px',
                                  background: 'rgba(239,68,68,0.9)', color: '#fff',
                                  border: 'none', borderRadius: '50%', width: '16px', height: '16px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '9px', fontWeight: 900, cursor: 'pointer',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)', zIndex: 4,
                                  opacity: 0, transition: 'opacity 0.15s'
                                }}
                                onMouseOver={e => e.currentTarget.style.opacity = 1}
                                onMouseOut={e => e.currentTarget.style.opacity = 0}
                                title="Remove from collection">✕</button>

                              {/* Ranked Mode Reorder Controls (Move Left / Right) */}
                              {isRanked && (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '4px' }}>
                                  <button
                                    type="button"
                                    disabled={origIndex <= 0}
                                    onClick={e => { e.stopPropagation(); handleMoveMovie(title, origIndex, origIndex - 1); }}
                                    style={{
                                      background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '3px',
                                      color: origIndex <= 0 ? 'rgba(255,255,255,0.15)' : '#fff',
                                      fontSize: '9px', padding: '1px 4px', cursor: origIndex <= 0 ? 'default' : 'pointer'
                                    }}
                                    title="Move higher rank"
                                  >
                                    ◀
                                  </button>
                                  <button
                                    type="button"
                                    disabled={origIndex >= (meta.movieIds || []).length - 1}
                                    onClick={e => { e.stopPropagation(); handleMoveMovie(title, origIndex, origIndex + 1); }}
                                    style={{
                                      background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '3px',
                                      color: origIndex >= (meta.movieIds || []).length - 1 ? 'rgba(255,255,255,0.15)' : '#fff',
                                      fontSize: '9px', padding: '1px 4px', cursor: origIndex >= (meta.movieIds || []).length - 1 ? 'default' : 'pointer'
                                    }}
                                    title="Move lower rank"
                                  >
                                    ▶
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '18px', color: 'var(--text-dim)', fontSize: '12px' }}>
                        {isOnlyUnwatched ? '🎉 You have watched all titles in this collection!' : 'No titles in this collection yet.'}
                      </div>
                    )}
                  </div>

                  {/* Add movie dropdown */}
                  <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)' }}>
                    <select
                      onChange={e => { if (e.target.value) { handleAddToList(title, e.target.value); e.target.value = ''; } }}
                      className="form-input"
                      style={{ width: '100%', height: '34px', padding: '0 10px', background: 'rgba(255,255,255,0.04)', color: 'var(--text)', fontSize: '12px' }}
                    >
                      <option value="">+ Add title from library…</option>
                      {library.filter(m => !(meta.movieIds || []).includes(String(m.id)) && !(meta.movieIds || []).includes(String(m.tmdb_id)))
                        .map(m => <option key={m.id || m.tmdb_id} value={m.id || m.tmdb_id}>{m.title} ({m.release_year || '—'})</option>)}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass" style={{ padding: '48px 24px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <div style={{ fontSize: '42px', marginBottom: '12px' }}>📂</div>
            <div style={{ fontWeight: 700, fontSize: '17px', marginBottom: '8px' }}>No Collections Yet</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', maxWidth: '360px', margin: '0 auto 20px' }}>
              Create your first collection to organize your favorite movies into curated playlists.
            </p>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <Plus size={15} /> Create Your First Collection
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}


