import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import vm from 'node:vm';
const read = p => readFileSync(p, 'utf8');
const html = read('journeys/maldives-ithaafushi/index.html');
const app = read('app.js');
const sitemap = read('sitemap.xml');
const galleryJS = read('maldives-gallery.js');
const css = read('maldives-feature.css');
assert(html.includes('href="/maldives-feature.css"'), 'Feature CSS missing');
assert(app.includes('new Set(C.destinations.map(d=>d.country).sort())'), 'Journeys country filters are not derived from destinations');
assert(html.includes('src="/maldives-gallery.js"'), 'Gallery script missing');
assert(css.includes('prefers-reduced-motion'), 'Reduced-motion support missing');
assert(galleryJS.includes('ArrowRight') && galleryJS.includes('ArrowLeft'), 'Keyboard gallery navigation missing');
assert(app.includes("id==='maldives-ithaafushi'?'/journeys/maldives-ithaafushi/'"), 'Story routing missing');
assert(sitemap.includes('https://beheshti.com/journeys/maldives-ithaafushi/'), 'Sitemap missing story URL');
const sandbox = { window: {} };
vm.runInNewContext(read('content.js'), sandbox, { filename: 'content.js' });
const content = sandbox.window.BEHESHTI_CONTENT;
assert.equal(content.stories.filter(s => s.id === 'maldives-ithaafushi').length, 1, 'Duplicate or missing story entry');
assert.equal(content.destinations.filter(s => s.id === 'maldives').length, 1, 'Duplicate or missing destination entry');
const imageDir = 'images/maldives';
const files = readdirSync(imageDir).filter(x => x.endsWith('.webp')).sort();
assert.equal(files.length, 128, 'Expected exactly 128 image derivatives');
assert.equal(files.filter(x => x.endsWith('-sm.webp')).length, 64, 'Expected 64 small derivatives');
for (const filename of files) {
  const path = `${imageDir}/${filename}`;
  const buf = readFileSync(path);
  assert.equal(buf.toString('ascii', 0, 4), 'RIFF', `Not RIFF: ${path}`);
  assert.equal(buf.toString('ascii', 8, 12), 'WEBP', `Not WebP: ${path}`);
  assert(statSync(path).size < 1800000, `Unusually large public image: ${path}`);
  assert.equal(buf.readUInt32LE(4) + 8, buf.length, `WebP RIFF length mismatch: ${path}`);
  for (let o = 12; o + 8 <= buf.length;) {
    const chunk = buf.toString('ascii', o, o + 4);
    const size = buf.readUInt32LE(o + 4);
    assert(!['EXIF', 'XMP ', 'ICCP'].includes(chunk), `Private metadata in ${path}`);
    o += 8 + size + (size % 2);
  }
}
const refs = [...html.matchAll(/\/images\/maldives\/([a-z0-9-]+\.webp)/g)].map(m => m[1]);
assert(refs.length > 100, 'Not enough article image references');
for (const filename of new Set(refs)) assert(existsSync(`${imageDir}/${filename}`), `Broken image: ${filename}`);
const chapterIds = ['the-arrival','our-villa','at-the-table','island-life','private-island','villa-dinner','li-long','zuma','the-simple-things','sandbars','the-sunset','until-next-time'];
for (const id of chapterIds) assert(html.includes(`id="${id}"`), `Missing chapter: ${id}`);
const lightboxes = [...html.matchAll(/data-mdv-lightbox="([^"]+)"/g)].map(m => m[1]);
assert.equal(lightboxes.length, 61, 'Expected 61 gallery photographs');
assert.equal(new Set(lightboxes).size, lightboxes.length, 'Duplicate gallery photographs');
assert(html.includes('<link rel="canonical" href="https://beheshti.com/journeys/maldives-ithaafushi/"'), 'Incorrect canonical URL');
console.log(`PASS: ${chapterIds.length} chapters, ${lightboxes.length} gallery photographs, ${files.length} metadata-free images, and integrated navigation.`);