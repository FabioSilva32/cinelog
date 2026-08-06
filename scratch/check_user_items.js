import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ftijtxwcbgbblyqlyzyj.supabase.co';
const supabaseAnonKey = 'sb_publishable_UKDNb_c8aL7PFRhvD85zkg_7Pp46h3n';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUsers() {
  console.log("=== Checking all user_ids in library ===");
  const { data: lib, error } = await supabase
    .from('library')
    .select('id, user_id, tmdb_id, title, review, rating');

  const byUser = {};
  lib.forEach(item => {
    if (!byUser[item.user_id]) byUser[item.user_id] = [];
    byUser[item.user_id].push(item);
  });

  for (const uid in byUser) {
    const { data: prof } = await supabase.from('profiles').select('username, display_name').eq('id', uid).single();
    const username = prof ? prof.username : 'NO PROFILE FOUND';
    const items = byUser[uid];
    const withReviews = items.filter(i => i.review && i.review.trim() !== '');
    console.log(`\nUser ID: ${uid} | Username: ${username}`);
    console.log(`Total library items: ${items.length} | Items with reviews: ${withReviews.length}`);
    if (withReviews.length > 0) {
      console.log("Reviews:", JSON.stringify(withReviews, null, 2));
    }
  }
}

checkUsers();
