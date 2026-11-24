import {tmdbRequest,asCatalogueMovie} from '../utils/tmdbSearch';
import {mergeCatalogue} from '../utils/catalogue';
import {presentEditorialList} from '../utils/editorialLists';
import {removeOwnedRecord} from '../utils/removeOwnedRecord';
import { DEMO_USER_ID } from '../utils/following';
import { readHistoryDestination, listPath, franchisePath, canViewCachedList } from '../utils/navigation';
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, FolderHeart, Heart, Sparkles, Trash, X, Film, List, Tag, Check, Loader2, Trophy, MessageSquare, ArrowRight, BookOpen, Layers } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { FRANCHISE_COLLECTIONS, getSuggestedTags } from '../utils/collections';
import { INITIAL_COMMUNITY_LISTS } from '../mockListsData';
import ListDetailModal from './ListDetailModal';
import CreateListModal from './CreateListModal';
import CollectionDetailModal from './CollectionDetailModal';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

const COLLECTION_EMOJIS = ['📚','🎬','⭐','🔥','💎','🎭','🌟','🎪','🏆','🎯','🌙','❤️'];

export default function CollectionsTab({
  library = [],
  currentUser,
  onMovieClick,
  onOpenUserProfile,
  onSaveMovie,
  onBatchAdd
}) {
  // ── Letterboxd-Style Lists State ──────────────────────────────────────────
  const [lists, setLists] = useState(() => {
    try {
      const stored = localStorage.getItem('cinelog_community_lists_v2');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_COMMUNITY_LISTS;
  });

  const [cloudError,setCloudError]=useState(''),[cloudRetry,setCloudRetry]=useState(0);
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

  // Sync lists to localStorage and Supabase custom_lists table
  const handleUpdateList = async (updatedList,{skipCloud=false}={}) => {
    setLists(prev => {
      const next = prev.map(l => l.id === updatedList.id ? updatedList : l);
      try { localStorage.setItem('cinelog_community_lists_v2', JSON.stringify(next)); } catch {}
      return next;
    });
    if (selectedListModal && selectedListModal.id === updatedList.id) {
      setSelectedListModal(updatedList);
    }

    if (!skipCloud && currentUser?.id && currentUser.id!==DEMO_USER_ID && supabase && isSupabaseConfigured) {
      try {
        await supabase.from('custom_lists').update({
          title: updatedList.title,
          description: updatedList.description || '',
          cover_image: updatedList.coverImage || null,
          is_public: updatedList.isPublic !== false,
          is_ranked: !!updatedList.isRanked,
          entries: updatedList.entries || [],
          tags: updatedList.tags || [],
          likes_count: updatedList.likesCount || 0,
          updated_at: new Date().toISOString()
        }).eq('id', String(updatedList.id)).eq('user_id', currentUser.id);
      } catch (e) {
        console.warn('Could not update custom_list in Supabase:', e);
      }
    }
  };

  const handleEditList=async updated=>{
    if(currentUser?.id&&currentUser.id!==DEMO_USER_ID&&isSupabaseConfigured){const {data,error}=await supabase.from('custom_lists').update({title:updated.title,description:updated.description||'',is_public:updated.isPublic,is_ranked:updated.isRanked,entries:updated.entries||[],updated_at:new Date().toISOString()}).eq('id',String(updated.id)).eq('user_id',currentUser.id).select('id').maybeSingle();if(error||!data)throw new Error('Your list changes could not be saved. Please try again.');}
    await handleUpdateList(updated,{skipCloud:true});return true;
  };

  const handleSaveNewList = async (newList) => {

    if (currentUser?.id && currentUser.id!==DEMO_USER_ID && supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('custom_lists').upsert({
          id: String(newList.id),
          user_id: currentUser.id,
          title: newList.title,
          description: newList.description || '',
          cover_image: newList.coverImage || null,
          is_public: newList.isPublic !== false,
          is_ranked: !!newList.isRanked,
          entries: newList.entries || [],
          tags: newList.tags || [],
          likes_count: newList.likesCount || 0,
          author_info: newList.author || {
            id: currentUser.id,
            username: currentUser.username,
            displayName: currentUser.displayName,
            avatar: currentUser.avatar
          }
        });
        if (error) throw error;
      } catch (e) {
        throw new Error('Could not sync your list. Your draft is still here; please try again.', { cause: e });
      }
    }
    setLists(prev => {
      const next = [newList, ...prev];
      try { localStorage.setItem('cinelog_community_lists_v2', JSON.stringify(next)); } catch {}
      return next;
    });
    openListPage(newList);

    return true;
  };

  const handleDeleteList = async (listId) => {
    if(currentUser?.id && currentUser.id!==DEMO_USER_ID && isSupabaseConfigured)await removeOwnedRecord(supabase,'custom_lists',listId,currentUser.id);
    setLists(previous=>{const next=previous.filter(item=>item.id!==listId);try{localStorage.setItem('cinelog_community_lists_v2',JSON.stringify(next));}catch{}return next;});
    setSelectedListModal(null);window.history.replaceState({tab:'collections'},'','/collections');window.dispatchEvent(new Event('cinelog:route-change'));return true;
  };

  // Fetch community and user lists from Supabase custom_lists table on mount
  useEffect(() => {
    let isMounted = true;
    async function loadCloudLists() {
      setCloudError('');
      if (!supabase || !isSupabaseConfigured) return;
      try {
        const { data, error } = await supabase
          .from('custom_lists')
          .select('*')
          .order('created_at', { ascending: false });

        if(error)throw error;
        if (data && data.length > 0 && isMounted) {
          const mapped = data.map(row => ({
            id: row.id,user_id:row.user_id,
            title: row.title,
            description: row.description,
            coverImage: row.cover_image,
            isPublic: row.is_public,
            isRanked: row.is_ranked,
            entries: row.entries || [],
            tags: row.tags || [],
            likesCount: row.likes_count || 0,
            author: {...(row.author_info||{username:'cinephile'}),id:row.user_id},
            createdAt: row.created_at
          }));

          setLists(prev => {
            const merged = [...mapped];
            prev.forEach(p => {
              if (!merged.some(m => m.id === p.id)) merged.push(p);
            });
            try { localStorage.setItem('cinelog_community_lists_v2', JSON.stringify(merged)); } catch {}
            return merged;
          });
        }
      } catch (err) {
        console.warn('Error loading custom_lists from Supabase:', err);if(isMounted)setCloudError('Online lists could not be loaded. Your saved lists are still available.');
      }
    }
    loadCloudLists();
    return () => { isMounted = false; };
  }, [currentUser?.id,cloudRetry]);

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
      const movies = mergeCatalogue(f.catalogue || [],library);

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

  const [listSearch,setListSearch] = useState('');
  const [collectionTab, setCollectionTab] = useState('community');

  // Filtered Community / User Lists
  const displayedLists = useMemo(() => {
    let result = lists.filter(list=>canViewCachedList(list,currentUser?.id));
    if (listsTab === 'popular') {
      result.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else if (listsTab === 'recent') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (listsTab === 'my_lists') {
      result = result.filter(l =>
        currentUser?.id && (l.user_id??l.author?.id)===currentUser.id
      );
    }
    return result.filter(list => !listSearch || (list.title || '').toLowerCase().includes(listSearch.toLowerCase())).map(presentEditorialList);
  }, [lists, listsTab, currentUser,listSearch]);

  const myListsCount = useMemo(() => {
    return lists.filter(l =>
      currentUser?.id && (l.user_id??l.author?.id)===currentUser.id
    ).length;
  }, [lists, currentUser]);

  const [entityLocation,setEntityLocation]=useState(()=>window.location.href);
  const [entityError,setEntityError]=useState('');
  const [entityRevision,setEntityRevision]=useState(0);
  const entity=readHistoryDestination(entityLocation).entity;
  useEffect(()=>{const sync=()=>{setEntityLocation(window.location.href);setEntityRevision(value=>value+1);setEntityError('');};window.addEventListener('popstate',sync);window.addEventListener('cinelog:route-change',sync);return()=>{window.removeEventListener('popstate',sync);window.removeEventListener('cinelog:route-change',sync);};},[]);
  const openEntity=(kind,item)=>{window.history.pushState({tab:'collections',entity:true,collectionOwner:currentUser?.id||null,collection:kind==='franchise'?item:undefined},'',kind==='list'?listPath(item.id):franchisePath(item.id));setEntityLocation(window.location.href);setEntityError('');if(kind==='list'){setSelectedCollectionModal(null);setSelectedListModal(item);}else{setSelectedListModal(null);setSelectedCollectionModal(item);}window.scrollTo({top:0});};
  const openListPage=item=>openEntity('list',item);
  const openFranchisePage=item=>openEntity('franchise',{...item,id:item.id||'custom-'+String(item.title).toLowerCase().replace(/[^a-z0-9]+/g,'-')});
  const closeEntity=()=>{if(window.history.state?.entity&&!window.history.state?.root){window.history.back();return;}window.history.replaceState({tab:'collections'},'','/collections');setEntityLocation(window.location.href);setSelectedListModal(null);setSelectedCollectionModal(null);setEntityError('');};
  useEffect(()=>{let live=true;const route=readHistoryDestination(entityLocation).entity;if(!route)return;
   if(route.kind==='franchise'&&route.id.startsWith('tmdb-')){
    setSelectedListModal(null);setSelectedCollectionModal(null);
    tmdbRequest('collection/'+encodeURIComponent(route.id.slice(5))).then(data=>{if(live)setSelectedCollectionModal({id:route.id,title:data.name,desc:data.overview||'The complete TMDB collection, in release order.',movies:(data.parts||[]).map(m=>asCatalogueMovie({...m,media_type:'movie'})).sort((a,b)=>(a.release_date||'9999').localeCompare(b.release_date||'9999'))});}).catch(e=>{if(live)setEntityError(e.message);});return()=>{live=false;};
   }
   if(route.kind==='franchise'){const item=automaticCollections.find(item=>String(item.id)===route.id)||(window.history.state?.collectionOwner===(currentUser?.id||null)?window.history.state?.collection:null);if(item)setSelectedCollectionModal(item);else setEntityError('This franchise could not be found.');return;}
   const cached=lists.find(item=>String(item.id)===route.id);if(cached && canViewCachedList(cached,currentUser?.id)){setEntityError('');setSelectedListModal(cached);return;}
   setSelectedListModal(null);
   supabase.from('custom_lists').select('*').eq('id',route.id).maybeSingle().then(({data,error})=>{if(!live)return;if(error||!data){setEntityError('This list is private, unavailable, or has been removed.');return;}setSelectedListModal({...data,isRanked:data.is_ranked,isPublic:data.is_public,author:data.author_info,createdAt:data.created_at});}).catch(()=>{if(live)setEntityError('This list could not be loaded. Please try again.');});return()=>{live=false;};
  },[entityLocation,entityRevision,lists,automaticCollections,currentUser?.id]);
  return (
    <div data-detail-open={Boolean(entity)} data-collection-view={collectionTab} className="studio-collections" style={{ display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '40px' }}>
      <div className="studio-page-heading"><div><span className="studio-eyebrow">CURATED WITH A POINT OF VIEW</span><h1>Follow a thread.<br/>Find a whole world.</h1><p>Find a new obsession. Or put your own into a list.</p></div></div>

      <nav className="studio-collection-tabs" aria-label="Collections" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{[['community','Community Lists'],['franchises','Franchises'],['mine',`My Lists (${myListsCount})`]].map(([id,label]) => <button key={id} className={collectionTab === id ? 'btn btn-primary' : 'btn btn-secondary'} aria-pressed={collectionTab === id} onClick={() => { setCollectionTab(id); setListsTab(id === 'mine' ? 'my_lists' : 'popular'); }}>{label}</button>)}</nav>
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP SECTION: LETTERBOXD-STYLE COMMUNITY LISTS & RANKINGS                */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div hidden={collectionTab === 'franchises'}>
        {cloudError&&<div className="workspace-state" role="alert"><p>{cloudError}</p><button className="studio-secondary" onClick={()=>setCloudRetry(n=>n+1)}>Try again</button></div>}
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
                {collectionTab === 'mine' ? 'My Lists' : 'Community Lists'}
              </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', margin: 0 }}>
              Browse cinephile rankings, themed lists, or build your own custom list with personal film notes.
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

        <label className="studio-library-search v2-list-search"><BookOpen size={17}/><input value={listSearch} onChange={e=>setListSearch(e.target.value)} placeholder="Find a list by name…" aria-label="Search collections"/></label>
        {collectionTab==='community'&&displayedLists[0]&&<button className="v2-editorial-list" onClick={()=>openListPage(displayedLists[0])}><div><span className="studio-eyebrow">THE CURATOR'S SHELF</span><h2>{displayedLists[0].title}</h2><p>{displayedLists[0].description || 'One point of view. A collection of great stories.'}</p><strong>Open the collection ↗</strong></div><div className="v2-list-art">{(displayedLists[0].entries || []).slice(0,4).map((entry,i)=>entry.poster_path&&<img key={entry.tmdb_id || i} src={`https://image.tmdb.org/t/p/w342${entry.poster_path}`} alt=""/>)}</div></button>}
      {/* List Subtabs: Popular | Recent | My Lists */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {(collectionTab === 'mine' ? [] : [
            { id: 'popular', label: 'Popular lists' },
            { id: 'recent', label: 'Recently added' },

          ]).map(tab => (
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '20px' }}>
            {displayedLists.map(list => {
              const entries = list.entries || [];
              const previewPosters = entries.filter(e => e.poster_path).slice(0, 5);

              return (
                <div
                  key={list.id}
                  role="button" tabIndex={0} onKeyDown={e=>{if(e.target===e.currentTarget&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.currentTarget.click();}}} onClick={() => openListPage(list)}
                  role="button" tabIndex={0} onKeyDown={e => { if(e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openListPage(list); } }}
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
                        if (!list.isEditorial && onOpenUserProfile && list.author) {
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
                          RANKED
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
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.style.display = 'none';
                          }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {list.isRanked && (
                          <div style={{
                            position: 'absolute',
                            top: '3px',
                            left: '3px',
                            zIndex: 5,
                            background: idx < 3 ? 'rgba(245, 158, 11, 0.95)' : 'rgba(0,0,0,0.85)',
                            color: idx < 3 ? '#000' : '#fff',
                            borderRadius: '4px',
                            padding: '1px 5px',
                            fontSize: '9.5px',
                            fontWeight: 900,
                            pointerEvents: 'none',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
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
      {/* 3. CINELOG ORIGINALS & FRANCHISES (MOVED TO BOTTOM WITH DIRECT OPENING)    */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div hidden={collectionTab !== 'franchises'}>
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
                onClick={() => openFranchisePage(col)}
                role="button" tabIndex={0} onKeyDown={e => { if(e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openFranchisePage(col); } }}
                className="glass franchise-catalogue-card"
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
      {collectionTab === 'mine' && Object.keys(smartCollections).length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sparkles size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Smart Tag Collections</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)', marginLeft: '4px' }}>Auto-grouped from your unique custom tags</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
            {Object.entries(smartCollections).map(([tag, movies]) => (
              <div
                key={tag}
                onClick={() => openFranchisePage({
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
                  onClick={() => openFranchisePage({
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

      {entity&&!selectedListModal&&!selectedCollectionModal&&<section className="entity-page studio-empty-results"><h1>{entityError?'Page unavailable':'Loading collection…'}</h1>{entityError&&<><p role="alert">{entityError}</p><button className="studio-secondary" onClick={()=>{setEntityError('');setEntityRevision(n=>n+1);}}>Try again</button></>}<button className="studio-secondary" onClick={closeEntity}>Back to collections</button></section>}
      {/* ── MODALS ── */}
      {selectedListModal && (
        <ListDetailModal isPage
          list={selectedListModal}
          currentUser={currentUser}
          onClose={closeEntity}
          onMovieClick={onMovieClick}
          onOpenUserProfile={onOpenUserProfile}
          onUpdateList={handleUpdateList}
          onEditList={handleEditList} library={library}
          onDeleteList={handleDeleteList}
        />
      )}

      {showCreateListModal && (
        <CreateListModal
          currentUser={currentUser}
          library={library}
          franchiseCollections={automaticCollections}
          onClose={() => setShowCreateListModal(false)}
          onSaveList={handleSaveNewList}
        />
      )}

      {selectedCollectionModal && (
        <CollectionDetailModal isPage
          collection={selectedCollectionModal} library={library} onBatchAdd={onBatchAdd}
          onClose={closeEntity}
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
