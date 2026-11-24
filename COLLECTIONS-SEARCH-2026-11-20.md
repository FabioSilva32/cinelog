# Collections, full search and quick logging — 20 November 2026

Preview: https://cinelog-25zpdnoeb-lynnx.vercel.app

Production remains on the previously approved deployment. No GitHub push or live account-data edits were performed by the automated tests.

## Result

- All 20 built-in catalogues now have account-independent titles and real TMDB artwork. Official series membership, director credits and appropriately scoped studio records replace title-substring guessing. The MCU uses explicit curated film/TV membership verified against TMDB metadata; legacy Marvel adaptations and promotional podcasts are excluded from it. The broader Marvel catalogue separately includes verified legacy films and series. Snapshot sources and verification time are retained in `src/data/franchiseCatalogues.json`; refresh with `scripts/refresh-franchise-catalogues.mjs`.
- Removed the old handwritten MCU/Marvel arrays as display sources. Catalogue/library merges use both TMDB ID and movie/TV type, preserve personal ratings/reviews/status, and display canonical artwork/title metadata. No user records were rewritten to repair a display.
- Franchise pages show the whole catalogue even with an empty library. Click any title to browse it; add only missing titles to the watchlist in one action. Bulk saves check the owner's existing server records, insert in chunks, retain existing entries, report partial failures and can be retried. Genre metadata and anime grouping are retained for new bulk entries.
- Header search and Ctrl/Cmd+K open `/search`, with query state in the URL, paginated results sorted by popularity among loaded results, related collection links and people/credit browsing. Exact collection-name matches rank ahead of loose matches. Changing the query clears stale suggestions. Search supports individual saves and multi-selection.
- Desktop and mobile Log a film buttons now open a dedicated compact quick-log dialog, rather than the generic search popup. Users can save Watched/Watchlist directly, select multiple new titles, browse a whole saga or open details for a review. Inline feedback avoids duplicate success popups. Existing saved titles cannot be accidentally downgraded by a watchlist-add action.
- Switching films while the detail panel is open replaces its history entry. Clicking outside closes one panel and returns to the collection; it no longer reopens each previously viewed film. Quick-log closing also restores the underlying history state.

## Verification

- Full local release runner passed: 66 regression/security tests, 45 page/menu initialization checks and 10 extras interactions, plus lint/build. Existing non-fatal lint/chunk warnings remain.
- Added catalogue tests for typed identities, correct Fast/MCU/Jurassic membership, personal-data preservation, anime/genre normalization, exact collection matching and popularity sorting.
- Desktop/mobile browser checks exercise the full Fast saga, rejected bulk-save retry, preserving an already-watched saga film's review/rating, switching details without history stacking, outside-click dismissal, query-driven search, official saga navigation, direct quick logging and multi-select watchlisting.
- The broader 30-route and social workflow browser checks passed locally. Preview workflow checks use intercepted Supabase fixtures for every account/social write; they do not certify live RLS or SMTP delivery.
- Mobile screenshots were inspected and the quick-log layout was compacted to keep film results visible beneath the controls. Final preview browser output is in `deployed-collections-search-final.log`.

The preview uses the configured live backend when a real user signs in; intentional saves made through its UI affect that user's actual library. Catalogue data is a versioned TMDB snapshot, not a guarantee that future additions are already present.
