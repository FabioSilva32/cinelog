import { useEffect, useState } from 'react';
import { tmdbRequest } from '../utils/tmdbSearch';
import { tmdbMediaType } from '../utils/screeningDetails';
import { completeEpisode, episodeProgress } from '../utils/viewingHistory';
const episodeCache=new Map();

function ProgressCard({ movie, onOpen, onSave }) {
  const [episodes,setEpisodes]=useState([]),[loading,setLoading]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[retry,setRetry]=useState(0);
  const tv=tmdbMediaType(movie)==='tv';
  useEffect(()=>{if(!tv)return;const id=movie.tmdb_id||movie.id,cached=episodeCache.get(id);if(cached&&Date.now()-cached.time<600000&&!retry){setEpisodes(cached.episodes);return;}const controller=new AbortController();setLoading(true);setError('');(async()=>{
    const details=await tmdbRequest(`tv/${id}`,{},controller.signal);
    const seasons=(details.seasons||[]).filter(s=>s.season_number>0 && s.episode_count>0 && (!s.air_date||s.air_date<=new Date().toISOString().slice(0,10)));
    const rows=[];
    // Limit concurrent requests for long-running series; abort when leaving the page.
    for(let i=0;i<seasons.length;i+=3){const batch=await Promise.all(seasons.slice(i,i+3).map(s=>tmdbRequest(`tv/${id}/season/${s.season_number}`,{},controller.signal)));for(const s of batch)rows.push(...(s.episodes||[]));}
    if(episodeCache.size>60)episodeCache.delete(episodeCache.keys().next().value);
    episodeCache.set(id,{time:Date.now(),episodes:rows});setEpisodes(rows);
  })().catch(e=>{if(e.name!=='AbortError')setError('Progress unavailable. Retry');}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();},[movie.tmdb_id,movie.id,tv,retry]);
  const progress=episodeProgress(movie,episodes);
  useEffect(()=>{setError('');},[movie.episode_data]);
  const season=progress.next?.season_number||progress.aired.at(-1)?.season_number;
  const seasonProgress=episodeProgress(movie,episodes.filter(e=>e.season_number===season));
  const open=()=>onOpen(tv?{...movie,screening_start_section:'episodes',screening_start_season:season||1}:movie,tmdbMediaType(movie));
  const mark=async()=>{if(busy||!progress.next)return;setBusy(true);setError('');try{const ok=await onSave(completeEpisode(movie,progress.next),{statusOnly:true,requireCloudSuccess:true,silent:true});if(!ok)throw Error('Episode not saved. Try again.');}catch(e){setError(e.message);}finally{setBusy(false);}};
  return <article className="continue-card"><button className="continue-open" onClick={open}>{movie.poster_path&&<img src={movie.poster_path.startsWith('http')?movie.poster_path:`https://image.tmdb.org/t/p/w185${movie.poster_path}`} alt=""/>}<span><strong>{movie.title}</strong><small>{tv?loading?'Loading progress…':`${progress.completed} / ${progress.total} aired episodes`:'Resume your film'}</small>{tv&&<progress max={progress.total||1} value={progress.completed} aria-label={`${movie.title} episode progress`}/>}</span></button>{tv&&season&&<small>Season {season} · {seasonProgress.completed} / {seasonProgress.total} watched</small>}{tv&&progress.next&&<button className="studio-secondary" disabled={busy||loading} onClick={mark}>{busy?'Saving…':`✓ S${progress.next.season_number} E${progress.next.episode_number}`}<span className="sr-only"> — mark next episode watched</span></button>}{tv&&!loading&&!error&&!progress.next&&<small>{progress.total?'All aired episodes caught up':'No aired episodes yet'}</small>}{error&&<button className="studio-text-button" onClick={()=>setRetry(v=>v+1)}>{error}</button>}</article>;
}
export default function ContinueWatching({library,onMovieClick,onSaveMovie}){const [limit,setLimit]=useState(4);const rows=library.filter(m=>m.status==='watching');return rows.length?<section className="continue-section"><div className="v2-section-heading"><h2>Continue watching</h2><span>Pick up where you left off.</span></div><div className="continue-grid">{rows.slice(0,limit).map(m=><ProgressCard key={m.id} movie={m} onOpen={onMovieClick} onSave={onSaveMovie}/>)}</div>{rows.length>limit&&<button className="studio-text-button" onClick={()=>setLimit(n=>n+4)}>Show more in progress</button>}</section>:null;}
