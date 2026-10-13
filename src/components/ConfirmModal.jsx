import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = true
}) {
  // Listen for Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(4,3,8,0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '20px',
        paddingTop: '12vh'
      }}
    >
      <div
        className="glass animate-fade-in-scale"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '400px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          background: '#0d0b18',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header Icon */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: isDanger ? 'rgba(239,68,68,0.1)' : 'rgba(136,8,8,0.1)',
            border: isDanger ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(136,8,8,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: isDanger ? 'var(--red)' : 'var(--accent)'
          }}
        >
          {isDanger ? <Trash2 size={22} /> : <AlertTriangle size={22} />}
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>
          {title}
        </h3>

        {/* Message */}
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 24px 0' }}>
          {message}
        </p>

        {/* Buttons Row */}
        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <button
            onClick={onCancel}
            className="btn btn-ghost"
            style={{ flex: 1, padding: '10px 16px', fontSize: '13px', fontWeight: 700 }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              if (onCancel) onCancel();
            }}
            className="btn"
            style={{
              flex: 1,
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 700,
              background: isDanger ? 'var(--red)' : 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

