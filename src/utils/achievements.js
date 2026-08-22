// CineLog System: Strictly Separated Achievements & Shop Catalog (Zero Overlaps)

export const ACHIEVEMENTS = [
  {
    id: 'bronze_watcher',
    title: 'Bronze Watcher',
    description: 'Watch 5 movies, series, or anime.',
    target: 5,
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
    id: 'diamond_cinephile',
    title: 'Diamond Cinephile',
    description: 'Watch 100 movies, series, or anime.',
    target: 100,
    check: (library) => library.filter(m => m.status === 'watched').length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Diamond Legend',
      borderId: 'crystal-diamond',
      borderName: 'Crystal Diamond Border',
    }
  },
  {
    id: 'cinema_overlord',
    title: 'Cinema Overlord',
    description: 'Watch 200 movies, series, or anime.',
    target: 200,
    check: (library) => library.filter(m => m.status === 'watched').length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Cinema Overlord',
      borderId: 'cinema-overlord',
      borderName: 'Cinema Overlord Border',
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
      borderId: 'emerald-glow',
      borderName: 'Emerald Glow Border',
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
      borderId: 'sapphire-glow',
      borderName: 'Sapphire Glow Border',
    }
  },
  {
    id: 'grand_essayist',
    title: 'Grand Essayist',
    description: 'Write reviews for 30 different movies or shows.',
    target: 30,
    check: (library) => library.filter(m => m.review && m.review.trim()).length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Master Essayist',
      borderId: 'rose-quartz',
      borderName: 'Rose Quartz Border',
    }
  },
  {
    id: 'genre_master',
    title: 'Genre Master',
    description: 'Watch movies or shows spanning 6 or more unique genres.',
    target: 6,
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
      borderId: 'genre-prismatic',
      borderName: 'Prismatic Genre Border',
    }
  },
  {
    id: 'sci_fi_explorer',
    title: 'Sci-Fi Explorer',
    description: 'Log at least 5 Sci-Fi movies or series.',
    target: 5,
    check: (library) => library.filter(m => m.status === 'watched' && Array.isArray(m.genres) && m.genres.some(g => g.toLowerCase().includes('sci-fi') || g.toLowerCase().includes('science fiction'))).length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Sci-Fi Explorer',
      borderId: 'scifi-nebula',
      borderName: 'Sci-Fi Nebula Border'
    }
  },
  {
    id: 'nightmare_survivor',
    title: 'Nightmare Survivor',
    description: 'Log at least 5 Horror movies or series.',
    target: 5,
    check: (library) => library.filter(m => m.status === 'watched' && Array.isArray(m.genres) && m.genres.some(g => g.toLowerCase().includes('horror'))).length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Nightmare Survivor',
      borderId: 'nightmare-blood',
      borderName: 'Nightmare Crimson Border'
    }
  },
  {
    id: 'anime_otaku',
    title: 'Anime Otaku',
    description: 'Log at least 5 Anime titles.',
    target: 5,
    check: (library) => library.filter(m => m.status === 'watched' && (m.media_type === 'anime' || (Array.isArray(m.genres) && m.genres.some(g => g.toLowerCase().includes('animation'))))).length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Anime Otaku',
      borderId: 'anime-sakura',
      borderName: 'Anime Sakura Border'
    }
  },
  {
    id: 'master_curator',
    title: 'Master Curator',
    description: 'Mark 10 or more films as your favorites.',
    target: 10,
    check: (library) => library.filter(m => m.is_favorite).length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Master Curator',
      borderId: 'curator-heart',
      borderName: 'Curator Passion Border'
    }
  },
  {
    id: 'rewatch_king',
    title: 'Rewatch King',
    description: 'Log 3 movies as rewatched.',
    target: 3,
    check: (library) => library.filter(m => m.is_rewatch || (m.rewatch_count && m.rewatch_count > 1)).length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Rewatch King',
      borderId: 'chrono-rewind',
      borderName: 'Chrono Rewind Border'
    }
  },
  {
    id: 'streak_master',
    title: 'Streak Master',
    description: 'Build a 7-day consecutive movie watching streak.',
    target: 7,
    check: (library) => {
      const dates = new Set(library.filter(m => m.status === 'watched' && (m.watch_date || m.date_added)).map(m => (m.watch_date || m.date_added).split('T')[0]));
      let streak = 0;
      let checkDate = new Date();
      if (!dates.has(checkDate.toISOString().split('T')[0])) checkDate.setDate(checkDate.getDate() - 1);
      while (dates.has(checkDate.toISOString().split('T')[0])) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
      return streak;
    },
    reward: {
      type: 'border_and_badge',
      badgeName: 'Streak Master',
      borderId: 'fire-glow',
      borderName: 'Solar Flare Border'
    }
  }
];

// ── BORDER STYLES CATALOG ───────────────────────────────────────────────────
// Divided cleanly between (1) Achievements, (2) CinePoints Shop, (3) Creator
export const BORDER_STYLES = {
  none: {
    name: 'Default Border',
    category: 'base',
    style: { border: '3px solid rgba(255,255,255,0.1)' }
  },

  // ── ACHIEVEMENT BORDERS (Unlocked via Milestones) ──
  bronze: {
    name: '🥉 Bronze Border',
    category: 'achievement',
    style: { border: '3px solid #cd7f32', boxShadow: '0 0 10px rgba(205,127,50,0.5)' }
  },
  silver: {
    name: '🥈 Silver Border',
    category: 'achievement',
    style: { border: '3px solid #e0e0e0', boxShadow: '0 0 12px rgba(255,255,255,0.6)' }
  },
  gold: {
    name: '🥇 Gold Border',
    category: 'achievement',
    style: { border: '3px solid #fbbf24', boxShadow: '0 0 15px rgba(251,191,36,0.75)' }
  },
  'crystal-diamond': {
    name: '💎 Crystal Diamond Border',
    category: 'achievement',
    style: {
      border: '4px solid transparent',
      backgroundImage: 'linear-gradient(#0a0813, #0a0813), linear-gradient(135deg, #38bdf8, #fff, #818cf8)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      boxShadow: '0 0 20px rgba(56,189,248,0.9)',
      animation: 'pulse-glow 2.5s infinite alternate'
    }
  },
  'cinema-overlord': {
    name: '👑 Cinema Overlord Border',
    category: 'achievement',
    style: {
      border: '4px solid transparent',
      backgroundImage: 'linear-gradient(#0a0813, #0a0813), linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6, #f59e0b)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      boxShadow: '0 0 24px rgba(245,158,11,0.9), inset 0 0 8px rgba(236,72,153,0.5)',
      animation: 'hue-rotation 5s infinite linear'
    }
  },
  'emerald-glow': {
    name: '🌿 Emerald Glow Border',
    category: 'achievement',
    style: { border: '3.5px solid #10b981', boxShadow: '0 0 16px rgba(16,185,129,0.85)' }
  },
  'sapphire-glow': {
    name: '💙 Sapphire Glow Border',
    category: 'achievement',
    style: { border: '3.5px solid #3b82f6', boxShadow: '0 0 16px rgba(59,130,246,0.85)' }
  },
  'rose-quartz': {
    name: '🌸 Rose Quartz Border',
    category: 'achievement',
    style: { border: '3.5px solid #f472b6', boxShadow: '0 0 16px rgba(244,114,182,0.85)' }
  },
  'scifi-nebula': {
    name: '🚀 Sci-Fi Nebula Border',
    category: 'achievement',
    style: {
      border: '4px solid transparent',
      backgroundImage: 'linear-gradient(#0a0813, #0a0813), linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      boxShadow: '0 0 18px rgba(6,182,212,0.85)',
      animation: 'pulse-glow 2s infinite alternate'
    }
  },
  'nightmare-blood': {
    name: '🩸 Nightmare Crimson Border',
    category: 'achievement',
    style: { border: '3.5px solid #dc2626', boxShadow: '0 0 18px rgba(220,38,38,0.9), inset 0 0 6px rgba(220,38,38,0.5)' }
  },
  'anime-sakura': {
    name: '🌸 Anime Sakura Border',
    category: 'achievement',
    style: { border: '3.5px solid #ec4899', boxShadow: '0 0 18px rgba(236,72,153,0.85)' }
  },
  'genre-prismatic': {
    name: '🌈 Prismatic Genre Border',
    category: 'achievement',
    style: {
      border: '4px solid transparent',
      backgroundImage: 'linear-gradient(#0a0813, #0a0813), linear-gradient(135deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      boxShadow: '0 0 20px rgba(139,92,246,0.85)',
      animation: 'hue-rotation 6s infinite linear'
    }
  },
  'curator-heart': {
    name: '💖 Curator Passion Border',
    category: 'achievement',
    style: { border: '3.5px solid #f43f5e', boxShadow: '0 0 18px rgba(244,63,94,0.9)' }
  },
  'chrono-rewind': {
    name: '⏳ Chrono Rewind Border',
    category: 'achievement',
    style: { border: '3.5px solid #06b6d4', boxShadow: '0 0 16px rgba(6,182,212,0.85)', animation: 'pulse-glow 2s infinite alternate' }
  },
  'fire-glow': {
    name: '🔥 Solar Flare Border',
    category: 'achievement',
    style: { border: '3.5px solid #f97316', boxShadow: '0 0 18px rgba(249,115,22,0.9)', animation: 'pulse-glow 1.5s infinite alternate' }
  },

  // ── EXCLUSIVE CINEPOINTS SHOP BORDERS (Purchased with Points Only) ──
  'cyber-violet': {
    name: '🌌 Cyber Violet Aura',
    category: 'shop',
    cost: 150,
    desc: 'Glowing animated violet cyber border',
    style: { border: '4px solid #8b5cf6', boxShadow: '0 0 20px rgba(139,92,246,0.95), 0 0 30px rgba(168,85,247,0.5)', animation: 'pulse-glow 2s infinite alternate' }
  },
  'plasma-red': {
    name: '⚡ Plasma Crimson Pulse',
    category: 'shop',
    cost: 250,
    desc: 'Animated fiery red plasma surges',
    style: { border: '4px solid #ef4444', boxShadow: '0 0 22px rgba(239,68,68,0.95), inset 0 0 8px rgba(248,113,113,0.6)', animation: 'pulse-glow 1.5s infinite alternate' }
  },
  'matrix-code': {
    name: '💻 Matrix Code Shift',
    category: 'shop',
    cost: 350,
    desc: 'Cascading digital cyber cipher ring',
    style: { border: '4px solid #22c55e', boxShadow: '0 0 22px rgba(34,197,94,0.95), inset 0 0 8px rgba(34,197,94,0.6)' }
  },
  'hyperdrive': {
    name: '🚀 Hyperdrive Warp Speed',
    category: 'shop',
    cost: 500,
    desc: 'Chrono light-speed warp streak animation',
    style: {
      border: '4px solid transparent',
      backgroundImage: 'linear-gradient(#0a0813, #0a0813), linear-gradient(135deg, #06b6d4, #3b82f6, #fff)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      boxShadow: '0 0 24px rgba(6,182,212,0.95), inset 0 0 8px rgba(59,130,246,0.6)',
      animation: 'pulse-glow 1.8s infinite alternate'
    }
  },
  'royal-amethyst': {
    name: '💎 Royal Amethyst Crown',
    category: 'shop',
    cost: 750,
    desc: 'Imperial royal gemstone aura with hue rotation',
    style: {
      border: '4px solid transparent',
      backgroundImage: 'linear-gradient(#0a0813, #0a0813), linear-gradient(135deg, #c084fc, #fbbf24, #a855f7)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      boxShadow: '0 0 25px rgba(192,132,252,0.95), 0 0 10px rgba(251,191,36,0.6)',
      animation: 'hue-rotation 6s infinite linear'
    }
  },
  'supernova-gold': {
    name: '🌟 Supernova Stellar Blast',
    category: 'shop',
    cost: 1000,
    desc: 'Ultra-radiant celestial cosmic explosion',
    style: {
      border: '4px solid transparent',
      backgroundImage: 'linear-gradient(#0a0813, #0a0813), linear-gradient(135deg, #fbbf24, #f59e0b, #fff, #fbbf24)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      boxShadow: '0 0 0 2px rgba(251,191,36,0.4), 0 0 28px rgba(251,191,36,0.95), inset 0 0 10px rgba(255,255,255,0.7)',
      animation: 'hue-rotation 8s infinite linear'
    }
  },
  'frostbite-ice': {
    name: '❄️ Cryo Frostbite Ring',
    category: 'shop',
    cost: 600,
    desc: 'Glacial cryo-freeze frost ring',
    style: {
      border: '4px solid #67e8f9',
      boxShadow: '0 0 22px rgba(103,232,249,0.95), inset 0 0 8px rgba(255,255,255,0.8)',
      animation: 'pulse-glow 2s infinite alternate'
    }
  },
  'void-shadow': {
    name: '🌑 Abyssal Void Horizon',
    category: 'shop',
    cost: 850,
    desc: 'Dark matter event horizon vortex',
    style: {
      border: '4px solid #6366f1',
      boxShadow: '0 0 26px rgba(99,102,241,0.95), 0 0 40px rgba(15,23,42,0.9)',
      animation: 'pulse-glow 3s infinite alternate'
    }
  },

  // ── EXCLUSIVE CREATOR BORDER ──
  creator: {
    name: '👑 Creator Border',
    category: 'creator',
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

// ── BADGE COLORS CATALOG ────────────────────────────────────────────────────
export const BADGE_COLORS = {
  // Creator Exclusives
  'Creator': { border: '1px solid #fbbf24', color: '#fbbf24', bg: 'linear-gradient(135deg, rgba(251,191,36,0.25) 0%, rgba(184,124,248,0.25) 100%)' },
  'The Maker.': { border: '1px solid #a855f7', color: '#c084fc', bg: 'rgba(168,85,247,0.2)' },

  // Watcher Milestone Tiers
  'Bronze Watcher': { border: '1px solid #cd7f32', color: '#cd7f32', bg: 'rgba(205,127,50,0.15)' },
  'Silver Watcher': { border: '1px solid #c0c0c0', color: '#e2e8f0', bg: 'rgba(192,192,192,0.15)' },
  'Gold Watcher': { border: '1px solid #fbbf24', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  'Diamond Legend': { border: '1px solid #38bdf8', color: '#38bdf8', bg: 'rgba(56,189,248,0.18)' },
  'Cinema Overlord': { border: '1px solid #f59e0b', color: '#fcd34d', bg: 'rgba(245,158,11,0.25)' },
  'Film Legend': { border: '1px solid #eab308', color: '#fde047', bg: 'rgba(234,179,8,0.2)' },
  'Hall of Famer': { border: '1px solid #ec4899', color: '#f472b6', bg: 'rgba(236,72,153,0.2)' },

  // Critic & Reviewer Ranks
  'Critic': { border: '1px solid #10b981', color: '#34d399', bg: 'rgba(16,185,129,0.15)' },
  'Dedicated Critic': { border: '1px solid #10b981', color: '#34d399', bg: 'rgba(16,185,129,0.15)' },
  'Elite Critic': { border: '1px solid #3b82f6', color: '#60a5fa', bg: 'rgba(59,130,246,0.15)' },
  'Master Essayist': { border: '1px solid #f472b6', color: '#f472b6', bg: 'rgba(244,114,182,0.15)' },
  'Grand Essayist': { border: '1px solid #f472b6', color: '#f472b6', bg: 'rgba(244,114,182,0.15)' },
  'Absolute Critic': { border: '1px solid #2dd4bf', color: '#2dd4bf', bg: 'rgba(45,212,191,0.15)' },

  // Genre Specializations
  'Genre Master': { border: '1px solid #a855f7', color: '#c084fc', bg: 'rgba(168,85,247,0.18)' },
  'Sci-Fi Explorer': { border: '1px solid #06b6d4', color: '#67e8f9', bg: 'rgba(6,182,212,0.15)' },
  'Nightmare Survivor': { border: '1px solid #ef4444', color: '#f87171', bg: 'rgba(239,68,68,0.18)' },
  'Anime Otaku': { border: '1px solid #ec4899', color: '#f472b6', bg: 'rgba(236,72,153,0.18)' },
  'Master Curator': { border: '1px solid #f43f5e', color: '#fb7185', bg: 'rgba(244,63,94,0.15)' },
  'Rewatch King': { border: '1px solid #0ea5e9', color: '#38bdf8', bg: 'rgba(14,165,233,0.15)' },
  'Streak Master': { border: '1px solid #f97316', color: '#fb923c', bg: 'rgba(249,115,22,0.18)' },
  'Space Cadet': { border: '1px solid #38bdf8', color: '#7dd3fc', bg: 'rgba(56,189,248,0.15)' },
  'Noir Sleuth': { border: '1px solid #94a3b8', color: '#cbd5e1', bg: 'rgba(148,163,184,0.15)' },
  'Action Hero': { border: '1px solid #dc2626', color: '#f87171', bg: 'rgba(220,38,38,0.15)' },
  'Master Mind': { border: '1px solid #8b5cf6', color: '#c084fc', bg: 'rgba(139,92,246,0.15)' },

  // Cinephile Habits & Streaks
  'Triple Threat': { border: '1px solid #ec4899', color: '#f472b6', bg: 'rgba(236,72,153,0.15)' },
  'Grand Collector': { border: '1px solid #8b5cf6', color: '#a78bfa', bg: 'rgba(139,92,246,0.15)' },
  'Blockbuster Buff': { border: '1px solid #f59e0b', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
  'Emotional Rollercoaster': { border: '1px solid #38bdf8', color: '#7dd3fc', bg: 'rgba(56,189,248,0.15)' },
  'Nostalgia Trip': { border: '1px solid #d97706', color: '#fbbf24', bg: 'rgba(217,119,6,0.15)' },
  'Night Owl': { border: '1px solid #6366f1', color: '#818cf8', bg: 'rgba(99,102,241,0.15)' },
  'Active Watcher': { border: '1px solid #10b981', color: '#34d399', bg: 'rgba(16,185,129,0.15)' },
  'Binge Beast': { border: '1px solid #f97316', color: '#fb923c', bg: 'rgba(249,115,22,0.18)' },
  'Reel Master': { border: '1px solid #06b6d4', color: '#67e8f9', bg: 'rgba(6,182,212,0.15)' },

  // CinePoints Shop Title Badges
  'VIP Cinephile': { border: '1px solid #8b5cf6', color: '#c084fc', bg: 'rgba(139,92,246,0.18)' },
  'Popcorn Overlord': { border: '1px solid #f59e0b', color: '#fbbf24', bg: 'rgba(245,158,11,0.18)' },
  'Midnight Binger': { border: '1px solid #3b82f6', color: '#60a5fa', bg: 'rgba(59,130,246,0.18)' },
  'Cinema Tycoon': { border: '1px solid #10b981', color: '#34d399', bg: 'rgba(16,185,129,0.18)' },
  "Director's Cut": { border: '1px solid #ec4899', color: '#f472b6', bg: 'rgba(236,72,153,0.18)' }
};

// ── CREATOR RECOGNITION ─────────────────────────────────────────────────────
export function isUserCreator(user) {
  if (!user) return false;
  const username = String(user.username || '').toLowerCase().trim();
  const displayName = String(user.displayName || user.display_name || '').toLowerCase().trim();
  const id = String(user.id || '').toLowerCase().trim();
  const email = String(user.email || '').toLowerCase().trim();

  const creatorUsernames = ['lynnx', 'itzfabiopt2006', 'fabiosilva', 'fabiosilva32', 'creator', 'the maker.'];
  const creatorIds = [
    '2436dd73-13e2-45a9-b2af-664a221250d8',
    '754ce8a9-e74a-4277-ab9c-847408153029',
    '2bf89559-f45b-48c1-9b44-1c79bc951a80'
  ];

  return (
    creatorUsernames.includes(username) ||
    creatorUsernames.includes(displayName) ||
    creatorIds.includes(id) ||
    email.includes('itzfa') ||
    email.includes('fabio')
  );
}
