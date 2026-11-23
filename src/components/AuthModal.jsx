import {avatarCropRect} from '../utils/avatarCrop';
import { useDialogFocus } from '../hooks/useDialogFocus';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Film, Check, AlertCircle, Eye, EyeOff, ArrowUpRight } from 'lucide-react';
import {submitAccount} from '../utils/accountAuth';
import {SIGNATURE_AVATARS} from '../utils/profileCatalog';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

// ── Simple Canvas-based Image Cropper ───────────────────────────────
function ImageCropper({ src, onCrop, onCancel }) {
  const cropRef=useDialogFocus();
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
    const source=avatarCropRect(img.naturalWidth,img.naturalHeight);
    ctx.drawImage(img,source.x,source.y,source.size,source.size,0,0,CANVAS_SIZE,CANVAS_SIZE);

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
    ctx.drawImage(img,source.x,source.y,source.size,source.size,0,0,CANVAS_SIZE,CANVAS_SIZE);
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

    const source=avatarCropRect(img.naturalWidth,img.naturalHeight,crop);
    ctx.drawImage(img,source.x,source.y,source.size,source.size,0,0,200,200);
    onCrop(output.toDataURL('image/jpeg', 0.85));
  };

  return (
    <div className="cine-backdrop cine-cropper" ref={cropRef} role="dialog" aria-modal="true" aria-label="Crop profile photo" tabIndex={-1} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();onCancel();}}} style={{
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
        onTouchStart={onMouseDown} onTouchMove={onMouseMove} onTouchEnd={onMouseUp}
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


export default function AuthModal({onClose,onLoginSuccess}){
 useBodyScrollLock(true);
 const [mode,setMode]=useState('login'),[showPass,setShowPass]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[pending,setPending]=useState(false);
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState(''),[phone,setPhone]=useState(''),[bio,setBio]=useState(''),[avatar,setAvatar]=useState(SIGNATURE_AVATARS[0].url),[cropSource,setCropSource]=useState(null);
 const busy=useRef(false),dialogRef=useDialogFocus(!cropSource);
 const close=useCallback(()=>{if(!busy.current&&!cropSource)onClose?.();},[onClose,cropSource]);
 useEffect(()=>{const escape=e=>{if(e.key==='Escape'&&!cropSource){e.preventDefault();close();}};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[close,cropSource]);
 const changeMode=value=>{if(busy.current)return;setMode(value);setError('');setMessage('');setPassword('');};
 const submit=async e=>{e.preventDefault();if(busy.current)return;setError('');setMessage('');if(!isSupabaseConfigured){setError('Account services are unavailable. Please try again later.');return;}if(mode==='signup'&&!name.trim()){setError('Enter your display name.');return;}busy.current=true;setPending(true);try{const result=await submitAccount(supabase,{mode,email,password,redirectTo:window.location.origin,profile:{display_name:name.trim(),full_name:name.trim(),phone:phone.trim(),bio:bio.trim(),avatar_url:avatar}});if(result.user)onLoginSuccess(result.user);else setMessage(result.message);}catch(err){setError(err.message==='Failed to fetch'?'We could not connect. Check your connection and try again.':err.message||'Account request failed. Please try again.');}finally{busy.current=false;setPending(false);}};
 const upload=event=>{const file=event.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/')||file.size>5*1024*1024){setError('Choose an image smaller than 5 MB.');return;}const reader=new FileReader();reader.onload=()=>setCropSource(reader.result);reader.readAsDataURL(file);};
 return <>{cropSource&&<ImageCropper src={cropSource} onCrop={value=>{setAvatar(value);setCropSource(null);}} onCancel={()=>setCropSource(null)}/>}
 <div className="cine-backdrop account-backdrop" onClick={e=>{if(e.target===e.currentTarget)close();}}><section className="cine-dialog account-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="account-title" tabIndex={-1} inert={cropSource?true:undefined}>
 <header className="account-heading"><span className="account-brand"><Film size={20}/> CINELOG <i>/ YOUR FILM JOURNAL</i></span><button className="account-close" aria-label="Close account dialog" disabled={pending} onClick={close}><X size={20}/></button></header>
 <div className="account-body"><span className="account-eyebrow">{mode==='reset'?'BACK TO YOUR JOURNAL':mode==='signup'?'YOUR NEXT CHAPTER':'TAKE YOUR SEAT'}</span><h2 id="account-title">{mode==='reset'?'A fresh start.':mode==='signup'?'Make it your cinema.':'Good to see you again.'}</h2><p>{mode==='reset'?'We’ll email you a link to reset your password.':mode==='signup'?'Collect your favorites, share your perspective, and find your people.':'Your films, lists, and conversations are waiting.'}</p>
 {mode!=='reset'&&<div className="account-tabs"><button disabled={pending} aria-pressed={mode==='login'} onClick={()=>changeMode('login')}>Sign in</button><button disabled={pending} aria-pressed={mode==='signup'} onClick={()=>changeMode('signup')}>Create account</button></div>}
 {error&&<p role="alert" className="account-alert"><AlertCircle size={17}/>{error}</p>}{message&&<p role="status" className="account-notice"><Check size={17}/>{message}</p>}
 <form onSubmit={submit} aria-busy={pending}><fieldset disabled={pending}>
 {mode==='signup'&&<label>Display name<input required maxLength={80} autoComplete="nickname" value={name} onChange={e=>setName(e.target.value)} placeholder="How should we call you?"/></label>}
 <label>Email address<input required type="email" autoComplete="email" inputMode="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
 {mode!=='reset'&&<label>Password<span className="account-password"><input required type={showPass?'text':'password'} minLength={mode==='signup'?6:undefined} autoComplete={mode==='signup'?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode==='signup'?'At least 6 characters':'Your password'}/><button type="button" aria-label={showPass?'Hide password':'Show password'} aria-pressed={showPass} onClick={()=>setShowPass(v=>!v)}>{showPass?<EyeOff size={18}/>:<Eye size={18}/>}</button></span></label>}
 {mode==='login'&&<button className="account-text" type="button" onClick={()=>changeMode('reset')}>Forgot password?</button>}
 {mode==='signup'&&<details className="account-options"><summary>Add a photo and a little about you <span>Optional</span></summary><div className="account-avatar-options">{SIGNATURE_AVATARS.slice(0,6).map(item=><button key={item.id} type="button" aria-label={'Choose '+item.name} aria-pressed={avatar===item.url} onClick={()=>setAvatar(item.url)}><img src={item.url} alt=""/></button>)}</div><label className="account-upload">Upload a photo<input type="file" accept="image/*" onChange={upload}/></label>{avatar.startsWith('data:')&&<img className="account-upload-preview" src={avatar} alt="Selected profile photo"/>}<label>About you<textarea maxLength={500} rows={3} value={bio} onChange={e=>setBio(e.target.value)}/></label><label>Phone number <small>Optional</small><input type="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)}/></label></details>}
 <button type="submit" className="studio-primary account-submit" disabled={!isSupabaseConfigured||pending}>{pending?'Please wait…':mode==='reset'?'Send recovery link':mode==='signup'?'Create account':'Sign in'}<ArrowUpRight size={17}/></button>
 </fieldset></form>
 {mode==='reset'&&<button disabled={pending} className="account-text" onClick={()=>changeMode('login')}>Back to sign in</button>}
 <footer>Your account stays in sync across your devices.</footer></div></section></div></>;
}
