import {episodeData} from './viewingHistory';
import {readableReview,reviewSpoilerFlag} from './reviews';
import {localDateKey} from './dates';

export const hasPersonalRating=movie=>Number(movie.rating)>0;
export function quickRateQueue(library,mode='unrated'){
 return library.filter(m=>m.id&&!hasPersonalRating(m)&&(mode==='watchlist'?m.status==='plan_to_watch':m.status==='watched'));
}
export function quickRatePayload(movie,score,date='',today=localDateKey(new Date())){
 const rating=Number(score);
 if(!Number.isFinite(rating)||rating<1||rating>10)throw Error('Choose a rating from 1 to 10.');
 if(!['watched','plan_to_watch'].includes(movie.status)||hasPersonalRating(movie))throw Error('This title has changed. Skip it or reopen Quick rate to refresh.');
 if(movie.status==='watched')return {rating:Math.round(rating*10)/10};
 if(date&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(new Date(date+'T12:00:00Z').getTime())||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date||date>today))throw Error('Choose a valid viewing date that is not in the future.');
 const data=structuredClone(episodeData(movie));
 const rows=Array.isArray(data.screenings)?data.screenings:[];
 if(date){
  data.screenings=[{id:crypto.randomUUID(),date,rating,review:'',is_rewatch:rows.length>0},...rows];
  data.watch_date=date;data.history_initialized=true;data.unknown_watch_date=false;
 }else if(!rows.length&&!data.watch_date){
  data.screenings=[];data.history_initialized=true;data.watch_date=null;data.unknown_watch_date=true;
 }
 data.contains_spoilers=reviewSpoilerFlag(movie);
 return {rating:Math.round(rating*10)/10,status:'watched',review:readableReview(movie.review)+'\n\n__EPISODE_DATA__:'+JSON.stringify(data)};
}
export function quickRateLocalPatch(row,previous={}){const data=episodeData(String(row.review||'').includes('__EPISODE_DATA__:')?{...row,episode_data:undefined}:row);return {rating:row.rating==null?null:Number(row.rating),status:row.status,review:readableReview(row.review),contains_spoilers:reviewSpoilerFlag(row),episode_data:data,screenings:data.screenings||[],watch_date:data.unknown_watch_date?null:data.watch_date||row.watch_date||(row.status==='watched'?previous.watch_date:null)||null};}
// Conditional writes stop a delayed rating/Undo from overwriting a newer edit.
export function guardQuickRate(request,before,fields){let query=request.eq('status',before.status);for(const key of fields){const value=before[key];query=value==null?query.is(key,null):query.eq(key,value);}return query;}
