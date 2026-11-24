# Quick rate — experimental Library feature

Open **Library → Quick rate**. The default queue contains watched titles without an overall rating. **Already seen these?** is a separate queue for unrated watchlist titles.

- Swipe left to skip or right to choose a rating. Buttons and left/right keyboard arrows are also available.
- No score is preselected and a swipe never saves automatically. Cancel stays on the same title; Skip leaves the library untouched.
- A successful save advances the queue. A failed save retains the title, chosen score and optional date for retry. Pending saves prevent double submission or closing the dialog.
- Undo last rating restores the fields changed by that rating. It checks account ownership and refuses to overwrite a newer edit. Undo is available during this Quick rate session.
- Rating an existing watched title changes only its overall score. Existing reviews, per-viewing scores, dates, episode/season metadata and favorites are preserved.
- Watchlist catch-up marks a title watched. A viewing date is optional; leaving it blank does not manufacture today's viewing or a dated diary entry. Supplying a date records that viewing while retaining older history.
- Saves use conditional updates to the current account's existing cloud entry. No new database tables or migration are needed.

## Review-only sample page

The one-off Vercel review build can enable `/quick-rate-demo` with `VITE_QUICK_RATE_DEMO=true`. This page uses three sample titles and in-memory saves: no test-account login, no real library writes, and no credentials required. It also provides a failed-save exercise and a 390px phone-layout frame. Reload or Reset clears the sample state.

The sample page is disabled in a normal build; keep the flag unset for production. The Library feature itself does not require the flag.

## Verification

`npm run check:release` passed 110 regression/security/model/database tests, 45 page/menu initialization checks and 10 extras checks. Ten Quick rate tests cover queue eligibility, no default score, cancellation, skip, Undo, failed-save retry, pending-save protection, gesture direction and historical data/date preservation. Build and lint passed with the existing repository advisories.

The release remains a test-copy/draft-branch change. Production and the original backup are unchanged.

## Try it

1. Open the sample page, swipe right or choose Rate it. Confirm Save is disabled before selecting a score.
2. Choose a score, Cancel, and confirm the same poster remains. Skip and confirm no sample write was recorded.
3. Save a score, then Undo last rating; confirm the previous title and original score return.
4. Close the dialog and choose Try a failed save. Confirm the chosen rating stays available for retry.
5. In Already seen these?, save with no date and then with a past date; compare diary behaviour in your own Library only after you are happy with the sample interaction.
6. Check the phone layout, swipe direction and numeric/slider controls.
