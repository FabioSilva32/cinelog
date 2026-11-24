const paths={search:'/search',explore:'/explore',library:'/library',collections:'/collections',tierlist:'/tier-lists',social:'/community',profile:'/profile',stats:'/stats',calendar:'/diary',wrapped:'/year-in-film',constellation:'/stars-map',achievements:'/achievements',challenges:'/challenges',trivia:'/trivia',foryou:'/picked-for-you'};
export function pagePath(tab,sub='overview'){return tab==='profile'&&sub!=='overview'?`/profile/${sub==='shop'?'extras':encodeURIComponent(sub)}`:paths[tab]||'/explore';}
export function profilePath(username){return `/u/${encodeURIComponent(username)}`;}
export function filmPath(id,type='movie'){return `/film/${type==='tv'?'tv':'movie'}/${encodeURIComponent(id)}`;}
export function readHistoryDestination(href,state={}){
 const url=new URL(href),parts=url.pathname.split('/').filter(Boolean);
 const decode=value=>{try{return decodeURIComponent(value);}catch{return value;}};
 if(parts[0]==='lists'&&parts[1])return {tab:'collections',sub:'overview',modal:null,target:null,mediaType:undefined,entity:{kind:'list',id:decode(parts[1])}};
 if(parts[0]==='collections'&&parts[1]==='franchise'&&parts[2])return {tab:'collections',sub:'overview',modal:null,target:null,mediaType:undefined,entity:{kind:'franchise',id:decode(parts[2])}};
 let tab=Object.keys(paths).find(key=>paths[key]===url.pathname.replace(/\/$/,'')),sub='overview',modal=null,target=null,mediaType;
 if(parts[0]==='community')tab='social';
 if(parts[0]==='u'&&parts[1])return {tab:'profile',sub,modal:'user',target:{username:decode(parts[1])},mediaType};
 if(parts[0]==='profile'){tab='profile';sub=parts[1]==='extras'?'shop':decode(parts[1]||'overview');}
 if(parts[0]==='film'&&parts[2])return {tab:state.tab||'explore',sub:state.sub||'overview',modal:'movie',target:state.movie||decode(parts[2]),mediaType:parts[1]==='tv'?'tv':'movie'};
 tab=tab||url.searchParams.get('tab')||state.tab||'explore';sub=url.searchParams.get('sub')||state.sub||sub;
 if(['shop','watchlist','reviews'].includes(tab)){sub=tab;tab='profile';}if(tab==='diary'){tab='calendar';}if(tab==='landing')tab='explore';
 if(url.hash.startsWith('#user-')){modal='user';target=state.targetUser||{username:decode(url.hash.slice(6))};}
 else if(url.hash.startsWith('#movie-')){modal='movie';target=state.movie||url.hash.slice(7);mediaType=state.mediaType;}
 else if(['#settings','#search','#quickadd','#auth','#recovery'].includes(url.hash))modal=url.hash.slice(1);
 return {tab,sub,modal,target,mediaType,...(parts[0]==='community'&&(parts.length>1||url.search)?{communityPath:url.pathname+url.search}:{})};
}
export function canonicalPath(destination){if(destination.communityPath&&!['user','movie'].includes(destination.modal))return destination.communityPath;if(destination.entity)return destination.entity.kind==='list'?listPath(destination.entity.id):franchisePath(destination.entity.id);if(destination.modal==='user')return profilePath(destination.target.username);if(destination.modal==='movie')return filmPath(destination.target.tmdb_id||destination.target.id||destination.target,destination.mediaType||destination.target.media_type);return pagePath(destination.tab,destination.sub);}
export function isAuthCallbackURL(href){const url=new URL(href);return url.searchParams.has('code')||url.searchParams.has('token_hash')||/(?:access_token|refresh_token|error_description)=/.test(url.hash);}
export const listPath=id=>`/lists/${encodeURIComponent(id)}`;
export const franchisePath=id=>`/collections/franchise/${encodeURIComponent(id)}`;
export function canViewCachedList(list,userId){return (list.isPublic??list.is_public)!==false || Boolean(userId && (list.user_id??list.author?.id)===userId);}
