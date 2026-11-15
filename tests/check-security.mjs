import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {auditSource,isPublicPath,mediaFindings,sourcePathFindings} from '../scripts/publication.mjs';

const root=process.cwd();
const read=file=>fs.readFile(path.join(root,file),'utf8');

test('public routing allowlist cannot publish internal documentation or raw media',()=>{
  for(const file of [
    'docs/editorial-redesign-checkpoint.md','tests/check-security.mjs',
    '.github/workflows/security-checks.yml','scripts/publication.mjs','README.md',
    '.env','images/private-photo.heic','images/../docs/a.md','/etc/passwd','images//raw.jpg'
  ]) assert.equal(isPublicPath(file),false,'must not publish '+file);
  for(const file of [
    'index.html','CNAME','archive/index.html','archive/archive.js',
    'privacy/index.html','terms/index.html','journeys/maldives-ithaafushi/index.html',
    'images/travel-amalfi-ferragosto.html','images/maldives/quiet-lagoon.webp',
    'assets/alhambra-hero.webp','icons/beheshti-192.png'
  ]) assert.equal(isPublicPath(file),true,'must keep route or asset '+file);
  assert.deepEqual(sourcePathFindings(['images/raw.heic','docs/private.zip','.env','id_rsa']).sort(),
    ['.env','docs/private.zip','id_rsa','images/raw.heic'].sort());
});

test('metadata scanner rejects synthetic EXIF, PNG text, WebP EXIF and malformed media',()=>{
  const exif=Buffer.from('Exif\u0000\u0000some-metadata','latin1');
  const jpg=Buffer.concat([Buffer.from([255,216,255,225,0,exif.length+2]),exif,Buffer.from([255,217])]);
  assert.ok(mediaFindings(jpg,'example.jpg').some(x=>x.includes('EXIF')));
  const png=Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),Buffer.from([0,0,0,0]),Buffer.from('tEXt'),Buffer.alloc(4)]);
  assert.ok(mediaFindings(png,'example.png').some(x=>x.includes('metadata')));
  const chunk=Buffer.concat([Buffer.from('EXIF'),Buffer.alloc(4)]);
  const riff=Buffer.concat([Buffer.from('RIFF'),Buffer.from([12,0,0,0]),Buffer.from('WEBP'),chunk]);
  assert.ok(mediaFindings(riff,'example.webp').some(x=>x.includes('EXIF')));
  assert.ok(mediaFindings(Buffer.from('not a JPEG'),'example.jpeg').includes('invalid JPEG signature'));
  assert.deepEqual(mediaFindings(Buffer.from('not an image'),'readme.md'),[]);
});

test('all current source media are clean and all required public routes are staged',async()=>{
  const {files,published}=await auditSource(root);
  assert.ok(files.length>250,'unexpectedly small source inventory');
  assert.ok(published.length>250,'unexpectedly small published inventory');
  assert.ok(published.every(isPublicPath));
  assert.ok(!published.some(f=>f.startsWith('docs/')||f.startsWith('tests/')||f.startsWith('.github/')));
});

test('standalone pages carry CSP without blocking their own scripts',async()=>{
  for(const file of ['journeys/maldives-ithaafushi/index.html','images/travel-amalfi-ferragosto.html','archive/index.html']) {
    const html=await read(file);
    assert.match(html,/http-equiv=["']Content-Security-Policy["']/i,file);
    assert.match(html,/script-src 'self'/,file);
    assert.match(html,/object-src 'none'/,file);
  }
  const archive=await read('archive/index.html');
  assert.doesNotMatch(archive,/\bonclick\s*=/i);
  assert.doesNotMatch(archive,/<script\b(?![^>]*src=)[^>]*>/i);
  assert.match(archive,/src="\/archive\/archive\.js"/);
  assert.match(archive,/src="\/archive\/archive-init\.js"/);
  assert.match(await read('archive/archive-init.js'),/data-archive-story/);
  assert.match(await read('archive/archive.js'),/function closeArticle/);
});

test('search and gallery focus management uses a collection, wraps focus and restores it',async()=>{
  const app=await read('app.js');
  assert.match(app,/\$\$\('button:not\(\[disabled\]\)/);
  assert.doesNotMatch(app,/const focusables=\$\('button:not\(\[disabled\]\)/);
  assert.match(app,/!modal\.contains\(document\.activeElement\)/);
  assert.match(app,/lastOverlayTrigger\.focus/);
  assert.match(app,/e\.key==='Escape'/);
  assert.match(app,/e\.ctrlKey\|\|e\.metaKey/);
});

test('versioned GoatCounter script has provider-published integrity, and event logic is retained',async()=>{
  const tracking=await read('tracking.js');
  assert.match(tracking,/https:\/\/gc\.zgo\.at\/count\.v5\.js/);
  assert.match(tracking,/sha384-atnOLvQb9t\+jTSipvd75X2yginT4PjVbqDdlJAmxMm\+wYElFmeR6EmLP5bYeoRVQ/);
  assert.match(tracking,/crossOrigin='anonymous'/);
  assert.match(tracking,/no_onload:true/);
  assert.match(tracking,/beheshti-event-/);
});

test('GitHub Actions use pinned dependencies and read-only default permissions',async()=>{
  const dir=path.join(root,'.github/workflows');
  const files=(await fs.readdir(dir)).filter(f=>f.endsWith('.yml'));
  assert.ok(files.includes('security-checks.yml'));
  for(const file of files) {
    const yaml=await fs.readFile(path.join(dir,file),'utf8');
    assert.match(yaml,/permissions:\s*\n\s+contents: read/,file);
    for(const match of yaml.matchAll(/uses:\s+([^\s#]+)/g)) {
      assert.match(match[1],/^[^@]+@[0-9a-f]{40}$/,file+' must pin '+match[1]);
    }
    assert.doesNotMatch(yaml,/feature\/(?:editorial-homepage-discovery-v2|maldives-ithaafushi-photo-essay|maldives-sea-and-sky-title-and-collection-audit)/,file);
  }
});
