// BEHESHTI public deployment boundary. No dependencies, no deployment side effects.
// This module is also exercised by the pull-request security gate.
import fs from 'node:fs/promises';
import path from 'node:path';

const publicRoots = new Set([
  'CNAME','index.html','app.js','content.js','tracking.js',
  'alhambra-feature.css','alhambra-feature.js','alhambra-photos.js',
  'editorial-home.css','legal.css','maldives-feature.css','maldives-gallery.js',
  'style.css','styles.css','robots.txt','sitemap.xml','site.webmanifest',
  'favicon.ico','favicon-16x16.png','favicon-32x32.png','apple-touch-icon.png'
]);
const publicPages = new Set([
  'privacy/index.html','terms/index.html','archive/index.html',
  'archive/archive.js','archive/archive-init.js',
  'journeys/maldives-ithaafushi/index.html',
  'images/travel-amalfi-ferragosto.html'
]);
const mediaExt = /\.(?:jpg|jpeg|png|webp)$/i;
const rawOrPrivateExt = /\.(?:heic|dng|cr2|nef|arw|raw|xmp|iptc|zip|7z|pdf|docx|msg|sqlite|p12|pem|key)$/i;
const privateNames = /(?:^|\/)(?:\.env(?:\.[^/]*)?|id_rsa|id_ed25519|\.ds_store|\.htpasswd|secrets?\.json)$/i;

export function isPublicPath(file) {
  if (typeof file !== 'string' || !file || file.startsWith('/') || file.includes('\\') ||
      file.split('/').some(part => !part || part === '.' || part === '..')) return false;
  if (publicRoots.has(file) || publicPages.has(file)) return true;
  if (/^assets\/[a-z0-9_-]+\.webp$/i.test(file)) return true;
  if (/^icons\/beheshti-(?:192|512)\.png$/i.test(file)) return true;
  if (/^images\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.(?:webp|jpe?g|png)$/i.test(file)) return true;
  return false;
}

export async function listFiles(root) {
  const found = [];
  async function walk(dir, relative) {
    const entries = await fs.readdir(dir, {withFileTypes:true});
    entries.sort((a,b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (!relative && ['.git','node_modules','dist'].includes(entry.name)) continue;
      const name = relative ? relative + '/' + entry.name : entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error('Symlink in source: ' + name);
      if (entry.isDirectory()) await walk(full, name);
      else if (entry.isFile()) found.push(name);
      else throw new Error('Unsupported source entry: ' + name);
    }
  }
  await walk(root, '');
  return found;
}

export function sourcePathFindings(files) {
  return files.filter(file => rawOrPrivateExt.test(file) || privateNames.test(file));
}

function scanJPEG(b, issues) {
  if (b.length < 4 || b[0] !== 255 || b[1] !== 216) {
    issues.push('invalid JPEG signature'); return;
  }
  let i = 2;
  while (i + 4 <= b.length) {
    if (b[i] !== 255) break;
    while (i < b.length && b[i] === 255) i++;
    const marker = b[i++];
    if (marker === 217 || marker === 218) break;
    if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
    if (i + 2 > b.length) { issues.push('truncated JPEG segment'); break; }
    const size = b.readUInt16BE(i);
    if (size < 2 || i + size > b.length) { issues.push('invalid JPEG segment length'); break; }
    const value = b.subarray(i+2, i+size);
    if (marker === 225) {
      const s = value.toString('latin1');
      if (s.startsWith('Exif\u0000\u0000')) issues.push('EXIF');
      if (/http:\/\/ns\.adobe\.com\/|<x:xmpmeta|<rdf:RDF/i.test(s)) issues.push('XMP');
    }
    if (marker === 237 && /Photoshop 3\.0|IPTC/i.test(value.toString('latin1'))) issues.push('IPTC/Photoshop');
    if (marker === 254 && /\b(?:GPS|DateTimeOriginal|CameraModel|DeviceSerial)\b/i.test(value.toString('latin1'))) issues.push('sensitive JPEG comment');
    i += size;
  }
}

function scanPNG(b, issues) {
  if (b.length < 8 || b.subarray(0,8).toString('hex') !== '89504e470d0a1a0a') {
    issues.push('invalid PNG signature'); return;
  }
  for (let i=8; i+12<=b.length;) {
    const size=b.readUInt32BE(i);
    if (i+12+size>b.length) { issues.push('truncated PNG chunk'); break; }
    const type=b.toString('ascii',i+4,i+8);
    if (['eXIf','iTXt','tEXt','zTXt'].includes(type)) issues.push('PNG metadata ' + type);
    i += 12+size;
    if (type==='IEND') break;
  }
}

function scanWebP(b, issues) {
  if (b.length<12 || b.toString('ascii',0,4)!=='RIFF' || b.toString('ascii',8,12)!=='WEBP') {
    issues.push('invalid WebP signature'); return;
  }
  for (let i=12; i+8<=b.length;) {
    const type=b.toString('ascii',i,i+4);
    const size=b.readUInt32LE(i+4);
    if (i+8+size>b.length) { issues.push('truncated WebP chunk'); break; }
    if (type==='EXIF' || type==='XMP ') issues.push('WebP ' + type.trim());
    if (type==='VP8X' && size>0 && (b[i+8] & 0x0c)!==0) issues.push('WebP metadata flags');
    i += 8+size+(size%2);
  }
}

export function mediaFindings(buffer, file) {
  if (!mediaExt.test(file)) return [];
  const issues=[];
  const data = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  if (/\.jpe?g$/i.test(file)) scanJPEG(data,issues);
  else if (/\.png$/i.test(file)) scanPNG(data,issues);
  else if (/\.webp$/i.test(file)) scanWebP(data,issues);
  return [...new Set(issues)];
}

export async function auditSource(root) {
  const files=await listFiles(root);
  const risky=sourcePathFindings(files);
  if (risky.length) throw new Error('Prohibited source file paths: ' + risky.join(', '));
  const published=files.filter(isPublicPath);
  const required=['CNAME','index.html','robots.txt','sitemap.xml','tracking.js',
    'archive/index.html','archive/archive.js','archive/archive-init.js',
    'privacy/index.html','terms/index.html','journeys/maldives-ithaafushi/index.html',
    'images/travel-amalfi-ferragosto.html'];
  for (const p of required) if (!published.includes(p)) throw new Error('Missing required public asset: ' + p);
  for (const file of files.filter(f=>mediaExt.test(f))) {
    const findings=mediaFindings(await fs.readFile(path.join(root,file)),file);
    if (findings.length) throw new Error('Media privacy validation failed: ' + file + ' (' + findings.join(', ') + ')');
  }
  return {files,published};
}

export async function buildPublic(root, output) {
  root=path.resolve(root);output=path.resolve(output);
  if (output===root || !output.startsWith(root + path.sep)) throw new Error('Output must be a child of source root');
  const {published}=await auditSource(root);
  await fs.rm(output,{recursive:true,force:true});
  for (const file of published) {
    const dest=path.join(output,file);
    await fs.mkdir(path.dirname(dest),{recursive:true});
    await fs.copyFile(path.join(root,file),dest);
  }
  return published;
}
