# Maldives photo essay publishing checkpoint

Feature: **Seven Nights, Never Enough**, Waldorf Astoria Maldives Ithaafushi.

- Review branch: `feature/maldives-ithaafushi-photo-essay`
- Public route after deployment: `/journeys/maldives-ithaafushi/`
- Article: `journeys/maldives-ithaafushi/index.html`
- CSS and gallery: `maldives-feature.css` and `maldives-gallery.js`
- Site integration: `content.js`, `app.js`, `sitemap.xml`
- Media: `images/maldives/`, 64 editorial image pairs (128 WebP files)
- Gallery: 61 distinct photographs, organized into 12 chapters
- Closing chapter: `#until-next-time` with the farewell still, Maldivian flag and Malé skyline
- Verification: `node tests/check-maldives.mjs`
- CI: `.github/workflows/maldives-checks.yml`

## Editorial and privacy guards

The private-island sequence describes a **tour**, not an overnight stay.
Only public optimized WebP derivatives are included; never add original private photographs or metadata to this repository.
Before moving the review branch into production, confirm publication permission for any resort or promotional photographs and any identifiable people in the farewell still.
The farewell still is a **still photograph**, not an embedded playable video.

## Recovery instructions

Inspect the current review branch head and any open PR, run the test, and verify all 128 media files before adding or replacing images.
Do not duplicate uploaded batches or change the existing stories, assets, or URLs.
The production branch remains separate until explicit publishing approval.
