-- Review and apply in the Supabase SQL editor before release. No data is deleted.
-- Restrictive policies add an AND condition even if an older permissive policy remains.
begin;
alter table public.list_comments enable row level security;
alter table public.list_likes enable row level security;
drop policy if exists cinelog_visible_list_comments on public.list_comments;
create policy cinelog_visible_list_comments on public.list_comments as restrictive for select to anon, authenticated
using (exists (select 1 from public.custom_lists l where l.id=list_id and (l.is_public=true or l.user_id=auth.uid())));
drop policy if exists cinelog_comment_visible_list on public.list_comments;
create policy cinelog_comment_visible_list on public.list_comments as restrictive for insert to authenticated
with check (user_id=auth.uid() and exists (select 1 from public.custom_lists l where l.id=list_id and (l.is_public=true or l.user_id=auth.uid())));
drop policy if exists cinelog_visible_list_likes on public.list_likes;
create policy cinelog_visible_list_likes on public.list_likes as restrictive for select to anon, authenticated
using (exists (select 1 from public.custom_lists l where l.id=list_id and (l.is_public=true or l.user_id=auth.uid())));
drop policy if exists cinelog_like_visible_list on public.list_likes;
create policy cinelog_like_visible_list on public.list_likes as restrictive for insert to authenticated
with check (user_id=auth.uid() and exists (select 1 from public.custom_lists l where l.id=list_id and (l.is_public=true or l.user_id=auth.uid())));
create or replace function public.enforce_cinelog_creator_frame() returns trigger language plpgsql set search_path=pg_catalog,public as $$
begin
 if new.equipped_border='creator' and new.id not in ('2436dd73-13e2-45a9-b2af-664a221250d8'::uuid,'754ce8a9-e74a-4277-ab9c-847408153029'::uuid,'2bf89559-f45b-48c1-9b44-1c79bc951a80'::uuid) then
  raise exception 'This frame is reserved for the CineLog creator.' using errcode='42501';
 end if;
 return new;
end;
$$;
revoke all on function public.enforce_cinelog_creator_frame() from public;
drop trigger if exists cinelog_creator_frame_guard on public.profiles;
create trigger cinelog_creator_frame_guard before insert or update of equipped_border on public.profiles for each row execute function public.enforce_cinelog_creator_frame();
commit;
