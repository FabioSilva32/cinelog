# CineLog release-readiness review

Production follow-up: published 19 November 2026. See PRODUCTION-RELEASE-2026-11-19.md for current deployment, validation, limits and rollback. The original audit below records its earlier readiness state.

Date: 18 November 2026. Status: ready for staging review; the supplied database policy export has been reviewed; production sign-off is pending live account and device checks below.

All changes are in `cinelog-original-copy`. The parent project and its original backup were not replaced. Nothing was committed, pushed, deployed, emailed, or written to the live application database during this sweep.

## What changed

- Rebuilt sign-in, signup and recovery entry screens using the current charcoal/crimson design, rounded controls, accessible labels, focus containment, pending feedback and phone-sized layouts. Optional avatar selection/upload remains available. Uploaded photo previews now match the exported center-square crop and support touch dragging.
- Removed the one-click tester entry, special demo-email password bypasses, and the passwordless local-account fallback. Account entry requires Supabase authentication. Unconfirmed signup displays email-confirmation instructions rather than treating an unconfirmed account as signed in.
- Cached profile data no longer initializes a logged-in identity. Session restoration is deferred outside the auth callback, ignores redundant refresh events and rejects stale profile/library responses after an account change. Pending authentication cannot be dismissed by the app's global Escape handler.
- Isolated tier caches by account. A recorded legacy owner can migrate their previous cache; unattributed legacy data is retained without automatically uploading it to another account. New cloud tier IDs are owner-namespaced, existing cloud IDs are retained, and rejected table/metadata saves are no longer reported as synced.
- Library lookups now include media type as well as user and TMDB ID. Add/save failures retain the current data instead of producing a success state. Anonymous save/add attempts open authentication, and Explore waits for the add result before announcing success. Favorites wait for an owner-scoped confirmed cloud update.
- List/review reactions now wait for successful server responses. Saved list-like state loads before the button is enabled, duplicate inserts are idempotent, list counts are read from reactions, and a shared liked-list cache no longer leaks state between accounts. Comments guard duplicate submissions and retain drafts on failure.
- Private cached lists honor both `isPublic` and `is_public`. Canonical database ownership takes precedence over editable author metadata. List removal, editing and comments retain owner-scoped writes and confirmations.
- Removed fabricated demo reviews/profiles from community activity. Fixed the feed hiding real reviews when a member followed nobody, and stopped retaining phantom demo follows. Suggestions/search report failed requests, and search text cannot inject PostgREST filter operators.
- Three local starter lists are now clearly presented as read-only CineLog editorial collections, without fake engagement or links to fabricated member profiles. Their film selections remain available. Persisted member lists keep normal editing and discussion.
- Review and re-log saves wait for success. Rejected saves retain the draft and allow retry. Spoiler flags survive the existing serialized review format, and public profile/feed snippets mask flagged text.
- Removed the obsolete mounted mobile-navigation component and duplicate history-guard entries. The current drawer participates in Android Back handling. Profile Back/Forward and refresh persistence are covered by browser checks.
- Applied compatible npm security updates and restarted the dev server on patched Vite 8.3.8. The final npm advisory scan reports zero advisories; this is not a certification against all security issues.
- Configured nosniff, referrer, framing and permissions headers for Vercel. Disabled Android app backup. The new database migration adds parent-list privacy restrictions for likes/comments and enforces the existing creator-frame allowlist at the database boundary.
- Excluded the old public design mockups from production web/Android output without deleting their workspace sources. Local `studio-previews` pages are not production build entries.

The creator frame, rating palette, existing account data, saved libraries and purchases were retained. Public-profile feature expansion is deferred as requested.

## Verification

| Check | Result and scope |
| --- | --- |
| `npm run check:release` | Pass: lint, production build, 61 regression/security tests, 45 page/menu initialization checks and 10 isolated extras interaction checks. |
| Production-build routes | Pass: all 15 active pages at 1440px desktop and 390px mobile widths; no detected horizontal page overflow or uncaught JavaScript exceptions. |
| Account and preference menus | Sign-in, account creation, recovery, Escape dismissal and Preferences exercised on both widths; selected screenshots inspected. No signup email was sent. |
| Signed-in browser workflows | Pass: 24 reported checks across desktop/mobile, including public banners, follows and reload persistence, profile Back/Forward, list likes/comments, list create/edit/confirmed deletion, review saves, rejected-save retry and unchanged-profile dismissal. Includes 13 signed-in route/layout checks per device with movies/series/anime fixtures. |
| Browser data isolation | All configured Supabase requests in signed-in tests were intercepted and fulfilled from memory. These checks exercise the real frontend but do not prove live database write permissions or cross-device syncing. |
| Read-only live API checks | Configured key is publishable; profile banner columns and required library/follow/list/comment/reaction endpoints respond. Anonymous private-list query returned no rows. This does not prove every RLS policy, particularly where test data is absent. |
| Dependencies | Final `npm audit`: 0 known advisories at the time checked. |
| Android | Capacitor sync and offline `assembleDebug` pass using the installed Android JDK/SDK. No device/emulator is connected. |
| Release hygiene | Build excludes design mockups; original source remains local. No GitHub/Vercel publication or live database mutations. |

Lint still reports non-fatal warnings, including unused/reference-code declarations and some hook advisories; the build also retains a large-chunk advisory. The Android debug package contains substantial image assets and is not a signed store release. These results are not a claim that every possible menu state, network failure, keyboard behavior or security scenario has been exhaustively tested.

## Required before production

1. Apply and review `supabase/migrations/20261118_release_security.sql` in Supabase SQL Editor. The user applied it and supplied a successful SQL Editor result; the subsequent catalog export confirms the restrictive policies and enabled trigger. Functional cross-account database tests remain pending. It restricts list comments/likes to visible parent lists and installs the creator-frame guard. It does not delete user records.
2. Run the read-only `supabase/release-security-audit.sql` against the live/staging database and inspect the actual policies. With two staging accounts, prove that B cannot alter/delete A's library, profile, lists or comments; B cannot read A's private list/comments or spoof A as the follower/reaction owner; an ordinary account cannot equip `creator` through a direct API update. UI filters and mocked tests alone cannot establish this.
3. Verify real signup confirmation, existing-user login, logout, recovery email and allowed redirect URLs with dedicated staging accounts. Confirm profile initialization, public banners and saved changes after reloading on a second browser/device. The SMTP and Auth dashboard configuration have not been certified by this local sweep.
4. Test on a physical phone/WebView: keyboard and scrolling, navigation/Android Back, uploads/cropping, trailer playback, list editing and an interrupted save. The wrapper currently points to `https://cinelog-phi.vercel.app`; a compiled debug APK alone does not prove the new website is running in that wrapper. Use a staging deployment for this check before promotion. A store update additionally needs release signing/versioning and an asset-size review.
5. Approve a staging release and verify the deployed headers/environment/build root before promoting the reviewed copy to the actual site. Do not deploy the untouched parent source expecting it to contain the experimental redesign.

CinePoints remain an optional, client-calculated cosmetic system, not an authorization boundary. Server-authoritative reward accounting is not implemented; the creator-frame entitlement has an installed, enabled database trigger; an ordinary-account rejection test remains pending.

## Preview and evidence

- Compiled production preview: `http://127.0.0.1:5181/explore`.
- Development preview: `http://127.0.0.1:5180/explore`.
- Menu captures: `studio-previews/release-desktop-signin.png`, `release-mobile-signup.png`, plus recovery/preferences captures.
- Machine-readable local evidence: `browser-release-report.json`, `browser-social-report.json`, `public-api-audit.json`, `audit-release.json`.
- Reproduce local non-browser checks with `npm run check:release`. Browser scripts accept `CINELOG_PREVIEW_ORIGIN`; signed-in browser checks use fixture-only writes.

## Rollout and rollback

Keep the original backup and the current production deployment available. After staging verification and user approval, publish the reviewed source/configuration and additive migration deliberately. If authentication, owner-scoped writes, private-list visibility or navigation fails after rollout, stop promotion or revert the frontend deployment. Do not erase users' libraries or replace them with local fixtures. Reverting frontend code does not automatically revert database policy changes; review those separately.

## Database migration follow-up

The user supplied a Supabase SQL Editor success result for the release migration. The post-migration read-only public API checks still pass, and the anonymous private-list query returned no rows. The user then supplied the complete catalog audit export. RLS is enabled on all eight core tables included in its row-security query. All four restrictive parent-list visibility policies are present, and cinelog_creator_frame_guard is enabled. Ownership predicates are present for account writes. Duplicate policies have matching predicates and are redundant rather than broader grants. Restrictive policies still constrain the older permissive list-comment/list-like policies. Omitted UPDATE WITH CHECK expressions inherit USING under PostgreSQL semantics. Libraries and profiles remain publicly readable under the existing product model. The export lists badge and notification policies but does not include their RLS flags, and exports the creator trigger definition rather than its function body. This confirms the inspected configuration, not successful real-account enforcement, SMTP delivery or physical-device behavior. Those functional gates remain pending.


## Preview deployment follow-up
With user approval, deployed the experimental copy to https://cinelog-rdohmo3hl-lynnx.vercel.app (dpl_9DAvAhmuBHpYR12QroDnBYR7uoJ6), using the existing CineLog project Preview environment. No production promotion or Git push. Build passed. Deployed browser checks passed: 30 desktop/mobile route checks and 24 fixture-backed social checks. Configured security headers and deep-link response verified. Real two-account authorization, email delivery and physical-device checks remain pending. Red favicon now has versioned SVG/ICO links and raster Apple/PWA icons; generated images passed dimensions/red-palette checks and the deployed ICO matches the source. The existing production domain has not received these changes.

## Mobile follow-up — 19 November 2026
Fixed an unassigned library lookup error variable that prevented Explore quick-add saves. Removed competing global popover handlers and standardized popover ownership events; status menus now remain open and retain failed-save feedback. Added 44px coarse-pointer targets for Explore plus/status controls and disabled the saved hero action to prevent overwriting existing entries. Added actual Chrome touch-event checks for status persistence, save/retry, outside dismissal, account/notification coordination, hero add, saved-title protection and poster add/retry. Yesterday's deployed build fails the new status touch check; corrected local build passes. Full release checks, 30 desktop/mobile routes and the fixture-backed social sweep pass. Published only a new preview: https://cinelog-2pztsq11g-lynnx.vercel.app. Physical-phone confirmation and live-account authorization/email checks remain pending; production is unchanged.
Deployed touch regression checks also passed on the new preview: status save/retry and dismissal, account/notification menu coordination, Explore hero/plus adds, and saved-entry protection. No uncaught browser exceptions or fixture-handler errors.

## Compact notifications — 19 November 2026
Replaced the large bottom-right toast stack with one compact charcoal notification: below the header on mobile and upper right on desktop. Routine messages last 2.4 seconds; errors last 8 seconds, with accessible status/alert announcements and an explicit dismiss button. Notification surfaces allow pointer events through except on dismiss; mobile bottom navigation stays clear. Removed Explore's duplicate save confirmation while retaining shared success/error feedback. Full release checks passed. Browser assertions cover dimensions, placement, duplicate removal, timeout, dismissal and touch add/status retry flows. Preview only: https://cinelog-e6z2lhot8-lynnx.vercel.app. Production unchanged.

## Responsive profile covers — 19 November 2026
Shared ProfileCover geometry now serves the editor preview, own journal and public profiles. Mobile contain/full-image mode follows the loaded artwork aspect ratio instead of a fixed-height letterbox; saved fit and vertical focus are retained. Cover mode keeps its crop. Empty/removed banners retain the default artwork. Full release checks pass, including empty-profile initialization. Twelve own/public profile scenarios across 320px, 390px and desktop with cover/contain pass locally and on https://cinelog-qxzf3n90d-lynnx.vercel.app; no uncaught browser errors. Preview only; production unchanged.

## Embedded cinema letterboxing correction — 19 November 2026
The user's screenshot showed a case missed by the earlier aspect-ratio checks. Read-only public banner metadata identified the orange Blade Runner still in cover mode at 47% focus. Visual inspection and pixel analysis found embedded 280px black bands in that 3840x2160 source. Five other bundled stills have measured bands too. Added explicit bundled-art crop bounds and responsive background geometry that applies the existing focus to actual picture content, without editing source images or user profile records. Shared editor/own/public renderer uses these bounds; mobile contain ratios use the picture bounds too. Exact-image screenshots at 47% focus were visually inspected. Full release checks passed; twelve exact-image profile/fit/viewport cases passed locally. Preview: https://cinelog-8jo9cdqe6-lynnx.vercel.app; production unchanged.
