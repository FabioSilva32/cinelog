import { localDateKey } from './dates';
import { readableReview,reviewSpoilerFlag } from './reviews';

export function episodeData(movie) {
  const legacy={ratings:movie.episode_ratings||{},notes:movie.episode_notes||{},dates:movie.episode_watch_dates||{}};
  if (movie.episode_data && typeof movie.episode_data === 'object' && !Array.isArray(movie.episode_data)) return {...legacy,...structuredClone(movie.episode_data)};
  try {const data=JSON.parse(String(movie.review||'').split('__EPISODE_DATA__:')[1]||'{}');return data&&typeof data==='object'&&!Array.isArray(data)?{...legacy,...data}:legacy;} catch { return legacy; }
}
export function screeningsFor(movie, data = episodeData(movie)) {
  const rows = movie.screenings ?? data.screenings;
  if (Array.isArray(rows) && (rows.length || data.history_initialized)) return rows.map((s, i) => s&&typeof s==='object'&&typeof s.date==='string'&&/^\d{4}-\d{2}-\d{2}/.test(s.date)?{ ...s, date:s.date.slice(0,10),rating:s.rating!=null&&Number.isFinite(Number(s.rating))&&Number(s.rating)>=0&&Number(s.rating)<=10?Number(s.rating):null,review:String(s.review??''),id: s.id || `legacy-${movie.id}-${i}` }:null).filter(Boolean);
  if (movie.status !== 'watched') return [];
  const date = movie.watch_date || data.watch_date || movie.date_added;
  return typeof date==='string'&&/^\d{4}-\d{2}-\d{2}/.test(date) ? [{ id: `legacy-${movie.id}-0`, date: date.slice(0, 10), rating: movie.rating ?? null, review: readableReview(movie.review || ''), is_rewatch: false }] : [];
}
export function viewingEntries(library) {
  return library.flatMap(movie => {
    const data=episodeData(movie);
    return screeningsFor(movie,data).filter(s => s.date).map((s, i, rows) => ({
      ...movie, ...s, episode_data:{...data,contains_spoilers:s.contains_spoilers??reviewSpoilerFlag(movie)},
      id:movie.id,screeningId:s.id,watch_date:s.date,rating:s.rating??null,review:s.review??'',
      is_rewatch:!!s.is_rewatch,screeningNumber:rows.length-i,sourceMovie:movie
    }));
  }).sort((a,b)=>b.watch_date.localeCompare(a.watch_date));
}
export function updateScreenings(movie, rows) {
  const screenings = [...rows].sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.created_at || '').localeCompare(a.created_at || ''));
  const data = { ...episodeData(movie), screenings, history_initialized:true };
  const latest = screenings[0];
  return { ...movie, screenings, episode_data: data, ...(latest ? { watch_date: latest.date, rating: latest.rating ?? null, review: latest.review ?? '' } : { watch_date: null, rating: null, review: '' }), is_rewatch: screenings.length > 1, rewatch_count: screenings.length };
}
export const episodeKey = (season, episode) => `S${String(season).padStart(2, '0')}E${String(episode).padStart(2, '0')}`;
export function isEpisodeWatched(data,key){if(typeof data.watched?.[key]==='boolean')return data.watched[key];return !!(data.dates?.[key]||Number(data.ratings?.[key])>0);}
export function setEpisodeWatched(data,episode,watched,date=localDateKey(new Date())){const key=episodeKey(episode.season_number,episode.episode_number);return {...data,watched:{...data.watched,[key]:watched},...(watched?{dates:{...data.dates,[key]:data.dates?.[key]||date}}:{})};}
export function episodeProgress(movie, episodes, today = localDateKey(new Date())) {
  const data = episodeData(movie);
  const watched = e => isEpisodeWatched(data,episodeKey(e.season_number,e.episode_number));
  const aired = episodes.filter(e => e.season_number > 0 && e.air_date && e.air_date <= today).sort((a,b) => a.season_number-b.season_number || a.episode_number-b.episode_number);
  return { completed: aired.filter(watched).length, total: aired.length, next: aired.find(e => !watched(e)), aired };
}
export function completeEpisode(movie, episode, date = localDateKey(new Date())) {
  const data = episodeData(movie), key = episodeKey(episode.season_number, episode.episode_number);
  return { ...movie, episode_data: { ...data, watched: { ...data.watched, [key]: true }, dates: { ...data.dates, [key]: date } }, episode_watch_dates: { ...data.dates, [key]: date } };
}
