# Maldives photo essay: editorial audit and release checkpoint

Feature: **Seven Nights, Never Enough** | Waldorf Astoria Maldives Ithaafushi

## Scope and status

- Review branch: `feature/maldives-hero-and-completeness-20261111`
- Production story URL (unchanged): `/journeys/maldives-ithaafushi/`
- Article: `journeys/maldives-ithaafushi/index.html`
- Styles and gallery: `maldives-feature.css`, `maldives-gallery.js`
- Cross-category discovery: `content.js` and existing `app.js` (no duplicate story)
- Curated media: 64 large and 64 small optimized WebPs (128 files total)
- New presentation: **13 chapters**, **63 distinct lightbox images**, plus one distinct opening image, **64/64 current curated images represented**.
- All current article images are taken from the preexisting processed media library. No originals, additional image files or metadata were added to the public repository.
- Homepage and category routes are preserved.

## Requested cover change

The main story hero and its Open Graph / structured-data image use `private-island-pool.webp`, which illustrates **Ithaafushi Private Island, a place visited on a tour, not the villa where the family stayed**. The previous `quiet-lagoon.webp` hero has been retained as a gallery image, not deleted. The private-island pool is removed from its later chapter gallery to avoid displaying the same photo twice.

## Experience-to-chapter coverage

| Documented experience | Destination in article |
| --- | --- |
| Anniversary and approximately 45-minute private yacht with Champagne, caviar and snacks | `#the-arrival` |
| Welcome treats, fruit basket and Champagne | `#the-arrival` |
| **Lebanese and Middle Eastern beach dinner on first night** | **`#beach-dinner`**, independent new chapter |
| Two-bedroom overwater villa with pool, **number 702**, and bicycles | `#our-villa` |
| Leisurely breakfast, charcuterie, fruit and noodle station | `#at-the-table` |
| Beach, pool, fish, crabs, fruit bats and poolside lunch | `#island-life` |
| Private-island tour, residences, tennis and padel (no overnight stay) | `#private-island` |
| Private villa dinner beside pool, Asian/Indian/Maldivian food | `#villa-dinner` |
| Li Long tasting menu and Beijing duck | `#li-long` |
| Zuma Japanese dinner, seafood and sunset views | `#zuma` |
| Pizza and cold beer by pool | `#the-simple-things` |
| Jet skis and empty sandbar | `#sandbars` |
| Champagne, caviar and island sunset | `#the-sunset` |
| Staff farewell, return boat, Malé, airport fast-track and Dubai flight | `#until-next-time` |

## Media coverage and truthfulness

The former edition showed 61 gallery photographs plus the former cover (62 unique). Two already processed photographs were absent from the story: `palm-and-pavilion.webp` and `evening-pier.webp`. Both are now used as **island-atmosphere illustrations** in the first-night beach-dinner chapter, with captions that do not present them as photographs of the meal. The former cover `quiet-lagoon.webp` moves into the gallery. The new private-island cover moves out of the later gallery. This produces **63 gallery photographs plus the distinct private-island hero, covering all 64 curated full-size images**.

**Important limitation:** The user's originally submitted image batches reportedly contained more photographs than the present 64-image curated set. The original raw upload inventory, complete original filenames, and any rejected photo frames are not available in this repository or the recovered publishing bundle. Therefore this audit **does not certify that every originally submitted photograph was reviewed, enhanced or published**. Missing raw photo source material would need a separate reconciliation if it becomes accessible. Do not use unrelated or resort marketing images as substitutes for an undocumented personal beach-dinner photograph.

The existing gallery remains factual to the documented personal experiences. No Lebanese menu dishes or restaurant name are invented. The private island is only described as a tour. Previously published media permissions and identifiable people still require editorial review when relevant.

## Tests and release

Run:
- `node --check app.js`
- `node tests/check-maldives.mjs`
- `node tests/check-editorial.mjs`
- `node tests/check-alhambra.mjs`

Verify article hero, contrast, small-screen crop, sticky chapter navigation, `/#/food-wine` first-night deep link, lightbox, image paths, metadata-free images, and unchanged URLs.
No deletion of existing stories or original assets; merge only after tests pass.
