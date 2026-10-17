// Centralized Franchise & Collections Registry for CineLog
// Provides comprehensive keyword, tag, and metadata detection for all movie franchises,
// ensuring accurate matching in CollectionsTab, TierListTab, MovieDetailModal, and Library.

export const FRANCHISE_COLLECTIONS = [
  {
    id: 'mcu',
    title: 'Marvel Cinematic Universe (MCU)',
    shortTitle: 'Marvel (MCU)',
    emoji: '⚡',
    desc: "Earth's mightiest heroes, cosmic adventures, and the official MCU phases.",
    group: 'franchise',
    tag: 'MCU',
    keywords: [
      'iron man', 'the incredible hulk', 'thor', 'captain america', 'avengers',
      'guardians of the galaxy', 'ant-man', 'doctor strange',
      'spider-man: homecoming', 'spider-man: far from home', 'spider-man: no way home', 'spider-man: brand new day',
      'black panther', 'captain marvel', 'the marvels', 'black widow', 'shang-chi',
      'eternals', 'deadpool & wolverine', 'deadpool and wolverine', 'loki', 'wandavision',
      'the falcon and the winter soldier', 'winter soldier', 'hawkeye', 'moon knight',
      'ms. marvel', 'she-hulk', 'secret invasion', 'echo', 'agatha all along',
      'what if...?', 'daredevil: born again', 'thunderbolts', 'brave new world',
      'quantumania', 'love and thunder', 'wakanda forever', 'multiverse of madness',
      'ragnarok', 'civil war', 'age of ultron', 'infinity war', 'endgame'
    ],
    companies: ['marvel studios'],
    matcher: (m) => {
      if (!m) return false;
      const t = (m.title || '').toLowerCase();
      if (t.includes('blade runner')) return false;

      // Check tags
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && (tg.toLowerCase() === 'mcu' || tg.toLowerCase() === 'marvel cinematic universe'))) return true;

      // Check production company
      const companies = (m.details?.production_companies || m.production_companies || []);
      if (companies.some(c => (c.name || '').toLowerCase().includes('marvel studios'))) return true;

      // Check collection metadata
      const colName = (m.details?.belongs_to_collection?.name || m.collection?.name || '').toLowerCase();
      if (colName.includes('marvel cinematic universe') || colName.includes('avengers collection') || colName.includes('iron man collection') || colName.includes('captain america collection') || colName.includes('thor collection')) return true;

      // Keywords
      const mcuKeywords = [
        'iron man', 'the incredible hulk', 'thor', 'captain america', 'avengers',
        'guardians of the galaxy', 'ant-man', 'doctor strange', 'spider-man',
        'black panther', 'captain marvel', 'the marvels', 'black widow', 'shang-chi',
        'eternals', 'deadpool & wolverine', 'deadpool and wolverine', 'loki', 'wandavision',
        'the falcon and the winter soldier', 'winter soldier', 'hawkeye', 'moon knight',
        'ms. marvel', 'she-hulk', 'secret invasion', 'echo', 'agatha all along',
        'what if...?', 'daredevil: born again', 'thunderbolts', 'brave new world',
        'quantumania', 'love and thunder', 'wakanda forever', 'multiverse of madness',
        'ragnarok', 'civil war', 'age of ultron', 'infinity war', 'endgame'
      ];
      return mcuKeywords.some(k => t.includes(k));
    }
  },
  {
    id: 'marvel',
    title: 'Marvel (All / Multiverse)',
    shortTitle: 'Marvel (All / Multiverse)',
    emoji: '🦸‍♂️',
    desc: 'The complete Marvel multiverse: MCU, Spider-Verse, X-Men, Deadpool, and classics.',
    group: 'franchise',
    tag: 'Marvel',
    matcher: (m) => {
      if (!m) return false;
      const t = (m.title || '').toLowerCase();
      if (t.includes('blade runner')) return false;

      // Check tags
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && (tg.toLowerCase().includes('marvel') || tg.toLowerCase() === 'mcu' || tg.toLowerCase().includes('x-men') || tg.toLowerCase().includes('spider-man')))) return true;

      // Check production companies (Marvel Studios, Marvel Entertainment, Marvel Enterprises)
      const companies = (m.details?.production_companies || m.production_companies || []);
      if (companies.some(c => (c.name || '').toLowerCase().includes('marvel'))) return true;

      // Check collection metadata
      const colName = (m.details?.belongs_to_collection?.name || m.collection?.name || '').toLowerCase();
      if (colName.includes('marvel') || colName.includes('spider-man') || colName.includes('x-men') || colName.includes('avengers') || colName.includes('wolverine') || colName.includes('deadpool')) return true;

      // Check overview
      const overview = (m.overview || '').toLowerCase();
      if (overview.includes('marvel comics') || overview.includes('marvel cinematic universe') || overview.includes('marvel superhero')) return true;

      const allKeywords = [
        'iron man', 'hulk', 'thor', 'captain america', 'avengers',
        'guardians of the galaxy', 'ant-man', 'doctor strange', 'spider-man',
        'spider-verse', 'spiderman', 'the amazing spider-man', 'spectacular spider-man', 'spider-noir',
        'black panther', 'captain marvel', 'the marvels', 'black widow', 'shang-chi',
        'eternals', 'deadpool', 'wolverine', 'x-men', 'new mutants', 'logan',
        'loki', 'wandavision', 'falcon', 'winter soldier', 'hawkeye', 'moon knight',
        'ms. marvel', 'she-hulk', 'secret invasion', 'daredevil', 'punisher',
        'fantastic four', 'fant4stic', 'fantastic 4', 'silver surfer', 'ghost rider',
        'venom', 'morbius', 'madame web', 'kraven', 'blade', 'elektra', 'marvel',
        'thunderbolts', 'brave new world', 'quantumania', 'wakanda forever', 'multiverse of madness',
        'howard the duck', 'big hero 6'
      ];
      return allKeywords.some(k => t.includes(k));
    }
  },
  {
    id: 'spiderman',
    title: 'Spider-Man Universe',
    shortTitle: 'Spider-Man',
    emoji: '🕷️',
    desc: 'Peter Parker, Miles Morales, and the entire Web-Slinger multiverse.',
    group: 'franchise',
    tag: 'Spider-Man',
    matcher: (m) => {
      const t = (m.title || '').toLowerCase();
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && (tg.toLowerCase().includes('spider-man') || tg.toLowerCase().includes('spiderman') || tg.toLowerCase().includes('spider-verse')))) return true;
      return t.includes('spider-man') || t.includes('spiderman') || t.includes('spider-verse') || t.includes('spider-noir') || t.includes('spectacular spider');
    }
  },
  {
    id: 'dc',
    title: 'DC Multiverse',
    shortTitle: 'DC Universe',
    emoji: '🦇',
    desc: 'From the dark streets of Gotham to the skies of Metropolis and beyond.',
    group: 'franchise',
    tag: 'DC',
    matcher: (m) => {
      const t = (m.title || '').toLowerCase();
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && (tg.toLowerCase() === 'dc' || tg.toLowerCase() === 'dceu' || tg.toLowerCase() === 'dcu'))) return true;
      const dcKeywords = [
        'batman', 'superman', 'wonder woman', 'justice league', 'aquaman',
        'the flash', 'green lantern', 'joker', 'suicide squad', 'shazam',
        'black adam', 'catwoman', 'gotham', 'birds of prey', 'dark knight',
        'peacemaker', 'blue beetle', 'watchmen', 'harley quinn', 'swamp thing',
        'constantine', 'sandman', 'supergirl'
      ];
      return dcKeywords.some(k => t.includes(k));
    }
  },
  {
    id: 'batman',
    title: 'The Dark Knight & Gotham',
    shortTitle: 'Batman',
    emoji: '🌃',
    desc: 'Caped Crusader, Dark Knight trilogy, and the rogues of Gotham City.',
    group: 'franchise',
    tag: 'Batman',
    matcher: (m) => {
      const t = (m.title || '').toLowerCase();
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && (tg.toLowerCase().includes('batman') || tg.toLowerCase().includes('dark knight') || tg.toLowerCase().includes('gotham')))) return true;
      return t.includes('batman') || t.includes('dark knight') || t.includes('gotham') || t.includes('joker') || t.includes('harley quinn') || t.includes('arkham') || t.includes('mask of the phantasm') || t.includes('caped crusader') || t.includes('batgirl') || t.includes('catwoman') || t.includes('robin');
    }
  },
  {
    id: 'starwars',
    title: 'Star Wars Saga',
    shortTitle: 'Star Wars',
    emoji: '⚔️',
    desc: 'A long time ago in a galaxy far, far away… Jedi, Sith, and galactic conflict.',
    group: 'franchise',
    tag: 'Star Wars',
    matcher: (m) => {
      const t = (m.title || '').toLowerCase();
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && (tg.toLowerCase() === 'star wars' || tg.toLowerCase() === 'starwars'))) return true;
      const swKeywords = [
        'star wars', 'the force awakens', 'the last jedi', 'the rise of skywalker',
        'rogue one', 'solo: a star wars', 'the phantom menace', 'attack of the clones',
        'revenge of the sith', 'mandalorian', 'andor', 'obi-wan kenobi', 'the acolyte',
        'ahsoka', 'the bad batch', 'the book of boba fett', 'clone wars', 'skeleton crew',
        'empire strikes back', 'return of the jedi', 'a new hope'
      ];
      return swKeywords.some(k => t.includes(k));
    }
  },
  {
    id: 'hp',
    title: 'Wizarding World',
    shortTitle: 'Harry Potter',
    emoji: '🧙',
    desc: 'Hogwarts, Hogsmeade, and magic beyond imagination.',
    group: 'franchise',
    tag: 'Harry Potter',
    matcher: (m) => {
      const t = (m.title || '').toLowerCase();
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && (tg.toLowerCase().includes('potter') || tg.toLowerCase().includes('wizarding')))) return true;
      const hpKeywords = [
        'harry potter', 'fantastic beasts', "philosopher's stone", "sorcerer's stone",
        'chamber of secrets', 'prisoner of azkaban', 'goblet of fire', 'order of the phoenix',
        'half-blood prince', 'deathly hallows', 'crimes of grindelwald', 'secrets of dumbledore'
      ];
      return hpKeywords.some(k => t.includes(k));
    }
  },
  {
    id: 'lotr',
    title: 'Middle-Earth',
    shortTitle: 'Lord of the Rings',
    emoji: '💍',
    desc: 'One Ring to rule them all — epic fantasy across Middle-Earth.',
    group: 'franchise',
    tag: 'Lord of the Rings',
    matcher: (m) => {
      const t = (m.title || '').toLowerCase();
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && (tg.toLowerCase().includes('lotr') || tg.toLowerCase().includes('rings') || tg.toLowerCase().includes('hobbit')))) return true;
      const lotrKeywords = [
        'lord of the rings', 'the fellowship of the ring', 'the two towers', 'the return of the king',
        'the hobbit', 'rings of power', 'an unexpected journey', 'desolation of smaug',
        'battle of the five armies', 'war of the rohirrim'
      ];
      return lotrKeywords.some(k => t.includes(k));
    }
  },
  {
    id: 'nolan',
    title: 'Christopher Nolan Universe',
    shortTitle: 'Christopher Nolan',
    emoji: '🌀',
    desc: 'Mind-bending narratives and cinematic scale by Christopher Nolan.',
    group: 'franchise',
    tag: 'Nolan',
    matcher: (m) => {
      const t = (m.title || '').toLowerCase();
      if (m.director && m.director.toLowerCase().includes('nolan')) return true;
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && tg.toLowerCase().includes('nolan'))) return true;
      const nolanKeywords = [
        'memento', 'insomnia', 'batman begins', 'the prestige', 'the dark knight',
        'inception', 'interstellar', 'dunkirk', 'tenet', 'oppenheimer', 'following'
      ];
      return nolanKeywords.some(k => t.includes(k));
    }
  },
  {
    id: 'tarantino',
    title: 'Quentin Tarantino Filmography',
    shortTitle: 'Quentin Tarantino',
    emoji: '🩸',
    desc: 'Dialogue, dark humor, and razor-sharp storytelling by QT.',
    group: 'franchise',
    tag: 'Tarantino',
    matcher: (m) => {
      const t = (m.title || '').toLowerCase();
      if (m.director && m.director.toLowerCase().includes('tarantino')) return true;
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && tg.toLowerCase().includes('tarantino'))) return true;
      const qtKeywords = [
        'reservoir dogs', 'pulp fiction', 'jackie brown', 'kill bill',
        'death proof', 'inglourious basterds', 'django unchained',
        'the hateful eight', 'once upon a time in hollywood'
      ];
      return qtKeywords.some(k => t.includes(k));
    }
  },
  {
    id: 'villeneuve',
    title: 'Denis Villeneuve Cinema',
    shortTitle: 'Denis Villeneuve',
    emoji: '🏜️',
    desc: 'Visceral scale, existential tension, and cinematic world-building.',
    group: 'franchise',
    tag: 'Villeneuve',
    matcher: (m) => {
      const t = (m.title || '').toLowerCase();
      if (m.director && m.director.toLowerCase().includes('villeneuve')) return true;
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && (tg.toLowerCase().includes('villeneuve') || tg.toLowerCase() === 'dune'))) return true;
      const villeneuveKeywords = [
        'dune', 'dune: part two', 'blade runner 2049', 'arrival', 'sicario',
        'prisoners', 'enemy', 'incendies', 'polytechnique'
      ];
      return villeneuveKeywords.some(k => t.includes(k));
    }
  },
  {
    id: 'johnwick',
    title: 'John Wick Universe',
    shortTitle: 'John Wick',
    emoji: '🎯',
    desc: 'The Continental, High Table mythology, and relentless neo-noir action.',
    group: 'franchise',
    tag: 'John Wick',
    matcher: (m) => {
      const t = (m.title || '').toLowerCase();
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && (tg.toLowerCase().includes('wick') || tg.toLowerCase().includes('continental')))) return true;
      return t.includes('john wick') || t.includes('continental') || t.includes('ballerina');
    }
  },
  {
    id: 'matrix',
    title: 'The Matrix Saga',
    shortTitle: 'The Matrix',
    emoji: '💊',
    desc: 'Red pill or blue pill: cyberpunk philosophy and mind-bending reality.',
    group: 'franchise',
    tag: 'Matrix',
    matcher: (m) => {
      const t = (m.title || '').toLowerCase();
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && tg.toLowerCase().includes('matrix'))) return true;
      return t.includes('matrix') || t.includes('animatrix');
    }
  },
  {
    id: 'alien',
    title: 'Alien & Predator Universe',
    shortTitle: 'Alien / Predator',
    emoji: '👽',
    desc: 'Cosmic horror, Weyland-Yutani bio-weapons, and ultimate galactic hunters.',
    group: 'franchise',
    tag: 'Alien',
    matcher: (m) => {
      const t = (m.title || '').toLowerCase();
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && (tg.toLowerCase().includes('alien') || tg.toLowerCase().includes('predator')))) return true;
      return t.includes('alien') || t.includes('aliens') || t.includes('predator') || t.includes('prometheus') || t.includes('covenant') || t.includes('romulus') || t.includes('prey');
    }
  },
  {
    id: 'ghibli',
    title: 'Studio Ghibli',
    shortTitle: 'Studio Ghibli',
    emoji: '🌿',
    desc: "Miyazaki's enchanting worlds of wonder, nature, and imagination.",
    group: 'franchise',
    tag: 'Ghibli',
    matcher: (m) => {
      const t = (m.title || '').toLowerCase();
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && tg.toLowerCase().includes('ghibli'))) return true;
      const ghibliKeywords = [
        'spirited away', 'my neighbor totoro', 'princess mononoke', "howl's moving castle",
        'nausicaä', 'castle in the sky', "kiki's delivery service", 'porco rosso',
        'only yesterday', 'pom poko', 'whisper of the heart', 'the cat returns',
        'tales from earthsea', 'ponyo', 'the wind rises', 'the tale of the princess kaguya',
        'when marnie was there', 'the boy and the heron', 'grave of the fireflies',
        'ocean waves', 'studio ghibli', 'from up on poppy hill'
      ];
      return ghibliKeywords.some(k => t.includes(k));
    }
  },
  {
    id: 'pixar',
    title: 'Pixar Animation Studios',
    shortTitle: 'Pixar Universe',
    emoji: '🎈',
    desc: 'Heartwarming, innovative animated classics from Pixar.',
    group: 'franchise',
    tag: 'Pixar',
    matcher: (m) => {
      const t = (m.title || '').toLowerCase();
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && tg.toLowerCase().includes('pixar'))) return true;
      const pixarKeywords = [
        'toy story', 'finding nemo', 'finding dory', 'the incredibles', 'incredibles 2',
        'up', 'wall-e', 'cars', 'ratatouille', 'brave', 'inside out', 'coco',
        'soul', 'luca', 'turning red', 'elemental', "a bug's life",
        'monsters, inc', 'monsters university', 'onward', 'lightyear', 'the good dinosaur'
      ];
      return pixarKeywords.some(k => t.includes(k));
    }
  },
  {
    id: 'bond',
    title: 'James Bond 007',
    shortTitle: 'James Bond 007',
    emoji: '🕴️',
    desc: "Shaken, not stirred — the world's most iconic secret agent.",
    group: 'franchise',
    tag: '007',
    matcher: (m) => {
      const t = (m.title || '').toLowerCase();
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && (tg.toLowerCase().includes('007') || tg.toLowerCase().includes('bond')))) return true;
      const bondKeywords = [
        'james bond', '007', 'casino royale', 'quantum of solace', 'skyfall', 'spectre',
        'no time to die', 'goldfinger', 'thunderball', 'die another day', 'dr. no',
        'from russia with love', 'the spy who loved me', 'licence to kill', 'goldeneye',
        'tomorrow never dies', 'the world is not enough', 'live and let die'
      ];
      return bondKeywords.some(k => t.includes(k));
    }
  },
  {
    id: 'fast',
    title: 'Fast & Furious Saga',
    shortTitle: 'Fast & Furious',
    emoji: '🏎️',
    desc: 'Family, high speed, and impossible heist stunts around the globe.',
    group: 'franchise',
    tag: 'Fast & Furious',
    matcher: (m) => {
      const t = (m.title || '').toLowerCase();
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && tg.toLowerCase().includes('fast & furious'))) return true;
      const fastKeywords = [
        'fast & furious', 'fast and furious', 'the fast and the furious', 'tokyo drift',
        'fast five', 'fast six', 'furious 7', 'the fate of the furious', 'hobbs & shaw',
        'f9', 'fast x'
      ];
      return fastKeywords.some(k => t.includes(k));
    }
  },
  {
    id: 'jurassic',
    title: 'Jurassic Park & World',
    shortTitle: 'Jurassic Park',
    emoji: '🦕',
    desc: 'Life finds a way — prehistoric dinosaurs running loose on the big screen.',
    group: 'franchise',
    tag: 'Jurassic',
    matcher: (m) => {
      const t = (m.title || '').toLowerCase();
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && tg.toLowerCase().includes('jurassic'))) return true;
      return t.includes('jurassic park') || t.includes('jurassic world') || t.includes('the lost world: jurassic') || t.includes('fallen kingdom') || t.includes('dominion');
    }
  },
  {
    id: 'mi',
    title: 'Mission: Impossible',
    shortTitle: 'Mission: Impossible',
    emoji: '💣',
    desc: "Ethan Hunt and the IMF executing death-defying stunts worldwide.",
    group: 'franchise',
    tag: 'Mission: Impossible',
    matcher: (m) => {
      const t = (m.title || '').toLowerCase();
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && tg.toLowerCase().includes('mission: impossible'))) return true;
      return t.includes('mission: impossible') || t.includes('mission impossible') || t.includes('dead reckoning') || t.includes('ghost protocol') || t.includes('rogue nation') || t.includes('fallout');
    }
  }
];

export const GENRE_LIST = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Sci-Fi', 'Horror',
  'Romance', 'Thriller', 'Animation', 'Fantasy', 'Crime', 'Documentary', 'Mystery'
];

/**
 * Returns an array of collection descriptors that a given movie matches.
 */
export function getMovieCollections(movie, customCollections = {}) {
  if (!movie) return [];
  const matched = [];

  // 1. Franchise matches
  FRANCHISE_COLLECTIONS.forEach(f => {
    if (f.matcher && f.matcher(movie)) {
      matched.push({
        id: f.id,
        title: f.title,
        shortTitle: f.shortTitle,
        emoji: f.emoji,
        type: 'franchise',
        tag: f.tag
      });
    }
  });

  // 2. Custom collection matches
  const mId = String(movie.id || movie.tmdb_id);
  Object.entries(customCollections).forEach(([title, data]) => {
    if (data && Array.isArray(data.movieIds) && data.movieIds.includes(mId)) {
      matched.push({
        id: `custom-${title}`,
        title: title,
        shortTitle: title,
        emoji: data.emoji || '🎬',
        type: 'custom'
      });
    }
  });

  return matched;
}

/**
 * Checks if a movie matches a specific collection (franchise ID, genre, or custom collection title).
 */
export function matchesCollection(movie, filterKey, customCollections = {}) {
  if (!movie || !filterKey || filterKey === 'all') return true;

  // Genre check
  if (GENRE_LIST.includes(filterKey)) {
    return Array.isArray(movie.genres) && movie.genres.includes(filterKey);
  }

  // Franchise collection check
  const franchise = FRANCHISE_COLLECTIONS.find(f => f.id === filterKey);
  if (franchise) {
    return franchise.matcher(movie);
  }

  // Custom collection check (prefixed with 'custom:' or by exact name)
  const customKey = filterKey.startsWith('custom:') ? filterKey.replace('custom:', '') : filterKey;
  if (customCollections[customKey]) {
    const ids = customCollections[customKey].movieIds || [];
    const mId = String(movie.id || movie.tmdb_id);
    return ids.includes(mId);
  }

  // Smart tag check (prefixed with 'tag:')
  if (filterKey.startsWith('tag:')) {
    const targetTag = filterKey.replace('tag:', '').toLowerCase();
    return Array.isArray(movie.tags) && movie.tags.some(t => typeof t === 'string' && t.toLowerCase() === targetTag);
  }

  return false;
}

/**
 * Returns suggested tags for a movie based on detected franchises.
 */
export function getSuggestedTags(movie) {
  if (!movie) return [];
  const existingTags = new Set((movie.tags || []).map(t => String(t).toLowerCase()));
  const suggestions = [];

  FRANCHISE_COLLECTIONS.forEach(f => {
    if (f.tag && f.matcher && f.matcher(movie)) {
      if (!existingTags.has(f.tag.toLowerCase())) {
        suggestions.push(f.tag);
      }
    }
  });

  return suggestions;
}
