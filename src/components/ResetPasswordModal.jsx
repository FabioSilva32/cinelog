import React, { useState, useEffect } from 'react';
import { X, Lock, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useToast } from './ToastSystem';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export default function ResetPasswordModal({ onClose }) {
  useBodyScrollLock(true);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error: resetErr } = await supabase.auth.updateUser({ password });
      if (resetErr) {
        setError(resetErr.message);
      } else {
        toast.show('Password successfully updated!', 'success');
        onClose();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(8,7,11,0.85)', backdropFilter: 'blur(12px)',
        zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        overscrollBehavior: 'contain'
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
      onWheel={e => e.stopPropagation()}
    >
      <div
        className="glass animate-fade-in"
        style={{
          width: '100%', maxWidth: '440px', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', position: 'relative', padding: '32px',
          overscrollBehavior: 'contain'
        }}
        onWheel={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', right: '18px', top: '18px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(136,8,8,0.1)', borderRadius: '50%', color: 'var(--accent)', marginBottom: '12px' }}>
            <Lock size={24} />
          </div>
          <h2 style={{ fontSize: '20px' }}>Create New Password</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Set a new password for your CineLog account.
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)', borderRadius: '8px', padding: '10px 14px', fontSize: '12.5px', marginBottom: '16px', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <AlertCircle size={16} style={{ marginTop: '1px', flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '13px' }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="form-input"
                style={{ width: '100%', paddingRight: '44px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '13px' }}>Confirm New Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="form-input"
              style={{ width: '100%' }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', height: '46px', fontSize: '14px', marginTop: '8px' }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

