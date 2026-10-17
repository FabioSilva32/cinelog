import React, { useState, useEffect, useMemo } from 'react';
import { Plus, FolderHeart, Heart, Sparkles, Trash, X, Film, List, Tag, Check, Loader2, Trophy, MessageSquare, ArrowRight, BookOpen, Layers } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { FRANCHISE_COLLECTIONS, getSuggestedTags } from '../utils/collections';
import { INITIAL_COMMUNITY_LISTS } from '../mockListsData';
import ListDetailModal from './ListDetailModal';
import CreateListModal from './CreateListModal';
import CollectionDetailModal from './CollectionDetailModal';

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

export default function CollectionsTab({
  library = [],
  currentUser,
  onMovieClick,
  onOpenUserProfile,
  onSaveMovie
}) {
  // ── Letterboxd-Style Lists State ──────────────────────────────────────────
  const [lists, setLists] = useState(() => {
    try {
      const stored = localStorage.getItem('cinelog_community_lists_v2');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_COMMUNITY_LISTS;
  });

  const [listsTab, setListsTab] = useState('popular'); // 'popular' | 'recent' | 'my_lists'
  const [selectedListModal, setSelectedListModal] = useState(null);
  const [showCreateListModal, setShowCreateListModal] = useState(false);

  // ── Open Collection Detail Modal State ─────────────────────────────────────
  const [selectedCollectionModal, setSelectedCollectionModal] = useState(null);

  // ── Legacy Custom Collections State ───────────────────────────────────────
  const [collections, setCollections] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cinelog_collections_v1')) || {}; }
    catch { return {}; }
  });

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEmoji, setNewEmoji] = useState('🎬');
  const [newIsRanked, setNewIsRanked] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [autoGroup, setAutoGroup] = useState('franchise');
  const [showEmpty, setShowEmpty] = useState(true);
  const [unwatchedOnlyMap, setUnwatchedOnlyMap] = useState({});
  const [taggingStatus, setTaggingStatus] = useState('');
  const [isTagging, setIsTagging] = useState(false);

  // Sync lists to localStorage
  const handleUpdateList = (updatedList) => {
    setLists(prev => {
      const next = prev.map(l => l.id === updatedList.id ? updatedList : l);
      try { localStorage.setItem('cinelog_community_lists_v2', JSON.stringify(next)); } catch {}
      return next;
    });
    if (selectedListModal && selectedListModal.id === updatedList.id) {
      setSelectedListModal(updatedList);
    }
  };

  const handleSaveNewList = (newList) => {
    setLists(prev => {
      const next = [newList, ...prev];
      try { localStorage.setItem('cinelog_community_lists_v2', JSON.stringify(next)); } catch {}
      return next;
    });
    setSelectedListModal(newList);
  };

  const handleDeleteList = (listId) => {
    setLists(prev => {
      const next = prev.filter(l => l.id !== listId);
      try { localStorage.setItem('cinelog_community_lists_v2', JSON.stringify(next)); } catch {}
      return next;
    });
    if (selectedListModal && selectedListModal.id === listId) {
      setSelectedListModal(null);
    }
  };

  // Real-time synchronization when movies or collections update
  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('cinelog_collections_v1')) || {};
        setCollections(stored);
      } catch {}
      try {
        const storedLists = JSON.parse(localStorage.getItem('cinelog_community_lists_v2'));
        if (storedLists) setLists(storedLists);
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

  // Auto-tag library movies with their detected franchise tags
  const handleAutoTagAll = async () => {
    setIsTagging(true);
    let updatedCount = 0;
    try {
      const updates = [];
      for (const m of library) {
        const suggested = getSuggestedTags(m);
        if (suggested && suggested.length > 0) {
          const curTags = Array.isArray(m.tags) ? [...m.tags] : [];
          const curLower = new Set(curTags.map(t => String(t).toLowerCase()));
          const newToAdd = suggested.filter(s => !curLower.has(s.toLowerCase()));
          if (newToAdd.length > 0) {
            updatedCount++;
            updates.push({
              ...m,
              tags: [...curTags, ...newToAdd]
            });
          }
        }
      }

      // Save in small concurrent batches to prevent timeouts
      for (let i = 0; i < updates.length; i += 6) {
        const chunk = updates.slice(i, i + 6);
        if (onSaveMovie) {
          await Promise.all(chunk.map(item => onSaveMovie(item)));
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

  // Known franchise tags to prevent duplicate smart collections (e.g. no 2nd MCU collection)
  const knownFranchiseTags = useMemo(() => {
    const s = new Set();
    FRANCHISE_COLLECTIONS.forEach(f => {
      if (f.tag) s.add(f.tag.toLowerCase());
      if (f.id) s.add(f.id.toLowerCase());
      if (f.shortTitle) s.add(f.shortTitle.toLowerCase());
    });
    s.add('mcu');
    s.add('marvel');
    s.add('marvel cinematic universe');
    s.add('dc');
    s.add('dceu');
    s.add('star wars');
    s.add('batman');
    s.add('spider-man');
    s.add('spiderman');
    s.add('harry potter');
    s.add('lord of the rings');
    return s;
  }, []);

  // Smart auto-collections from tags, cleanly deduplicated against franchise collections
  const smartCollections = useMemo(() => {
    const map = {};
    library.forEach(movie => {
      if (Array.isArray(movie.tags)) {
        movie.tags.forEach(tag => {
          const cleanTag = String(tag || '').trim();
          if (!cleanTag) return;
          // Merge into existing CineLog Originals rather than creating a duplicate MCU tag list
          if (knownFranchiseTags.has(cleanTag.toLowerCase())) return;
          if (!map[cleanTag]) map[cleanTag] = [];
          map[cleanTag].push(movie);
        });
      }
    });
    return map;
  }, [library, knownFranchiseTags]);

  // Predefined franchise & genre automatic collections powered by centralized registry
  const automaticCollections = useMemo(() => {
    const filterByGenre = (genreName) =>
      library.filter(m => m.genres && m.genres.some(g => g.toLowerCase() === genreName.toLowerCase()));

    // Map all franchise collections with robust keyword, tag & studio matching
    const franchiseItems = FRANCHISE_COLLECTIONS.map(f => {
      const catalogue = f.catalogue || [];
      const userMatched = library.filter(m => f.matcher(m));

      let movies = [];
      if (catalogue.length > 0) {
        // Merge catalogue with user library items
        movies = catalogue.map(catMovie => {
          const found = library.find(libM =>
            String(libM.tmdb_id || libM.id) === String(catMovie.tmdb_id || catMovie.id) ||
            (libM.title && catMovie.title && libM.title.toLowerCase().trim() === catMovie.title.toLowerCase().trim())
          );
          return found ? { ...catMovie, ...found, inLibrary: true } : { ...catMovie, inLibrary: false, status: 'unwatched' };
        });

        // Also add any extra user movies that matched the franchise matcher but weren't in static catalogue
        userMatched.forEach(userM => {
          const already = movies.some(m => String(m.tmdb_id || m.id) === String(userM.tmdb_id || userM.id));
          if (!already) {
            movies.push({ ...userM, inLibrary: true });
          }
        });
      } else {
        movies = userMatched;
      }

      return {
        id: f.id,
        title: f.title,
        emoji: f.emoji,
        desc: f.desc,
        movies,
        group: 'franchise'
      };
    });

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

  // Filtered Community / User Lists
  const displayedLists = useMemo(() => {
    let result = [...lists];
    if (listsTab === 'popular') {
      result.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else if (listsTab === 'recent') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (listsTab === 'my_lists') {
      result = result.filter(l =>
        l.author?.username === currentUser?.username ||
        l.author?.id === currentUser?.id
      );
    }
    return result;
  }, [lists, listsTab, currentUser]);

  const myListsCount = useMemo(() => {
    return lists.filter(l =>
      l.author?.username === currentUser?.username ||
      l.author?.id === currentUser?.id
    ).length;
  }, [lists, currentUser]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '42px', paddingBottom: '60px' }}>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP SECTION: LETTERBOXD-STYLE COMMUNITY LISTS & RANKINGS                */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <BookOpen size={22} color="var(--accent)" />
              <h2 style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.5px', margin: 0, color: '#fff' }}>
                Community Lists & Curations
              </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', margin: 0 }}>
              Browse cinephile rankings, themed lists, or build your own custom Letterboxd-style list with personal film notes.
            </p>
          </div>

          <button
            onClick={() => setShowCreateListModal(true)}
            className="btn btn-primary"
            style={{
              padding: '10px 20px',
              borderRadius: '50px',
              gap: '8px',
              fontSize: '13.5px',
              fontWeight: 800,
              boxShadow: '0 8px 24px rgba(136,8,8,0.35)',
              flexShrink: 0
            }}
          >
            <Plus size={16} /> Create List
          </button>
        </div>

        {/* List Subtabs: Popular | Recent | My Lists */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            { id: 'popular', label: '🔥 Popular Lists' },
            { id: 'recent', label: '✨ Recent' },
            { id: 'my_lists', label: `👤 My Lists (${myListsCount})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setListsTab(tab.id)}
              style={{
                background: listsTab === tab.id ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                color: listsTab === tab.id ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${listsTab === tab.id ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '20px',
                padding: '7px 16px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lists Grid */}
        {displayedLists.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {displayedLists.map(list => {
              const entries = list.entries || [];
              const previewPosters = entries.filter(e => e.poster_path).slice(0, 5);

              return (
                <div
                  key={list.id}
                  onClick={() => setSelectedListModal(list)}
                  className="glass"
                  style={{
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                    position: 'relative'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(136,8,8,0.4)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 16px 36px rgba(0,0,0,0.6)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  {/* Top Creator Info & Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '14px' }}>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenUserProfile && list.author) {
                          onOpenUserProfile(list.author);
                        }
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: onOpenUserProfile ? 'pointer' : 'default' }}
                    >
                      <img
                        src={list.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop&q=80'}
                        alt=""
                        style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#fff' }}>
                        {list.author?.displayName || list.author?.username}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {list.isRanked && (
                        <span style={{
                          background: 'rgba(245, 158, 11, 0.14)',
                          color: 'var(--gold)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          borderRadius: '6px',
                          padding: '1px 6px',
                          fontSize: '10px',
                          fontWeight: 800
                        }}>
                          🏆 RANKED
                        </span>
                      )}
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '6px',
                        padding: '1px 6px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        color: 'var(--text-dim)'
                      }}>
                        {entries.length} films
                      </span>
                    </div>
                  </div>

                  {/* 5-Poster Overlapping Showcase */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    margin: '4px 0 16px',
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
                          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                          background: '#191522',
                          position: 'relative'
                        }}
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {list.isRanked && (
                          <div style={{
                            position: 'absolute',
                            top: '3px',
                            left: '3px',
                            background: 'rgba(0,0,0,0.85)',
                            color: '#fff',
                            borderRadius: '4px',
                            padding: '1px 4px',
                            fontSize: '9.5px',
                            fontWeight: 900
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
                          fontSize: '14px',
                          color: 'var(--text-dim)'
                        }}
                      >
                        🎬
                      </div>
                    ))}
                  </div>

                  {/* List Title & Description */}
                  <h3 style={{
                    fontSize: '16.5px',
                    fontWeight: 900,
                    color: '#fff',
                    margin: '0 0 6px',
                    lineHeight: 1.3
                  }}>
                    {list.title}
                  </h3>

                  {list.description && (
                    <p style={{
                      fontSize: '12.5px',
                      color: 'rgba(255, 255, 255, 0.65)',
                      lineHeight: 1.45,
                      margin: '0 0 16px',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      flex: 1
                    }}>
                      {list.description}
                    </p>
                  )}

                  {/* Bottom Stats: Likes & Comments */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '12px',
                    color: 'var(--text-dim)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Heart size={13} color="var(--red)" fill="var(--red)" /> {list.likesCount || 0}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <MessageSquare size={13} color="var(--text-dim)" /> {list.comments?.length || 0}
                      </span>
                    </div>

                    <span style={{
                      color: 'var(--accent)',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      View List →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📝</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              {listsTab === 'my_lists' ? 'You haven’t created any lists yet' : 'No lists found'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>
              Create your own ranked top 10, theme collection, or watchlist curation.
            </div>
            <button
              onClick={() => setShowCreateListModal(true)}
              className="btn btn-primary"
              style={{ borderRadius: '50px', padding: '8px 20px' }}
            >
              + Create Your First List
            </button>
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 2. TONIGHT'S PICK INTERACTIVE ROULETTE                                    */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
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

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 3. CINELOG ORIGINALS & FRANCHISES (MOVED TO BOTTOM WITH DIRECT OPENING)    */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '18px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="var(--accent)" />
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
                CineLog Originals & Franchises
              </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0' }}>
              Official franchise timelines, genre archives, and smart studio vaults. Click any collection to explore all titles.
            </p>
          </div>

          {/* Group Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '3px' }}>
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
                  gap: '6px'
                }}
                title="Automatically scan and tag all matching movies in your library with their franchise collections (MCU, Marvel, DC, Star Wars, etc.)"
              >
                {isTagging ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={13} />}
                {isTagging ? 'Auto-Tagging…' : '⚡ Auto-Tag Franchises'}
              </button>
            )}
          </div>
        </div>

        {taggingStatus && (
          <div className="animate-fade-in" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '10px 16px', fontSize: '12.5px', color: 'var(--green)', marginBottom: '16px', fontWeight: 600 }}>
            {taggingStatus}
          </div>
        )}

        {/* Collection Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {automaticCollections.filter(col => col.group === autoGroup && (showEmpty || col.movies.length > 0)).map(col => {
            const watchedCount = col.movies.filter(m => m.status === 'watched').length;
            const totalCount = col.movies.length;
            const pct = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

            return (
              <div
                key={col.id}
                onClick={() => setSelectedCollectionModal(col)}
                className="glass"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(136,8,8,0.4)';
                  e.currentTarget.style.background = 'rgba(136,8,8,0.03)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = '';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0 }}>{col.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ fontWeight: 800, fontSize: '15px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {col.title}
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {col.desc}
                      </div>

                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
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
                          <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'var(--green)' : 'linear-gradient(90deg, var(--accent), #880808)', borderRadius: '2px', transition: 'width 0.3s ease' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Posters Preview strip */}
                {col.movies.length > 0 ? (
                  <div
                    onWheel={(e) => {
                      if (e.shiftKey && e.deltaY !== 0) {
                        e.currentTarget.scrollLeft += e.deltaY;
                      }
                    }}
                    style={{
                      display: 'flex',
                      gap: '6px',
                      padding: '0 16px 14px',
                      overflowX: 'auto',
                      marginTop: '6px',
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(255,255,255,0.15) transparent',
                      WebkitOverflowScrolling: 'touch',
                      touchAction: 'pan-x pan-y'
                    }}
                  >
                    {col.movies.slice(0, 8).map(movie => (
                      <div key={movie.id || movie.tmdb_id} style={{ flexShrink: 0 }}>
                        {movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                            alt={movie.title}
                            onClick={(e) => {
                              e.stopPropagation();
                              onMovieClick(movie.tmdb_id || movie.id, movie.media_type || (movie.first_air_date || movie.name ? 'tv' : 'movie'));
                            }}
                            style={{ width: '42px', height: '63px', objectFit: 'cover', borderRadius: '5px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'transform 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = ''}
                            title={movie.title}
                          />
                        ) : (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              onMovieClick(movie.tmdb_id || movie.id, movie.media_type || (movie.first_air_date || movie.name ? 'tv' : 'movie'));
                            }}
                            style={{ width: '42px', height: '63px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer' }}
                            title={movie.title}
                          >
                            🎬
                          </div>
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
                  <div style={{ padding: '0 16px 14px', fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '4px' }}>
                    Add matching titles to unlock this collection.
                  </div>
                )}

                <div style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.02)',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  fontSize: '11.5px',
                  color: 'var(--accent)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '4px'
                }}>
                  Open Collection →
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 4. SMART AUTO-TAG COLLECTIONS (DEDUPLICATED AGAINST FRANCHISES)           */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {Object.keys(smartCollections).length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sparkles size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Smart Tag Collections</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)', marginLeft: '4px' }}>Auto-grouped from your unique custom tags</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {Object.entries(smartCollections).map(([tag, movies]) => (
              <div
                key={tag}
                onClick={() => setSelectedCollectionModal({
                  id: 'tag-' + tag,
                  title: tag,
                  emoji: '🏷️',
                  desc: `Films tagged with #${tag} in your library.`,
                  movies
                })}
                className="glass"
                style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', transition: 'all 0.2s', border: '1px solid var(--border)', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(136,8,8,0.35)'; e.currentTarget.style.background = 'rgba(136,8,8,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = ''; }}
              >
                <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px' }}>🏷️ {tag}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--accent)', marginTop: '2px', fontWeight: 700 }}>{movies.length} films</div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Open →</span>
                </div>
                <div
                  onWheel={(e) => {
                    if (e.shiftKey && e.deltaY !== 0) {
                      e.currentTarget.scrollLeft += e.deltaY;
                    }
                  }}
                  style={{
                    display: 'flex',
                    gap: '6px',
                    padding: '0 16px 16px',
                    overflowX: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255,255,255,0.15) transparent',
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'pan-x pan-y'
                  }}
                >
                  {movies.slice(0, 8).map(movie => (
                    <div key={movie.id} style={{ flexShrink: 0 }}>
                      <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMovieClick(movie.tmdb_id || movie.id, movie.media_type || (movie.first_air_date || movie.name ? 'tv' : 'movie'));
                        }}
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

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 5. LEGACY USER COLLECTIONS                                                */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {Object.keys(collections).length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <FolderHeart size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Your Saved Playlists</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {Object.entries(collections).map(([title, meta]) => {
              const listMovies = (meta.movieIds || []).map(id => getMovie(id)).filter(Boolean);
              const watchedCount = listMovies.filter(m => m.status === 'watched').length;
              const pct = listMovies.length > 0 ? Math.round((watchedCount / listMovies.length) * 100) : 0;

              return (
                <div
                  key={title}
                  onClick={() => setSelectedCollectionModal({
                    id: 'custom-' + title,
                    title,
                    emoji: meta.emoji || '🎬',
                    desc: meta.description || '',
                    movies: listMovies
                  })}
                  className="glass"
                  style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(136,8,8,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>{meta.emoji || '🎬'}</span>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '15px', color: '#fff' }}>{title}</div>
                          {meta.description && (
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{meta.description}</div>
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700 }}>Open →</span>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                        <span style={{ color: 'var(--text-dim)' }}>{listMovies.length} films</span>
                        <span style={{ color: pct === 100 ? 'var(--green)' : 'var(--text-muted)', fontWeight: 700 }}>{pct}% watched</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), #880808)' }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      {selectedListModal && (
        <ListDetailModal
          list={selectedListModal}
          currentUser={currentUser}
          onClose={() => setSelectedListModal(null)}
          onMovieClick={onMovieClick}
          onOpenUserProfile={onOpenUserProfile}
          onUpdateList={handleUpdateList}
          onDeleteList={handleDeleteList}
        />
      )}

      {showCreateListModal && (
        <CreateListModal
          currentUser={currentUser}
          library={library}
          onClose={() => setShowCreateListModal(false)}
          onSaveList={handleSaveNewList}
        />
      )}

      {selectedCollectionModal && (
        <CollectionDetailModal
          collection={selectedCollectionModal}
          onClose={() => setSelectedCollectionModal(null)}
          onMovieClick={onMovieClick}
        />
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(p => ({ ...p, isOpen: false }))}
      />
    </div>
  );
}
