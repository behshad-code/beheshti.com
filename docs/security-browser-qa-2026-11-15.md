# BEHESHTI browser security QA | November 15, 2026

Status: **partial browser validation passed; live origin verification pending**. This is sanitized testing documentation for the security remediation PR, not personal or family data.

## Method and scope
- Loaded the independently allowlisted, preview-only website snapshot from the successful PR CI artifact. It contains the same public UI source files as the final reviewed branch; subsequent changes before this test affected only security documentation and the media scanner.
- Chromium 144, using an in-memory HTML document with the actual site CSS and JavaScript injected. Network/file navigation was blocked by the testing environment (ERR_BLOCKED_BY_ADMINISTRATOR); scripts and styles were loaded from the already-verified preview snapshot instead.
- **Important limitation:** To permit injected local scripts on about:blank, removed CSP meta from the in-memory test document and stripped external asset tags; therefore this does not test production CSP headers, third-party fonts/analytics, network-loaded imagery or pixel-perfect page rendering. It is a real Chromium DOM/keyboard behavioral test, not a live-site end-to-end test.

## Results

| Surface | Test | Result |
|---|---|---|
| 1440px, 1024px, 820px | Homepage, Journeys, Food & Wine, Journal, About and Alhambra route render; no JavaScript page exceptions or horizontal overflow detected | Pass in in-memory DOM |
| 390px, 320px | Same route content renders with no JavaScript exceptions or horizontal overflow detected | Pass in in-memory DOM |
| 1440px, 1024px, 820px | Search opens, Zuma result is displayed, Tab and Shift+Tab stay inside overlay, Escape closes and restores focus, Ctrl+K opens search | Pass |
| 390px, 320px | Search button visible and clickable with a new in-memory page load; search input receives focus, Escape closes and returns focus to search button | Pass |
| 390px, 320px | Mobile menu opens, expanded state is true, Escape closes and restores collapsed state | Pass |
| 1440px, 1024px, 820px, 390px, 320px | Alhambra gallery opens, ArrowRight changes caption, Shift+Tab stays in overlay, Escape closes | Pass |
| Legacy archive | Seven navigation tabs and 27 story links rendered, tested Travel/Food/Culture tab activation, story opens, Escape closes, no JavaScript exceptions | Pass |
| Maldives standalone article | 13 chapter sections, 63 lightbox links, opens dialog, ArrowRight changes slide caption, Escape closes, no JavaScript exceptions | Pass |
| Current public imagery | Independent offline Pillow decoding of 261 JPG, PNG and WebP files | Pass: zero decode errors |
| Staged publication artifact | Allowlists all 286 public files and validates static HTML local resource paths | Pass in GitHub Actions |
| Full live-site keyboard, CSP, analytics, TLS, responsive image loading | Requires a reachable public origin with an authenticated supported browser | **Not verified** |

## Observations and limitations
- An initial mobile Playwright automation attempt timed out while waiting for a click action, but the control was present; a fresh in-memory run with `domcontentloaded` and the correct script-loading order successfully clicked the search and menu controls at both 390px and 320px. This should not be misreported as an unresolved product defect.
- No current story, gallery, image, route, social metadata or brand content was intentionally altered for this browser QA.
- No screenshot-based pixel comparison or independent live HTTPS/CSP/GoatCounter check was possible. Those remain a production release gate, not a test pass.
- The source photos and historic Git objects were **not** reprocessed by this QA, and private geocoordinates were not accessed or logged.

## Release gate
Before authorizing merge or production Pages switching, run the PR's preview on a reachable preview origin, verify actual 1440px, 1024px, 820px, 390px and 320px views and live network behavior, check all published routes, browser CSP console, Google Fonts and GoatCounter event delivery, and confirm HTTPS and custom domain settings. Record explicit approval for merge and separately for deployment. History rewrite remains a different approval process.
