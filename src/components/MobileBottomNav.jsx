import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Compass,
  Film,
  Plus,
  FolderHeart,
  Menu,
  X,
  Trophy,
  BarChart3,
  Calendar,
  Sparkles,
  HelpCircle,
  Gift,
  Users,
  Settings,
  LogOut,
  User,
  ShieldAlert
} from 'lucide-react';

export default function MobileBottomNav({
  activeTab,
  setActiveTab,
  onOpenCommandCenter,
  currentUser,
  onOpenAuth,
  onOpenSettings,
  onLogout,
  libraryCount = 0
}) {
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const drawerTouchStartRef = useRef(null);

  const closeMoreDrawer = useCallback(() => {
    setShowMoreDrawer(false);
  }, []);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setShowMoreDrawer(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Native Android CloseWatcher integration
  useEffect(() => {
    if (!showMoreDrawer) return;

    if (typeof window !== 'undefined' && 'CloseWatcher' in window) {
      try {
        const watcher = new window.CloseWatcher();
        watcher.onclose = () => {
          closeMoreDrawer();
        };
        return () => {
          try { watcher.destroy(); } catch (e) {}
        };
      } catch (err) {}
    }
  }, [showMoreDrawer, closeMoreDrawer]);

  // 2. Universal CineLog back event listener (prevents background navigation)
  useEffect(() => {
    if (!showMoreDrawer) return;

    const handleBackEvent = (e) => {
      e.preventDefault();
      closeMoreDrawer();
    };

    window.addEventListener('cinelog-back-handled', handleBackEvent);
    return () => window.removeEventListener('cinelog-back-handled', handleBackEvent);
  }, [showMoreDrawer, closeMoreDrawer]);


  const secondaryTabs = [
    { id: 'profile', label: 'My Profile', icon: User, badge: currentUser ? (currentUser.username || 'User') : 'Guest' },
    { id: 'collections', label: 'Custom Lists & Collections', icon: FolderHeart },
    { id: 'stats', label: 'Cinema Analytics', icon: BarChart3 },
    { id: 'calendar', label: 'Watch Calendar', icon: Calendar },
    { id: 'constellation', label: 'Film Constellation', icon: Sparkles },
    { id: 'trivia', label: 'Movie Trivia', icon: HelpCircle },
    { id: 'wrapped', label: 'Yearly Wrapped', icon: Gift },
    { id: 'social', label: 'Community Feed', icon: Users },
  ];

  const isMoreActive = [
    'profile',
    'collections',
    'stats',
    'calendar',
    'constellation',
    'trivia',
    'wrapped',
    'social',
    'achievements'
  ].includes(activeTab);

  return (
    <>
      {/* ── NATIVE MOBILE BOTTOM BAR ── */}
      <nav className="mobile-bottom-nav">
        {/* 1. Explore Tab */}
        <button
          className={`mobile-nav-item ${activeTab === 'explore' ? 'active' : ''}`}
          onClick={() => handleTabClick('explore')}
          aria-label="Explore"
        >
          <div className="mobile-nav-icon-wrap">
            <Compass size={21} strokeWidth={activeTab === 'explore' ? 2.5 : 1.8} />
          </div>
          <span className="mobile-nav-label">Explore</span>
        </button>

        {/* 2. Library Tab */}
        <button
          className={`mobile-nav-item ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => handleTabClick('library')}
          aria-label="Library"
        >
          <div className="mobile-nav-icon-wrap">
            <Film size={21} strokeWidth={activeTab === 'library' ? 2.5 : 1.8} />
          </div>
          <span className="mobile-nav-label">Library</span>
        </button>

        {/* 3. Center "+ Log" Action Button */}
        <button
          className="mobile-nav-fab-center"
          onClick={onOpenCommandCenter}
          aria-label="Log or Search Film"
          title="Log Film"
        >
          <div className="mobile-fab-circle" style={{ background: 'var(--accent)', boxShadow: '0 6px 18px rgba(var(--accent-rgb, 229, 9, 20), 0.55), 0 2px 6px rgba(0, 0, 0, 0.7)' }}>
            <Plus size={24} strokeWidth={2.6} color="var(--accent-contrast, #FFFFFF)" />
          </div>
          <span className="mobile-nav-label" style={{ color: 'var(--accent)', fontWeight: 800 }}>Log</span>
        </button>

        {/* 4. Tier List & Rankings Tab */}
        <button
          className={`mobile-nav-item ${activeTab === 'tierlist' ? 'active' : ''}`}
          onClick={() => handleTabClick('tierlist')}
          aria-label="Tier List"
        >
          <div className="mobile-nav-icon-wrap">
            <Trophy size={21} strokeWidth={activeTab === 'tierlist' ? 2.5 : 1.8} />
          </div>
          <span className="mobile-nav-label">Tier List</span>
        </button>

        {/* 5. More / Menu Drawer */}
        <button
          className={`mobile-nav-item ${isMoreActive || showMoreDrawer ? 'active' : ''}`}
          onClick={() => setShowMoreDrawer(prev => !prev)}
          aria-label="More Features"
        >
          <div className="mobile-nav-icon-wrap">
            {currentUser?.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt="Avatar"
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: isMoreActive ? '2px solid var(--accent)' : '1.5px solid rgba(255,255,255,0.4)'
                }}
              />
            ) : (
              <Menu size={21} strokeWidth={isMoreActive ? 2.5 : 1.8} />
            )}
          </div>
          <span className="mobile-nav-label">More</span>
        </button>
      </nav>

      {/* ── NATIVE SLIDE-UP BOTTOM SHEET FOR "MORE" MENU ── */}
      {showMoreDrawer && (
        <div
          className="mobile-drawer-overlay"
          onClick={closeMoreDrawer}
          onTouchStart={(e) => {
            if (e.touches.length === 1) {
              drawerTouchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
          }}
          onTouchEnd={(e) => {
            if (!drawerTouchStartRef.current || e.changedTouches.length !== 1) return;
            const deltaX = e.changedTouches[0].clientX - drawerTouchStartRef.current.x;
            const deltaY = Math.abs(e.changedTouches[0].clientY - drawerTouchStartRef.current.y);
            drawerTouchStartRef.current = null;
            if (deltaX > 40 && deltaX > deltaY * 1.2) {
              closeMoreDrawer();
            }
          }}
        >
          <div
            className="mobile-drawer-sheet"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              if (e.touches.length === 1) {
                drawerTouchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
              }
            }}
            onTouchEnd={(e) => {
              if (!drawerTouchStartRef.current || e.changedTouches.length !== 1) return;
              const deltaX = e.changedTouches[0].clientX - drawerTouchStartRef.current.x;
              const deltaY = Math.abs(e.changedTouches[0].clientY - drawerTouchStartRef.current.y);
              drawerTouchStartRef.current = null;
              if (deltaX > 40 && deltaX > deltaY * 1.2) {
                closeMoreDrawer();
              }
            }}
          >
            {/* Grabber Handle */}
            <div className="mobile-drawer-handle" />

            {/* Header */}
            <div className="mobile-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Film size={18} color="var(--accent-contrast, #FFFFFF)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#FFFFFF' }}>
                    Cine<span style={{ color: 'var(--accent)' }}>Log</span> Menu
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {currentUser ? `Signed in as @${currentUser.username || 'user'}` : 'Guest Mode'}
                  </span>
                </div>
              </div>
              <button
                className="mobile-drawer-close-btn"
                onClick={closeMoreDrawer}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body - Scrollable Links */}
            <div className="mobile-drawer-body">
              <div className="mobile-drawer-grid">
                {secondaryTabs.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      className={`mobile-drawer-link ${isActive ? 'active' : ''}`}
                      onClick={() => handleTabClick(item.id)}
                    >
                      <div className="mobile-drawer-icon-box">
                        <Icon size={18} color={isActive ? 'var(--accent)' : '#FFFFFF'} />
                      </div>
                      <span className="mobile-drawer-text">{item.label}</span>
                      {item.badge && (
                        <span className="mobile-drawer-badge">{item.badge}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Account Controls Footer */}
              <div className="mobile-drawer-footer">
                {currentUser ? (
                  <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <button
                      className="btn btn-secondary mobile-action-btn"
                      onClick={() => { setShowMoreDrawer(false); onOpenSettings?.(); }}
                    >
                      <Settings size={15} /> Settings
                    </button>
                    <button
                      className="btn mobile-action-btn mobile-logout-btn"
                      onClick={() => { setShowMoreDrawer(false); onLogout?.(); }}
                    >
                      <LogOut size={15} /> Log Out
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary mobile-action-btn"
                    style={{ width: '100%' }}
                    onClick={() => { setShowMoreDrawer(false); onOpenAuth?.(); }}
                  >
                    Sign In / Register
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
