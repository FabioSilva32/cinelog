import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw, GripVertical, Settings2, Trash2, Plus, ChevronUp, ChevronDown, Heart, Star, Check, X, Sparkles, Tag, Cloud, Smartphone, Copy, Download, Upload, ShieldCheck, MoveHorizontal, Grid3X3 } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { FRANCHISE_COLLECTIONS, GENRE_LIST, matchesCollection } from '../utils/collections';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

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

export default function TierListTab({ library = [], currentUser = null, onOpenAuth = null }) {
  // Flag to prevent overwriting cloud data on initial mount
  const isInitialSyncDone = useRef(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListNameInput, setNewListNameInput] = useState('');
  const [transferCodeInput, setTransferCodeInput] = useState('');
  const [transferMsg, setTransferMsg] = useState('');
  const [cloudManualSyncing, setCloudManualSyncing] = useState(false);
  const [rowLayoutMode, setRowLayoutMode] = useState(() => {
    try {
      return localStorage.getItem('cinelog_tier_layout_mode_v2') || 'wrap';
    } catch {
      return 'wrap';
    }
  });

  const toggleRowLayoutMode = () => {
    setRowLayoutMode(prev => {
      const next = prev === 'wrap' ? 'scroll' : 'wrap';
      try { localStorage.setItem('cinelog_tier_layout_mode_v2', next); } catch {}
      return next;
    });
  };


  const isSwitchingListRef = useRef(false);
  const [activeListId, setActiveListId] = useState(() => {
    return localStorage.getItem('cinelog_active_tier_list_id_v4') || 'default';
  });
  const activeListIdRef = useRef(activeListId);
  activeListIdRef.current = activeListId;

  // Preserve user's custom tier structure (e.g. S+, S, A, B, C, D) so format remains rock-solid across lists
  const [tiers, setTiers] = useState(() => {
    try {
      const storedMaster = localStorage.getItem('cinelog_master_tiers_v4');
      if (storedMaster) {
        const parsed = JSON.parse(storedMaster);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const storedLists = localStorage.getItem('cinelog_saved_tier_lists_v4');
      if (storedLists) {
        const parsed = JSON.parse(storedLists);
        const activeId = localStorage.getItem('cinelog_active_tier_list_id_v4') || 'default';
        if (parsed[activeId]?.tiers && parsed[activeId].tiers.length > 0) return parsed[activeId].tiers;
        for (const l of Object.values(parsed)) {
          if (l.tiers && l.tiers.length > 0) return l.tiers;
        }
      }
      const storedTiers = localStorage.getItem('cinelog_tiers_list_setup_v3');
      return storedTiers ? JSON.parse(storedTiers) : DEFAULT_TIERS;
    } catch {
      return DEFAULT_TIERS;
    }
  });

  const [lists, setLists] = useState(() => {
    try {
      const stored = localStorage.getItem('cinelog_saved_tier_lists_v4');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
      
      const storedData = localStorage.getItem('cinelog_tier_list_data_v3');
      const d = storedData ? JSON.parse(storedData) : {};
      
      return {
        default: { id: 'default', name: 'Global Master List', tiers, tierData: d }
      };
    } catch {
      return {
        default: { id: 'default', name: 'Global Master List', tiers: DEFAULT_TIERS, tierData: {} }
      };
    }
  });

  const [tierData, setTierData] = useState(() => {
    try {
      const storedLists = localStorage.getItem('cinelog_saved_tier_lists_v4');
      const activeId = localStorage.getItem('cinelog_active_tier_list_id_v4') || 'default';
      if (storedLists) {
        const parsed = JSON.parse(storedLists);
        if (parsed[activeId]?.tierData) return parsed[activeId].tierData;
      }
      const storedData = localStorage.getItem('cinelog_tier_list_data_v3');
      return storedData ? JSON.parse(storedData) : {};
    } catch {
      const defaultData = {};
      DEFAULT_TIERS.forEach(t => { defaultData[t.id] = []; });
      return defaultData;
    }
  });

  const [poolFilter, setPoolFilter] = useState(() => lists[activeListId]?.poolFilter || 'all');
  const [poolSearch, setPoolSearch] = useState('');
  const [cloudSyncStatus, setCloudSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'

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
  const [quickAssignTarget, setQuickAssignTarget] = useState(null); // { id, rect, currentTierId }
  
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

  // Get full lists dictionary snapshot with latest active list data
  const getFullListsSnapshot = (targetLists = lists, targetActiveId = activeListIdRef.current) => {
    return {
      ...targetLists,
      [targetActiveId]: {
        ...(targetLists[targetActiveId] || { id: targetActiveId, name: 'List' }),
        id: targetActiveId,
        tiers: tiers && tiers.length > 0 ? tiers : DEFAULT_TIERS,
        tierData: tierData || {},
        poolFilter: poolFilter || 'all'
      }
    };
  };

  // Listen for background tier list updates from other tabs or session load
  useEffect(() => {
    const handleTierSync = (e) => {
      if (e.detail && typeof e.detail === 'object') {
        const cloudLists = e.detail;
        setLists(cloudLists);
        const active = localStorage.getItem('cinelog_active_tier_list_id_v4') || Object.keys(cloudLists)[0] || 'default';
        if (cloudLists[active]) {
          isSwitchingListRef.current = true;
          setActiveListId(active);
          activeListIdRef.current = active;
          const targetTiers = cloudLists[active].tiers && cloudLists[active].tiers.length > 0 ? cloudLists[active].tiers : tiers;
          setTiers(targetTiers);
          setTierData(cloudLists[active].tierData || {});
          if (cloudLists[active].poolFilter) setPoolFilter(cloudLists[active].poolFilter);
          setTimeout(() => { isSwitchingListRef.current = false; }, 50);
        }
        setCloudSyncStatus('synced');
      }
    };
    window.addEventListener('cinelog_tier_lists_updated', handleTierSync);
    return () => window.removeEventListener('cinelog_tier_lists_updated', handleTierSync);
  }, [tiers]);

  // Debounced cloud save
  const saveToCloud = useMemo(() => {
    let timer = null;
    return (dataToSave, activeId) => {
      if (!currentUser?.id || !supabase || !isSupabaseConfigured) return;
      if (timer) clearTimeout(timer);
      setCloudSyncStatus('syncing');
      timer = setTimeout(async () => {
        try {
          await supabase.auth.updateUser({
            data: {
              cinelog_tier_lists: dataToSave,
              cinelog_active_tier_list_id: activeId
            }
          });
          setCloudSyncStatus('synced');
        } catch (e) {
          console.warn('Tier list cloud sync failed:', e);
          setCloudSyncStatus('error');
        }
      }, 700);
    };
  }, [currentUser?.id]);

  // Two-way initial sync on mount with Supabase user_metadata
  useEffect(() => {
    if (!currentUser?.id || !supabase || !isSupabaseConfigured) {
      isInitialSyncDone.current = true;
      return;
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.cinelog_tier_lists) {
        const cloudLists = user.user_metadata.cinelog_tier_lists;
        const cloudActiveId = user.user_metadata.cinelog_active_tier_list_id || 'default';
        if (cloudLists && Object.keys(cloudLists).length > 0) {
          isSwitchingListRef.current = true;
          setLists(cloudLists);
          localStorage.setItem('cinelog_saved_tier_lists_v4', JSON.stringify(cloudLists));
          const targetId = cloudLists[cloudActiveId] ? cloudActiveId : Object.keys(cloudLists)[0];
          setActiveListId(targetId);
          activeListIdRef.current = targetId;
          localStorage.setItem('cinelog_active_tier_list_id_v4', targetId);
          const targetTiers = cloudLists[targetId].tiers && cloudLists[targetId].tiers.length > 0 ? cloudLists[targetId].tiers : tiers;
          setTiers(targetTiers);
          setTierData(cloudLists[targetId].tierData || {});
          if (cloudLists[targetId].poolFilter) setPoolFilter(cloudLists[targetId].poolFilter);
          setCloudSyncStatus('synced');
          isInitialSyncDone.current = true;
          setTimeout(() => { isSwitchingListRef.current = false; }, 50);
          return;
        }
      }
      
      // If cloud has no tier lists yet, but local storage does (e.g. created on website):
      try {
        const local = JSON.parse(localStorage.getItem('cinelog_saved_tier_lists_v4') || '{}');
        if (local && Object.keys(local).length > 0) {
          saveToCloud(local, activeListIdRef.current);
        }
      } catch {}
      isInitialSyncDone.current = true;
    }).catch(e => {
      console.warn('Failed to load cloud tier lists:', e);
      isInitialSyncDone.current = true;
    });
  }, [currentUser?.id]);

  // Copy transfer code to clipboard (always uses freshest snapshot)
  const copyTransferCode = () => {
    try {
      const fullSnapshot = getFullListsSnapshot();
      const code = btoa(unescape(encodeURIComponent(JSON.stringify(fullSnapshot))));
      navigator.clipboard.writeText(code);
      setTransferMsg('✅ Transfer code copied to clipboard! Paste it on your phone/other device.');
      setTimeout(() => setTransferMsg(''), 6000);
    } catch (err) {
      setTransferMsg('Failed to copy: ' + err.message);
    }
  };

  // Import transfer code
  const importTransferCode = () => {
    if (!transferCodeInput.trim()) return;
    try {
      const jsonStr = decodeURIComponent(escape(atob(transferCodeInput.trim())));
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === 'object') {
        isSwitchingListRef.current = true;
        setLists(parsed);
        localStorage.setItem('cinelog_saved_tier_lists_v4', JSON.stringify(parsed));
        const firstId = Object.keys(parsed)[0] || 'default';
        setActiveListId(firstId);
        activeListIdRef.current = firstId;
        localStorage.setItem('cinelog_active_tier_list_id_v4', firstId);
        if (parsed[firstId]) {
          const targetTiers = parsed[firstId].tiers && parsed[firstId].tiers.length > 0 ? parsed[firstId].tiers : tiers;
          setTiers(targetTiers);
          try { localStorage.setItem('cinelog_master_tiers_v4', JSON.stringify(targetTiers)); } catch {}
          setTierData(parsed[firstId].tierData || {});
          if (parsed[firstId].poolFilter) setPoolFilter(parsed[firstId].poolFilter);
        }
        saveToCloud(parsed, firstId);
        setTransferMsg('🎉 Successfully imported and synced your tier lists!');
        setTransferCodeInput('');
        setTimeout(() => {
          setTransferMsg('');
          isSwitchingListRef.current = false;
        }, 5000);
      } else {
        setTransferMsg('❌ Invalid tier list code.');
      }
    } catch (e) {
      setTransferMsg('❌ Invalid or corrupted transfer code.');
    }
  };

  // Force Push to Supabase Cloud
  const handleForcePushCloud = async () => {
    if (!currentUser?.id || !supabase) return;
    setCloudManualSyncing(true);
    try {
      const currentSaved = getFullListsSnapshot();
      await supabase.auth.updateUser({
        data: {
          cinelog_tier_lists: currentSaved,
          cinelog_active_tier_list_id: activeListIdRef.current
        }
      });
      setLists(currentSaved);
      setCloudSyncStatus('synced');
      setTransferMsg('☁️ Successfully uploaded all tier lists to your cloud account!');
    } catch (err) {
      setCloudSyncStatus('error');
      setTransferMsg('Cloud upload error: ' + err.message);
    } finally {
      setCloudManualSyncing(false);
      setTimeout(() => setTransferMsg(''), 5000);
    }
  };

  // Force Pull from Supabase Cloud
  const handleForcePullCloud = async () => {
    if (!currentUser?.id || !supabase) return;
    setCloudManualSyncing(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      const cloudLists = user?.user_metadata?.cinelog_tier_lists;
      const cloudActiveId = user?.user_metadata?.cinelog_active_tier_list_id || 'default';
      if (cloudLists && Object.keys(cloudLists).length > 0) {
        isSwitchingListRef.current = true;
        setLists(cloudLists);
        localStorage.setItem('cinelog_saved_tier_lists_v4', JSON.stringify(cloudLists));
        const targetId = cloudLists[cloudActiveId] ? cloudActiveId : Object.keys(cloudLists)[0];
        setActiveListId(targetId);
        activeListIdRef.current = targetId;
        localStorage.setItem('cinelog_active_tier_list_id_v4', targetId);
        const targetTiers = cloudLists[targetId].tiers && cloudLists[targetId].tiers.length > 0 ? cloudLists[targetId].tiers : tiers;
        setTiers(targetTiers);
        try { localStorage.setItem('cinelog_master_tiers_v4', JSON.stringify(targetTiers)); } catch {}
        setTierData(cloudLists[targetId].tierData || {});
        if (cloudLists[targetId].poolFilter) setPoolFilter(cloudLists[targetId].poolFilter);
        setCloudSyncStatus('synced');
        setTransferMsg('⬇️ Loaded all tier lists from cloud!');
        setTimeout(() => { isSwitchingListRef.current = false; }, 50);
      } else {
        setTransferMsg('ℹ️ No saved tier lists found in your cloud account.');
      }
    } catch (err) {
      setTransferMsg('Cloud download error: ' + err.message);
    } finally {
      setCloudManualSyncing(false);
      setTimeout(() => setTransferMsg(''), 5000);
    }
  };

  // Helper to switch list safely without resetting format or corrupting data
  const selectList = (nextListId) => {
    if (!nextListId || nextListId === activeListIdRef.current) return;

    // 1. Snapshot current active list with latest tier rankings
    const currentLists = getFullListsSnapshot();

    // 2. Prepare next list data
    const nextList = currentLists[nextListId] || {
      id: nextListId,
      name: 'List',
      tiers: tiers,
      tierData: {},
      poolFilter: 'all'
    };

    // Ensure the user's tier layout/format (S+, S, A, B, C, D) is preserved across lists!
    const activeTiers = (tiers && tiers.length > 0) ? tiers : DEFAULT_TIERS;
    const nextTierData = nextList.tierData || {};
    const nextPoolFilter = nextList.poolFilter !== undefined ? nextList.poolFilter : 'all';

    currentLists[nextListId] = {
      ...nextList,
      tiers: activeTiers,
      tierData: nextTierData,
      poolFilter: nextPoolFilter
    };

    // 3. Update storage and cloud
    try {
      localStorage.setItem('cinelog_saved_tier_lists_v4', JSON.stringify(currentLists));
      localStorage.setItem('cinelog_active_tier_list_id_v4', nextListId);
    } catch {}
    saveToCloud(currentLists, nextListId);

    // 4. Update component state cleanly
    isSwitchingListRef.current = true;
    setLists(currentLists);
    setActiveListId(nextListId);
    activeListIdRef.current = nextListId;
    setTiers(activeTiers);
    setTierData(nextTierData);
    setPoolFilter(nextPoolFilter);

    setTimeout(() => {
      isSwitchingListRef.current = false;
    }, 50);
  };

  // Auto-sync active list modifications (drag/drop placements, filter change, tier label/color edits)
  useEffect(() => {
    if (!isInitialSyncDone.current || isSwitchingListRef.current) return;

    const currentId = activeListIdRef.current;
    setLists(prevLists => {
      const updated = {
        ...prevLists,
        [currentId]: {
          ...(prevLists[currentId] || { id: currentId, name: 'List' }),
          id: currentId,
          tiers,
          tierData,
          poolFilter
        }
      };

      try {
        localStorage.setItem('cinelog_saved_tier_lists_v4', JSON.stringify(updated));
        localStorage.setItem('cinelog_master_tiers_v4', JSON.stringify(tiers));
      } catch {}

      saveToCloud(updated, currentId);
      return updated;
    });
  }, [tiers, tierData, poolFilter, saveToCloud]);


  // ── HELPERS & SEEDS ────────────────────────────────────────────────
  const assignedIds = useMemo(() => {
    return new Set(Object.values(tierData).flat());
  }, [tierData]);

  const watchedMovies = useMemo(() => {
    let pool = library.filter(m => {
      if (assignedIds.has(String(m.id || m.tmdb_id))) return false;
      // Only films marked as watched can be ranked
      if (m.status !== 'watched') return false;
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
  }, [library, assignedIds, poolFilter, poolSearch, customCollections]);

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

  // O(1) high-speed movie lookup map (prevents thousands of O(N) array finds during render)
  const movieMap = useMemo(() => {
    const map = new Map();
    library.forEach(m => {
      if (m.id) map.set(String(m.id), m);
      if (m.tmdb_id) map.set(String(m.tmdb_id), m);
    });
    return map;
  }, [library]);

  const getMovie = (id) => movieMap.get(String(id));

  const createNewList = (name) => {
    if (!name || !name.trim()) return;
    const newId = `list-${Date.now()}`;
    const lower = name.toLowerCase();
    let detectedFilter = 'all';
    if (lower.includes('marvel')) detectedFilter = 'marvel';
    else if (lower.includes('mcu') || lower.includes('avengers')) detectedFilter = 'mcu';
    else if (lower.includes('star wars') || lower.includes('star-wars')) detectedFilter = 'star-wars';
    else if (lower.includes('batman')) detectedFilter = 'batman';
    else if (lower.includes('dc')) detectedFilter = 'dc';
    else if (lower.includes('harry potter') || lower.includes('wizarding')) detectedFilter = 'harry-potter';
    else if (lower.includes('lotr') || lower.includes('rings') || lower.includes('middle earth')) detectedFilter = 'lotr';
    else if (lower.includes('pixar')) detectedFilter = 'pixar';
    else if (lower.includes('ghibli')) detectedFilter = 'ghibli';
    else if (lower.includes('spider')) detectedFilter = 'spider-man';

    // 1. Commit current list first
    const currentLists = getFullListsSnapshot();

    // 2. Preserve user's active tier format (S+, S, A...) for the new list so format never changes!
    const activeTiers = JSON.parse(JSON.stringify(tiers && tiers.length > 0 ? tiers : DEFAULT_TIERS));

    const updated = {
      ...currentLists,
      [newId]: {
        id: newId,
        name: name.trim(),
        tiers: activeTiers,
        tierData: {},
        poolFilter: detectedFilter
      }
    };

    isSwitchingListRef.current = true;
    setLists(updated);
    setActiveListId(newId);
    activeListIdRef.current = newId;
    setTiers(activeTiers);
    setTierData({});
    setPoolFilter(detectedFilter);

    try {
      localStorage.setItem('cinelog_saved_tier_lists_v4', JSON.stringify(updated));
      localStorage.setItem('cinelog_active_tier_list_id_v4', newId);
    } catch {}
    saveToCloud(updated, newId);

    setTimeout(() => {
      isSwitchingListRef.current = false;
    }, 100);
  };

  const deleteList = (listId) => {
    if (listId === 'default') return; // Cannot delete Global Master List
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Tier List?',
      message: `Are you sure you want to delete "${lists[listId]?.name || 'this list'}"? This action cannot be undone.`,
      isDanger: true,
      onConfirm: () => {
        const copy = { ...lists };
        delete copy[listId];

        const nextId = 'default';
        const targetList = copy.default || { id: 'default', name: 'Global Master List', tiers: tiers, tierData: {} };
        const activeTiers = tiers && tiers.length > 0 ? tiers : DEFAULT_TIERS;
        const nextData = targetList.tierData || {};
        const nextFilter = targetList.poolFilter || 'all';

        copy.default = {
          ...targetList,
          tiers: activeTiers,
          tierData: nextData,
          poolFilter: nextFilter
        };

        isSwitchingListRef.current = true;
        setLists(copy);
        setActiveListId(nextId);
        activeListIdRef.current = nextId;
        setTiers(activeTiers);
        setTierData(nextData);
        setPoolFilter(nextFilter);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));

        try {
          localStorage.setItem('cinelog_saved_tier_lists_v4', JSON.stringify(copy));
          localStorage.setItem('cinelog_active_tier_list_id_v4', nextId);
        } catch {}
        saveToCloud(copy, nextId);

        setTimeout(() => {
          isSwitchingListRef.current = false;
        }, 100);
      }
    });
  };

  const handleReset = () => {
    const listName = lists[activeListId]?.name || 'this list';
    setConfirmConfig({
      isOpen: true,
      title: `Clear Placements for "${listName}"?`,
      message: `Are you sure you want to clear all movie rankings in "${listName}"? All movies will return to the unranked pool. Your custom tier rows (like S+, colors, etc.) will be preserved.`,
      isDanger: true,
      onConfirm: () => {
        const clearedData = {};
        tiers.forEach(t => { clearedData[t.id] = []; });
        setTierData(clearedData);
        setEditingTierId(null);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));

        setLists(prev => {
          const updated = {
            ...prev,
            [activeListId]: {
              ...(prev[activeListId] || {}),
              id: activeListId,
              tiers,
              tierData: clearedData,
              poolFilter
            }
          };
          try {
            localStorage.setItem('cinelog_saved_tier_lists_v4', JSON.stringify(updated));
          } catch {}
          saveToCloud(updated, activeListId);
          return updated;
        });
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
    setQuickAssignTarget(null);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header */}
      <div
        className="tier-header-bar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ flexShrink: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '24px', margin: 0, letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>Custom Tier Maker</h2>
            {currentUser?.id && isSupabaseConfigured && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '12px',
                background: cloudSyncStatus === 'syncing' ? 'rgba(245,158,11,0.12)' : cloudSyncStatus === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
                color: cloudSyncStatus === 'syncing' ? '#f59e0b' : cloudSyncStatus === 'error' ? '#ef4444' : '#10b981',
                border: `1px solid ${cloudSyncStatus === 'syncing' ? 'rgba(245,158,11,0.3)' : cloudSyncStatus === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`
              }}>
                <Cloud size={12} />
                <span>{cloudSyncStatus === 'syncing' ? 'Syncing...' : cloudSyncStatus === 'error' ? 'Sync Issue' : 'Cloud Synced'}</span>
              </div>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Rank watched titles into customizable rows. Drag posters to reorder, or edit tiers.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
          {/* List Selector Dropdown + Optional Trash Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>Rank List:</span>
            <select
              value={activeListId}
              onChange={e => selectList(e.target.value)}
              className="form-input"
              style={{ fontSize: '12px', background: '#141414', border: '1px solid var(--border)', color: '#fff', padding: '5px 10px', borderRadius: '6px', width: '150px' }}
            >
              {Object.values(lists).map(l => (
                <option key={l.id} value={l.id} style={{ background: '#141414', color: '#fff' }}>
                  {l.name}
                </option>
              ))}
            </select>

            {/* Compact Delete Trash Button for Non-Default Lists */}
            {activeListId !== 'default' && (
              <button
                className="btn btn-ghost"
                onClick={() => deleteList(activeListId)}
                title={`Delete list "${lists[activeListId]?.name || 'this list'}"`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '32px', height: '32px', padding: 0,
                  color: 'var(--red)', border: '1px solid rgba(239,68,68,0.3)',
                  background: 'rgba(239,68,68,0.08)', borderRadius: '6px',
                  flexShrink: 0
                }}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          {/* New List Button */}
          <button
            className="btn btn-ghost"
            onClick={() => {
              setNewListNameInput('');
              setShowNewListModal(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', height: '32px', padding: '0 10px', border: '1px solid var(--border)', background: '#141414', borderRadius: '6px' }}
          >
            <Plus size={13} /> New List
          </button>

          <button
            className="btn btn-ghost"
            onClick={toggleRowLayoutMode}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', height: '32px', padding: '0 10px',
              border: '1px solid var(--border)', background: '#141414', color: '#fff', borderRadius: '6px'
            }}
            title="Toggle between wrapping grid and horizontal swiping rows"
          >
            {rowLayoutMode === 'wrap' ? <Grid3X3 size={13} color="var(--accent)" /> : <MoveHorizontal size={13} color="var(--accent)" />}
            <span>{rowLayoutMode === 'wrap' ? 'Grid View' : 'Row View'}</span>
          </button>

          <button
            className="btn btn-ghost"
            onClick={() => setShowSyncModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', height: '32px', padding: '0 10px',
              border: '1px solid rgba(229,9,20,0.35)', background: 'rgba(229,9,20,0.08)', color: '#fff', borderRadius: '6px'
            }}
            title="Transfer or sync tier lists between PC and Phone"
          >
            <Cloud size={13} color="var(--accent)" />
            <span>Sync / Transfer</span>
          </button>

          <button
            className="btn btn-ghost"
            onClick={handleReset}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', height: '32px', padding: '0 10px', border: '1px solid var(--border)', background: '#141414', borderRadius: '6px' }}
            title="Clear movie rankings in this list back to the unranked pool"
          >
            <RefreshCw size={12} />
            <span>Reset Placements</span>
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div style={{ background: '#141414', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 6px', background: 'var(--accent)', color: '#fff', borderRadius: '4px' }}>TIP</span>
        <span>Drag posters to rank, or <strong style={{ color: 'var(--accent)' }}>tap to assign</strong> on mobile. Only titles marked as <strong>Watched</strong> appear in the ranking pool.</span>
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
                className="tier-row"
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
                  className="tier-label-box tier-label-hover-group"
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
                <div
                  className="tier-posters-scroll"
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    display: 'flex',
                    gap: '10px',
                    flexWrap: rowLayoutMode === 'scroll' ? 'nowrap' : 'wrap',
                    overflowX: rowLayoutMode === 'scroll' ? 'auto' : 'visible',
                    WebkitOverflowScrolling: 'touch',
                    alignItems: 'center',
                    minHeight: '96px',
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
                        className="tier-poster-item glass-card"
                        style={{
                          position: 'relative',
                          cursor: 'grab',
                          opacity: isDragging ? 0.4 : 1,
                          transform: isDragging ? 'scale(0.95)' : 'scale(1)',
                          transition: 'all 0.15s ease',
                          borderRadius: '6px',
                          border: quickAssignTarget?.id === id ? '2px solid var(--accent)' : `2px solid ${isDragging ? 'var(--accent)' : 'transparent'}`,
                          borderLeft: hoveredCardId === id ? '4px solid var(--accent)' : (quickAssignTarget?.id === id ? '2px solid var(--accent)' : (isDragging ? '2px solid var(--accent)' : '2px solid transparent')),
                          width: '74px',
                          height: '110px',
                          flexShrink: 0,
                          boxShadow: quickAssignTarget?.id === id ? '0 0 15px var(--accent-glow)' : '0 6px 14px rgba(0,0,0,0.4)',
                          overflow: 'hidden'
                        }}
                        title={`Tap to move or drag • ${movie.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (quickAssignTarget?.id === id) {
                            setQuickAssignTarget(null);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setQuickAssignTarget({ id, rect, currentTierId: tier.id });
                          }
                        }}
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                          alt={movie.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            userSelect: 'none',
                            pointerEvents: 'none',
                            borderRadius: '4px'
                          }}
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                        />

                        {/* Top-Left Favorite Badge (Red Heart) */}
                        {movie.favorite && (
                          <div style={{
                            position: 'absolute', top: '3px', left: '3px',
                            background: 'rgba(0,0,0,0.85)',
                            borderRadius: '50%', width: '16px', height: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                          }}>
                            <Heart size={9} fill="var(--red)" color="var(--red)" />
                          </div>
                        )}

                        {/* Bottom-Right Rating Badge */}
                        {movie.rating != null && (
                          <div style={{
                            position: 'absolute', bottom: '3px', right: '3px',
                            background: 'rgba(10,8,19,0.95)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '3px', padding: '1px 3px',
                            fontSize: '8px', fontWeight: 800, color: 'var(--gold)',
                            display: 'flex', alignItems: 'center', gap: '1px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.6)'
                          }}>
                            <Star size={7} fill="var(--gold)" color="var(--gold)" />
                            {Number(movie.rating).toFixed(1)}
                          </div>
                        )}
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
            <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Unranked Watched Pool</h3>
            <span style={{ background: '#1c1c1c', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5px 8px', fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>{watchedMovies.length}</span>
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
                    border: quickAssignTarget?.id === id ? '2px solid var(--accent)' : 'none',
                    boxShadow: quickAssignTarget?.id === id ? '0 0 15px var(--accent-glow)' : '0 6px 12px rgba(0,0,0,0.3)',
                    margin: '0 auto'
                  }}
                  title={movie.title}
                  onClick={(e) => {
                    if (!dragInfo) {
                      e.stopPropagation();
                      if (quickAssignTarget?.id === id) {
                        setQuickAssignTarget(null);
                      } else {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setQuickAssignTarget({ id, rect, currentTierId: 'pool' });
                      }
                    }
                  }}
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
      
      {/* ── SYNC & DEVICE TRANSFER MODAL (Centered via Portal directly in document.body) ── */}
      {showSyncModal && typeof document !== 'undefined' && createPortal(
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
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overscrollBehavior: 'contain'
          }}
          onClick={e => e.target === e.currentTarget && setShowSyncModal(false)}
        >
          <div
            className="glass animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '520px',
              borderRadius: '16px',
              border: '1px solid #2a2a2e',
              background: '#111015',
              padding: '26px',
              position: 'relative',
              boxShadow: '0 20px 48px rgba(0,0,0,0.9)',
              margin: 'auto',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <button
              onClick={() => setShowSyncModal(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(229,9,20,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(229,9,20,0.3)'
              }}>
                <Smartphone size={18} color="var(--accent)" />
              </div>
              <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 900, color: '#fff' }}>Sync & Transfer Tier Lists</h3>
            </div>
            <p style={{ fontSize: '12.5px', color: '#9E9E9E', margin: '0 0 18px 0', lineHeight: 1.45 }}>
              Effortlessly move your tier lists between your PC browser and mobile phone app.
            </p>

            {transferMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                marginBottom: '16px', background: transferMsg.startsWith('❌') ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
                color: transferMsg.startsWith('❌') ? '#ef4444' : '#10b981',
                border: `1px solid ${transferMsg.startsWith('❌') ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`
              }}>
                {transferMsg}
              </div>
            )}

            {/* METHOD 1: 1-TAP TRANSFER CODE */}
            <div style={{ background: '#16151c', border: '1px solid #26252e', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ⚡ Method 1: Instant Transfer Code
                </div>
                <span style={{ fontSize: '10px', color: '#888', fontWeight: 600 }}>No login required</span>
              </div>
              <p style={{ fontSize: '12px', color: '#A1A1AA', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                1-tap export from PC, then paste on your phone to instantly load your lists:
              </p>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <button
                  className="btn btn-primary"
                  onClick={copyTransferCode}
                  style={{ flex: 1, height: '36px', fontSize: '12.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Copy size={14} /> Copy Transfer Code
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Paste transfer code here..."
                  value={transferCodeInput}
                  onChange={e => setTransferCodeInput(e.target.value)}
                  className="form-input"
                  style={{ flex: 1, height: '36px', fontSize: '12px', background: '#0e0d12', border: '1px solid #282732', borderRadius: '6px' }}
                />
                <button
                  className="btn btn-secondary"
                  onClick={importTransferCode}
                  disabled={!transferCodeInput.trim()}
                  style={{ height: '36px', fontSize: '12px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Download size={13} /> Import
                </button>
              </div>
            </div>

            {/* METHOD 2: SUPABASE CLOUD ACCOUNT SYNC */}
            <div style={{ background: '#16151c', border: '1px solid #26252e', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ☁️ Method 2: Cloud Account Auto-Sync
                </div>
                {currentUser?.id ? (
                  <span style={{ fontSize: '10.5px', color: '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={13} /> Signed In
                  </span>
                ) : (
                  <span style={{ fontSize: '10.5px', color: '#f59e0b', fontWeight: 800 }}>Guest Mode</span>
                )}
              </div>

              {currentUser?.id ? (
                <>
                  <p style={{ fontSize: '12px', color: '#A1A1AA', margin: '0 0 12px 0' }}>
                    Logged in as <strong style={{ color: '#fff' }}>{currentUser.displayName || currentUser.username}</strong>. Your tier lists automatically sync across devices when signed into the same account.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={handleForcePushCloud}
                      disabled={cloudManualSyncing}
                      style={{ flex: 1, height: '36px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Upload size={13} /> {cloudManualSyncing ? 'Syncing...' : 'Force Push to Cloud'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleForcePullCloud}
                      disabled={cloudManualSyncing}
                      style={{ flex: 1, height: '36px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Download size={13} /> Force Pull from Cloud
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '12px', color: '#A1A1AA', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                    You are currently using CineLog in <strong>Guest Mode</strong>. Sign in on both your PC and phone app to automatically sync all your tier lists and library continuously.
                  </p>
                  {onOpenAuth && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => { setShowSyncModal(false); onOpenAuth(); }}
                      style={{ width: '100%', height: '36px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--accent)', border: '1px solid rgba(229,9,20,0.3)' }}
                    >
                      👤 Sign In / Create Account
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── CREATE NEW LIST MODAL (Centered via Portal) ── */}
      {showNewListModal && typeof document !== 'undefined' && createPortal(
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
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overscrollBehavior: 'contain'
          }}
          onClick={e => e.target === e.currentTarget && setShowNewListModal(false)}
        >
          <div
            className="glass animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '420px',
              borderRadius: '16px',
              border: '1px solid #2a2a2e',
              background: '#111015',
              padding: '24px',
              position: 'relative',
              boxShadow: '0 20px 48px rgba(0,0,0,0.9)',
              margin: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(229,9,20,0.12)', border: '1px solid rgba(229,9,20,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={16} color="var(--accent)" />
                </div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>Create New Tier List</h3>
              </div>
              <button
                onClick={() => setShowNewListModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#A1A1AA', margin: '0 0 16px', lineHeight: 1.45 }}>
              Give your new tier list a title (e.g. <em>Marvel</em>, <em>DC</em>, <em>Star Wars</em>, <em>Pixar</em>, or <em>Favorites</em>). It starts with a clean, unranked pool while keeping your tier format!
            </p>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (newListNameInput.trim()) {
                  createNewList(newListNameInput);
                  setShowNewListModal(false);
                  setNewListNameInput('');
                }
              }}
            >
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fff', marginBottom: '6px' }}>
                  List Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Marvel MCU, Star Wars, Pixar..."
                  value={newListNameInput}
                  onChange={e => setNewListNameInput(e.target.value)}
                  autoFocus
                  className="form-input"
                  style={{
                    width: '100%',
                    background: '#181622',
                    border: '1px solid var(--border)',
                    color: '#fff',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowNewListModal(false)}
                  style={{ fontSize: '13px', height: '36px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newListNameInput.trim()}
                  style={{ fontSize: '13px', height: '36px', padding: '0 18px', fontWeight: 700 }}
                >
                  Create List
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── GLOBAL QUICK ASSIGN POPOVER (100% Guaranteed on top of everything via Portal) ── */}
      {quickAssignTarget && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'transparent'
          }}
          onClick={(e) => {
            e.stopPropagation();
            setQuickAssignTarget(null);
          }}
        >
          <div
            style={{
              position: 'fixed',
              top: (() => {
                const popoverHeight = 185;
                const rect = quickAssignTarget.rect;
                if (rect.bottom + popoverHeight > window.innerHeight - 10) {
                  return Math.max(10, rect.top - popoverHeight - 6);
                }
                return rect.bottom + 6;
              })(),
              left: (() => {
                const popoverWidth = 145;
                const rect = quickAssignTarget.rect;
                const idealLeft = rect.left + (rect.width / 2) - (popoverWidth / 2);
                return Math.max(10, Math.min(window.innerWidth - popoverWidth - 10, idealLeft));
              })(),
              background: '#151222',
              border: '1.5px solid var(--accent)',
              borderRadius: '10px',
              padding: '8px',
              boxShadow: '0 14px 40px rgba(0,0,0,0.92), 0 0 20px rgba(229,9,20,0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              width: '145px',
              boxSizing: 'border-box',
              animation: 'fadeInScale 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              fontWeight: 800,
              textAlign: 'center',
              paddingBottom: '4px',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
              Move to Tier:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' }}>
              {tiers.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleQuickAssign(quickAssignTarget.id, t.id)}
                  style={{
                    background: t.color,
                    color: '#000',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '5px 4px',
                    fontSize: '11px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'transform 0.1s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {quickAssignTarget.currentTierId !== 'pool' && (
              <button
                onClick={() => {
                  const id = quickAssignTarget.id;
                  setTierData(prev => {
                    const u = { ...prev };
                    tiers.forEach(t => { u[t.id] = (u[t.id] || []).filter(item => item !== id); });
                    return u;
                  });
                  setQuickAssignTarget(null);
                }}
                style={{
                  background: 'rgba(239,68,68,0.15)',
                  color: 'var(--red)',
                  border: '1px solid rgba(239,68,68,0.35)',
                  borderRadius: '5px',
                  padding: '4px 6px',
                  fontSize: '10px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textAlign: 'center',
                  marginTop: '2px',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
              >
                ✕ Remove
              </button>
            )}
          </div>
        </div>,
        document.body
      )}

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

