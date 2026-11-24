// Local calendar dates must not be converted to UTC: DST can duplicate a day.
export function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

// Opening an existing screening must never silently replace its date with today.
export function initialWatchDate(movie, today = localDateKey(new Date())) {
  if (movie.watch_date) return String(movie.watch_date).slice(0,10);
  const screenings = Array.isArray(movie.screenings) && movie.screenings.length ? movie.screenings : movie.episode_data?.screenings || [];
  const dates = screenings.map(s=>String(s.date || '').slice(0,10)).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  if (dates.length) return dates.at(-1);
  if (movie.episode_data?.unknown_watch_date) return '';
  if (movie.status === 'watched' && movie.date_added) return String(movie.date_added).slice(0,10);
  return today;
}
