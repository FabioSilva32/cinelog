import {useState} from 'react';
import {supabase} from '../../supabaseClient';
import {useFollowing} from '../../hooks/useFollowing';
import {useSocialReady,useSocialResource} from '../../hooks/useSocial';
import {socialProfiles,socialResult} from '../../utils/socialApi';
import {socialPath} from '../../utils/socialModel';
import {tmdbMediaType} from '../../utils/screeningDetails';
import {readableReview,reviewSpoilerFlag} from '../../utils/reviews';
import {getRatingColor} from '../../utils/ratingColors';
import {SocialError,SocialPerson} from './SocialPrimitives';
import RecommendDialog from './RecommendDialog';
export default function FilmSocial({movie,currentUser,onOpenUserProfile,onOpenSocial}){
 const [send,setSend]=useState(false);const ready=useSocialReady(Boolean(currentUser)),{following}=useFollowing(currentUser);const type=tmdbMediaType(movie),id=Number(movie.tmdb_id||movie.id);
 const resource=useSocialResource('friends-film:'+currentUser?.id+':'+type+':'+id+':'+[...following].sort().join(','),async()=>{if(!currentUser?.id||!following.size)return [];const rows=await socialResult(supabase.from('library').select('id,user_id,title,tmdb_id,media_type,status,rating,review').eq('tmdb_id',id).in('user_id',[...following]).limit(100));const same=rows.filter(row=>row.media_type===type||row.media_type==='anime'&&row.title?.toLowerCase()===movie.title?.toLowerCase());const people=await socialProfiles(same.map(m=>m.user_id));return same.map(m=>({...m,person:people.get(m.user_id)}));});
 if(!currentUser)return null;
 return <section className="community-film-social"><div className="community-section-heading"><div><span className="studio-eyebrow">IN YOUR CIRCLE</span><h3>See it through a friend’s eyes.</h3></div>{ready.available&&<button className="studio-secondary" onClick={()=>setSend(true)}>Recommend to a friend</button>}</div><SocialError message={resource.error} onRetry={resource.reload}/>{resource.loading&&!resource.data&&<p role="status">Finding your friends’ ratings…</p>}<div className="community-friend-ratings">{resource.data?.map(row=><article key={row.id}><SocialPerson person={row.person} onOpen={onOpenUserProfile}/><div><strong style={{color:getRatingColor(Number(row.rating))}}>{Number(row.rating)>0?'★ '+Number(row.rating).toFixed(1):'Not rated'}</strong><span>{({watched:'Watched',watching:'Watching',plan_to_watch:'On their watchlist',dropped:'Dropped'})[row.status]||row.status}</span></div>{readableReview(row.review)&&<><p>{reviewSpoilerFlag(row)?'Review contains spoilers.':readableReview(row.review).slice(0,180)}</p>{ready.available&&onOpenSocial&&<button className="studio-text-button" onClick={()=>onOpenSocial(socialPath('reviews',row.id))}>Read & discuss ↗</button>}</>}</article>)}</div>{resource.data&&!resource.data.length&&<p className="community-muted">{following.size?'No one you follow has logged this title yet.':'Follow a few people in Community to see their ratings here.'}</p>}{send&&<RecommendDialog key={currentUser.id} currentUser={currentUser} film={{...movie,media_type:type}} onClose={()=>setSend(false)}/>}</section>;
}
