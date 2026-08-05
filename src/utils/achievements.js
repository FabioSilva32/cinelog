export const ACHIEVEMENTS = [
  {
    id: 'bronze_watcher',
    title: 'Bronze Watcher',
    description: 'Watch 10 movies, series, or anime.',
    target: 10,
    check: (library) => library.filter(m => m.status === 'watched').length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Bronze Watcher',
      borderId: 'bronze',
      borderName: 'Bronze Border',
    }
  },
  {
    id: 'silver_watcher',
    title: 'Silver Watcher',
    description: 'Watch 25 movies, series, or anime.',
    target: 25,
    check: (library) => library.filter(m => m.status === 'watched').length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Silver Watcher',
      borderId: 'silver',
      borderName: 'Silver Border',
    }
  },
  {
    id: 'gold_watcher',
    title: 'Gold Watcher',
    description: 'Watch 50 movies, series, or anime.',
    target: 50,
    check: (library) => library.filter(m => m.status === 'watched').length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Gold Watcher',
      borderId: 'gold',
      borderName: 'Gold Border',
    }
  },
  {
    id: 'dedicated_critic',
    title: 'Dedicated Critic',
    description: 'Write reviews for 5 different movies or shows.',
    target: 5,
    check: (library) => library.filter(m => m.review && m.review.trim()).length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Critic',
      borderId: 'purple-glow',
      borderName: 'Purple Neon Border',
    }
  },
  {
    id: 'elite_critic',
    title: 'Elite Critic',
    description: 'Write reviews for 15 different movies or shows.',
    target: 15,
    check: (library) => library.filter(m => m.review && m.review.trim()).length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Elite Critic',
      borderId: 'rainbow',
      borderName: 'Rainbow Glow Border',
    }
  },
  {
    id: 'genre_explorer',
    title: 'Genre Explorer',
    description: 'Watch movies or shows spanning 5 or more unique genres.',
    target: 5,
    check: (library) => {
      const genres = new Set();
      library.forEach(m => {
        if (m.status === 'watched' && Array.isArray(m.genres)) {
          m.genres.forEach(g => genres.add(g));
        }
      });
      return genres.size;
    },
    reward: {
      type: 'border_and_badge',
      badgeName: 'Genre Master',
      borderId: 'emerald',
      borderName: 'Emerald Glow Border',
    }
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: 'Give a rating of 9.0 or higher to at least 5 titles.',
    target: 5,
    check: (library) => library.filter(m => m.status === 'watched' && m.rating >= 9).length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Completionist',
      borderId: 'starry',
      borderName: 'Starry Sparkle Border',
    }
  },
  {
    id: 'sci_fi_explorer',
    title: 'Sci-Fi Explorer',
    description: 'Log at least 5 Sci-Fi movies or series.',
    target: 5,
    check: (library) => library.filter(m => m.status === 'watched' && Array.isArray(m.genres) && m.genres.some(g => g.toLowerCase().includes('sci-fi') || g.toLowerCase().includes('science fiction'))).length,
    reward: {
      type: 'badge',
      badgeName: 'Sci-Fi Explorer'
    }
  },
  {
    id: 'nostalgia_trip',
    title: 'Nostalgia Trip',
    description: 'Watch 5 films released before 1990.',
    target: 5,
    check: (library) => library.filter(m => m.status === 'watched' && m.release_year && Number(m.release_year) < 1990).length,
    reward: {
      type: 'badge',
      badgeName: 'Nostalgia Trip'
    }
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Log 3 movies after midnight (between 12 AM and 4 AM).',
    target: 3,
    check: (library) => library.filter(m => m.status === 'watched' && m.date_added && new Date(m.date_added).getHours() >= 0 && new Date(m.date_added).getHours() < 4).length,
    reward: {
      type: 'badge',
      badgeName: 'Night Owl'
    }
  },
  {
    id: 'triple_threat',
    title: 'Triple Threat',
    description: 'Log 3 movies watched on the same day.',
    target: 3,
    check: (library) => {
      const days = {};
      library.filter(m => m.status === 'watched' && (m.watch_date || m.date_added)).forEach(m => {
        const d = new Date(m.watch_date || m.date_added).toISOString().slice(0, 10);
        days[d] = (days[d] || 0) + 1;
      });
      return Object.keys(days).length > 0 ? Math.max(...Object.values(days)) : 0;
    },
    reward: {
      type: 'badge',
      badgeName: 'Triple Threat'
    }
  },
  {
    id: 'cinephile_extraordinaire',
    title: 'Cinephile Extraordinaire',
    description: 'Write 10 reviews with detailed notes.',
    target: 10,
    check: (library) => library.filter(m => m.review && m.review.trim().length >= 10).length,
    reward: {
      type: 'badge',
      badgeName: 'Cinephile Extraordinaire'
    }
  },
  {
    id: 'master_curator',
    title: 'Master Curator',
    description: 'Mark 10 movies or shows as Favorites.',
    target: 10,
    check: (library) => library.filter(m => m.favorite).length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Master Curator',
      borderId: 'cyber-neon',
      borderName: 'Cyberpunk Neon Border'
    }
  },
  {
    id: 'film_legend',
    title: 'Film Legend',
    description: 'Watch 100 movies, series, or anime.',
    target: 100,
    check: (library) => library.filter(m => m.status === 'watched').length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Film Legend',
      borderId: 'fire-glow',
      borderName: 'Solar Flare Border'
    }
  },
  {
    id: 'absolute_critic',
    title: 'Absolute Critic',
    description: 'Write reviews for 30 different movies or shows.',
    target: 30,
    check: (library) => library.filter(m => m.review && m.review.trim()).length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Absolute Critic',
      borderId: 'crystal-diamond',
      borderName: 'Crystal Diamond Border'
    }
  },
  {
    id: 'tv_marathoner',
    title: 'TV Marathoner',
    description: 'Watch 10 TV series or anime.',
    target: 10,
    check: (library) => library.filter(m => m.status === 'watched' && m.media_type === 'tv').length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'TV Marathoner',
      borderId: 'sapphire-glow',
      borderName: 'Sapphire Glow Border'
    }
  },
  {
    id: 'active_watcher',
    title: 'Active Watcher',
    description: 'Have at least 3 titles in your Currently Watching list.',
    target: 3,
    check: (library) => library.filter(m => m.status === 'watching').length,
    reward: {
      type: 'badge',
      badgeName: 'Active Watcher'
    }
  },
  {
    id: 'blockbuster_buff',
    title: 'Blockbuster Buff',
    description: 'Watch 10 Action or Adventure movies or series.',
    target: 10,
    check: (library) => library.filter(m => m.status === 'watched' && Array.isArray(m.genres) && m.genres.some(g => ['action', 'adventure'].includes(g.toLowerCase()))).length,
    reward: {
      type: 'badge',
      badgeName: 'Blockbuster Buff'
    }
  },
  {
    id: 'emotional_rollercoaster',
    title: 'Emotional Rollercoaster',
    description: 'Watch 10 Drama or Romance movies or series.',
    target: 10,
    check: (library) => library.filter(m => m.status === 'watched' && Array.isArray(m.genres) && m.genres.some(g => ['drama', 'romance'].includes(g.toLowerCase()))).length,
    reward: {
      type: 'badge',
      badgeName: 'Emotional Rollercoaster'
    }
  },
  {
    id: 'nightmare_survivor',
    title: 'Nightmare Survivor',
    description: 'Watch 5 Horror or Thriller movies or series.',
    target: 5,
    check: (library) => library.filter(m => m.status === 'watched' && Array.isArray(m.genres) && m.genres.some(g => ['horror', 'thriller'].includes(g.toLowerCase()))).length,
    reward: {
      type: 'badge',
      badgeName: 'Nightmare Survivor'
    }
  },
  {
    id: 'anime_otaku',
    title: 'Anime Otaku',
    description: 'Watch 5 Animation or Anime movies or series.',
    target: 5,
    check: (library) => library.filter(m => m.status === 'watched' && Array.isArray(m.genres) && m.genres.some(g => ['animation', 'anime'].includes(g.toLowerCase()))).length,
    reward: {
      type: 'badge',
      badgeName: 'Anime Otaku'
    }
  },
  {
    id: 'tastemaker',
    title: 'Tastemaker',
    description: 'Create 5 or more unique tags across your library items.',
    target: 5,
    check: (library) => {
      const tags = new Set();
      library.forEach(m => (m.tags || []).forEach(t => tags.add(t)));
      return tags.size;
    },
    reward: {
      type: 'border_and_badge',
      badgeName: 'Tastemaker',
      borderId: 'rose-quartz',
      borderName: 'Rose Quartz Border'
    }
  },
  {
    id: 'grand_collector',
    title: 'Grand Collector',
    description: 'Add 100 total items to your library.',
    target: 100,
    check: (library) => library.length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Grand Collector',
      borderId: 'gold-neon',
      borderName: 'Gold Neon Border'
    }
  }
];

export const BORDER_STYLES = {
  none: {
    name: 'Default Border',
    style: { border: '4px solid #0a0813', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }
  },
  bronze: {
    name: 'Bronze Border',
    style: { border: '4px solid #cd7f32', boxShadow: '0 0 14px rgba(205,127,50,0.7)' }
  },
  silver: {
    name: 'Silver Border',
    style: { border: '4px solid #c0c0c0', boxShadow: '0 0 14px rgba(192,192,192,0.7)' }
  },
  gold: {
    name: 'Gold Border',
    style: {
      border: '4px solid #fbbf24',
      boxShadow: '0 0 18px rgba(251,191,36,0.85)',
      animation: 'pulse-glow 2.5s infinite alternate'
    }
  },
  'purple-glow': {
    name: 'Purple Neon Border',
    style: { border: '4px solid #a855f7', boxShadow: '0 0 18px rgba(168,85,247,0.85)' }
  },
  rainbow: {
    name: 'Rainbow Glow Border',
    style: {
      border: '4px solid transparent',
      backgroundImage: 'linear-gradient(#0a0813, #0a0813), linear-gradient(to right, #ec4899, #8b5cf6, #3b82f6, #10b981, #f59e0b)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      boxShadow: '0 0 18px rgba(139,92,246,0.85)',
      animation: 'hue-rotation 6s infinite linear'
    }
  },
  emerald: {
    name: 'Emerald Glow Border',
    style: { border: '4px solid #10b981', boxShadow: '0 0 18px rgba(16,185,129,0.85)' }
  },
  starry: {
    name: 'Starry Sparkle Border',
    style: {
      border: '4px solid transparent',
      backgroundImage: 'linear-gradient(#0a0813, #0a0813), linear-gradient(135deg, #fbbf24, #3b82f6, #fbbf24)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      boxShadow: '0 0 20px rgba(251,191,36,0.7), 0 0 8px rgba(59,130,246,0.5), inset 0 0 10px rgba(255,255,255,0.3)',
      animation: 'pulse-glow 2s infinite alternate'
    }
  },
  'cyber-neon': {
    name: '⚡ Cyberpunk Neon Border',
    style: {
      border: '4px solid transparent',
      backgroundImage: 'linear-gradient(#0a0813, #0a0813), linear-gradient(135deg, #06b6d4, #d946ef)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      boxShadow: '0 0 0 2px rgba(6,182,212,0.3), 0 0 20px rgba(6,182,212,0.85), inset 0 0 8px rgba(217,70,239,0.5)',
      animation: 'pulse-glow 2.5s infinite alternate'
    }
  },
  'fire-glow': {
    name: '🔥 Solar Flare Border',
    style: {
      border: '4px solid transparent',
      backgroundImage: 'linear-gradient(#0a0813, #0a0813), linear-gradient(135deg, #f97316, #ef4444, #f59e0b)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      boxShadow: '0 0 18px rgba(249,115,22,0.95), 0 0 30px rgba(239,68,68,0.5), inset 0 0 12px rgba(245,158,11,0.6)',
      animation: 'pulse-glow 1.8s infinite alternate'
    }
  },
  'crystal-diamond': {
    name: '💎 Crystal Diamond Border',
    style: {
      border: '4px solid transparent',
      backgroundImage: 'linear-gradient(#0a0813, #0a0813), linear-gradient(135deg, #e0f2fe, #38bdf8, #fff, #7dd3fc)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      boxShadow: '0 0 0 2px rgba(56,189,248,0.4), 0 0 24px rgba(56,189,248,0.95), inset 0 0 8px rgba(255,255,255,0.8)',
      animation: 'pulse-glow 3s infinite alternate'
    }
  },
  'sapphire-glow': {
    name: '💙 Sapphire Glow Border',
    style: { border: '4px solid #3b82f6', boxShadow: '0 0 18px rgba(59,130,246,0.95)', animation: 'pulse-glow 2.5s infinite alternate' }
  },
  'rose-quartz': {
    name: '🌸 Rose Quartz Border',
    style: { border: '4px solid #f472b6', boxShadow: '0 0 16px rgba(244,114,182,0.9)' }
  },
  'gold-neon': {
    name: '✨ Gold Neon Border',
    style: {
      border: '4px solid transparent',
      backgroundImage: 'linear-gradient(#0a0813, #0a0813), linear-gradient(135deg, #fbbf24, #f59e0b, #fff, #fbbf24)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      boxShadow: '0 0 0 2px rgba(251,191,36,0.35), 0 0 22px rgba(251,191,36,0.95), inset 0 0 6px rgba(255,255,255,0.4)',
      animation: 'hue-rotation 8s infinite linear'
    }
  },
  creator: {
    name: '👑 Creator Border',
    style: {
      border: '4px solid transparent',
      backgroundImage: 'linear-gradient(#0a0813, #0a0813), linear-gradient(to right, #7c6ff7, #fbbf24, #ec4899, #7c6ff7)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      boxShadow: '0 0 0 2px rgba(124,111,247,0.3), 0 0 25px rgba(124,111,247,0.95), 0 0 10px rgba(251,191,36,0.5), inset 0 0 8px rgba(236,72,153,0.5)',
      animation: 'hue-rotation 4s infinite linear'
    }
  }
};

export const BADGE_COLORS = {
  'Bronze Watcher': { border: '1px solid #cd7f32', color: '#cd7f32', bg: 'rgba(205,127,50,0.1)' },
  'Silver Watcher': { border: '1px solid #c0c0c0', color: '#c0c0c0', bg: 'rgba(192,192,192,0.1)' },
  'Gold Watcher': { border: '1px solid #fbbf24', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  'Critic': { border: '1px solid #a855f7', color: '#c084fc', bg: 'rgba(168,85,247,0.1)' },
  'Elite Critic': { border: '1px solid #ec4899', color: '#f472b6', bg: 'rgba(236,72,153,0.1)' },
  'Genre Master': { border: '1px solid #10b981', color: '#34d399', bg: 'rgba(16,185,129,0.1)' },
  'Completionist': { border: '1px solid #fbbf24', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  'Master Curator': { border: '1px solid #06b6d4', color: '#67e8f9', bg: 'rgba(6,182,212,0.1)' },
  'Film Legend': { border: '1px solid #fbbf24', color: '#fde047', bg: 'rgba(251,191,36,0.15)' },
  'Absolute Critic': { border: '1px solid #ec4899', color: '#f472b6', bg: 'rgba(236,72,153,0.1)' },
  'Sci-Fi Explorer': { border: '1px solid #3b82f6', color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
  'Nostalgia Trip': { border: '1px solid #f59e0b', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
  'Night Owl': { border: '1px solid #8b5cf6', color: '#c084fc', bg: 'rgba(139,92,246,0.1)' },
  'Triple Threat': { border: '1px solid #ef4444', color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
  'Cinephile Extraordinaire': { border: '1px solid #ec4899', color: '#f472b6', bg: 'rgba(236,72,153,0.1)' },
  'TV Marathoner': { border: '1px solid #3b82f6', color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
  'Active Watcher': { border: '1px solid #10b981', color: '#34d399', bg: 'rgba(16,185,129,0.1)' },
  'Blockbuster Buff': { border: '1px solid #f97316', color: '#ff9d5c', bg: 'rgba(249,115,22,0.1)' },
  'Emotional Rollercoaster': { border: '1px solid #ec4899', color: '#f472b6', bg: 'rgba(236,72,153,0.1)' },
  'Nightmare Survivor': { border: '1px solid #ef4444', color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
  'Anime Otaku': { border: '1px solid #a855f7', color: '#c084fc', bg: 'rgba(168,85,247,0.1)' },
  'Tastemaker': { border: '1px solid #f472b6', color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
  'Grand Collector': { border: '1px solid #fbbf24', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  'Creator': { border: '1px solid #fbbf24', color: '#fbbf24', bg: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(184,124,248,0.2) 100%)' }
};
