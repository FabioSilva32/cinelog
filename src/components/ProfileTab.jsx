import ProfileExtras from './ProfileExtras';
import ProfileEditor from './ProfileEditor';
import { supabase } from '../supabaseClient';
import ListDetailModal from './ListDetailModal';

import PublicProfilePage from './PublicProfilePage';
import { useState,useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import StatsTab from './StatsTab';
import WatchCalendarTab from './WatchCalendarTab';
import WrappedTab from './WrappedTab';
import AchievementsTab from './AchievementsTab';
import ConstellationTab from './ConstellationTab';
import ProfileJournal from './ProfileJournal';
export { DEFAULT_AVATARS, PRESET_BANNERS } from './ProfileLegacy';
export default function ProfileTab(props) {
  const [editing,setEditing] = useState(null),[lists,setLists]=useState([]),[selected,setSelected]=useState(null),[listError,setListError]=useState(''),[pinnedLists,setPinnedLists]=useState(props.currentUser?.pinned_list_ids||[]),[pinBusy,setPinBusy]=useState(false),[pinAvailable,setPinAvailable]=useState(false);
  useEffect(()=>{let live=true;setLists([]);setListError('');if(!props.currentUser?.id||props.targetUser)return;
   supabase.from('custom_lists').select('*').eq('user_id',props.currentUser.id).order('created_at',{ascending:false}).then(({data,error})=>{if(live&&error)setListError('Your lists could not be loaded. Please refresh to retry.');if(live&&!error)setLists((data||[]).map(l=>({...l,isRanked:l.is_ranked,isPublic:l.is_public,author:l.author_info,createdAt:l.created_at})));}).catch(()=>{if(live)setListError('Your lists could not be loaded. Please refresh to retry.');});return()=>{live=false;};
  },[props.currentUser?.id,props.currentUser?.username,props.targetUser]);
  useEffect(()=>{let live=true;setPinnedLists([]);setPinAvailable(false);if(props.currentUser?.id&&!props.targetUser)supabase.from('profiles').select('pinned_list_ids').eq('id',props.currentUser.id).maybeSingle().then(({data,error})=>{if(!live)return;if(error){setListError(['42703','PGRST204'].includes(error.code)?'Profile pinning is not available yet.':'Profile pins could not be loaded. Please refresh to retry.');return;}setPinAvailable(true);setPinnedLists(data?.pinned_list_ids||[]);}).catch(()=>{if(live)setListError('Profile pins could not be loaded. Please refresh to retry.');});return()=>{live=false;};},[props.currentUser?.id,props.targetUser]);
  const pin=async list=>{if(pinBusy||!pinAvailable)return;setListError('');const id=String(list.id),next=pinnedLists.includes(id)?pinnedLists.filter(p=>p!==id):[...pinnedLists,id];if(next.length>3){setListError('Choose up to three public lists to pin.');return;}setPinBusy(true);try{const result=await supabase.from('profiles').update({pinned_list_ids:next}).eq('id',props.currentUser.id).select('id').maybeSingle();if(result.error||!result.data)throw Error('Your profile pins could not be saved. Please try again.');setPinnedLists(next);}catch(e){setListError(e.message);}finally{setPinBusy(false);}};
  if(props.initialSubTab==='shop'&&!props.targetUser)return <ProfileExtras {...props}/>;
  if (props.targetUser) return <PublicProfilePage {...props}/>;
  const tools={stats:StatsTab,calendar:WatchCalendarTab,diary:WatchCalendarTab,wrapped:WrappedTab,achievements:AchievementsTab,constellation:ConstellationTab};
  const Tool=tools[props.initialSubTab];
  if(Tool)return <section className="cine-profile-tool"><button className="studio-text-button" onClick={()=>props.onSubTabChange?.('overview')}><ArrowLeft size={16}/>Back to your journal</button><Tool {...props}/></section>;
  return <>{editing&&<ProfileEditor {...props} initialTab={editing} onClose={()=>setEditing(null)}/>}<ProfileJournal onOpenUserProfile={props.onOpenUserProfile} onPinList={pinAvailable?pin:undefined} pinnedLists={pinnedLists} key={props.initialSubTab||'overview'} initialTab={props.initialSubTab==='reviews'?'reviews':props.initialSubTab==='watchlist'?'watchlist':'journal'} listError={listError} lists={lists} onOpenList={list=>props.onOpenListPage?props.onOpenListPage(list):setSelected(list)} currentUser={props.currentUser} library={props.library} onMovieClick={props.onMovieClick} onEdit={section=>setEditing(section||'info')} onPreviewProfile={()=>props.onOpenUserProfile?.(props.currentUser)}/>{selected&&<ListDetailModal backLabel="Back to profile" list={selected} currentUser={props.currentUser} onClose={()=>setSelected(null)} onMovieClick={props.onMovieClick} onOpenUserProfile={props.onOpenUserProfile}/>}</>;
}
