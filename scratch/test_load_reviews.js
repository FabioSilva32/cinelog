import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ftijtxwcbgbblyqlyzyj.supabase.co';
const supabaseAnonKey = 'sb_publishable_UKDNb_c8aL7PFRhvD85zkg_7Pp46h3n';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLoadReviewsFixed() {
  const targetTmdbId = 969681;
  console.log(`=== Testing FIXED loadReviews query for tmdb_id ${targetTmdbId} ===`);

  const tmdbIdNum = Number(targetTmdbId);

  const { data, error } = await supabase
    .from('library')
    .select('id, rating, review, date_added, user_id')
    .eq('tmdb_id', tmdbIdNum)
    .not('review', 'is', null)
    .neq('review', '');

  console.log("Query error:", error ? error.message : "NONE");
  console.log("Query data count:", data ? data.length : 0);
  console.log("Data returned:", JSON.stringify(data, null, 2));

  if (data && data.length > 0) {
    const userIds = [...new Set(data.map(d => d.user_id))];
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', userIds);
    console.log("Profiles returned:", profs);
  }
}

testLoadReviewsFixed();
