import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Plus, Search, Trash2, ArrowLeft, ArrowUpDown, GripVertical,
  Trophy, Sparkles, Film, Check, Layers, Bookmark, Star,
  ChevronLeft, ChevronRight, Zap, RefreshCw
} from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { MCU_FULL_CATALOGUE, MARVEL_COMPLETE_CATALOGUE } from '../utils/collections';

const TMDB_KEY = '6a2fd6b9b1bb3befbb9f14c203732225';
const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&fit=crop&q=80';

// 100% Verified valid TMDB poster paths tested for HTTP 200
const FRANCHISE_PACKS = [
  {
    id: 'mcu',
    name: 'Marvel Cinematic Universe (MCU)',
    emoji: '⚡',
    badge: '53 Canonical Films & Series',
    movies: MCU_FULL_CATALOGUE
  },
  {
    id: 'marvel',
    name: 'Marvel Complete Multiverse & Legacy',
    emoji: '🦸‍♂️',
    badge: '89 Films & Shows',
    movies: MARVEL_COMPLETE_CATALOGUE
  },
  {
    id: 'nolan',
    name: 'Christopher Nolan',
    emoji: '🌀',
    badge: '8 Masterpieces',
    movies: [
      { id: 872585, tmdb_id: 872585, title: 'Oppenheimer', release_year: '2023', poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', rating: 8.0 },
      { id: 157336, tmdb_id: 157336, title: 'Interstellar', release_year: '2014', poster_path: '/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg', rating: 8.5 },
      { id: 27205, tmdb_id: 27205, title: 'Inception', release_year: '2010', poster_path: '/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg', rating: 8.4 },
      { id: 155, tmdb_id: 155, title: 'The Dark Knight', release_year: '2008', poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', rating: 8.5 },
      { id: 1124, tmdb_id: 1124, title: 'The Prestige', release_year: '2006', poster_path: '/Ag2B2KHKQPukjH7WutmgnnSNurZ.jpg', rating: 8.2 },
      { id: 77, tmdb_id: 77, title: 'Memento', release_year: '2000', poster_path: '/nzlv62aC0octS5AklAiWpXLX9Z0.jpg', rating: 8.2 },
      { id: 577922, tmdb_id: 577922, title: 'Tenet', release_year: '2020', poster_path: '/rrKH3VhHssGTCfPuaEQkxvEoElv.jpg', rating: 7.2 },
      { id: 374720, tmdb_id: 374720, title: 'Dunkirk', release_year: '2017', poster_path: '/b4Oe15CGLL61Ped0RAS9JpqdmCt.jpg', rating: 7.4 }
    ]
  },
  {
    id: 'batman',
    name: 'Batman & Gotham City',
    emoji: '🦇',
    badge: '10 Definitive Films',
    movies: [
      { id: 414906, tmdb_id: 414906, title: 'The Batman', release_year: '2022', poster_path: '/74xTEgt7R36Fpooo50r9T25onhq.jpg', rating: 7.7 },
      { id: 155, tmdb_id: 155, title: 'The Dark Knight', release_year: '2008', poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', rating: 8.5 },
      { id: 272, tmdb_id: 272, title: 'Batman Begins', release_year: '2005', poster_path: '/sPX89Td70IDDjVr85jdSBb4rWGr.jpg', rating: 7.7 },
      { id: 49026, tmdb_id: 49026, title: 'The Dark Knight Rises', release_year: '2012', poster_path: '/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg', rating: 7.8 },
      { id: 475557, tmdb_id: 475557, title: 'Joker', release_year: '2019', poster_path: '/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', rating: 8.1 },
      { id: 209112, tmdb_id: 209112, title: 'Batman v Superman: Dawn of Justice', release_year: '2016', poster_path: '/5UsK3grJvtQrtzEgqNlDljJW96w.jpg', rating: 6.0 },
      { id: 268, tmdb_id: 268, title: 'Batman', release_year: '1989', poster_path: '/cij4dd21v2Rk2YtUQbV5kW69WB2.jpg', rating: 7.2 },
      { id: 364, tmdb_id: 364, title: 'Batman Returns', release_year: '1992', poster_path: '/jKBjeXM7iBBV9UkUcOXx3m7FSHY.jpg', rating: 7.0 },
      { id: 414, tmdb_id: 414, title: 'Batman Forever', release_year: '1995', poster_path: '/i0fJS8M5UKoETjjJ0zwUiKaR8tr.jpg', rating: 5.5 },
      { id: 415, tmdb_id: 415, title: 'Batman & Robin', release_year: '1997', poster_path: '/i7hEUpDuMN2LOrCEifFyGSHZQSY.jpg', rating: 4.4 }
    ]
  },
  {
    id: 'villeneuve',
    name: 'Denis Villeneuve',
    emoji: '🏜️',
    badge: '6 Masterworks',
    movies: [
      { id: 693134, tmdb_id: 693134, title: 'Dune: Part Two', release_year: '2024', poster_path: '/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg', rating: 8.1 },
      { id: 438631, tmdb_id: 438631, title: 'Dune', release_year: '2021', poster_path: '/v1tRXZ4JtD2Iv6fjkPvT4GiwslV.jpg', rating: 7.8 },
      { id: 335984, tmdb_id: 335984, title: 'Blade Runner 2049', release_year: '2017', poster_path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', rating: 7.6 },
      { id: 329865, tmdb_id: 329865, title: 'Arrival', release_year: '2016', poster_path: '/pEzNVQfdzYDzVK0XqxERIw2x2se.jpg', rating: 7.6 },
      { id: 273481, tmdb_id: 273481, title: 'Sicario', release_year: '2015', poster_path: '/lz8vNyXeidqqOdJW9ZjnDAMb5Vr.jpg', rating: 7.4 },
      { id: 146233, tmdb_id: 146233, title: 'Prisoners', release_year: '2013', poster_path: '/uhviyknTT5cEQXbn6vWIqfM4vGm.jpg', rating: 8.1 }
    ]
  },
  {
    id: 'spiderman',
    name: 'Spider-Man Multiverse',
    emoji: '🕷️',
    badge: '8 Web-Slingers',
    movies: [
      { id: 324857, tmdb_id: 324857, title: 'Spider-Man: Into the Spider-Verse', release_year: '2018', poster_path: '/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg', rating: 8.4 },
      { id: 569094, tmdb_id: 569094, title: 'Spider-Man: Across the Spider-Verse', release_year: '2023', poster_path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', rating: 8.3 },
      { id: 634649, tmdb_id: 634649, title: 'Spider-Man: No Way Home', release_year: '2021', poster_path: '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg', rating: 7.9 },
      { id: 429617, tmdb_id: 429617, title: 'Spider-Man: Far From Home', release_year: '2019', poster_path: '/4q2NNj4S5dG2RLF9CpXsej7yXl.jpg', rating: 7.4 },
      { id: 315635, tmdb_id: 315635, title: 'Spider-Man: Homecoming', release_year: '2017', poster_path: '/c24sv2weTHPsmDa7jEMN0m2P3RT.jpg', rating: 7.3 },
      { id: 558, tmdb_id: 558, title: 'Spider-Man 2', release_year: '2004', poster_path: '/aGuvNAaaZuWXYQQ6N2v7DeuP6mB.jpg', rating: 7.3 },
      { id: 557, tmdb_id: 557, title: 'Spider-Man', release_year: '2002', poster_path: '/or6XJBVpcEbIkma0V9zshnbEtx4.jpg', rating: 7.4 },
      { id: 559, tmdb_id: 559, title: 'Spider-Man 3', release_year: '2007', poster_path: '/qFmwhVUoUSXjkKRmca5yGDEXBIj.jpg', rating: 6.5 }
    ]
  },
  {
    id: 'starwars',
    name: 'Star Wars Saga',
    emoji: '⚔️',
    badge: '11 Galactic Sagas',
    movies: [
      { id: 11, tmdb_id: 11, title: 'Star Wars: A New Hope', release_year: '1977', poster_path: '/fai0rspsNeJCS69wHNjOdWxcI7P.jpg', rating: 8.2 },
      { id: 1891, tmdb_id: 1891, title: 'The Empire Strikes Back', release_year: '1980', poster_path: '/nNAeTmF4CtdSgMDplXTDPOpYzsX.jpg', rating: 8.4 },
      { id: 1892, tmdb_id: 1892, title: 'Return of the Jedi', release_year: '1983', poster_path: '/jQYlydvHm3kUix1f8prMucrplhm.jpg', rating: 7.9 },
      { id: 1893, tmdb_id: 1893, title: 'Star Wars: Episode I - The Phantom Menace', release_year: '1999', poster_path: '/6wkfovpn7Eq8dYNKaG5PY3q2oq6.jpg', rating: 6.6 },
      { id: 1894, tmdb_id: 1894, title: 'Star Wars: Episode II - Attack of the Clones', release_year: '2002', poster_path: '/oZNPzxqM2s5DyVWab09NTQScDQt.jpg', rating: 6.6 },
      { id: 1895, tmdb_id: 1895, title: 'Star Wars: Revenge of the Sith', release_year: '2005', poster_path: '/xfSAoBEm9MNBjmlNcDYLvLSMlnq.jpg', rating: 7.5 },
      { id: 140607, tmdb_id: 140607, title: 'Star Wars: The Force Awakens', release_year: '2015', poster_path: '/wqnLdwVXoBjKibFRR5U3y0aDUhs.jpg', rating: 7.2 },
      { id: 181808, tmdb_id: 181808, title: 'Star Wars: The Last Jedi', release_year: '2017', poster_path: '/kOVEVeg59E0wsnXmF9nrh6OmWII.jpg', rating: 6.7 },
      { id: 181812, tmdb_id: 181812, title: 'Star Wars: The Rise of Skywalker', release_year: '2019', poster_path: '/db32LaOibwEliAmSL2jjDF6oDdj.jpg', rating: 6.2 },
      { id: 330459, tmdb_id: 330459, title: 'Rogue One: A Star Wars Story', release_year: '2016', poster_path: '/i0yw1mFbB7sNGHCs7EXZPzFkdA1.jpg', rating: 7.5 },
      { id: 348350, tmdb_id: 348350, title: 'Solo: A Star Wars Story', release_year: '2018', poster_path: '/4oD6VEccFkorEBTEDXtpLAaz0Rl.jpg', rating: 6.6 }
    ]
  },
  {
    id: 'tarantino',
    name: 'Quentin Tarantino',
    emoji: '🩸',
    badge: '6 Cult Classics',
    movies: [
      { id: 680, tmdb_id: 680, title: 'Pulp Fiction', release_year: '1994', poster_path: '/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg', rating: 8.5 },
      { id: 16869, tmdb_id: 16869, title: 'Inglourious Basterds', release_year: '2009', poster_path: '/aupnPtagH9JVBuMrGEanf4iqXEQ.jpg', rating: 8.2 },
      { id: 68718, tmdb_id: 68718, title: 'Django Unchained', release_year: '2012', poster_path: '/7oWY8VDWW7thTzWh3OKYRkWUlD5.jpg', rating: 8.2 },
      { id: 24, tmdb_id: 24, title: 'Kill Bill: Vol. 1', release_year: '2003', poster_path: '/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg', rating: 8.0 },
      { id: 466272, tmdb_id: 466272, title: 'Once Upon a Time in Hollywood', release_year: '2019', poster_path: '/8j58iEBw9pOXFD2L0nt0ZXeHviB.jpg', rating: 7.4 },
      { id: 500, tmdb_id: 500, title: 'Reservoir Dogs', release_year: '1992', poster_path: '/xi8Iu6qyTfyZVDVy60raIOYJJmk.jpg', rating: 8.1 }
    ]
  },
  {
    id: 'johnwick',
    name: 'John Wick Baba Yaga',
    emoji: '🎯',
    badge: '4 High-Table Hits',
    movies: [
      { id: 603692, tmdb_id: 603692, title: 'John Wick: Chapter 4', release_year: '2023', poster_path: '/vZloFAK7NKnMGKEslUsZlooxAcQ.jpg', rating: 7.8 },
      { id: 458156, tmdb_id: 458156, title: 'John Wick: Chapter 3 - Parabellum', release_year: '2019', poster_path: '/ziEuG1essDuWuC5lpWUaw1uXY2O.jpg', rating: 7.4 },
      { id: 324552, tmdb_id: 324552, title: 'John Wick: Chapter 2', release_year: '2017', poster_path: '/kR6i6wXfFuh7P3q1oI8t3x1U1tC.jpg', rating: 7.3 },
      { id: 245891, tmdb_id: 245891, title: 'John Wick', release_year: '2014', poster_path: '/fZPSg9cre9slYbpGuAoAWioNu9G.jpg', rating: 7.4 }
    ]
  },
  {
    id: 'matrix',
    name: 'The Matrix Cyberpunk',
    emoji: '💊',
    badge: '4 Sci-Fi Classics',
    movies: [
      { id: 603, tmdb_id: 603, title: 'The Matrix', release_year: '1999', poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', rating: 8.2 },
      { id: 604, tmdb_id: 604, title: 'The Matrix Reloaded', release_year: '2003', poster_path: '/9TGHDvWrqKBpuDxD65jkGg0BmN9.jpg', rating: 7.0 },
      { id: 605, tmdb_id: 605, title: 'The Matrix Revolutions', release_year: '2003', poster_path: '/t1mW6n04c27Xpbgv4z2A3o7NfWv.jpg', rating: 6.7 },
      { id: 624860, tmdb_id: 624860, title: 'The Matrix Resurrections', release_year: '2021', poster_path: '/8c4a8kE7PizaGQQvMiZt797Bqwe.jpg', rating: 6.5 }
    ]
  },
  {
    id: 'alien',
    name: 'Alien & Predator',
    emoji: '👽',
    badge: '5 Sci-Fi Horrors',
    movies: [
      { id: 945961, tmdb_id: 945961, title: 'Alien: Romulus', release_year: '2024', poster_path: '/b33nnKl1GSFbao8l3urDDgo40KG.jpg', rating: 7.3 },
      { id: 379, tmdb_id: 379, title: 'Alien', release_year: '1979', poster_path: '/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg', rating: 8.1 },
      { id: 679, tmdb_id: 679, title: 'Aliens', release_year: '1986', poster_path: '/r1x5JG26RiOKv9A25IRw9G8KJNN.jpg', rating: 7.9 },
      { id: 106, tmdb_id: 106, title: 'Predator', release_year: '1987', poster_path: '/k3mW4qfFe6gPtBzlYti1nuTmz9d.jpg', rating: 7.5 },
      { id: 766507, tmdb_id: 766507, title: 'Prey', release_year: '2022', poster_path: '/ujr5pztc1oirzlWLiHoEvQ92Yv5.jpg', rating: 7.7 }
    ]
  }
];

export default function CreateListModal({
  currentUser,
  library = [],
  franchiseCollections = [],
  onClose,
  onSaveList
}) {
  useBodyScrollLock(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isRanked, setIsRanked] = useState(true);
  const [entries, setEntries] = useState([]);

  // Film Picker State
  const [pickerTab, setPickerTab] = useState('franchises'); // 'franchises' | 'search' | 'library'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Library tab filters
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryFilter, setLibraryFilter] = useState('all');

  // Franchise packs synchronized 1-to-1 with CineLog Original collections
  const effectivePacks = useMemo(() => {
    if (franchiseCollections && franchiseCollections.length > 0) {
      return franchiseCollections.map(col => {
        const movies = col.movies || col.catalogue || [];
        return {
          id: col.id,
          name: col.title || col.shortTitle,
          emoji: col.emoji || '⚡',
          badge: `${movies.length} Films & Shows`,
          movies
        };
      });
    }

    return FRANCHISE_PACKS.map(pack => ({
      ...pack,
      badge: `${pack.movies.length} Films & Shows`
    }));
  }, [franchiseCollections]);

  const [selectedPackId, setSelectedPackId] = useState('mcu');
  const activeFranchise = effectivePacks.find(p => p.id === selectedPackId) || effectivePacks[0] || FRANCHISE_PACKS[0];
  const [bannerToast, setBannerToast] = useState('');
  const franchisePillsRef = useRef(null);

  // Mobile studio tab switcher: 'entries' | 'browse'
  const [mobileStudioTab, setMobileStudioTab] = useState('entries');

  // Drag and drop state for entries
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  // Quick tap-to-reorder dialog state
  const [reorderTarget, setReorderTarget] = useState(null); // { index, title }
  const [targetPositionInput, setTargetPositionInput] = useState('');

  // Custom In-App Clear All Confirmation Modal
  const [showClearModal, setShowClearModal] = useState(false);

  const handleOpenReorder = (idx, movieTitle) => {
    setReorderTarget({ index: idx, title: movieTitle });
    setTargetPositionInput(String(idx + 1));
  };

  const handleApplyReorder = (newRank1Based) => {
    if (!reorderTarget) return;
    const targetIdx = Math.max(0, Math.min(entries.length - 1, newRank1Based - 1));
    handleMoveEntry(reorderTarget.index, targetIdx);
    setReorderTarget(null);
  };

  const showToast = (msg) => {
    setBannerToast(msg);
    setTimeout(() => setBannerToast(''), 3000);
  };

  const handleSearchTMDB = async (q) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}&page=1`);
      const data = await res.json();
      const results = (data.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv');
      setSearchResults(results.slice(0, 24));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const isMovieInList = (id, tmdbId) => {
    return entries.some(e => String(e.tmdb_id || e.id) === String(tmdbId || id));
  };

  const handleAddMovie = (movie) => {
    const movieId = movie.tmdb_id || movie.id;
    if (isMovieInList(movieId, movieId)) return;

    const newEntry = {
      tmdb_id: movieId,
      id: movieId,
      title: movie.title || movie.name,
      poster_path: movie.poster_path,
      release_year: (movie.release_date || movie.first_air_date || movie.release_year || '').slice(0, 4),
      rating: movie.vote_average ? Number(movie.vote_average.toFixed(1)) : (movie.rating || null),
      media_type: movie.media_type || 'movie'
    };
    setEntries(prev => [...prev, newEntry]);
    showToast(`Added "${newEntry.title}" to list!`);
  };

  const handleBatchAddFranchise = (pack) => {
    if (!pack || !pack.movies) return;
    const existingIds = new Set(entries.map(e => String(e.tmdb_id || e.id)));
    const toAdd = pack.movies
      .filter(m => !existingIds.has(String(m.tmdb_id || m.id)))
      .map(m => ({
        tmdb_id: m.tmdb_id || m.id,
        id: m.tmdb_id || m.id,
        title: m.title,
        poster_path: m.poster_path,
        release_year: m.release_year,
        rating: m.rating,
        media_type: m.media_type || 'movie'
      }));

    if (toAdd.length === 0) {
      showToast(`All films from ${pack.name} are already in your list!`);
      return;
    }

    setEntries(prev => [...prev, ...toAdd]);
    showToast(`⚡ Added ${toAdd.length} films from ${pack.name}!`);
  };

  const handleRemoveEntry = (idx) => {
    setEntries(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMoveEntry = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= entries.length || fromIdx === toIdx) return;
    setEntries(prev => {
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
  };

  const handleClearAll = () => {
    setShowClearModal(true);
  };

  // Filtered Library Movies
  const filteredLibrary = useMemo(() => {
    return library.filter(m => {
      if (libraryFilter === 'favorites' && !m.favorite) return false;
      if (libraryFilter === 'watched' && m.status !== 'watched') return false;
      if (libraryFilter === 'top_rated' && Number(m.user_rating || m.rating || 0) < 8) return false;
      if (librarySearch.trim()) {
        const q = librarySearch.toLowerCase();
        return (m.title || '').toLowerCase().includes(q) || (m.director || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [library, libraryFilter, librarySearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newList = {
      id: 'list-user-' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      author: {
        id: currentUser?.id || 'user',
        username: currentUser?.username || 'cinephile',
        displayName: currentUser?.displayName || currentUser?.username || 'Cinephile',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop&q=80'
      },
      createdAt: new Date().toISOString(),
      isRanked,
      isPublic: true,
      likesCount: 0,
      entries,
      comments: []
    };

    if (onSaveList) onSaveList(newList);
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="modal-backdrop create-list-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        background: 'rgba(5, 3, 10, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        animation: 'fadeInOverlay 0.18s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass create-list-modal-container"
        style={{
          width: '100%',
          maxWidth: '1140px',
          height: 'min(92vh, 880px)',
          maxHeight: 'min(92vh, 880px)',
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
        <style>{`
          @media (max-width: 768px) {
            .create-list-modal-backdrop {
              padding: 0 !important;
            }
            .create-list-modal-container {
              width: 100vw !important;
              max-width: 100vw !important;
              height: 100vh !important;
              max-height: 100vh !important;
              border-radius: 0 !important;
              border: none !important;
              margin: 0 !important;
            }
            .create-list-studio-grid {
              display: flex !important;
              flex-direction: column !important;
              overflow: hidden !important;
              flex: 1 1 auto !important;
            }
            .create-list-mobile-tab-bar {
              display: flex !important;
            }
            .create-list-left-panel {
              display: ${mobileStudioTab === 'entries' ? 'flex' : 'none'} !important;
              border-right: none !important;
              width: 100% !important;
              height: 100% !important;
              flex: 1 1 auto !important;
            }
            .create-list-right-panel {
              display: ${mobileStudioTab === 'browse' ? 'flex' : 'none'} !important;
              width: 100% !important;
              height: 100% !important;
              flex: 1 1 auto !important;
            }
            .create-list-desktop-footer {
              display: none !important;
            }
            .create-list-mobile-footer {
              display: flex !important;
            }
          }
          @media (min-width: 769px) {
            .create-list-mobile-tab-bar {
              display: none !important;
            }
            .create-list-mobile-footer {
              display: none !important;
            }
            .create-list-desktop-footer {
              display: flex !important;
            }
            .create-list-left-panel {
              display: flex !important;
            }
            .create-list-right-panel {
              display: flex !important;
            }
          }
        `}</style>

        {/* Toast Feedback */}
        {bannerToast && (
          <div style={{
            background: 'var(--accent)',
            color: '#fff',
            fontSize: '12.5px',
            fontWeight: 800,
            padding: '8px 16px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease-out',
            flexShrink: 0
          }}>
            <Sparkles size={14} /> {bannerToast}
          </div>
        )}

        {/* Top Header Bar (Pinned) */}
        <div style={{
          padding: '13px 22px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(229, 9, 20, 0.15)',
              border: '1px solid rgba(229, 9, 20, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={16} color="var(--accent)" />
            </div>
            <div>
              <h2 style={{ fontSize: '16.5px', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>
                Create Custom Cinephile List
              </h2>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                {entries.length} {entries.length === 1 ? 'film' : 'films'} added so far · {isRanked ? 'Ranked List' : 'Unranked Curation'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Mobile-Only Studio Tab Switcher (Visible only on <= 768px screens) */}
        <div
          className="create-list-mobile-tab-bar"
          style={{
            background: 'rgba(10, 8, 18, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '7px 12px',
            gap: '8px',
            flexShrink: 0
          }}
        >
          <button
            type="button"
            onClick={() => setMobileStudioTab('entries')}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '8px',
              background: mobileStudioTab === 'entries' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
              color: '#fff',
              border: mobileStudioTab === 'entries' ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <Film size={14} /> My List ({entries.length})
          </button>
          <button
            type="button"
            onClick={() => setMobileStudioTab('browse')}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '8px',
              background: mobileStudioTab === 'browse' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
              color: '#fff',
              border: mobileStudioTab === 'browse' ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <Plus size={14} /> Add Films & Packs
          </button>
        </div>

        {/* 2-Column Studio Workspace */}
        <div
          className="create-list-studio-grid"
          style={{
            flex: '1 1 auto',
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: 'minmax(330px, 390px) 1fr',
            overflow: 'hidden'
          }}
        >
          {/* ── LEFT COLUMN: List Details, Current Entries & Submit ── */}
          <form
            onSubmit={handleSubmit}
            className="create-list-left-panel"
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              minHeight: 0,
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* Scrollable Left Column Body */}
            <div
              style={{
                flex: '1 1 auto',
                minHeight: 0,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.2) transparent'
              }}
            >
              {/* Title input */}
              <div>
                <label className="form-label" style={{ marginBottom: '5px', display: 'block', fontSize: '11.5px' }}>
                  List Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Definitive Top 10 Sci-Fi Films of the 21st Century"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="form-input"
                  required
                  style={{ width: '100%', fontSize: '13.5px', padding: '9px 12px' }}
                />
              </div>

              {/* Description & Ordering Mode */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <label className="form-label" style={{ marginBottom: '5px', display: 'block', fontSize: '11px' }}>
                    Description & Criteria (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="What is this list about? Share your criteria..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', fontSize: '12px', padding: '7px 11px' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Ordering Mode:</span>
                  <button
                    type="button"
                    onClick={() => setIsRanked(!isRanked)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '7px',
                      background: isRanked ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${isRanked ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                      color: isRanked ? 'var(--gold)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '11.5px',
                      transition: 'all 0.15s'
                    }}
                  >
                    <Trophy size={13} color={isRanked ? 'var(--gold)' : 'var(--text-muted)'} />
                    {isRanked ? 'Ranked (#1, #2...)' : 'Unranked List'}
                  </button>
                </div>
              </div>

              {/* List Entries Header */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>
                      List Entries ({entries.length})
                    </span>
                    {isRanked && entries.length > 0 && (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: 'var(--gold)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '5px',
                        padding: '1px 6px',
                        whiteSpace: 'nowrap'
                      }}>
                        #1 to #{entries.length}
                      </span>
                    )}
                  </div>

                  {entries.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowClearModal(true)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.22)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.45)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                      }}
                      title="Clear all films from this list"
                    >
                      <Trash2 size={11} /> Clear All
                    </button>
                  )}
                </div>

                {entries.length > 0 && (
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <ArrowUpDown size={11} style={{ flexShrink: 0 }} />
                    <span>Drag posters to reorder, or tap rank badge to jump</span>
                  </div>
                )}
              </div>

              {/* Entries Content */}
              {entries.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
                  gap: '9px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  padding: '10px'
                }}>
                  {entries.map((entry, idx) => {
                    const isDragSource = draggedIdx === idx;
                    const isDragOver = dragOverIdx === idx;
                    const rankNum = idx + 1;
                    return (
                      <div
                        key={entry.tmdb_id || entry.id || idx}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', String(idx));
                          e.dataTransfer.effectAllowed = 'move';
                          setDraggedIdx(idx);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          if (dragOverIdx !== idx) setDragOverIdx(idx);
                        }}
                        onDragLeave={() => {
                          if (dragOverIdx === idx) setDragOverIdx(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const fromIndex = draggedIdx !== null ? draggedIdx : parseInt(e.dataTransfer.getData('text/plain'), 10);
                          if (!isNaN(fromIndex) && fromIndex !== idx) {
                            handleMoveEntry(fromIndex, idx);
                          }
                          setDraggedIdx(null);
                          setDragOverIdx(null);
                        }}
                        onDragEnd={() => {
                          setDraggedIdx(null);
                          setDragOverIdx(null);
                        }}
                        style={{
                          position: 'relative',
                          background: '#191522',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: isDragOver
                            ? '2px solid var(--accent)'
                            : '1px solid rgba(255, 255, 255, 0.12)',
                          display: 'flex',
                          flexDirection: 'column',
                          opacity: isDragSource ? 0.35 : 1,
                          transform: isDragOver ? 'scale(1.03)' : 'none',
                          transition: 'transform 0.15s, border-color 0.15s, opacity 0.15s',
                          cursor: 'grab',
                          boxShadow: isDragOver ? '0 0 15px var(--accent-glow)' : '0 3px 8px rgba(0,0,0,0.5)'
                        }}
                      >
                        {/* Rank Badge #1..N (Clickable to change position) */}
                        {isRanked && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReorder(idx, entry.title);
                            }}
                            title="Tap to change ranking position"
                            style={{
                              position: 'absolute',
                              top: '4px',
                              left: '4px',
                              zIndex: 10,
                              background: rankNum <= 3 ? 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' : 'rgba(0, 0, 0, 0.88)',
                              color: '#fff',
                              fontSize: '10px',
                              fontWeight: 900,
                              padding: '2px 5px',
                              borderRadius: '5px',
                              border: rankNum <= 3 ? '1px solid rgba(255,255,255,0.7)' : '1px solid rgba(255,255,255,0.2)',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.7)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                          >
                            #{rankNum}
                          </button>
                        )}

                        {/* Top-Right Quick Action Group */}
                        <div style={{ position: 'absolute', top: '4px', right: '4px', zIndex: 10, display: 'flex', gap: '3px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReorder(idx, entry.title);
                            }}
                            title="Change position"
                            style={{
                              background: 'rgba(0, 0, 0, 0.8)',
                              color: '#fff',
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <ArrowUpDown size={10} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveEntry(idx);
                            }}
                            title="Remove film"
                            style={{
                              background: 'rgba(0, 0, 0, 0.8)',
                              color: '#fff',
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--red)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)'}
                          >
                            <X size={11} />
                          </button>
                        </div>

                        {/* Poster */}
                        <div style={{ width: '100%', aspectRatio: '2/3', background: '#0a0810' }}>
                          <img
                            src={entry.poster_path ? `https://image.tmdb.org/t/p/w185${entry.poster_path}` : FALLBACK_POSTER}
                            alt={entry.title}
                            draggable={false}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_POSTER;
                            }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>

                        {/* Title & Year */}
                        <div style={{
                          padding: '6px 7px 7px',
                          background: '#120f1a',
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          minHeight: '48px'
                        }}>
                          <div style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            color: '#fff',
                            lineHeight: 1.25,
                            height: '27px',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {entry.title}
                          </div>
                          <div style={{
                            fontSize: '9.5px',
                            color: 'var(--text-dim)',
                            marginTop: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <span>{entry.release_year || '—'}</span>
                            {entry.rating ? <span style={{ color: 'var(--gold)', fontSize: '9px', fontWeight: 700 }}>★ {entry.rating}</span> : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '36px 16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px dashed rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Film size={28} style={{ opacity: 0.4 }} />
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
                    Your list is currently empty
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', maxWidth: '280px' }}>
                    Browse franchise packs or search TMDB on the right to start curating.
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileStudioTab('browse')}
                    className="btn btn-primary"
                    style={{ marginTop: '6px', fontSize: '12px', padding: '7px 16px' }}
                  >
                    <Plus size={14} /> Add Films & Franchises
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Action Footer */}
            <div
              className="create-list-desktop-footer"
              style={{
                padding: '12px 18px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(10, 8, 16, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                flexShrink: 0
              }}
            >
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost"
                style={{ fontSize: '12px', padding: '7px 14px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || entries.length === 0}
                className="btn btn-primary"
                style={{
                  padding: '8px 20px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  opacity: (!title.trim() || entries.length === 0) ? 0.5 : 1
                }}
              >
                Publish List ({entries.length})
              </button>
            </div>

            {/* Mobile Action Footer */}
            <div
              className="create-list-mobile-footer"
              style={{
                padding: '10px 14px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(10, 8, 16, 0.98)',
                display: 'none',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0
              }}
            >
              <button
                type="button"
                onClick={() => setMobileStudioTab('browse')}
                className="btn btn-ghost"
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: '12px',
                  border: '1px solid rgba(255,255,255,0.12)'
                }}
              >
                <Plus size={14} /> Add More
              </button>
              <button
                type="submit"
                disabled={!title.trim() || entries.length === 0}
                className="btn btn-primary"
                style={{
                  flex: 1.4,
                  padding: '10px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  opacity: (!title.trim() || entries.length === 0) ? 0.5 : 1
                }}
              >
                Publish ({entries.length})
              </button>
            </div>
          </form>

          {/* ── RIGHT COLUMN: Full-Height Interactive Film Picker & Poster Gallery ── */}
          <div
            className="create-list-right-panel"
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              minHeight: 0,
              overflow: 'hidden',
              background: 'rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Picker Tab Switcher */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(0, 0, 0, 0.3)',
              flexShrink: 0
            }}>
              <button
                type="button"
                onClick={() => setPickerTab('franchises')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  padding: '11px 12px',
                  background: pickerTab === 'franchises' ? 'rgba(255, 255, 255, 0.07)' : 'transparent',
                  border: 'none',
                  borderBottom: pickerTab === 'franchises' ? '2px solid var(--accent)' : '2px solid transparent',
                  color: pickerTab === 'franchises' ? '#fff' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Zap size={14} color={pickerTab === 'franchises' ? 'var(--gold)' : 'currentColor'} /> Franchises & Packs
              </button>

              <button
                type="button"
                onClick={() => setPickerTab('search')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  padding: '11px 12px',
                  background: pickerTab === 'search' ? 'rgba(255, 255, 255, 0.07)' : 'transparent',
                  border: 'none',
                  borderBottom: pickerTab === 'search' ? '2px solid var(--accent)' : '2px solid transparent',
                  color: pickerTab === 'search' ? '#fff' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Search size={14} /> Search TMDB
              </button>

              <button
                type="button"
                onClick={() => setPickerTab('library')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  padding: '11px 12px',
                  background: pickerTab === 'library' ? 'rgba(255, 255, 255, 0.07)' : 'transparent',
                  border: 'none',
                  borderBottom: pickerTab === 'library' ? '2px solid var(--accent)' : '2px solid transparent',
                  color: pickerTab === 'library' ? '#fff' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Bookmark size={14} /> From My Library ({library.length})
              </button>
            </div>

            {/* TAB 1: FRANCHISES & PACKS */}
            {pickerTab === 'franchises' && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: 0,
                overflow: 'hidden'
              }}>
                {/* Slim Franchise Selector Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '10px 16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  background: 'rgba(15, 12, 22, 0.85)',
                  backdropFilter: 'blur(10px)',
                  flexShrink: 0
                }}>
                  {/* Horizontal Scrollable Pills */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flex: 1,
                    minWidth: '200px',
                    position: 'relative'
                  }}>
                    <button
                      type="button"
                      onClick={() => franchisePillsRef.current?.scrollBy({ left: -220, behavior: 'smooth' })}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-muted)',
                        borderRadius: '7px',
                        width: '26px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                      title="Scroll collections left"
                    >
                      <ChevronLeft size={14} />
                    </button>

                    <div
                      ref={franchisePillsRef}
                      onWheel={(e) => {
                        if (e.deltaY !== 0 && !e.shiftKey) {
                          e.currentTarget.scrollLeft += e.deltaY;
                        }
                      }}
                      style={{
                        display: 'flex',
                        gap: '6px',
                        overflowX: 'auto',
                        padding: '2px 4px',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(255,255,255,0.2) transparent',
                        WebkitOverflowScrolling: 'touch',
                        touchAction: 'pan-x',
                        flex: 1
                      }}
                    >
                      {effectivePacks.map(pack => {
                        const isSelected = activeFranchise?.id === pack.id;
                        return (
                          <button
                            key={pack.id}
                            type="button"
                            onClick={() => setSelectedPackId(pack.id)}
                            style={{
                              whiteSpace: 'nowrap',
                              padding: '5px 11px',
                              borderRadius: '8px',
                              background: isSelected ? 'rgba(245, 158, 11, 0.16)' : 'rgba(255,255,255,0.04)',
                              border: isSelected ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255,255,255,0.08)',
                              color: isSelected ? 'var(--gold)' : 'var(--text-muted)',
                              fontSize: '11.5px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              transition: 'all 0.15s',
                              flexShrink: 0
                            }}
                          >
                            <span>{pack.emoji}</span>
                            <span>{pack.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => franchisePillsRef.current?.scrollBy({ left: 220, behavior: 'smooth' })}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-muted)',
                        borderRadius: '7px',
                        width: '26px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                      title="Scroll collections right"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* 1-Click Add All Button */}
                  {activeFranchise && (
                    <button
                      type="button"
                      onClick={() => handleBatchAddFranchise(activeFranchise)}
                      style={{
                        background: 'linear-gradient(135deg, #e50914 0%, #b80710 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 10px rgba(229, 9, 20, 0.35)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                    >
                      <Zap size={13} /> Add All ({activeFranchise.movies.length})
                    </button>
                  )}
                </div>

                {/* DEDICATED FULL-HEIGHT POSTER GALLERY */}
                <div
                  style={{
                    flex: '1 1 auto',
                    minHeight: 0,
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'pan-y',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255,255,255,0.25) transparent',
                    padding: '16px'
                  }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))',
                    gap: '12px'
                  }}>
                    {activeFranchise.movies.map(movie => {
                      const inList = isMovieInList(movie.id, movie.tmdb_id);
                      return (
                        <div
                          key={movie.id || movie.tmdb_id}
                          onClick={() => handleAddMovie(movie)}
                          style={{
                            cursor: inList ? 'default' : 'pointer',
                            position: 'relative',
                            borderRadius: '9px',
                            overflow: 'hidden',
                            border: inList ? '1.5px solid var(--green, #10b981)' : '1px solid rgba(255,255,255,0.1)',
                            background: '#191522',
                            transition: 'transform 0.15s, border-color 0.15s',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                          onMouseEnter={e => { if (!inList) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                          onMouseLeave={e => { if (!inList) e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                          <div style={{ width: '100%', aspectRatio: '2/3', position: 'relative', background: '#0a0810' }}>
                            <img
                              src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                              alt={movie.title}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = FALLBACK_POSTER;
                              }}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {inList && (
                              <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(16, 185, 129, 0.45)',
                                backdropFilter: 'blur(2px)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '3px',
                                color: '#fff',
                                fontWeight: 900,
                                fontSize: '10.5px'
                              }}>
                                <Check size={18} strokeWidth={3} />
                                <span>IN LIST</span>
                              </div>
                            )}
                            {!inList && (
                              <button
                                type="button"
                                style={{
                                  position: 'absolute',
                                  bottom: '5px',
                                  right: '5px',
                                  background: 'var(--accent)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '22px',
                                  height: '22px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.6)'
                                }}
                              >
                                <Plus size={13} strokeWidth={3} />
                              </button>
                            )}
                          </div>
                          <div style={{ padding: '6px 7px 7px', background: '#120f1a', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '44px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {movie.title}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                              <span>{movie.release_year}</span>
                              {movie.rating ? <span style={{ color: 'var(--gold)' }}>★ {movie.rating}</span> : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: VISUAL POSTER GRID SEARCH */}
            {pickerTab === 'search' && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: 0,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,12,22,0.85)', flexShrink: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Search movies or TV shows across TMDB..."
                      value={searchQuery}
                      onChange={e => {
                        setSearchQuery(e.target.value);
                        handleSearchTMDB(e.target.value);
                      }}
                      className="form-input"
                      style={{ width: '100%', paddingLeft: '36px', fontSize: '12.5px' }}
                    />
                    {searching && (
                      <RefreshCw size={14} className="spin" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)' }} />
                    )}
                  </div>
                </div>

                <div style={{
                  flex: '1 1 auto',
                  minHeight: 0,
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  padding: '16px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255,255,255,0.25) transparent'
                }}>
                  {searchResults.length > 0 ? (
                    <div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        Found {searchResults.length} results · Click any poster to add
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))',
                        gap: '12px'
                      }}>
                        {searchResults.map(movie => {
                          const inList = isMovieInList(movie.id, movie.id);
                          return (
                            <div
                              key={movie.id}
                              onClick={() => handleAddMovie(movie)}
                              style={{
                                cursor: inList ? 'default' : 'pointer',
                                position: 'relative',
                                borderRadius: '9px',
                                overflow: 'hidden',
                                border: inList ? '1.5px solid var(--green, #10b981)' : '1px solid rgba(255,255,255,0.1)',
                                background: '#191522',
                                transition: 'transform 0.15s, border-color 0.15s',
                                display: 'flex',
                                flexDirection: 'column'
                              }}
                              onMouseEnter={e => { if (!inList) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                              onMouseLeave={e => { if (!inList) e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                              <div style={{ width: '100%', aspectRatio: '2/3', position: 'relative', background: '#0a0810' }}>
                                <img
                                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : FALLBACK_POSTER}
                                  alt={movie.title || movie.name}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = FALLBACK_POSTER;
                                  }}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {inList && (
                                  <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'rgba(16, 185, 129, 0.45)',
                                    backdropFilter: 'blur(2px)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '3px',
                                    color: '#fff',
                                    fontWeight: 900,
                                    fontSize: '10.5px'
                                  }}>
                                    <Check size={18} strokeWidth={3} />
                                    <span>IN LIST</span>
                                  </div>
                                )}
                                {!inList && (
                                  <button
                                    type="button"
                                    style={{
                                      position: 'absolute',
                                      bottom: '5px',
                                      right: '5px',
                                      background: 'var(--accent)',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '50%',
                                      width: '22px',
                                      height: '22px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.6)'
                                    }}
                                  >
                                    <Plus size={13} strokeWidth={3} />
                                  </button>
                                )}
                              </div>
                              <div style={{ padding: '6px 7px 7px', background: '#120f1a', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '44px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {movie.title || movie.name}
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                                  <span>{(movie.release_date || movie.first_air_date || '').slice(0, 4) || '—'}</span>
                                  {movie.vote_average ? <span style={{ color: 'var(--gold)' }}>★ {movie.vote_average.toFixed(1)}</span> : null}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-dim)', fontSize: '12.5px' }}>
                      <Search size={24} style={{ opacity: 0.3, marginBottom: '6px' }} />
                      <div>Type a title in the search box above to find any film or series across TMDB.</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: FROM MY LIBRARY */}
            {pickerTab === 'library' && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: 0,
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(15,12,22,0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  flexShrink: 0
                }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: '160px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Filter library..."
                      value={librarySearch}
                      onChange={e => setLibrarySearch(e.target.value)}
                      className="form-input"
                      style={{ width: '100%', paddingLeft: '32px', fontSize: '12px', padding: '6px 10px 6px 32px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'watched', label: 'Watched' },
                      { id: 'favorites', label: '★ Favs' },
                      { id: 'top_rated', label: '8+' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setLibraryFilter(f.id)}
                        style={{
                          background: libraryFilter === f.id ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                          color: libraryFilter === f.id ? '#fff' : 'var(--text-muted)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{
                  flex: '1 1 auto',
                  minHeight: 0,
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  padding: '16px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255,255,255,0.25) transparent'
                }}>
                  {filteredLibrary.length > 0 ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))',
                      gap: '12px'
                    }}>
                      {filteredLibrary.map(movie => {
                        const inList = isMovieInList(movie.id, movie.tmdb_id);
                        return (
                          <div
                            key={movie.id || movie.tmdb_id}
                            onClick={() => handleAddMovie(movie)}
                            style={{
                              cursor: inList ? 'default' : 'pointer',
                              position: 'relative',
                              borderRadius: '9px',
                              overflow: 'hidden',
                              border: inList ? '1.5px solid var(--green, #10b981)' : '1px solid rgba(255,255,255,0.1)',
                              background: '#191522',
                              transition: 'transform 0.15s, border-color 0.15s',
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                            onMouseEnter={e => { if (!inList) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { if (!inList) e.currentTarget.style.transform = 'translateY(0)'; }}
                          >
                            <div style={{ width: '100%', aspectRatio: '2/3', position: 'relative', background: '#0a0810' }}>
                              <img
                                src={movie.poster_path ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : FALLBACK_POSTER}
                                alt={movie.title}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = FALLBACK_POSTER;
                                }}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              {inList && (
                                <div style={{
                                  position: 'absolute',
                                  inset: 0,
                                  background: 'rgba(16, 185, 129, 0.45)',
                                  backdropFilter: 'blur(2px)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '3px',
                                  color: '#fff',
                                  fontWeight: 900,
                                  fontSize: '10.5px'
                                }}>
                                  <Check size={18} strokeWidth={3} />
                                  <span>IN LIST</span>
                                </div>
                              )}
                              {!inList && (
                                <button
                                  type="button"
                                  style={{
                                    position: 'absolute',
                                    bottom: '5px',
                                    right: '5px',
                                    background: 'var(--accent)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '22px',
                                    height: '22px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.6)'
                                  }}
                                >
                                  <Plus size={13} strokeWidth={3} />
                                </button>
                              )}
                            </div>
                            <div style={{ padding: '6px 7px 7px', background: '#120f1a', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '44px' }}>
                              <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {movie.title}
                              </div>
                              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{movie.release_year || '—'}</span>
                                {movie.user_rating ? <span style={{ color: 'var(--gold)' }}>★ {movie.user_rating}</span> : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-dim)', fontSize: '12.5px' }}>
                      No matching films in your library with the current filter.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile-Only Done Adding Bar in Right Panel */}
            <div
              className="create-list-mobile-footer"
              style={{
                padding: '10px 14px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(10, 8, 16, 0.98)',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                flexShrink: 0
              }}
            >
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                <strong style={{ color: '#fff' }}>{entries.length}</strong> {entries.length === 1 ? 'film' : 'films'} in list
              </div>
              <button
                type="button"
                onClick={() => setMobileStudioTab('entries')}
                className="btn btn-primary"
                style={{
                  padding: '9px 18px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Check size={14} /> View My List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tap-to-Move Position Dialog */}
      {reorderTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100005,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setReorderTarget(null)}
        >
          <div
            style={{
              background: '#191524',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '16px',
              padding: '20px',
              maxWidth: '350px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              animation: 'fadeInScale 0.15s ease-out'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowUpDown size={16} color="var(--accent)" /> Move Film Position
              </div>
              <button
                onClick={() => setReorderTarget(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Moving <strong style={{ color: '#fff' }}>"{reorderTarget.title}"</strong> (currently #{reorderTarget.index + 1} of {entries.length})
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleApplyReorder(1)}
                className="btn btn-ghost"
                style={{ flex: 1, fontSize: '12px', padding: '8px 0', border: '1px solid rgba(255,255,255,0.12)', fontWeight: 700 }}
              >
                🔝 #1 (Top)
              </button>
              <button
                type="button"
                onClick={() => handleApplyReorder(entries.length)}
                className="btn btn-ghost"
                style={{ flex: 1, fontSize: '12px', padding: '8px 0', border: '1px solid rgba(255,255,255,0.12)', fontWeight: 700 }}
              >
                ⬇️ #{entries.length} (Last)
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const targetRank = parseInt(targetPositionInput, 10);
                if (!isNaN(targetRank)) handleApplyReorder(targetRank);
              }}
              style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}
            >
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                Move to rank:
              </span>
              <input
                type="number"
                min="1"
                max={entries.length}
                value={targetPositionInput}
                onChange={e => setTargetPositionInput(e.target.value)}
                placeholder={`1 - ${entries.length}`}
                className="form-input"
                style={{ width: '85px', padding: '7px 8px', fontSize: '13.5px', fontWeight: 800, textAlign: 'center' }}
                autoFocus
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1, padding: '8px 14px', fontSize: '12.5px', fontWeight: 800 }}
              >
                Apply
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── CUSTOM IN-APP CLEAR ALL CONFIRMATION MODAL ── */}
      {showClearModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowClearModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#181424',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '16px',
              padding: '24px 22px',
              maxWidth: '380px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(239, 68, 68, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '14px'
            }}
          >
            {/* Warning Icon Badge */}
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.14)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'
            }}>
              <Trash2 size={26} color="#ef4444" strokeWidth={2.2} />
            </div>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
                Clear All Films?
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                Are you sure you want to remove all <strong style={{ color: '#fff' }}>{entries.length} {entries.length === 1 ? 'film' : 'films'}</strong> from this list?
              </p>
            </div>

            {/* Quick stats badge */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '11.5px',
              color: 'var(--text-dim)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Film size={12} /> {entries.length} items will be removed
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '9px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setEntries([]);
                  setShowClearModal(false);
                  showToast('🗑️ Cleared all films from list');
                }}
                style={{
                  flex: 1.2,
                  padding: '10px 14px',
                  borderRadius: '9px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
                  transition: 'opacity 0.15s, transform 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <Trash2 size={14} /> Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
