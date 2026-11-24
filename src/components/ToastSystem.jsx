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

function ToastItem({ toast, onDismiss }) {
  const [paused, setPaused] = useState(false);
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(() => {
    if (paused || busy || error) return;
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration ?? (toast.type === 'error' ? 8000 : 2400));
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, toast.type, onDismiss, paused,busy,error]);
  const Icon = ICONS[toast.type] || Info;
  return <div className="cine-notice" data-type={toast.type}
    onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
    onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
    <Icon className="cine-notice-icon" size={16} aria-hidden="true"/>
    <div className="cine-notice-copy" role={toast.type === 'error' ? 'alert' : 'status'} aria-atomic="true">
      {toast.title && <strong>{toast.title}</strong>}
      {toast.message && <span>{toast.message}</span>}
      {error&&<span role="alert">{error}</span>}
    </div>
    {toast.action&&<button className="cine-notice-action" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await toast.action.onClick();onDismiss(toast.id);}catch(e){setError(e.message||'Could not undo. Try again.');}finally{setBusy(false);}}}>{busy?'Saving…':toast.action.label}</button>}
    <button className="cine-notice-dismiss" aria-label="Dismiss notification" onClick={() => onDismiss(toast.id)}><X size={15}/></button>
  </div>;
}
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((opts) => {
    const id = Date.now() + Math.random();
    setToasts([{ id, type: 'info', ...opts }]);
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = Object.assign(
    (title, typeOrMsg = 'info') => {
      if (typeof typeOrMsg === 'string' && ['success', 'error', 'info', 'warning'].includes(typeOrMsg)) {
        return addToast({ type: typeOrMsg, title, message: '' });
      }
      return addToast({ type: 'info', title, message: typeOrMsg });
    },
    {
      success: (title, message, opts = {}) => addToast({ type: 'success', title, message, ...opts }),
      error: (title, message, opts = {}) => addToast({ type: 'error', title, message, ...opts }),
      info: (title, message, opts = {}) => addToast({ type: 'info', title, message, ...opts }),
      warning: (title, message, opts = {}) => addToast({ type: 'warning', title, message, ...opts }),
    }
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="cine-notices" aria-label="Notifications">
        {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={dismissToast}/>)}
      </div>
    </ToastContext.Provider>
  );
}
