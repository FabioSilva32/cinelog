import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ftijtxwcbgbblyqlyzyj.supabase.co';
const supabaseAnonKey = 'sb_publishable_UKDNb_c8aL7PFRhvD85zkg_7Pp46h3n';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQuery() {
  console.log("--- Testing profiles and library table query ---");
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  console.log(`Profiles count: ${profiles ? profiles.length : 0}`);
  if (profiles) console.log("Profiles:", profiles);

  const { data: library, error: lErr } = await supabase.from('library').select('*');
  console.log(`Library items count: ${library ? library.length : 0}`);
  if (library) console.log("Library items:", library);
}

testQuery();
