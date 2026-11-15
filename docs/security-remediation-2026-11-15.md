# BEHESHTI security remediation | November 15, 2026

Status: **development branch only; not merged or deployed**.
Baseline production \`main\`: \`aecf8c3032047122b895863ade812b13b339a981\`.
Branch: \`security/beheshti-remediation-20261115\`.
Scope: approved reversible Phases 0-3 only. This document contains no historical coordinates, author email, private photos, or owner-only evidence.

## Change boundaries
- The published stories, catalog data, photos, SEO, URLs, layout, brand, and CNAME remain intact.
- No source rewrite, force push, deletion, branch protection update, production deployment or GitHub Support contact.
- Production Pages source stays unchanged. The added workflow produces a preview-only artifact; production remains on its existing Pages publisher until separate approval.
- A staged Pages source switch needs a distinct owner-approved rollout after reviewing the preview and testing a rollback.

## Current control implementation
1. \`scripts/publication.mjs\` defines approved root assets, standalone pages, local archive code and controlled media directories. It rejects raw photo/document extensions and checks all current media for embedded EXIF/XMP/IPTC or textual metadata.
2. \`scripts/build-public.mjs\` stages only allowed files in \`dist/\`; \`scripts/verify-public.mjs\` independently compares emitted and expected files and validates local HTML resources.
3. \`app.js\` now gathers a true focusable-element collection, wraps Tab and Shift+Tab inside dialogs and restores focus. Browser-based keyboard validation is still required before any merge.
4. Maldives, Ferragosto and the archive have compatible CSP meta policies. The archive's original inline scripts and inline click handlers are moved into local assets with delegated handlers. GitHub Pages response-header policies remain a hosting limitation.
5. \`tracking.js\` uses GoatCounter's publisher-supported versioned \`count.v5.js\` and published SHA-384 SRI with anonymous CORS, retaining the existing route/event tracking logic. Live analytics must be checked before any production merge.
6. All four original checks use read-only token defaults and immutable GitHub Action commit pins. Obsolete feature-branch push triggers have been removed; the new always-running pull-request security job does not use path filtering.
7. \`tests/check-security.mjs\` covers path allowlisting, synthetic metadata, source media, CSP, archive handlers, focus logic, GoatCounter and CI configuration. All four original editorial Node tests remain required.

## Security finding register
| ID | Priority | Baseline evidence | Branch mitigation / outcome | Required verification or residual risk |
| --- | --- | --- | --- | --- |
| SEC-01 | P0 assessment | Original forensic briefing reported 11 historical versions of nine images with location/camera/time metadata | No history modification; preventive media screening introduced | Private binary/coordinate review; PURGE/ACCEPT/DEFER owner decision; external copies unknown |
| SEC-02 | P2 | Original briefing reported personal author email in five older commits | No history modification | Could be included in one separately approved rewrite; residual phishing exposure |
| SEC-03 | P1 | Public GitHub includes three internal docs and tests; current Pages uses automatic Jekyll workflow | Allowlisted public-only preview and inventory validation | Pages source switch requires approval; public repository files remain readable via GitHub |
| SEC-04 | P2 | Unpinned dynamically loaded GoatCounter script | Publisher-supported versioned v5 + published SRI hash and CORS | Live CSP/CORS, pageviews and events still require browser validation |
| SEC-05 | P1 | Standalone feature, Ferragosto and archive missing CSP | Meta CSP added; archive code externalized | Browser CSP checks; meta CSP cannot supply frame-ancestors/HTTP header policy |
| SEC-06 | P2 | Mutable Action version tags, inconsistent token permissions, unused feature triggers | Immutable pins, least privilege and always-on security check | CI results and separate decision on required protection-rule checks |
| SEC-07 | P1 | \`app.js\` used \`$().filter()\` on a DOM Element in overlay Tab handling | Collection-based trap and focus wrap added | Browser keyboard, Escape, focus return, screen reader, mobile QA |
| SEC-08 | P2 editorial | Historical story identifiers and potentially recognizable people | No changes | Owner content and publication-rights review; do not automatically alter stories |
| SEC-09 | P3 | Archive disallowed in robots but has noindex | Legacy archive preserved with CSP | Choose crawler/retirement approach with owner; noindex/robots are not privacy controls |

## Read-only Phase 0 checkpoint
- Baseline \`main\` still at \`aecf8c3\` when implementation branch was created.
- 15 original branches, zero open PRs at kickoff, repository public and reported fork count zero. This is only a present-state observation, not evidence of no clones.
- Active \`Protect production main\` ruleset \`25320696\` blocks deletion/non-fast-forward, requires PR and resolved threads, has zero approving reviewers, zero required checks, no bypass actors.
- The previous published catalog and Pages deployment at baseline were successful. Connected GitHub API did not expose authenticated Pages source/domain settings.
- Direct historical binary scanning, comparison with owner-private addresses, external archive coverage, GitHub account 2FA, registrar/DNS, HTTPS enforcement and live HTTP headers are **not verified**. They must not be reported as passed.
- Historical PURGE/ACCEPT/DEFER decision remains pending. Never place coordinates, private metadata or historical image copies in public tickets, source files, CI logs or this register.

## Verification before review
Run:
\`\`\`sh
find . -type f \( -name '*.js' -o -name '*.mjs' \) -not -path './dist/*' -print0 | xargs -0 -n1 node --check
node tests/check-alhambra.mjs
node tests/check-maldives.mjs
node tests/check-editorial.mjs
node tests/check-story-catalog.mjs
node --test tests/check-security.mjs
node scripts/build-public.mjs
node scripts/verify-public.mjs
\`\`\`
Run desktop/tablet/mobile, keyboard-only, analytics, social-preview and CSP checks in a real browser **before any production approval**. Verify exact Pages source and HTTPS/domain settings through authenticated access.

## Interruption recovery
1. Read current main, branch head, this file, workflow outputs and draft PR before any writes.
2. Inspect changes since the latest known checkpoint; do not repeat completed changes.
3. Keep CI evidence and each correction committed on this branch, without force-pushing.
4. Do not merge, deploy or modify protection rules. Historical rewrite needs an independent rehearsal, verified encrypted private backup and specific destructive-operation permissions.
5. At closeout report nine finding statuses, passed/failed checks, owner decisions, residual risks and exact branch/PR SHA.

References: November 15 security briefing and confidential remediation plan (owner supplied, kept outside public GitHub); https://www.goatcounter.com/help/countjs-versions; https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository.
