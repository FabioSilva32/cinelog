-- ==============================================================================
-- CINELOG: COMMENTS & BADGES SCHEMA + OCTOBER 30 EXPLICIT GRANTS
-- ==============================================================================
-- Run this in your Supabase Dashboard -> SQL Editor
-- This adds:
-- 1. `public.list_comments` - Real-time discussion & comments on custom movie lists
-- 2. `public.user_badges` - Synced unlocked trophies and equippable profile badges
-- 3. Row-level security (RLS) policies so users can only write/delete their own data
-- 4. Explicit GRANTs to anon, authenticated, and service_role (compliant with Supabase's Oct 30 update!)
-- ==============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. LIST COMMENTS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.list_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_list_comments_list_id ON public.list_comments(list_id);
CREATE INDEX IF NOT EXISTS idx_list_comments_user_id ON public.list_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_list_comments_created_at ON public.list_comments(created_at);

-- Enable RLS
ALTER TABLE public.list_comments ENABLE ROW LEVEL SECURITY;

-- Policies for list_comments
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.list_comments;
CREATE POLICY "Comments are viewable by everyone"
  ON public.list_comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.list_comments;
CREATE POLICY "Authenticated users can insert comments"
  ON public.list_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.list_comments;
CREATE POLICY "Users can delete their own comments"
  ON public.list_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Explicit Grants (Supabase Oct 30 Requirement)
GRANT SELECT ON public.list_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.list_comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.list_comments TO service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. USER BADGES TABLE (Online Achievements & Trophy Sync)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_icon TEXT DEFAULT '🎖️',
  is_equipped BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_badge UNIQUE (user_id, badge_id)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_equipped ON public.user_badges(user_id, is_equipped);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Policies for user_badges
DROP POLICY IF EXISTS "User badges are viewable by everyone" ON public.user_badges;
CREATE POLICY "User badges are viewable by everyone"
  ON public.user_badges FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own badges" ON public.user_badges;
CREATE POLICY "Users can insert their own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own badges" ON public.user_badges;
CREATE POLICY "Users can update their own badges"
  ON public.user_badges FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own badges" ON public.user_badges;
CREATE POLICY "Users can delete their own badges"
  ON public.user_badges FOR DELETE
  USING (auth.uid() = user_id);

-- Explicit Grants (Supabase Oct 30 Requirement)
GRANT SELECT ON public.user_badges TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_badges TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_badges TO service_role;
