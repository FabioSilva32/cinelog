import {useDialogFocus} from '../hooks/useDialogFocus';
import React, { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export default function ImportModal({ onClose, onImport }) {
  useBodyScrollLock(true);

  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileRef = useRef(null);
  const dialogRef=useDialogFocus();

  const handleFile = (e) => {
    if (isImporting) return;
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        let data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) data = data.movies || data.library || data.entries || data.list || [];
        if (!Array.isArray(data) || data.length === 0) { setError('No valid entries found.'); return; }
        const normalized = data.map((item, i) => {
          const rawStatus = String(item.status || '').toLowerCase().trim();
          let status = 'plan_to_watch';
          if (rawStatus === 'watched' || rawStatus === 'completed' || rawStatus === 'completed_watching') {
            status = 'watched';
          } else if (rawStatus === 'plan_to_watch' || rawStatus === 'want_to_watch' || rawStatus === 'planned' || rawStatus === 'watchlist') {
            status = 'plan_to_watch';
          } else if (rawStatus === 'watching' || rawStatus === 'currently_watching') {
            status = 'watching';
          } else if (rawStatus === 'dropped') {
            status = 'dropped';
          } else if (item.watched) {
            status = 'watched';
          }

          return {
            ...item,
            id: item.id || item.tmdb_id || `import-${Date.now()}-${i}`,
            tmdb_id: item.tmdb_id || item.id || null,
            media_type: item.media_type || item.type || 'movie',
            title: item.title || item.name || 'Unknown',
            poster_path: item.poster_path || null,
            release_year: item.release_year || item.year || (item.release_date || '').slice(0,4) || '—',
            genres: Array.isArray(item.genres) ? item.genres : (item.genre ? [item.genre] : []),
            status,
            rating: item.rating || item.score || null,
            review: item.review || item.notes || '',
            favorite: item.favorite || item.starred || false,
            date_added: item.date_added || new Date().toISOString(),
            tags: item.tags || [],
          };
        });
        setPreview(normalized);
      } catch { setError('Invalid JSON file.'); }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="modal-backdrop cine-backdrop" onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(!isImporting)onClose();}}}
      style={{ position: 'fixed', inset: 0, background: 'rgba(8,7,11,0.9)', backdropFilter: 'blur(12px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', overscrollBehavior: 'contain' }}
      onClick={e => e.target === e.currentTarget && !isImporting && onClose()}
      onWheel={e => e.stopPropagation()}
    >
      <div
        className="cine-dialog cine-import" ref={dialogRef} role="dialog" aria-modal="true" aria-label="Import library" tabIndex={-1}
        style={{ width: '100%', maxWidth: '520px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '28px', position: 'relative', overscrollBehavior: 'contain' }}
        onWheel={e => e.stopPropagation()}
      >
        <button aria-label="Close import" disabled={isImporting} onClick={onClose} style={{ position: 'absolute', right: '18px', top: '18px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: isImporting ? 'not-allowed' : 'pointer' }}><X size={20} /></button>
        <h3 style={{ fontSize: '20px', marginBottom: '6px' }}>Import from JSON</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>Supports CineLog, Letterboxd exports, or any JSON with title/status fields.</p>
        <div role="button" tabIndex={isImporting?-1:0} aria-label="Choose a JSON library file" aria-disabled={isImporting} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!isImporting)fileRef.current?.click();}}} onClick={() => !isImporting && fileRef.current?.click()} style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: '28px', textAlign: 'center', cursor: isImporting ? 'not-allowed' : 'pointer', marginBottom: '14px', opacity: isImporting ? 0.6 : 1 }}
          onMouseEnter={e => { if (!isImporting) e.currentTarget.style.borderColor = 'var(--accent)'; }}
          onMouseLeave={e => { if (!isImporting) e.currentTarget.style.borderColor = 'var(--border)'; }}>
          <Upload size={26} color="var(--accent)" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontWeight: 700, fontSize: '13px' }}>{isImporting ? 'Database upload in progress...' : 'Click to choose a .json file'}</div>
          <input ref={fileRef} type="file" accept=".json" onChange={handleFile} style={{ display: 'none' }} disabled={isImporting} />
        </div>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)', borderRadius: '8px', padding: '10px', fontSize: '12px', marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}><AlertCircle size={15}/>{error}</div>}
        {preview && (
          <>
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: 'var(--green)', borderRadius: '8px', padding: '10px', fontSize: '12px', marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Check size={15} /> Found <strong>{preview.length}</strong> entries ready to import.
            </div>
            <div style={{ maxHeight: '160px', overflowY: 'auto', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {preview.slice(0, 15).map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', padding: '6px 10px' }}>
                  <span style={{ flex: 1, fontSize: '12px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{m.release_year}</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: m.status === 'watched' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)', color: m.status === 'watched' ? 'var(--green)' : 'var(--blue)' }}>
                    {m.status === 'watched' ? 'Watched' : 'List'}
                  </span>
                </div>
              ))}
              {preview.length > 15 && <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>…and {preview.length - 15} more</div>}
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              disabled={isImporting}
              onClick={async () => {
                setIsImporting(true);
                setError('');
                try {
                  const success = await onImport(preview);
                  if (success) {
                    onClose();
                  } else {
                    setError('Import could not be completed. Please review the result before trying again.');
                    setIsImporting(false);
                  }
                } catch (err) {
                  setError('Import failed: ' + (err.message || err));
                  setIsImporting(false);
                }
              }}
            >
              {isImporting ? '⏳ Importing Titles...' : <><Upload size={15}/> Import {preview.length} Titles</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Library Column (Deluxe 3-Column Studio) ─────────────────────────
