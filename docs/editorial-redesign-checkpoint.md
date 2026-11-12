# BEHESHTI | Editorial redesign and validation checkpoint

Branch: feature/editorial-homepage-discovery-v2
Baseline: main after Maldives homepage correction PR #7.

## Scope

- Replace stacked Alhambra and Maldives promotions with one editorial cover representing architecture, journeys and dining.
- Present curated Maldives, Alhambra and Amalfi stories. Retain existing route destinations.
- Add metadata-only references to Maldives culinary chapters in Food & Wine, homepage and search. Do not duplicate the article content or create new personal experiences.
- Show only published editorial sections in main navigation; preserve #/ideas route but remove its empty navigation entry.
- Keep all 14 existing story records and 5 destinations.
- Preserve all 128 published Maldives WebPs and earlier assets.
- Keep no carousel timer or deceptive carousel counter.
- Add automated regression tests and a local browser QA bundle.

## URLs

Canonical Maldives: /journeys/maldives-ithaafushi/
Stable dining anchors: #li-long, #zuma, #villa-dinner, #at-the-table, #beach-dinner, #the-simple-things, #the-sunset.
Unchanged hash routes: #/home, #/journeys, #/food-wine, #/culture, #/ideas, #/journal, #/about and existing story routes.

## Editorial safeguards

- This release adds no media files. Public Maldives WebPs were previously verified as metadata-stripped.
- Permissions for resort-supplied photographs or recognizable individuals remain separate editorial review. Engineering tests cannot establish rights.
- Original source photograph comparisons should be reviewed before claiming every submitted original was enhanced.
- Hash routes remain for existing categories; clean canonical category URLs require a separate no-breakage migration.

## Verification

Run tests/check-editorial.mjs, tests/check-maldives.mjs, tests/check-alhambra.mjs.
Review desktop 1440px+, laptop 1024px, tablet 768px, phone 390px and narrow phone 320px screenshots.
Verify visible links, Food & Wine cross-listing, Journal Food & Wine filter, Li Long/Zuma/duck/sandbar search and all nine deep links.
Confirm GitHub Pages deployment for the exact merge SHA and inspect rendered public pages where possible.
