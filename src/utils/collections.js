// Centralized Franchise & Collections Registry for CineLog
// Provides comprehensive keyword, tag, and metadata detection for all movie franchises,
// ensuring accurate matching in CollectionsTab, TierListTab, MovieDetailModal, and Library.

// Canonical Marvel Cinematic Universe (MCU) TMDB IDs (Phases 1-5 + Canonical Specials & Series)
export const MCU_CANON_IDS = new Set([
  1726, 1724, 10138, 10195, 1771, 24428, 68721, 76338, 100402, 118340,
  99861, 102899, 271110, 284052, 283995, 315635, 284053, 284054, 299536,
  363088, 299537, 299534, 429617, 497698, 566525, 524434, 634649, 453395,
  616037, 505642, 640146, 447365, 609681, 533535, 927833, 774752, 823464,
  986056, 617126, 1003596, 1003598, 1024535, 969681,
  // MCU Disney+ Series (Marvel Studios Canonical)
  85271, 88396, 84958, 91363, 88329, 92749, 92782, 92783, 114479, 138501, 138505, 202250, 114473
]);

// Explicit Non-MCU Marvel TMDB IDs (Fox, Sony, Legacy, Animated - MUST NOT be in MCU)
export const NON_MCU_MARVEL_IDS = new Set([
  // Sam Raimi Spider-Man Trilogy
  557, 558, 559,
  // Marc Webb Amazing Spider-Man Duology
  1930, 102382,
  // Sony Animated Spider-Verse
  324857, 569094,
  // Sony's Spider-Man Universe (SSU)
  335983, 580489, 912649, 526896, 634492, 791373,
  // 20th Century Fox X-Men & Wolverine Universe
  36657, 36658, 36668, 2080, 49538, 76170, 127585, 246655, 263115, 320288, 340102,
  // Fox Deadpool standalone films
  293660, 383498,
  // Fox Fantastic Four
  9738, 1979, 166424,
  // Legacy Marvel
  34361, 36586, 36647, 36648, 9480, 9947, 1927, 7220, 13056, 1250, 71676, 10588,
  // Animated Marvel TV series
  138502, 2190, 888, 7443,
  // Netflix Defenders series & ABC
  61889, 67178, 38472, 67070, 62127, 62285, 1403, 61550
]);

// Full Canonical MCU Movie & Special Presentation Catalogue
export const MCU_FULL_CATALOGUE = [
  // Phase 1
  { id: 1726, tmdb_id: 1726, title: 'Iron Man', release_year: '2008', poster_path: '/78lPtwv72eTNqFW9COBYI0dWDJa.jpg', rating: 7.7, phase: 'Phase 1' },
  { id: 1724, tmdb_id: 1724, title: 'The Incredible Hulk', release_year: '2008', poster_path: '/gKzYx79y0AQTL4UAk1cBQJ3nvrm.jpg', rating: 6.3, phase: 'Phase 1' },
  { id: 10138, tmdb_id: 10138, title: 'Iron Man 2', release_year: '2010', poster_path: '/6WBeq4fCfn7AN0o21W9qNcRF2l9.jpg', rating: 6.9, phase: 'Phase 1' },
  { id: 10195, tmdb_id: 10195, title: 'Thor', release_year: '2011', poster_path: '/prSfAi1xGrhLQNxVSUFh61xQ4Qy.jpg', rating: 6.8, phase: 'Phase 1' },
  { id: 1771, tmdb_id: 1771, title: 'Captain America: The First Avenger', release_year: '2011', poster_path: '/vSNxAJTlD0r02V9sPYpOjqDZXUK.jpg', rating: 7.0, phase: 'Phase 1' },
  { id: 24428, tmdb_id: 24428, title: 'The Avengers', release_year: '2012', poster_path: '/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg', rating: 8.1, phase: 'Phase 1' },
  // Phase 2
  { id: 68721, tmdb_id: 68721, title: 'Iron Man 3', release_year: '2013', poster_path: '/qhPtAc1TKbMPqNvcdXSOn9Bn7hZ.jpg', rating: 6.9, phase: 'Phase 2' },
  { id: 76338, tmdb_id: 76338, title: 'Thor: The Dark World', release_year: '2013', poster_path: '/wp6OxE4poJ4G7c0U2ZIXasTSMR7.jpg', rating: 6.5, phase: 'Phase 2' },
  { id: 100402, tmdb_id: 100402, title: 'Captain America: The Winter Soldier', release_year: '2014', poster_path: '/tVFRpFw3xTedgPGqxW0AOI8Qhh0.jpg', rating: 7.7, phase: 'Phase 2' },
  { id: 118340, tmdb_id: 118340, title: 'Guardians of the Galaxy', release_year: '2014', poster_path: '/r7vmZjiyZw9rpJMQJdXpjgiCOk9.jpg', rating: 7.9, phase: 'Phase 2' },
  { id: 99861, tmdb_id: 99861, title: 'Avengers: Age of Ultron', release_year: '2015', poster_path: '/4ssDuvEDkSArWEdyBl2X5EHvYKU.jpg', rating: 7.3, phase: 'Phase 2' },
  { id: 102899, tmdb_id: 102899, title: 'Ant-Man', release_year: '2015', poster_path: '/rQRnQfUl3kfp78nCWq8Ks04vnq1.jpg', rating: 7.1, phase: 'Phase 2' },
  // Phase 3
  { id: 271110, tmdb_id: 271110, title: 'Captain America: Civil War', release_year: '2016', poster_path: '/rAGiXaUfPzY7CDEyNKUofk3Kw2e.jpg', rating: 7.5, phase: 'Phase 3' },
  { id: 284052, tmdb_id: 284052, title: 'Doctor Strange', release_year: '2016', poster_path: '/uGBVj3bEbCoZbDjjl9wTxcygko1.jpg', rating: 7.4, phase: 'Phase 3' },
  { id: 283995, tmdb_id: 283995, title: 'Guardians of the Galaxy Vol. 2', release_year: '2017', poster_path: '/y4MBh0EjBlMuOzv9axM4qJlmhzz.jpg', rating: 7.6, phase: 'Phase 3' },
  { id: 315635, tmdb_id: 315635, title: 'Spider-Man: Homecoming', release_year: '2017', poster_path: '/c24sv2weTHPsmDa7jEMN0m2P3RT.jpg', rating: 7.3, phase: 'Phase 3' },
  { id: 284053, tmdb_id: 284053, title: 'Thor: Ragnarok', release_year: '2017', poster_path: '/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg', rating: 7.6, phase: 'Phase 3' },
  { id: 284054, tmdb_id: 284054, title: 'Black Panther', release_year: '2018', poster_path: '/uxzzxijgPIY7slzFvMotPv8wjKA.jpg', rating: 7.4, phase: 'Phase 3' },
  { id: 299536, tmdb_id: 299536, title: 'Avengers: Infinity War', release_year: '2018', poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg', rating: 8.2, phase: 'Phase 3' },
  { id: 363088, tmdb_id: 363088, title: 'Ant-Man and the Wasp', release_year: '2018', poster_path: '/cFQEO687n1K6umXbInzocxcnAQz.jpg', rating: 6.9, phase: 'Phase 3' },
  { id: 299537, tmdb_id: 299537, title: 'Captain Marvel', release_year: '2019', poster_path: '/AtsgWhDnHTq68L0lLsUrCnM7TjG.jpg', rating: 6.8, phase: 'Phase 3' },
  { id: 299534, tmdb_id: 299534, title: 'Avengers: Endgame', release_year: '2019', poster_path: '/bR8ISy1O9XQxqiy0fQFw2BX72RQ.jpg', rating: 8.2, phase: 'Phase 3' },
  { id: 429617, tmdb_id: 429617, title: 'Spider-Man: Far From Home', release_year: '2019', poster_path: '/4q2NNj4S5dG2RLF9CpXsej7yXl.jpg', rating: 7.4, phase: 'Phase 3' },
  // Phase 4
  { id: 497698, tmdb_id: 497698, title: 'Black Widow', release_year: '2021', poster_path: '/qAZ0pzat24kLdO3o8ejmbLxyOac.jpg', rating: 7.1, phase: 'Phase 4' },
  { id: 566525, tmdb_id: 566525, title: 'Shang-Chi and the Legend of the Ten Rings', release_year: '2021', poster_path: '/9f2Q0U3IOsLgrI2HkvldwSABZy5.jpg', rating: 7.5, phase: 'Phase 4' },
  { id: 524434, tmdb_id: 524434, title: 'Eternals', release_year: '2021', poster_path: '/lFByFSLV5WDJEv3KabbdAF959F2.jpg', rating: 6.7, phase: 'Phase 4' },
  { id: 634649, tmdb_id: 634649, title: 'Spider-Man: No Way Home', release_year: '2021', poster_path: '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg', rating: 7.9, phase: 'Phase 4' },
  { id: 453395, tmdb_id: 453395, title: 'Doctor Strange in the Multiverse of Madness', release_year: '2022', poster_path: '/ddJcSKbcp4rKZTmuyWaMhuwcfMz.jpg', rating: 7.2, phase: 'Phase 4' },
  { id: 616037, tmdb_id: 616037, title: 'Thor: Love and Thunder', release_year: '2022', poster_path: '/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg', rating: 6.4, phase: 'Phase 4' },
  { id: 505642, tmdb_id: 505642, title: 'Black Panther: Wakanda Forever', release_year: '2022', poster_path: '/sv1xJUazXeYqALzczSZ3O6nkH75.jpg', rating: 7.0, phase: 'Phase 4' },
  // Phase 5
  { id: 640146, tmdb_id: 640146, title: 'Ant-Man and the Wasp: Quantumania', release_year: '2023', poster_path: '/qnqGbB22YJ7dSs4o6M7exTpNxPz.jpg', rating: 6.2, phase: 'Phase 5' },
  { id: 447365, tmdb_id: 447365, title: 'Guardians of the Galaxy Vol. 3', release_year: '2023', poster_path: '/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg', rating: 7.9, phase: 'Phase 5' },
  { id: 609681, tmdb_id: 609681, title: 'The Marvels', release_year: '2023', poster_path: '/9GBhzXMFjgcZ3FdR9w3bUMMTps5.jpg', rating: 5.9, phase: 'Phase 5' },
  { id: 533535, tmdb_id: 533535, title: 'Deadpool & Wolverine', release_year: '2024', poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', rating: 7.6, phase: 'Phase 5' },
  // Official Marvel Studios Special Presentations
  { id: 927833, tmdb_id: 927833, title: 'Werewolf by Night', release_year: '2022', poster_path: '/mvIvNKQIzhFH0nR9BTnFsU7Kprm.jpg', rating: 7.0, phase: 'Special' },
  { id: 774752, tmdb_id: 774752, title: 'The Guardians of the Galaxy Holiday Special', release_year: '2022', poster_path: '/8dqXJ3mxQl97bOOMqq3ioUmQIbd.jpg', rating: 6.8, phase: 'Special' }
];

// Complete Marvel Multiverse & Legacy Movie and Series Catalogue (76 Films & Shows)
export const MARVEL_COMPLETE_CATALOGUE = [
  ...MCU_FULL_CATALOGUE,
  // ── 20th Century Fox X-Men & Wolverine Saga ──
  { id: 36657, tmdb_id: 36657, title: 'X-Men', release_year: '2000', poster_path: '/bRDAc4GogyS9ci3ow7UnInOcriN.jpg', rating: 7.0 },
  { id: 36658, tmdb_id: 36658, title: 'X2: X-Men United', release_year: '2003', poster_path: '/bst4alFUXCxISwdRUKSMhhkrX1M.jpg', rating: 7.0 },
  { id: 36668, tmdb_id: 36668, title: 'X-Men: The Last Stand', release_year: '2006', poster_path: '/a2xicU8DpKtRizOHjQLC1JyCSRS.jpg', rating: 6.4 },
  { id: 2080, tmdb_id: 2080, title: 'X-Men Origins: Wolverine', release_year: '2009', poster_path: '/yj8LbTju1p7CUJg7US2unSBk33s.jpg', rating: 6.3 },
  { id: 49538, tmdb_id: 49538, title: 'X-Men: First Class', release_year: '2011', poster_path: '/hNEokmUke0dazoBhttFN0o3L7Xv.jpg', rating: 7.3 },
  { id: 76170, tmdb_id: 76170, title: 'The Wolverine', release_year: '2013', poster_path: '/t2wVAcoRlKvEIVSbiYDb8d0QqqS.jpg', rating: 6.4 },
  { id: 127585, tmdb_id: 127585, title: 'X-Men: Days of Future Past', release_year: '2014', poster_path: '/tYfijzolzgoMOtegh1Y7j2Enorg.jpg', rating: 7.5 },
  { id: 293660, tmdb_id: 293660, title: 'Deadpool', release_year: '2016', poster_path: '/3E53WEZJqP6aM84D8CckXx4pIHw.jpg', rating: 7.6 },
  { id: 246655, tmdb_id: 246655, title: 'X-Men: Apocalypse', release_year: '2016', poster_path: '/ikA8UhYdTGpqbatFa93nIf6noSr.jpg', rating: 6.5 },
  { id: 263115, tmdb_id: 263115, title: 'Logan', release_year: '2017', poster_path: '/fnbjcRDYn6YviCcePDnGdyAkYsB.jpg', rating: 7.8 },
  { id: 383498, tmdb_id: 383498, title: 'Deadpool 2', release_year: '2018', poster_path: '/gyfPKfFYcVW54MoqhYlwwDDIfJR.jpg', rating: 7.5 },
  { id: 320288, tmdb_id: 320288, title: 'Dark Phoenix', release_year: '2019', poster_path: '/cCTJPelKGLhALq3r51A9uMonxKj.jpg', rating: 6.0 },
  { id: 340102, tmdb_id: 340102, title: 'The New Mutants', release_year: '2020', poster_path: '/xiDGcXJTvu1lazFRYip6g1eLt9c.jpg', rating: 6.0 },

  // ── Spider-Man Legacy & Sony Universe ──
  { id: 557, tmdb_id: 557, title: 'Spider-Man', release_year: '2002', poster_path: '/or6XJBVpcEbIkma0V9zshnbEtx4.jpg', rating: 7.4 },
  { id: 558, tmdb_id: 558, title: 'Spider-Man 2', release_year: '2004', poster_path: '/aGuvNAaaZuWXYQQ6N2v7DeuP6mB.jpg', rating: 7.3 },
  { id: 559, tmdb_id: 559, title: 'Spider-Man 3', release_year: '2007', poster_path: '/qFmwhVUoUSXjkKRmca5yGDEXBIj.jpg', rating: 6.5 },
  { id: 1930, tmdb_id: 1930, title: 'The Amazing Spider-Man', release_year: '2012', poster_path: '/jexoNYnPd6vVrmygwF6QZmWPFdu.jpg', rating: 6.8 },
  { id: 102382, tmdb_id: 102382, title: 'The Amazing Spider-Man 2', release_year: '2014', poster_path: '/bU7nTmvmy0h3VUP01v1T2imgH6N.jpg', rating: 6.6 },
  { id: 324857, tmdb_id: 324857, title: 'Spider-Man: Into the Spider-Verse', release_year: '2018', poster_path: '/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg', rating: 8.4 },
  { id: 569094, tmdb_id: 569094, title: 'Spider-Man: Across the Spider-Verse', release_year: '2023', poster_path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', rating: 8.4 },
  { id: 335983, tmdb_id: 335983, title: 'Venom', release_year: '2018', poster_path: '/2uNW4WbgBXL25BAbXGLnLqX71Sw.jpg', rating: 6.8 },
  { id: 580489, tmdb_id: 580489, title: 'Venom: Let There Be Carnage', release_year: '2021', poster_path: '/pzKsRuKLFmYrW5Q0q8E8G78Tcgo.jpg', rating: 6.7 },
  { id: 526896, tmdb_id: 526896, title: 'Morbius', release_year: '2022', poster_path: '/Av8Z2jZhEm1FLkFzMThzz9hndJF.jpg', rating: 5.9 },
  { id: 634492, tmdb_id: 634492, title: 'Madame Web', release_year: '2024', poster_path: '/rULWuutDcN5NvtiZi4FRPzRYWSh.jpg', rating: 5.3 },

  // ── Fantastic Four, Blade & Marvel Classics ──
  { id: 9738, tmdb_id: 9738, title: 'Fantastic Four', release_year: '2005', poster_path: '/4YMcYEFS8sFuW3soP1HVmgR3cSm.jpg', rating: 5.8 },
  { id: 1979, tmdb_id: 1979, title: 'Fantastic Four: Rise of the Silver Surfer', release_year: '2007', poster_path: '/9wRfzTcMyyzkQxVDqBHv8RwuZOv.jpg', rating: 5.6 },
  { id: 166424, tmdb_id: 166424, title: 'Fantastic Four', release_year: '2015', poster_path: '/cDroz5qSlP8xZ6tOpeYoPkBvKyL.jpg', rating: 4.4 },
  { id: 36647, tmdb_id: 36647, title: 'Blade', release_year: '1998', poster_path: '/oWT70TvbsmQaqyphCZpsnQR7R32.jpg', rating: 6.9 },
  { id: 36586, tmdb_id: 36586, title: 'Blade II', release_year: '2002', poster_path: '/wAn6VYamKbnOtfyTZ6arVtkMzDv.jpg', rating: 6.6 },
  { id: 36648, tmdb_id: 36648, title: 'Blade: Trinity', release_year: '2004', poster_path: '/6f7iXvPOnf83MaLB1JmPzUor1rr.jpg', rating: 5.9 },
  { id: 9480, tmdb_id: 9480, title: 'Daredevil', release_year: '2003', poster_path: '/oCDBwSkntYamuw8VJIxMRCtDBmi.jpg', rating: 5.3 },
  { id: 9947, tmdb_id: 9947, title: 'Elektra', release_year: '2005', poster_path: '/Z4dAOxjAHTUZO6DJ2WVAsxzwe3.jpg', rating: 5.0 },
  { id: 1250, tmdb_id: 1250, title: 'Ghost Rider', release_year: '2007', poster_path: '/4quwR1VwZouD0YF9AaD72kQAjxH.jpg', rating: 5.6 },
  { id: 71676, tmdb_id: 71676, title: 'Ghost Rider: Spirit of Vengeance', release_year: '2011', poster_path: '/xEoBT6lYfQNpSpTm8gJMTrQytiw.jpg', rating: 5.0 },
  { id: 7220, tmdb_id: 7220, title: 'The Punisher', release_year: '2004', poster_path: '/7rmA1HwYp2GKM85BL0cVwCaosGr.jpg', rating: 6.4 },
  { id: 13056, tmdb_id: 13056, title: 'Punisher: War Zone', release_year: '2008', poster_path: '/oOvKJgYUIpfswGHAdW6159bPbvM.jpg', rating: 5.9 },
  { id: 1927, tmdb_id: 1927, title: 'Hulk', release_year: '2003', poster_path: '/UllIft2jLSBaay3zQyMV4GNdfy.jpg', rating: 5.6 },

  // ── Hit Marvel Series & TV ──
  { id: 138502, tmdb_id: 138502, title: 'X-Men \'97', release_year: '2024', poster_path: '/2HKBc5UiFw8JrruHq8S1Y7TnlW0.jpg', rating: 8.7, media_type: 'tv' },
  { id: 61889, tmdb_id: 61889, title: 'Marvel\'s Daredevil', release_year: '2015', poster_path: '/QWbPaDxiB6LW2LjASknzYBvjMj.jpg', rating: 8.2, media_type: 'tv' },
  { id: 67178, tmdb_id: 67178, title: 'Marvel\'s The Punisher', release_year: '2017', poster_path: '/tM6xqRKXoloH9UchaJEyyRE9O1w.jpg', rating: 8.2, media_type: 'tv' },
  { id: 85271, tmdb_id: 85271, title: 'WandaVision', release_year: '2021', poster_path: '/ijWWwINc8h71NQ8j1LTJMFSj5wr.jpg', rating: 8.2, media_type: 'tv' },
  { id: 84958, tmdb_id: 84958, title: 'Loki', release_year: '2021', poster_path: '/kEl2t3OhXc3Zb9FBh1AuYzRTgZp.jpg', rating: 8.2, media_type: 'tv' }
];

export const FRANCHISE_COLLECTIONS = [
  {
    id: 'mcu',
    title: 'Marvel Cinematic Universe (MCU)',
    shortTitle: 'Marvel (MCU Canon)',
    emoji: '⚡',
    desc: "Marvel Studios official Sacred Timeline & Multiverse: Phase 1 through Phase 5 (all 34 canonical feature films + specials).",
    group: 'franchise',
    tag: 'MCU',
    catalogue: MCU_FULL_CATALOGUE,
    companies: ['marvel studios'],
    matcher: (m) => {
      if (!m) return false;
      const tmdbId = Number(m.tmdb_id || m.id);

      // 1. Explicit non-MCU exclusions by ID (Sony, Fox, Legacy)
      if (NON_MCU_MARVEL_IDS.has(tmdbId)) return false;

      // 2. Canonical MCU ID match
      if (MCU_CANON_IDS.has(tmdbId)) return true;

      const t = (m.title || '').toLowerCase().trim();
      if (!t || t.includes('blade runner')) return false;

      // 3. Strict Non-MCU Title Exclusions (Prevent Sony, Fox, or legacy films in MCU)
      if (t.includes('spider-man') || t.includes('spiderman')) {
        const isMcuSpidey = t.includes('homecoming') || t.includes('far from home') || t.includes('no way home') || t.includes('brand new day');
        if (!isMcuSpidey) return false;
      }
      if (t.includes('venom') || t.includes('morbius') || t.includes('madame web') || t.includes('kraven')) return false;
      if (t.includes('x-men') || t.includes('new mutants') || t === 'logan') return false;
      if (t.includes('wolverine') && !t.includes('deadpool & wolverine') && !t.includes('deadpool and wolverine')) return false;
      if (t === 'deadpool' || t === 'deadpool 2') return false;
      if (t.includes('fantastic four') && !t.includes('first steps')) return false;
      if (t.includes('fant4stic') || t.includes('silver surfer')) return false;
      if (t.includes('blade') && !t.includes('blade (202')) return false;
      if (t.includes('ghost rider')) return false;
      if (t === 'daredevil' || t === 'elektra' || t.includes('daredevil (2003)')) return false;
      if (t.includes('punisher')) return false;
      if (t === 'hulk' && (m.release_year === '2003' || (m.release_date || '').startsWith('2003'))) return false;
      if (t.includes('howard the duck')) return false;

      // Explicit MCU check by tags
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && (tg.toLowerCase() === 'mcu' || tg.toLowerCase() === 'marvel cinematic universe'))) return true;

      // Strict MCU keyword patterns
      const mcuPatterns = [
        'iron man', 'the incredible hulk', 'thor', 'captain america',
        'the avengers', 'avengers: age of ultron', 'avengers: infinity war', 'avengers: endgame', 'avengers: doomsday', 'avengers: secret wars', 'marvel\'s the avengers',
        'guardians of the galaxy', 'ant-man', 'doctor strange',
        'spider-man: homecoming', 'spider-man: far from home', 'spider-man: no way home', 'spider-man: brand new day',
        'black panther', 'captain marvel', 'the marvels', 'black widow', 'shang-chi',
        'eternals', 'deadpool & wolverine', 'deadpool and wolverine',
        'werewolf by night', 'guardians of the galaxy holiday special',
        'wandavision', 'falcon and the winter soldier', 'winter soldier', 'loki', 'what if...?',
        'hawkeye', 'moon knight', 'ms. marvel', 'she-hulk', 'secret invasion', 'echo',
        'agatha all along', 'daredevil: born again', 'thunderbolts', 'brave new world',
        'quantumania', 'love and thunder', 'wakanda forever', 'multiverse of madness',
        'ragnarok', 'civil war'
      ];
      return mcuPatterns.some(k => t.includes(k));
    }
  },
  {
    id: 'marvel',
    title: 'Marvel Complete Multiverse & Legacy',
    shortTitle: 'Marvel (Complete Multiverse)',
    emoji: '🦸‍♂️',
    desc: 'The complete Marvel multiverse: MCU canon, Fox X-Men, Spider-Man, Spider-Verse, Fantastic Four, Blade, Deadpool, Sony Universe, and hit series.',
    group: 'franchise',
    tag: 'Marvel',
    catalogue: MARVEL_COMPLETE_CATALOGUE,
    matcher: (m) => {
      if (!m) return false;
      const tmdbId = Number(m.tmdb_id || m.id);
      if (MCU_CANON_IDS.has(tmdbId) || NON_MCU_MARVEL_IDS.has(tmdbId)) return true;

      const t = (m.title || '').toLowerCase();
      if (!t || t.includes('blade runner')) return false;

      // Check tags
      if (m.tags && Array.isArray(m.tags) && m.tags.some(tg => typeof tg === 'string' && (tg.toLowerCase().includes('marvel') || tg.toLowerCase() === 'mcu' || tg.toLowerCase().includes('x-men') || tg.toLowerCase().includes('spider-man')))) return true;

      // Check production companies (Marvel Studios, Marvel Entertainment, Marvel Enterprises)
      const companies = (m.details?.production_companies || m.production_companies || []);
      if (companies.some(c => (c.name || '').toLowerCase().includes('marvel'))) return true;

      // Check collection metadata
      const colName = (m.details?.belongs_to_collection?.name || m.collection?.name || '').toLowerCase();
      if (colName.includes('marvel') || colName.includes('spider-man') || colName.includes('x-men') || colName.includes('avengers') || colName.includes('wolverine') || colName.includes('deadpool') || colName.includes('fantastic four') || colName.includes('blade')) return true;

      // Check overview
      const overview = (m.overview || '').toLowerCase();
      if (overview.includes('marvel comics') || overview.includes('marvel cinematic universe') || overview.includes('marvel superhero') || overview.includes('marvel universe')) return true;

      const allMarvelKeywords = [
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
        'howard the duck', 'big hero 6', 'x-men \'97', 'agent carter', 'agents of s.h.i.e.l.d.'
      ];
      return allMarvelKeywords.some(k => t.includes(k));
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
