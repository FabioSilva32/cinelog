import React, { useState, useCallback, createContext, useContext, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, Zap } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: Zap,
};

const COLORS = {
  success: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', icon: '#10b981' },
  error: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', icon: '#ef4444' },
  info: { bg: 'rgba(124,111,247,0.1)', border: 'rgba(124,111,247,0.3)', icon: '#a78bfa' },
  warning: { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)', icon: '#fbbf24' },
};

function ToastItem({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false);
  const theme = COLORS[toast.type] || COLORS.info;
  const Icon = ICONS[toast.type] || Info;

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 320);
    }, toast.duration || 3500);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        background: 'rgba(10,8,19,0.97)', border: `1px solid ${theme.border}`,
        borderLeft: `3px solid ${theme.icon}`,
        borderRadius: '12px', padding: '12px 16px',
        backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        minWidth: '280px', maxWidth: '400px', cursor: 'pointer',
        animation: exiting ? 'toastExit 0.32s cubic-bezier(0.4,0,0.2,1) forwards' : 'toastEnter 0.3s cubic-bezier(0.4,0,0.2,1) forwards',
        background: theme.bg,
      }}
      onClick={() => { setExiting(true); setTimeout(() => onDismiss(toast.id), 320); }}
    >
      <Icon size={18} color={theme.icon} style={{ flexShrink: 0, marginTop: '1px' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text)', marginBottom: '2px' }}>
            {toast.title}
          </div>
        )}
        {toast.message && (
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {toast.message}
          </div>
        )}
      </div>
      <button
        onClick={e => { e.stopPropagation(); setExiting(true); setTimeout(() => onDismiss(toast.id), 320); }}
        style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px', flexShrink: 0, display: 'flex', transition: 'color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((opts) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type: 'info', ...opts }]);
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (title, message, opts = {}) => addToast({ type: 'success', title, message, ...opts }),
    error: (title, message, opts = {}) => addToast({ type: 'error', title, message, ...opts }),
    info: (title, message, opts = {}) => addToast({ type: 'info', title, message, ...opts }),
    warning: (title, message, opts = {}) => addToast({ type: 'warning', title, message, ...opts }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'all' }}>
            <ToastItem toast={t} onDismiss={dismissToast} />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastEnter {
          from { opacity: 0; transform: translateX(20px) scale(0.96); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toastExit {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to { opacity: 0; transform: translateX(20px) scale(0.96); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
