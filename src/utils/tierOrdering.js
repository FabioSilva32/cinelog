export function moveTierPoster(data,movieId,targetTier,index){
 const id=String(movieId),next=Object.fromEntries(Object.entries(data).map(([key,ids])=>[key,ids.filter(value=>String(value)!==id)]));
 const target=next[targetTier]||[];target.splice(Math.max(0,Math.min(index,target.length)),0,id);next[targetTier]=target;return next;
}
export function tierInsertionIndex(rects,x,y){for(let i=0;i<rects.length;i++){const r=rects[i];if(y<r.top||(y<=r.bottom&&x<r.left+r.width/2))return i;}return rects.length;}
