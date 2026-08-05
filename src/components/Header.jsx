import React, { useState, useRef, useEffect } from 'react';
import { Film, Compass, List, BarChart3, User, LogOut, Sparkles, CalendarDays, Award, Settings, Library, Home, Star, Trophy, HelpCircle, Flame, Clapperboard, Users, Wand2, Menu, X, Search } from 'lucide-react';
import { isSupabaseConfigured } from '../supabaseClient';
import { BORDER_STYLES } from '../utils/achievements';
import AvatarWithBorder from './AvatarWithBorder';

const NAV_GROUPS = [
  {
    title: 'Discover',
    items: [
      { id: 'landing',       label: 'Home',        icon: Home },
      { id: 'explore',       label: 'Explore',     icon: Compass },
      { id: 'foryou',        label: 'For You',     icon: Wand2 },
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

export default function Header({ activeTab, setActiveTab, currentUser, onLogout, onOpenAuth, useSupabase, setUseSupabase, onOpenSettings, onOpenCommandCenter }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close sidebar on link click (for mobile)
  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
  };

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

        <div className="logo-wrapper" onClick={() => handleNavClick('landing')} style={{ fontSize: '20px' }}>
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
            <div className="logo-wrapper" onClick={() => handleNavClick('landing')}>
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
                background: 'rgba(124,111,247,0.06)', border: '1px solid rgba(124,111,247,0.2)',
                borderRadius: '10px', height: '36px', padding: '0 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', color: 'var(--text-dim)', transition: 'all 0.2s', width: '100%'
              }}
              title="Command Center (Ctrl+K)"
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(124,111,247,0.2)'; e.currentTarget.style.color = 'var(--text-dim)'; }}
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
                  background: activeTab === 'achievements' ? 'rgba(124,111,247,0.12)' : 'rgba(255,255,255,0.04)',
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
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', background: 'rgba(124,111,247,0.04)' }}>
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
