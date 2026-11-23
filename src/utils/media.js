export function getMediaType(movie) {
  if (!movie) return 'movie';
  if (movie.media_type === 'anime' || movie.type === 'anime' || (movie.tags || []).some(tag => String(tag).toLowerCase() === 'anime') || (movie.genres || []).some(genre => String(genre).toLowerCase() === 'anime' || (String(genre).toLowerCase() === 'animation' && (movie.original_language === 'ja' || movie.origin_country?.includes('JP'))))) return 'anime';
  return movie.media_type === 'tv' || movie.type === 'tv' || movie.number_of_seasons !== undefined || movie.first_air_date !== undefined || movie.details?.number_of_seasons !== undefined ? 'tv' : 'movie';
}
export function knownRuntime(movie) {
  const runtime = Number(movie.runtime || movie.episode_run_time?.[0]);
  return Number.isFinite(runtime) && runtime > 0 ? runtime : null;
}
export function hasGenre(movie, genre) {
  const normalize = value => String(value).toLowerCase().replace('science fiction','sci-fi');
  return (movie.genres || []).some(value => normalize(value) === normalize(genre));
}
export function groupLibraryByMedia(library) {
  const groups = {movie:[],tv:[],anime:[]};
  for (const movie of library) groups[getMediaType(movie)].push(movie);
  return groups;
}
