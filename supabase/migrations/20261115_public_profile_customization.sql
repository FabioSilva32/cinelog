-- Add public profile customization and cosmetic-sync fields if missing.
-- Nullable additions preserve existing device-only values until the owner publishes them.
-- Additive only: preserves profile data and existing authentication / RLS policies.
begin;
alter table public.profiles
  add column if not exists banner_url text,
  add column if not exists banner_fit_mode text,
  add column if not exists banner_pos_percent numeric,
  add column if not exists equipped_border text,
  add column if not exists featured_badges jsonb,
  add column if not exists spent_cine_points numeric,
  add column if not exists purchased_borders jsonb,
  add column if not exists purchased_badges jsonb,
  add column if not exists purchased_banners jsonb,
  add column if not exists purchased_themes jsonb,
  add column if not exists trivia_cine_points numeric;
notify pgrst, 'reload schema';
commit;
