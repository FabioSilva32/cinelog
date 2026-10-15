import React, { useState, useRef, useCallback } from 'react';
import { X, Sparkles, Mail, User, Phone, FileText, Camera, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { MOCK_USERS } from '../mockData';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

// ── Simple Canvas-based Image Cropper ───────────────────────────────
function ImageCropper({ src, onCrop, onCancel }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [drag, setDrag] = useState(null);
  const [crop, setCrop] = useState({ x: 0.1, y: 0.1, size: 0.8 }); // normalized 0–1 relative to canvas

  const CANVAS_SIZE = 320;

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw image
    ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Overlay
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Clear crop circle
    const cx = crop.x * CANVAS_SIZE;
    const cy = crop.y * CANVAS_SIZE;
    const r = (crop.size * CANVAS_SIZE) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx + r, cy + r, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.restore();

    // Border circle
    ctx.beginPath();
    ctx.arc(cx + r, cy + r, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#880808';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [crop]);

  React.useEffect(() => {
    const img = new Image();
    img.onload = () => { imgRef.current = img; drawCanvas(); };
    img.src = src;
  }, [src, drawCanvas]);

  React.useEffect(() => { drawCanvas(); }, [crop, drawCanvas]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    const pos = getPos(e, canvasRef.current);
    const cx = crop.x * CANVAS_SIZE;
    const cy = crop.y * CANVAS_SIZE;
    const r = (crop.size * CANVAS_SIZE) / 2;
    // Check if inside circle
    if (Math.hypot(pos.x - (cx + r), pos.y - (cy + r)) < r) {
      setDrag({ startX: pos.x, startY: pos.y, startCropX: crop.x, startCropY: crop.y });
    }
  };

  const onMouseMove = (e) => {
    if (!drag) return;
    e.preventDefault();
    const pos = getPos(e, canvasRef.current);
    const r = (crop.size * CANVAS_SIZE) / 2;
    const dx = (pos.x - drag.startX) / CANVAS_SIZE;
    const dy = (pos.y - drag.startY) / CANVAS_SIZE;
    const newX = Math.max(0, Math.min(1 - crop.size, drag.startCropX + dx));
    const newY = Math.max(0, Math.min(1 - crop.size, drag.startCropY + dy));
    setCrop(prev => ({ ...prev, x: newX, y: newY }));
  };

  const onMouseUp = () => setDrag(null);

  const handleCrop = () => {
    const img = imgRef.current;
    if (!img) return;
    const output = document.createElement('canvas');
    output.width = 200;
    output.height = 200;
    const ctx = output.getContext('2d');

    // Round clip
    ctx.beginPath();
    ctx.arc(100, 100, 100, 0, Math.PI * 2);
    ctx.clip();

    const scaleX = img.naturalWidth / CANVAS_SIZE;
    const scaleY = img.naturalHeight / CANVAS_SIZE;
    const sx = crop.x * CANVAS_SIZE * scaleX;
    const sy = crop.y * CANVAS_SIZE * scaleY;
    const sSize = crop.size * CANVAS_SIZE * Math.min(scaleX, scaleY);
    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, 200, 200);
    onCrop(output.toDataURL('image/jpeg', 0.85));
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(8,7,11,0.92)',
      backdropFilter: 'blur(14px)', zIndex: 1200,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Crop Profile Photo</h3>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Drag the circle to reposition. The circular area will be your avatar.</p>

      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', cursor: drag ? 'grabbing' : 'grab', width: '320px', height: '320px' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      />

      {/* Size slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '320px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Zoom</span>
        <input
          type="range" min="0.2" max="1" step="0.01"
          value={crop.size}
          onChange={e => setCrop(prev => ({ ...prev, size: parseFloat(e.target.value), x: Math.min(prev.x, 1 - parseFloat(e.target.value)), y: Math.min(prev.y, 1 - parseFloat(e.target.value)) }))}
          style={{ flex: 1, accentColor: 'var(--accent)' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={handleCrop} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Check size={16} /> Use This Crop
        </button>
      </div>
    </div>
  );
}

const DEFAULT_AVATARS = [
  { id: 'cinephile', name: 'Cinephile', path: '/avatar_cinephile.png', border: '2px solid #c0392b' },
  { id: 'reviewer', name: 'Reviewer', path: '/avatar_reviewer.png', border: '2px solid #06b6d4' },
  { id: 'watcher', name: 'Watcher', path: '/avatar_watcher.png', border: '2px solid #0ea5e9' },
  { id: 'critic', name: 'Critic', path: '/avatar_critic.png', border: '2px solid #880808' }
];

// ── Required field label helper ──────────────────────────────────────
function FieldLabel({ children, required }) {
  return (
    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {children}
      {required && <span style={{ color: 'var(--red)', fontSize: '14px', lineHeight: 1 }}>*</span>}
    </label>
  );
}

// ── Main AuthModal ───────────────────────────────────────────────────
export default function AuthModal({ onClose, onLoginSuccess, useSupabase, setUseSupabase }) {
  useBodyScrollLock(true);
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCropper, setShowCropper] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarDataUrl, setAvatarDataUrl] = useState(null);

  const fileInputRef = useRef(null);

  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawImageSrc(ev.target.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropDone = (dataUrl) => {
    setAvatarDataUrl(dataUrl);
    setShowCropper(false);
    setRawImageSrc(null);
  };

  const handleLocalAuth = (cleanEmail, nameVal, dispName, userBio, avatarUrl) => {
    const users = JSON.parse(localStorage.getItem('cinelog_accounts_v1')) || MOCK_USERS;

    if (isLogin) {
      const found = users.find(u =>
        u.email?.toLowerCase() === cleanEmail ||
        u.username?.toLowerCase() === cleanEmail.split('@')[0]
      );
      if (found) {
        onLoginSuccess(found);
      } else {
        const newUser = {
          username: cleanEmail.split('@')[0],
          email: cleanEmail,
          displayName: cleanEmail.split('@')[0],
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          bio: '',
          favorites: [],
          followersCount: 0,
          followingCount: 0,
        };
        localStorage.setItem('cinelog_accounts_v1', JSON.stringify([...users, newUser]));
        onLoginSuccess(newUser);
      }
    } else {
      if (users.some(u => u.email?.toLowerCase() === cleanEmail)) {
        setError('An account with this email already exists.');
        return;
      }
      const derivedDisplay = dispName.trim() || nameVal.trim() || cleanEmail.split('@')[0];
      const newUser = {
        username: cleanEmail.split('@')[0],
        email: cleanEmail,
        fullName: nameVal.trim(),
        displayName: derivedDisplay,
        phone: phone.trim(),
        avatar: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        bio: userBio.trim() || 'CineLog movie tracking fan.',
        favorites: [],
        followersCount: 0,
        followingCount: 0,
      };
      localStorage.setItem('cinelog_accounts_v1', JSON.stringify([...users, newUser]));
      onLoginSuccess(newUser);
    }
  };

  const handleAuthError = (authError) => {
    const msg = authError?.message || String(authError);
    if (msg === 'Failed to fetch' || authError?.status === 0 || !authError?.status) {
      setError('Cannot connect to the database. DNS propagation may still be in progress, or Brave Shields/ad-blockers may be blocking the request.');
    } else {
      setError(msg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) { setError('Email address is required.'); return; }

    if (isForgotPassword) {
      if (useSupabase && isSupabaseConfigured) {
        try {
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
            redirectTo: window.location.origin
          });
          if (resetError) { handleAuthError(resetError); return; }
          setMessage('Reset link sent! Please check your email inbox.');
        } catch (err) {
          handleAuthError(err);
        }
      } else {
        setMessage('Mock password reset link sent to ' + cleanEmail);
      }
      return;
    }

    if (!isLogin && !fullName.trim()) { setError('Full name is required.'); return; }
    if (!password.trim()) { setError('Password is required.'); return; }

    const derivedDisplay = displayName.trim() || fullName.trim() || cleanEmail.split('@')[0];

    if (useSupabase && isSupabaseConfigured) {
      try {
        if (isLogin) {
          const { data, error: authError } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
          if (authError) { handleAuthError(authError); return; }
          if (data.user) {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
            onLoginSuccess({
              id: data.user.id,
              username: profile?.username || cleanEmail.split('@')[0],
              email: cleanEmail,
              displayName: profile?.display_name || derivedDisplay,
              avatar: profile?.avatar_url || avatarDataUrl,
              bio: profile?.bio || '',
              favorites: profile?.favorites || [],
              followersCount: 0,
              followingCount: 0,
            });
          }
        } else {
          const { data, error: authError } = await supabase.auth.signUp({ email: cleanEmail, password });
          if (authError) { handleAuthError(authError); return; }
          if (data.user) {
            await supabase.from('profiles').update({
              display_name: derivedDisplay,
              bio: bio.trim() || 'CineLog movie tracking fan.',
              avatar_url: avatarDataUrl,
            }).eq('id', data.user.id);
            onLoginSuccess({
              id: data.user.id,
              username: cleanEmail.split('@')[0],
              email: cleanEmail,
              fullName: fullName.trim(),
              displayName: derivedDisplay,
              phone: phone.trim(),
              avatar: avatarDataUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
              bio: bio.trim() || 'CineLog movie tracking fan.',
              favorites: [],
              followersCount: 0,
              followingCount: 0,
            });
          }
        }
      } catch (err) {
        handleAuthError(err);
      }
    } else {
      handleLocalAuth(cleanEmail, fullName, displayName, bio, avatarDataUrl);
    }
  };

  return (
    <>
      {/* Image Cropper overlay */}
      {showCropper && rawImageSrc && (
        <ImageCropper
          src={rawImageSrc}
          onCrop={handleCropDone}
          onCancel={() => { setShowCropper(false); setRawImageSrc(null); }}
        />
      )}

      {/* Modal overlay */}
      <div
        className="modal-backdrop"
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(8,7,11,0.85)', backdropFilter: 'blur(12px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
          overscrollBehavior: 'contain'
        }}
        onClick={e => e.target === e.currentTarget && onClose()}
        onWheel={e => e.stopPropagation()}
      >
        <div
          className="glass animate-fade-in"
          style={{
            width: '100%', maxWidth: '460px', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)', position: 'relative', padding: '32px',
            maxHeight: '92vh', overflowY: 'auto', overscrollBehavior: 'contain'
          }}
          onWheel={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            style={{ position: 'absolute', right: '18px', top: '18px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>

          {/* Title block */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(136,8,8,0.1)', borderRadius: '50%', color: 'var(--accent)', marginBottom: '12px' }}>
              <Sparkles size={24} />
            </div>
            <h2 style={{ fontSize: '22px' }}>
              {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome back to CineLog' : 'Create Your Account'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', lineHeight: 1.4 }}>
              {isForgotPassword
                ? 'Enter your email address and we will send you a recovery link.'
                : isLogin
                  ? 'Sign in to access your personal library and tier lists.'
                  : 'Build your cinematic profile and start tracking.'}
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--green)', borderRadius: '8px', padding: '10px 14px', fontSize: '12.5px', marginBottom: '16px', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Check size={16} style={{ marginTop: '1px', flexShrink: 0 }} />
              {message}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)', borderRadius: '8px', padding: '10px 14px', fontSize: '12.5px', marginBottom: '16px', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertCircle size={16} style={{ marginTop: '1px', flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          {/* Mandatory fields note */}
          {!isLogin && !isForgotPassword && (
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: 'var(--red)' }}>*</span> Required fields
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Profile image picker (register only) */}
            {!isLogin && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: '72px', height: '72px', borderRadius: '50%',
                      border: '2px dashed var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', overflow: 'hidden', flexShrink: 0, position: 'relative',
                      background: avatarDataUrl ? 'transparent' : 'rgba(136,8,8,0.08)',
                    }}
                  >
                    {avatarDataUrl ? (
                      <img src={avatarDataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Camera size={22} color="var(--accent)" />
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} style={{ display: 'none' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>Profile Photo</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                      {avatarDataUrl ? 'Photo selected ✓ Click to change' : 'Click to upload a photo'}
                    </div>
                    {avatarDataUrl && (
                      <button type="button" onClick={() => setAvatarDataUrl(null)} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '11px', cursor: 'pointer', marginTop: '2px', padding: 0 }}>
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>

                {/* Badge selector row */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '12.2px', color: 'var(--text-muted)', fontWeight: 650 }}>Or choose a premium theme badge:</div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {DEFAULT_AVATARS.map(item => (
                      <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => setAvatarDataUrl(item.path)}
                          style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            background: 'rgba(255,255,255,0.03)',
                            border: avatarDataUrl === item.path ? item.border : '2px solid transparent',
                            boxShadow: avatarDataUrl === item.path ? '0 0 10px rgba(136,8,8,0.4)' : 'none',
                            padding: 0,
                            transition: 'all 0.2s',
                            transform: avatarDataUrl === item.path ? 'scale(1.1)' : 'scale(1)'
                          }}
                          title={item.name}
                        >
                          <img src={item.path} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                        <span style={{ 
                          fontSize: '10px', 
                          fontWeight: 700, 
                          color: avatarDataUrl === item.path ? 'var(--accent)' : 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <FieldLabel required>Email Address</FieldLabel>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="form-input" style={{ width: '100%', paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            {!isForgotPassword && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <FieldLabel required>Password</FieldLabel>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder={isLogin ? 'Your password' : 'Create a password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    className="form-input" style={{ width: '100%', paddingRight: '44px' }}
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
                {isLogin && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(true); setError(''); setMessage(''); }}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '11.5px', cursor: 'pointer', fontWeight: 650, padding: 0 }}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Register-only fields */}
            {!isLogin && !isForgotPassword && (
              <>
                {/* Full Name */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <FieldLabel required>Full Name</FieldLabel>
                  <div style={{ position: 'relative' }}>
                    <User size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text" placeholder="Your full name"
                      value={fullName} onChange={e => setFullName(e.target.value)}
                      className="form-input" style={{ width: '100%', paddingLeft: '38px' }}
                    />
                  </div>
                </div>

                {/* Display Name */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <FieldLabel>Display Name <span style={{ color: 'var(--text-dim)', fontWeight: 400, fontSize: '11px' }}>(defaults to your full name)</span></FieldLabel>
                  <input
                    type="text" placeholder="e.g. ElenaVance99"
                    value={displayName} onChange={e => setDisplayName(e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* Phone */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <FieldLabel>Phone Number</FieldLabel>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="tel" placeholder="+1 555 000 0000"
                      value={phone} onChange={e => setPhone(e.target.value)}
                      className="form-input" style={{ width: '100%', paddingLeft: '38px' }}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <FieldLabel>About You</FieldLabel>
                  <div style={{ position: 'relative' }}>
                    <FileText size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '13px', top: '14px' }} />
                    <textarea
                      placeholder="What kind of movies do you love? Tell the community…"
                      value={bio} onChange={e => setBio(e.target.value)}
                      className="form-input"
                      style={{ width: '100%', minHeight: '70px', resize: 'vertical', paddingLeft: '38px' }}
                    />
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '46px', marginTop: '12px', fontSize: '15px' }}>
              {isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
            {isForgotPassword ? (
              <button onClick={() => { setIsForgotPassword(false); setError(''); setMessage(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
                Back to Sign In
              </button>
            ) : isLogin ? (
              <>New to CineLog?{' '}
                <button onClick={() => { setIsLogin(false); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
                  Create Account
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => { setIsLogin(true); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

