# BEHESHTI | Published Journeys and Story Completeness Audit
**Reviewed:** November 11, 2026 (Pacific time)
**Source:** `behshad-code/beheshti.com`, production `main` after Maldives feature PR #10; audit and corrections on `feature/maldives-sea-and-sky-title-and-collection-audit`.

## Executive findings

- **14 listed stories**, five destination cards (Maldives, Granada, Amalfi Coast, Capri, Ravello) and nine Maldives discovery links.
- **No known cover-only stories**: Maldives has a standalone 13-chapter article; Alhambra uses a dedicated photo-essay renderer; Ferragosto has a long journal feature and a separate legacy static HTML page; the remaining **11 shorter Italy stories** each have a populated article body. The catalog regression test blocks new cover-only items and missing referenced local images.
- **Current Maldives curated set:** 64 unique large WebPs plus 64 small derivatives, 63 unique gallery images plus one distinct cover. First-night Lebanese and Middle Eastern beach dinner has its own chapter. Story title is now **Somewhere Between Sea and Sky** everywhere public, without changing the URL.
- **Alhambra:** 33 selected original-visitor photographs with 33 small variants, integrated in the actual feature (one hero plus 32 inline gallery references). Earlier publishing notes refer to **52 original positions**, so the curated 33 should not be confused with all submitted photographs.
- **Ferragosto / Amalfi:** substantial first-person travel editorial and multiple local images are present, with a preserved legacy static page at `/images/travel-amalfi-ferragosto.html`. The main Journal also displays a JavaScript-rendered feature, so editorial reconciliation should keep those two representations consistent rather than creating another duplicate.
- **Shorter Italian stories:** 11 have 5 to 7 prose paragraphs each, generally one to three direct image references (including cover/secondary photos). Their brevity is not a broken-page defect, but does not prove they cover all uploaded experiences.

## Coverage by collection

| Collection | Site contents verified | Remaining editorial limitation |
|---|---|---|
| Maldives | 13 chapters; 64 curated selected photographs; Lebanese dinner, anniversary transfer, Villa 702, breakfast, Li Long, Zuma, villa dining, private-island tour, jet skiing, sandbar, farewell | More original uploads exist than the 64-image processed selection; no complete original-to-public photo identity reconciliation has been performed |
| Alhambra & Generalife | Full dedicated feature, 33 selected photographs and architectural/cultural chapters | Earlier notes reference 52 original positions; curated omissions require photo-by-photo source review and approval |
| Positano / Amalfi / Ravello / Ferragosto | Ferragosto feature, old preserved canonical article, and populated shorter travel, culinary and cathedral stories | Some shorter stories have only one or two supporting photographs; confirm claims and experiences against source notes before substantial editorial expansion |
| Capri | Vespa, gelato and Marina Grande stories with article bodies and image references | Article headlines and experiential specifics need source confirmation; no standalone long-form Capri photo essay is in the current repository |
| Food & Wine | Five Italy story records plus Maldives dining chapter links | Several Italy pieces are brief; keep canonical stories and cross-link rather than copy entire text into multiple categories |

## Source-photo retrieval discovery

The BEHESHTI Library contains **123 November 11 file records matching `image(20261111-...)`**. Not every record is necessarily a distinct original travel photograph; some appear to be screenshots, duplicate frames or other transfers. There are also earlier November 10 image records. Previous audits focused on the 64 curated published Maldives derivatives and missed these Library records.

**Important access limitation:** The Library can display the image previews and associated file records, but the original November 11 uploaded files examined in this audit did **not** expose an authorized raw-byte materialization path for editing. One separately attached screenshot was materializable; multiple actual photo uploads were rejected by the file-materialization action. A preview proves a photo record exists, but does not provide the authorized source bytes needed to produce verified optimized, metadata-stripped website derivatives. **Do not publish original file records, embedded metadata, or screenshots as replacements.**

A true all-upload reconciliation requires authorized access to the raw original batch, followed by a private intake ledger keyed by original file identity and hash, visual quality/duplicate review, caption approval, public-derivative export with GPS/EXIF/IPTC/XMP removal, and mapping each selection into an editorial chapter. It cannot be certified from the current 64 published derivatives alone.

## Engineering and content QA performed

- Cross-checked all 14 story identities against their article routes or underlying `BH_ORIGINAL_ARTICLES` entries.
- Cross-checked photo paths referenced by each source article, each destination card, and Alhambra's photo catalog against the Git tree. No missing local image paths were found in those checks.
- Verified all nine Maldives discovery links point to existing chapter anchors, including Lebanese beach dinner.
- Preserved existing hash routes and dedicated Maldives and Ferragosto URLs. No existing page or photo is deleted in this release.
- Added an automated catalog coverage check so later additions cannot silently become cover-only or lose their images.
- Unified new Maldives title in the article, homepage, Journal catalog, accessible labels, and SEO/social metadata. Retained seven-night sentiment in the closing prose.

## Editorial items intentionally not rewritten

A structural audit cannot establish that first-person anecdotes in Italy stories are accurate accounts of family experiences or that every date, restaurant visit, ranking or wine detail was supplied or independently verified. Those narratives were left intact, rather than inventing corrections. All new content should distinguish family-source accounts from researched facts and editorial interpretation. Existing published promotional/resort images and recognizable individuals continue to require publication-rights review as applicable.

## Future work with proper source access

1. Reconcile the 123 November 11 image records against the Maldives curated set and identify whether further unique user-owned photos belong in the Lebanese dinner or other chapters.
2. Reconcile the 52-position Alhambra original set against the 33 selected photos.
3. Verify personal claims and source media for the Italian stories, then decide where a longer Capri or Amalfi essay adds value without repeating existing material.
4. Consider a later SEO/URL initiative for JavaScript/hash-routed stories. Do not change old URLs without permanent redirects and navigation tests.

**No raw originals were added to public GitHub by this audit.**
