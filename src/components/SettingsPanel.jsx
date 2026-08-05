import React, { useState, useEffect, useCallback } from 'react';
import { X, Palette, Gamepad2, Keyboard, Info, ChevronRight, Check, RefreshCw, Zap } from 'lucide-react';

// ── THEMES ────────────────────────────────────────────────────────────
const THEMES = [
  {
    id: 'default',
    name: 'Dark Violet',
    preview: ['#08070b', '#7c6ff7', '#10b981'],
    vars: {
      '--bg': '#08070b',
      '--surface': 'rgba(18,16,27,0.7)',
      '--surface-hover': 'rgba(26,24,40,0.85)',
      '--surface-solid': '#110f18',
      '--border': 'rgba(255,255,255,0.08)',
      '--border-focus': 'rgba(124,111,247,0.5)',
      '--text': '#f3f3f6',
      '--text-muted': '#9c9aae',
      '--text-dim': '#5c5970',
      '--accent': '#7c6ff7',
      '--accent-gradient': 'linear-gradient(135deg,#7c6ff7 0%,#b87cf8 100%)',
      '--accent-glow': 'rgba(124,111,247,0.35)',
      '--gold': '#fbbf24',
      '--green': '#10b981',
      '--red': '#ef4444',
      '--blue': '#3b82f6',
    }
  },
  {
    id: 'amoled',
    name: 'AMOLED Black',
    preview: ['#000000', '#a78bfa', '#34d399'],
    vars: {
      '--bg': '#000000',
      '--surface': 'rgba(8,8,8,0.9)',
      '--surface-hover': 'rgba(15,15,15,0.95)',
      '--surface-solid': '#080808',
      '--border': 'rgba(255,255,255,0.06)',
      '--border-focus': 'rgba(167,139,250,0.5)',
      '--text': '#ffffff',
      '--text-muted': '#888888',
      '--text-dim': '#444444',
      '--accent': '#a78bfa',
      '--accent-gradient': 'linear-gradient(135deg,#a78bfa 0%,#f472b6 100%)',
      '--accent-glow': 'rgba(167,139,250,0.3)',
      '--gold': '#fbbf24',
      '--green': '#34d399',
      '--red': '#f87171',
      '--blue': '#60a5fa',
    }
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    preview: ['#040d1e', '#3b82f6', '#06b6d4'],
    vars: {
      '--bg': '#040d1e',
      '--surface': 'rgba(6,20,50,0.7)',
      '--surface-hover': 'rgba(10,28,70,0.85)',
      '--surface-solid': '#060e25',
      '--border': 'rgba(59,130,246,0.15)',
      '--border-focus': 'rgba(59,130,246,0.5)',
      '--text': '#e8f0fe',
      '--text-muted': '#7b9ecc',
      '--text-dim': '#3a5a80',
      '--accent': '#3b82f6',
      '--accent-gradient': 'linear-gradient(135deg,#3b82f6 0%,#06b6d4 100%)',
      '--accent-glow': 'rgba(59,130,246,0.35)',
      '--gold': '#fbbf24',
      '--green': '#10b981',
      '--red': '#ef4444',
      '--blue': '#06b6d4',
    }
  },
  {
    id: 'forest',
    name: 'Forest Night',
    preview: ['#060f09', '#10b981', '#34d399'],
    vars: {
      '--bg': '#060f09',
      '--surface': 'rgba(10,25,15,0.75)',
      '--surface-hover': 'rgba(14,35,20,0.9)',
      '--surface-solid': '#081208',
      '--border': 'rgba(16,185,129,0.12)',
      '--border-focus': 'rgba(16,185,129,0.5)',
      '--text': '#e6f5ed',
      '--text-muted': '#6dab85',
      '--text-dim': '#2d5c3f',
      '--accent': '#10b981',
      '--accent-gradient': 'linear-gradient(135deg,#10b981 0%,#34d399 100%)',
      '--accent-glow': 'rgba(16,185,129,0.35)',
      '--gold': '#fbbf24',
      '--green': '#34d399',
      '--red': '#ef4444',
      '--blue': '#3b82f6',
    }
  },
  {
    id: 'rose',
    name: 'Rose Gold',
    preview: ['#0f0609', '#f43f5e', '#fb923c'],
    vars: {
      '--bg': '#0f0609',
      '--surface': 'rgba(25,10,15,0.75)',
      '--surface-hover': 'rgba(35,14,20,0.9)',
      '--surface-solid': '#13080b',
      '--border': 'rgba(244,63,94,0.12)',
      '--border-focus': 'rgba(244,63,94,0.5)',
      '--text': '#fdf2f4',
      '--text-muted': '#c47a8a',
      '--text-dim': '#6a2d3d',
      '--accent': '#f43f5e',
      '--accent-gradient': 'linear-gradient(135deg,#f43f5e 0%,#fb923c 100%)',
      '--accent-glow': 'rgba(244,63,94,0.35)',
      '--gold': '#fbbf24',
      '--green': '#10b981',
      '--red': '#fb7185',
      '--blue': '#818cf8',
    }
  },
  {
    id: 'light',
    name: 'Light Mode',
    preview: ['#f8f9fb', '#6366f1', '#0ea5e9'],
    vars: {
      '--bg': '#f0f2f7',
      '--surface': 'rgba(255,255,255,0.85)',
      '--surface-hover': 'rgba(255,255,255,0.95)',
      '--surface-solid': '#ffffff',
      '--border': 'rgba(0,0,0,0.1)',
      '--border-focus': 'rgba(99,102,241,0.5)',
      '--text': '#111827',
      '--text-muted': '#6b7280',
      '--text-dim': '#9ca3af',
      '--accent': '#6366f1',
      '--accent-gradient': 'linear-gradient(135deg,#6366f1 0%,#0ea5e9 100%)',
      '--accent-glow': 'rgba(99,102,241,0.25)',
      '--gold': '#d97706',
      '--green': '#059669',
      '--red': '#dc2626',
      '--blue': '#0ea5e9',
    }
  },
  {
    id: 'amber',
    name: 'Amber Night',
    preview: ['#0d0900', '#f59e0b', '#fbbf24'],
    vars: {
      '--bg': '#0d0900',
      '--surface': 'rgba(25,18,0,0.8)',
      '--surface-hover': 'rgba(35,25,0,0.9)',
      '--surface-solid': '#120c00',
      '--border': 'rgba(245,158,11,0.12)',
      '--border-focus': 'rgba(245,158,11,0.5)',
      '--text': '#fffbeb',
      '--text-muted': '#b8860b',
      '--text-dim': '#6b4c00',
      '--accent': '#f59e0b',
      '--accent-gradient': 'linear-gradient(135deg,#f59e0b 0%,#fbbf24 100%)',
      '--accent-glow': 'rgba(245,158,11,0.35)',
      '--gold': '#fbbf24',
      '--green': '#10b981',
      '--red': '#ef4444',
      '--blue': '#3b82f6',
    }
  },
];

function applyTheme(theme) {
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, val]) => root.style.setProperty(key, val));
  // Special: glass classes depend on --surface
  localStorage.setItem('cinelog_theme', theme.id);
}

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
  const isCorrect = selected === q?.a;

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
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>{score >= 6 ? '🏆' : score >= 4 ? '🎬' : '🍿'}</div>
      <div style={{ fontSize: '24px', fontWeight: 900, marginBottom: '6px' }}>{score}/{shuffled.length}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
        {score === shuffled.length ? 'Perfect score! You\'re a true cinephile.' : score >= 6 ? 'Great job! You really know your films.' : score >= 4 ? 'Not bad! Keep watching more movies.' : 'Time to watch more classics!'}
      </div>
      <button className="btn btn-primary" onClick={restart} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <RefreshCw size={14} /> Play Again
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
        <span>Question {qIdx + 1} of {shuffled.length}</span>
        <span style={{ color: 'var(--gold)', fontWeight: 700 }}>Score: {score}</span>
      </div>
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${((qIdx) / shuffled.length) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.4s' }} />
      </div>

      <div style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.4 }}>{q.question || q.q}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {(q.opts || []).map(opt => {
          let bg = 'rgba(255,255,255,0.04)';
          let border = 'var(--border)';
          let color = 'var(--text)';
          if (selected) {
            if (opt === q.a) { bg = 'rgba(16,185,129,0.15)'; border = 'rgba(16,185,129,0.5)'; color = 'var(--green)'; }
            else if (opt === selected) { bg = 'rgba(239,68,68,0.15)'; border = 'rgba(239,68,68,0.4)'; color = 'var(--red)'; }
          }
          return (
            <button key={opt} onClick={() => handleAnswer(opt)}
              style={{ background: bg, border: `1px solid ${border}`, color, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', fontWeight: 600, cursor: selected ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {selected && opt === q.a && <Check size={14} />}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main SettingsPanel ─────────────────────────────────────────────────
export default function SettingsPanel({ onClose }) {
  const [activeSection, setActiveSection] = useState('themes');
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('cinelog_theme') || 'default');

  const handleSelectTheme = (theme) => {
    setCurrentTheme(theme.id);
    applyTheme(theme);
  };

  const SECTIONS = [
    { id: 'themes',  label: 'Themes',         icon: '🎨' },
    { id: 'trivia',  label: 'Movie Trivia',    icon: '🎬' },
    { id: 'about',   label: 'About CineLog',   icon: 'ℹ️' },
  ];

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(8,7,11,0.85)', backdropFilter: 'blur(14px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="glass animate-fade-in"
        style={{ width: '100%', maxWidth: '720px', maxHeight: '88vh', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', overflow: 'hidden' }}
      >
        {/* Sidebar */}
        <div style={{ width: '180px', flexShrink: 0, borderRight: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', padding: '16px 0' }}>
          <div style={{ padding: '0 16px 16px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
            <div style={{ fontWeight: 900, fontSize: '16px' }}>Settings</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>CineLog preferences</div>
          </div>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              style={{ background: activeSection === s.id ? 'rgba(124,111,247,0.1)' : 'transparent', border: 'none', borderLeft: `2px solid ${activeSection === s.id ? 'var(--accent)' : 'transparent'}`, color: activeSection === s.id ? 'var(--accent)' : 'var(--text-muted)', padding: '10px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s' }}>
              <span>{s.icon}</span> {s.label}
            </button>
          ))}

          <div style={{ marginTop: 'auto', padding: '16px' }}>
            <button className="btn btn-secondary" onClick={onClose} style={{ width: '100%', fontSize: '12px', padding: '8px' }}>
              <X size={13} /> Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* ── THEMES ── */}
          {activeSection === 'themes' && (
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>🎨 Theme</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>Choose a color scheme for CineLog. Changes apply instantly.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' }}>
                {THEMES.map(theme => (
                  <div
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme)}
                    style={{
                      borderRadius: 'var(--radius)', border: `2px solid ${currentTheme === theme.id ? 'var(--accent)' : 'var(--border)'}`,
                      padding: '14px', cursor: 'pointer', transition: 'all 0.2s',
                      background: currentTheme === theme.id ? 'rgba(124,111,247,0.08)' : 'rgba(255,255,255,0.02)',
                    }}
                    onMouseEnter={e => { if (currentTheme !== theme.id) e.currentTarget.style.borderColor = 'rgba(124,111,247,0.4)'; }}
                    onMouseLeave={e => { if (currentTheme !== theme.id) e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    {/* Preview swatches */}
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                      {theme.preview.map((c, i) => (
                        <div key={i} style={{ width: '20px', height: '20px', borderRadius: '50%', background: c, border: '1px solid rgba(255,255,255,0.1)' }} />
                      ))}
                      {/* Mini bg preview */}
                      <div style={{ flex: 1, borderRadius: '4px', background: theme.vars['--bg'], border: `1px solid ${theme.vars['--border']}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: theme.vars['--accent'] }} />
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {theme.name}
                      {currentTheme === theme.id && <Check size={14} color="var(--accent)" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TRIVIA ── */}
          {activeSection === 'trivia' && (
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>🎬 Movie Trivia</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>Test your film knowledge! 8 random questions per round.</p>
              <div className="glass" style={{ borderRadius: 'var(--radius)', padding: '20px' }}>
                <TriviaGame />
              </div>
            </div>
          )}

          {/* ── ABOUT ── */}
          {activeSection === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '2px' }}>ℹ️ About CineLog</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6 }}>
                CineLog is your personal cinema diary. Track every movie, series, and anime you've ever watched. Rate them, review them, build tier lists, and visualize your viewing history as a star constellation.
              </p>
              <div className="glass" style={{ borderRadius: 'var(--radius)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  ['Version', '2.0.0'],
                  ['Data Source', 'The Movie Database (TMDB)'],
                  ['Storage', 'Supabase + Local Storage'],
                  ['Built with', 'React + Vite'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>

              <div className="glass" style={{ borderRadius: 'var(--radius)', padding: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>⌨️ Keyboard Shortcuts</div>
                {[
                  ['Esc', 'Close modal / panel'],
                  ['Enter (search)', 'Submit search query'],
                  ['Click star in constellation', 'Open movie details'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px', color: 'var(--accent)', fontSize: '11px' }}>{k}</code>
                    <span style={{ color: 'var(--text-muted)' }}>{v}</span>
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

// Export the applyTheme and THEMES so App can initialize the theme on load
export { applyTheme, THEMES };
