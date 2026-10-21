-- ==============================================================================
-- CINELOG: SECURITY LINTER FIXES + USEFUL COMMUNITY SOCIAL TABLES
-- ==============================================================================

-- 1. FIX DATABASE SECURITY LINTER WARNINGS ON handle_new_user
-- Sets fixed search path so function is not vulnerable to path injection
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Revokes direct execute privileges from API users (it is an internal trigger function)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;


-- 2. REVIEW LIKES TABLE (COMMUNITY REVIEWS ENGAGEMENT)
CREATE TABLE IF NOT EXISTS public.review_likes (
  library_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (library_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_likes_lib ON public.review_likes(library_id);
CREATE INDEX IF NOT EXISTS idx_review_likes_user ON public.review_likes(user_id);

ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Review likes viewable by everyone" ON public.review_likes;
CREATE POLICY "Review likes viewable by everyone" 
  ON public.review_likes FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can like reviews" ON public.review_likes;
CREATE POLICY "Users can like reviews" 
  ON public.review_likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike reviews" ON public.review_likes;
CREATE POLICY "Users can unlike reviews" 
  ON public.review_likes FOR DELETE 
  USING (auth.uid() = user_id);

GRANT SELECT ON public.review_likes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_likes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_likes TO service_role;


-- 3. ACTIVITY FEED TABLE (LIVE SOCIAL STREAM)
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL, -- 'logged_movie', 'rated', 'created_list', 'earned_badge'
  title TEXT NOT NULL,
  media_type TEXT DEFAULT 'movie',
  poster_path TEXT,
  rating NUMERIC,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON public.activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON public.activity_feed(created_at DESC);

ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Activity feed viewable by everyone" ON public.activity_feed;
CREATE POLICY "Activity feed viewable by everyone" 
  ON public.activity_feed FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own activity" ON public.activity_feed;
CREATE POLICY "Users can insert their own activity" 
  ON public.activity_feed FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT ON public.activity_feed TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_feed TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_feed TO service_role;
