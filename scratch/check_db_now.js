import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ftijtxwcbgbblyqlyzyj.supabase.co';
const supabaseAnonKey = 'sb_publishable_UKDNb_c8aL7PFRhvD85zkg_7Pp46h3n';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log("=== Checking ALL rows in Supabase library table ===");
  const { data: lib, error: lErr } = await supabase.from('library').select('*');
  if (lErr) console.error("Library Error:", lErr);
  else console.log(`Total rows in library: ${lib.length}`);

  const reviews = lib ? lib.filter(r => r.review && r.review.trim() !== '' && !r.review.startsWith('\n\n__EPISODE_DATA__')) : [];
  console.log(`Total rows with non-empty review text: ${reviews.length}`);
  console.log(JSON.stringify(reviews, null, 2));

  console.log("\n=== Checking ALL profiles in Supabase ===");
  const { data: profs, error: pErr } = await supabase.from('profiles').select('*');
  if (pErr) console.error("Profiles Error:", pErr);
  else console.log(`Total profiles: ${profs.length}`, profs.map(p => ({ id: p.id, username: p.username })));
}

checkDatabase();
