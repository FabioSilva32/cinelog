-- Read-only metadata only: no accounts, credentials or user content.
-- One result cell makes SQL Editor -> Export -> JSON include the complete audit.
select jsonb_build_object(
 'policies',coalesce((select jsonb_agg(to_jsonb(p) order by p.tablename,p.cmd,p.policyname) from (
  select schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check from pg_policies
  where schemaname='public' and tablename in ('profiles','library','follows','custom_lists','list_likes','list_comments','review_likes','tier_lists','user_badges','user_notifications')
 ) p),'[]'::jsonb),
 'row_security',coalesce((select jsonb_agg(jsonb_build_object('table',c.relname,'enabled',c.relrowsecurity) order by c.relname)
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname in ('profiles','library','follows','custom_lists','list_likes','list_comments','review_likes','tier_lists')),'[]'::jsonb),
 'creator_guard',coalesce((select jsonb_agg(jsonb_build_object('name',t.tgname,'enabled',t.tgenabled in ('O','A'),'definition',pg_get_triggerdef(t.oid)))
  from pg_trigger t where t.tgname='cinelog_creator_frame_guard'),'[]'::jsonb)
) as security_audit;
