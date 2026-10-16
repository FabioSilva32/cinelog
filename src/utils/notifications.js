import { useState, useEffect, useCallback, useMemo } from 'react';

const TMDB_KEY = '6a2fd6b9b1bb3befbb9f14c203732225';
const DISMISSED_KEY = 'cinelog_dismissed_notifications_v2';
const READ_KEY = 'cinelog_read_notifications_v2';

export function useNotifications(library = [], currentUser = null) {
  const [trendingNotifs, setTrendingNotifs] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(DISMISSED_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(READ_KEY)) || [];
    } catch {
      return [];
    }
  });

  // Fetch real-time trending & now playing theatrical releases from TMDB
  useEffect(() => {
    let isMounted = true;
    const fetchTrending = async () => {
      // Check session cache first to prevent redundant API calls
      const cached = sessionStorage.getItem('cinelog_tmdb_notifs_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && Array.isArray(parsed) && parsed.length > 0) {
            if (isMounted) setTrendingNotifs(parsed);
            return;
          }
        } catch {}
      }

      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_KEY}&language=en-US&page=1`);
        if (!res.ok) return;
        const data = await res.json();
        const topMovies = (data.results || []).slice(0, 2);

        const items = topMovies.map((m, idx) => ({
          id: `tmdb_now_playing_${m.id}`,
          type: 'release',
          tag: idx === 0 ? 'Now In Theaters' : 'Trending Film',
          tagColor: '#e50914',
          title: m.title,
          body: m.overview
            ? `${m.vote_average ? `${m.vote_average.toFixed(1)} ★ • ` : ''}${m.overview.slice(0, 85).trim()}…`
            : 'Currently playing in cinemas. Tap to view cast, trailer, and log.',
          poster: m.poster_path ? `https://image.tmdb.org/t/p/w154${m.poster_path}` : null,
          time: 'In Cinemas',
          movieId: m.id,
          mediaType: 'movie'
        }));

        if (isMounted) {
          setTrendingNotifs(items);
          sessionStorage.setItem('cinelog_tmdb_notifs_cache', JSON.stringify(items));
        }
      } catch (err) {
        console.error('Failed to fetch trending notifications:', err);
      }
    };

    fetchTrending();
    return () => { isMounted = false; };
  }, []);

  // Generate personalized notifications based on user's actual library & milestones
  const libraryNotifs = useMemo(() => {
    const notifs = [];
    const watchedList = library.filter(m => m.status === 'watched');
    const watchlist = library.filter(m => m.status === 'plan_to_watch');
    const watchedCount = watchedList.length;

    // 1. Watchlist reminder if user has pending movies
    if (watchlist.length > 0) {
      // Pick the most recent watchlist item
      const pick = watchlist[0];
      notifs.push({
        id: `watchlist_prompt_${pick.id || pick.tmdb_id}`,
        type: 'watchlist',
        tag: 'From Your Watchlist',
        tagColor: '#38bdf8',
        title: `Ready for ${pick.title}?`,
        body: 'Waiting on your watchlist. Watch and record your rating to update your diary.',
        poster: pick.poster_path
          ? (pick.poster_path.startsWith('http') ? pick.poster_path : `https://image.tmdb.org/t/p/w154${pick.poster_path}`)
          : null,
        time: 'Watchlist',
        movieId: pick.tmdb_id || pick.id,
        mediaType: pick.media_type || 'movie'
      });
    }

    // 2. Milestones & Achievements based on watched count
    if (watchedCount >= 50) {
      notifs.push({
        id: 'milestone_gold_watcher',
        type: 'milestone',
        tag: 'Achievement Unlocked',
        tagColor: '#fbbf24',
        title: '🏆 Gold Watcher Milestone',
        body: `You've logged ${watchedCount} films! Check out your stats summary and unlocked borders.`,
        time: 'Milestone',
        tab: 'stats'
      });
    } else if (watchedCount >= 25) {
      notifs.push({
        id: 'milestone_silver_watcher',
        type: 'milestone',
        tag: 'Achievement Unlocked',
        tagColor: '#fbbf24',
        title: '🥈 Silver Watcher Qualified',
        body: `${watchedCount} films logged! Head to Profile Studio to equip your Silver border.`,
        time: 'Milestone',
        tab: 'profile'
      });
    } else if (watchedCount >= 5) {
      notifs.push({
        id: 'milestone_bronze_watcher',
        type: 'milestone',
        tag: 'Achievement Unlocked',
        tagColor: '#fbbf24',
        title: '🥉 Bronze Watcher Qualified',
        body: `5+ films recorded! Equip your Bronze Border in Profile Studio.`,
        time: 'Milestone',
        tab: 'profile'
      });
    } else if (watchedCount > 0) {
      notifs.push({
        id: 'diary_active_tip',
        type: 'tip',
        tag: 'Diary Active',
        tagColor: '#10b981',
        title: '✨ Watch Diary Recording',
        body: `${watchedCount} ${watchedCount === 1 ? 'title' : 'titles'} tracked. Rate 5 films to unlock your first custom profile border!`,
        time: 'Diary',
        tab: 'explore'
      });
    } else {
      notifs.push({
        id: 'welcome_starter_notif',
        type: 'tip',
        tag: 'Getting Started',
        tagColor: '#a855f7',
        title: '🎬 Welcome to CineLog',
        body: 'Browse Explore or use Ctrl+K to log your all-time favorite movies and series.',
        time: 'Welcome',
        tab: 'explore'
      });
    }

    // 3. Highlight top 10/10 rating if user has one
    const masterpiece = watchedList.find(m => Number(m.rating) === 10);
    if (masterpiece && watchedCount >= 3) {
      notifs.push({
        id: `masterpiece_top4_${masterpiece.id || masterpiece.tmdb_id}`,
        type: 'showcase',
        tag: 'Top Favorite',
        tagColor: '#ef4444',
        title: `Feature ${masterpiece.title}?`,
        body: 'You rated this a perfect 10/10! Pin it to your 4 Favorites on your profile.',
        poster: masterpiece.poster_path
          ? (masterpiece.poster_path.startsWith('http') ? masterpiece.poster_path : `https://image.tmdb.org/t/p/w154${masterpiece.poster_path}`)
          : null,
        time: 'Profile Tip',
        tab: 'profile'
      });
    }

    return notifs;
  }, [library]);

  // Combined notifications, filtered by dismissed items
  const activeNotifications = useMemo(() => {
    const combined = [...trendingNotifs, ...libraryNotifs];
    // Remove dismissed
    return combined.filter(n => !dismissedIds.includes(n.id));
  }, [trendingNotifs, libraryNotifs, dismissedIds]);

  // Unread count
  const unreadCount = useMemo(() => {
    return activeNotifications.filter(n => !readIds.includes(n.id)).length;
  }, [activeNotifications, readIds]);

  const markAsRead = useCallback((id) => {
    setReadIds(prev => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      localStorage.setItem(READ_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    const allIds = activeNotifications.map(n => n.id);
    setReadIds(prev => {
      const merged = Array.from(new Set([...prev, ...allIds]));
      localStorage.setItem(READ_KEY, JSON.stringify(merged));
      return merged;
    });
  }, [activeNotifications]);

  const dismissNotification = useCallback((id) => {
    setDismissedIds(prev => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    const allIds = activeNotifications.map(n => n.id);
    setDismissedIds(prev => {
      const merged = Array.from(new Set([...prev, ...allIds]));
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(merged));
      return merged;
    });
  }, [activeNotifications]);

  const resetNotifications = useCallback(() => {
    localStorage.removeItem(DISMISSED_KEY);
    localStorage.removeItem(READ_KEY);
    setDismissedIds([]);
    setReadIds([]);
  }, []);

  return {
    notifications: activeNotifications,
    unreadCount,
    readIds,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
    resetNotifications
  };
}
