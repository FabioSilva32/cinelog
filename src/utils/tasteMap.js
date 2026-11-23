export function tasteGenres(movie){
 const genres=(movie.genres||[]).map(genre=>typeof genre==='string'?genre:genre?.name).filter(Boolean).map(name=>name==='Science Fiction'?'Sci-Fi':String(name).trim()).filter(Boolean);
 return [...new Set(genres.length?genres:['Uncategorised'])];
}
export function tasteMapData(library,filter='all',query=''){
 const matches=movie=>filter==='favorites'?Boolean(movie.favorite||movie.is_favorite):filter==='all'||movie.status===filter;
 const term=query.trim().toLowerCase();
 const movies=library.filter(movie=>matches(movie)&&(!term||String(movie.title||'').toLowerCase().includes(term)||tasteGenres(movie).some(genre=>genre.toLowerCase().includes(term))));
 const grouped=new Map();for(const movie of movies)for(const genre of tasteGenres(movie)){if(!grouped.has(genre))grouped.set(genre,[]);grouped.get(genre).push(movie);}
 const groups=[...grouped].map(([name,items])=>{const rated=items.filter(movie=>Number(movie.rating)>0);return {name,movies:[...items].sort((a,b)=>(Number(b.rating)||0)-(Number(a.rating)||0)),count:items.length,watched:items.filter(movie=>movie.status==='watched').length,favorites:items.filter(movie=>movie.favorite||movie.is_favorite).length,average:rated.length?(rated.reduce((sum,movie)=>sum+Number(movie.rating),0)/rated.length).toFixed(1):null,share:movies.length?Math.round(items.length/movies.length*100):0};}).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name));
 return {movies,groups};
}
