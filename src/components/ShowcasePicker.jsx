import {useState} from 'react';
import {createPortal} from 'react-dom';
import {X,Film} from 'lucide-react';
import {useDialogFocus} from '../hooks/useDialogFocus';
import {useBodyScrollLock} from '../hooks/useBodyScrollLock';
import {getMediaType} from '../utils/media';
export default function ShowcasePicker({library,favorites,slot,onSelect,onClose}){
 const [query,setQuery]=useState(''),[type,setType]=useState('all');const ref=useDialogFocus();useBodyScrollLock(true);
 const key=m=>getMediaType(m)+':'+String(m.tmdb_id||m.id);
 const chosen=new Set(favorites.filter((m,i)=>m&&i!==slot).map(key));
 const films=library.filter(m=>m.status==='watched'&&!chosen.has(key(m))&&(type==='all'||getMediaType(m)===type)&&(m.title||'').toLowerCase().includes(query.toLowerCase()));
 return createPortal(<div className="workspace-dialog-backdrop showcase-picker-backdrop" onClick={onClose} onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();onClose();}}}><section className="workspace-dialog showcase-picker" ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="showcase-title" onClick={e=>e.stopPropagation()}><header><div><h2 id="showcase-title">Choose favorite #{slot+1}</h2><p>Choose a watched title from your library.</p></div><button className="studio-icon-button" aria-label="Close film picker" onClick={onClose}><X size={20}/></button></header><div className="workspace-filters"><input autoFocus className="form-input" aria-label="Search watched titles" placeholder="Find a film, series or anime…" value={query} onChange={e=>setQuery(e.target.value)}/><select className="form-input" aria-label="Media type" value={type} onChange={e=>setType(e.target.value)}><option value="all">All titles</option><option value="movie">Movies</option><option value="tv">Series</option><option value="anime">Anime</option></select></div><div className="showcase-picker-results">{films.map(m=><button key={key(m)} onClick={()=>onSelect(m)}>{m.poster_path?<img src={m.poster_path.startsWith('http')?m.poster_path:'https://image.tmdb.org/t/p/w185'+m.poster_path} alt=""/>:<Film size={24}/>}<span><strong>{m.title}</strong><small>{m.release_year||m.year||'Year unknown'} · {getMediaType(m)==='tv'?'Series':getMediaType(m)==='anime'?'Anime':'Film'}</small></span></button>)}{!films.length&&<p role="status">No matching watched titles. Try another search or log a film first.</p>}</div></section></div>,document.body);
}
