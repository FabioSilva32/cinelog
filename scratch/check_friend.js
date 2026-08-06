import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ftijtxwcbgbblyqlyzyj.supabase.co';
const supabaseAnonKey = 'sb_publishable_UKDNb_c8aL7PFRhvD85zkg_7Pp46h3n';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkFriend() {
  console.log("=== Checking profile for 'marracarrao' ===");
  const { data: profs, error: pErr } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', '%marracarrao%');
  
  if (pErr) {
    console.error("Error fetching profile:", pErr);
    return;
  }
  
  console.log("Profiles found:", profs);

  if (profs && profs.length > 0) {
    for (const p of profs) {
      console.log(`\n=== Library items for user_id: ${p.id} (${p.username}) ===`);
      const { data: items, error: lErr } = await supabase
        .from('library')
        .select('*')
        .eq('user_id', p.id);
      
      if (lErr) {
        console.error("Error fetching library:", lErr);
      } else {
        console.log(`Found ${items ? items.length : 0} items for ${p.username}:`);
        console.log(JSON.stringify(items, null, 2));
      }
    }
  }
}

checkFriend();
