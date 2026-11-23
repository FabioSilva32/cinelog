import {readFile,writeFile,mkdir} from 'node:fs/promises';
const env=await readFile('.env.local','utf8').catch(()=>'');
const key=process.env.TMDB_API_KEY||process.env.VITE_TMDB_API_KEY||env.match(/^VITE_TMDB_API_KEY=(.*)$/m)?.[1].trim().replace(/^['"]|['"]$/g,'');
if(!key)throw Error('TMDB configuration is missing.');
async function get(path,params={}){const url=new URL('https://api.themoviedb.org/3/'+path);url.search=new URLSearchParams({api_key:key,language:'en-US',...params});const res=await fetch(url);if(!res.ok)throw Error('TMDB catalogue request failed: '+res.status);return res.json();}
async function pages(path,params){let movies=[];let page=1;do{const data=await get(path,{...params,page});movies.push(...data.results);if(page>=data.total_pages)break;if(page>=100)throw Error('Catalogue too large; review source filters.');page++;}while(true);return movies;}
const specs={
 mcu:{keyword:180547,tv:true,scope:'Curated MCU feature films, specials and series, verified against TMDB. Documentaries, promotional videos and unrelated legacy adaptations are excluded.'},
 marvel:{include:'mcu',tvIds:[138502,138503,1403,88987,67466,66190,68716,67195,69629],collections:[556,125574,531241,573436,748,453993,448150,9744,735,90306,558216],movies:[9480,9947,1927,7220,13056,166424,526896,634492,539972,340102],scope:'The MCU plus official Spider-Man, X-Men, Wolverine, Deadpool, Fantastic Four, Blade, Ghost Rider and Venom film series, and selected legacy Marvel films and series.'},
 dc:{companies:'9993|429|128064',scope:'Films credited to DC production companies on TMDB.'},
 spiderman:{collections:[556,125574,531241,573436]},batman:{collections:[120794,263,948485]},
 starwars:{collections:[10],movies:[330459,348350]},hp:{collections:[1241,435259]},lotr:{collections:[119,121938]},
 nolan:{director:525},tarantino:{director:138},villeneuve:{director:137427},
 johnwick:{collections:[404609]},matrix:{collections:[2344]},alien:{collections:[8091,399,115762]},
 ghibli:{companies:'10342',scope:'Feature films credited to Studio Ghibli on TMDB.'},pixar:{companies:'3',scope:'Feature films credited to Pixar on TMDB.'},
 bond:{collections:[645]},fast:{collections:[9485],movies:[384018]},jurassic:{collections:[328]},mi:{collections:[87359]},
};
const output={verifiedAt:new Date().toISOString(),collections:{}};
for(const [id,spec]of Object.entries(specs)){
 let items=[],sources=[];
 if(spec.include)items.push(...output.collections[spec.include].movies);
 if(spec.keyword){for(const type of ['movie',...(spec.tv?['tv']:[])])items.push(...(await pages('discover/'+type,{with_keywords:spec.keyword,without_genres:'99',include_adult:false})).map(m=>({...m,media_type:type})));sources.push({type:'keyword',id:spec.keyword});}
 for(const collection of spec.collections||[]){const data=await get('collection/'+collection);items.push(...data.parts.map(m=>({...m,media_type:'movie'})));sources.push({type:'collection',id:collection,name:data.name});}
 for(const series of spec.tvIds||[]){const data=await get('tv/'+series);items.push({...data,media_type:'tv'});sources.push({type:'tv',id:series,name:data.name});}
 for(const movie of spec.movies||[]){const data=await get('movie/'+movie);items.push({...data,media_type:'movie'});sources.push({type:'movie',id:movie,name:data.title});}
 if(spec.director){const person=await get('person/'+spec.director+'/movie_credits');items.push(...person.crew.filter(m=>m.job==='Director').map(m=>({...m,media_type:'movie'})));sources.push({type:'director',id:spec.director});}
 if(spec.companies){for(const company of spec.companies.split('|')){const data=await get('company/'+company);sources.push({type:'company',id:Number(company),name:data.name});}items.push(...(await pages('discover/movie',{with_companies:spec.companies,include_adult:false,'with_runtime.gte':60})).map(m=>({...m,media_type:'movie'})));if(spec.tv)items.push(...(await pages('discover/tv',{with_companies:spec.companies,include_adult:false})).map(m=>({...m,media_type:'tv'})));}
 if(id==='mcu'){
  const movies=new Set([1726,1724,10138,10195,1771,24428,68721,76338,100402,118340,99861,102899,271110,284052,283995,315635,284053,284054,299536,363088,299537,299534,429617,497698,566525,524434,634649,453395,616037,505642,640146,447365,609681,533535,894205,774752,822119,986056,617126,969681,1003596,1003598,1439930]);
  const series=new Set([85271,88396,84958,91363,88329,92749,92782,92783,114472,122226,138501,202555,114471,241388,198178,213375,138505,232125,61889,38472,62126,62127,62285,67178,61550]);
  items=items.filter(m=>(m.media_type==='tv'?series:movies).has(m.id));
 }
 const unique=new Map();for(const m of items){if(!m.id||m.adult)continue;const type=m.media_type||'movie';unique.set(type+':'+m.id,{id:m.id,tmdb_id:m.id,media_type:type,title:m.title||m.name,poster_path:m.poster_path||null,backdrop_path:m.backdrop_path||null,overview:m.overview||'',release_year:(m.release_date||m.first_air_date||'').slice(0,4),release_date:m.release_date||m.first_air_date||'',tmdb_score:m.vote_average||null,popularity:m.popularity||0,genre_ids:m.genre_ids||[],genres:(m.genres||[]).map(g=>g.name||g),original_language:m.original_language||null,origin_country:m.origin_country||[]});}
 const movies=[...unique.values()].sort((a,b)=>(a.release_date||'9999').localeCompare(b.release_date||'9999'));
 output.collections[id]={movies,sources,scope:spec.scope||'TMDB collection membership, shown in release order.'};
 console.log(id+': '+movies.length+' verified titles');
}
const previous=JSON.parse(await readFile('src/data/franchiseCatalogues.json','utf8'));
for(const [id,collection] of Object.entries(output.collections)){
 const existing=previous.collections[id];
 if(!collection.movies.length||!collection.sources.length)throw Error('Empty catalogue rejected: '+id);
 if(existing&&collection.movies.length<existing.movies.length*.85)throw Error('Unexpected catalogue shrink; review source membership: '+id);
}
await mkdir('src/data',{recursive:true});await writeFile('src/data/franchiseCatalogues.json',JSON.stringify(output));
