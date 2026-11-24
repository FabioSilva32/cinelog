import {useState,useRef} from 'react';
import {Check,ChevronDown} from 'lucide-react';
const choices=[['plan_to_watch','Watchlist'],['watching','Watching'],['watched','Watched'],['dropped','Dropped']];
export default function QuickStatus({movie,onChange}){
 const [pending,setPending]=useState(false),[error,setError]=useState('');const ref=useRef(null);
 return <details ref={ref} data-popover className="library-quick-status"><summary className="screening-status" data-status={movie.status||'plan_to_watch'} aria-label={`Change status for ${movie.title}`}>{choices.find(([id])=>id===(movie.status||'plan_to_watch'))?.[1]}<ChevronDown size={11}/></summary><div className="library-status-menu" role="group" aria-label="Viewing status">{choices.map(([id,label])=><button key={id} aria-label={label} disabled={pending} aria-pressed={movie.status===id} onClick={async()=>{if(id===movie.status){if(ref.current)ref.current.open=false;return;}setPending(true);setError('');try{await onChange(movie,id);if(ref.current)ref.current.open=false;}catch{setError('Could not save. Try again.');}finally{setPending(false);}}}>{label}{movie.status===id&&<Check size={13}/>}</button>)}{pending&&<small role="status">Saving…</small>}{error&&<small role="alert">{error}</small>}</div></details>;
}
