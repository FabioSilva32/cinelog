// Calendar years use the saved screening date, with added date only as a legacy fallback.
export function viewingYear(date){const match=String(date||'').match(/^(\d{4})-\d{2}-\d{2}/);return match?Number(match[1]):null;}
export function libraryForViewingYear(library,year){return library.filter(movie=>{
 const screenings=movie.screenings||movie.episode_data?.screenings;
 return (Array.isArray(screenings)&&screenings.some(s=>viewingYear(s.date)===Number(year)))||viewingYear(movie.watch_date||movie.date_added)===Number(year);
});}
export function viewingYears(library,current=new Date().getFullYear()){const years=new Set([current]);for(const movie of library){const screenings=movie.screenings||movie.episode_data?.screenings;for(const date of [movie.watch_date||movie.date_added,...(Array.isArray(screenings)?screenings.map(s=>s.date):[])]){const year=viewingYear(date);if(year)years.add(year);}}return [...years].sort((a,b)=>b-a);}
