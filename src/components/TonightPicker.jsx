import React from 'react';
import {Shuffle,ArrowUpRight,Film} from 'lucide-react';
import {mediaLabel} from '../utils/mediaLabel';
const MOODS = [
  { id: 'watchlist', label: '⏳ From Watchlist', filter: m => m.status === 'plan_to_watch' },
  { id: 'chill', label: '😌 Chill Night', filter: m => m.genres && (m.genres.includes('Comedy') || m.genres.includes('Animation') || m.genres.includes('Romance')) },
  { id: 'excited', label: '💥 Action Packed', filter: m => m.genres && (m.genres.includes('Action') || m.genres.includes('Thriller')) },
  { id: 'scared', label: '👻 Scare Me', filter: m => m.genres && m.genres.includes('Horror') },
  { id: 'smart', label: '🧠 Brainy', filter: m => m.genres && (m.genres.includes('Sci-Fi') || m.genres.includes('Mystery') || m.genres.includes('Drama')) },
  { id: 'romantic', label: '💖 Romance', filter: m => m.genres && m.genres.includes('Romance') },
  { id: 'adventure', label: '🗺️ Adventure', filter: m => m.genres && m.genres.includes('Adventure') },
  { id: 'favorites', label: '❤️ Re-watch Fav', filter: m => (m.favorite || m.is_favorite) && m.status === 'watched' },
  { id: 'unwatched', label: '🎯 Hidden in Library', filter: m => m.status === 'plan_to_watch' && m.rating == null },
  { id: 'any', label: '🎲 Anything!', filter: () => true },
];


export default function TonightPicker({library=[],onMovieClick}){
 const [mood,setMood]=React.useState('watchlist'),[pick,setPick]=React.useState(null);
 const pool=library.filter(MOODS.find(m=>m.id===mood).filter);
 return <div className="tonight-workspace"><div className="tonight-moods"><span className="studio-eyebrow">SET THE SCENE</span><h3>What are you in the mood for?</h3><div role="group" aria-label="Choose a viewing mood">{MOODS.map(m=><button key={m.id} aria-pressed={mood===m.id} onClick={()=>{setMood(m.id);setPick(null);}}>{m.label.replace(/^[^A-Za-z]+/,'')}</button>)}</div><footer><span>{pool.length} {pool.length===1?'title':'titles'} in the running</span><button className="studio-primary" disabled={!pool.length} onClick={()=>{const options=pool.length>1?pool.filter(m=>m!==pick):pool;setPick(options[Math.floor(Math.random()*options.length)]);}}><Shuffle size={16}/>{pick?'Pick another':'Find my film'}</button></footer></div><div className="tonight-result" aria-live="polite">{pick?<><span className="studio-eyebrow">YOUR EVENING, SORTED</span><button className="tonight-result-film" onClick={()=>onMovieClick?.(pick.tmdb_id||pick.id,pick.media_type||(pick.first_air_date?'tv':'movie'))}>{pick.poster_path?<img src={pick.poster_path.startsWith('http')?pick.poster_path:'https://image.tmdb.org/t/p/w342'+pick.poster_path} alt=""/>:<Film size={42}/>}<span><h3>{pick.title}</h3><small>{[pick.release_year,mediaLabel(pick)].filter(Boolean).join(' · ')}</small><p>{pick.overview?.slice(0,180)||'Your next story is waiting. Open the film to take a closer look.'}</p><strong>View film <ArrowUpRight size={15}/></strong></span></button></>:<><Shuffle size={32}/><h3>{pool.length?'Let a good film find you.':'A little more to choose from.'}</h3><p>{pool.length?'Choose a mood and we’ll draw a title from your collection.':library.length?'Try another mood, or add more titles to your watchlist.':'Build your watchlist, then come back for a surprise.'}</p></>}</div></div>;
}
