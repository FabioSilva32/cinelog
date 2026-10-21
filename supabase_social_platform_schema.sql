-- ==============================================================================
-- CINELOG: FULL SOCIAL CLOUD PLATFORM SCHEMA + OCT 30 EXPLICIT GRANTS
-- ==============================================================================
-- Run this in your Supabase Dashboard -> SQL Editor
-- This adds:
-- 1. `public.custom_lists` - Cloud Custom Movie Lists (shareable & discoverable)
-- 2. `public.list_likes` - Real Global Likes for Community Lists
-- 3. `public.tier_lists` - Cloud Tier Lists (S, A, B, C, D rankings backed up forever)
-- 4. `public.user_notifications` - Real Social Alerts (when someone follows, comments, or likes)
-- 5. Full Row-Level Security (RLS) & Explicit Post-Oct 30 GRANTs
-- ==============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CUSTOM LISTS / COLLECTIONS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.custom_lists (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  cover_image TEXT,
  is_public BOOLEAN DEFAULT true,
  is_ranked BOOLEAN DEFAULT false,
  entries JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  likes_count INT DEFAULT 0,
  author_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_lists_user_id ON public.custom_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_lists_public ON public.custom_lists(is_public);
CREATE INDEX IF NOT EXISTS idx_custom_lists_created ON public.custom_lists(created_at DESC);

ALTER TABLE public.custom_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public lists viewable by everyone" ON public.custom_lists;
CREATE POLICY "Public lists viewable by everyone"
  ON public.custom_lists FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own lists" ON public.custom_lists;
CREATE POLICY "Users can insert their own lists"
  ON public.custom_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own lists" ON public.custom_lists;
CREATE POLICY "Users can update their own lists"
  ON public.custom_lists FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own lists" ON public.custom_lists;
CREATE POLICY "Users can delete their own lists"
  ON public.custom_lists FOR DELETE
  USING (auth.uid() = user_id);

GRANT SELECT ON public.custom_lists TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_lists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_lists TO service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. LIST LIKES (COMMUNITY ENGAGEMENT)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.list_likes (
  list_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (list_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_list_likes_list_id ON public.list_likes(list_id);
CREATE INDEX IF NOT EXISTS idx_list_likes_user_id ON public.list_likes(user_id);

ALTER TABLE public.list_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "List likes viewable by everyone" ON public.list_likes;
CREATE POLICY "List likes viewable by everyone"
  ON public.list_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can like lists" ON public.list_likes;
CREATE POLICY "Users can like lists"
  ON public.list_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike lists" ON public.list_likes;
CREATE POLICY "Users can unlike lists"
  ON public.list_likes FOR DELETE
  USING (auth.uid() = user_id);

GRANT SELECT ON public.list_likes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.list_likes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.list_likes TO service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TIER LISTS TABLE (CLOUD RANKINGS)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tier_lists (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_public BOOLEAN DEFAULT true,
  tiers JSONB DEFAULT '[]'::jsonb,
  tier_data JSONB DEFAULT '{}'::jsonb,
  pool_filter TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tier_lists_user_id ON public.tier_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_tier_lists_public ON public.tier_lists(is_public);

ALTER TABLE public.tier_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public tier lists viewable by everyone" ON public.tier_lists;
CREATE POLICY "Public tier lists viewable by everyone"
  ON public.tier_lists FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tier lists" ON public.tier_lists;
CREATE POLICY "Users can insert their own tier lists"
  ON public.tier_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tier lists" ON public.tier_lists;
CREATE POLICY "Users can update their own tier lists"
  ON public.tier_lists FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tier lists" ON public.tier_lists;
CREATE POLICY "Users can delete their own tier lists"
  ON public.tier_lists FOR DELETE
  USING (auth.uid() = user_id);

GRANT SELECT ON public.tier_lists TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tier_lists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tier_lists TO service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. USER NOTIFICATIONS (SOCIAL ALERTS)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_username TEXT NOT NULL,
  actor_avatar_url TEXT,
  type TEXT NOT NULL,
  entity_id TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.user_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.user_notifications(created_at DESC);

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.user_notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.user_notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.user_notifications;
CREATE POLICY "Authenticated users can create notifications"
  ON public.user_notifications FOR INSERT
  WITH CHECK (auth.uid() = actor_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.user_notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.user_notifications FOR UPDATE
  USING (auth.uid() = user_id);

GRANT SELECT ON public.user_notifications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_notifications TO service_role;
