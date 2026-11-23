-- Preserves all existing profiles and list data. Apply in Supabase SQL Editor.
begin;
alter table public.profiles add column if not exists pinned_list_ids text[] not null default '{}';
-- Ownership remains governed by the existing profiles UPDATE RLS policy.
-- The UI only renders pins for lists the viewer is already allowed to read.
commit;
