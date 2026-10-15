import React, { useState, useRef, useEffect } from 'react';
import { Film, Compass, List, BarChart3, User, LogOut, Sparkles, CalendarDays, Award, Settings, Library, Home, Star, Trophy, HelpCircle, Flame, Clapperboard, Users, Wand2, Menu, X, Search, Bell } from 'lucide-react';
import { isSupabaseConfigured } from '../supabaseClient';
import { BORDER_STYLES } from '../utils/achievements';
import AvatarWithBorder from './AvatarWithBorder';

const NAV_GROUPS = [
  {
    title: 'Discover',
    items: [
      { id: 'explore',       label: 'Explore',     icon: Compass },
      { id: 'social',        label: 'Social Feed', icon: Users },
    ]
  },
  {
    title: 'My Collection',
    items: [
      { id: 'library',       label: 'Library',     icon: Library },
      { id: 'collections',   label: 'Collections', icon: Award },
      { id: 'tierlist',      label: 'Tier List',   icon: Trophy },
      { id: 'constellation', label: 'Stars Map',   icon: Sparkles },
      { id: 'calendar',      label: 'Watch Calendar', icon: CalendarDays },
      { id: 'stats',         label: 'Statistics',   icon: BarChart3 },
    ]
  },
  {
    title: 'Activities',
    items: [
      { id: 'challenges',    label: 'Challenges',  icon: Flame },
      { id: 'trivia',        label: 'Trivia Game', icon: HelpCircle },
      { id: 'wrapped',       label: 'Yearly Wrapped', icon: Clapperboard },
    ]
  }
];

export default function Header({ activeTab, setActiveTab, currentUser, onLogout, onOpenAuth, useSupabase, setUseSupabase, onOpenSettings, onOpenCommandCenter, layoutMode = 'top-nav' }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreNav, setShowMoreNav] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(true);
  const menuRef = useRef(null);
  const moreNavRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false);
      if (moreNavRef.current && !moreNavRef.current.contains(e.target)) setShowMoreNav(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close sidebar on link click (for mobile)
  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
    setShowMoreNav(false);
  };

  // ── CINEMATIC TOP-NAV BAR (RED RENDER STYLE) ──
  if (layoutMode === 'top-nav') {
    return (
      <header className="app-header topnav-header" style={{
        position: 'sticky',
        top: 0,
        zIndex: 500,
        background: '#000000',
        borderBottom: '1px solid var(--border)',
        width: '100%'
      }}>
        <div className="topnav-inner" style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 32px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px'
        }}>
          {/* Left: Brand + Sleek Clean Nav Links */}
          <div className="topnav-left" style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
            <div
              className="logo-wrapper"
              onClick={() => handleNavClick('explore')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none', flexShrink: 0 }}
            >
              {/* Sleek red camera icon like in mockup */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(229,9,20,0.35)'
              }}>
                <Film size={18} color="#FFFFFF" />
              </div>
              <span style={{ color: '#FFFFFF', fontWeight: 900, fontSize: '21px', letterSpacing: '-0.5px' }}>
                Cine<span style={{ color: 'var(--accent)' }}>Log</span>
              </span>
            </div>

            {/* Primary Cinema Tabs (Clean & uncluttered) */}
            <nav className="topnav-nav" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {[
                { id: 'library', label: 'Library' },
                { id: 'explore', label: 'Explore' },
                { id: 'collections', label: 'Collections' },
                { id: 'tierlist', label: 'Tier List' },
                { id: 'social', label: 'Social' },
              ].map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleNavClick(tab.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                      borderRadius: 0,
                      color: isActive ? '#FFFFFF' : '#8E8E8E',
                      fontSize: '14px',
                      fontWeight: isActive ? 800 : 500,
                      padding: '21px 16px',
                      cursor: 'pointer',
                      transition: 'color 0.15s ease, border-color 0.15s ease',
                      whiteSpace: 'nowrap',
                      position: 'relative'
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#FFFFFF'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#8E8E8E'; }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Search Pill + Notifications Bell + User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
            {/* Mobile search icon button */}
            <button
              className="topnav-search-mobile-btn"
              onClick={onOpenCommandCenter}
              title="Search films"
              style={{
                background: '#141414',
                border: '1px solid #242424',
                borderRadius: '8px',
                width: '38px',
                height: '38px',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#9E9E9E',
                flexShrink: 0
              }}
            >
              <Search size={16} />
            </button>

            {/* Search Input bar pill matching mockup - clean without ⌘K */}
            <div
              className="topnav-search"
              onClick={onOpenCommandCenter}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: '#141414',
                border: '1px solid #242424',
                borderRadius: '8px',
                padding: '8px 16px',
                color: '#777777',
                fontSize: '13px',
                cursor: 'pointer',
                width: '260px',
                transition: 'border-color 0.15s, background 0.15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = '#181818'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#242424'; e.currentTarget.style.background = '#141414'; }}
            >
              <Search size={15} color="#888888" />
              <span style={{ flex: 1, color: '#888888' }}>Search films, directors...</span>
            </div>

            {/* Notifications button with sleek popover */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (unreadNotifications) setUnreadNotifications(false);
                }}
                style={{
                  background: showNotifications ? '#1E1E1E' : '#141414',
                  border: `1px solid ${showNotifications ? 'var(--accent)' : '#242424'}`,
                  borderRadius: '8px',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: showNotifications ? '#FFFFFF' : '#9E9E9E',
                  transition: 'all 0.15s',
                  position: 'relative'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = '#383838'; }}
                onMouseLeave={e => { if (!showNotifications) { e.currentTarget.style.color = '#9E9E9E'; e.currentTarget.style.borderColor = '#242424'; } }}
                title="Notifications"
              >
                <Bell size={16} />
                {unreadNotifications && (
                  <span style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    boxShadow: '0 0 6px var(--accent)'
                  }} />
                )}
              </button>

              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  background: '#121212',
                  border: '1px solid #282828',
                  borderRadius: '12px',
                  padding: '14px',
                  width: '320px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.95)',
                  zIndex: 1000
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #222222', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Bell size={14} color="var(--accent)" />
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>Notifications</span>
                    </div>
                    <span
                      style={{ fontSize: '11px', color: 'var(--accent)', cursor: 'pointer', fontWeight: 700 }}
                      onClick={() => setUnreadNotifications(false)}
                    >
                      Mark read
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ padding: '9px 11px', background: '#181818', borderRadius: '8px', border: '1px solid #282828' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>🎬 In Cinemas: Dune: Part Two</div>
                      <div style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '2px', lineHeight: 1.4 }}>Trending #1 this week. Log your screening to update your stats.</div>
                      <div style={{ fontSize: '10px', color: '#666666', marginTop: '4px' }}>2 hours ago</div>
                    </div>

                    <div style={{ padding: '9px 11px', background: '#151515', borderRadius: '8px', border: '1px solid #222222' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>⭐ Watch Diary Synced</div>
                      <div style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '2px', lineHeight: 1.4 }}>Your latest reviews and watch dates have been recorded.</div>
                      <div style={{ fontSize: '10px', color: '#666666', marginTop: '4px' }}>Yesterday</div>
                    </div>

                    <div style={{ padding: '9px 11px', background: '#151515', borderRadius: '8px', border: '1px solid #222222' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>🏆 Weekly Rank Unlocked</div>
                      <div style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '2px', lineHeight: 1.4 }}>VIP Cinephile milestone achieved. Badges updated!</div>
                      <div style={{ fontSize: '10px', color: '#666666', marginTop: '4px' }}>3 days ago</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill & Dropdown */}
            {currentUser ? (
              <div style={{ position: 'relative' }} ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    background: '#141414',
                    border: '1px solid #242424',
                    borderRadius: '24px',
                    padding: '4px 12px 4px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    transition: 'border-color 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#242424'}
                >
                  <AvatarWithBorder
                    src={currentUser?.avatar || DEFAULT_GREY_AVATAR}
                    username={currentUser?.username || 'User'}
                    borderId={currentUser?.equippedBorder || 'none'}
                    size={28}
                  />
                  <span>{currentUser.display_name || currentUser.displayName || currentUser.username || 'Alex R.'}</span>
                  <span style={{ fontSize: '11px', color: '#777777', transition: 'transform 0.15s', transform: showUserMenu ? 'rotate(180deg)' : 'none' }}>▾</span>
                </button>

                {showUserMenu && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    background: '#121212',
                    border: '1px solid #282828',
                    borderRadius: '12px',
                    padding: '8px',
                    width: '240px',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.9)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    {/* Header info */}
                    <div
                      onClick={() => { handleNavClick('profile'); setShowUserMenu(false); }}
                      style={{ padding: '8px 10px 10px', cursor: 'pointer', borderBottom: '1px solid #222222', marginBottom: '4px' }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#FFFFFF' }}>{currentUser.display_name || currentUser.username}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--accent)', marginTop: '2px' }}>View Full Profile & Showcase →</div>
                    </div>

                    <div style={{ padding: '4px 10px 2px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#666666' }}>
                      Analytics & Tracking
                    </div>

                    {[
                      { id: 'stats', label: 'Statistics & Charts', icon: BarChart3 },
                      { id: 'calendar', label: 'Watch Calendar', icon: CalendarDays },
                      { id: 'wrapped', label: 'Yearly Wrapped', icon: Clapperboard },
                      { id: 'achievements', label: 'Badges & XP', icon: Trophy },
                      { id: 'constellation', label: 'Stars Map', icon: Sparkles },
                    ].map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => { handleNavClick(item.id); setShowUserMenu(false); }}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            textAlign: 'left',
                            background: activeTab === item.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                            border: 'none',
                            color: '#E0E0E0',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'background 0.12s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.background = activeTab === item.id ? 'rgba(255,255,255,0.06)' : 'transparent'}
                        >
                          <Icon size={14} color="var(--accent)" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}

                    <div style={{ height: '1px', background: '#222222', margin: '4px 0' }} />

                    <div style={{ padding: '4px 10px 2px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#666666' }}>
                      Activities
                    </div>

                    <button
                      onClick={() => { handleNavClick('trivia'); setShowUserMenu(false); }}
                      style={{ width: '100%', padding: '7px 10px', textAlign: 'left', background: 'transparent', border: 'none', color: '#CCCCCC', fontSize: '12px', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <HelpCircle size={14} color="var(--gold)" />
                      <span>Trivia Challenge</span>
                    </button>

                    <button
                      onClick={() => { handleNavClick('challenges'); setShowUserMenu(false); }}
                      style={{ width: '100%', padding: '7px 10px', textAlign: 'left', background: 'transparent', border: 'none', color: '#CCCCCC', fontSize: '12px', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Flame size={14} color="#f97316" />
                      <span>Film Bounties</span>
                    </button>

                    <div style={{ height: '1px', background: '#222222', margin: '4px 0' }} />

                    <button
                      onClick={() => { onOpenSettings(); setShowUserMenu(false); }}
                      style={{ width: '100%', padding: '7px 10px', textAlign: 'left', background: 'transparent', border: 'none', color: '#A0A0A0', fontSize: '12px', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Settings size={14} />
                      <span>Settings</span>
                    </button>

                    <button
                      onClick={() => { onLogout(); setShowUserMenu(false); }}
                      style={{ width: '100%', padding: '7px 10px', textAlign: 'left', background: 'transparent', border: 'none', color: 'var(--red)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 800, borderRadius: '6px' }}
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  // ── CLASSIC SIDEBAR LAYOUT (Fallback) ──
  return (
    <>
      {/* Mobile Top Bar */}
      <div className="mobile-top-bar">
        <button
          onClick={() => setIsSidebarOpen(true)}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Menu size={24} />
        </button>

        <div className="logo-wrapper" onClick={() => handleNavClick('explore')} style={{ fontSize: '20px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <rect width="20" height="20" x="2" y="2" rx="2.18" ry="2.18"/>
            <line x1="7" x2="7" y1="2" y2="22"/>
            <line x1="17" x2="17" y1="2" y2="22"/>
            <line x1="2" x2="22" y1="12" y2="12"/>
            <line x1="2" x2="7" y1="7" y2="7"/>
            <line x1="17" x2="22" y1="7" y2="7"/>
            <line x1="17" x2="22" y1="17" y2="17"/>
            <line x1="2" x2="7" y1="17" y2="17"/>
          </svg>
          <span style={{ color: 'var(--accent)', background: 'none', WebkitTextFillColor: 'var(--accent)' }}>CineLog</span>
        </div>

        <button
          onClick={onOpenCommandCenter}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Search size={20} />
        </button>
      </div>

      {/* Sidebar overlay backdrop for mobile */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Main Responsive Left Sidebar Header */}
      <header className={`app-header ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="header-content">
          {/* Logo & Close button on Mobile */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo-wrapper" onClick={() => handleNavClick('explore')}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <rect width="20" height="20" x="2" y="2" rx="2.18" ry="2.18"/>
                <line x1="7" x2="7" y1="2" y2="22"/>
                <line x1="17" x2="17" y1="2" y2="22"/>
                <line x1="2" x2="22" y1="12" y2="12"/>
                <line x1="2" x2="7" y1="7" y2="7"/>
                <line x1="17" x2="22" y1="7" y2="7"/>
                <line x1="17" x2="22" y1="17" y2="17"/>
                <line x1="2" x2="7" y1="17" y2="17"/>
              </svg>
              <span style={{ color: 'var(--accent)', background: 'none', WebkitTextFillColor: 'var(--accent)' }}>CineLog</span>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="mobile-only"
              style={{
                display: 'none', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                '@media (max-width: 1024px)': { display: 'flex' }
              }}
            >
              <X size={20} />
            </button>
            {/* Direct CSS injection workaround for close button responsive style */}
            <style dangerouslySetInnerHTML={{__html: `
              @media (max-width: 1024px) {
                .mobile-only { display: flex !important; }
              }
            `}} />
          </div>

          {/* Nav groups */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto', paddingRight: '4px', width: '100%' }}>
            {NAV_GROUPS.map((group) => (
              <div key={group.title} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 12px 6px' }}>
                  {group.title}
                </div>
                <nav className="nav-links">
                  {group.items.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      className={`nav-link ${activeTab === id ? 'active' : ''}`}
                      onClick={() => handleNavClick(id)}
                    >
                      <Icon size={15} />
                      <span>{label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          {/* Bottom Area */}
          <div className="user-nav">
            {/* Search/Command Center Bar */}
            <button
              onClick={onOpenCommandCenter}
              style={{
                background: 'rgba(136,8,8,0.06)', border: '1px solid rgba(136,8,8,0.2)',
                borderRadius: '10px', height: '36px', padding: '0 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', color: 'var(--text-dim)', transition: 'all 0.2s', width: '100%'
              }}
              title="Command Center (Ctrl+K)"
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(136,8,8,0.2)'; e.currentTarget.style.color = 'var(--text-dim)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <Search size={13} />
                <span>Search / Commands</span>
              </div>
              <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>⌘K</span>
            </button>

            {/* Quick Actions (Trophy, Settings) */}
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button
                onClick={() => handleNavClick('achievements')}
                style={{
                  background: activeTab === 'achievements' ? 'rgba(136,8,8,0.12)' : 'rgba(255,255,255,0.04)',
                  border: activeTab === 'achievements' ? '1px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: '10px', height: '36px', flex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  cursor: 'pointer', color: activeTab === 'achievements' ? 'var(--accent)' : 'var(--text-muted)',
                  transition: 'all 0.2s', fontSize: '12px', fontWeight: 700
                }}
                title="Achievements & Rewards"
              >
                <Trophy size={14} /> Achievements
              </button>
              
              <button
                onClick={onOpenSettings}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                  borderRadius: '10px', width: '36px', height: '36px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s'
                }}
                title="Settings"
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <Settings size={14} />
              </button>
            </div>

            {/* User Profile Card */}
            {currentUser ? (
              <div style={{ position: 'relative', width: '100%' }} ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px', borderRadius: '12px', transition: 'all 0.2s', width: '100%'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                >
                  <AvatarWithBorder
                    src={currentUser.avatar}
                    username={currentUser.username}
                    borderId={currentUser.equippedBorder || 'none'}
                    size={32}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 800, fontSize: '12px', color: 'var(--text)', lineHeight: 1.2, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
                      {currentUser.displayName || currentUser.username || 'You'}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'left' }}>
                      @{currentUser.username}
                    </span>
                  </div>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ color: 'var(--text-dim)', transition: 'transform 0.2s', transform: showUserMenu ? 'rotate(180deg)' : '' }}>
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Dropdown Menu (Renders upwards since profile is at bottom) */}
                {showUserMenu && (
                  <div className="animate-fade-in-scale" style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, right: 0, background: 'rgba(10,8,19,0.98)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', zIndex: 200, backdropFilter: 'blur(24px)', boxShadow: 'var(--shadow-lg)' }}>
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', background: 'rgba(136,8,8,0.04)' }}>
                      <div style={{ fontWeight: 850, fontSize: '12.5px' }}>{currentUser.displayName || currentUser.username}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '1px' }}>{currentUser.email || `@${currentUser.username}`}</div>
                    </div>
                    {[
                      { label: 'My Profile', icon: User, tab: 'profile' },
                      { label: 'My Library', icon: Library, tab: 'library' },
                    ].map(item => (
                      <button key={item.label}
                        onClick={() => { handleNavClick(item.tab); setShowUserMenu(false); }}
                        style={{ width: '100%', background: 'none', border: 'none', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      >
                        <item.icon size={13} /> {item.label}
                      </button>
                    ))}
                    <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
                    <button
                      onClick={() => { onLogout(); setShowUserMenu(false); }}
                      style={{ width: '100%', background: 'none', border: 'none', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--red)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <LogOut size={13} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="btn btn-primary" onClick={onOpenAuth} style={{ padding: '8px 16px', fontSize: '12.5px', width: '100%', borderRadius: '12px' }}>
                <User size={13} /> Sign In
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

