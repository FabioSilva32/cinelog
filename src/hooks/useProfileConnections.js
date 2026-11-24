import {useState,useEffect} from 'react';
import {supabase} from '../supabaseClient';
export function useProfileConnections(id){
 const [counts,setCounts]=useState({}),[revision,setRevision]=useState(0);
 useEffect(()=>{const refresh=()=>setRevision(n=>n+1);window.addEventListener('cinelog:following-changed',refresh);return()=>window.removeEventListener('cinelog:following-changed',refresh);},[]);
 useEffect(()=>{let live=true;setCounts({});if(id)Promise.all([supabase.from('follows').select('follower_id',{count:'exact',head:true}).eq('following_id',id),supabase.from('follows').select('following_id',{count:'exact',head:true}).eq('follower_id',id)]).then(([a,b])=>{if(live)setCounts({followers:a.error?undefined:a.count,following:b.error?undefined:b.count});}).catch(()=>{});return()=>{live=false;};},[id,revision]);return counts;
}
