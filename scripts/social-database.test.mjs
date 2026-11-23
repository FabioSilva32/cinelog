import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const db=new PGlite();
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',C='33333333-3333-4333-8333-333333333333',review='77777777-7777-4777-8777-777777777777';
await db.exec(`create role anon;create role authenticated;create schema auth;
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema public,auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;
create table public.profiles(id uuid primary key,username text,display_name text,avatar_url text);
create table public.library(id uuid primary key,user_id uuid,title text,tmdb_id integer,media_type text,poster_path text,status text,rating numeric,review text,date_added timestamptz default now());
create table public.custom_lists(id text primary key,user_id uuid,title text,description text,entries jsonb default '[]',is_public boolean,created_at timestamptz default now());
create table public.follows(follower_id uuid,following_id uuid);
insert into profiles(id,username) values('${A}','alice'),('${B}','bob'),('${C}','chris');
insert into follows values('${A}','${B}');
insert into library(id,user_id,title,tmdb_id,media_type,status,rating,review) values('${review}','${A}','Test Film',238,'movie','watched',8,'Original review');
alter table profiles enable row level security;create policy profile_read on profiles for select using(true);
alter table library enable row level security;create policy library_read on library for select using(true);create policy library_write on library for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
alter table custom_lists enable row level security;create policy lists_read on custom_lists for select using(is_public or user_id=auth.uid());create policy lists_write on custom_lists for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select on profiles,library,custom_lists,follows to anon,authenticated;grant insert,update,delete on library,custom_lists to authenticated;`);
const sql=await readFile(new URL('../supabase/migrations/20261123_social_community.sql',import.meta.url),'utf8');
await db.exec(sql);await db.exec(sql); // migrations must safely tolerate a repeated manual run
test.after(()=>db.close());
async function user(id,fn){await db.exec('begin;set local role authenticated;');await db.query("select set_config('request.jwt.claim.sub',$1,true)",[id]);try{const result=await fn();await db.exec('commit');return result;}catch(e){await db.exec('rollback');throw e;}}
const query=(s,p=[])=>db.query(s,p);
const scalar=async(s,p=[])=>Object.values((await query(s,p)).rows[0]||{})[0];
let list,club,comment;
test('Migration is repeatable, enables all ten RLS tables and seeds the timeline once',async()=>{assert.equal(await scalar("select count(*)::int from social_events where library_id=$1",[review]),1);assert.equal(await scalar("select count(*)::int from pg_class where relname like 'social_%' and relkind='r' and relrowsecurity"),10);});
test('Private collaborative watchlists cannot be read or edited by outsiders',async()=>{
 list=await user(A,()=>scalar("insert into social_watchlists(title) values('Watch night') returning id"));
 assert.equal(await user(A,()=>scalar('select count(*)::int from social_watchlist_members where watchlist_id=$1',[list])),1);
 assert.equal(await user(C,()=>scalar('select count(*)::int from social_watchlists where id=$1',[list])),0);
 await assert.rejects(user(B,()=>query("insert into social_watchlist_titles(watchlist_id,tmdb_id,media_type,title) values($1,238,'movie','Test')",[list])));
 await assert.rejects(user(A,()=>query('update social_watchlists set owner_id=$1 where id=$2',[B,list])));
});
test('Only owners invite editors; invited members can edit without owning the list',async()=>{
 await user(A,()=>query("select social_invite('list',$1,'bob')",[list]));
 assert.equal(await user(B,()=>scalar('select count(*)::int from social_watchlists where id=$1',[list])),1);
 await user(B,()=>query("insert into social_watchlist_titles(watchlist_id,tmdb_id,media_type,title) values($1,238,'movie','Test'),($1,42,'tv','Series')",[list]));
 await assert.rejects(user(B,()=>query("select social_invite('list',$1,'chris')",[list])));
 assert.equal((await user(B,()=>query("update social_watchlists set title='Not owner' where id=$1 returning id",[list]))).rows.length,0);
});
test('Watch-night voting is one vote per member and changes do not inflate counts',async()=>{
 assert.equal(await user(B,()=>scalar("select social_vote($1,238,'movie')",[list])),true);
 assert.equal(await user(B,()=>scalar("select social_vote($1,42,'tv')",[list])),true);
 assert.equal(await user(A,()=>scalar('select count(*)::int from social_watchlist_votes where watchlist_id=$1',[list])),1);
 await assert.rejects(user(C,()=>query("select social_vote($1,238,'movie')",[list])));
 await user(B,()=>query("select social_remove_member('list',$1,$2)",[list,B]));
 assert.equal(await user(A,()=>scalar('select count(*)::int from social_watchlist_votes where watchlist_id=$1',[list])),0);
 assert.equal(await user(B,()=>scalar('select count(*)::int from social_watchlists where id=$1',[list])),0);
});
test('Review replies cannot spoof authors or move to another thread',async()=>{
 await assert.rejects(user(B,()=>query("insert into social_comments(user_id,target_kind,target_id,body) values($1,'review',$2,'Forged')",[A,review])));
 comment=await user(B,()=>scalar("insert into social_comments(target_kind,target_id,body,contains_spoilers) values('review',$1,'Good point @chris',true) returning id",[review]));
 await assert.rejects(user(B,()=>query("update social_comments set target_kind='episode',target_id='tv:1399:1:1' where id=$1",[comment])));
 await assert.rejects(user(C,()=>query("insert into social_comments(target_kind,target_id,parent_id,body) values('episode','tv:1399:1:1',$1,'Wrong conversation')",[comment])));
 const reply=await user(A,()=>scalar("insert into social_comments(target_kind,target_id,parent_id,body) values('review',$1,$2,'Reply') returning contains_spoilers",[review,comment]));assert.equal(reply,true);
});
test('Mentions and replies create recipient-only notifications; clients cannot forge them',async()=>{
 assert.ok(await user(C,()=>scalar("select count(*)::int from social_notifications where recipient_id=$1",[C])));
 assert.equal(await user(C,()=>scalar("select count(*)::int from social_notifications where recipient_id=$1",[A])),0);
 await assert.rejects(user(B,()=>query("insert into social_notifications(recipient_id,actor_id,kind) values($1,$2,'Forged')",[A,B])));
 await user(C,()=>query('select social_mark_read(null)'));assert.equal(await user(C,()=>scalar('select count(*)::int from social_notifications where read_at is null')),0);
});
test('Private recommendations require following and only the recipient can respond',async()=>{
 const id=await user(A,()=>scalar("insert into social_recommendations(recipient_id,tmdb_id,media_type,title,note) values($1,238,'movie','Test','Try this') returning id",[B]));
 assert.equal(await user(C,()=>scalar('select count(*)::int from social_recommendations')),0);
 await assert.rejects(user(B,()=>query("insert into social_recommendations(recipient_id,tmdb_id,media_type,title) values($1,238,'movie','Test')",[C])));
 await assert.rejects(user(A,()=>query("select social_respond($1,'saved')",[id])));
 await user(B,()=>query("select social_respond($1,'saved')",[id]));assert.equal(await user(A,()=>scalar('select status from social_recommendations where id=$1',[id])),'saved');
});
test('Club membership protects posting and only the owner changes the theme',async()=>{
 club=await user(A,()=>scalar("insert into social_clubs(name,theme) values('Friday club','Time travel') returning id"));
 await assert.rejects(user(C,()=>query("insert into social_comments(target_kind,target_id,body) values('club',$1,'Not a member')",[club])));
 await user(B,()=>query('select social_join_club($1)',[club]));await user(B,()=>query("insert into social_comments(target_kind,target_id,body) values('club',$1,'I joined')",[club]));
 assert.equal((await user(B,()=>query("update social_clubs set theme='Wrong' where id=$1 returning id",[club]))).rows.length,0);
 await user(A,()=>query("update social_clubs set theme='Animation week' where id=$1",[club]));
 await assert.rejects(user(B,()=>query("insert into social_club_members(club_id,user_id,role) values($1,$2,'owner')",[club,C])));
});
test('Metadata-only episode changes do not spam the timeline; review text excludes serialized notes',async()=>{
 const count=await scalar('select count(*)::int from social_events');
 await user(A,()=>query("update library set review=$1 where id=$2",['Original review\n__EPISODE_DATA__:'+JSON.stringify({dates:{S01E01:'2026-11-23'},notes:{S01E01:'DO_NOT_PUBLISH_EPISODE_NOTE'}}),review]));
 assert.equal(await scalar('select count(*)::int from social_events'),count);
 await user(A,()=>query("update library set review=$1 where id=$2",['New review\n__EPISODE_DATA__:'+JSON.stringify({notes:{S01E01:'DO_NOT_PUBLISH_EPISODE_NOTE'}}),review]));
 assert.equal(await scalar("select count(*)::int from social_events where payload::text like '%DO_NOT_PUBLISH%'"),0);
});
test('Events from a list disappear from public reads when it becomes private',async()=>{
 await user(A,()=>query("insert into custom_lists(id,user_id,title,is_public) values('private-check',$1,'Public then private',true)",[A]));
 assert.equal(await user(B,()=>scalar("select count(*)::int from social_events where list_id='private-check'")),1);
 await user(A,()=>query("update custom_lists set is_public=false where id='private-check'"));assert.equal(await user(B,()=>scalar("select count(*)::int from social_events where list_id='private-check'")),0);
});

test('Editing or deleting a rewatch cannot leave its old review in the feed',async()=>{
 const first={id:'first',date:'2026-11-20',rating:8,review:'First viewing'},again={id:'second',date:'2026-11-23',rating:9,review:'REWATCH_OLD_TEXT',contains_spoilers:false};
 const save=rows=>user(A,()=>query('update library set review=$1 where id=$2',['Current review\n__EPISODE_DATA__:'+JSON.stringify({screenings:rows,history_initialized:true}),review]));
 await save([first]);await save([again,first]);assert.equal(await scalar("select count(*)::int from social_events where library_id=$1 and event_kind='rewatch'",[review]),1);
 await save([{...again,review:'REWATCH_EDITED_TEXT',contains_spoilers:true},first]);assert.equal(await scalar("select count(*)::int from social_events where event_kind='rewatch' and payload->>'review'='REWATCH_OLD_TEXT'"),0);assert.equal(await scalar("select payload->>'contains_spoilers' from social_events where library_id=$1 and event_kind='rewatch'",[review]),'true');
 await save([first]);assert.equal(await scalar("select count(*)::int from social_events where library_id=$1 and event_kind='rewatch'",[review]),0);
});

test('Episode comments retain spoiler protection after an attempted edit',async()=>{
 const id=await user(B,()=>scalar("insert into social_comments(target_kind,target_id,body) values('episode','tv:1399:1:2','Episode detail') returning id"));
 await user(B,()=>query('update social_comments set contains_spoilers=false where id=$1',[id]));assert.equal(await scalar('select contains_spoilers from social_comments where id=$1',[id]),true);
 await user(B,()=>query('update social_comments set deleted_at=now() where id=$1',[id]));assert.equal(await scalar('select body from social_comments where id=$1',[id]),'');
});

test('Private club mentions do not notify nonmembers',async()=>{
 const privateClub=await user(A,()=>scalar("insert into social_clubs(name,visibility) values('Private club','private') returning id"));
 const before=await user(C,()=>scalar('select count(*)::int from social_notifications'));
 await user(A,()=>query("insert into social_comments(target_kind,target_id,body) values('club',$1,'Private thought @chris')",[privateClub]));
 assert.equal(await user(C,()=>scalar('select count(*)::int from social_notifications')),before);assert.equal(await user(C,()=>scalar('select count(*)::int from social_comments where target_id=$1',[privateClub])),0);
});
