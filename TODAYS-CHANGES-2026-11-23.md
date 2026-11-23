# CineLog — 23 November 2026

Everything below was implemented in the experimental copy. The original backup and production site are unchanged by this release candidate. The earlier redesign is retained in GitHub draft PR #1.

Verified preview: https://cinelog-ly3iuo1zb-lynnx.vercel.app (protected; use the private review link supplied in chat). The uploaded build passed the community and episode-tracker desktop/mobile fixture checks. Production still points to the prior release.

## Enable the new community tools

1. Open the CineLog project in Supabase → SQL Editor → New query.
2. Paste the complete contents of `supabase/migrations/20261123_social_community.sql` and run it. It adds the community tables, permissions, notifications and triggers, plus the missing profile-pins field. It preserves existing accounts, libraries, follows, reviews and lists. It is safe to run again.
3. Refresh the preview, or choose **Check again** in Community. If a previous page was open, allow up to 30 seconds for the capability check to refresh.
4. Use your normal accounts. There is no public test-account login. For collaboration tests, use two accounts in separate browser profiles; a third account can verify private-content boundaries.

The migration has been executed against an isolated PostgreSQL test database, not your live Supabase project. Before it is applied, the app keeps the existing Community feed and follows available. Profile pin controls remain hidden if the field is missing. Running the new migration also covers the earlier standalone profile-pins migration; you do not need both.

Read-only confirmation after running it:

```sql
select relname as table_name, relrowsecurity as row_security_enabled
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and relname in (
 'social_events','social_watchlists','social_watchlist_members',
 'social_watchlist_titles','social_watchlist_votes','social_clubs',
 'social_club_members','social_comments','social_recommendations','social_notifications'
)
order by relname;

select column_name,data_type from information_schema.columns
where table_schema='public' and table_name='profiles' and column_name='pinned_list_ids';
```

Expect ten tables with row security enabled and one `pinned_list_ids` array field.

## Today's changes and how to test them

### Episodes and recommendations

- **Continue Watching:** aired-episode counts, season progress, next episode and resume season. Mark the next episode, refresh, and check the count persists. Future episodes and specials do not enter the next-episode queue.
- **Episode tracker redesign:** open a series → **Episode tracker**, or use the shortcuts from **The story** / **Your screening**. Try season selection; All / Unwatched / Watched / Rated; mark watched/unwatched; complete aired episodes; season and episode ratings, dates and notes.
- **Save progress:** both the tracker action and the left-rail action save without closing the menu or replacing past screenings. Change an episode, save, refresh, and confirm the previous review and viewing history remain.
- **Visible episode rating bar:** repaired the custom slider's missing track; the fill and thumb use the same rating colour, with a visible unfilled rail and a larger phone touch area. Screenshot checks verify coloured pixels in the track.
- **Your screening redesign:** removed the duplicate backdrop banner, added a compact journal heading, grouped rating/date into one responsive panel, simplified the episode-tracker shortcut, and restyled the optional review editor. Existing ratings, dates, rewatches and save behaviour are retained. No additional database migration is needed for these visual changes.
- **Direct film links:** reload a saved film URL and confirm your current saved status, rating, review and episode data load rather than a blank catalogue entry.
- **Smaller Picked for You posters:** bounded poster sizes and a two-column phone layout. Check long titles and the featured recommendation.

### Diary, discovery and profiles

- **Separate viewings:** edit each diary viewing's date, rating and notes. Add a rewatch and confirm it appears separately; watchlist additions do not become screenings. Old watched entries still appear even when legacy history arrays are empty.
- **Undo:** remove a title, change a quick status or delete a diary viewing; use the compact Undo action and verify the saved result after refresh.
- **Save feedback and retry:** library, batch and profile actions expose saving/saved/failure states. A rejected save retains the relevant draft or retry action. Retry intents are account-scoped and in memory; this is not an offline upload queue.
- **Discovery filters:** try country, provider, runtime, decade and genre together; load more results and watchlist a title directly.
- **Profile connections:** open Followers / Following, visit a person and test back/forward. Public activity includes separate rewatches and hides flagged spoilers.
- **Pinned public lists:** after the migration, pin up to three public lists; refresh your own and public profile. Private lists are not offered as public pins. Missing-schema errors no longer leave a broken pin action on screen.

### New community

- **Following timeline:** Community opens the feed, with Following & you / Discover activity and Everything / Reviews / Rewatches / Lists filters. Reviews, ratings, rewatches, public list updates and accessible watch-night updates use server-generated events. Episode metadata-only edits do not generate feed noise. Editing/removing a rewatch updates/removes its old feed snapshot.
- **Find your people:** search usernames, follow/unfollow, open a public profile and compare taste. Follow state comes from the existing account-scoped follow system.
- **Review discussions:** open **Join the conversation** on an activity item or **Read & discuss** / **Discuss review** in a title menu. Post a comment, reply, mention `@username`, reveal a spoiler, and remove your own comment. Removal retains the reply tree. Rejected posts keep your draft.
- **Mentions:** username suggestions support selection, outside-click dismissal and Escape. Replies and mentions create linked notifications for the intended recipient.
- **Friends' ratings:** a film's Story shows ratings/statuses from followed people. Spoiler reviews remain hidden; the discussion action opens the full review.
- **Private recommendations:** recommend a film to someone you follow, with an optional note. The recipient sees it in **Your inbox**, can add it to their watchlist or dismiss it. Already-owned titles retain their existing status, rating, review and history.
- **Collaborative watchlists / watch nights:** create a private or public shortlist, optionally set a date, add films/series, invite editors by username, copy the link and vote. Each person gets one vote; choosing another film changes that vote, and choosing it again removes it. Editors cannot change ownership/settings. Removing a title clears its votes; leaving/removing a member removes their vote. Personal libraries remain unchanged.
- **Film clubs:** create a public or invitation-only club, set a weekly theme, join/invite people and hold a discussion. Only the host changes club settings or removes members. Private club mentions do not send conversation notifications to outsiders.
- **Taste comparisons:** see shared ratings, favorites, mutual watchlist titles and their highly rated films you have not logged. A percentage requires at least three shared rated titles. Films and TV series with the same numerical catalogue ID remain separate.
- **Episode discussions:** open **Discuss episode** in the tracker. Unwatched episodes have a spoiler gate, comments remain spoiler-labelled, and the full discussion has its own URL. **Open series tracker** returns to the correct season.
- **Inbox / notification bell:** recommendation, reply, mention, follow, like and invitation updates open the relevant conversation/profile/list. Read actions update the account's notifications. Private recommendations and notifications are protected by recipient permissions.
- **Clean community links:** feed, watch nights, clubs, inbox, reviews and episodes use `/community/...` URLs. Refresh, back and forward retain the destination. Opening someone else's film never imports their personal rating/review into your editor.
- **Matching design:** charcoal surfaces, red active states/actions, responsive dialogs, visible focus states, spoiler controls and compact detail-page headings. Phone menus and buttons fit within the page width.
- **Phone dialog layering:** recommendations and episode discussions opened from a film stay above the screening panel, so their buttons receive taps.

### Repository and release preparation

- **Backups:** `../backups/deployed-2026-11-23` and `../backups/pre-social-2026-11-23` retain the earlier states; the original project backup was not overwritten.
- **GitHub draft:** the source redesign and today's work are reviewed together in https://github.com/FabioSilva32/cinelog/pull/1. Production is not automatically promoted by this work.
- **Catalogue automation:** weekly/manual catalogue refresh workflow, with authenticated PR creation and the repository secret configured. It starts on the default branch after merge and proposes reviewed changes rather than automatically publishing catalogue membership.
- **Add-to-library safety:** an existing cloud entry is preserved instead of being overwritten with default values. Movie links resolve the current account's saved entry and discard another person's or a stale history snapshot's personal fields.

## Verification

- `npm run check:release` passed: lint, production build, **100 regression/security/model/database tests**, **45 page/menu initialization checks** and **10 extras interaction checks**. Existing lint and large-bundle advisories remain; no new community-file lint warnings remain.
- Dependency audit returned **zero reported vulnerabilities** for the installed dependency graph.
- Local PostgreSQL tests exercise real RLS roles and functions: owner/member/outsider access, author spoof prevention, thread constraints, one-person voting, recommendation permissions, notification privacy, private-club mentions, migration repeatability and edited/deleted rewatch snapshots.
- Desktop/mobile browser fixtures passed **14 grouped community scenarios** using real emulated mouse clicks/phone taps, plus existing collections/search/quick log, tracker, follows and touch suites. No JavaScript exceptions or fixture failures were reported. These use isolated data and do not write real accounts.
- Physical-phone and real multi-account testing after applying the migration remain the final user checks. Local tests cannot certify an unapplied production schema.

## Useful next ideas

1. Block, mute and report controls, with a moderation queue, before growing the public community.
2. A public / followers / private audience control for reviews and library activity.
3. Persistent review drafts with recovery after a browser restart.
4. Club screening calendar, RSVP and an optional reminder; keep it separate from actual video playback.
5. Country/service-aware watchlist availability alerts with opt-in frequency.
6. Import preview and duplicate resolution before applying a large library import.
