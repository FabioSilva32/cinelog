import React, { useState } from 'react';
import { Plus, FolderHeart, Heart, Sparkles, Trash, X, Film, List } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {MOODS.map(m => (
          <button key={m.id} onClick={() => { setMood(m.id); setPick(null); }}
            style={{ background: mood === m.id ? 'var(--accent)' : 'rgba(255,255,255,0.04)', color: mood === m.id ? '#fff' : 'var(--text-muted)', border: `1px solid ${mood === m.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
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
            onClick={() => onMovieClick && onMovieClick(pick.tmdb_id || pick.id, pick.media_type || 'movie')}
            className="animate-fade-in"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(124,111,247,0.08)', border: '1px solid rgba(124,111,247,0.25)', borderRadius: '12px', padding: '10px 16px', cursor: 'pointer', flex: 1, minWidth: '200px', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,111,247,0.14)'; e.currentTarget.style.borderColor = 'rgba(124,111,247,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,111,247,0.08)'; e.currentTarget.style.borderColor = 'rgba(124,111,247,0.25)'; }}
          >
            {pick.poster_path ? (
              <img src={`https://image.tmdb.org/t/p/w92${pick.poster_path}`} alt={pick.title}
                style={{ width: '36px', height: '54px', objectFit: 'cover', borderRadius: '5px', flexShrink: 0 }} />
            ) : (
              <div style={{ width: '36px', height: '54px', background: 'rgba(124,111,247,0.2)', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🎬</div>
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

export default function CollectionsTab({ library = [], onMovieClick }) {
  const [collections, setCollections] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cinelog_collections_v1')) || {}; }
    catch { return {}; }
  });

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEmoji, setNewEmoji] = useState('🎬');
  const [showCreate, setShowCreate] = useState(false);
  const [expandedCollection, setExpandedCollection] = useState(null);
  const [autoGroup, setAutoGroup] = useState('franchise');
  const [showEmpty, setShowEmpty] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

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

  // Predefined franchise & genre automatic collections
  const automaticCollections = React.useMemo(() => {
    const titleMatch = (keywords) => library.filter(m => {
      const t = m.title.toLowerCase();
      return keywords.some(k => t.includes(k));
    });

    const filterByGenre = (genreName) =>
      library.filter(m => m.genres && m.genres.some(g => g.toLowerCase() === genreName.toLowerCase()));

    const mcuMovies = titleMatch([
      'iron man', 'avengers', 'thor', 'captain america', 'guardians of the galaxy',
      'spider-man', 'black panther', 'ant-man', 'doctor strange', 'captain marvel',
      'black widow', 'eternals', 'shang-chi', 'deadpool', 'wolverine', 'hulk', 'loki', 'marvel'
    ]);

    const dcMovies = titleMatch([
      'batman', 'superman', 'wonder woman', 'justice league', 'aquaman',
      'the flash', 'green lantern', 'joker', 'suicide squad', 'shazam',
      'black adam', 'catwoman', 'gotham', 'birds of prey'
    ]);

    const starWars = titleMatch([
      'star wars', 'the force awakens', 'the last jedi', 'the rise of skywalker',
      'rogue one', 'solo:', 'the phantom menace', 'attack of the clones',
      'revenge of the sith', 'mandalorian', 'andor', 'obi-wan kenobi', 'the acolyte'
    ]);

    const harryPotter = titleMatch([
      "harry potter", "fantastic beasts", "the philosopher's stone", "chamber of secrets",
      "prisoner of azkaban", "goblet of fire", "order of the phoenix",
      "half-blood prince", "deathly hallows"
    ]);

    const lotr = titleMatch([
      'lord of the rings', 'the fellowship', 'the two towers', 'return of the king',
      'the hobbit', 'rings of power', 'an unexpected journey', 'desolation of smaug'
    ]);

    const jamesBond = titleMatch([
      'james bond', 'casino royale', 'quantum of solace', 'skyfall', 'spectre',
      'no time to die', 'goldfinger', 'thunderball', 'die another day',
      'dr. no', 'from russia', 'the spy who loved me', 'licence to kill',
      'goldeneye', 'tomorrow never dies', 'the world is not enough', 'die another day'
    ]);

    const fastFurious = titleMatch([
      'fast & furious', 'fast and furious', 'the fast and', 'tokyo drift',
      'fast five', 'fast six', 'furious 7', 'the fate of the furious',
      'hobbs & shaw', 'f9', 'fast x'
    ]);

    const pixar = titleMatch([
      'toy story', 'finding nemo', 'finding dory', 'the incredibles', 'incredibles 2',
      'up', 'wall-e', 'cars', 'ratatouille', 'brave', 'inside out', 'coco',
      'soul', 'luca', 'turning red', 'elemental', 'a bug\'s life',
      'monsters, inc', 'monsters university'
    ]);

    const ghibli = titleMatch([
      'spirited away', 'my neighbor totoro', 'princess mononoke', 'howl\'s moving castle',
      'nausicaä', 'castle in the sky', 'kiki\'s delivery service', 'porco rosso',
      'only yesterday', 'pom poko', 'whisper of the heart', 'the cat returns',
      'tales from earthsea', 'ponyo', 'the wind rises', 'the tale of the princess kaguya',
      'when marnie was there', 'the boy and the heron', 'grave of the fireflies',
      'ocean waves', 'studio ghibli'
    ]);

    const jurassicPark = titleMatch([
      'jurassic park', 'jurassic world', 'the lost world: jurassic park',
      'jurassic park iii', 'fallen kingdom', 'jurassic world dominion'
    ]);

    const missionImpossible = titleMatch([
      'mission: impossible', 'mission impossible', 'dead reckoning'
    ]);

    const nolanVerse = titleMatch([
      'memento', 'insomnia', 'batman begins', 'the prestige', 'the dark knight',
      'inception', 'interstellar', 'dunkirk', 'tenet', 'oppenheimer'
    ]);

    const tarantino = titleMatch([
      'reservoir dogs', 'pulp fiction', 'jackie brown', 'kill bill',
      'grindhouse', 'inglourious basterds', 'django unchained',
      'the hateful eight', 'once upon a time in hollywood'
    ]);

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
      // ─ Franchise Collections ─
      { id: 'mcu', title: 'Marvel Cinematic Universe', emoji: '🦸', desc: 'Earth\'s mightiest heroes and cosmic adventures.', movies: mcuMovies, group: 'franchise' },
      { id: 'dc', title: 'DC Multiverse', emoji: '🦇', desc: 'From the dark streets of Gotham to the skies of Metropolis.', movies: dcMovies, group: 'franchise' },
      { id: 'starwars', title: 'Star Wars Saga', emoji: '⚔️', desc: 'A long time ago in a galaxy far, far away…', movies: starWars, group: 'franchise' },
      { id: 'hp', title: 'Wizarding World', emoji: '🧙', desc: 'Hogwarts, Hogsmeade and magic beyond imagination.', movies: harryPotter, group: 'franchise' },
      { id: 'lotr', title: 'Middle-Earth', emoji: '💍', desc: 'One Ring to rule them all — epic fantasy at its finest.', movies: lotr, group: 'franchise' },
      { id: 'bond', title: 'James Bond 007', emoji: '🕴️', desc: 'Shaken, not stirred. The world\'s most iconic spy franchise.', movies: jamesBond, group: 'franchise' },
      { id: 'fast', title: 'Fast & Furious', emoji: '🏎️', desc: 'Family, speed, and impossible stunts around the world.', movies: fastFurious, group: 'franchise' },
      { id: 'pixar', title: 'Pixar Universe', emoji: '🎈', desc: 'Heartwarming animated masterpieces from Pixar Animation Studios.', movies: pixar, group: 'franchise' },
      { id: 'ghibli', title: 'Studio Ghibli', emoji: '🌿', desc: 'Miyazaki\'s enchanting world of wonder and nature.', movies: ghibli, group: 'franchise' },
      { id: 'jurassic', title: 'Jurassic Park', emoji: '🦕', desc: 'Life finds a way — dinosaurs on the big screen.', movies: jurassicPark, group: 'franchise' },
      { id: 'mi', title: 'Mission: Impossible', emoji: '💣', desc: 'Ethan Hunt\'s impossible missions around the globe.', movies: missionImpossible, group: 'franchise' },
      { id: 'nolan', title: 'Nolan Universe', emoji: '🌀', desc: 'Mind-bending narratives by Christopher Nolan.', movies: nolanVerse, group: 'franchise' },
      { id: 'tarantino', title: 'Tarantino Collection', emoji: '🩸', desc: 'Dialogue, dark humor, and sharp storytelling by QT.', movies: tarantino, group: 'franchise' },
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
      [newTitle]: { description: newDesc, emoji: newEmoji, movieIds: [], dateCreated: new Date().toISOString() }
    };
    setCollections(updated);
    localStorage.setItem('cinelog_collections_v1', JSON.stringify(updated));
    setNewTitle(''); setNewDesc(''); setNewEmoji('🎬'); setShowCreate(false);
  };

  const handleAddToList = (title, movieId) => {
    const list = collections[title];
    if (!list) return;
    const updated = { ...collections, [title]: { ...list, movieIds: [...(list.movieIds || []), String(movieId)] } };
    setCollections(updated);
    localStorage.setItem('cinelog_collections_v1', JSON.stringify(updated));
  };

  const handleRemoveFromList = (title, movieId) => {
    const list = collections[title];
    if (!list) return;
    const updated = { ...collections, [title]: { ...list, movieIds: (list.movieIds || []).filter(id => String(id) !== String(movieId)) } };
    setCollections(updated);
    localStorage.setItem('cinelog_collections_v1', JSON.stringify(updated));
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
        <div className="glass animate-fade-in" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(124,111,247,0.2)', background: 'rgba(124,111,247,0.04)' }}>
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
                      style={{ width: '36px', height: '36px', background: newEmoji === e ? 'rgba(124,111,247,0.2)' : 'rgba(255,255,255,0.03)', border: `1px solid ${newEmoji === e ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '8px', fontSize: '18px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {automaticCollections
            .filter(col => col.group === autoGroup)
            .filter(col => showEmpty || col.movies.length > 0)
            .map(col => (
            <div key={col.id} className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.2s', opacity: col.movies.length === 0 ? 0.55 : 1 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,111,247,0.35)'; e.currentTarget.style.background = 'rgba(124,111,247,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = ''; }}>
              
              <div style={{ padding: '16px 16px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontSize: '24px', lineHeight: 1 }}>{col.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '15px' }}>{col.title}</div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>{col.desc}</p>
                    <div style={{ fontSize: '11px', color: col.movies.length > 0 ? 'var(--accent)' : 'var(--text-dim)', marginTop: '6px', fontWeight: 700 }}>
                      {col.movies.length > 0 ? `${col.movies.length} ${col.movies.length === 1 ? 'title' : 'titles'}` : 'No titles yet'}
                    </div>
                  </div>
                </div>
              </div>

              {col.movies.length > 0 ? (
                <div style={{ display: 'flex', gap: '6px', padding: '0 16px 16px', overflowX: 'auto', marginTop: '10px' }}>
                  {col.movies.slice(0, 8).map(movie => (
                    <div key={movie.id || movie.tmdb_id} style={{ flexShrink: 0 }}>
                      {movie.poster_path ? (
                        <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title}
                          onClick={() => onMovieClick(movie.tmdb_id || movie.id, movie.media_type || 'movie')}
                          style={{ width: '42px', height: '63px', objectFit: 'cover', borderRadius: '5px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'transform 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                          onMouseLeave={e => e.currentTarget.style.transform = ''}
                          title={movie.title}
                        />
                      ) : (
                        <div onClick={() => onMovieClick(movie.tmdb_id || movie.id, movie.media_type || 'movie')}
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
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,111,247,0.35)'; e.currentTarget.style.background = 'rgba(124,111,247,0.04)'; }}
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
                        onClick={() => onMovieClick(movie.tmdb_id || movie.id, movie.media_type || 'movie')}
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
      <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid rgba(124,111,247,0.2)', background: 'linear-gradient(135deg, rgba(124,111,247,0.06) 0%, rgba(59,130,246,0.04) 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', background: 'radial-gradient(circle, rgba(124,111,247,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
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
              return (
                <div key={title} className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,111,247,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>

                  {/* Header */}
                  <div style={{ padding: '18px', borderBottom: listMovies.length > 0 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ fontSize: '26px', lineHeight: 1 }}>{meta.emoji || '🎬'}</span>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '15px', lineHeight: 1.2 }}>{title}</div>
                          {meta.description && (
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5 }}>{meta.description}</p>
                          )}
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '5px' }}>
                            {listMovies.length} films · {new Date(meta.dateCreated).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteList(title)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px', flexShrink: 0, transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                        title="Delete Collection">
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Movies */}
                  {listMovies.length > 0 && (
                    <div style={{ padding: '12px 18px' }}>
                      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {listMovies.map(movie => (
                          <div key={movie.id || movie.tmdb_id} style={{ position: 'relative', flexShrink: 0 }}>
                            <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title}
                              onClick={() => onMovieClick(movie.tmdb_id || movie.id, movie.media_type || 'movie')}
                              style={{ width: '48px', height: '72px', objectFit: 'cover', borderRadius: '5px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'transform 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                              onMouseLeave={e => e.currentTarget.style.transform = ''}
                              title={movie.title}
                            />
                            <button onClick={e => { e.stopPropagation(); handleRemoveFromList(title, movie.id || movie.tmdb_id); }}
                              style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.15s' }}
                              onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0}
                              title="Remove">✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add movie */}
                  <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)' }}>
                    <select
                      onChange={e => { if (e.target.value) { handleAddToList(title, e.target.value); e.target.value = ''; } }}
                      className="form-input"
                      style={{ width: '100%', height: '34px', padding: '0 10px', background: 'rgba(255,255,255,0.04)', color: 'var(--text)', fontSize: '12px' }}
                    >
                      <option value="">+ Add from library…</option>
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
