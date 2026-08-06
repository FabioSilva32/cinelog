import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ftijtxwcbgbblyqlyzyj.supabase.co';
const supabaseAnonKey = 'sb_publishable_UKDNb_c8aL7PFRhvD85zkg_7Pp46h3n';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAll() {
  const { data: lib, error } = await supabase
    .from('library')
    .select('id, user_id, tmdb_id, title, review, rating')
    .not('review', 'is', null)
    .neq('review', '');

  console.log("All reviews currently in database:");
  console.log(lib);
}

checkAll();
