import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { ACHIEVEMENTS } from './achievements';

/**
 * Synchronize unlocked user achievements/badges to Supabase `user_badges` table.
 * Fails gracefully if offline, not logged in, or table not created yet.
 */
export async function syncUserBadges(currentUser, library = []) {
  if (!isSupabaseConfigured || !currentUser?.id || !Array.isArray(library)) {
    return [];
  }

  try {
    const unlocked = [];
    for (const ach of ACHIEVEMENTS) {
      const currentVal = ach.check(library);
      if (currentVal >= ach.target) {
        unlocked.push({
          user_id: currentUser.id,
          badge_id: ach.id,
          badge_name: ach.reward?.badgeName || ach.title,
          badge_icon: '🎖️'
        });
      }
    }

    if (unlocked.length === 0) return [];

    // Upsert into Supabase user_badges table
    const { data, error } = await supabase
      .from('user_badges')
      .upsert(unlocked, { onConflict: 'user_id,badge_id' })
      .select('*');

    if (error) {
      console.warn('Could not sync user_badges to Supabase:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.warn('Badge sync exception:', err);
    return [];
  }
}

/**
 * Fetch unlocked badges for any user from Supabase.
 */
export async function fetchUserBadges(userId) {
  if (!isSupabaseConfigured || !userId) return [];

  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.warn('Could not fetch user_badges:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Error fetching user_badges:', err);
    return [];
  }
}
