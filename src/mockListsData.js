// Pre-seeded Cinephile Community Lists (Letterboxd-style) for CineLog
import { ELENA_PROFILE } from './mockData';

export const INITIAL_COMMUNITY_LISTS = [
  {
    id: 'list-elena-35mm',
    title: '35mm Modern Masterpieces: The Pinnacle of 21st Century Cinema',
    description: 'Films shot on celluloid or with breathtaking anamorphic lenses that redefine what cinematic scale can be. Focus on sound design, auteur vision, practical effects, and worldbuilding that stays in your bones.',
    author: {
      id: ELENA_PROFILE.id,
      username: ELENA_PROFILE.username,
      displayName: ELENA_PROFILE.displayName,
      avatar: ELENA_PROFILE.avatar
    },
    createdAt: '2026-10-12T14:30:00Z',
    isRanked: true,
    isPublic: true,
    likesCount: 142,
    entries: [
      {
        tmdb_id: 693134,
        title: 'Dune: Part Two',
        poster_path: '/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
        release_year: '2024',
        rating: 9.8,
        media_type: 'movie',
        note: 'Monolithic scale. Greig Fraser’s IMAX cinematography and Hans Zimmer’s brass frequencies create a transcendent theater experience.'
      },
      {
        tmdb_id: 27205,
        title: 'Inception',
        poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
        release_year: '2010',
        rating: 10.0,
        media_type: 'movie',
        note: 'The gold standard of architectural cinema. The rotating corridor sequence remains the greatest practical stunt work in modern film history.'
      },
      {
        tmdb_id: 335984,
        title: 'Blade Runner 2049',
        poster_path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
        release_year: '2017',
        rating: 9.8,
        media_type: 'movie',
        note: 'Roger Deakins’ visual magnum opus. Meditative pacing, hypnotic silhouettes in neon orange, and an aching emotional core.'
      },
      {
        tmdb_id: 157336,
        title: 'Interstellar',
        poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        release_year: '2014',
        rating: 9.9,
        media_type: 'movie',
        note: 'The organ crescendo during the docking sequence makes this the definitive space odyssey of our generation. Pure cinema.'
      },
      {
        tmdb_id: 872585,
        title: 'Oppenheimer',
        poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        release_year: '2023',
        rating: 9.4,
        media_type: 'movie',
        note: 'A breathless psychological thriller disguised as a biopic. Cillian Murphy’s haunted stare carries the weight of a transformed world.'
      }
    ],
    comments: [
      {
        id: 'comm-1',
        user: {
          id: 'user-cinephile-01',
          username: 'marcus_films',
          displayName: 'Marcus Vance',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop&q=80'
        },
        text: 'Arrival was robbed of a top 5 spot here, but this top 3 is absolutely indisputable.',
        createdAt: '2026-10-13T16:20:00Z'
      },
      {
        id: 'comm-2',
        user: {
          id: ELENA_PROFILE.id,
          username: ELENA_PROFILE.username,
          displayName: ELENA_PROFILE.displayName,
          avatar: ELENA_PROFILE.avatar
        },
        text: 'Marcus, Arrival was sitting at #6 on my notebook draft! Denis’ run from 2015 to 2024 is simply historic.',
        createdAt: '2026-10-13T17:05:00Z'
      }
    ]
  },
  {
    id: 'list-cinelog-scifi',
    title: 'Mind-Bending Sci-Fi That Stays With You For Weeks',
    description: 'High-concept physics, time dilation, artificial consciousness, and cosmic dread. Films crafted for late-night rewatches with headphones on.',
    author: {
      id: 'cinelog-editorial',
      username: 'cinelog_curator',
      displayName: 'CineLog Editorial',
      avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&fit=crop&q=80'
    },
    createdAt: '2026-10-08T11:00:00Z',
    isRanked: false,
    isPublic: true,
    likesCount: 98,
    entries: [
      {
        tmdb_id: 157336,
        title: 'Interstellar',
        poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        release_year: '2014',
        rating: 9.9,
        media_type: 'movie',
        note: 'Time dilation as an emotional weapon. The message tape scene still destroys me.'
      },
      {
        tmdb_id: 27205,
        title: 'Inception',
        poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
        release_year: '2010',
        rating: 10.0,
        media_type: 'movie',
        note: 'Four dream layers running simultaneously in different time dimensions.'
      },
      {
        tmdb_id: 603,
        title: 'The Matrix',
        poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
        release_year: '1999',
        rating: 9.7,
        media_type: 'movie',
        note: 'Changed action cinema forever and predicted modern digital alienation.'
      },
      {
        tmdb_id: 335984,
        title: 'Blade Runner 2049',
        poster_path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
        release_year: '2017',
        rating: 9.8,
        media_type: 'movie',
        note: 'What does it truly mean to possess a soul? A miracle sequel.'
      },
      {
        tmdb_id: 129,
        title: 'Spirited Away',
        poster_path: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
        release_year: '2001',
        rating: 9.6,
        media_type: 'movie',
        note: 'Surreal spiritual metaphysics and Miyazaki’s greatest imaginative triumph.'
      }
    ],
    comments: [
      {
        id: 'comm-3',
        user: {
          id: 'user-02',
          username: 'leo_cinema',
          displayName: 'Leo Sterling',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=crop&q=80'
        },
        text: 'The sound mix on Interstellar in Dolby Cinema was physically vibrating through the floorboards.',
        createdAt: '2026-10-10T09:12:00Z'
      }
    ]
  },
  {
    id: 'list-cinelog-neon-noir',
    title: 'Late Night Neo-Noir & Neon Rain',
    description: 'Cynical detectives, rain-slicked asphalt, flickering tungsten bulbs, and tragic antiheroes caught in urban labyrinths.',
    author: {
      id: 'cinelog-editorial',
      username: 'cinelog_curator',
      displayName: 'CineLog Editorial',
      avatar: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=150&fit=crop&q=80'
    },
    createdAt: '2026-10-04T19:40:00Z',
    isRanked: true,
    isPublic: true,
    likesCount: 86,
    entries: [
      {
        tmdb_id: 414906,
        title: 'The Batman',
        poster_path: '/74xTEgt7R36Fpooo50r9T25onhq.jpg',
        release_year: '2022',
        rating: 8.8,
        media_type: 'movie',
        note: 'Fincher’s Se7en reimagined inside Gotham. Pattinson’s voiceover diary is legendary.'
      },
      {
        tmdb_id: 335984,
        title: 'Blade Runner 2049',
        poster_path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
        release_year: '2017',
        rating: 9.8,
        media_type: 'movie',
        note: 'The raining neon billboards and yellow-tinted ruins of Las Vegas.'
      },
      {
        tmdb_id: 155,
        title: 'The Dark Knight',
        poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        release_year: '2008',
        rating: 9.5,
        media_type: 'movie',
        note: 'A grand modern crime epic where the villain exposes the hypocrisy of order.'
      }
    ],
    comments: []
  }
];
