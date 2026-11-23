# Episode tracker and compact recommendations

## Verified pinning issue

A read-only schema probe of `profiles?select=pinned_list_ids&limit=0` returned HTTP 400 / PostgreSQL 42703: the deployed database does not yet contain the profile-pins column. No account data was retrieved or changed. The client now checks availability, preserves the list shelf, explains that pinning is unavailable and hides the non-working pin controls until the migration has been applied.

Run `supabase/migrations/20261123_profile_pinned_lists.sql` in Supabase SQL Editor, then refresh the profile. This preserves all records and uses the existing profile ownership policy.

## Interface changes

- The title navigation now calls the season/episode area **Episode tracker**. The Story and Your Screening both have a direct entry explaining what it does and showing the selected season's watched count.
- The tracker replaces the legacy panel with a season selector, watched-versus-aired progress, an explicit next-episode action, bulk completion of aired episodes, and All/Unwatched/Watched/Rated filters. Specials remain separate; future/undated episodes cannot be newly marked watched by the quick controls.
- Episode ratings, watch dates and notes are available per episode. Whole-season rating, notes, completion date and average-of-episode-ratings remain available in a compact disclosure.
- Progress saves explicitly, stays open after saving, reports failures and retains the draft for retry. Saving progress preserves existing screening records and avoids adding a general watching activity on every progress save.
- Explicit watched/unwatched state overrides inferred watched state from old ratings/dates without erasing those records.
- Direct film links wait for account/library restoration and resolve the current saved library entry rather than opening a stale history snapshot or a fresh unsaved film first.
- Picked for You caps shortlist cards at 185px on desktop, uses two compact columns on mobile, and reduces the featured poster to 150×225px on desktop / 100×150px on mobile.

## Verification

`npm run check:release` passed 80 regression/security tests, the production build, lint, 45 page/menu initialization checks and 10 extras interaction checks. Existing lint advisories and the initial bundle-size advisory remain.

`scripts/verify-episode-tracker-browser.mjs` verifies desktop/mobile direct-link progress restoration, watched/unwatched controls, bulk aired completion, rating/note/date preservation, season-fetch retry, rejected-save recovery, schema-unavailable handling and bounded recommendation card sizes. Supabase, TMDB and recommendation-provider requests are intercepted with isolated fixtures; no live account writes are performed.

Existing collections/search/quick-log desktop/mobile checks also pass. Production remains unchanged; review this update on the preview before release.

## Social priorities

1. A true following timeline for new reviews, rewatches and list updates, with filters and unread activity.
2. Review comments and threaded replies with mentions, spoiler controls and useful notification links.
3. Friends' ratings and recent reviews directly on each title, with a quick recommendation-to-a-friend action.
4. Collaborative watchlists and watch-night polls with clear editing permissions.
5. Spoiler-aware episode discussions, making series and anime tracking useful socially as well as personally.
6. Taste comparison between profiles and discovery of people through shared favorites.

These are proposals for a later iteration, not implemented social features. Conversation and discovery are a better next focus than adding more collectible profile items.
