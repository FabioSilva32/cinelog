-- Additive community upgrade. Apply once in Supabase SQL Editor; existing data is preserved.
begin;
alter table public.profiles add column if not exists pinned_list_ids text[] not null default '{}';

create table if not exists public.social_events (
 id uuid primary key default gen_random_uuid(), actor_id uuid not null references public.profiles(id) on delete cascade,
 event_kind text not null, library_id text, list_id text, payload jsonb not null default '{}', created_at timestamptz not null default now()
);
create index if not exists social_events_timeline on public.social_events(created_at desc);
create index if not exists social_events_library on public.social_events(library_id);
create index if not exists social_events_lists on public.social_events(list_id);
create index if not exists social_events_actor on public.social_events(actor_id,created_at desc);
create table if not exists public.social_watchlists (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
 title text not null check(length(btrim(title)) between 1 and 100), description text not null default '' check(length(description)<=1000),
 visibility text not null default 'private' check(visibility in ('private','public')), watch_at timestamptz,
 created_at timestamptz not null default now()
);
create table if not exists public.social_watchlist_members (
 watchlist_id uuid not null references public.social_watchlists(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade, role text not null default 'editor' check(role in ('owner','editor')),
 primary key(watchlist_id,user_id)
);
create table if not exists public.social_watchlist_titles (
 id uuid primary key default gen_random_uuid(), watchlist_id uuid not null references public.social_watchlists(id) on delete cascade,
 tmdb_id integer not null check(tmdb_id>0), media_type text not null check(media_type in ('movie','tv')),
 title text not null check(length(title) between 1 and 300), poster_path text, added_by uuid not null default auth.uid() references public.profiles(id),
 created_at timestamptz not null default now(), unique(watchlist_id,tmdb_id,media_type)
);
create table if not exists public.social_watchlist_votes (
 watchlist_id uuid not null, user_id uuid not null references public.profiles(id) on delete cascade,
 tmdb_id integer not null, media_type text not null, primary key(watchlist_id,user_id),
 foreign key(watchlist_id,tmdb_id,media_type) references public.social_watchlist_titles(watchlist_id,tmdb_id,media_type) on delete cascade
);
create table if not exists public.social_clubs (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
 name text not null check(length(btrim(name)) between 1 and 80), description text not null default '' check(length(description)<=1000),
 theme text not null default '' check(length(theme)<=200), visibility text not null default 'public' check(visibility in ('private','public')),
 created_at timestamptz not null default now()
);
create table if not exists public.social_club_members (
 club_id uuid not null references public.social_clubs(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade, role text not null default 'member' check(role in ('owner','member')),
 primary key(club_id,user_id)
);
create table if not exists public.social_comments (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
 target_kind text not null check(target_kind in ('review','episode','club')), target_id text not null,
 parent_id uuid references public.social_comments(id) on delete set null,
 body text not null check(length(body)<=2000), contains_spoilers boolean not null default false,
 deleted_at timestamptz, created_at timestamptz not null default now(),
 check(deleted_at is not null or length(btrim(body))>0)
);
create index if not exists social_comments_thread on public.social_comments(target_kind,target_id,created_at desc);
create table if not exists public.social_recommendations (
 id uuid primary key default gen_random_uuid(), sender_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
 recipient_id uuid not null references public.profiles(id) on delete cascade, tmdb_id integer not null check(tmdb_id>0),
 media_type text not null check(media_type in ('movie','tv')), title text not null check(length(title) between 1 and 300), poster_path text,
 note text not null default '' check(length(note)<=500), status text not null default 'new' check(status in ('new','saved','dismissed')),
 created_at timestamptz not null default now(), check(sender_id<>recipient_id)
);
create table if not exists public.social_notifications (
 id uuid primary key default gen_random_uuid(), recipient_id uuid not null references public.profiles(id) on delete cascade,
 actor_id uuid not null references public.profiles(id) on delete cascade, kind text not null,
 payload jsonb not null default '{}', read_at timestamptz, created_at timestamptz not null default now()
);
create index if not exists social_notifications_inbox on public.social_notifications(recipient_id,created_at desc);

create or replace function public.social_is_member(p_kind text,p_id text) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select auth.uid() is not null and case when p_kind='list' then exists(select 1 from public.social_watchlist_members m where m.watchlist_id::text=p_id and m.user_id=auth.uid())
 when p_kind='club' then exists(select 1 from public.social_club_members m where m.club_id::text=p_id and m.user_id=auth.uid()) else false end;
$$;
create or replace function public.social_can_read(p_kind text,p_id text) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select case when p_kind='list' then exists(select 1 from public.social_watchlists l where l.id::text=p_id and (l.visibility='public' or l.owner_id=auth.uid() or public.social_is_member('list',p_id)))
 when p_kind='club' then exists(select 1 from public.social_clubs c where c.id::text=p_id and (c.visibility='public' or c.owner_id=auth.uid() or public.social_is_member('club',p_id)))
 when p_kind='review' then exists(select 1 from public.library l where l.id::text=p_id)
 when p_kind='episode' then p_id ~ '^tv:[1-9][0-9]*:[0-9]{1,4}:[1-9][0-9]{0,4}$' else false end;
$$;
create or replace function public.social_meta(p_review text) returns jsonb language plpgsql immutable set search_path=public,pg_temp as $$
declare value jsonb;begin value:=split_part(coalesce(p_review,''),'__EPISODE_DATA__:',2)::jsonb;return case when jsonb_typeof(value)='object' then value else '{}'::jsonb end;exception when others then return '{}'::jsonb;end;$$;
create or replace function public.social_notice(p_recipient uuid,p_kind text,p_payload jsonb) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin if auth.uid() is not null and p_recipient is not null and p_recipient<>auth.uid() and not exists(select 1 from public.social_notifications where recipient_id=p_recipient and actor_id=auth.uid() and kind=p_kind and payload=p_payload and created_at>now()-interval '5 minutes') then insert into public.social_notifications(recipient_id,actor_id,kind,payload) values(p_recipient,auth.uid(),p_kind,p_payload);end if;end;$$;
create or replace function public.social_owner_membership() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin if tg_table_name='social_watchlists' then insert into public.social_watchlist_members(watchlist_id,user_id,role) values(new.id,new.owner_id,'owner') on conflict do nothing;
else insert into public.social_club_members(club_id,user_id,role) values(new.id,new.owner_id,'owner') on conflict do nothing;end if;return new;end;$$;
create or replace function public.social_guard_resource() returns trigger language plpgsql set search_path=public,pg_temp as $$
begin if new.owner_id<>old.owner_id or new.id<>old.id or new.created_at<>old.created_at then raise exception 'Ownership cannot be changed.' using errcode='42501';end if;return new;end;$$;
drop trigger if exists social_list_owner on public.social_watchlists;
create trigger social_list_owner after insert on public.social_watchlists for each row execute function public.social_owner_membership();
drop trigger if exists social_club_owner on public.social_clubs;
create trigger social_club_owner after insert on public.social_clubs for each row execute function public.social_owner_membership();
drop trigger if exists social_list_guard on public.social_watchlists;
create trigger social_list_guard before update on public.social_watchlists for each row execute function public.social_guard_resource();
drop trigger if exists social_club_guard on public.social_clubs;
create trigger social_club_guard before update on public.social_clubs for each row execute function public.social_guard_resource();

create or replace function public.social_comment_guard() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare parent public.social_comments; meta jsonb;
begin
 if tg_op='UPDATE' then
  if (new.user_id,new.target_kind,new.target_id,new.parent_id,new.created_at,new.id) is distinct from (old.user_id,old.target_kind,old.target_id,old.parent_id,old.created_at,old.id) then raise exception 'A reply cannot be moved to another conversation.' using errcode='42501';end if;
  if new.deleted_at is not null then new.body:='';end if;
 end if;
 if new.parent_id is not null then select * into parent from public.social_comments where id=new.parent_id;
  if not found or parent.target_kind<>new.target_kind or parent.target_id<>new.target_id then raise exception 'Reply target does not match this conversation.' using errcode='42501';end if;
  new.contains_spoilers:=new.contains_spoilers or parent.contains_spoilers;
 end if;
 if new.target_kind='episode' then new.contains_spoilers:=true;end if;
 if new.target_kind='review' then select public.social_meta(review) into meta from public.library where id::text=new.target_id;new.contains_spoilers:=new.contains_spoilers or coalesce(meta->>'contains_spoilers'='true',false);end if;
 return new;
end;$$;
drop trigger if exists social_comment_guard on public.social_comments;
create trigger social_comment_guard before insert or update on public.social_comments for each row execute function public.social_comment_guard();
create or replace function public.social_comment_notifications() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare recipient uuid; candidates uuid[]:='{}'; mention text[]; parent_user uuid;
begin
 if new.parent_id is not null then select user_id into parent_user from public.social_comments where id=new.parent_id;candidates:=array_append(candidates,parent_user);end if;
 if new.target_kind='review' then select user_id into recipient from public.library where id::text=new.target_id;candidates:=array_append(candidates,recipient);end if;
 for mention in select regexp_matches(new.body,'@([[:alnum:]_][[:alnum:]_.-]{0,49})','g') loop
  for recipient in select id from public.profiles where lower(username)=lower(rtrim(mention[1],'.')) loop
   if new.target_kind<>'club' or exists(select 1 from public.social_clubs c where c.id::text=new.target_id and (c.visibility='public' or c.owner_id=recipient or exists(select 1 from public.social_club_members m where m.club_id=c.id and m.user_id=recipient))) then candidates:=array_append(candidates,recipient);end if;
  end loop;
 end loop;
 for recipient in select distinct x from unnest(candidates) x where x is not null loop
  perform public.social_notice(recipient,case when recipient=parent_user then 'reply' else 'comment' end,jsonb_build_object('target_kind',new.target_kind,'target_id',new.target_id,'comment_id',new.id,'contains_spoilers',new.contains_spoilers));
 end loop;return new;
end;$$;
drop trigger if exists social_comment_notifications on public.social_comments;
create trigger social_comment_notifications after insert on public.social_comments for each row execute function public.social_comment_notifications();

create or replace function public.social_library_event() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare kind text; clean text; previous text; meta jsonb; previous_meta jsonb; old_count integer:=0; new_count integer:=0;
begin
 if not exists(select 1 from public.profiles where id=new.user_id) then return new;end if;
 clean:=btrim(split_part(split_part(coalesce(new.review,''),'__EPISODE_DATA__:',1), '__EPISODE_RATINGS__:',1),E' \t\r\n');meta:=public.social_meta(new.review);
 if tg_op='UPDATE' then
  previous:=btrim(split_part(split_part(coalesce(old.review,''),'__EPISODE_DATA__:',1), '__EPISODE_RATINGS__:',1),E' \t\r\n');previous_meta:=public.social_meta(old.review);
  -- Edits/removals must not leave a stale, unprotected copy of the latest review in the timeline.
  update public.social_events set payload=jsonb_set(jsonb_set(payload,'{review}',to_jsonb(clean)),'{contains_spoilers}',to_jsonb(coalesce(meta->>'contains_spoilers'='true',false))) where library_id=new.id::text and event_kind<>'rewatch';
  if jsonb_typeof(meta->'screenings')='array' then new_count:=jsonb_array_length(meta->'screenings');end if;
  if jsonb_typeof(previous_meta->'screenings')='array' then old_count:=jsonb_array_length(previous_meta->'screenings');end if;
  -- Diary edits/removals also update or remove the corresponding rewatch snapshot.
  if jsonb_typeof(meta->'screenings')='array' then
   delete from public.social_events e where e.library_id=new.id::text and e.event_kind='rewatch' and not exists(select 1 from jsonb_array_elements(meta->'screenings') s where s->>'id'=e.payload->>'screening_id');
   update public.social_events e set payload=e.payload||jsonb_build_object('review',coalesce(s.value->>'review',''),'rating',s.value->'rating','contains_spoilers',coalesce((s.value->>'contains_spoilers')::boolean,(meta->>'contains_spoilers')::boolean,false)) from jsonb_array_elements(meta->'screenings') s where e.library_id=new.id::text and e.event_kind='rewatch' and e.payload->>'screening_id'=s.value->>'id';
  end if;
  if new_count>old_count and new_count>1 then kind:='rewatch';
  elsif clean is distinct from previous and clean<>'' then kind:='review';
  elsif new.rating is distinct from old.rating then kind:='rating';
  elsif new.status is distinct from old.status then kind:=case when new.status='watched' then 'watched' else 'status' end;
  else return new;end if;
 else kind:=case when clean<>'' then 'review' when new.status='watched' then 'watched' else 'status' end;end if;
 insert into public.social_events(actor_id,event_kind,library_id,payload) values(new.user_id,kind,new.id::text,jsonb_build_object('tmdb_id',new.tmdb_id,'media_type',new.media_type,'title',new.title,'poster_path',new.poster_path,'rating',new.rating,'review',clean,'contains_spoilers',coalesce(meta->>'contains_spoilers'='true',false),'status',new.status,'screening_id',meta->'screenings'->0->>'id'));
 return new;
end;$$;
drop trigger if exists social_library_activity on public.library;
create trigger social_library_activity after insert or update on public.library for each row execute function public.social_library_event();
create or replace function public.social_list_event() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if new.is_public is not true or not exists(select 1 from public.profiles where id=new.user_id) then return new;end if;
 if tg_op='UPDATE' and (new.title,new.description,new.entries,new.is_public) is not distinct from (old.title,old.description,old.entries,old.is_public) then return new;end if;
 insert into public.social_events(actor_id,event_kind,list_id,payload) values(new.user_id,case when tg_op='INSERT' then 'list_created' else 'list_updated' end,new.id::text,jsonb_build_object('title',new.title));return new;
end;$$;
drop trigger if exists social_list_activity on public.custom_lists;
create trigger social_list_activity after insert or update on public.custom_lists for each row execute function public.social_list_event();

create or replace function public.social_shared_event() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare resource uuid; owner uuid; name text;begin
 if auth.uid() is null then return null;end if;
 if tg_table_name='social_watchlists' then
  if tg_op='UPDATE' and (new.title,new.description,new.visibility,new.watch_at) is not distinct from (old.title,old.description,old.visibility,old.watch_at) then return new;end if;
  resource:=new.id;name:=new.title;
 else resource:=case when tg_op='DELETE' then old.watchlist_id else new.watchlist_id end;select title into name from public.social_watchlists where id=resource;if not found then return null;end if;end if;
 insert into public.social_events(actor_id,event_kind,payload) values(auth.uid(),case when tg_table_name='social_watchlists' and tg_op='INSERT' then 'watchlist_created' else 'watchlist_updated' end,jsonb_build_object('resource_id',resource,'title',name));return null;
end;$$;
drop trigger if exists social_watchlist_activity on public.social_watchlists;
create trigger social_watchlist_activity after insert or update on public.social_watchlists for each row execute function public.social_shared_event();
drop trigger if exists social_shared_titles_activity on public.social_watchlist_titles;
create trigger social_shared_titles_activity after insert or delete on public.social_watchlist_titles for each row execute function public.social_shared_event();

create or replace function public.social_reaction_notice() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare recipient uuid; name text;begin
 if tg_table_name='follows' then select username into name from public.profiles where id=new.follower_id;perform public.social_notice(new.following_id,'follow',jsonb_build_object('username',name));
 elsif tg_table_name='review_likes' then select user_id into recipient from public.library where id::text=new.library_id::text;perform public.social_notice(recipient,'review_like',jsonb_build_object('target_kind','review','target_id',new.library_id));
 else select user_id into recipient from public.custom_lists where id::text=new.list_id::text;perform public.social_notice(recipient,'list_like',jsonb_build_object('list_id',new.list_id));end if;return new;
end;$$;
do $$ declare t text;begin foreach t in array array['follows','review_likes','list_likes'] loop if to_regclass('public.'||t) is not null then execute format('drop trigger if exists social_reaction_notice on public.%I',t);execute format('create trigger social_reaction_notice after insert on public.%I for each row execute function public.social_reaction_notice()',t);end if;end loop;end $$;

create or replace function public.social_invite(p_kind text,p_id uuid,p_username text) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare recipient uuid; owner uuid; title text;
begin
 if auth.uid() is null then raise exception 'Sign in first.' using errcode='42501';end if;
 if p_kind='list' then select owner_id,l.title into owner,title from public.social_watchlists l where id=p_id;
 elsif p_kind='club' then select owner_id,name into owner,title from public.social_clubs where id=p_id;
 else raise exception 'Unknown invitation type.';end if;
 if owner is distinct from auth.uid() then raise exception 'Only the owner can invite editors or members.' using errcode='42501';end if;
 select id into recipient from public.profiles where username=btrim(p_username);
 if recipient is null then select id into recipient from public.profiles where lower(username)=lower(btrim(p_username)) limit 1;end if;
 if recipient is null then raise exception 'That username could not be found.';end if;
 if p_kind='list' then insert into public.social_watchlist_members(watchlist_id,user_id,role) values(p_id,recipient,'editor') on conflict do nothing;
 else insert into public.social_club_members(club_id,user_id,role) values(p_id,recipient,'member') on conflict do nothing;end if;
 perform public.social_notice(recipient,p_kind||'_invite',jsonb_build_object('resource_id',p_id,'title',title));return recipient;
end;$$;
create or replace function public.social_remove_member(p_kind text,p_id uuid,p_user uuid) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare owner uuid;begin
 if p_kind='list' then select owner_id into owner from public.social_watchlists where id=p_id;else select owner_id into owner from public.social_clubs where id=p_id;end if;
 if auth.uid() is null or (auth.uid()<>owner and auth.uid()<>p_user) or p_user=owner then raise exception 'Membership cannot be removed.' using errcode='42501';end if;
 if p_kind='list' then delete from public.social_watchlist_votes where watchlist_id=p_id and user_id=p_user;delete from public.social_watchlist_members where watchlist_id=p_id and user_id=p_user;
 elsif p_kind='club' then delete from public.social_club_members where club_id=p_id and user_id=p_user;else raise exception 'Unknown membership type.';end if;
end;$$;
create or replace function public.social_join_club(p_id uuid) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin if auth.uid() is null or not exists(select 1 from public.social_clubs where id=p_id and visibility='public') then raise exception 'This club cannot be joined.' using errcode='42501';end if;
 insert into public.social_club_members(club_id,user_id) values(p_id,auth.uid()) on conflict do nothing;end;$$;
create or replace function public.social_vote(p_id uuid,p_tmdb_id integer,p_media_type text) returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
begin if not public.social_is_member('list',p_id::text) then raise exception 'Join this watchlist before voting.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtext(p_id::text||auth.uid()::text));
 if exists(select 1 from public.social_watchlist_votes where watchlist_id=p_id and user_id=auth.uid() and tmdb_id=p_tmdb_id and media_type=p_media_type) then delete from public.social_watchlist_votes where watchlist_id=p_id and user_id=auth.uid();return false;end if;
 insert into public.social_watchlist_votes(watchlist_id,user_id,tmdb_id,media_type) values(p_id,auth.uid(),p_tmdb_id,p_media_type) on conflict(watchlist_id,user_id) do update set tmdb_id=excluded.tmdb_id,media_type=excluded.media_type;return true;end;$$;
create or replace function public.social_recommendation_guard() returns trigger language plpgsql set search_path=public,pg_temp as $$
begin if new.status<>'new' then raise exception 'New recommendations must start unread.' using errcode='42501';end if;return new;end;$$;
drop trigger if exists social_recommendation_guard on public.social_recommendations;
create trigger social_recommendation_guard before insert on public.social_recommendations for each row execute function public.social_recommendation_guard();
create or replace function public.social_recommendation_notice() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin perform public.social_notice(new.recipient_id,'recommendation',jsonb_build_object('recommendation_id',new.id,'tmdb_id',new.tmdb_id,'media_type',new.media_type,'title',new.title));return new;end;$$;
drop trigger if exists social_recommendation_notice on public.social_recommendations;
create trigger social_recommendation_notice after insert on public.social_recommendations for each row execute function public.social_recommendation_notice();
create or replace function public.social_respond(p_id uuid,p_status text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin if auth.uid() is null or p_status not in ('saved','dismissed') then raise exception 'Invalid response.' using errcode='42501';end if;
 update public.social_recommendations set status=p_status where id=p_id and recipient_id=auth.uid();if not found then raise exception 'Recommendation unavailable.' using errcode='42501';end if;
 update public.social_notifications set read_at=now() where recipient_id=auth.uid() and payload->>'recommendation_id'=p_id::text;end;$$;
create or replace function public.social_mark_read(p_ids uuid[] default null) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin if auth.uid() is null then raise exception 'Sign in first.' using errcode='42501';end if;update public.social_notifications set read_at=now() where recipient_id=auth.uid() and (p_ids is null or id=any(p_ids));end;$$;

-- Enable RLS for every new table, including membership, vote and notification data.
do $$ declare t text;begin foreach t in array array['social_events','social_watchlists','social_watchlist_members','social_watchlist_titles','social_watchlist_votes','social_clubs','social_club_members','social_comments','social_recommendations','social_notifications'] loop execute format('alter table public.%I enable row level security',t);end loop;end $$;
drop policy if exists social_events_read on public.social_events;
create policy social_events_read on public.social_events for select to anon,authenticated using ((library_id is not null and exists(select 1 from public.library l where l.id::text=social_events.library_id)) or (list_id is not null and exists(select 1 from public.custom_lists l where l.id::text=social_events.list_id and l.is_public=true)) or (event_kind in ('watchlist_created','watchlist_updated') and public.social_can_read('list',payload->>'resource_id')));
drop policy if exists social_lists_read on public.social_watchlists;
create policy social_lists_read on public.social_watchlists for select to anon,authenticated using (visibility='public' or owner_id=auth.uid() or public.social_is_member('list',id::text));
drop policy if exists social_lists_create on public.social_watchlists;
create policy social_lists_create on public.social_watchlists for insert to authenticated with check(owner_id=auth.uid());
drop policy if exists social_lists_edit on public.social_watchlists;
create policy social_lists_edit on public.social_watchlists for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
drop policy if exists social_lists_delete on public.social_watchlists;
create policy social_lists_delete on public.social_watchlists for delete to authenticated using(owner_id=auth.uid());
drop policy if exists social_list_members_read on public.social_watchlist_members;
create policy social_list_members_read on public.social_watchlist_members for select to anon,authenticated using(public.social_can_read('list',watchlist_id::text));
drop policy if exists social_titles_read on public.social_watchlist_titles;
create policy social_titles_read on public.social_watchlist_titles for select to anon,authenticated using(public.social_can_read('list',watchlist_id::text));
drop policy if exists social_titles_add on public.social_watchlist_titles;
create policy social_titles_add on public.social_watchlist_titles for insert to authenticated with check(added_by=auth.uid() and public.social_is_member('list',watchlist_id::text));
drop policy if exists social_titles_remove on public.social_watchlist_titles;
create policy social_titles_remove on public.social_watchlist_titles for delete to authenticated using(public.social_is_member('list',watchlist_id::text));
drop policy if exists social_votes_read on public.social_watchlist_votes;
create policy social_votes_read on public.social_watchlist_votes for select to anon,authenticated using(public.social_can_read('list',watchlist_id::text));
drop policy if exists social_clubs_read on public.social_clubs;
create policy social_clubs_read on public.social_clubs for select to anon,authenticated using(visibility='public' or owner_id=auth.uid() or public.social_is_member('club',id::text));
drop policy if exists social_clubs_create on public.social_clubs;
create policy social_clubs_create on public.social_clubs for insert to authenticated with check(owner_id=auth.uid());
drop policy if exists social_clubs_edit on public.social_clubs;
create policy social_clubs_edit on public.social_clubs for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
drop policy if exists social_clubs_delete on public.social_clubs;
create policy social_clubs_delete on public.social_clubs for delete to authenticated using(owner_id=auth.uid());
drop policy if exists social_club_members_read on public.social_club_members;
create policy social_club_members_read on public.social_club_members for select to anon,authenticated using(public.social_can_read('club',club_id::text));
drop policy if exists social_comments_read on public.social_comments;
create policy social_comments_read on public.social_comments for select to anon,authenticated using(public.social_can_read(target_kind,target_id));
drop policy if exists social_comments_create on public.social_comments;
create policy social_comments_create on public.social_comments for insert to authenticated with check(user_id=auth.uid() and public.social_can_read(target_kind,target_id) and (target_kind<>'club' or public.social_is_member('club',target_id)));
drop policy if exists social_comments_edit on public.social_comments;
create policy social_comments_edit on public.social_comments for update to authenticated using(user_id=auth.uid() and public.social_can_read(target_kind,target_id)) with check(user_id=auth.uid() and public.social_can_read(target_kind,target_id));
drop policy if exists social_recommendations_read on public.social_recommendations;
create policy social_recommendations_read on public.social_recommendations for select to authenticated using(auth.uid() in (sender_id,recipient_id));
drop policy if exists social_recommendations_send on public.social_recommendations;
create policy social_recommendations_send on public.social_recommendations for insert to authenticated with check(sender_id=auth.uid() and exists(select 1 from public.follows where follower_id=auth.uid() and following_id=recipient_id));
drop policy if exists social_notifications_read on public.social_notifications;
create policy social_notifications_read on public.social_notifications for select to authenticated using(recipient_id=auth.uid());
drop policy if exists social_notifications_remove on public.social_notifications;
create policy social_notifications_remove on public.social_notifications for delete to authenticated using(recipient_id=auth.uid());

grant select on public.social_events,public.social_watchlists,public.social_watchlist_members,public.social_watchlist_titles,public.social_watchlist_votes,public.social_clubs,public.social_club_members,public.social_comments to anon,authenticated;
grant insert,update,delete on public.social_watchlists,public.social_clubs to authenticated;
grant insert,delete on public.social_watchlist_titles to authenticated;
grant insert,update on public.social_comments to authenticated;
grant select,insert on public.social_recommendations to authenticated;
grant select,delete on public.social_notifications to authenticated;
revoke all on function public.social_meta(text),public.social_notice(uuid,text,jsonb),public.social_owner_membership(),public.social_guard_resource(),public.social_comment_guard(),public.social_comment_notifications(),public.social_library_event(),public.social_list_event(),public.social_recommendation_guard(),public.social_recommendation_notice(),public.social_shared_event(),public.social_reaction_notice() from public;
revoke all on function public.social_is_member(text,text),public.social_can_read(text,text),public.social_invite(text,uuid,text),public.social_remove_member(text,uuid,uuid),public.social_join_club(uuid),public.social_vote(uuid,integer,text),public.social_respond(uuid,text),public.social_mark_read(uuid[]) from public;
grant execute on function public.social_is_member(text,text),public.social_can_read(text,text) to anon,authenticated;
grant execute on function public.social_invite(text,uuid,text),public.social_remove_member(text,uuid,uuid),public.social_join_club(uuid),public.social_vote(uuid,integer,text),public.social_respond(uuid,text),public.social_mark_read(uuid[]) to authenticated;

-- Seed the new timeline once from existing public library/list data. Do not fabricate historical dates.
insert into public.social_events(actor_id,event_kind,library_id,payload,created_at)
select l.user_id,case when btrim(split_part(split_part(coalesce(l.review,''),'__EPISODE_DATA__:',1), '__EPISODE_RATINGS__:',1),E' \t\r\n')<>'' then 'review' when l.status='watched' then 'watched' else 'status' end,l.id::text,
 jsonb_build_object('tmdb_id',l.tmdb_id,'media_type',l.media_type,'title',l.title,'poster_path',l.poster_path,'rating',l.rating,'status',l.status,'review',btrim(split_part(split_part(coalesce(l.review,''),'__EPISODE_DATA__:',1), '__EPISODE_RATINGS__:',1),E' \t\r\n'),'contains_spoilers',coalesce(public.social_meta(l.review)->>'contains_spoilers'='true',false)),coalesce(l.date_added::timestamptz,now())
from public.library l join public.profiles p on p.id=l.user_id where not exists(select 1 from public.social_events e where e.library_id=l.id::text);
insert into public.social_events(actor_id,event_kind,list_id,payload,created_at)
select l.user_id,'list_created',l.id::text,jsonb_build_object('title',l.title),coalesce(l.created_at::timestamptz,now()) from public.custom_lists l join public.profiles p on p.id=l.user_id where l.is_public=true and not exists(select 1 from public.social_events e where e.list_id=l.id::text);
notify pgrst,'reload schema';
commit;
