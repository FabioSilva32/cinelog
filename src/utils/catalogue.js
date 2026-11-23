import snapshot from '../data/franchiseCatalogues.json';
import {tmdbMediaType} from './screeningDetails';
import {getMediaType} from './media';
export const catalogueKey=m=>`${tmdbMediaType(m)}:${m.tmdb_id||m.id}`;
export const catalogueSnapshot=snapshot;
export function mergeCatalogue(movies,library){const saved=new Map(library.map(m=>[catalogueKey(m),m]));return movies.map(m=>{const own=saved.get(catalogueKey(m));return {...own,...m,id:own?.id||m.id,inLibrary:Boolean(own),status:own?.status||'unwatched',rating:own?.rating??null,review:own?.review||'',favorite:own?.favorite||false};});}
export const byPopularity=(a,b)=>(Number(b.popularity)||0)-(Number(a.popularity)||0)||(Number(b.vote_count)||0)-(Number(a.vote_count)||0);
export function rankCollections(collections,query){
 const words=text=>String(text).toLowerCase().replace(/\b(the|and|collection|saga)\b/g,' ').replace(/[^\p{L}\p{N}]+/gu,' ').trim().split(/\s+/).filter(Boolean);
 const search=words(query),key=search.join(' ');
 const score=c=>{const name=words(c.name);return name.join(' ')===key?1000:search.filter(word=>name.includes(word)).length*20-name.length;};
 return [...collections].sort((a,b)=>score(b)-score(a));
}
export function newLibraryRow(movie,owner,status,genreMap,id=crypto.randomUUID()){
 const genres=(movie.genres?.length?movie.genres:(movie.genre_ids||[]).map(id=>genreMap[id])).map(g=>typeof g==='string'?g:g?.name).filter(Boolean);
 const tags=[...(movie.tags||[])];if(getMediaType({...movie,genres})==='anime'&&!tags.includes('Anime'))tags.push('Anime');
 return {id,user_id:owner,tmdb_id:Number(movie.tmdb_id||movie.id),media_type:tmdbMediaType(movie),title:movie.title||movie.name,poster_path:movie.poster_path||null,release_year:movie.release_year||(movie.release_date||movie.first_air_date||'').slice(0,4),genres,status:status==='watched'?'watched':'plan_to_watch',rating:null,review:'',favorite:false,tags};
}
