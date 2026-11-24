import {createPortal} from 'react-dom';
import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,Film,RotateCcw,Star,X} from 'lucide-react';
import {useDialogFocus} from '../hooks/useDialogFocus';
import {useBodyScrollLock} from '../hooks/useBodyScrollLock';
import {getRatingColor} from '../utils/ratingColors';
import {quickRateQueue,hasPersonalRating} from '../utils/quickRate';
import {localDateKey} from '../utils/dates';

export default function QuickRateDialog({library=[],onSave,onClose,onOpenFilm}){
 const [snapshot,setSnapshot]=useState(()=>library),[mode,setMode]=useState('unrated'),[cursor,setCursor]=useState(0),[sheet,setSheet]=useState(false),[score,setScore]=useState(null),[date,setDate]=useState(''),[pending,setPending]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[last,setLast]=useState(null),[saved,setSaved]=useState(0),[offset,setOffset]=useState({x:0,y:0});
 const ref=useDialogFocus(true),busy=useRef(false),gesture=useRef(null),alive=useRef(true);
 useBodyScrollLock(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 const queue=useMemo(()=>quickRateQueue(snapshot,mode),[snapshot,mode]);
 const item=queue[cursor],current=item&&library.find(m=>m.id===item.id),changed=!!item&&(!current||hasPersonalRating(current)||current.status!==(mode==='watchlist'?'plan_to_watch':'watched'));
 const color=getRatingColor(score),remaining=Math.max(0,queue.length-cursor);
 const resetDraft=()=>{setSheet(false);setScore(null);setDate('');setError('');setOffset({x:0,y:0});gesture.current=null;};
 const rate=()=>{if(busy.current||!item||changed)return;resetDraft();setSheet(true);};
 const skip=()=>{if(busy.current||!item)return;resetDraft();setCursor(n=>n+1);setMessage('Skipped. Your library is unchanged.');};
 const close=()=>{if(!busy.current){alive.current=false;onClose();}};
 const save=async()=>{
  if(busy.current||score===null||!current||changed)return;busy.current=true;setPending(true);setError('');
  try{const receipt=await onSave(current.id,score,date);if(!receipt)throw Error('The rating could not be saved. Please retry.');if(!alive.current)return;setLast({receipt,index:cursor,mode,title:item.title,movie:current});setSaved(n=>n+1);resetDraft();setCursor(n=>n+1);setMessage('Saved '+item.title+' · '+Number(score).toFixed(1)+'/10.');}
  catch(e){if(alive.current)setError(e.message||'Could not save. Your score is still here; try again.');}
  finally{busy.current=false;if(alive.current)setPending(false);}
 };
 const undo=async()=>{
  if(busy.current||!last)return;busy.current=true;setPending(true);setError('');
  try{const restored=await onSave(last.receipt.id,null,'',last.receipt);if(!restored)throw Error('Undo could not be saved. Please retry.');if(!alive.current)return;const position=quickRateQueue(snapshot,last.mode).findIndex(m=>m.id===last.receipt.id);if(position<0)setSnapshot(items=>[last.movie,...items]);setMode(last.mode);setCursor(position<0?0:position);setSaved(n=>Math.max(0,n-1));resetDraft();setMessage('Undid the rating for '+last.title+'.');setLast(null);}
  catch(e){if(alive.current)setError(e.message||'Undo could not be saved. Please retry.');}
  finally{busy.current=false;if(alive.current)setPending(false);}
 };
 const changeMode=value=>{if(busy.current||mode===value)return;resetDraft();setMode(value);setCursor(0);setMessage('');};
 const down=e=>{if(sheet||busy.current||changed||e.button!==0||e.target.closest('button,a,input'))return;e.currentTarget.setPointerCapture(e.pointerId);gesture.current={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0};};
 const move=e=>{const g=gesture.current;if(!g||g.id!==e.pointerId)return;g.dx=e.clientX-g.x;g.dy=e.clientY-g.y;setOffset({x:g.dx,y:Math.max(-35,Math.min(35,g.dy))});};
 const up=e=>{const g=gesture.current;if(!g||g.id!==e.pointerId)return;gesture.current=null;setOffset({x:0,y:0});if(Math.abs(g.dx)<78||Math.abs(g.dx)<Math.abs(g.dy)*1.3)return;if(g.dx<0)skip();else rate();};
 const key=e=>{if(e.key==='Escape'){e.stopPropagation();e.preventDefault();if(busy.current)return;if(sheet)resetDraft();else close();return;}if(e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||busy.current||sheet)return;if(e.key==='ArrowLeft'){e.preventDefault();skip();}if(e.key==='ArrowRight'){e.preventDefault();rate();}};
 const poster=item?.poster_path&&(item.poster_path.startsWith('http')?item.poster_path:'https://image.tmdb.org/t/p/w342'+item.poster_path);
 return createPortal(<div className="quick-rate-backdrop" onClick={e=>{e.stopPropagation();if(e.target===e.currentTarget)close();}}><section ref={ref} className="quick-rate-dialog" role="dialog" aria-modal="true" aria-labelledby="quick-rate-title" tabIndex={-1} onKeyDown={key} aria-busy={pending}>
  <header><div><span className="studio-eyebrow">A FEW SCORES. A LITTLE MORE YOU.</span><h2 id="quick-rate-title">Quick rate</h2></div><button className="studio-icon-button" onClick={close} disabled={pending} aria-label="Close Quick rate"><X size={20}/></button></header>
  <nav className="quick-rate-modes" aria-label="Quick rate queue"><button aria-pressed={mode==='unrated'} disabled={pending} onClick={()=>changeMode('unrated')}>Watched, not rated <span>{quickRateQueue(snapshot).length}</span></button><button aria-pressed={mode==='watchlist'} disabled={pending} onClick={()=>changeMode('watchlist')}>Already seen these? <span>{quickRateQueue(snapshot,'watchlist').length}</span></button></nav>
  <div className="quick-rate-progress"><span>{remaining?remaining+' left to explore':'Queue complete'}</span><span>{saved} {saved===1?'rating':'ratings'} saved</span></div>
  <div className="quick-rate-stage" data-rating={sheet}>
   {item?<><div className="quick-rate-deck"><div className="quick-rate-card-shadow" aria-hidden="true"/><article className={'quick-rate-card'+(gesture.current?' is-dragging':'')} aria-label={item.title+' · swipe left to skip or right to rate'} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={()=>{gesture.current=null;setOffset({x:0,y:0});}} style={{transform:`translate(${offset.x}px,${offset.y}px) rotate(${Math.max(-14,Math.min(14,offset.x*.06))}deg)`}}>
    <span className="quick-rate-stamp" data-direction={offset.x<0?'skip':'rate'} style={{opacity:Math.min(1,Math.abs(offset.x)/90)}}>{offset.x<0?'SKIP':mode==='watchlist'?'SEEN IT':'RATE IT'}</span>
    {poster?<img src={poster} alt="" draggable="false"/>:<div className="quick-rate-no-poster"><Film size={48}/></div>}<div><h3>{item.title}</h3><p>{item.release_year||'Year unknown'} · {item.media_type==='tv'?'Series':item.media_type==='anime'?'Anime':'Film'}</p></div>
   </article></div>
   <section className="quick-rate-controls" aria-label="Rating controls">{sheet?<><span className="studio-eyebrow">{mode==='watchlist'?'YES, I’VE SEEN THIS':'HOW DID IT STAY WITH YOU?'}</span><h3>Your score.</h3><div className="quick-rate-score" style={{color}} aria-live="polite">{score===null?'—':Number(score).toFixed(1)}<small>{score===null?'Choose a score':'/ 10'}</small></div><div className="quick-rate-score-buttons" role="group" aria-label="Choose a rating">{Array.from({length:10},(_,i)=>i+1).map(n=><button key={n} type="button" aria-pressed={score===n} disabled={pending} style={{'--score-color':getRatingColor(n)}} onClick={()=>setScore(n)}>{n}</button>)}</div><label className="quick-rate-fine">Fine-tune your rating<input className="cinelog-rating-slider" type="range" min="0" max="10" step="0.1" aria-label="Quick rating" value={score??0} disabled={pending} onChange={e=>setScore(Number(e.target.value)||null)} style={{'--thumb-color':color,'--track-fill':`linear-gradient(to right, ${color} 0%, ${color} ${(score||0)*10}%, #454545 ${(score||0)*10}%, #454545 100%)`}}/></label>{mode==='watchlist'&&<label className="quick-rate-date">When did you watch it? <small>Optional · leave blank if unsure</small><input type="date" aria-label="Quick rate viewing date" max={localDateKey(new Date())} value={date} disabled={pending} onChange={e=>setDate(e.target.value)}/></label>}</>:<><span className="studio-eyebrow">ONE TITLE AT A TIME</span><h3>{mode==='unrated'?'Seen it. Now score it.':'Already watched this one?'}</h3><p>{mode==='unrated'?'Catch up on the films and series you’ve watched but haven’t rated.':'Go through your watchlist and log the titles you’ve already seen.'}</p><div className="quick-rate-instructions"><span><ArrowLeft size={17}/>Skip for now</span><span><ArrowRight size={17}/>Choose a rating</span></div><div className="quick-rate-actions"><button className="studio-secondary" onClick={skip} disabled={pending}><ArrowLeft size={17}/>Skip</button><button className="studio-primary" onClick={rate} disabled={pending||changed}>Rate it<Star size={16}/></button></div><button className="studio-text-button" disabled={pending||!current} onClick={()=>{if(current){close();onOpenFilm(current);}}}>View title details ↗</button><p className="quick-rate-reassurance">Skipping never removes a title. Swiping never saves a score on its own.</p></>}{changed&&<p role="alert" className="quick-rate-error">This title changed or was removed. Skip it or refresh the queue.</p>}</section></>:<div className="quick-rate-done"><Check size={34}/><h3>{queue.length?'That’s your queue.':'Nothing waiting here.'}</h3><p>{queue.length?'A little more of your taste, on record. Skipped titles remain in your library.':mode==='unrated'?'Your watched titles already have scores. Try your watchlist, or come back after your next film.':'No unrated watchlist titles to go through.'}</p><button className="studio-secondary" disabled={pending} onClick={()=>{resetDraft();setSnapshot(library);setCursor(0);}}>Refresh queue</button></div>}
  </div>
  <footer>{sheet&&(<div className="quick-rate-confirm"><button className="studio-secondary" disabled={pending} onClick={resetDraft}>Cancel</button><button className="studio-primary" disabled={pending||score===null||changed} onClick={save}>{pending?'Saving…':mode==='watchlist'?'Mark watched & save':'Save rating'}<Check size={16}/></button></div>)}<p role="status">{pending?'Saving to your account…':message||(sheet?'Your rating saves only when you confirm.':'Use a swipe, the buttons, or ← / → on your keyboard.')}</p>{last&&<button className="studio-secondary" disabled={pending} onClick={undo}><RotateCcw size={14}/>Undo last rating</button>}</footer>{error&&<div className="quick-rate-error" role="alert">{error}</div>}
 </section></div>,document.body);
}
