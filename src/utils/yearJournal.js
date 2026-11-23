import {libraryForViewingYear,viewingYear} from './viewingYear.js';
import {knownRuntime} from './media.js';
export function yearJournal(library,year){
 const watched=libraryForViewingYear(library,year).filter(movie=>movie.status==='watched');
 const rated=watched.filter(movie=>Number(movie.rating)>0),genres={},directors={},months=Array(12).fill(0);
 for(const movie of watched){
  for(const genre of movie.genres||[]){const name=typeof genre==='string'?genre:genre.name;if(name)genres[name]=(genres[name]||0)+1;}
  const director=movie.director||movie.details?.credits?.crew?.find(person=>person.job==='Director')?.name;if(director)directors[director]=(directors[director]||0)+1;
  const screenings=movie.screenings||movie.episode_data?.screenings||[];
  const dates=[...(Array.isArray(screenings)?screenings.map(screening=>screening.date):[]),movie.watch_date||movie.date_added];
  for(const month of new Set(dates.filter(date=>viewingYear(date)===Number(year)).map(date=>Number(String(date).slice(5,7))-1).filter(month=>month>=0&&month<12)))months[month]++;
 }
 const rank=counts=>Object.entries(counts).sort((a,b)=>b[1]-a[1]);
 return {watched,rated,months,genres:rank(genres),directors:rank(directors),hours:Math.round(watched.reduce((sum,movie)=>sum+(knownRuntime(movie)||0),0)/60),average:rated.length?(rated.reduce((sum,movie)=>sum+Number(movie.rating),0)/rated.length).toFixed(1):null,highest:[...rated].sort((a,b)=>Number(b.rating)-Number(a.rating)).slice(0,6),reviews:watched.filter(movie=>String(movie.review||'').trim())};
}
