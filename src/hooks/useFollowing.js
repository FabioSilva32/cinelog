import { useState,useEffect,useRef } from 'react';
import { supabase } from '../supabaseClient';
import { DEMO_USER_ID,isUUID,followingKey,persistFollow } from '../utils/following';
function read(id){try{return new Set(JSON.parse(localStorage.getItem(followingKey(id))||'[]').filter(target=>id===DEMO_USER_ID||target!==DEMO_USER_ID));}catch{return new Set();}}
export function useFollowing(user){
 const [following,setFollowing]=useState(()=>read(user?.id)),[pending,setPending]=useState(null),[error,setError]=useState('');const version=useRef(0),busy=useRef(false);
 useEffect(()=>{
  let live=true;const id=user?.id;setFollowing(read(id));setError('');
  const change=e=>{if(e.detail?.userId===id){version.current++;setFollowing(read(id));}};window.addEventListener('cinelog:following-changed',change);
  const v=version.current;
  if(isUUID(id)&&id!==DEMO_USER_ID)supabase.from('follows').select('following_id').eq('follower_id',id).then(({data,error})=>{if(!live||v!==version.current)return;if(error){setError('Could not refresh following. Try again shortly.');return;}const ids=new Set((data||[]).map(r=>r.following_id).filter(target=>target!==id));try{localStorage.setItem(followingKey(id),JSON.stringify([...ids]));}catch{}setFollowing(ids);}).catch(()=>{if(live)setError('Could not refresh following. Try again shortly.');});
  return()=>{live=false;window.removeEventListener('cinelog:following-changed',change);};
 },[user?.id]);
 const toggle=async targetId=>{if(busy.current)return;busy.current=true;setPending(targetId);setError('');try{const next=read(user?.id);const follow=!next.has(targetId);await persistFollow(supabase,user?.id,targetId,follow);if(follow)next.add(targetId);else next.delete(targetId);try{localStorage.setItem(followingKey(user.id),JSON.stringify([...next]));}catch{}setFollowing(next);window.dispatchEvent(new CustomEvent('cinelog:following-changed',{detail:{userId:user.id}}));return follow;}catch(e){setError(e.message);return null;}finally{busy.current=false;setPending(null);}};
 return {following,toggle,pending,error};
}
