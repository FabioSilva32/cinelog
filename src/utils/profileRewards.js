import {ACHIEVEMENTS,BADGE_COLORS,BORDER_STYLES,isUserCreator} from './achievements.js';
export function getProfileRewards(library=[],currentUser={}){
const watchedCount=library.filter(m=>m.status==='watched').length;const reviewsCount=library.filter(m=>m.review&&m.review.trim()).length;const favoritesCount=library.filter(m=>m.favorite||m.is_favorite).length;
  // Streak & CinePoints
  const currentStreak = (() => {
    const watchDates = new Set();
    library.filter(m => m.status === 'watched').forEach(m => {
      const scr = m.screenings || m.episode_data?.screenings;
      if (Array.isArray(scr) && scr.length > 0) {
        scr.forEach(s => {
          if (s.date) watchDates.add(s.date.split('T')[0]);
        });
      }
      if (m.watch_date || m.date_added) {
        watchDates.add((m.watch_date || m.date_added).split('T')[0]);
      }
    });
    let streak = 0;
    let checkDate = new Date();
    const todayStr = checkDate.toISOString().split('T')[0];
    if (!watchDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (watchDates.has(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  })();

  const streakMultiplier = (() => {
    if (currentStreak >= 30) return 2.5;
    if (currentStreak >= 14) return 2.0;
    if (currentStreak >= 7) return 1.5;
    if (currentStreak >= 3) return 1.25;
    return 1.0;
  })();

  const cinePoints = (() => {
    const basePoints = (watchedCount * 10) + (reviewsCount * 10) + (favoritesCount * 5);
    const streakBonus = Math.floor(currentStreak * 15 * streakMultiplier);
    const triviaPoints = currentUser?.triviaCinePoints || 0;
    const spent = currentUser?.spentCinePoints || 0;
    return Math.max(0, basePoints + streakBonus + triviaPoints - spent);
  })();

  const isCreator = isUserCreator(currentUser);

  const unlockedBadges = (() => {
    const earned = [];
    if (isCreator) {
      // 👑 Creator account automatically unlocks all title badges!
      Object.keys(BADGE_COLORS).forEach(b => earned.push(b));
    } else {
      ACHIEVEMENTS.forEach(ach => {
        if (ach.check(library) >= ach.target) {
          if (ach.reward.badgeName) earned.push(ach.reward.badgeName);
        }
      });
      const purchased = currentUser?.purchasedBadges || currentUser?.purchased_badges || [];
      purchased.forEach(b => earned.push(b));
      const featured = currentUser?.featuredBadges || currentUser?.featured_badges || [];
      featured.forEach(b => earned.push(b));
    }
    return Array.from(new Set(earned));
  })();



  const BADGE_PRESTIGE_ORDER = [
    'Creator', 'The Maker.',
    'Cinema Overlord', 'Film Legend', 'Hall of Famer', 'Diamond Legend',
    'Gold Watcher', 'Absolute Critic', 'Master Essayist', 'Grand Essayist',
    'Genre Master', 'Streak Master', 'Silver Watcher', 'Dedicated Critic',
    'Elite Critic', 'Critic', 'Bronze Watcher'
  ];

  const sortedBadges = (() => {
    return [...unlockedBadges].sort((a, b) => {
      const idxA = BADGE_PRESTIGE_ORDER.indexOf(a);
      const idxB = BADGE_PRESTIGE_ORDER.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  })();

  const unlockedBorders = (() => {
    const unlocked = new Set(['none', 'bronze', 'silver', 'gold',...Object.entries(BORDER_STYLES).filter(([,item])=>item.category==='base').map(([id])=>id)]);
    if (isCreator) {
      unlocked.add('creator');
    }
    ACHIEVEMENTS.forEach(ach => {
      if (ach.check(library) >= ach.target) {
        if (ach.reward.borderId) unlocked.add(ach.reward.borderId);
      }
    });
    (currentUser?.purchasedBorders || []).forEach(b => {if(BORDER_STYLES[b]?.category!=='creator')unlocked.add(b);});
    return unlocked;
  })();


return {currentStreak,streakMultiplier,cinePoints,isCreator,unlockedBadges,sortedBadges,unlockedBorders};
}
