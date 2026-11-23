import {useMemo,useState} from 'react';
import ProfileCustomizerModal from './ProfileCustomizerModal';
import ShowcasePicker from './ShowcasePicker';
import {getProfileRewards} from '../utils/profileRewards';
export default function ProfileEditor({currentUser,library=[],onUpdateProfile,onClose,initialTab='info'}){
 const [favorites,setFavorites]=useState(()=>Array.from({length:6},(_,i)=>currentUser?.favorites?.[i]||null));
 const [slot,setSlot]=useState(null);const rewards=useMemo(()=>getProfileRewards(library,currentUser),[library,currentUser]);
 const rated=library.filter(m=>Number(m.rating)>0);const avgRating=rated.length?(rated.reduce((n,m)=>n+Number(m.rating),0)/rated.length).toFixed(1):null;
 const save=async details=>{const result=await onUpdateProfile({...details,favorites:favorites.filter(Boolean)});if(result?.saved===false)throw new Error(result.error);return result;};
 return <><ProfileCustomizerModal show currentUser={currentUser} library={library} onClose={onClose} onSave={save} watchedCount={library.filter(m=>m.status==='watched').length} avgRating={avgRating} {...rewards} favorites={favorites} setFavorites={setFavorites} onSelectSlot={setSlot} focusActive={slot===null} initialTab={initialTab}/>{slot!==null&&<ShowcasePicker slot={slot} library={library} favorites={favorites} onClose={()=>setSlot(null)} onSelect={movie=>{setFavorites(prev=>prev.map((m,i)=>i===slot?movie:m));setSlot(null);}}/>}</>;
}
