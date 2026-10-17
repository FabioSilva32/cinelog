import React, { useState, useEffect } from 'react';
import { X, Gamepad2, Info, Check, RefreshCw, Database, Sparkles, Smartphone, Trash2, Palette } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { SHARP_SOLID_COMBOS } from '../utils/themePresets';

// ── THEMES & EXPORTS (Preserved for compatibility) ───────────────────
export const THEMES = [];
export function applyTheme() {}

// ── TRIVIA GAME ──────────────────────────────────────────────────────
const TRIVIA = [
  { q: 'Which film won the first Academy Award for Best Picture?', a: 'Wings', opts: ['Wings', 'The Jazz Singer', 'Sunrise', 'Ben-Hur'] },
  { q: 'Who directed "Schindler\'s List" (1993)?', a: 'Steven Spielberg', opts: ['Stanley Kubrick', 'Martin Scorsese', 'Steven Spielberg', 'Francis Ford Coppola'] },
  { q: 'Which movie features the quote "I\'ll be back"?', a: 'The Terminator', opts: ['Predator', 'RoboCop', 'The Terminator', 'Die Hard'] },
  { q: 'How many Oscars did "Titanic" (1997) win?', a: '11', opts: ['8', '9', '11', '13'] },
  { q: 'Which Studio Ghibli film features a character named Chihiro?', a: 'Spirited Away', opts: ['My Neighbor Totoro', 'Spirited Away', 'Howl\'s Moving Castle', 'Princess Mononoke'] },
  { q: 'What year was "The Godfather" released?', a: '1972', opts: ['1969', '1972', '1974', '1976'] },
  { q: 'Who played Iron Man in the Marvel Cinematic Universe?', a: 'Robert Downey Jr.', opts: ['Chris Evans', 'Robert Downey Jr.', 'Chris Hemsworth', 'Mark Ruffalo'] },
  { q: '"Parasite" is a film from which country?', a: 'South Korea', opts: ['Japan', 'China', 'South Korea', 'Taiwan'] },
  { q: 'Which film has the tagline "In space, no one can hear you scream"?', a: 'Alien', opts: ['2001: A Space Odyssey', 'Event Horizon', 'Alien', 'Gravity'] },
  { q: 'Who directed "Pulp Fiction" (1994)?', a: 'Quentin Tarantino', opts: ['David Fincher', 'Quentin Tarantino', 'Joel Coen', 'Paul Thomas Anderson'] },
  { q: 'What is the name of the fictional African country in "Black Panther"?', a: 'Wakanda', opts: ['Zamunda', 'Genosha', 'Wakanda', 'Latveria'] },
  { q: 'In "The Matrix," what colour pill does Neo choose?', a: 'Red', opts: ['Blue', 'Red', 'Green', 'White'] },
  { q: 'Which Pixar film features the voice of Tom Hanks as a cowboy toy?', a: 'Toy Story', opts: ['Toy Story', 'Cars', 'A Bug\'s Life', 'Finding Nemo'] },
  { q: 'How many films are in the original Star Wars trilogy?', a: '3', opts: ['3', '4', '6', '9'] },
  { q: '"Blade Runner 2049" is a sequel to a film from which decade?', a: '1980s', opts: ['1970s', '1980s', '1990s', '2000s'] },
];

function TriviaGame() {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [shuffled, setShuffled] = useState(() => [...TRIVIA].sort(() => Math.random() - 0.5).slice(0, 8));

  const q = shuffled[qIdx];

  const handleAnswer = (opt) => {
    if (selected) return;
    setSelected(opt);
    if (opt === q.a) setScore(s => s + 1);
    setTimeout(() => {
      if (qIdx + 1 >= shuffled.length) { setDone(true); }
      else { setQIdx(i => i + 1); setSelected(null); }
    }, 1200);
  };

  const restart = () => {
    setShuffled([...TRIVIA].sort(() => Math.random() - 0.5).slice(0, 8));
    setQIdx(0); setSelected(null); setScore(0); setDone(false);
  };

  if (done) return (
    <div style={{ textAlign: 'center', padding: '24px 16px' }}>
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>{score >= 6 ? '🏆' : score >= 4 ? '🎬' : '🍿'}</div>
      <div style={{ fontSize: '24px', fontWeight: 900, marginBottom: '6px', color: '#fff' }}>{score}/{shuffled.length}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
        {score === shuffled.length ? 'Perfect score! You\'re a true cinephile.' : score >= 6 ? 'Great job! You really know your films.' : score >= 4 ? 'Not bad! Keep watching more movies.' : 'Time to watch more classics!'}
      </div>
      <button className="btn btn-primary" onClick={restart} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}>
        <RefreshCw size={14} /> Play Again
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
        <span>Question {qIdx + 1} of {shuffled.length}</span>
        <span style={{ color: 'var(--gold)', fontWeight: 800 }}>Score: {score}</span>
      </div>
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${((qIdx) / shuffled.length) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.4s' }} />
      </div>

      <div style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.4, color: '#fff', marginTop: '4px' }}>{q.question || q.q}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
        {(q.opts || []).map(opt => {
          let bg = 'rgba(255,255,255,0.04)';
          let border = 'var(--border)';
          let color = '#fff';
          if (selected) {
            if (opt === q.a) { bg = 'rgba(16,185,129,0.18)'; border = 'rgba(16,185,129,0.55)'; color = 'var(--green)'; }
            else if (opt === selected) { bg = 'rgba(239,68,68,0.18)'; border = 'rgba(239,68,68,0.45)'; color = 'var(--red)'; }
          }
          return (
            <button key={opt} onClick={() => handleAnswer(opt)}
              style={{ background: bg, border: `1px solid ${border}`, color, borderRadius: '10px', padding: '11px 14px', fontSize: '13.5px', fontWeight: 600, cursor: selected ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {selected && opt === q.a && <Check size={14} color="var(--green)" />}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── MAIN SETTINGSPANEL ────────────────────────────────────────────────
export default function SettingsPanel({ onClose }) {
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
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('cinelog_active_combo') || 'crimson');
  const [clearedMsg, setClearedMsg] = useState(false);

  const handleSelectTheme = (combo) => {
    setActiveTheme(combo.id);
    localStorage.setItem('cinelog_active_combo', combo.id);
    window.dispatchEvent(new CustomEvent('cinelog-theme-change', { detail: { id: combo.id } }));
  };

  const handleClearCache = () => {
    try {
      sessionStorage.clear();
      setClearedMsg(true);
      setTimeout(() => setClearedMsg(false), 2400);
    } catch (e) {}
  };

  const SECTIONS = [
    { id: 'appearance', label: 'Color Accent', icon: Palette },
    { id: 'data', label: 'Storage & Cache', icon: Database },
    { id: 'trivia', label: 'Movie Trivia', icon: Gamepad2 },
    { id: 'about', label: 'About & System', icon: Info },
  ];

  return (
    <div
      className="modal-backdrop"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overscrollBehavior: 'contain' }}
      onClick={e => e.target === e.currentTarget && onClose()}
      onWheel={e => e.stopPropagation()}
    >
      <div
        className="settings-panel-sheet glass animate-fade-in"
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

          {/* ── APPEARANCE & THEME TAB ── */}
          {activeSection === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#fff', margin: '0 0 4px 0' }}>Color Accent</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', margin: 0 }}>
                  Personalize buttons, badges, glowing borders, and the quick add button across CineLog.
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {SHARP_SOLID_COMBOS.map(combo => {
                  const isSelected = activeTheme === combo.id;
                  return (
                    <button
                      key={combo.id}
                      type="button"
                      onClick={() => handleSelectTheme(combo)}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '14px',
                        background: isSelected ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                        border: isSelected ? `2px solid ${combo.accent}` : '1px solid rgba(255,255,255,0.08)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? `0 4px 16px rgba(${combo.rgb || '229,9,20'}, 0.25)` : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          background: combo.accent,
                          border: combo.id === 'monochrome' ? '1px solid rgba(255,255,255,0.3)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: `0 2px 8px rgba(${combo.rgb || '229,9,20'}, 0.4)`
                        }}>
                          {isSelected && (
                            <Check size={16} color={combo.contrast || '#ffffff'} strokeWidth={3} />
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#fff' }}>
                            {combo.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {combo.hex}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 900,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: combo.accent,
                          color: combo.contrast || '#ffffff',
                          textTransform: 'uppercase'
                        }}>
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Live Preview Sample */}
              <div style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                marginTop: '6px'
              }}>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                  Live Component Preview
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '12.5px', fontWeight: 800 }}>
                    Primary Button
                  </button>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'var(--accent)',
                    color: 'var(--accent-contrast, #ffffff)',
                    fontSize: '11px',
                    fontWeight: 800
                  }}>
                    Active Badge
                  </span>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    color: 'var(--accent-contrast, #ffffff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 400
                  }}>
                    +
                  </div>
                </div>
              </div>
            </div>
          )}

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

          {/* ── TRIVIA TAB ── */}
          {activeSection === 'trivia' && (
            <div>
              <h3 style={{ fontSize: '17px', marginBottom: '4px', fontWeight: 900, color: '#fff' }}>Movie Trivia</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', marginBottom: '16px' }}>Test your cinema knowledge. 8 random questions per round.</p>
              <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px' }}>
                <TriviaGame />
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
