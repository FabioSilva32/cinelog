-- ==============================================================================
-- CINELOG PRODUCTION DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- ==============================================================================
-- Execute this script in your Supabase SQL Editor (Dashboard -> SQL Editor).
-- It enforces strict database security so that:
-- 1. All diaries and profiles are publicly readable by other cinephiles.
-- 2. Nobody can edit, overwrite, or delete another user's library, ratings, or profile.
-- 3. Only the authenticated user matching auth.uid() can insert, update, or delete.
-- ==============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  equipped_border TEXT DEFAULT 'none',
  banner_url TEXT DEFAULT '',
  banner_fit_mode TEXT DEFAULT 'cover',
  banner_pos_percent NUMERIC DEFAULT 20,
  favorites JSONB DEFAULT '[]'::jsonb,
  purchased_badges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- 2. LIBRARY TABLE (Movies, TV series, Seasons, Ratings, Reviews)
CREATE TABLE IF NOT EXISTS public.library (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tmdb_id TEXT NOT NULL,
  media_type TEXT DEFAULT 'movie',
  title TEXT NOT NULL,
  poster_path TEXT,
  release_year TEXT,
  genres JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'plan_to_watch',
  rating NUMERIC,
  review TEXT,
  favorite BOOLEAN DEFAULT false,
  date_added TIMESTAMPTZ DEFAULT NOW(),
  tags JSONB DEFAULT '[]'::jsonb,
  episode_data JSONB,
  season_ratings JSONB,
  season_notes JSONB,
  season_dates JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_library_user_id ON public.library(user_id);
CREATE INDEX IF NOT EXISTS idx_library_tmdb_id ON public.library(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_library_user_tmdb ON public.library(user_id, tmdb_id);

-- Enable RLS on library
ALTER TABLE public.library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public library entries viewable by everyone" ON public.library;
CREATE POLICY "Public library entries viewable by everyone"
  ON public.library FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own library entries" ON public.library;
CREATE POLICY "Users can insert their own library entries"
  ON public.library FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own library entries" ON public.library;
CREATE POLICY "Users can update their own library entries"
  ON public.library FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own library entries" ON public.library;
CREATE POLICY "Users can delete their own library entries"
  ON public.library FOR DELETE
  USING (auth.uid() = user_id);


-- 3. FOLLOWS TABLE (Social Connections)
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- Enable RLS on follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can follow other users" ON public.follows;
CREATE POLICY "Users can follow other users"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);


-- 4. AUTOMATIC NEW USER PROFILE TRIGGER
-- Automatically creates a profile row in public.profiles when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url, bio)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'),
    'Cinephile & movie tracking fan.'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
