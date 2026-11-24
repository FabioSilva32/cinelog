# CineLog production release — 20 November 2026

Live: https://cinelog-phi.vercel.app

Published with the user's explicit instruction to improve the quick-log menu and deploy to main. Final production deployment: `dpl_8fcDdMdchbCYe3aYrPr1a5HfC1kJ` (`cinelog-2evzunc4h-lynnx.vercel.app`). The main domain resolves to this READY production deployment.

The release includes the reviewed collections/search work documented in `COLLECTIONS-SEARCH-2026-11-20.md`, plus the polished quick-log menu: a single aligned film list, a fixed header/search/status area, independently scrolling results, accessible custom selection controls, inline save/error feedback, and a fixed batch-save footer. The layout was visually inspected on desktop and mobile. Failed saves retain the menu and can be retried. Full-page search keeps its poster grid.

Validation:

- Full release checks passed: lint/build, 66 regression/security tests, 45 page/menu initialization checks and 10 extras interaction checks. Existing non-fatal lint and bundle-size warnings remain.
- Desktop and 390px/320px phone workflows passed, including saga data, non-destructive bulk watchlisting, failed-save retries, single-entry film history, outside-click dismissal, search, direct quick logging and multi-selection. Search and footer remain fixed when results scroll; no horizontal menu overflow was detected.
- The staged production build passed the new workflows, the 30-route desktop/mobile check, account menus and existing fixture-backed social workflows before promotion.
- The actual live domain then passed the collection/search/quick-log workflow checks. All test account writes were intercepted fixtures; no test content was inserted into actual users' libraries.
- Current dependency advisory scan: zero known advisories. Vercel's recent runtime-error query returned no runtime errors; this is not a guarantee of exhaustive client telemetry.

Previous production retained for rollback: `dpl_HEPkJ1uJydjur9qNiDt27myQqdLE` (`cinelog-h0msrg7cx-lynnx.vercel.app`). The original source/backup was not replaced. No GitHub push, database migration, policy change or signed Android package release was performed. The Android wrapper's remote website follows the production domain.

The prior limits on independently verified SMTP delivery, adversarial two-account live permissions and physical WebView testing remain. Future Git-triggered deployments should use the reviewed source copy; GitHub synchronization is separate from this direct Vercel release.
