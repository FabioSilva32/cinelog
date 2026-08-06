import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ftijtxwcbgbblyqlyzyj.supabase.co';
const supabaseAnonKey = 'sb_publishable_UKDNb_c8aL7PFRhvD85zkg_7Pp46h3n';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkMarracarrao() {
  const marracarraoId = 'cbe2eb38-a8ee-47ee-b8e3-7ab71b84b59c';
  console.log(`=== Checking library items for marracarrao (${marracarraoId}) ===`);
  const { data, error } = await supabase.from('library').select('*').eq('user_id', marracarraoId);
  if (error) console.error(error);
  else {
    console.log(`Found ${data.length} items for marracarrao in database:`);
    console.log(JSON.stringify(data, null, 2));
  }
}

checkMarracarrao();
