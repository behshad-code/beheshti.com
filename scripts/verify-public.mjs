// Independent verification of the allowlisted preview artifact.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {auditSource,isPublicPath,listFiles,mediaFindings} from './publication.mjs';

const root=process.cwd();
const out=path.join(root,'dist');
const expected=(await auditSource(root)).published.slice().sort();
const emitted=(await listFiles(out)).sort();
assert.deepEqual(emitted,expected,'Preview must contain every and only approved public asset');
assert.ok(emitted.every(isPublicPath),'Disallowed file present in preview');
assert.ok(!emitted.some(f=>/^(?:docs|tests|scripts|\.github)\//.test(f)),'Internal material entered preview');

for (const file of emitted) {
  if (/\.(?:jpe?g|png|webp)$/i.test(file)) {
    const issues=mediaFindings(await fs.readFile(path.join(out,file)),file);
    assert.deepEqual(issues,[],'Published media metadata in '+file);
  }
}
for (const file of emitted.filter(f=>f.endsWith('.html'))) {
  const html=await fs.readFile(path.join(out,file),'utf8');
  const base=html.match(/<base\s+[^>]*href=["']([^"']+)["']/i)?.[1] || ('/'+path.posix.dirname(file)+'/');
  const docRoot=new URL(base,'https://beheshti.com/');
  const re=/<(?:img|script|link)\b[^>]*?\b(?:src|href)=["']([^"']+)["']/gi;
  for (const [,ref] of html.matchAll(re)) {
    if (ref.startsWith('data:') || ref.startsWith('#')) continue;
    const url=new URL(ref,docRoot);
    if (url.origin!=='https://beheshti.com') continue;
    if (url.search || url.hash) continue;
    let target=decodeURIComponent(url.pathname).replace(/^\/+/,'');
    if (!target || target.endsWith('/')) target += 'index.html';
    assert.ok(emitted.includes(target),'Broken local static resource '+file+' -> '+ref+' (resolved '+target+')');
  }
}
console.log('Verified allowlist, clean media, all static HTML resources and ' + emitted.length + ' staged files.');
