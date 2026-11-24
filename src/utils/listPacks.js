import { MCU_FULL_CATALOGUE, MARVEL_COMPLETE_CATALOGUE } from './collections';
export const FRANCHISE_PACKS = [
  {
    id: 'mcu',
    name: 'Marvel Cinematic Universe (MCU)',
    emoji: '⚡',
    badge: '53 Canonical Films & Series',
    movies: MCU_FULL_CATALOGUE
  },
  {
    id: 'marvel',
    name: 'Marvel Complete Multiverse & Legacy',
    emoji: '🦸‍♂️',
    badge: '89 Films & Shows',
    movies: MARVEL_COMPLETE_CATALOGUE
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
