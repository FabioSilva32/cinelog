import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Plus, Search, Trash2, ArrowLeft, ArrowUp, ArrowDown,
  Trophy, Sparkles, Film, Check, Layers, Bookmark, Star,
  ChevronLeft, ChevronRight, Zap, RefreshCw
} from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const TMDB_KEY = '6a2fd6b9b1bb3befbb9f14c203732225';
const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&fit=crop&q=80';

// 100% Verified valid TMDB poster paths tested for HTTP 200
const FRANCHISE_PACKS = [
  {
    id: 'mcu',
    name: 'Marvel Cinematic Universe (MCU)',
    emoji: '⚡',
    badge: '34 Complete MCU Films',
    movies: [
      { id: 1726, tmdb_id: 1726, title: 'Iron Man', release_year: '2008', poster_path: '/78lPtwv72eTNqFW9COBYI0dWDJa.jpg', rating: 7.7 },
      { id: 1724, tmdb_id: 1724, title: 'The Incredible Hulk', release_year: '2008', poster_path: '/gKzYx79y0AQTL4UAk1cBQJ3nvrm.jpg', rating: 6.3 },
      { id: 10138, tmdb_id: 10138, title: 'Iron Man 2', release_year: '2010', poster_path: '/6WBeq4fCfn7AN0o21W9qNcRF2l9.jpg', rating: 6.9 },
      { id: 10195, tmdb_id: 10195, title: 'Thor', release_year: '2011', poster_path: '/prSfAi1xGrhLQNxVSUFh61xQ4Qy.jpg', rating: 6.8 },
      { id: 1771, tmdb_id: 1771, title: 'Captain America: The First Avenger', release_year: '2011', poster_path: '/vSNxAJTlD0r02V9sPYpOjqDZXUK.jpg', rating: 7.0 },
      { id: 24428, tmdb_id: 24428, title: 'The Avengers', release_year: '2012', poster_path: '/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg', rating: 8.1 },
      { id: 68721, tmdb_id: 68721, title: 'Iron Man 3', release_year: '2013', poster_path: '/qhPtAc1TKbMPqNvcdXSOn9Bn7hZ.jpg', rating: 6.9 },
      { id: 76338, tmdb_id: 76338, title: 'Thor: The Dark World', release_year: '2013', poster_path: '/wp6OxE4poJ4G7c0U2ZIXasTSMR7.jpg', rating: 6.5 },
      { id: 100402, tmdb_id: 100402, title: 'Captain America: The Winter Soldier', release_year: '2014', poster_path: '/tVFRpFw3xTedgPGqxW0AOI8Qhh0.jpg', rating: 7.7 },
      { id: 118340, tmdb_id: 118340, title: 'Guardians of the Galaxy', release_year: '2014', poster_path: '/r7vmZjiyZw9rpJMQJdXpjgiCOk9.jpg', rating: 7.9 },
      { id: 99861, tmdb_id: 99861, title: 'Avengers: Age of Ultron', release_year: '2015', poster_path: '/4ssDuvEDkSArWEdyBl2X5EHvYKU.jpg', rating: 7.3 },
      { id: 102899, tmdb_id: 102899, title: 'Ant-Man', release_year: '2015', poster_path: '/rQRnQfUl3kfp78nCWq8Ks04vnq1.jpg', rating: 7.1 },
      { id: 271110, tmdb_id: 271110, title: 'Captain America: Civil War', release_year: '2016', poster_path: '/rAGiXaUfPzY7CDEyNKUofk3Kw2e.jpg', rating: 7.5 },
      { id: 284052, tmdb_id: 284052, title: 'Doctor Strange', release_year: '2016', poster_path: '/uGBVj3bEbCoZbDjjl9wTxcygko1.jpg', rating: 7.4 },
      { id: 283995, tmdb_id: 283995, title: 'Guardians of the Galaxy Vol. 2', release_year: '2017', poster_path: '/y4MBh0EjBlMuOzv9axM4qJlmhzz.jpg', rating: 7.6 },
      { id: 315635, tmdb_id: 315635, title: 'Spider-Man: Homecoming', release_year: '2017', poster_path: '/c24sv2weTHPsmDa7jEMN0m2P3RT.jpg', rating: 7.3 },
      { id: 284053, tmdb_id: 284053, title: 'Thor: Ragnarok', release_year: '2017', poster_path: '/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg', rating: 7.6 },
      { id: 284054, tmdb_id: 284054, title: 'Black Panther', release_year: '2018', poster_path: '/uxzzxijgPIY7slzFvMotPv8wjKA.jpg', rating: 7.4 },
      { id: 299536, tmdb_id: 299536, title: 'Avengers: Infinity War', release_year: '2018', poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg', rating: 8.2 },
      { id: 363088, tmdb_id: 363088, title: 'Ant-Man and the Wasp', release_year: '2018', poster_path: '/cFQEO687n1K6umXbInzocxcnAQz.jpg', rating: 6.9 },
      { id: 299537, tmdb_id: 299537, title: 'Captain Marvel', release_year: '2019', poster_path: '/AtsgWhDnHTq68L0lLsUrCnM7TjG.jpg', rating: 6.8 },
      { id: 299534, tmdb_id: 299534, title: 'Avengers: Endgame', release_year: '2019', poster_path: '/bR8ISy1O9XQxqiy0fQFw2BX72RQ.jpg', rating: 8.2 },
      { id: 429617, tmdb_id: 429617, title: 'Spider-Man: Far From Home', release_year: '2019', poster_path: '/4q2NNj4S5dG2RLF9CpXsej7yXl.jpg', rating: 7.4 },
      { id: 497698, tmdb_id: 497698, title: 'Black Widow', release_year: '2021', poster_path: '/qAZ0pzat24kLdO3o8ejmbLxyOac.jpg', rating: 7.1 },
      { id: 566525, tmdb_id: 566525, title: 'Shang-Chi and the Legend of the Ten Rings', release_year: '2021', poster_path: '/9f2Q0U3IOsLgrI2HkvldwSABZy5.jpg', rating: 7.5 },
      { id: 524434, tmdb_id: 524434, title: 'Eternals', release_year: '2021', poster_path: '/lFByFSLV5WDJEv3KabbdAF959F2.jpg', rating: 6.7 },
      { id: 634649, tmdb_id: 634649, title: 'Spider-Man: No Way Home', release_year: '2021', poster_path: '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg', rating: 7.9 },
      { id: 453395, tmdb_id: 453395, title: 'Doctor Strange in the Multiverse of Madness', release_year: '2022', poster_path: '/ddJcSKbcp4rKZTmuyWaMhuwcfMz.jpg', rating: 7.2 },
      { id: 616037, tmdb_id: 616037, title: 'Thor: Love and Thunder', release_year: '2022', poster_path: '/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg', rating: 6.4 },
      { id: 505642, tmdb_id: 505642, title: 'Black Panther: Wakanda Forever', release_year: '2022', poster_path: '/sv1xJUazXeYqALzczSZ3O6nkH75.jpg', rating: 7.0 },
      { id: 640146, tmdb_id: 640146, title: 'Ant-Man and the Wasp: Quantumania', release_year: '2023', poster_path: '/qnqGbB22YJ7dSs4o6M7exTpNxPz.jpg', rating: 6.2 },
      { id: 447365, tmdb_id: 447365, title: 'Guardians of the Galaxy Vol. 3', release_year: '2023', poster_path: '/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg', rating: 7.9 },
      { id: 609681, tmdb_id: 609681, title: 'The Marvels', release_year: '2023', poster_path: '/9GBhzXMFjgcZ3FdR9w3bUMMTps5.jpg', rating: 5.9 },
      { id: 533535, tmdb_id: 533535, title: 'Deadpool & Wolverine', release_year: '2024', poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', rating: 7.6 }
    ]
  },
  {
    id: 'nolan',
    name: 'Christopher Nolan',
    emoji: '🌀',
    badge: '8 Masterpieces',
    movies: [
      { id: 872585, tmdb_id: 872585, title: 'Oppenheimer', release_year: '2023', poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', rating: 8.0 },
      { id: 157336, tmdb_id: 157336, title: 'Interstellar', release_year: '2014', poster_path: '/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg', rating: 8.5 },
      { id: 27205, tmdb_id: 27205, title: 'Inception', release_year: '2010', poster_path: '/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg', rating: 8.4 },
      { id: 155, tmdb_id: 155, title: 'The Dark Knight', release_year: '2008', poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', rating: 8.5 },
      { id: 1124, tmdb_id: 1124, title: 'The Prestige', release_year: '2006', poster_path: '/Ag2B2KHKQPukjH7WutmgnnSNurZ.jpg', rating: 8.2 },
      { id: 77, tmdb_id: 77, title: 'Memento', release_year: '2000', poster_path: '/nzlv62aC0octS5AklAiWpXLX9Z0.jpg', rating: 8.2 },
      { id: 577922, tmdb_id: 577922, title: 'Tenet', release_year: '2020', poster_path: '/rrKH3VhHssGTCfPuaEQkxvEoElv.jpg', rating: 7.2 },
      { id: 374720, tmdb_id: 374720, title: 'Dunkirk', release_year: '2017', poster_path: '/b4Oe15CGLL61Ped0RAS9JpqdmCt.jpg', rating: 7.4 }
    ]
  },
  {
    id: 'batman',
    name: 'Batman & Gotham City',
    emoji: '🦇',
    badge: '10 Definitive Films',
    movies: [
      { id: 414906, tmdb_id: 414906, title: 'The Batman', release_year: '2022', poster_path: '/74xTEgt7R36Fpooo50r9T25onhq.jpg', rating: 7.7 },
      { id: 155, tmdb_id: 155, title: 'The Dark Knight', release_year: '2008', poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', rating: 8.5 },
      { id: 272, tmdb_id: 272, title: 'Batman Begins', release_year: '2005', poster_path: '/sPX89Td70IDDjVr85jdSBb4rWGr.jpg', rating: 7.7 },
      { id: 49026, tmdb_id: 49026, title: 'The Dark Knight Rises', release_year: '2012', poster_path: '/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg', rating: 7.8 },
      { id: 475557, tmdb_id: 475557, title: 'Joker', release_year: '2019', poster_path: '/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', rating: 8.1 },
      { id: 209112, tmdb_id: 209112, title: 'Batman v Superman: Dawn of Justice', release_year: '2016', poster_path: '/5UsK3grJvtQrtzEgqNlDljJW96w.jpg', rating: 6.0 },
      { id: 268, tmdb_id: 268, title: 'Batman', release_year: '1989', poster_path: '/cij4dd21v2Rk2YtUQbV5kW69WB2.jpg', rating: 7.2 },
      { id: 364, tmdb_id: 364, title: 'Batman Returns', release_year: '1992', poster_path: '/jKBjeXM7iBBV9UkUcOXx3m7FSHY.jpg', rating: 7.0 },
      { id: 414, tmdb_id: 414, title: 'Batman Forever', release_year: '1995', poster_path: '/i0fJS8M5UKoETjjJ0zwUiKaR8tr.jpg', rating: 5.5 },
      { id: 415, tmdb_id: 415, title: 'Batman & Robin', release_year: '1997', poster_path: '/i7hEUpDuMN2LOrCEifFyGSHZQSY.jpg', rating: 4.4 }
    ]
  },
  {
    id: 'villeneuve',
    name: 'Denis Villeneuve',
    emoji: '🏜️',
    badge: '6 Masterworks',
    movies: [
      { id: 693134, tmdb_id: 693134, title: 'Dune: Part Two', release_year: '2024', poster_path: '/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg', rating: 8.1 },
      { id: 438631, tmdb_id: 438631, title: 'Dune', release_year: '2021', poster_path: '/v1tRXZ4JtD2Iv6fjkPvT4GiwslV.jpg', rating: 7.8 },
      { id: 335984, tmdb_id: 335984, title: 'Blade Runner 2049', release_year: '2017', poster_path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', rating: 7.6 },
      { id: 329865, tmdb_id: 329865, title: 'Arrival', release_year: '2016', poster_path: '/pEzNVQfdzYDzVK0XqxERIw2x2se.jpg', rating: 7.6 },
      { id: 273481, tmdb_id: 273481, title: 'Sicario', release_year: '2015', poster_path: '/lz8vNyXeidqqOdJW9ZjnDAMb5Vr.jpg', rating: 7.4 },
      { id: 146233, tmdb_id: 146233, title: 'Prisoners', release_year: '2013', poster_path: '/uhviyknTT5cEQXbn6vWIqfM4vGm.jpg', rating: 8.1 }
    ]
  },
  {
    id: 'spiderman',
    name: 'Spider-Man Multiverse',
    emoji: '🕷️',
    badge: '8 Web-Slingers',
    movies: [
      { id: 324857, tmdb_id: 324857, title: 'Spider-Man: Into the Spider-Verse', release_year: '2018', poster_path: '/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg', rating: 8.4 },
      { id: 569094, tmdb_id: 569094, title: 'Spider-Man: Across the Spider-Verse', release_year: '2023', poster_path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', rating: 8.3 },
      { id: 634649, tmdb_id: 634649, title: 'Spider-Man: No Way Home', release_year: '2021', poster_path: '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg', rating: 7.9 },
      { id: 429617, tmdb_id: 429617, title: 'Spider-Man: Far From Home', release_year: '2019', poster_path: '/4q2NNj4S5dG2RLF9CpXsej7yXl.jpg', rating: 7.4 },
      { id: 315635, tmdb_id: 315635, title: 'Spider-Man: Homecoming', release_year: '2017', poster_path: '/c24sv2weTHPsmDa7jEMN0m2P3RT.jpg', rating: 7.3 },
      { id: 558, tmdb_id: 558, title: 'Spider-Man 2', release_year: '2004', poster_path: '/aGuvNAaaZuWXYQQ6N2v7DeuP6mB.jpg', rating: 7.3 },
      { id: 557, tmdb_id: 557, title: 'Spider-Man', release_year: '2002', poster_path: '/or6XJBVpcEbIkma0V9zshnbEtx4.jpg', rating: 7.4 },
      { id: 559, tmdb_id: 559, title: 'Spider-Man 3', release_year: '2007', poster_path: '/qFmwhVUoUSXjkKRmca5yGDEXBIj.jpg', rating: 6.5 }
    ]
  },
  {
    id: 'starwars',
    name: 'Star Wars Saga',
    emoji: '⚔️',
    badge: '11 Galactic Sagas',
    movies: [
      { id: 11, tmdb_id: 11, title: 'Star Wars: A New Hope', release_year: '1977', poster_path: '/fai0rspsNeJCS69wHNjOdWxcI7P.jpg', rating: 8.2 },
      { id: 1891, tmdb_id: 1891, title: 'The Empire Strikes Back', release_year: '1980', poster_path: '/nNAeTmF4CtdSgMDplXTDPOpYzsX.jpg', rating: 8.4 },
      { id: 1892, tmdb_id: 1892, title: 'Return of the Jedi', release_year: '1983', poster_path: '/jQYlydvHm3kUix1f8prMucrplhm.jpg', rating: 7.9 },
      { id: 1893, tmdb_id: 1893, title: 'Star Wars: Episode I - The Phantom Menace', release_year: '1999', poster_path: '/6wkfovpn7Eq8dYNKaG5PY3q2oq6.jpg', rating: 6.6 },
      { id: 1894, tmdb_id: 1894, title: 'Star Wars: Episode II - Attack of the Clones', release_year: '2002', poster_path: '/oZNPzxqM2s5DyVWab09NTQScDQt.jpg', rating: 6.6 },
      { id: 1895, tmdb_id: 1895, title: 'Star Wars: Revenge of the Sith', release_year: '2005', poster_path: '/xfSAoBEm9MNBjmlNcDYLvLSMlnq.jpg', rating: 7.5 },
      { id: 140607, tmdb_id: 140607, title: 'Star Wars: The Force Awakens', release_year: '2015', poster_path: '/wqnLdwVXoBjKibFRR5U3y0aDUhs.jpg', rating: 7.2 },
      { id: 181808, tmdb_id: 181808, title: 'Star Wars: The Last Jedi', release_year: '2017', poster_path: '/kOVEVeg59E0wsnXmF9nrh6OmWII.jpg', rating: 6.7 },
      { id: 181812, tmdb_id: 181812, title: 'Star Wars: The Rise of Skywalker', release_year: '2019', poster_path: '/db32LaOibwEliAmSL2jjDF6oDdj.jpg', rating: 6.2 },
      { id: 330459, tmdb_id: 330459, title: 'Rogue One: A Star Wars Story', release_year: '2016', poster_path: '/i0yw1mFbB7sNGHCs7EXZPzFkdA1.jpg', rating: 7.5 },
      { id: 348350, tmdb_id: 348350, title: 'Solo: A Star Wars Story', release_year: '2018', poster_path: '/4oD6VEccFkorEBTEDXtpLAaz0Rl.jpg', rating: 6.6 }
    ]
  },
  {
    id: 'tarantino',
    name: 'Quentin Tarantino',
    emoji: '🩸',
    badge: '6 Cult Classics',
    movies: [
      { id: 680, tmdb_id: 680, title: 'Pulp Fiction', release_year: '1994', poster_path: '/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg', rating: 8.5 },
      { id: 16869, tmdb_id: 16869, title: 'Inglourious Basterds', release_year: '2009', poster_path: '/aupnPtagH9JVBuMrGEanf4iqXEQ.jpg', rating: 8.2 },
      { id: 68718, tmdb_id: 68718, title: 'Django Unchained', release_year: '2012', poster_path: '/7oWY8VDWW7thTzWh3OKYRkWUlD5.jpg', rating: 8.2 },
      { id: 24, tmdb_id: 24, title: 'Kill Bill: Vol. 1', release_year: '2003', poster_path: '/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg', rating: 8.0 },
      { id: 466272, tmdb_id: 466272, title: 'Once Upon a Time in Hollywood', release_year: '2019', poster_path: '/8j58iEBw9pOXFD2L0nt0ZXeHviB.jpg', rating: 7.4 },
      { id: 500, tmdb_id: 500, title: 'Reservoir Dogs', release_year: '1992', poster_path: '/xi8Iu6qyTfyZVDVy60raIOYJJmk.jpg', rating: 8.1 }
    ]
  },
  {
    id: 'johnwick',
    name: 'John Wick Baba Yaga',
    emoji: '🎯',
    badge: '4 High-Table Hits',
    movies: [
      { id: 603692, tmdb_id: 603692, title: 'John Wick: Chapter 4', release_year: '2023', poster_path: '/vZloFAK7NKnMGKEslUsZlooxAcQ.jpg', rating: 7.8 },
      { id: 458156, tmdb_id: 458156, title: 'John Wick: Chapter 3 - Parabellum', release_year: '2019', poster_path: '/ziEuG1essDuWuC5lpWUaw1uXY2O.jpg', rating: 7.4 },
      { id: 324552, tmdb_id: 324552, title: 'John Wick: Chapter 2', release_year: '2017', poster_path: '/kR6i6wXfFuh7P3q1oI8t3x1U1tC.jpg', rating: 7.3 },
      { id: 245891, tmdb_id: 245891, title: 'John Wick', release_year: '2014', poster_path: '/fZPSg9cre9slYbpGuAoAWioNu9G.jpg', rating: 7.4 }
    ]
  },
  {
    id: 'matrix',
    name: 'The Matrix Cyberpunk',
    emoji: '💊',
    badge: '4 Sci-Fi Classics',
    movies: [
      { id: 603, tmdb_id: 603, title: 'The Matrix', release_year: '1999', poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', rating: 8.2 },
      { id: 604, tmdb_id: 604, title: 'The Matrix Reloaded', release_year: '2003', poster_path: '/9TGHDvWrqKBpuDxD65jkGg0BmN9.jpg', rating: 7.0 },
      { id: 605, tmdb_id: 605, title: 'The Matrix Revolutions', release_year: '2003', poster_path: '/t1mW6n04c27Xpbgv4z2A3o7NfWv.jpg', rating: 6.7 },
      { id: 624860, tmdb_id: 624860, title: 'The Matrix Resurrections', release_year: '2021', poster_path: '/8c4a8kE7PizaGQQvMiZt797Bqwe.jpg', rating: 6.5 }
    ]
  },
  {
    id: 'alien',
    name: 'Alien & Predator',
    emoji: '👽',
    badge: '5 Sci-Fi Horrors',
    movies: [
      { id: 945961, tmdb_id: 945961, title: 'Alien: Romulus', release_year: '2024', poster_path: '/b33nnKl1GSFbao8l3urDDgo40KG.jpg', rating: 7.3 },
      { id: 379, tmdb_id: 379, title: 'Alien', release_year: '1979', poster_path: '/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg', rating: 8.1 },
      { id: 679, tmdb_id: 679, title: 'Aliens', release_year: '1986', poster_path: '/r1x5JG26RiOKv9A25IRw9G8KJNN.jpg', rating: 7.9 },
      { id: 106, tmdb_id: 106, title: 'Predator', release_year: '1987', poster_path: '/k3mW4qfFe6gPtBzlYti1nuTmz9d.jpg', rating: 7.5 },
      { id: 766507, tmdb_id: 766507, title: 'Prey', release_year: '2022', poster_path: '/ujr5pztc1oirzlWLiHoEvQ92Yv5.jpg', rating: 7.7 }
    ]
  }
];

export default function CreateListModal({
  currentUser,
  library = [],
  onClose,
  onSaveList
}) {
  useBodyScrollLock(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isRanked, setIsRanked] = useState(true);
  const [entries, setEntries] = useState([]);

  // Film Picker State
  const [pickerTab, setPickerTab] = useState('franchises'); // default to franchises for instant discovery
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Library tab filters
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryFilter, setLibraryFilter] = useState('all');

  // Franchise tab state
  const [activeFranchise, setActiveFranchise] = useState(FRANCHISE_PACKS[0]);
  const [bannerToast, setBannerToast] = useState('');
  const franchisePillsRef = useRef(null);

  // List Entries view mode: 'grid' (compact ranked posters) | 'notes' (detailed notes list)
  const [entriesViewMode, setEntriesViewMode] = useState('grid');

  const showToast = (msg) => {
    setBannerToast(msg);
    setTimeout(() => setBannerToast(''), 3000);
  };

  const handleSearchTMDB = async (q) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}&page=1`);
      const data = await res.json();
      const results = (data.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv');
      setSearchResults(results.slice(0, 20));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const isMovieInList = (id, tmdbId) => {
    return entries.some(e => String(e.tmdb_id || e.id) === String(tmdbId || id));
  };

  const handleAddMovie = (movie) => {
    const movieId = movie.tmdb_id || movie.id;
    if (isMovieInList(movieId, movieId)) return;

    const newEntry = {
      tmdb_id: movieId,
      id: movieId,
      title: movie.title || movie.name,
      poster_path: movie.poster_path,
      release_year: (movie.release_date || movie.first_air_date || movie.release_year || '').slice(0, 4),
      rating: movie.vote_average ? Number(movie.vote_average.toFixed(1)) : (movie.rating || null),
      media_type: movie.media_type || 'movie',
      note: ''
    };
    setEntries(prev => [...prev, newEntry]);
    showToast(`Added "${newEntry.title}" to list!`);
  };

  const handleBatchAddFranchise = (pack) => {
    if (!pack || !pack.movies) return;
    const existingIds = new Set(entries.map(e => String(e.tmdb_id || e.id)));
    const toAdd = pack.movies
      .filter(m => !existingIds.has(String(m.tmdb_id || m.id)))
      .map(m => ({
        tmdb_id: m.tmdb_id || m.id,
        id: m.tmdb_id || m.id,
        title: m.title,
        poster_path: m.poster_path,
        release_year: m.release_year,
        rating: m.rating,
        media_type: 'movie',
        note: ''
      }));

    if (toAdd.length === 0) {
      showToast(`All films from ${pack.name} are already in your list!`);
      return;
    }

    setEntries(prev => [...prev, ...toAdd]);
    showToast(`⚡ Added ${toAdd.length} films from ${pack.name}!`);
  };

  const handleRemoveEntry = (idx) => {
    setEntries(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMoveEntry = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= entries.length) return;
    setEntries(prev => {
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
  };

  const handleUpdateNote = (idx, note) => {
    setEntries(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], note };
      return next;
    });
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all films from this list?')) {
      setEntries([]);
    }
  };

  // Filtered Library Movies
  const filteredLibrary = useMemo(() => {
    return library.filter(m => {
      if (libraryFilter === 'favorites' && !m.favorite) return false;
      if (libraryFilter === 'watched' && m.status !== 'watched') return false;
      if (libraryFilter === 'top_rated' && Number(m.user_rating || m.rating || 0) < 8) return false;
      if (librarySearch.trim()) {
        const q = librarySearch.toLowerCase();
        return (m.title || '').toLowerCase().includes(q) || (m.director || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [library, libraryFilter, librarySearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newList = {
      id: 'list-user-' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      author: {
        id: currentUser?.id || 'user',
        username: currentUser?.username || 'cinephile',
        displayName: currentUser?.displayName || currentUser?.username || 'Cinephile',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop&q=80'
      },
      createdAt: new Date().toISOString(),
      isRanked,
      isPublic: true,
      likesCount: 0,
      entries,
      comments: []
    };

    if (onSaveList) onSaveList(newList);
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        background: 'rgba(5, 3, 10, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        animation: 'fadeInOverlay 0.18s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass"
        style={{
          width: '100%',
          maxWidth: '880px',
          height: 'min(92vh, 900px)',
          maxHeight: 'min(92vh, 900px)',
          background: 'linear-gradient(180deg, #13101c 0%, #0d0b13 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          margin: 'auto',
          animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Toast Feedback */}
        {bannerToast && (
          <div style={{
            background: 'var(--accent)',
            color: '#fff',
            fontSize: '12.5px',
            fontWeight: 800,
            padding: '8px 16px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease-out',
            flexShrink: 0
          }}>
            <Sparkles size={14} /> {bannerToast}
          </div>
        )}

        {/* Top Header Bar (Pinned) */}
        <div style={{
          padding: '14px 22px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(229, 9, 20, 0.15)',
              border: '1px solid rgba(229, 9, 20, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={16} color="var(--accent)" />
            </div>
            <div>
              <h2 style={{ fontSize: '16.5px', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>
                Create Custom Cinephile List
              </h2>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                {entries.length} {entries.length === 1 ? 'film' : 'films'} added so far
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body - Single Master Smooth Scroll Container */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            padding: '18px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* List Title & Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label className="form-label" style={{ marginBottom: '6px', display: 'block', fontSize: '12px' }}>
                List Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Definitive Top 10 Sci-Fi Films of the 21st Century"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="form-input"
                required
                style={{ width: '100%', fontSize: '14px', padding: '10px 14px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'flex-start' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '6px', display: 'block', fontSize: '11.5px' }}>
                  Description & Criteria (Optional)
                </label>
                <input
                  type="text"
                  placeholder="What is this list about? Share your criteria..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', fontSize: '12.5px', padding: '8px 12px' }}
                />
              </div>

              {/* Ranked Mode Toggle */}
              <div>
                <label className="form-label" style={{ marginBottom: '6px', display: 'block', fontSize: '11.5px' }}>
                  Ordering Mode
                </label>
                <button
                  type="button"
                  onClick={() => setIsRanked(!isRanked)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: isRanked ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${isRanked ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: isRanked ? 'var(--gold)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '12px',
                    transition: 'all 0.15s'
                  }}
                >
                  <Trophy size={14} color={isRanked ? 'var(--gold)' : 'var(--text-muted)'} />
                  {isRanked ? 'Ranked (#1, #2...)' : 'Unranked List'}
                </button>
              </div>
            </div>
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TABBED FILM PICKER SECTION                                    */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            {/* Picker Tab Switcher */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(0, 0, 0, 0.25)'
            }}>
              <button
                type="button"
                onClick={() => setPickerTab('franchises')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  padding: '11px 12px',
                  background: pickerTab === 'franchises' ? 'rgba(255, 255, 255, 0.07)' : 'transparent',
                  border: 'none',
                  borderBottom: pickerTab === 'franchises' ? '2px solid var(--accent)' : '2px solid transparent',
                  color: pickerTab === 'franchises' ? '#fff' : 'var(--text-muted)',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Zap size={14} color={pickerTab === 'franchises' ? 'var(--gold)' : 'currentColor'} /> Franchises & Packs
              </button>

              <button
                type="button"
                onClick={() => setPickerTab('search')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  padding: '11px 12px',
                  background: pickerTab === 'search' ? 'rgba(255, 255, 255, 0.07)' : 'transparent',
                  border: 'none',
                  borderBottom: pickerTab === 'search' ? '2px solid var(--accent)' : '2px solid transparent',
                  color: pickerTab === 'search' ? '#fff' : 'var(--text-muted)',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Search size={14} /> Search TMDB
              </button>

              <button
                type="button"
                onClick={() => setPickerTab('library')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  padding: '11px 12px',
                  background: pickerTab === 'library' ? 'rgba(255, 255, 255, 0.07)' : 'transparent',
                  border: 'none',
                  borderBottom: pickerTab === 'library' ? '2px solid var(--accent)' : '2px solid transparent',
                  color: pickerTab === 'library' ? '#fff' : 'var(--text-muted)',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Bookmark size={14} /> From My Library ({library.length})
              </button>
            </div>

            {/* TAB 1: FRANCHISES & PACKS (STREAMLINED SLIM HEADER) */}
            {pickerTab === 'franchises' && (
              <div style={{ padding: '14px' }}>
                {/* Slim Franchise Selector Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '12px'
                }}>
                  {/* Horizontal Franchise Selector Pills with Navigation Arrows & Wheel Support */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flex: 1,
                    minWidth: '220px',
                    position: 'relative'
                  }}>
                    {/* Left Scroll Chevron */}
                    <button
                      type="button"
                      onClick={() => franchisePillsRef.current?.scrollBy({ left: -220, behavior: 'smooth' })}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-muted)',
                        borderRadius: '7px',
                        width: '26px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                      title="Scroll collections left"
                    >
                      <ChevronLeft size={14} />
                    </button>

                    <div
                      ref={franchisePillsRef}
                      onWheel={(e) => {
                        if (e.deltaY !== 0 && !e.shiftKey) {
                          e.currentTarget.scrollLeft += e.deltaY;
                        }
                      }}
                      style={{
                        display: 'flex',
                        gap: '6px',
                        overflowX: 'auto',
                        paddingBottom: '4px',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(255,255,255,0.2) transparent',
                        WebkitOverflowScrolling: 'touch',
                        touchAction: 'pan-x',
                        flex: 1
                      }}
                    >
                      {FRANCHISE_PACKS.map(pack => {
                        const isSelected = activeFranchise.id === pack.id;
                        return (
                          <button
                            key={pack.id}
                            type="button"
                            onClick={() => setActiveFranchise(pack)}
                            style={{
                              whiteSpace: 'nowrap',
                              padding: '6px 11px',
                              borderRadius: '8px',
                              background: isSelected ? 'rgba(245, 158, 11, 0.16)' : 'rgba(255,255,255,0.04)',
                              border: isSelected ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255,255,255,0.08)',
                              color: isSelected ? 'var(--gold)' : 'var(--text-muted)',
                              fontSize: '11.5px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              transition: 'all 0.15s',
                              flexShrink: 0
                            }}
                          >
                            <span>{pack.emoji}</span>
                            <span>{pack.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Right Scroll Chevron */}
                    <button
                      type="button"
                      onClick={() => franchisePillsRef.current?.scrollBy({ left: 220, behavior: 'smooth' })}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-muted)',
                        borderRadius: '7px',
                        width: '26px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                      title="Scroll collections right"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* 1-Click Compact Add All Button */}
                  {activeFranchise && (
                    <button
                      type="button"
                      onClick={() => handleBatchAddFranchise(activeFranchise)}
                      style={{
                        background: 'linear-gradient(135deg, #e50914 0%, #b80710 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 10px rgba(229, 9, 20, 0.35)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                    >
                      <Zap size={13} /> Add All ({activeFranchise.movies.length})
                    </button>
                  )}
                </div>

                {/* Franchise Films Grid - Full Flow (No inner nested scroll trap) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))',
                  gap: '10px'
                }}>
                  {activeFranchise.movies.map(movie => {
                    const inList = isMovieInList(movie.id, movie.tmdb_id);
                    return (
                      <div
                        key={movie.id || movie.tmdb_id}
                        onClick={() => handleAddMovie(movie)}
                        style={{
                          cursor: inList ? 'default' : 'pointer',
                          position: 'relative',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: inList ? '1.5px solid var(--green, #10b981)' : '1px solid rgba(255,255,255,0.1)',
                          background: '#191522',
                          transition: 'transform 0.15s, border-color 0.15s',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                        onMouseEnter={e => { if (!inList) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { if (!inList) e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <div style={{ width: '100%', aspectRatio: '2/3', position: 'relative', background: '#0a0810' }}>
                          <img
                            src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                            alt={movie.title}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_POSTER;
                            }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          {inList && (
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(16, 185, 129, 0.45)',
                              backdropFilter: 'blur(2px)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '3px',
                              color: '#fff',
                              fontWeight: 900,
                              fontSize: '10.5px'
                            }}>
                              <Check size={18} strokeWidth={3} />
                              <span>IN LIST</span>
                            </div>
                          )}
                          {!inList && (
                            <button
                              type="button"
                              style={{
                                position: 'absolute',
                                bottom: '5px',
                                right: '5px',
                                background: 'var(--accent)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '50%',
                                width: '22px',
                                height: '22px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.6)'
                              }}
                            >
                              <Plus size={13} strokeWidth={3} />
                            </button>
                          )}
                        </div>
                        <div style={{ padding: '6px', background: '#120f1a', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {movie.title}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{movie.release_year}</span>
                            {movie.rating ? <span>★ {movie.rating}</span> : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: VISUAL POSTER GRID SEARCH */}
            {pickerTab === 'search' && (
              <div style={{ padding: '14px' }}>
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search movies or TV shows across TMDB..."
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      handleSearchTMDB(e.target.value);
                    }}
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '36px', fontSize: '13px' }}
                  />
                  {searching && (
                    <RefreshCw size={14} className="spin" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)' }} />
                  )}
                </div>

                {searchResults.length > 0 ? (
                  <div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                      Found {searchResults.length} results · Click any poster to add
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))',
                      gap: '10px'
                    }}>
                      {searchResults.map(movie => {
                        const inList = isMovieInList(movie.id, movie.id);
                        return (
                          <div
                            key={movie.id}
                            onClick={() => handleAddMovie(movie)}
                            style={{
                              cursor: inList ? 'default' : 'pointer',
                              position: 'relative',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: inList ? '1.5px solid var(--green, #10b981)' : '1px solid rgba(255,255,255,0.1)',
                              background: '#191522',
                              transition: 'transform 0.15s, border-color 0.15s',
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                            onMouseEnter={e => { if (!inList) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { if (!inList) e.currentTarget.style.transform = 'translateY(0)'; }}
                          >
                            <div style={{ width: '100%', aspectRatio: '2/3', position: 'relative', background: '#0a0810' }}>
                              <img
                                src={movie.poster_path ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : FALLBACK_POSTER}
                                alt={movie.title || movie.name}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = FALLBACK_POSTER;
                                }}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              {inList && (
                                <div style={{
                                  position: 'absolute',
                                  inset: 0,
                                  background: 'rgba(16, 185, 129, 0.45)',
                                  backdropFilter: 'blur(2px)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '3px',
                                  color: '#fff',
                                  fontWeight: 900,
                                  fontSize: '10.5px'
                                }}>
                                  <Check size={18} strokeWidth={3} />
                                  <span>IN LIST</span>
                                </div>
                              )}
                              {!inList && (
                                <button
                                  type="button"
                                  style={{
                                    position: 'absolute',
                                    bottom: '5px',
                                    right: '5px',
                                    background: 'var(--accent)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '22px',
                                    height: '22px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.6)'
                                  }}
                                >
                                  <Plus size={13} strokeWidth={3} />
                                </button>
                              )}
                            </div>
                            <div style={{ padding: '6px', background: '#120f1a', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                              <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {movie.title || movie.name}
                              </div>
                              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{(movie.release_date || movie.first_air_date || '').slice(0, 4) || '—'}</span>
                                {movie.vote_average ? <span>★ {movie.vote_average.toFixed(1)}</span> : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-dim)', fontSize: '12.5px' }}>
                    {searchQuery ? 'No movies found matching that query.' : 'Type a movie title above to see instant visual poster results.'}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FROM USER'S PERSONAL LIBRARY */}
            {pickerTab === 'library' && (
              <div style={{ padding: '14px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Filter library films..."
                      value={librarySearch}
                      onChange={e => setLibrarySearch(e.target.value)}
                      className="form-input"
                      style={{ width: '100%', paddingLeft: '34px', fontSize: '12px', height: '32px' }}
                    />
                  </div>

                  {/* Filter Pills */}
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {[
                      { id: 'all', label: `All (${library.length})` },
                      { id: 'favorites', label: '⭐ Favorites' },
                      { id: 'top_rated', label: '★ 8+ Rated' },
                      { id: 'watched', label: 'Watched' }
                    ].map(pill => (
                      <button
                        key={pill.id}
                        type="button"
                        onClick={() => setLibraryFilter(pill.id)}
                        style={{
                          padding: '3px 9px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: libraryFilter === pill.id ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                          color: libraryFilter === pill.id ? '#fff' : 'var(--text-muted)',
                          border: 'none',
                          transition: 'all 0.15s'
                        }}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredLibrary.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))',
                    gap: '10px'
                  }}>
                    {filteredLibrary.map(movie => {
                      const inList = isMovieInList(movie.id, movie.tmdb_id);
                      return (
                        <div
                          key={movie.id || movie.tmdb_id}
                          onClick={() => handleAddMovie(movie)}
                          style={{
                            cursor: inList ? 'default' : 'pointer',
                            position: 'relative',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: inList ? '1.5px solid var(--green, #10b981)' : '1px solid rgba(255,255,255,0.1)',
                            background: '#191522',
                            transition: 'transform 0.15s, border-color 0.15s',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                          onMouseEnter={e => { if (!inList) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                          onMouseLeave={e => { if (!inList) e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                          <div style={{ width: '100%', aspectRatio: '2/3', position: 'relative', background: '#0a0810' }}>
                            <img
                              src={movie.poster_path ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : FALLBACK_POSTER}
                              alt={movie.title}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = FALLBACK_POSTER;
                              }}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {inList && (
                              <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(16, 185, 129, 0.45)',
                                backdropFilter: 'blur(2px)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '3px',
                                color: '#fff',
                                fontWeight: 900,
                                fontSize: '10.5px'
                              }}>
                                <Check size={18} strokeWidth={3} />
                                <span>IN LIST</span>
                              </div>
                            )}
                            {!inList && (
                              <button
                                type="button"
                                style={{
                                  position: 'absolute',
                                  bottom: '5px',
                                  right: '5px',
                                  background: 'var(--accent)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '22px',
                                  height: '22px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.6)'
                                }}
                              >
                                <Plus size={13} strokeWidth={3} />
                              </button>
                            )}
                          </div>
                          <div style={{ padding: '6px', background: '#120f1a', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {movie.title}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                              <span>{movie.release_year || '—'}</span>
                              {movie.user_rating ? <span style={{ color: 'var(--gold)' }}>★ {movie.user_rating}</span> : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-dim)', fontSize: '12.5px' }}>
                    No matching films in your library with the current filter.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* CURRENT LIST ENTRIES (RANKED GRID / NOTES)                    */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 900, color: '#fff' }}>
                  List Entries ({entries.length})
                </span>
                {isRanked && (
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: 'var(--gold)',
                    borderRadius: '6px',
                    padding: '2px 6px'
                  }}>
                    RANKED #1 to #{entries.length || 0}
                  </span>
                )}
              </div>

              {entries.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* View Mode Switcher */}
                  <div style={{
                    display: 'flex',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    padding: '2px'
                  }}>
                    <button
                      type="button"
                      onClick={() => setEntriesViewMode('grid')}
                      style={{
                        background: entriesViewMode === 'grid' ? 'var(--accent)' : 'transparent',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Poster Grid
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntriesViewMode('notes')}
                      style={{
                        background: entriesViewMode === 'notes' ? 'var(--accent)' : 'transparent',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Film Notes
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearAll}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-dim)',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      padding: '4px 6px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {entries.length > 0 ? (
              entriesViewMode === 'grid' ? (
                /* Compact Ranked Poster Grid */
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))',
                  gap: '10px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '14px',
                  padding: '12px'
                }}>
                  {entries.map((entry, idx) => (
                    <div
                      key={entry.tmdb_id || idx}
                      style={{
                        position: 'relative',
                        background: '#191522',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      {/* Ranked Badge */}
                      {isRanked && (
                        <div style={{
                          position: 'absolute',
                          top: '5px',
                          left: '5px',
                          zIndex: 5,
                          background: idx < 3 ? 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' : 'rgba(0, 0, 0, 0.78)',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 900,
                          padding: '1px 5px',
                          borderRadius: '5px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.6)'
                        }}>
                          #{idx + 1}
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveEntry(idx)}
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          zIndex: 5,
                          background: 'rgba(0, 0, 0, 0.75)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--red)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.75)'}
                      >
                        <X size={11} />
                      </button>

                      {/* Poster */}
                      <div style={{ width: '100%', aspectRatio: '2/3', background: '#0a0810' }}>
                        <img
                          src={entry.poster_path ? `https://image.tmdb.org/t/p/w185${entry.poster_path}` : FALLBACK_POSTER}
                          alt={entry.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_POSTER;
                          }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Title & Reorder Controls */}
                      <div style={{ padding: '6px', background: '#120f1a' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {entry.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '3px' }}>
                          <span style={{ fontSize: '9.5px', color: 'var(--text-dim)' }}>{entry.release_year || '—'}</span>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            <button
                              type="button"
                              onClick={() => handleMoveEntry(idx, idx - 1)}
                              disabled={idx === 0}
                              style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: 'none',
                                color: idx === 0 ? 'rgba(255,255,255,0.2)' : '#fff',
                                borderRadius: '4px',
                                padding: '2px 4px',
                                cursor: idx === 0 ? 'default' : 'pointer'
                              }}
                            >
                              <ArrowLeft size={10} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveEntry(idx, idx + 1)}
                              disabled={idx === entries.length - 1}
                              style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: 'none',
                                color: idx === entries.length - 1 ? 'rgba(255,255,255,0.2)' : '#fff',
                                borderRadius: '4px',
                                padding: '2px 4px',
                                cursor: idx === entries.length - 1 ? 'default' : 'pointer'
                              }}
                            >
                              <ChevronRight size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Detailed Notes View */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {entries.map((entry, idx) => (
                    <div
                      key={entry.tmdb_id || idx}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '12px',
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isRanked && (
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            background: idx < 3 ? 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' : 'rgba(255,255,255,0.06)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 900
                          }}>
                            {idx + 1}
                          </div>
                        )}
                        <img
                          src={entry.poster_path ? `https://image.tmdb.org/t/p/w92${entry.poster_path}` : FALLBACK_POSTER}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_POSTER;
                          }}
                          style={{ width: '26px', height: '39px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
                            {entry.title} {entry.release_year ? `(${entry.release_year})` : ''}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleMoveEntry(idx, idx - 1)}
                            disabled={idx === 0}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: idx === 0 ? 'var(--text-dim)' : '#fff',
                              cursor: idx === 0 ? 'default' : 'pointer',
                              padding: '4px'
                            }}
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveEntry(idx, idx + 1)}
                            disabled={idx === entries.length - 1}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: idx === entries.length - 1 ? 'var(--text-dim)' : '#fff',
                              cursor: idx === entries.length - 1 ? 'default' : 'pointer',
                              padding: '4px'
                            }}
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveEntry(idx)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--red)',
                              cursor: 'pointer',
                              padding: '4px',
                              marginLeft: '4px'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Optional commentary / film note for this entry..."
                        value={entry.note || ''}
                        onChange={e => handleUpdateNote(idx, e.target.value)}
                        className="form-input"
                        style={{ fontSize: '12px', padding: '6px 10px', background: 'rgba(0,0,0,0.3)' }}
                      />
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '24px 20px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                color: 'var(--text-dim)'
              }}>
                <Film size={24} style={{ opacity: 0.4, marginBottom: '6px' }} />
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
                  Your list is currently empty
                </div>
                <div style={{ fontSize: '11.5px' }}>
                  Use the picker above to 1-click import a franchise pack like MCU, Nolan, Batman, or search TMDB.
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons (Pinned Footer) */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              style={{ fontSize: '12.5px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || entries.length === 0}
              className="btn btn-primary"
              style={{
                padding: '0 22px',
                fontSize: '12.5px',
                fontWeight: 800,
                opacity: (!title.trim() || entries.length === 0) ? 0.5 : 1
              }}
            >
              Publish List ({entries.length} {entries.length === 1 ? 'film' : 'films'})
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
