import React, { useState, useEffect, useCallback } from 'react';
import { X, Palette, Gamepad2, Keyboard, Info, ChevronRight, Check, RefreshCw, Zap } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

// ── THEMES ────────────────────────────────────────────────────────────
// CineLog is permanently styled with the Razor-Sharp Crimson & Pitch Black theme.
const THEMES = [];
function applyTheme() {}

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
  useBodyScrollLock(true);

  // Close panel on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [activeSection, setActiveSection] = useState('trivia');

  const SECTIONS = [
    { id: 'trivia', label: 'Movie Trivia',  icon: Gamepad2 },
    { id: 'about',  label: 'About CineLog', icon: Info },
  ];

  return (
    <div
      className="modal-backdrop"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', overscrollBehavior: 'contain' }}
      onClick={e => e.target === e.currentTarget && onClose()}
      onWheel={e => e.stopPropagation()}
    >
      <div
        className="glass animate-fade-in"
        style={{ width: '100%', maxWidth: '700px', maxHeight: '88vh', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', overflow: 'hidden', background: '#121212', overscrollBehavior: 'contain' }}
        onWheel={e => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div style={{ width: '190px', flexShrink: 0, borderRight: '1px solid var(--border)', background: '#0D0D0D', display: 'flex', flexDirection: 'column', padding: '16px 0' }}>
          <div style={{ padding: '0 16px 16px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
            <div style={{ fontWeight: 900, fontSize: '15px', color: '#fff' }}>Preferences</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>CineLog App</div>
          </div>
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveSection(id)}
              style={{ background: activeSection === id ? '#1A1A1A' : 'transparent', border: 'none', borderLeft: `2px solid ${activeSection === id ? 'var(--accent)' : 'transparent'}`, color: activeSection === id ? '#FFFFFF' : 'var(--text-muted)', padding: '10px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s' }}>
              <Icon size={14} color={activeSection === id ? 'var(--accent)' : 'currentColor'} />
              <span>{label}</span>
            </button>
          ))}

          <div style={{ marginTop: 'auto', padding: '16px' }}>
            <button className="btn btn-secondary" onClick={onClose} style={{ width: '100%', fontSize: '12px', padding: '8px' }}>
              <X size={13} /> Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: '24px', background: '#121212' }}>

          {/* ── TRIVIA ── */}
          {activeSection === 'trivia' && (
            <div>
              <h3 style={{ fontSize: '17px', marginBottom: '4px', fontWeight: 800 }}>Movie Trivia</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '18px' }}>Test your cinema knowledge. 8 random questions per round.</p>
              <div style={{ background: '#161616', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px' }}>
                <TriviaGame />
              </div>
            </div>
          )}

          {/* ── ABOUT ── */}
          {activeSection === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '17px', marginBottom: '2px', fontWeight: 800 }}>About CineLog</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6 }}>
                CineLog is a cinema diary for tracking films, series, and anime. Rate, review, rank tier lists, and explore movies with a razor-sharp, high-contrast interface.
              </p>
              <div style={{ background: '#161616', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  ['Version', '2.1.0 (Sharp Edition)'],
                  ['Data Source', 'The Movie Database (TMDB)'],
                  ['Storage', 'Supabase Cloud Database'],
                  ['Stack', 'React, Vite'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
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

export { applyTheme, THEMES };

