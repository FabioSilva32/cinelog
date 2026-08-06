import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ftijtxwcbgbblyqlyzyj.supabase.co';
const supabaseAnonKey = 'sb_publishable_UKDNb_c8aL7PFRhvD85zkg_7Pp46h3n';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSelect() {
  console.log("=== Querying library as ANON ===");
  const { data, error } = await supabase
    .from('library')
    .select('id, user_id, title, review, rating, tmdb_id');

  if (error) {
    console.error("ANON query error:", error);
  } else {
    console.log(`ANON query returned ${data.length} total rows.`);
    const userIds = [...new Set(data.map(d => d.user_id))];
    console.log("Unique user_ids in result:", userIds);
  }
}

testSelect();
