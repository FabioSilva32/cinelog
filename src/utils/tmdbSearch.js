export async function tmdbRequest(path,params={},signal){
 const key=import.meta.env?.VITE_TMDB_API_KEY;
 if(!key)throw new Error('Film search is not configured.');
 const query=new URLSearchParams({api_key:key,language:'en-US',include_adult:'false',...params});
 const response=await fetch('https://api.themoviedb.org/3/'+path+'?'+query,{signal});
 if(!response.ok)throw new Error('Film search is unavailable. Please try again.');
 return response.json();
}
export const asCatalogueMovie=m=>({...m,tmdb_id:m.tmdb_id||m.id,media_type:m.media_type||'movie',release_year:m.release_year||(m.release_date||m.first_air_date||'').slice(0,4),tmdb_score:m.tmdb_score??m.vote_average});
