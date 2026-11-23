import TasteComparison from './social/TasteComparison';

import { useEffect,useState } from 'react';
import { supabase } from '../supabaseClient';

import { useFollowing } from '../hooks/useFollowing';
import ProfileJournal from './ProfileJournal';
import ListDetailModal from './ListDetailModal';
export default function PublicProfilePage({targetUser,currentUser,onMovieClick,onOpenUserProfile,onOpenAuth,onOpenListPage,library:viewerLibrary=[]}){
 const [data,setData]=useState(null),[error,setError]=useState(''),[selected,setSelected]=useState(null),[retry,setRetry]=useState(0),[comparing,setComparing]=useState(false);
 const {following,toggle,pending,error:followError}=useFollowing(currentUser);
 useEffect(()=>{let live=true;setData(null);setError('');setSelected(null);
  (async()=>{
   const username=targetUser.username;

   const query=supabase.from('profiles').select('*');
   const {data:row,error}=await (username?query.ilike('username',username):query.eq('id',targetUser.id)).maybeSingle();
   if(error)throw error;if(!row)throw new Error('This profile could not be found.');
   const [films,lists,followers,followed]=await Promise.all([supabase.from('library').select('*').eq('user_id',row.id).order('date_added',{ascending:false}),supabase.from('custom_lists').select('*').eq('user_id',row.id).eq('is_public',true).order('created_at',{ascending:false}),supabase.from('follows').select('follower_id',{count:'exact',head:true}).eq('following_id',row.id),supabase.from('follows').select('following_id',{count:'exact',head:true}).eq('follower_id',row.id)]);
   if(films.error)throw new Error('This profile’s library could not be loaded. Please try again.');
   const profile={...row,displayName:row.display_name||row.username,avatar:row.avatar_url,equippedBorder:row.equipped_border||'none',featuredBadges:row.featured_badges||[],bannerUrl:row.banner_url||'',bannerFitMode:row.banner_fit_mode||'cover',bannerPosPercent:row.banner_pos_percent??20,followersCount:followers.count??row.followers_count,followingCount:followed.count??row.following_count};
   if(live)setData({profile,library:films.data||[],lists:(lists.data||[]).map(l=>({...l,isPublic:l.is_public,isRanked:l.is_ranked,likesCount:l.likes_count,author:l.author_info||profile,createdAt:l.created_at})),listError:lists.error?'Public lists are temporarily unavailable.':''});
  })().catch(e=>{if(live)setError(e.message||'Could not load this profile.');});
  return()=>{live=false;};
 },[targetUser.id,targetUser.username,currentUser?.id,retry]);
 if(error)return <section className="studio-empty-results"><h1>Profile unavailable</h1><p role="alert">{error}</p><button className="studio-secondary" onClick={()=>setRetry(v=>v+1)}>Try again</button></section>;
 if(!data)return <div className="studio-loading" role="status">Loading this film journal…</div>;
 const own=data.profile.id===currentUser?.id;
 return <><ProfileJournal onOpenUserProfile={onOpenUserProfile} key={data.profile.id} currentUser={data.profile} library={data.library} readOnly lists={data.lists} listError={data.listError} onOpenList={list=>onOpenListPage?onOpenListPage(list):setSelected(list)} onMovieClick={onMovieClick} headerActions={<>{!own&&<button className={following.has(data.profile.id)?'studio-secondary':'studio-primary'} aria-pressed={following.has(data.profile.id)} disabled={pending===data.profile.id} onClick={async()=>{if(!currentUser){onOpenAuth?.();return;}const followed=await toggle(data.profile.id);if(typeof followed==='boolean')setData(prev=>({...prev,profile:{...prev.profile,followersCount:typeof prev.profile.followersCount==='number'?Math.max(0,prev.profile.followersCount+(followed?1:-1)):undefined}}));}}>{pending?'Updating…':following.has(data.profile.id)?'Following':'Follow'}</button>}{!own&&currentUser&&<button className="studio-secondary" onClick={()=>setComparing(true)}>Compare our taste</button>}</>}/>{comparing&&<TasteComparison ownLibrary={viewerLibrary} otherLibrary={data.library} name={data.profile.displayName||data.profile.username} onMovieClick={onMovieClick} onClose={()=>setComparing(false)}/>} {followError&&<p className="screening-error" role="alert">{followError}</p>}{selected&&<ListDetailModal backLabel="Back to profile" list={selected} currentUser={currentUser} onClose={()=>setSelected(null)} onMovieClick={onMovieClick} onOpenUserProfile={onOpenUserProfile}/>}</>;
}
