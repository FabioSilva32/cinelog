import {useState} from 'react';
import QuickRateDialog from '../components/QuickRateDialog';
import {quickRatePayload,quickRateLocalPatch} from '../utils/quickRate';
const initial=[
 {id:'sample-one',title:'The Godfather',poster_path:'/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',release_year:'1972',media_type:'movie',status:'watched',rating:null,review:'An original review stays untouched.',episode_data:{watch_date:'2020-02-20',screenings:[{id:'past',date:'2020-02-20',rating:null,review:'Original viewing notes'}]}},
 {id:'sample-two',title:'Inception',poster_path:'/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',release_year:'2010',media_type:'movie',status:'watched',rating:null},
 {id:'sample-three',title:'Spirited Away',poster_path:'/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',release_year:'2001',media_type:'anime',status:'plan_to_watch',rating:null}
];
// Explicitly enabled only for this review build. All demo writes stay in memory.
export default function QuickRateDemo(){
 const [rows,setRows]=useState(()=>structuredClone(initial)),[open,setOpen]=useState(true),[reject,setReject]=useState(false),[writes,setWrites]=useState(0);
 const save=async(id,score,date,receipt)=>{
  await new Promise(resolve=>setTimeout(resolve,350));
  if(reject){setReject(false);throw Error('Sample save rejected. Your score is still here; please retry.');}
  const row=rows.find(m=>m.id===id),payload=receipt?receipt.before:quickRatePayload(row,score,date),raw={...row,...payload};
  if('review' in payload)delete raw.episode_data;
  setRows(list=>list.map(m=>m.id===id?{...m,...quickRateLocalPatch(raw,m)}:m));setWrites(n=>n+1);
  return {id,owner:'sample',before:Object.fromEntries(Object.keys(payload).map(k=>[k,row[k]??null])),after:payload};
 };
 if(new URLSearchParams(window.location.search).has('phone'))return <main className="quick-rate-phone-demo"><p>Phone layout · sample data only · <a href="/quick-rate-demo">Desktop view ↗</a></p><iframe title="Quick rate phone preview" src="/quick-rate-demo?embedded=1"/></main>;
 return <main className="quick-rate-demo"><header><span className="studio-eyebrow">CINELOG · INTERACTION PREVIEW</span><h1>Give Quick rate a spin.</h1><p>Sample films only. No sign-in needed. Nothing here changes your CineLog account.</p></header><div className="quick-rate-demo-tools"><button className="studio-primary" onClick={()=>setOpen(true)}>Open Quick rate</button><button className="studio-secondary" onClick={()=>{setReject(true);setOpen(true);}}>Try a failed save</button><button className="studio-secondary" onClick={()=>{setRows(structuredClone(initial));setWrites(0);setReject(false);setOpen(false);}}>Reset sample data</button><a href="/quick-rate-demo?phone=1">Phone layout ↗</a><a href="/library">Go to my library ↗</a></div><p role="status">Successful sample changes: {writes}</p><section aria-label="Sample library">{rows.map(row=><article key={row.id}><strong>{row.title}</strong><span>{row.status==='watched'?'Watched':'Watchlist'}</span><span>{row.rating==null?'Not rated':Number(row.rating).toFixed(1)+'/10'}</span>{row.review&&<p>{row.review}</p>}</article>)}</section>{open&&<QuickRateDialog library={rows} onSave={save} onClose={()=>setOpen(false)} onOpenFilm={()=>{}}/>}</main>;
}
