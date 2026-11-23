export function mapMovieKey(movie){return String(movie.id||((movie.media_type||'movie')+':'+movie.tmdb_id));}
export function starFocusCamera(star,width,height,scale=2.2){return {scale,x:width/2-star.x*scale,y:height/2-star.y*scale};}

export function zoomMapAt(camera,x,y,delta){const scale=Math.max(.6,Math.min(5,camera.scale*Math.exp(-delta*.0015)));const ratio=scale/camera.scale;return {scale,x:x-(x-camera.x)*ratio,y:y-(y-camera.y)*ratio};}

export function fitMapCamera(stars,width,height,padding=44){
 if(!stars.length)return {x:0,y:0,scale:1};
 const left=Math.min(...stars.map(star=>star.x-(star.size||10))),right=Math.max(...stars.map(star=>star.x+(star.size||10)));
 const top=Math.min(...stars.map(star=>star.y-(star.size||10))),bottom=Math.max(...stars.map(star=>star.y+(star.size||10)));
 const scale=Math.max(.2,Math.min(3,(width-padding*2)/Math.max(1,right-left),(height-padding*2)/Math.max(1,bottom-top)));
 return {scale,x:width/2-(left+right)/2*scale,y:height/2-(top+bottom)/2*scale};
}
export function panMapCamera(camera,dx,dy){return {...camera,x:camera.x+dx,y:camera.y+dy};}
