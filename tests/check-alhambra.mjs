import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import vm from 'node:vm';
const read=(p)=>readFileSync(p,'utf8');
const markup=read('index.html');
const app=read('app.js');
assert(markup.includes('<script defer src="/content.js"></script><script defer src="/alhambra-photos.js"></script><script defer src="/alhambra-feature.js"></script><script defer src="/app.js"></script>'), 'Missing ordered script integration');
assert(markup.includes('/alhambra-feature.css'), 'Missing Alhambra stylesheet');
assert(app.includes('window.BH_ALHAMBRA_RENDER?window.BH_ALHAMBRA_RENDER():alhambraStory()'), 'Existing Alhambra route not connected');
const ctx={window:{BEHESHTI_CONTENT:{stories:[{id:'alhambra',title:'old'}],destinations:[{place:'Granada'}],gallery:[],alhambraSources:[]}}};
vm.createContext(ctx);
vm.runInContext(read('alhambra-photos.js'),ctx,{filename:'alhambra-photos.js'});
vm.runInContext(read('alhambra-feature.js'),ctx,{filename:'alhambra-feature.js'});
const photos=ctx.window.BH_ALHAMBRA_PHOTOS;
assert.equal(photos.length,33,'Expected 33 unique published photos');
assert.equal(new Set(photos.map(p=>p.slug)).size,33,'Duplicate photo subjects');
const story=ctx.window.BEHESHTI_CONTENT.stories[0];
assert.equal(story.id,'alhambra');
assert(story.image.includes('/images/alhambra/'));
assert.equal(ctx.window.BEHESHTI_CONTENT.gallery.length,33,'Gallery should include every selected photograph');
const markupStory=ctx.window.BH_ALHAMBRA_RENDER();
assert.equal((markupStory.match(/data-gallery-index=/g)||[]).length,32,'Expected 32 inline story photographs + one hero');
assert(markupStory.includes('Heineken 0.0'),'Midnight passage missing');
for(const anchor of ['alh-intro','alh-fortress','alh-renaissance','alh-palaces','alh-partal','alh-generalife','alh-parador','alh-table','alh-midnight','alh-sources']) assert(markupStory.includes(`id="${anchor}"`),`Missing chapter ${anchor}`);
for(const [index,p] of photos.entries()){
 assert(p.caption && p.caption.length>60,`Missing or weak caption: ${p.slug}`);
 assert(p.title && p.title.length>6,`Missing title: ${p.slug}`);
 for(const path of [p.public_image,p.small_image]){
  const file=path.replace(/^\//,'');assert(existsSync(file),`Missing ${file}`);
  const buffer=readFileSync(file);assert.equal(buffer.subarray(0,4).toString(),'RIFF',`Invalid WebP ${file}`);assert.equal(buffer.subarray(8,12).toString(),'WEBP',`Invalid WebP ${file}`);
  let offset=12;
  while(offset+8<=buffer.length){const label=buffer.subarray(offset,offset+4).toString('ascii');const len=buffer.readUInt32LE(offset+4);assert(!['EXIF','XMP ','ICCP'].includes(label),`Metadata chunk ${label} in ${file}`);offset+=8+len+(len%2)}
  assert(statSync(file).size<1800000,`Unexpectedly large public derivative ${file}`);
 }
}
assert.equal(new Set(photos.map(p=>p.public_image)).size,photos.length);
assert.equal(new Set(photos.map(p=>p.small_image)).size,photos.length);
assert.equal(ctx.window.BEHESHTI_CONTENT.alhambraSources.length,9,'Missing research citations');
console.log('Passed: existing route integration; 33 curated photographs; 66 valid, metadata-free WebP files; article chapters; gallery; historical source list; captions and navigation.');