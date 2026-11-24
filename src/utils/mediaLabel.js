// Display classification is independent of the stored library status and API namespace.
export function mediaLabel(item={}){
 const details=item.details||{};const genres=[...(Array.isArray(item.genres)?item.genres:[]),...(Array.isArray(item.genre_ids)?item.genre_ids:[]),...(Array.isArray(details.genres)?details.genres:[])];
 const animation=genres.some(genre=>genre===16||genre?.id===16||['animation','anime'].includes(String(genre?.name||genre).toLowerCase()));
 const explicitAnime=item.media_type==='anime'||item.type==='anime'||(Array.isArray(item.tags)&&item.tags.some(tag=>String(tag).toLowerCase()==='anime'))||genres.some(genre=>String(genre?.name||genre).toLowerCase()==='anime');
 const japanese=(item.original_language||details.original_language)==='ja'||(item.origin_country||details.origin_country||[]).includes('JP');
 const series=item.media_type==='tv'||item.type==='tv'||Boolean(item.first_air_date||details.first_air_date)||item.number_of_seasons!=null||details.number_of_seasons!=null||Boolean(item.name&&!item.title);
 if(explicitAnime||(animation&&japanese)){if(series)return 'Anime series';if(item.media_type==='movie'||item.type==='movie'||item.release_date||details.release_date)return 'Anime film';return 'Anime';}
 return series?'Series':'Film';
}
