import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = 'https://ftijtxwcbgbblyqlyzyj.supabase.co';
const supabaseAnonKey = 'sb_publishable_UKDNb_c8aL7PFRhvD85zkg_7Pp46h3n';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  console.log("=== Testing valid UUID insert for marracarrao (user_id: cbe2eb38-a8ee-47ee-b8e3-7ab71b84b59c) ===");
  
  const testMovie = {
    id: crypto.randomUUID(),
    user_id: 'cbe2eb38-a8ee-47ee-b8e3-7ab71b84b59c',
    tmdb_id: 969681,
    media_type: 'movie',
    title: 'Spider-Man: Brand New Day',
    status: 'watched',
    rating: 9.0,
    review: 'Awesome movie from marracarrao!',
  };

  const { data, error } = await supabase.from('library').upsert(testMovie).select();

  if (error) {
    console.error("UPSERT ERROR:", error);
  } else {
    console.log("UPSERT SUCCESSFUL:", data);
  }
}

testInsert();
