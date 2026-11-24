# Community layout polish — 24 November 2026

The Community feed had a large introductory headline, oversized sparse activity cards, and unused space on the right. The revised page keeps CineLog's charcoal/red identity and existing social flows.

- Compact Community heading and a direct watch-night action.
- Feed and useful community sidebar share the desktop width; cards no longer stop at the old 1000px maximum.
- Smaller poster-led activity cards, inline activity descriptions, rating colours, status badges and concise timestamps with full date tooltips.
- Clear watchlist/watching/dropped activity descriptions. Empty watchlist status events no longer offer an unrelated review-discussion prompt.
- Sidebar shows the account's actual following count, followable people, accessible watch nights and film clubs. Queries remain subject to existing row permissions; no simulated activity is added.
- Sections fail independently and offer retry/navigation actions. When there are no watch nights or clubs, their creation/discovery paths remain visible.
- Mobile keeps a single-column activity feed with the supporting sections below it.

No new SQL or database migration is required.

## Verification

Build and lint passed, with existing repository advisories. Seven social model tests passed. The desktop/mobile community browser suite passed 17 grouped scenarios using isolated PostgreSQL-backed fixtures: feed layout, phone follow persistence, navigation/history, invitations and private access, shared editing/voting, clubs, comments/replies/mentions, linked notifications, recommendations, saved-data preservation, taste comparison and episode spoiler gating. No JavaScript exceptions or fixture errors were reported.

## Try it

1. Open Community on desktop and compare the header/card spacing and right column.
2. Open a suggested profile or follow someone from the sidebar; verify the following count updates.
3. Open a watch night or club from the sidebar. Private resources must remain invisible to uninvited accounts.
4. Switch Following & you / Discover activity and the activity filters; open a title and discussion, then test Back.
5. On a phone, check card readability, navigation, the watch-night action, and the supporting sections below the feed.

Changes remain on the experimental review branch and preview. Production and the original backup are unchanged.
