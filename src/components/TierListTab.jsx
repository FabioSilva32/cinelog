import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, GripVertical, Settings2, Trash2, Plus, ChevronUp, ChevronDown, Heart, Star, Check, X, Sparkles, Tag } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { FRANCHISE_COLLECTIONS, GENRE_LIST, matchesCollection } from '../utils/collections';

const DEFAULT_TIERS = [
  { id: 's', label: 'S', color: '#ff4d4d', desc: 'All-time masterpieces' },
  { id: 'a', label: 'A', color: '#ff8c00', desc: 'Excellent films' },
  { id: 'b', label: 'B', color: '#f0c040', desc: 'Great watches' },
  { id: 'c', label: 'C', color: '#4dcd80', desc: 'Solid & enjoyable' },
  { id: 'd', label: 'D', color: '#4da6ff', desc: 'Below average' },
  { id: 'f', label: 'F', color: '#9b59b6', desc: 'Forgettable' }
];

const COLOR_PRESETS = [
  { name: 'Rose', value: '#ff4d4d' },
  { name: 'Orange', value: '#ff8c00' },
  { name: 'Amber', value: '#f0c040' },
  { name: 'Emerald', value: '#4dcd80' },
  { name: 'Blue', value: '#4da6ff' },
  { name: 'Purple', value: '#9b59b6' },
  { name: 'Lavender', value: '#c0392b' },
  { name: 'Slate', value: '#64748b' }
];

export default function TierListTab({ library = [] }) {
  // ── SAVE/LOAD MULTIPLE LISTS STATE ────────────────────────────────
  const [lists, setLists] = useState(() => {
    try {
      const stored = localStorage.getItem('cinelog_saved_tier_lists_v4');
      if (stored) return JSON.parse(stored);
      
      const storedTiers = localStorage.getItem('cinelog_tiers_list_setup_v3');
      const storedData = localStorage.getItem('cinelog_tier_list_data_v3');
      const t = storedTiers ? JSON.parse(storedTiers) : DEFAULT_TIERS;
      const d = storedData ? JSON.parse(storedData) : {};
      
      return {
        default: { id: 'default', name: 'Global Master List', tiers: t, tierData: d }
      };
    } catch {
      return {
        default: { id: 'default', name: 'Global Master List', tiers: DEFAULT_TIERS, tierData: {} }
      };
    }
  });

  const [activeListId, setActiveListId] = useState(() => {
    return localStorage.getItem('cinelog_active_tier_list_id_v4') || 'default';
  });

  const [tiers, setTiers] = useState(() => {
    try {
      const storedLists = localStorage.getItem('cinelog_saved_tier_lists_v4');
      const activeId = localStorage.getItem('cinelog_active_tier_list_id_v4') || 'default';
      if (storedLists) {
        const parsed = JSON.parse(storedLists);
        if (parsed[activeId]) return parsed[activeId].tiers;
      }
      const storedTiers = localStorage.getItem('cinelog_tiers_list_setup_v3');
      return storedTiers ? JSON.parse(storedTiers) : DEFAULT_TIERS;
    } catch {
      return DEFAULT_TIERS;
    }
  });

  const [tierData, setTierData] = useState(() => {
    try {
      const storedLists = localStorage.getItem('cinelog_saved_tier_lists_v4');
      const activeId = localStorage.getItem('cinelog_active_tier_list_id_v4') || 'default';
      if (storedLists) {
        const parsed = JSON.parse(storedLists);
        if (parsed[activeId]) return parsed[activeId].tierData;
      }
      const storedData = localStorage.getItem('cinelog_tier_list_data_v3');
      return storedData ? JSON.parse(storedData) : {};
    } catch {
      const defaultData = {};
      DEFAULT_TIERS.forEach(t => { defaultData[t.id] = []; });
      return defaultData;
    }
  });

  const [poolFilter, setPoolFilter] = useState(() => lists[activeListId]?.poolFilter || 'all'); // 'all', franchise ID, genre, 'custom:...', or 'tag:...'
  const [includeUnwatched, setIncludeUnwatched] = useState(() => lists[activeListId]?.includeUnwatched ?? true);
  const [poolSearch, setPoolSearch] = useState('');

  // Synchronize custom collections created in CollectionsTab
  const [customCollections, setCustomCollections] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cinelog_collections_v1')) || {}; }
    catch { return {}; }
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('cinelog_collections_v1')) || {};
        setCustomCollections(stored);
      } catch {}
    };
    window.addEventListener('cinelog_collections_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('cinelog_collections_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Compute available tags from library
  const availableTags = useMemo(() => {
    const tagSet = new Set();
    library.forEach(m => {
      if (Array.isArray(m.tags)) {
        m.tags.forEach(t => {
          if (typeof t === 'string' && t.trim()) tagSet.add(t.trim());
        });
      }
    });
    return Array.from(tagSet).sort();
  }, [library]);

  const [dragInfo, setDragInfo] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [quickAssignId, setQuickAssignId] = useState(null); // tap-to-assign for mobile
  
  // Settings edit modal / panel state
  const [editingTierId, setEditingTierId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editColor, setEditColor] = useState('');

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDanger: true,
  });

  // Helper to switch list safely
  const selectList = (listId) => {
    // 1. Save current active list
    const updated = {
      ...lists,
      [activeListId]: {
        ...lists[activeListId],
        tiers,
        tierData,
        poolFilter,
        includeUnwatched
      }
    };
    setLists(updated);
    localStorage.setItem('cinelog_saved_tier_lists_v4', JSON.stringify(updated));

    // 2. Load next list
    setActiveListId(listId);
    localStorage.setItem('cinelog_active_tier_list_id_v4', listId);
    const nextList = updated[listId];
    if (nextList) {
      setTiers(nextList.tiers || DEFAULT_TIERS);
      setTierData(nextList.tierData || {});
      if (nextList.poolFilter !== undefined) setPoolFilter(nextList.poolFilter);
      if (nextList.includeUnwatched !== undefined) setIncludeUnwatched(nextList.includeUnwatched);
    }
  };

  // Sync tiers/tierData/filter of active list to localStorage on modifications
  useEffect(() => {
    const updated = {
      ...lists,
      [activeListId]: {
        ...lists[activeListId],
        id: activeListId,
        tiers,
        tierData,
        poolFilter,
        includeUnwatched
      }
    };
    localStorage.setItem('cinelog_saved_tier_lists_v4', JSON.stringify(updated));
  }, [tiers, tierData, poolFilter, includeUnwatched, activeListId]);


  // ── HELPERS & SEEDS ────────────────────────────────────────────────
  const assignedIds = useMemo(() => {
    return new Set(Object.values(tierData).flat());
  }, [tierData]);

  const watchedMovies = useMemo(() => {
    let pool = library.filter(m => {
      if (assignedIds.has(String(m.id || m.tmdb_id))) return false;
      if (!includeUnwatched && m.status !== 'watched') return false;
      return true;
    });

    // Apply collection / franchise / genre / custom / tag filter
    if (poolFilter !== 'all') {
      pool = pool.filter(m => matchesCollection(m, poolFilter, customCollections));
    }

    // Fuzzy text search
    if (poolSearch.trim()) {
      const q = poolSearch.toLowerCase();
      pool = pool.filter(m => m.title?.toLowerCase().includes(q) || (m.release_year?.toString() || '').includes(q) || (m.genres || []).some(g => g.toLowerCase().includes(q)));
    }

    return pool;
  }, [library, assignedIds, poolFilter, poolSearch, customCollections, includeUnwatched]);

  const autoRankPool = () => {
    setTierData(prev => {
      const copy = {};
      tiers.forEach(t => { copy[t.id] = [...(prev[t.id] || [])]; });
      
      watchedMovies.forEach(m => {
        const rating = Number(m.rating || 5);
        let targetTierId = 'c';
        if (rating >= 9.0) targetTierId = 's';
        else if (rating >= 8.0) targetTierId = 'a';
        else if (rating >= 7.0) targetTierId = 'b';
        else if (rating >= 5.0) targetTierId = 'c';
        else if (rating >= 3.0) targetTierId = 'd';
        else targetTierId = 'f';

        const actualTierId = tiers.find(t => t.id === targetTierId) ? targetTierId : (tiers[0]?.id || 's');
        if (!copy[actualTierId]) copy[actualTierId] = [];
        const mId = String(m.id || m.tmdb_id);
        if (!copy[actualTierId].includes(mId)) {
          copy[actualTierId].push(mId);
        }
      });
      return copy;
    });
  };

  const getMovie = (id) =>
    library.find(m => String(m.id) === id || String(m.tmdb_id) === id);

  const createNewList = (name) => {
    if (!name.trim()) return;
    const newId = `list-${Date.now()}`;
    const lower = name.toLowerCase();
    let detectedFilter = 'all';
    if (lower.includes('marvel') || lower.includes('mcu') || lower.includes('avengers')) detectedFilter = 'mcu';
    else if (lower.includes('star wars')) detectedFilter = 'star-wars';
    else if (lower.includes('batman') || lower.includes('dc')) detectedFilter = 'batman';
    else if (lower.includes('harry potter') || lower.includes('wizarding')) detectedFilter = 'harry-potter';
    else if (lower.includes('lotr') || lower.includes('rings') || lower.includes('middle earth')) detectedFilter = 'lotr';
    else if (lower.includes('pixar')) detectedFilter = 'pixar';
    else if (lower.includes('ghibli')) detectedFilter = 'ghibli';
    else if (lower.includes('spider')) detectedFilter = 'spider-man';

    const updated = {
      ...lists,
      [newId]: {
        id: newId,
        name: name.trim(),
        tiers: DEFAULT_TIERS,
        tierData: {},
        poolFilter: detectedFilter,
        includeUnwatched: true
      }
    };
    setLists(updated);
    setActiveListId(newId);
    setTiers(DEFAULT_TIERS);
    setTierData({});
    setPoolFilter(detectedFilter);
    setIncludeUnwatched(true);
    localStorage.setItem('cinelog_saved_tier_lists_v4', JSON.stringify(updated));
    localStorage.setItem('cinelog_active_tier_list_id_v4', newId);
  };

  const deleteList = (listId) => {
    if (listId === 'default') return; // Cannot delete Global Master List
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Tier List?',
      message: `Are you sure you want to delete "${lists[listId]?.name}"? This action cannot be undone.`,
      isDanger: true,
      onConfirm: () => {
        const copy = { ...lists };
        delete copy[listId];
        setLists(copy);
        localStorage.setItem('cinelog_saved_tier_lists_v4', JSON.stringify(copy));
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        
        // Fallback to default list
        setActiveListId('default');
        localStorage.setItem('cinelog_active_tier_list_id_v4', 'default');
        setTiers(copy.default.tiers || DEFAULT_TIERS);
        setTierData(copy.default.tierData || {});
      }
    });
  };

  const handleReset = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Reset Tier List?',
      message: 'Are you sure you want to clear all movie ranks and restore the default tiers? Your current rank placements will be reset.',
      isDanger: true,
      onConfirm: () => {
        setTiers(DEFAULT_TIERS);
        const defaultData = {};
        DEFAULT_TIERS.forEach(t => { defaultData[t.id] = []; });
        setTierData(defaultData);
        setEditingTierId(null);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // ── DRAG HANDLERS ──────────────────────────────────────────────────
  const handleDragStart = (e, movieId, sourceTier) => {
    setDragInfo({ movieId: String(movieId), sourceTier });
    e.dataTransfer.effectAllowed = 'move';
    const ghost = document.createElement('div');
    ghost.style.cssText = 'position:fixed;top:-999px;left:-999px;opacity:0';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleDragOver = (e, targetTier) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(targetTier);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e, targetTier) => {
    e.preventDefault();
    setDropTarget(null);
    setHoveredCardId(null);
    if (!dragInfo) return;

    const { movieId, sourceTier } = dragInfo;

    setTierData(prev => {
      const updated = {};
      tiers.forEach(t => { updated[t.id] = [...(prev[t.id] || [])]; });
      
      // Remove from source
      if (sourceTier && sourceTier !== 'pool') {
        updated[sourceTier] = updated[sourceTier].filter(id => id !== movieId);
      } else {
        tiers.forEach(t => {
          updated[t.id] = updated[t.id].filter(id => id !== movieId);
        });
      }
      
      // Add to target
      if (!updated[targetTier]) updated[targetTier] = [];
      if (!updated[targetTier].includes(movieId)) {
        updated[targetTier] = [...updated[targetTier], movieId];
      }
      return updated;
    });
    setDragInfo(null);
  };

  const handleDropOnCard = (e, targetTier, targetMovieId) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(null);
    setHoveredCardId(null);
    if (!dragInfo) return;

    const { movieId, sourceTier } = dragInfo;

    setTierData(prev => {
      const updated = {};
      tiers.forEach(t => { updated[t.id] = [...(prev[t.id] || [])]; });

      // Remove from source
      if (sourceTier && sourceTier !== 'pool') {
        updated[sourceTier] = updated[sourceTier].filter(id => id !== movieId);
      } else {
        tiers.forEach(t => {
          updated[t.id] = updated[t.id].filter(id => id !== movieId);
        });
      }

      // Insert before target
      const targetIndex = updated[targetTier].indexOf(targetMovieId);
      if (targetIndex !== -1) {
        updated[targetTier].splice(targetIndex, 0, movieId);
      } else {
        updated[targetTier].push(movieId);
      }
      return updated;
    });
    setDragInfo(null);
  };

  const handleDropToPool = (e) => {
    e.preventDefault();
    setDropTarget(null);
    setHoveredCardId(null);
    if (!dragInfo || dragInfo.sourceTier === 'pool') return;
    const { movieId } = dragInfo;
    setTierData(prev => {
      const updated = {};
      tiers.forEach(t => { updated[t.id] = (prev[t.id] || []).filter(id => id !== movieId); });
      return updated;
    });
    setDragInfo(null);
  };

  const handleDragEnd = () => {
    setDragInfo(null);
    setDropTarget(null);
    setHoveredCardId(null);
  };

  // ── TIER ACTIONS ───────────────────────────────────────────────────
  const openEditPanel = (tier) => {
    setEditingTierId(tier.id);
    setEditLabel(tier.label);
    setEditColor(tier.color);
  };

  const saveTierEdit = () => {
    if (!editLabel.trim()) return;
    setTiers(prev => prev.map(t => t.id === editingTierId ? { ...t, label: editLabel, color: editColor } : t));
    setEditingTierId(null);
  };

  const moveTier = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= tiers.length) return;
    setTiers(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  const addTier = () => {
    const newId = `tier-${Date.now()}`;
    const newTier = {
      id: newId,
      label: 'NEW',
      color: '#64748b',
      desc: 'New custom tier'
    };
    setTiers(prev => [...prev, newTier]);
    setTierData(prev => ({ ...prev, [newId]: [] }));
    openEditPanel(newTier);
  };

  const deleteTier = (tierId) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Tier?',
      message: 'Are you sure you want to delete this tier? All ranked movies inside will return to the pool.',
      isDanger: true,
      onConfirm: () => {
        setTiers(prev => prev.filter(t => t.id !== tierId));
        setTierData(prev => {
          const copy = { ...prev };
          delete copy[tierId];
          return copy;
        });
        if (editingTierId === tierId) setEditingTierId(null);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDescription = () => {
    return 'Rank watched titles into customizable rows. Drag posters or tap to assign on mobile.';
  };

  // Quick-assign handler for tap-to-assign
  const handleQuickAssign = (movieId, tierId) => {
    setTierData(prev => {
      const updated = {};
      tiers.forEach(t => { updated[t.id] = [...(prev[t.id] || [])]; });
      // Remove from all tiers first
      tiers.forEach(t => {
        updated[t.id] = updated[t.id].filter(id => id !== movieId);
      });
      // Add to target tier
      if (!updated[tierId]) updated[tierId] = [];
      if (!updated[tierId].includes(movieId)) {
        updated[tierId].push(movieId);
      }
      return updated;
    });
    setQuickAssignId(null);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '26px', marginBottom: '4px', letterSpacing: '-0.5px' }}>Custom Tier Maker</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
            Rank watched titles into customizable rows. Drag posters to reorder, or edit tiers.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* List Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)' }}>Rank List:</span>
            <select
              value={activeListId}
              onChange={e => selectList(e.target.value)}
              className="form-input"
              style={{ fontSize: '12.5px', background: '#141414', border: '1px solid var(--border)', color: '#fff', padding: '6px 12px', borderRadius: '6px', width: '185px' }}
            >
              {Object.values(lists).map(l => (
                <option key={l.id} value={l.id} style={{ background: '#141414', color: '#fff' }}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* New List Button */}
          <button
            className="btn btn-ghost"
            onClick={() => {
              const name = prompt("Enter a name for your new rank list:");
              if (name && name.trim()) createNewList(name);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', height: '34px', padding: '0 12px', border: '1px solid var(--border)', background: '#141414' }}
          >
            <Plus size={14} /> New List
          </button>

          {/* Delete List Button */}
          {activeListId !== 'default' && (
            <button
              className="btn btn-ghost"
              onClick={() => deleteList(activeListId)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', height: '34px', padding: '0 10px', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)' }}
            >
              ✕ Delete
            </button>
          )}

          <button className="btn btn-ghost" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', height: '34px' }}>
            <RefreshCw size={13} />
            Reset Placements
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div style={{ background: '#141414', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 6px', background: 'var(--accent)', color: '#fff', borderRadius: '4px' }}>TIP</span>
        <span>Drag posters to rank, or <strong style={{ color: 'var(--accent)' }}>tap to assign</strong> on mobile. Unwatched items can be toggled in the pool below.</span>
      </div>

      {/* ── TIER ROWS CONTAINER ────────────────────────────────────────── */}
      <div
        className="glass"
        style={{
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: `1px solid ${dropTarget && dropTarget !== 'pool' ? 'rgba(136,8,8,0.4)' : 'var(--border)'}`,
          transition: 'border-color 0.2s',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {tiers.map((tier, idx) => {
          const isTarget = dropTarget === tier.id;
          const moviesList = tierData[tier.id] || [];
          
          return (
            <div key={tier.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  borderBottom: idx < tiers.length - 1 || editingTierId === tier.id ? '1px solid var(--border)' : 'none',
                  minHeight: '130px',
                  background: isTarget ? 'rgba(136,8,8,0.08)' : 'transparent',
                  transition: 'background 0.2s',
                  position: 'relative'
                }}
                onDragOver={e => handleDragOver(e, tier.id)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, tier.id)}
              >
                
                {/* ── TIER LABEL (Left Panel) ── */}
                <div style={{
                  width: '110px',
                  background: tier.color,
                  color: '#0a0a0f',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 900,
                  fontSize: '34px',
                  letterSpacing: '-1.5px',
                  flexShrink: 0,
                  userSelect: 'none',
                  position: 'relative',
                  padding: '12px 6px',
                  textAlign: 'center'
                }}
                  className="tier-label-hover-group"
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>
                    {tier.label}
                  </span>
                  <div style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0px', opacity: 0.7, lineHeight: 1, marginTop: '5px' }}>
                    {moviesList.length} film{moviesList.length !== 1 ? 's' : ''}
                  </div>

                  {/* Settings Gear Overlay Trigger */}
                  <button
                    onClick={() => openEditPanel(tier)}
                    style={{
                      position: 'absolute', top: '5px', right: '5px',
                      background: 'rgba(0,0,0,0.6)', border: 'none',
                      borderRadius: '50%', width: '22px', height: '22px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', cursor: 'pointer', opacity: 0,
                      transition: 'opacity 0.2s'
                    }}
                    className="tier-label-settings-btn"
                  >
                    <Settings2 size={12} />
                  </button>
                  <style>{`
                    .tier-label-hover-group:hover .tier-label-settings-btn { opacity: 1 !important; }
                  `}</style>
                </div>

                {/* ── ROW ITEMS (Posters) ── */}
                <div style={{
                  flex: 1,
                  padding: '12px 16px',
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  minHeight: '130px',
                }}>
                  {moviesList.map(id => {
                    const movie = getMovie(id);
                    if (!movie) return null;
                    const isDragging = dragInfo?.movieId === id;
                    
                    return (
                      <div
                        key={id}
                        draggable
                        onDragStart={e => handleDragStart(e, id, tier.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                        onDragEnter={e => { if (dragInfo && dragInfo.movieId !== id) setHoveredCardId(id); }}
                        onDragLeave={() => setHoveredCardId(null)}
                        onDrop={e => { setHoveredCardId(null); handleDropOnCard(e, tier.id, id); }}
                        className="glass-card"
                        style={{
                          position: 'relative',
                          cursor: 'grab',
                          opacity: isDragging ? 0.4 : 1,
                          transform: isDragging ? 'scale(0.95)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                          borderRadius: '6px',
                          border: `2px solid ${isDragging ? 'var(--accent)' : 'transparent'}`,
                          borderLeft: hoveredCardId === id ? '4px solid var(--accent)' : (isDragging ? '2px solid var(--accent)' : '2px solid transparent'),
                          paddingLeft: hoveredCardId === id ? '4px' : '0px',
                          width: '74px',
                          height: '110px',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                          overflow: 'hidden'
                        }}
                        title={`Drag to reorder • ${movie.title}`}
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                          alt={movie.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            userSelect: 'none',
                            pointerEvents: 'none',
                          }}
                          draggable={false}
                        />

                        {/* Top-Left Favorite Badge (Red Heart) */}
                        {movie.favorite && (
                          <div style={{
                            position: 'absolute', top: '4px', left: '4px',
                            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
                            borderRadius: '50%', width: '18px', height: '18px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                          }}>
                            <Heart size={10} fill="var(--red)" color="var(--red)" />
                          </div>
                        )}

                        {/* Bottom-Right Rating Badge */}
                        {movie.rating != null && (
                          <div style={{
                            position: 'absolute', bottom: '4px', right: '4px',
                            background: 'rgba(10,8,19,0.9)', backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '4px', padding: '1px 4px',
                            fontSize: '9px', fontWeight: 800, color: 'var(--gold)',
                            display: 'flex', alignItems: 'center', gap: '1px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.6)'
                          }}>
                            <Star size={7} fill="var(--gold)" color="var(--gold)" />
                            {Number(movie.rating).toFixed(1)}
                          </div>
                        )}

                        {/* Hover Clear Overlay */}
                        <div
                          className="tier-item-remove"
                          onClick={() => setTierData(prev => {
                            const u = { ...prev };
                            u[tier.id] = (u[tier.id] || []).filter(i => i !== id);
                            return u;
                          })}
                          title="Remove from tier"
                          style={{
                            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--red)', fontSize: '10px', fontWeight: 900,
                            opacity: 0, transition: 'opacity 0.15s',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = 1}
                          onMouseLeave={e => e.currentTarget.style.opacity = 0}
                        >
                          ✕ Remove
                        </div>
                      </div>
                    );
                  })}
                  
                  {moviesList.length === 0 && (
                    <div style={{
                      color: isTarget ? 'var(--accent)' : 'var(--text-dim)',
                      fontSize: '13px',
                      fontWeight: 600,
                      paddingLeft: '4px',
                      transition: 'color 0.2s',
                    }}>
                      {isTarget ? '⬇ Drop here' : 'Drag titles here…'}
                    </div>
                  )}
                </div>
              </div>

              {/* ── INLINE TIER EDIT PANEL ── */}
              {editingTierId === tier.id && (
                <div className="glass" style={{
                  padding: '16px 20px',
                  background: 'rgba(255,255,255,0.02)',
                  borderBottom: idx < tiers.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800 }}>Row Customizer</span>
                    <button className="btn btn-ghost" onClick={() => setEditingTierId(null)} style={{ padding: '4px', width: '24px', height: '24px', borderRadius: '50%' }}>
                      <X size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                    
                    {/* Label Input */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>TIER NAME</label>
                      <input
                        type="text"
                        maxLength="12"
                        value={editLabel}
                        onChange={e => setEditLabel(e.target.value)}
                        style={{
                          background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)',
                          borderRadius: '6px', color: '#fff', padding: '6px 10px',
                          fontSize: '13px', fontWeight: 800, width: '120px', outline: 'none'
                        }}
                      />
                    </div>

                    {/* Color Preset Picker */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>COLOR PRESET</label>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {COLOR_PRESETS.map(preset => (
                          <button
                            key={preset.value}
                            onClick={() => setEditColor(preset.value)}
                            style={{
                              width: '24px', height: '24px', borderRadius: '50%',
                              background: preset.value, border: `2px solid ${editColor === preset.value ? '#fff' : 'transparent'}`,
                              boxShadow: editColor === preset.value ? '0 0 8px rgba(255,255,255,0.4)' : 'none',
                              cursor: 'pointer', padding: 0
                            }}
                            title={preset.name}
                          />
                        ))}
                        {/* Hex Color Input */}
                        <input
                          type="color"
                          value={editColor}
                          onChange={e => setEditColor(e.target.value)}
                          style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            border: 'none', cursor: 'pointer', background: 'none', padding: 0
                          }}
                          title="Custom Color"
                        />
                      </div>
                    </div>

                    {/* Hierarchy & Delete Actions */}
                    <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end', marginLeft: 'auto' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => moveTier(idx, -1)}
                        disabled={idx === 0}
                        style={{ padding: '6px 10px', height: '32px', opacity: idx === 0 ? 0.3 : 1 }}
                        title="Move Row Up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => moveTier(idx, 1)}
                        disabled={idx === tiers.length - 1}
                        style={{ padding: '6px 10px', height: '32px', opacity: idx === tiers.length - 1 ? 0.3 : 1 }}
                        title="Move Row Down"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        className="btn btn-ghost"
                        onClick={() => deleteTier(tier.id)}
                        disabled={tiers.length <= 1}
                        style={{ padding: '6px 10px', height: '32px', color: 'var(--red)', background: 'rgba(239,68,68,0.06)' }}
                        title="Delete Row"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={saveTierEdit}
                        style={{ padding: '6px 16px', height: '32px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Check size={14} /> Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Tier Row Option */}
      <button
        onClick={addTier}
        className="glass"
        style={{
          border: '2px dashed var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: 'var(--text-dim)',
          fontWeight: 700,
          cursor: 'pointer',
          background: 'rgba(255,255,255,0.01)',
          transition: 'all 0.2s',
          fontSize: '13.5px'
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(136,8,8,0.03)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; }}
      >
        <Plus size={16} /> Add Custom Tier Row
      </button>

      {/* ── MOVIE POOL ────────────────────────────────────────────────── */}
      <div
        className="glass"
        onDragOver={e => { e.preventDefault(); setDropTarget('pool'); }}
        onDragLeave={handleDragLeave}
        onDrop={handleDropToPool}
        style={{
          borderRadius: 'var(--radius-lg)',
          padding: '22px 24px',
          border: `1px solid ${dropTarget === 'pool' ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`,
          background: dropTarget === 'pool' ? 'rgba(239,68,68,0.06)' : 'var(--surface)',
          transition: 'all 0.2s',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Unranked Movie Pool</h3>
            <span style={{ background: '#1c1c1c', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5px 8px', fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>{watchedMovies.length}</span>
            <button
              onClick={() => setIncludeUnwatched(!includeUnwatched)}
              style={{
                background: includeUnwatched ? 'var(--accent)' : '#161616',
                color: includeUnwatched ? '#fff' : 'var(--text-dim)',
                border: `1px solid ${includeUnwatched ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              title="Toggle including watchlist and unwatched library titles in the tier pool"
            >
              {includeUnwatched ? '✓ Unwatched Included' : '+ Include Unwatched'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Filter Pool Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)' }}>Pool Preset:</span>
              <select
                value={poolFilter}
                onChange={e => setPoolFilter(e.target.value)}
                className="form-input"
                style={{ fontSize: '12px', background: '#141414', border: '1px solid var(--border)', color: '#fff', padding: '4px 10px', borderRadius: '6px', minWidth: '155px', maxWidth: '210px' }}
              >
                <option value="all" style={{ background: '#141414' }}>All Library Titles</option>
                <optgroup label="Franchise Collections" style={{ background: '#141414' }}>
                  {FRANCHISE_COLLECTIONS.map(f => (
                    <option key={f.id} value={f.id} style={{ background: '#141414' }}>
                      {f.shortTitle || f.title}
                    </option>
                  ))}
                </optgroup>
                {Object.keys(customCollections).length > 0 && (
                  <optgroup label="Your Custom Collections" style={{ background: '#141414' }}>
                    {Object.entries(customCollections).map(([title, data]) => (
                      <option key={title} value={`custom:${title}`} style={{ background: '#141414' }}>
                        {title} ({data.movieIds?.length || 0})
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="Genres" style={{ background: '#141414' }}>
                  {GENRE_LIST.map(g => (
                    <option key={g} value={g} style={{ background: '#141414' }}>{g}</option>
                  ))}
                </optgroup>
                {availableTags.length > 0 && (
                  <optgroup label="Your Custom Tags" style={{ background: '#141414' }}>
                    {availableTags.map(t => (
                      <option key={t} value={`tag:${t}`} style={{ background: '#141414' }}>
                        #{t}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Fuzzy Search */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search pool…"
                value={poolSearch}
                onChange={e => setPoolSearch(e.target.value)}
                style={{ paddingLeft: '10px', paddingRight: '8px', paddingTop: '4px', paddingBottom: '4px', background: '#141414', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', fontSize: '12px', width: '130px', outline: 'none' }}
              />
              {poolSearch && <button onClick={() => setPoolSearch('')} style={{ position: 'absolute', right: '6px', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '12px', padding: 0 }}>✕</button>}
            </div>

            {/* Auto Rank Button */}
            {watchedMovies.length > 0 && (
              <button
                className="btn btn-ghost"
                onClick={autoRankPool}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', height: '30px', padding: '0 10px', border: '1px solid var(--border)', background: '#161616', color: 'var(--accent)' }}
              >
                Auto-Rank Pool
              </button>
            )}
          </div>
        </div>

        {watchedMovies.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(86px, 1fr))', gap: '14px' }}>
            {watchedMovies.map(movie => {
              const id = String(movie.id || movie.tmdb_id);
              const isDragging = dragInfo?.movieId === id;
              return (
                <div
                  key={id}
                  draggable
                  onDragStart={e => handleDragStart(e, id, 'pool')}
                  onDragEnd={handleDragEnd}
                  className="glass-card"
                  style={{
                    borderRadius: '6px',
                    overflow: 'visible',
                    cursor: 'grab',
                    opacity: isDragging ? 0.35 : 1,
                    transform: isDragging ? 'scale(0.93)' : 'scale(1)',
                    transition: 'opacity 0.15s, transform 0.15s',
                    width: '74px',
                    height: '110px',
                    position: 'relative',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                    margin: '0 auto'
                  }}
                  title={movie.title}
                  onClick={(e) => { if (!dragInfo) { e.stopPropagation(); setQuickAssignId(quickAssignId === id ? null : id); } }}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                    alt={movie.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', userSelect: 'none', pointerEvents: 'none' }}
                    draggable={false}
                  />

                  {/* Hover Stats Overlay */}
                  <div style={{
                    position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
                    opacity: 0, transition: 'opacity 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    padding: '4px', gap: '1px', pointerEvents: 'none'
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                    className="pool-hover-stats"
                  >
                    <div style={{ fontSize: '8px', fontWeight: 900, color: '#fff', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{movie.title}</div>
                    {movie.rating > 0 && <div style={{ fontSize: '8px', color: 'var(--gold)', fontWeight: 800 }}>★ {Number(movie.rating).toFixed(1)}</div>}
                    {movie.release_year && <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.6)' }}>{movie.release_year}</div>}
                  </div>

                  {/* Top-Left Favorite Heart Badge */}
                  {movie.favorite && (
                    <div style={{
                      position: 'absolute', top: '4px', left: '4px',
                      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
                      borderRadius: '50%', width: '18px', height: '18px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                    }}>
                      <Heart size={10} fill="var(--red)" color="var(--red)" />
                    </div>
                  )}

                  {/* Bottom-Right Rating Badge */}
                  {movie.rating != null && (
                    <div style={{
                      position: 'absolute', bottom: '4px', right: '4px',
                      background: 'rgba(10,8,19,0.9)', backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '4px', padding: '1px 4px',
                      fontSize: '9px', fontWeight: 800, color: 'var(--gold)',
                      display: 'flex', alignItems: 'center', gap: '1px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.6)'
                    }}>
                      <Star size={7} fill="var(--gold)" color="var(--gold)" />
                      {Number(movie.rating).toFixed(1)}
                    </div>
                  )}

                  {/* Drag hint overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                    padding: '4px',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%)',
                    pointerEvents: 'none'
                  }}>
                    <GripVertical size={12} color="rgba(255,255,255,0.6)" />
                  </div>

                  {/* Tap-to-assign dropdown menu */}
                  {quickAssignId === id && (
                    <div style={{
                      position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                      marginTop: '6px', background: '#121020', border: '1px solid var(--accent)',
                      borderRadius: '8px', padding: '6px', zIndex: 100, boxShadow: '0 10px 25px rgba(0,0,0,0.7)',
                      display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '110px'
                    }} onClick={e => e.stopPropagation()}>
                      <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 800, textAlign: 'center', paddingBottom: '2px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Assign to Tier</div>
                      {tiers.map(t => (
                        <button
                          key={t.id}
                          onClick={() => handleQuickAssign(id, t.id)}
                          style={{
                            background: t.color, color: '#000', border: 'none', borderRadius: '4px',
                            padding: '4px 8px', fontSize: '11px', fontWeight: 900, cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
            {library.filter(m => m.status === 'watched').length === 0
              ? 'No watched films yet. Mark films as watched to add them here.'
              : '✅ All watched films have been ranked!'}
          </div>
        )}
      </div>
      
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        isDanger={confirmConfig.isDanger}
      />
    </div>
  );
}

