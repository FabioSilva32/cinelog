export function readableReview(value){return String(value||'').replace(/__(?:EPISODE_DATA|EPISODE_RATINGS)__:[\s\S]*$/,'').trim();}
export function reviewSpoilerFlag(record={}){
 if(typeof record.episode_data?.contains_spoilers==='boolean')return record.episode_data.contains_spoilers;
 const match=String(record.review||'').match(/__EPISODE_DATA__:([\s\S]*)$/);
 if(match){try{const data=JSON.parse(match[1]);if(typeof data.contains_spoilers==='boolean')return data.contains_spoilers;}catch{}}
 return Boolean(record.contains_spoilers);
}
