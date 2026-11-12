import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const read=p=>readFileSync(p,'utf8');
const app=read('app.js'),index=read('index.html'),css=read('editorial-home.css');
const article=read('journeys/maldives-ithaafushi/index.html');
const sandbox={window:{}};
vm.runInNewContext(read('content.js'),sandbox,{filename:'content.js'});
const C=sandbox.window.BEHESHTI_CONTENT;

assert(index.includes('href="/editorial-home.css"'),'Editorial stylesheet not loaded');
assert(app.includes('class="bh-cover"')&&app.includes('bh-cover-mosaic'),'Integrated homepage cover missing');
const mosaicStart=app.indexOf('class="bh-cover-mosaic"');
const mosaic=app.slice(mosaicStart,app.indexOf('</div>\n </section>',mosaicStart));
assert.equal((mosaic.match(/<a class="bh-cover-image /g)||[]).length,3,'All three hero photographs must be clickable');
assert(mosaic.includes('href="${routeLink(a.id)}"'),'Granada tile must open the Alhambra story');
assert(mosaic.includes('href="${routeLink(m.id)}"'),'Lagoon tile must open the Maldives story');
assert(mosaic.includes('href="/journeys/maldives-ithaafushi/#villa-dinner"'),'Dinner tile must open the villa dinner chapter');
assert(mosaic.includes('/images/maldives/private-dinner-table.webp'),'Hero must show private dinner photo');
assert(!mosaic.includes('/images/maldives/li-long-roast-duck.webp'),'Old duck hero image still present');
assert(mosaic.includes('Private Dining / Ithaafushi'),'Dinner tile caption missing');
assert(css.includes('.bh-cover-image:focus-visible'),'Accessible keyboard focus missing');
assert(css.includes('.bh-cover-caption'),'Updated mosaic caption styles missing');
assert(existsSync('images/maldives/private-dinner-table.webp'),'Dinner hero photo missing');
assert(article.includes('id="villa-dinner"'),'Dining link target not in the article');
assert(app.includes('class="bh-featured-grid"')&&app.includes('bh-table-feature'),'Curated stories or Food & Wine section missing');
assert(app.includes('href="#/journal">Explore the journal'),'Homepage CTA must open the Journal');
const home=app.slice(app.indexOf('function home(){'),app.indexOf('function masthead('));
assert(!home.includes('01 / 04'),'Fake homepage carousel counter restored');
assert(!home.includes('maldives-home-spotlight'),'Old stacked Maldives homepage feature restored');
for(const id of ['m.id','a.id','f.id'])assert(home.includes('routeLink('+id+')'),'Homepage lost '+id+' link');
assert(css.includes('@media(max-width:650px)'),'Phone breakpoints missing');
assert(css.includes('prefers-reduced-motion'),'Reduced-motion support missing');
assert(css.includes('.bh-food-more')&&css.includes('.bh-dining-grid'),'Food discovery layout missing');
assert(app.includes('(C.discoveries||[])'),'Chapter search index not connected');
assert(app.includes('relevance(b)-relevance(a)'),'Chapter-level search relevance missing');
assert(app.includes('(s.sections||[])'),'Journal cross-category filter missing');
assert(app.includes("const simpleNav=[['Journeys'"),'Main navigation missing');
assert(!app.match(/const simpleNav=[^\n]*Ideas & Interests/),'Empty Ideas collection advertised in navigation');

const stories=C.stories;
const ids=stories.map(s=>s.id);
assert.equal(new Set(ids).size,ids.length,'Duplicate story IDs');
const maldives=stories.find(s=>s.id==='maldives-ithaafushi');
assert(maldives&&maldives.sections.includes('Food & Wine'),'Maldives missing Food & Wine cross-listing');
const dining=C.discoveries.filter(d=>d.section==='Food & Wine');
assert(dining.length>=7,'Maldives dining references incomplete');
assert.equal(dining.filter(d=>d.featured).length,3,'Homepage dining feature should have three real photos');
assert(dining.some(d=>d.id==='li-long')&&dining.some(d=>d.id==='zuma')&&dining.some(d=>d.id==='beach-dinner'),'Key meals missing');
assert.equal(new Set(C.discoveries.map(d=>d.id)).size,C.discoveries.length,'Duplicate discovery IDs');
for(const d of C.discoveries){
 assert(stories.some(s=>s.id===d.storyId),'Discovery '+d.id+' has no canonical story');
 assert(d.href.startsWith('/journeys/maldives-ithaafushi/#'),'Invalid deep link '+d.id);
 const anchor=d.href.split('#')[1];
 assert(article.includes('id="'+anchor+'"'),'Deep link '+d.id+' targets missing anchor '+anchor);
 if(d.image)assert(existsSync(d.image.replace(/^\//,'')),'Missing image for '+d.id);
 if(d.featured)assert(d.image,'Featured discovery '+d.id+' lacks photo');
}
for(const path of [
 'images/alhambra/alhambra-from-generalife-blossoms-1600.webp',
 'images/alhambra/nasrid-stucco-arch-1600.webp',
 'images/maldives/quiet-lagoon.webp',
 'images/maldives/li-long-roast-duck.webp',
 'images/maldives/sandbar.webp',
 'images/travel-amalfi-positano-dusk.jpg'
])assert(existsSync(path),'Broken homepage image '+path);
assert(app.includes("stories.filter(s=>s.category==='Food & Wine')"),'Italian food stories must remain visible');
assert(app.includes('href="/journeys/maldives-ithaafushi/#beach-dinner"'),'Beach-dinner homepage link missing');
assert(article.includes('id="beach-dinner"'),'First evening has no anchor');
console.log('PASS: editorial homepage, '+stories.length+' preserved story records, '+dining.length+' dining references, '+C.discoveries.length+' chapter deep links, images and responsive styles.');
