import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';

const read=p=>readFileSync(p,'utf8');
const ctx={window:{}};
vm.runInNewContext(read('content.js'),ctx,{filename:'content.js'});
const C=ctx.window.BEHESHTI_CONTENT;
const articles=ctx.window.BH_ORIGINAL_ARTICLES;
const app=read('app.js'),feature=read('alhambra-feature.js');
const maldives=read('journeys/maldives-ithaafushi/index.html');
const site=read('index.html');
const records=C.stories;
const canonical=s=>s.replace(/^\//,'').split(/[?#]/)[0];
const exists=p=>!!p&&existsSync(canonical(p));
const checkImage=(p,context)=>assert(exists(p),'Missing image in '+context+': '+p);
const ids=records.map(s=>s.id);

assert(ids.length>=14,'Story catalog unexpectedly contracted');
assert.equal(new Set(ids).size,ids.length,'Duplicate story IDs');
assert.equal(C.destinations.length,5,'Destination inventory unexpectedly changed');
assert.equal(new Set(C.destinations.map(d=>d.id)).size,C.destinations.length,'Duplicate destination IDs');
assert(site.includes('/alhambra-feature.js')&&site.includes('/content.js')&&site.includes('/app.js'),'Rendering scripts not included');

for(const story of records){
 checkImage(story.image,'story '+story.id);
 if(story.fallback)checkImage(story.fallback,'fallback '+story.id);
 assert(app.includes('function existingStory(story)'),'Article renderer missing');
 assert(typeof story.summary==='string'&&story.summary.length>25,'Missing story summary: '+story.id);
}
for(const d of C.destinations){
 checkImage(d.image,'destination '+d.id);
 if(d.fallback)checkImage(d.fallback,'destination fallback '+d.id);
 assert(ids.includes(d.featured),'Destination '+d.id+' has no linked story');
}
for(const d of C.discoveries){
 if(d.image)checkImage(d.image,'discovery '+d.id);
 assert(ids.includes(d.storyId),'Discovery '+d.id+' references missing story');
 assert(maldives.includes('id="'+d.href.split('#')[1]+'"'),'Missing chapter target for '+d.id);
}

assert(articles&&Object.keys(articles).length>=12,'Original article collection unexpectedly missing');
let shortCount=0,photos=0;
for(const st of records){
 if(['maldives-ithaafushi','alhambra','ferragosto'].includes(st.id))continue;
 const a=articles[st.id];
 assert(a,'Cover-only story would be published: '+st.id);
 assert(typeof a.body==='string'&&(a.body.match(/<p>/g)||[]).length>=4,'Incomplete body: '+st.id);
 assert(typeof a.lede==='string'&&a.lede.length>30,'Missing lede: '+st.id);
 const media=[...(a.photos||[]).map(x=>x.src),...(a.hero?[a.hero]:[])];
 media.push(...[...a.body.matchAll(/<img[^>]*src=['"]([^'"]+)['"]/g)].map(m=>m[1]));
 for(const p of media)checkImage(p,'original article '+st.id);
 photos+=media.length;
 shortCount++;
}
assert(shortCount>=11,'Missing supported Italian story articles');
assert(typeof ctx.window.BH_FERRAGOSTO_HTML==='string'&&ctx.window.BH_FERRAGOSTO_HTML.length>12000,'Ferragosto journal narrative missing');
assert(existsSync('images/travel-amalfi-ferragosto.html'),'Legacy Ferragosto canonical page missing');
for(const m of ctx.window.BH_FERRAGOSTO_HTML.matchAll(/<img[^>]*src=['"]([^'"]+)['"]/g))checkImage(m[1],'Ferragosto article');
assert(feature.includes('window.BH_ALHAMBRA_RENDER'),'Actual Alhambra feature not registered');
vm.runInNewContext(read('alhambra-photos.js'),ctx,{filename:'alhambra-photos.js'});
const aPhotos=ctx.window.BH_ALHAMBRA_PHOTOS;
assert(aPhotos.length===33,'Alhambra published photo set changed unexpectedly');
for(const p of aPhotos){checkImage(p.public_image,'Alhambra full');checkImage(p.small_image,'Alhambra responsive');}

const title='Somewhere Between Sea and Sky';
assert(records.find(x=>x.id==='maldives-ithaafushi').title===title,'Maldives title inconsistent in catalog');
assert(maldives.includes('<title>'+title+' | Maldives | BEHESHTI</title>'),'Maldives HTML title mismatch');
assert(maldives.includes('"headline":"'+title+'"'),'Maldives structured-data title mismatch');
assert(maldives.includes('og:title" content="'+title+' | BEHESHTI"'),'Maldives social title mismatch');
assert(app.includes('Somewhere Between <em>Sea and Sky.</em>'),'Homepage tile headline mismatch');
assert(!app.includes('Seven nights, <em>never enough.</em>'),'Old story headline restored');
assert(maldives.includes('id="beach-dinner"')&&maldives.includes('Lebanese and Middle Eastern'),'First night chapter missing');
assert(maldives.includes('id="villa-dinner"')&&maldives.includes('id="li-long"')&&maldives.includes('id="zuma"'),'Dining chapters missing');
assert(maldives.includes('private-island-pool.webp'),'Approved Maldives cover missing');

console.log('PASS: '+ids.length+' catalog stories, '+shortCount+' Italian narrative articles, Ferragosto, '+aPhotos.length+' Alhambra photographs, '+C.destinations.length+' destinations, '+C.discoveries.length+' discovery links and all referenced image paths.');
