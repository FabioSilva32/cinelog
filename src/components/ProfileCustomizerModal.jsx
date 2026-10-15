import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, SlidersHorizontal, Image as ImageIcon, User, Award, Heart,
  Upload, Search, Check, CheckCircle2, Trash2, Sparkles, Plus
} from 'lucide-react';
import AvatarWithBorder, { DEFAULT_GREY_AVATAR } from './AvatarWithBorder';
import AnimatedBannerBackground, { ALL_ANIMATED_BANNERS } from './AnimatedBannerBackground';
import { BORDER_STYLES } from '../utils/achievements';

const TMDB_KEY = '6a2fd6b9b1bb3befbb9f14c203732225';

export const CURATED_MOVIE_AVATARS = [
  { id: 'spiderman', name: 'Spider-Man', movie: 'Spider-Verse', category: 'Action', url: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=260&fit=crop&q=80' },
  { id: 'batman', name: 'The Dark Knight', movie: 'Batman', category: 'Action', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=260&fit=crop&q=80' },
  { id: 'neo', name: 'Neo', movie: 'The Matrix', category: 'Sci-Fi', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=260&fit=crop&q=80' },
  { id: 'dune', name: 'Paul Atreides', movie: 'Dune: Part Two', category: 'Sci-Fi', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=260&fit=crop&q=80' },
  { id: 'oppenheimer', name: 'J. Robert Oppenheimer', movie: 'Oppenheimer', category: 'Drama', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=260&fit=crop&q=80' },
  { id: 'joker', name: 'Arthur Fleck', movie: 'Joker', category: 'Drama', url: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?w=260&fit=crop&q=80' },
  { id: 'officer_k', name: 'Officer K', movie: 'Blade Runner 2049', category: 'Sci-Fi', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=260&fit=crop&q=80' },
  { id: 'killbill', name: 'The Bride', movie: 'Kill Bill', category: 'Action', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=260&fit=crop&q=80' },
  { id: 'mia_wallace', name: 'Mia Wallace', movie: 'Pulp Fiction', category: 'Classics', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=260&fit=crop&q=80' },
  { id: 'tyler_durden', name: 'Tyler Durden', movie: 'Fight Club', category: 'Drama', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=260&fit=crop&q=80' },
  { id: 'mononoke', name: 'San', movie: 'Princess Mononoke', category: 'Anime', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=260&fit=crop&q=80' },
  { id: 'cooper', name: 'Cooper', movie: 'Interstellar', category: 'Sci-Fi', url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=260&fit=crop&q=80' },
  { id: 'alien', name: 'Ellen Ripley', movie: 'Alien', category: 'Sci-Fi', url: 'https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=260&fit=crop&q=80' },
  { id: 'ghost_shell', name: 'Motoko Kusanagi', movie: 'Ghost in the Shell', category: 'Anime', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=260&fit=crop&q=80' },
  { id: 'trooper', name: 'Imperial Trooper', movie: 'Star Wars', category: 'Sci-Fi', url: 'https://images.unsplash.com/photo-1579566346927-c68383817a25?w=260&fit=crop&q=80' },
  { id: 'noir_detective', name: 'Sam Spade', movie: 'The Maltese Falcon', category: 'Classics', url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=260&fit=crop&q=80' },
  { id: 'cinematographer', name: 'Cinematographer', movie: '35mm Film Vault', category: 'Classics', url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=260&fit=crop&q=80' },
  { id: 'cyber_armor', name: 'Iron Warrior', movie: 'Avengers', category: 'Action', url: 'https://images.unsplash.com/photo-1626278664285-f796b9ee7806?w=260&fit=crop&q=80' }
];

export const CINEMATIC_PRESET_BANNERS = [
  { name: 'Blade Runner 2049', tag: 'Cyberpunk Neon', url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Interstellar Deep Space', tag: 'Cosmic Wormhole', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Dune: Arrakis Dunes', tag: 'Desert Horizon', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Grand IMAX Cinema Hall', tag: 'Velvet Theater', url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Cyberpunk Tokyo Rain', tag: 'Midnight Neon', url: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Vintage 35mm Studio', tag: 'Analog Archive', url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Apocalypse Golden Sunset', tag: 'Epic Cinema', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Alpine Peak Vista', tag: 'Dramatic Drama', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Retro Synthwave Arcade', tag: '80s Nostalgia', url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Film Premiere Gala', tag: 'Red Carpet', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Deep Nebula Vortex', tag: 'Astrophotography', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1600&h=600&q=85' },
  { name: 'Matrix Digital Grid', tag: 'Cyber Dystopia', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&h=600&q=85' }
];

export default function ProfileCustomizerModal({
  show,
  onClose,
  currentUser,
  onSave,
  library = [],
  watchedCount = 0,
  avgRating = null,
  cinePoints = 0,
  isCreator = false,
  unlockedBorders = new Set(),
  favorites = [],
  setFavorites,
  onSelectSlot,
  initialTab = 'banner'
}) {
  const [customizerTab, setCustomizerTab] = useState(initialTab);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [equippedBorder, setEquippedBorder] = useState('none');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerFitMode, setBannerFitMode] = useState('cover');
  const [bannerPosPercent, setBannerPosPercent] = useState(20);

  // Banner studio filters
  const [bannerSourceTab, setBannerSourceTab] = useState('presets');
  const [tmdbSearchQuery, setTmdbSearchQuery] = useState('');
  const [tmdbSearchResults, setTmdbSearchResults] = useState([]);
  const [tmdbSearching, setTmdbSearching] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Sync draft states when modal opens or user changes
  useEffect(() => {
    if (show) {
      setDisplayName(currentUser?.displayName || '');
      setUsername(currentUser?.username || '');
      setBio(currentUser?.bio || '');
      setAvatar(currentUser?.avatar || '');
      setEquippedBorder(currentUser?.equippedBorder || 'none');
      setBannerUrl(currentUser?.bannerUrl || '');
      setBannerFitMode(currentUser?.bannerFitMode || 'cover');
      setBannerPosPercent(currentUser?.bannerPosPercent ?? 20);
      setCustomizerTab(initialTab);
    }
  }, [show, currentUser, initialTab]);

  // TMDB backdrop search
  const handleTmdbSearch = async (e) => {
    e?.preventDefault();
    if (!tmdbSearchQuery.trim()) return;
    setTmdbSearching(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(tmdbSearchQuery)}&page=1`);
      const data = await res.json();
      const resultsWithBackdrops = (data.results || []).filter(item => item.backdrop_path);
      setTmdbSearchResults(resultsWithBackdrops);
    } catch (err) {
      console.error('TMDB Search error:', err);
    } finally {
      setTmdbSearching(false);
    }
  };

  // Avatar file upload
  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large! Please choose an avatar under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setAvatar(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Banner file upload
  const handleBannerFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large! Please choose a banner under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setBannerUrl(uploadEvent.target.result);
      setBannerFitMode('cover');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave({
      displayName,
      username,
      bio,
      avatar,
      equippedBorder,
      bannerUrl,
      bannerFitMode,
      bannerPosPercent
    });
    onClose();
  };

  if (!show) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, width: '100vw', height: '100vh',
        background: 'rgba(4,3,10,0.92)', backdropFilter: 'blur(20px)',
        zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="glass animate-fade-in-scale"
        style={{
          width: '96vw', maxWidth: '1080px', height: '88vh', maxHeight: '780px',
          borderRadius: '24px', border: '1px solid rgba(255,255,255,0.14)',
          background: '#0d0b16', padding: '24px', display: 'flex', flexDirection: 'column',
          boxShadow: '0 32px 90px rgba(0,0,0,0.98)', position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Customizer Studio Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(136,8,8,0.2)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SlidersHorizontal size={20} color="var(--accent)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', margin: 0 }}>Profile Studio</h3>
                <span style={{ fontSize: '10px', background: 'rgba(136,8,8,0.25)', border: '1px solid var(--accent)', color: '#fff', fontWeight: 800, padding: '2px 7px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Interactive Studio
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Customize your banner, avatar, equipped border, bio, and favorite film showcase.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Studio Workspace: 2-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '22px', flex: 1, minHeight: 0, overflow: 'hidden' }}>

          {/* ── LEFT COLUMN: LIVE PROFILE CARD PREVIEW & DIRECT FRAMING ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '16px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }} />
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)' }}>
                  Live Profile Preview
                </span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Updates Live</span>
            </div>

            {/* Live Rendered Profile Card */}
            <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: '#13111e', boxShadow: '0 12px 30px rgba(0,0,0,0.6)' }}>
              {/* Banner */}
              <div style={{ height: '100px', position: 'relative', overflow: 'hidden', background: '#0a0912' }}>
                {bannerUrl && bannerUrl.startsWith('animated-') ? (
                  <AnimatedBannerBackground bannerId={bannerUrl} />
                ) : (
                  <div
                    style={{
                      width: '100%', height: '100%',
                      background: bannerUrl
                        ? `url("${bannerUrl}") center ${bannerPosPercent ?? 20}% / ${bannerFitMode === 'contain' ? 'contain' : 'cover'} no-repeat`
                        : 'linear-gradient(135deg, #1f1d2b 0%, #110f1a 100%)'
                    }}
                  />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(19,17,30,0.95) 100%)', pointerEvents: 'none' }} />
                <span style={{ position: 'absolute', top: '6px', right: '8px', fontSize: '9px', fontWeight: 800, background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.15)', padding: '1px 6px', borderRadius: '4px', color: '#fff' }}>
                  {bannerUrl && bannerUrl.startsWith('animated-') ? 'ANIMATED' : bannerFitMode.toUpperCase()}
                </span>
              </div>

              {/* Avatar + Info */}
              <div style={{ padding: '0 14px 14px', position: 'relative' }}>
                <div style={{ marginTop: '-32px', marginBottom: '8px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <AvatarWithBorder src={avatar || DEFAULT_GREY_AVATAR} username={displayName || 'User'} borderId={equippedBorder} size={64} />
                  <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent)', background: 'rgba(136,8,8,0.15)', border: '1px solid rgba(136,8,8,0.3)', padding: '2px 6px', borderRadius: '6px' }}>
                    {BORDER_STYLES[equippedBorder]?.name || 'Standard Border'}
                  </span>
                </div>

                <div style={{ fontSize: '15px', fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {displayName || 'Cinema Enthusiast'}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                  @{username || 'user'}
                </div>

                {bio && (
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 10px', lineHeight: 1.4, fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    "{bio}"
                  </p>
                )}

                {/* Stats pills */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '8.5px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Watched</div>
                    <div style={{ fontSize: '12px', fontWeight: 900, color: 'var(--green)' }}>{watchedCount}</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '8.5px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Avg Rate</div>
                    <div style={{ fontSize: '12px', fontWeight: 900, color: 'var(--gold)' }}>{avgRating || '—'}</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '8.5px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Points</div>
                    <div style={{ fontSize: '12px', fontWeight: 900, color: 'var(--accent)' }}>🪙 {cinePoints}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner Framing Tools (if image banner equipped) */}
            {bannerUrl && !bannerUrl.startsWith('animated-') && (
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-dim)' }}>
                  Banner Framing & Focus
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { id: 'cover', label: 'Full-Bleed Cover' },
                    { id: 'contain', label: 'Letterbox Contain' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBannerFitMode(opt.id)}
                      style={{
                        flex: 1, padding: '5px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 800,
                        border: bannerFitMode === opt.id ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                        background: bannerFitMode === opt.id ? 'rgba(136,8,8,0.25)' : 'rgba(0,0,0,0.3)',
                        color: bannerFitMode === opt.id ? '#fff' : 'var(--text-muted)', cursor: 'pointer'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700 }}>
                    <span>▲ Top</span>
                    <span>Position: {bannerPosPercent}%</span>
                    <span>▼ Bottom</span>
                  </div>
                  <input
                    type="range" min="0" max="100" step="5"
                    value={bannerPosPercent}
                    onChange={e => setBannerPosPercent(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer', height: '4px' }}
                  />
                </div>
              </div>
            )}

            {/* Reset Banner button */}
            {bannerUrl && (
              <button
                type="button"
                onClick={() => {
                  setBannerUrl('');
                  setBannerFitMode('cover');
                  setBannerPosPercent(20);
                }}
                style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                  padding: '8px', fontSize: '11px', color: 'var(--text-dim)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <Trash2 size={12} /> Clear Banner
              </button>
            )}
          </div>

          {/* ── RIGHT COLUMN: STUDIO WORKSPACE & CATALOG PANELS ── */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>

            {/* Main Studio Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '6px', marginBottom: '14px', flexShrink: 0 }}>
              {[
                { id: 'banner', label: 'Banners', icon: <ImageIcon size={14} /> },
                { id: 'avatar', label: 'Avatars & Borders', icon: <User size={14} /> },
                { id: 'info', label: 'Profile Info', icon: <Award size={14} /> },
                { id: 'showcase', label: 'Favorites Showcase', icon: <Heart size={14} /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCustomizerTab(tab.id)}
                  style={{
                    background: customizerTab === tab.id ? 'rgba(136,8,8,0.18)' : 'none',
                    border: 'none', padding: '9px 16px', fontSize: '12.5px', fontWeight: 800,
                    color: customizerTab === tab.id ? '#ffffff' : 'var(--text-dim)',
                    borderBottom: customizerTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                    borderRadius: '8px 8px 0 0', cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* SCROLLABLE WORKSPACE PANELS */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>

              {/* ════ TAB 1: BANNERS ════ */}
              {customizerTab === 'banner' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Banner Category Pills */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                    {[
                      { id: 'presets', label: '🎬 Cinematic Stills (Presets)' },
                      { id: 'tmdb', label: '🔍 Search TMDB Backdrops' },
                      { id: 'library', label: '🎞️ From Your Library' },
                      { id: 'animated', label: '🔥 Live Motion' },
                      { id: 'upload', label: '📁 Upload & Direct URL' },
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => setBannerSourceTab(st.id)}
                        style={{
                          background: bannerSourceTab === st.id ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${bannerSourceTab === st.id ? 'var(--accent)' : 'var(--border)'}`,
                          borderRadius: '20px', padding: '5px 12px', fontSize: '11px', fontWeight: 800,
                          color: bannerSourceTab === st.id ? '#fff' : 'var(--text-muted)',
                          cursor: 'pointer', transition: 'all 0.15s'
                        }}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  {/* Sub-tab 1: Preset Cinematic Stills */}
                  {bannerSourceTab === 'presets' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      {CINEMATIC_PRESET_BANNERS.map(b => {
                        const isSelected = bannerUrl === b.url;
                        return (
                          <div
                            key={b.name}
                            onClick={() => { setBannerUrl(b.url); setBannerFitMode('cover'); }}
                            style={{
                              aspectRatio: '16/9', borderRadius: '10px', overflow: 'hidden',
                              border: isSelected ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
                              boxShadow: isSelected ? '0 0 16px rgba(136,8,8,0.5)' : 'none',
                              cursor: 'pointer', position: 'relative', background: '#110e1f',
                              transition: 'transform 0.15s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            <img src={b.url} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%)' }} />
                            <div style={{ position: 'absolute', bottom: '8px', left: '10px', right: '10px' }}>
                              <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {b.name}
                              </div>
                              <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 700 }}>
                                {b.tag}
                              </div>
                            </div>
                            {isSelected && (
                              <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--accent)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                                <Check size={13} color="#fff" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Sub-tab 2: TMDB Movie & Show Backdrops */}
                  {bannerSourceTab === 'tmdb' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <form onSubmit={handleTmdbSearch} style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                          <input
                            type="text"
                            placeholder="Search any movie or show for HD backdrops (e.g. Oppenheimer, Batman, Dune, Matrix)..."
                            value={tmdbSearchQuery}
                            onChange={e => setTmdbSearchQuery(e.target.value)}
                            className="form-input"
                            style={{ paddingLeft: '34px', fontSize: '12.5px', height: '38px' }}
                          />
                        </div>
                        <button type="submit" disabled={tmdbSearching} className="btn btn-primary" style={{ padding: '0 18px', fontSize: '12px', fontWeight: 800, height: '38px' }}>
                          {tmdbSearching ? 'Searching…' : 'Find Stills'}
                        </button>
                      </form>

                      {tmdbSearchResults.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                          {tmdbSearchResults.map(item => {
                            const highRes = `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`;
                            const isSelected = bannerUrl === highRes;
                            return (
                              <div
                                key={item.id}
                                onClick={() => { setBannerUrl(highRes); setBannerFitMode('cover'); }}
                                style={{
                                  aspectRatio: '16/9', borderRadius: '10px', overflow: 'hidden',
                                  border: isSelected ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
                                  boxShadow: isSelected ? '0 0 16px rgba(136,8,8,0.5)' : 'none',
                                  cursor: 'pointer', position: 'relative', background: '#110e1f'
                                }}
                              >
                                <img src={`https://image.tmdb.org/t/p/w500${item.backdrop_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(180deg,transparent 0%,rgba(0,0,0,0.85) 100%)', padding: '6px 8px', fontSize: '11px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {item.title || item.name}
                                </div>
                                {isSelected && (
                                  <div style={{ position: 'absolute', top: '6px', right: '6px', background: 'var(--accent)', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Check size={12} color="#fff" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-dim)', fontSize: '12px', background: 'rgba(255,255,255,0.015)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                          Type any film or series title above to fetch official high-definition cinema widescreen backdrops.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-tab 3: Library Backdrops */}
                  {bannerSourceTab === 'library' && (
                    <div>
                      {(() => {
                        const validItems = library.filter(m => m.backdrop_path || m.details?.backdrop_path || m.poster_path);
                        if (validItems.length === 0) {
                          return (
                            <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-dim)', fontSize: '12.5px', background: 'rgba(255,255,255,0.015)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                              <p style={{ margin: 0, fontWeight: 800, color: '#fff', fontSize: '14px' }}>🎬 No Watched Films Yet</p>
                              <p style={{ marginTop: '6px', fontSize: '12px' }}>Log movies into your watched library to equip their cinema backdrops directly onto your profile.</p>
                            </div>
                          );
                        }
                        return (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            {validItems.slice(0, 30).map(m => {
                              const backdropPath = m.backdrop_path || m.details?.backdrop_path;
                              const imageSrc = backdropPath ? `https://image.tmdb.org/t/p/w1280${backdropPath}` : `https://image.tmdb.org/t/p/w780${m.poster_path}`;
                              const isSelected = bannerUrl === imageSrc;
                              return (
                                <div
                                  key={m.id || m.tmdb_id}
                                  onClick={() => { setBannerUrl(imageSrc); setBannerFitMode('cover'); }}
                                  style={{
                                    aspectRatio: '16/9', borderRadius: '10px', overflow: 'hidden',
                                    border: isSelected ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
                                    boxShadow: isSelected ? '0 0 16px rgba(136,8,8,0.5)' : 'none',
                                    cursor: 'pointer', position: 'relative', background: '#110e1f'
                                  }}
                                >
                                  <img
                                    src={backdropPath ? `https://image.tmdb.org/t/p/w500${backdropPath}` : `https://image.tmdb.org/t/p/w342${m.poster_path}`}
                                    alt=""
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    loading="lazy"
                                  />
                                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(180deg,transparent 0%,rgba(0,0,0,0.85) 100%)', padding: '6px 8px', fontSize: '11px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {m.title}
                                  </div>
                                  {isSelected && (
                                    <div style={{ position: 'absolute', top: '6px', right: '6px', background: 'var(--accent)', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Check size={12} color="#fff" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Sub-tab 4: Animated Motion Banners */}
                  {bannerSourceTab === 'animated' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {isCreator ? '👑 Creator Perk: All live animated ambient banners are unlocked for your profile!' : 'Ambient motion banners: 35mm scanlines, shooting stars, matrix digital rain, synthwave, aurora, and plasma.'}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        {ALL_ANIMATED_BANNERS.map(item => {
                          const isUnlocked = isCreator || (currentUser?.purchasedBanners || []).includes(item.id);
                          const isSelected = bannerUrl === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                if (isUnlocked) setBannerUrl(item.id);
                              }}
                              className={item.className}
                              style={{
                                height: '84px', borderRadius: '10px',
                                cursor: isUnlocked ? 'pointer' : 'default',
                                border: isSelected ? '2.5px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
                                boxShadow: isSelected ? '0 0 16px var(--accent)' : 'none',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                padding: '8px', textAlign: 'center', overflow: 'hidden', position: 'relative',
                                opacity: isUnlocked ? 1 : 0.65
                              }}
                            >
                              <span style={{ fontSize: '12px', fontWeight: 900, color: isSelected ? 'var(--accent)' : '#fff', position: 'relative', zIndex: 10, textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
                                {item.name}
                              </span>
                              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', marginTop: '2px', position: 'relative', zIndex: 10 }}>
                                🪙 {item.cost} pts
                              </span>
                              {isSelected && (
                                <div style={{ position: 'absolute', top: '6px', right: '6px', background: 'var(--accent)', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11 }}>
                                  <Check size={12} color="#fff" />
                                </div>
                              )}
                              {!isUnlocked && (
                                <span style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '9px', background: 'rgba(0,0,0,0.85)', color: 'var(--gold)', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, zIndex: 11 }}>
                                  🔒 Shop
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sub-tab 5: Upload & Direct URL */}
                  {bannerSourceTab === 'upload' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <label
                        style={{
                          border: '2px dashed rgba(136,8,8,0.4)', borderRadius: '14px', padding: '28px 16px',
                          textAlign: 'center', background: 'rgba(136,8,8,0.05)', cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(136,8,8,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(136,8,8,0.4)'; e.currentTarget.style.background = 'rgba(136,8,8,0.05)'; }}
                      >
                        <Upload size={22} color="var(--accent)" />
                        <div>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>Click to Upload Banner Image</span>
                          <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: '3px 0 0' }}>Supports PNG, JPG, WEBP, and Animated GIFs up to 5MB.</p>
                        </div>
                        <input type="file" accept="image/*" onChange={handleBannerFileUpload} style={{ display: 'none' }} />
                      </label>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '10.5px', color: 'var(--text-dim)', fontWeight: 800 }}>OR PASTE DIRECT IMAGE / GIF URL</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/... or https://i.imgur.com/...gif"
                            value={customUrlInput}
                            onChange={e => setCustomUrlInput(e.target.value)}
                            className="form-input"
                            style={{ flex: 1, fontSize: '12px' }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customUrlInput.trim()) {
                                setBannerUrl(customUrlInput.trim());
                                setBannerFitMode('cover');
                              }
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '0 16px', fontSize: '12px', fontWeight: 800 }}
                          >
                            Apply URL
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ════ TAB 2: AVATARS & BORDERS ════ */}
              {customizerTab === 'avatar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Movie Character Avatars Grid */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Curated Movie Characters & Icons ({CURATED_MOVIE_AVATARS.length})
                      </label>
                      <label
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px',
                          background: 'rgba(136,8,8,0.15)', border: '1px solid rgba(136,8,8,0.3)',
                          borderRadius: '16px', cursor: 'pointer', fontSize: '11px', fontWeight: 800, color: '#fff'
                        }}
                      >
                        <Upload size={12} color="var(--accent)" /> Upload Custom Photo
                        <input type="file" accept="image/*" onChange={handleAvatarFileUpload} style={{ display: 'none' }} />
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      {CURATED_MOVIE_AVATARS.map((char) => {
                        const isSelected = avatar === char.url;
                        return (
                          <div
                            key={char.id}
                            onClick={() => setAvatar(char.url)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px',
                              borderRadius: '10px', cursor: 'pointer',
                              border: isSelected ? '1.5px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
                              background: isSelected ? 'rgba(136,8,8,0.18)' : 'rgba(255,255,255,0.02)',
                              boxShadow: isSelected ? '0 0 12px rgba(136,8,8,0.4)' : 'none',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            }}
                            onMouseLeave={e => {
                              if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                            }}
                          >
                            <img
                              src={char.url}
                              alt={char.name}
                              style={{
                                width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover',
                                border: isSelected ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.15)',
                                flexShrink: 0
                              }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '12px', fontWeight: 800, color: isSelected ? '#fff' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {char.name}
                              </div>
                              <div style={{ fontSize: '10px', color: isSelected ? 'var(--accent)' : 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {char.movie}
                              </div>
                            </div>
                            {isSelected && <Check size={14} color="var(--accent)" style={{ flexShrink: 0 }} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Avatar Borders Section */}
                  <div style={{ paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                      Avatar Profile Borders
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                      {Object.entries(BORDER_STYLES).map(([id, config]) => {
                        const isUnlocked = unlockedBorders.has(id);
                        const isEquipped = equippedBorder === id;
                        return (
                          <div
                            key={id}
                            onClick={() => { if (isUnlocked) setEquippedBorder(id); }}
                            style={{
                              padding: '8px 10px', borderRadius: '8px',
                              border: isEquipped ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                              background: isEquipped ? 'rgba(136,8,8,0.18)' : isUnlocked ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.3)',
                              opacity: isUnlocked ? 1 : 0.45,
                              cursor: isUnlocked ? 'pointer' : 'not-allowed',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              transition: 'all 0.15s'
                            }}
                          >
                            <span style={{ fontSize: '11.5px', fontWeight: 700, color: isEquipped ? 'var(--accent)' : '#fff' }}>
                              {config.name}
                            </span>
                            <span style={{ fontSize: '9.5px', color: isUnlocked ? 'var(--green)' : 'var(--text-dim)', fontWeight: 800 }}>
                              {isEquipped ? '✓ Active' : isUnlocked ? 'Equip' : '🔒'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* ════ TAB 3: PROFILE INFO ════ */}
              {customizerTab === 'info' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 800 }}>DISPLAY NAME</label>
                      <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="form-input" style={{ fontSize: '13px' }} placeholder="e.g. Cinema Enthusiast" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 800 }}>USERNAME (HANDLE)</label>
                      <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="form-input" style={{ fontSize: '13px' }} placeholder="e.g. cinephile" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 800 }}>BIO & CINEMA STORY</label>
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{bio.length}/250 chars</span>
                    </div>
                    <textarea
                      maxLength={250}
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="Share your favorite directors, genres, cinema passions, or favorite movie quotes..."
                      className="form-input"
                      style={{ minHeight: '100px', fontSize: '13px', lineHeight: 1.5 }}
                    />
                  </div>
                </div>
              )}

              {/* ════ TAB 4: FAVORITES SHOWCASE (6 SLOTS) ════ */}
              {customizerTab === 'showcase' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    Select your top 6 favorite films to showcase prominently on your public profile header. Click any slot to choose from your watched films.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                    {favorites.map((fav, idx) => (
                      <div
                        key={idx}
                        onClick={() => onSelectSlot(idx)}
                        style={{
                          aspectRatio: '2/3',
                          borderRadius: '8px',
                          border: fav ? '1.5px solid var(--border)' : '1.5px dashed rgba(255,255,255,0.2)',
                          background: fav ? '#110e1f' : 'rgba(255,255,255,0.02)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = fav ? 'var(--border)' : 'rgba(255,255,255,0.2)'; }}
                      >
                        {fav ? (
                          <>
                            <img
                              src={`https://image.tmdb.org/t/p/w185${fav.poster_path}`}
                              alt={fav.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFavorites(prev => {
                                  const next = [...prev];
                                  next[idx] = null;
                                  return next;
                                });
                              }}
                              style={{
                                position: 'absolute', top: '4px', right: '4px',
                                background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '50%',
                                width: '18px', height: '18px', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', color: '#fff', cursor: 'pointer'
                              }}
                            >
                              <X size={10} />
                            </button>
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%)', padding: '4px', textAlign: 'center' }}>
                              <div style={{ fontSize: '9px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {fav.title}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <Plus size={16} color="var(--text-muted)" />
                            <span style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 700 }}>Slot {idx + 1}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* MODAL FOOTER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)', marginTop: '16px', flexShrink: 0 }}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={13} color="var(--accent)" />
            <span>Live Studio Active — preview updates immediately before saving</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-secondary"
              onClick={onClose}
              style={{ padding: '8px 18px', fontSize: '12.5px' }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              style={{ padding: '8px 24px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}
            >
              <CheckCircle2 size={15} /> Save Changes
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
