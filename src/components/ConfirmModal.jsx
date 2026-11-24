import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useDialogFocus } from '../hooks/useDialogFocus';
export default function ConfirmModal({isOpen,title='Are you sure?',message,item,confirmText='Confirm',cancelText='Keep it',onConfirm,onCancel,isDanger=true}) {
  const [pending,setPending]=useState(false), [error,setError]=useState('');
  const ref=useDialogFocus(isOpen);
  useBodyScrollLock(isOpen);
  useEffect(()=>{if(isOpen){setPending(false);setError('');}},[isOpen]);
  if(!isOpen) return null;
  const cancel=()=>{if(!pending) onCancel?.();};
  const confirm=async()=>{setPending(true);setError('');try{const result=await onConfirm?.();if(result!==false)onCancel?.();else setError('The change could not be saved. Please try again.');}catch(e){setError(e.message || 'Please try again.');}finally{setPending(false);}};
  const poster=item?.poster_path;
  return createPortal(<div className="screening-dialog-backdrop cine-backdrop cine-confirm-backdrop" onClick={cancel}><section className="screening-confirm cine-dialog cine-confirm" role="alertdialog" data-pending={pending} aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message" tabIndex={-1} ref={ref} onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();cancel();}}}>
    <button className="screening-dialog-close" aria-label="Close confirmation" disabled={pending} onClick={cancel}><X size={20}/></button><div className="screening-confirm-icon">{isDanger?<Trash2 size={26}/>:<AlertTriangle size={26}/>}</div><span className="studio-eyebrow">CONFIRM CHANGE</span><h2 id="confirm-title">{title}</h2>
    {item&&<div className="screening-confirm-title">{poster&&<img src={poster.startsWith('http')?poster:`https://image.tmdb.org/t/p/w154${poster}`} alt=""/>}<div><strong>{item.title}</strong><span>{[item.release_year,item.media_type?item.media_type==='tv'?'Series':'Film':null].filter(Boolean).join(' · ')}</span></div></div>}
    <p id="confirm-message">{message}</p>{error&&<p role="alert" className="screening-error">{error}</p>}<footer><button className="studio-secondary" disabled={pending} onClick={cancel}>{cancelText}</button><button className="studio-primary" disabled={pending} onClick={confirm}>{pending?'Please wait…':confirmText}</button></footer>
  </section></div>,document.body);
}
