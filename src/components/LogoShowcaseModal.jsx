import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Sparkles, SlidersHorizontal, Eye, Palette } from 'lucide-react';
import { ALL_CINELOG_LOGOS } from './CineLogLogos';

export default function LogoShowcaseModal({ show, onClose, activeLogoId, onSelectLogo }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewBg, setPreviewBg] = useState('dark'); // 'dark' | 'midnight' | 'crimson' | 'light'

  if (!show) return null;

  const categories = ['All', 'Geometric & Modern', 'Prestige & Editorial', 'Cyber & Sci-Fi', 'Symbolic & Narrative'];

  const filteredLogos = selectedCategory === 'All'
    ? ALL_CINELOG_LOGOS
    : ALL_CINELOG_LOGOS.filter(l => l.category === selectedCategory);

  const getCardBg = () => {
    switch (previewBg) {
      case 'midnight': return 'linear-gradient(145deg, #161226 0%, #0d0a17 100%)';
      case 'crimson': return 'linear-gradient(145deg, #2b0b0e 0%, #150607 100%)';
      case 'light': return '#f8fafc';
      case 'dark':
      default: return '#0c0a14';
    }
  };

  const getCardTextColor = () => previewBg === 'light' ? '#0f172a' : '#ffffff';

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, width: '100vw', height: '100vh',
        background: 'rgba(3,2,8,0.92)', backdropFilter: 'blur(24px)',
        zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="glass animate-fade-in-scale"
        style={{
          width: '96vw', maxWidth: '1440px', height: '90vh', maxHeight: '92vh',
          borderRadius: '26px', border: '1px solid rgba(255,255,255,0.14)',
          background: '#0d0b16', display: 'flex', flexDirection: 'column',
          boxShadow: '0 30px 90px rgba(0,0,0,0.95)', overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER BAR */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 30px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.02)', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'rgba(192,57,43,0.2)', border: '1px solid rgba(192,57,43,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Palette size={20} color="var(--accent)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '19px', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>
                  CineLog Brand Identity Suite
                </h2>
                <span style={{ fontSize: '11px', background: 'rgba(192,57,43,0.25)', color: 'var(--accent)', border: '1px solid rgba(192,57,43,0.45)', padding: '2px 9px', borderRadius: '12px', fontWeight: 900, textTransform: 'uppercase' }}>
                  20 Curated Versions
                </span>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Crafted with CineLog crimson (#c0392b), velvet black (#0d0b16), gold (#fbbf24) and cyan (#06b6d4). Click any logo to apply it live to the entire site!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ width: '38px', height: '38px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={19} />
          </button>
        </div>

        {/* CONTROLS BAR: CATEGORY FILTER + PREVIEW BACKGROUND TOGGLE */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 30px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.015)', flexWrap: 'wrap', gap: '12px', flexShrink: 0
        }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
                  fontWeight: selectedCategory === cat ? 800 : 600,
                  background: selectedCategory === cat ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                  color: selectedCategory === cat ? '#fff' : 'var(--text-dim)',
                  border: selectedCategory === cat ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer', transition: 'all 0.15s ease', whiteSpace: 'nowrap'
                }}
              >
                {cat} {cat === 'All' ? `(20)` : `(${ALL_CINELOG_LOGOS.filter(l => l.category === cat).length})`}
              </button>
            ))}
          </div>

          {/* Background Canvas Mode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontWeight: 700 }}>Preview Canvas:</span>
            {[
              { id: 'dark', label: 'Onyx Dark', bg: '#0c0a14' },
              { id: 'midnight', label: 'Midnight Blue', bg: '#161226' },
              { id: 'crimson', label: 'Velvet Red', bg: '#2b0b0e' },
              { id: 'light', label: 'Studio White', bg: '#f8fafc' }
            ].map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => setPreviewBg(b.id)}
                style={{
                  width: '24px', height: '24px', borderRadius: '50%', background: b.bg,
                  border: previewBg === b.id ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer', boxShadow: previewBg === b.id ? '0 0 10px var(--accent)' : 'none',
                  transition: 'all 0.15s'
                }}
                title={b.label}
              />
            ))}
          </div>
        </div>

        {/* 20 LOGO GRID (SCROLLABLE) */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '24px 30px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '18px'
        }}>
          {filteredLogos.map(logo => {
            const isEquipped = (activeLogoId || 'aperture-c') === logo.id;

            return (
              <div
                key={logo.id}
                onClick={() => onSelectLogo && onSelectLogo(logo.id)}
                style={{
                  background: getCardBg(),
                  borderRadius: '18px',
                  border: isEquipped ? '2.5px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: isEquipped ? '0 0 24px rgba(192,57,43,0.5)' : '0 6px 18px rgba(0,0,0,0.5)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease'
                }}
                onMouseEnter={e => {
                  if (!isEquipped) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isEquipped) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.transform = '';
                  }
                }}
              >
                {/* Header Tag & Concept Number */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: previewBg === 'light' ? '#64748b' : 'var(--text-dim)',
                    background: previewBg === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.04)',
                    padding: '2px 8px', borderRadius: '6px'
                  }}>
                    #{String(logo.number).padStart(2, '0')} • {logo.category}
                  </span>

                  {isEquipped && (
                    <span style={{
                      fontSize: '10px', background: 'var(--accent)', color: '#fff',
                      fontWeight: 900, padding: '2px 8px', borderRadius: '12px',
                      display: 'flex', alignItems: 'center', gap: '3px'
                    }}>
                      <Check size={11} /> ACTIVE
                    </span>
                  )}
                </div>

                {/* THE LOGO HERO CANVAS PREVIEW */}
                <div style={{
                  minHeight: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '14px 0',
                  gap: '12px',
                  borderBottom: previewBg === 'light' ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.06)',
                  borderTop: previewBg === 'light' ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.06)'
                }}>
                  <div>{logo.render(38)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: previewBg === 'light' ? '#64748b' : 'var(--text-dim)' }}>
                      Favicon Preview:
                    </span>
                    <div style={{ padding: '2px', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', display: 'flex', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {logo.renderIcon(22)}
                    </div>
                  </div>
                </div>

                {/* LOGO DETAILS & METADATA */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: getCardTextColor(), letterSpacing: '-0.3px' }}>
                      {logo.name}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, marginTop: '2px' }}>
                    "{logo.tagline}"
                  </div>
                  <p style={{
                    fontSize: '11.5px',
                    color: previewBg === 'light' ? '#475569' : 'rgba(255,255,255,0.65)',
                    lineHeight: 1.45,
                    margin: '6px 0 0 0'
                  }}>
                    {logo.desc}
                  </p>
                </div>

                {/* ACTION BUTTON */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectLogo) onSelectLogo(logo.id);
                  }}
                  style={{
                    width: '100%',
                    padding: '9px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: isEquipped ? 'var(--accent)' : previewBg === 'light' ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)',
                    color: isEquipped ? '#ffffff' : getCardTextColor(),
                    border: isEquipped ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isEquipped ? (
                    <>
                      <Check size={14} /> Currently Live on Site
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} color="var(--accent)" /> Apply This Logo
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* FOOTER BAR */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 30px', borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.02)', flexShrink: 0
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="var(--accent)" /> Click any logo card or "Apply This Logo" to test it instantly in the navbar and throughout the application.
          </span>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ padding: '8px 24px', fontSize: '13px', fontWeight: 800 }}
          >
            Done Browsing
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
