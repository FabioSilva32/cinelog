# Viewing, profiles and discovery

This records the earlier viewing/profile iteration. For the complete current scope, social database setup and testing checklist, use `TODAYS-CHANGES-2026-11-23.md`. The combined social migration now includes profile pins.

Production is unchanged. The reviewed source baseline was copied to `../backups/deployed-2026-11-23` before this work. All implementation work is in the experimental copy.

## Changes

- Continue Watching shows aired episode progress and season progress, marks the next episode watched, and opens the relevant season. It recognizes existing episode dates and ratings, preserves personal notes, and excludes future episodes/specials from the next-episode queue.
- The diary has separately editable dates, ratings and notes for each viewing, a rewatch action, and removal with Undo. Watchlist additions do not count as screenings. Legacy watched entries remain visible. Public activity reads the same viewing records and retains spoiler protection.
- Profiles support three pinned public lists, clickable followers/following with paged connections, and separate rewatches in recent activity. Private list content remains filtered by existing permissions.
- Explore includes country, provider, runtime, decade and genre filters, with paginated results and direct watchlisting.
- Library saves, batch additions and profile changes show pending/saved/failed states. Failed requests can be retried while the app remains open. These are explicit cloud retries, not an offline background upload service; retry state clears on logout/account change and page reload. Existing editor drafts remain in place on failure.
- Remove-title, quick status changes and diary-entry removal offer a compact Undo action. Undo checks account identity before restoring.
- A weekly/manual GitHub workflow refreshes the TMDB snapshot and opens a review PR. Empty catalogues and unexpected membership shrink stop the update. It does not automatically publish unreviewed membership changes.

## Database setup

For the current release candidate, run `supabase/migrations/20261123_social_community.sql` in the same Supabase project used by CineLog; it includes this field plus the new community tables and permissions. The earlier standalone `20261123_profile_pinned_lists.sql` only enables pins. It adds one `text[]` profile field with an empty default, preserves all existing records, and leaves ownership controlled by the existing profile UPDATE policy.

```sql
begin;
alter table public.profiles add column if not exists pinned_list_ids text[] not null default '{}';
commit;
```

Read-only verification:

```sql
select column_name, data_type from information_schema.columns
where table_schema='public' and table_name='profiles' and column_name='pinned_list_ids';
```

## Catalogue automation setup

The repository Actions secret `TMDB_API_KEY` is configured using sealed-box encryption, and Actions permission to create pull requests is enabled. No secret value was logged or committed. The schedule becomes active after the workflow is merged to the default branch. Run **Refresh franchise catalogues → Run workflow** once after that merge. Scheduled runs are weekly. A catalogue update goes live through the usual reviewed merge/release process.

## Validation

Use `npm run check:release` for build, lint, data/security regressions and page/menu/extras checks. `scripts/viewing-upgrades.test.mjs` covers legacy history, separate unrated viewings, deletion, metadata preservation, spoiler flags and aired-episode selection.

`scripts/verify-viewing-upgrades-browser.mjs` covers desktop/mobile episode progress, rejected-save retry, discovery queries and saving, editing/deleting/restoring viewings, public list pinning and following navigation. Supabase and catalogue requests are intercepted with isolated fixtures; these tests do not write real user accounts or certify production database policies. Existing collections/search, touch, route and social scripts remain relevant.

## Ideas for a later iteration

1. A shared watch-night shortlist with voting, built on existing lists.
2. Spoiler-safe discussion threads attached to a film or individual episode.
3. Watchlist availability alerts with opt-in frequency and country/service preferences.
4. A clear import preview with duplicate resolution before committing an imported library.
5. A compact yearly profile card people can export and share.

The remaining prerequisite for pins is the database migration; it has not been applied to the live database. Catalogue credentials and PR permission are configured, but the schedule waits for the reviewed merge to main. Production remains unchanged.

GitHub draft review: https://github.com/FabioSilva32/cinelog/pull/1

Vercel preview: https://cinelog-3t300h0pf-lynnx.vercel.app (owner has a temporary private review link). Deployed fixture verification passed the new desktop/mobile workflows with no JavaScript exceptions or fixture errors. The full local release check passed 79 tests, 45 page/menu initialization checks and 10 extras checks; existing collections/search, social and real-touch suites also passed.
