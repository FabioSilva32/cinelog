import { CountrySelector } from './CountrySelector';
import { useCountry } from '../utils/useCountry';
import { useDialogFocus } from '../hooks/useDialogFocus';
import React, { useState, useEffect } from 'react';
import { X, Info, Database, Trash2, Palette } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

// ── THEMES & EXPORTS (Preserved for compatibility) ───────────────────
export const THEMES = [];
export function applyTheme() {}

// ── TRIVIA GAME ──────────────────────────────────────────────────────
// ── MAIN SETTINGSPANEL ────────────────────────────────────────────────
export default function SettingsPanel({ onClose, onNavigate }) {
  const dialogRef = useDialogFocus();
  const [country,setCountry]=useCountry();
  useBodyScrollLock(true);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [activeSection, setActiveSection] = useState('appearance');
  const [clearedMsg, setClearedMsg] = useState(false);

  const handleClearCache = () => {
    try {
      sessionStorage.clear();
      setClearedMsg(true);
      setTimeout(() => setClearedMsg(false), 2400);
    } catch (e) {}
  };

  const SECTIONS = [
    { id: 'appearance', label: 'Appearance & region', icon: Palette },
    { id: 'data', label: 'Storage & Cache', icon: Database },
    { id: 'about', label: 'About & System', icon: Info },
  ];

  return (
    <div
      className="modal-backdrop cine-backdrop"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overscrollBehavior: 'contain' }}
      onClick={e => e.target === e.currentTarget && onClose()}
      onWheel={e => e.stopPropagation()}
    >
      <div
        className="settings-panel-sheet cine-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-label="Preferences" tabIndex={-1}
        style={{
          width: '100%',
          maxWidth: '740px',
          maxHeight: '90vh',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          overflow: 'hidden',
          background: '#0d0d12',
          boxShadow: '0 24px 70px rgba(0,0,0,0.95)',
          overscrollBehavior: 'contain'
        }}
        onClick={e => e.stopPropagation()}
        onWheel={e => e.stopPropagation()}
      >
        {/* DESKTOP SIDEBAR / MOBILE TOP BAR */}
        <div className="settings-panel-sidebar" style={{ width: '200px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.08)', background: '#08080c', display: 'flex', flexDirection: 'column', padding: '16px 0' }}>
          <div style={{ padding: '0 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: '15px', color: '#fff', letterSpacing: '-0.2px' }}>Settings</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Preferences & System</div>
            </div>
          </div>

          <div className="settings-panel-nav-list" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`settings-nav-btn ${activeSection === id ? 'active' : ''}`}
                style={{
                  background: activeSection === id ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: 'none',
                  borderLeft: `3px solid ${activeSection === id ? 'var(--accent)' : 'transparent'}`,
                  color: activeSection === id ? '#FFFFFF' : 'var(--text-muted)',
                  padding: '11px 16px',
                  fontSize: '13px',
                  fontWeight: activeSection === id ? 800 : 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} color={activeSection === id ? 'var(--accent)' : 'currentColor'} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="settings-sidebar-close" style={{ marginTop: 'auto', padding: '16px' }}>
            <button className="btn btn-secondary" onClick={onClose} style={{ width: '100%', fontSize: '12.5px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <X size={14} /> Close
            </button>
          </div>
        </div>

        {/* CONTENT VIEW */}
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', overscrollBehavior: 'contain', padding: '24px', background: '#0e0e14' }}>
          
          {/* Mobile Header Bar */}
          <div className="settings-mobile-header" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#fff', margin: 0 }}>Settings</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>CineLog Sharp</span>
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost"
              style={{ width: '34px', height: '34px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>
          </div>

          {activeSection==='appearance'&&<section className="settings-preferences"><h3>Appearance & region</h3><p>CineLog uses black surfaces, ruby actions and colors for statuses and tier ranks.</p><div className="settings-theme-sample"><span className="studio-brand-mark">C</span><div><strong>CineLog ruby</strong><p>The same identity across your journal.</p></div></div><h3>Cinema & streaming country</h3><p>This controls regional release dates and streaming availability. Your choice is remembered on this device.</p><CountrySelector country={country} onChange={setCountry}/><h3>Your profile</h3><p>Change your cover, avatar and favorite films from your profile.</p><button className="studio-secondary" onClick={()=>{onClose();onNavigate?.('profile');}}>Open profile</button></section>}
          {/* ── DATA & STORAGE TAB ── */}
          {activeSection === 'data' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#fff', margin: '0 0 4px 0' }}>Cache & Storage</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', margin: 0 }}>Manage offline cached data and connection status.</p>
              </div>

              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Cloud Sync Status</span>
                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} /> Connected (Supabase)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>TMDB Cinema Database</span>
                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#fff' }}>Live v3 API</span>
                </div>
              </div>

              <div style={{ padding: '16px', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trash2 size={16} color="var(--red)" />
                  <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#fff' }}>Clear Session Search Cache</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0 }}>
                  Clears temporary cached search queries and poster previews from this session. Your library, reviews, and tier lists will NOT be deleted.
                </p>
                <div>
                  <button
                    onClick={handleClearCache}
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '8px 14px', borderRadius: '8px', marginTop: '4px' }}
                  >
                    {clearedMsg ? '✓ Cache Cleared!' : 'Clear Cache Now'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── ABOUT TAB ── */}
          {activeSection === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', marginBottom: '4px', fontWeight: 900, color: '#fff' }}>About CineLog</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', lineHeight: 1.5, margin: 0 }}>
                  CineLog is a cinema diary for tracking films, series, and anime. Rate, review, rank tier lists, and explore movies with a razor-sharp, high-contrast interface.
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  ['Version', '2.2.0 (Sharp Edition)'],
                  ['Platform', 'Android & Progressive Web'],
                  ['Data Source', 'The Movie Database (TMDB)'],
                  ['Storage Backend', 'Supabase Cloud Database'],
                  ['Design System', 'Pitch Black & Razor-Sharp Accents'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', padding: '4px 0' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
