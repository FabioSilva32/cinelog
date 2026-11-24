import {X,Clapperboard} from 'lucide-react';
import {useDialogFocus} from '../hooks/useDialogFocus';
import {useBodyScrollLock} from '../hooks/useBodyScrollLock';
import SearchWorkspace from './SearchWorkspace';
export default function QuickLogDialog({onClose,...props}){
 const ref=useDialogFocus(true);useBodyScrollLock(true);
 return <div className="quick-log-backdrop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
  <section ref={ref} className="quick-log-dialog" role="dialog" aria-modal="true" aria-label="Log a film" aria-labelledby="quick-log-title" tabIndex={-1} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();onClose();}}}>
   <header className="quick-log-titlebar"><span className="quick-log-mark"><Clapperboard size={22}/></span><div><h2 id="quick-log-title">Log a film</h2><p>A quick entry in your film journal.</p></div><button className="quick-log-close" aria-label="Close quick log" onClick={onClose}><X size={18}/></button></header>
   <SearchWorkspace quick {...props}/>
  </section>
 </div>;
}
