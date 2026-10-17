-- ==============================================================================
-- CINELOG: CLEAN DATABASE ACCOUNTS & SEED REAL TEST USER (ELENA RODRIGUEZ)
-- ==============================================================================
-- Run this script in your Supabase Dashboard -> SQL Editor:
-- https://supabase.com/dashboard/project/ftijtxwcbgbblyqlyzyj/sql/new
--
-- This script:
-- 1. Cleans up old test accounts: fabiosilva, tester, importer, marracarrao, itzfabiopt2006, tester99
-- 2. Preserves your primary account (Lynnx)
-- 3. Inserts Elena Rodriguez (@elena_films) into public.profiles and seeds her library
-- ==============================================================================

-- 1. Remove follows involving old test accounts
DELETE FROM public.follows
WHERE follower_id IN (
  SELECT id FROM public.profiles WHERE username IN ('fabiosilva', 'tester', 'cinelog.importer.test+75284', 'marracarrao', 'itzfabiopt2006', 'tester99')
) OR following_id IN (
  SELECT id FROM public.profiles WHERE username IN ('fabiosilva', 'tester', 'cinelog.importer.test+75284', 'marracarrao', 'itzfabiopt2006', 'tester99')
);

-- 2. Remove library entries of old test accounts
DELETE FROM public.library
WHERE user_id IN (
  SELECT id FROM public.profiles WHERE username IN ('fabiosilva', 'tester', 'cinelog.importer.test+75284', 'marracarrao', 'itzfabiopt2006', 'tester99')
);

-- 3. Delete from public.profiles
DELETE FROM public.profiles 
WHERE username IN ('fabiosilva', 'tester', 'cinelog.importer.test+75284', 'marracarrao', 'itzfabiopt2006', 'tester99');

-- 4. Delete from auth.users (if any exist)
DELETE FROM auth.users 
WHERE raw_user_meta_data->>'username' IN ('fabiosilva', 'tester', 'cinelog.importer.test+75284', 'marracarrao', 'itzfabiopt2006', 'tester99')
   OR email LIKE '%tester%'
   OR email LIKE '%importer%';

-- ==============================================================================
-- 5. Seed Elena Rodriguez (@elena_films) as a pristine, active community member
-- ==============================================================================
INSERT INTO public.profiles (
  id,
  username,
  display_name,
  avatar_url,
  bio,
  equipped_border,
  banner_url,
  banner_fit_mode,
  banner_pos_percent,
  favorites,
  purchased_badges
) VALUES (
  'b4a8e239-1b20-4a8f-8d9e-5c4d3e2f1a0b',
  'elena_films',
  'Elena Rodriguez',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'Screenwriter & 35mm film purist. A24 devotee, Denis Villeneuve worshipper, and slow-cinema apologist. ⭐ 8.5+ means an instant classic.',
  'neon_crimson',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
  'cover',
  30,
  '[{"id":27205,"title":"Inception","poster_path":"/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg","score":10,"media_type":"movie"},{"id":693134,"title":"Dune: Part Two","poster_path":"/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg","score":9.8,"media_type":"movie"},{"id":157336,"title":"Interstellar","poster_path":"/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg","score":9.9,"media_type":"movie"},{"id":335984,"title":"Blade Runner 2049","poster_path":"/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg","score":9.8,"media_type":"movie"},{"id":969681,"title":"Spider-Man: Brand New Day","poster_path":"/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg","score":9.3,"media_type":"movie"}]'::jsonb,
  '["Verified Critic", "Top 100 Cinephile", "35mm Purist"]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  favorites = EXCLUDED.favorites;

-- Seed Elena's reviews in library
INSERT INTO public.library (
  id, user_id, tmdb_id, media_type, title, poster_path, release_year, genres, status, rating, review, favorite, tags, date_added
) VALUES
(
  'elena-lib-1',
  'b4a8e239-1b20-4a8f-8d9e-5c4d3e2f1a0b',
  '27205',
  'movie',
  'Inception',
  '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
  '2010',
  '["Action", "Science Fiction", "Adventure"]'::jsonb,
  'watched',
  10,
  'A cinematic triumph of mind-bending architectural precision and emotional depth. Christopher Nolan at the absolute peak of his craft — Hans Zimmer''s score elevates every single frame.',
  true,
  '["Masterpiece", "Nolan", "Sci-Fi", "Rewatch"]'::jsonb,
  NOW() - INTERVAL '1 day'
),
(
  'elena-lib-2',
  'b4a8e239-1b20-4a8f-8d9e-5c4d3e2f1a0b',
  '969681',
  'movie',
  'Spider-Man: Brand New Day',
  '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
  '2026',
  '["Action", "Adventure", "Science Fiction"]'::jsonb,
  'watched',
  9.3,
  'Incredible energy, vibrant pacing, and genuine emotional resonance. Easily one of the freshest superhero entries in years.',
  true,
  '["Spider-Man", "Marvel", "Must-See"]'::jsonb,
  NOW() - INTERVAL '2 days'
),
(
  'elena-lib-3',
  'b4a8e239-1b20-4a8f-8d9e-5c4d3e2f1a0b',
  '693134',
  'movie',
  'Dune: Part Two',
  '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
  '2024',
  '["Science Fiction", "Adventure"]'::jsonb,
  'watched',
  9.8,
  'Monolithic. A monumental sci-fi achievement that feels biblical in scale. Greig Fraser''s cinematography and the sound design deserve all the praise.',
  true,
  '["Villeneuve", "Sci-Fi", "Epic"]'::jsonb,
  NOW() - INTERVAL '3 days'
),
(
  'elena-lib-4',
  'b4a8e239-1b20-4a8f-8d9e-5c4d3e2f1a0b',
  '157336',
  'movie',
  'Interstellar',
  '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
  '2014',
  '["Adventure", "Drama", "Science Fiction"]'::jsonb,
  'watched',
  9.9,
  'The organ swell during the docking sequence still gives me goosebumps every time. Sci-fi poetry at its grandest.',
  true,
  '["Masterpiece", "Nolan", "Sci-Fi", "Rewatch"]'::jsonb,
  NOW() - INTERVAL '5 days'
),
(
  'elena-lib-5',
  'b4a8e239-1b20-4a8f-8d9e-5c4d3e2f1a0b',
  '335984',
  'movie',
  'Blade Runner 2049',
  '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
  '2017',
  '["Science Fiction", "Drama"]'::jsonb,
  'watched',
  9.8,
  'Roger Deakins delivered arguably the greatest visual lighting in 21st-century cinema. The pacing is hypnotic, philosophical, and melancholic in the most exquisite way.',
  true,
  '["Cyberpunk", "Villeneuve", "Visual Masterpiece"]'::jsonb,
  NOW() - INTERVAL '7 days'
),
(
  'elena-lib-6',
  'b4a8e239-1b20-4a8f-8d9e-5c4d3e2f1a0b',
  '414906',
  'movie',
  'The Batman',
  '/74xTEgt7R36Fpooo50r9T25onhq.jpg',
  '2022',
  '["Crime", "Mystery", "Thriller"]'::jsonb,
  'watched',
  8.8,
  'Matt Reeves gave us the Se7en-inspired detective Noir Batman we always deserved. Greig Fraser’s orange and black palette is stunning.',
  false,
  '["DC", "Noir", "Detective"]'::jsonb,
  NOW() - INTERVAL '9 days'
)
ON CONFLICT (id) DO NOTHING;
