import { useState } from 'react';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { screeningsFor,updateScreenings } from '../utils/viewingHistory';
import { localDateKey } from '../utils/dates';
import { useToast } from './ToastSystem';
export default function DiaryEditor({entry,onSave,onClose}){
 const movie=entry.sourceMovie||entry,rows=screeningsFor(movie),existing=rows.find(s=>s.id===entry.screeningId);
 const [date,setDate]=useState(existing?.date?.slice(0,10)||localDateKey(new Date())),[rating,setRating]=useState(existing?.rating??''),[review,setReview]=useState(existing?.review??''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const toast=useToast(),ref=useDialogFocus(true);useBodyScrollLock(true);
 const save=async(remove=false)=>{if(busy)return;setBusy(true);setError('');try{
   if(!date||date>localDateKey(new Date()))throw Error('Choose a viewing date up to today.');
   const record={...existing,id:existing?.id||crypto.randomUUID(),date,rating:rating===''?null:Number(rating),review,is_rewatch:existing?.is_rewatch??rows.length>0,created_at:existing?.created_at||new Date().toISOString()};
   const next=remove?rows.filter(s=>s.id!==existing.id):[record,...rows.filter(s=>s.id!==record.id)];
   const ok=await onSave(updateScreenings(movie,next),{statusOnly:true,requireCloudSuccess:true,silent:true});if(!ok)throw Error('Your diary could not be saved.');
   if(remove)toast.info('Diary entry removed','Your library title is still saved.',{duration:10000,action:{label:'Undo',onClick:async()=>{const restored=await onSave(movie,{statusOnly:true,requireCloudSuccess:true,silent:true});if(!restored)throw Error('Could not restore the entry. Try again.');}}});
   onClose();
 }catch(e){setError(e.message);}finally{setBusy(false);}};
 return <div className="viewing-dialog-backdrop" onClick={e=>{if(e.target===e.currentTarget&&!busy)onClose();}}><section ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="diary-edit-title" className="viewing-dialog" onKeyDown={e=>{if(e.key==='Escape'&&!busy)onClose();}}><header><div><span className="studio-eyebrow">YOUR WATCH DIARY</span><h2 id="diary-edit-title">{existing?'Edit screening':'Log a rewatch'}</h2><p>{movie.title}</p></div><button className="studio-secondary" aria-label="Close diary editor" disabled={busy} onClick={onClose}>×</button></header><label>Watched on<input type="date" value={date} max={localDateKey(new Date())} onChange={e=>setDate(e.target.value)}/></label><label>Your rating · optional<input type="number" min="0" max="10" step="0.1" value={rating} onChange={e=>setRating(e.target.value)}/></label><label>Notes for this screening<textarea value={review} onChange={e=>setReview(e.target.value)} rows={5}/></label>{error&&<p role="alert">{error}</p>}<footer>{existing&&<button className="studio-text-button" disabled={busy} onClick={()=>save(true)}>Remove entry</button>}<button className="studio-primary" disabled={busy||Number(rating)<0||Number(rating)>10} onClick={()=>save()}>{busy?'Saving…':'Save screening'}</button></footer></section></div>;
}
