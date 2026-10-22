// Centralized Movie Title Formatter & Normalizer
// Specifically handles franchise subtitles such as Star Wars Original Trilogy
// where TMDB metadata omits the franchise prefix or subtitles

export const STAR_WARS_SPECIAL_TITLES = {
  11: 'Star Wars: A New Hope',
  1891: 'Star Wars: The Empire Strikes Back',
  1892: 'Star Wars: Return of the Jedi',
};

/**
 * Returns enhanced, friendly movie or show title
 */
export function getEnhancedMovieTitle(item) {
  if (!item) return '';
  const id = Number(item.tmdb_id || item.id);
  if (STAR_WARS_SPECIAL_TITLES[id]) {
    return STAR_WARS_SPECIAL_TITLES[id];
  }

  const rawTitle = (item.title || item.name || '').trim();
  const lower = rawTitle.toLowerCase();

  // Match raw English titles from TMDB if tmdb_id was not provided
  if (lower === 'the empire strikes back' || lower === 'star wars: episode v - the empire strikes back') {
    return 'Star Wars: The Empire Strikes Back';
  }
  if (lower === 'return of the jedi' || lower === 'star wars: episode vi - return of the jedi') {
    return 'Star Wars: Return of the Jedi';
  }
  if (
    (lower === 'star wars' || lower === 'star wars: episode iv - a new hope') &&
    (String(item.release_year || item.release_date || '').startsWith('1977') || !item.release_year)
  ) {
    return 'Star Wars: A New Hope';
  }

  return rawTitle;
}

/**
 * Mutates/clones movie object to ensure title & name reflect enhanced titles
 */
export function enhanceMovie(item) {
  if (!item) return item;
  const enhanced = getEnhancedMovieTitle(item);
  if (enhanced && enhanced !== (item.title || item.name)) {
    return {
      ...item,
      title: enhanced,
      name: item.name ? enhanced : item.name,
      display_title: enhanced
    };
  }
  return item;
}

/**
 * Normalizes user search queries so TMDB finds movies even when users type
 * colloquial franchise titles like "star wars return of the jedi"
 */
export function normalizeSearchQuery(query) {
  if (!query) return '';
  const q = query.trim();
  const lower = q.toLowerCase();

  if (
    lower.includes('star wars') &&
    (lower.includes('return of the jedi') || lower.includes('return of jedi'))
  ) {
    return 'Return of the Jedi';
  }

  if (
    lower.includes('star wars') &&
    (lower.includes('the empire strikes back') || lower.includes('empire strikes back'))
  ) {
    return 'The Empire Strikes Back';
  }

  if (
    lower.includes('star wars') &&
    (lower.includes('a new hope') || lower.includes('new hope'))
  ) {
    return 'Star Wars A New Hope';
  }

  return q;
}
