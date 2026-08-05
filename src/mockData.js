export const MOCK_USERS = [
  {
    username: "cinema_guru",
    displayName: "Elena Vance",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    bio: "Writer & Film Historian. Watching everything from 1920s German Expressionism to modern Sci-Fi classics. 🎬",
    favorites: [
      { tmdb_id: 27205, title: "Inception", poster_path: "/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg", year: "2010", score: "8.4" },
      { tmdb_id: 157336, title: "Interstellar", poster_path: "/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg", year: "2014", score: "8.4" },
      { tmdb_id: 194, title: "Amélie", poster_path: "/nSxDa3M9aMvGVLoItzWTepQ5h5d.jpg", year: "2001", score: "7.9" },
      { tmdb_id: 11, title: "Star Wars", poster_path: "/6FfDc5Hiw7eDH2MK60Y610z168r.jpg", year: "1977", score: "8.2" }
    ],
    followersCount: 1420,
    followingCount: 382
  },
  {
    username: "film_maestro",
    displayName: "David Finch",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    bio: "Aesthetics first. Love dark themes, neon lights, neo-noirs, and complex sound design.",
    favorites: [
      { tmdb_id: 79, title: "Hero", poster_path: "/vxgZto2Cz7ILHAlmRXt50I2brB2.jpg", year: "2002", score: "7.5" },
      { tmdb_id: 1891, title: "The Empire Strikes Back", poster_path: "/nHz298S9W5S7fFk313X7t4K3D3r.jpg", year: "1980", score: "8.4" },
      { tmdb_id: 603, title: "The Matrix", poster_path: "/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg", year: "1999", score: "8.2" },
      { tmdb_id: 278, title: "The Shawshank Redemption", poster_path: "/9cqN025Jd22oJXY7G3e8N86Z2E.jpg", year: "1994", score: "8.7" }
    ],
    followersCount: 928,
    followingCount: 450
  },
  {
    username: "neon_logist",
    displayName: "Chloe Carter",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    bio: "Cyberpunk lover. If it has neon lights, rain, and synthetic retro beats, count me in.",
    favorites: [
      { tmdb_id: 78, title: "Blade Runner", poster_path: "/612345.jpg", year: "1982", score: "7.9" },
      { tmdb_id: 399055, title: "A Silent Voice", poster_path: "/tuZAT0m9474O121X374D82.jpg", year: "2016", score: "8.6" },
      { tmdb_id: 110, title: "Three Colors: Blue", poster_path: "/blue.jpg", year: "1993", score: "7.7" },
      { tmdb_id: 105, title: "Back to the Future", poster_path: "/fktNZ2pDT4O31XzS25k3g.jpg", year: "1985", score: "8.3" }
    ],
    followersCount: 512,
    followingCount: 220
  }
];

export const MOCK_REVIEWS = [
  {
    id: "r1",
    username: "cinema_guru",
    displayName: "Elena Vance",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    tmdb_id: 27205,
    movieTitle: "Inception",
    movieYear: "2010",
    poster_path: "/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg",
    rating: 5,
    content: "Christopher Nolan's masterpiece. The layers of dream architecture, Hans Zimmer's explosive score, and that iconic spinning top ending makes this one of the greatest films of the 21st century. Rewatching it for the 10th time and still discovering new details!",
    date: "2026-06-22T18:30:00Z",
    likes: 84,
    comments: [
      { username: "film_maestro", content: "The hotel corridor hallway sequence is still unmatched in practical effects history!" },
      { username: "neon_logist", content: "Hans Zimmer went absolutely crazy on the soundtrack. Time is pure art." }
    ]
  },
  {
    id: "r2",
    username: "film_maestro",
    displayName: "David Finch",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    tmdb_id: 157336,
    movieTitle: "Interstellar",
    movieYear: "2014",
    poster_path: "/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
    rating: 4.5,
    content: "An absolute visual spectacle. Hoyte van Hoytema's cinematography creates a massive sense of scale that physically commands your attention. The emotional anchor between Cooper and Murph grounds what would otherwise be a cold space odyssey. Beautiful film.",
    date: "2026-06-21T12:15:00Z",
    likes: 62,
    comments: []
  },
  {
    id: "r3",
    username: "neon_logist",
    displayName: "Chloe Carter",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    tmdb_id: 194,
    movieTitle: "Amélie",
    movieYear: "2001",
    poster_path: "/nSxDa3M9aMvGVLoItzWTepQ5h5d.jpg",
    rating: 5,
    content: "The whimsical nature of this movie is so contagious. Every frame is painted with vibrant reds and greens, making Paris look like a magical realist dreamscape. Audrey Tautou is iconic. It's impossible to watch this and not smile.",
    date: "2026-06-20T22:40:00Z",
    likes: 47,
    comments: [
      { username: "cinema_guru", content: "The accordion soundtrack is playing in my head just reading this review!" }
    ]
  }
];

export const COMMUNITY_COLLECTIONS = [
  {
    id: "cc1",
    title: "Mind-bending Science Fiction",
    creator: "cinema_guru",
    description: "Films that challenge your perception of reality, space, time, and consciousness.",
    movies: [
      { tmdb_id: 27205, title: "Inception", poster_path: "/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg", year: "2010" },
      { tmdb_id: 157336, title: "Interstellar", poster_path: "/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg", year: "2014" },
      { tmdb_id: 603, title: "The Matrix", poster_path: "/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg", year: "1999" }
    ],
    likes: 120
  },
  {
    id: "cc2",
    title: "Atmospheric Masterpieces",
    creator: "film_maestro",
    description: "Films where the lighting, sets, and sound design tell the story more than the dialogue.",
    movies: [
      { tmdb_id: 194, title: "Amélie", poster_path: "/nSxDa3M9aMvGVLoItzWTepQ5h5d.jpg", year: "2001" },
      { tmdb_id: 79, title: "Hero", poster_path: "/vxgZto2Cz7ILHAlmRXt50I2brB2.jpg", year: "2002" }
    ],
    likes: 95
  }
];
