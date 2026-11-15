// BEHESHTI public deployment boundary. No dependencies, no deployment side effects.
// This module is also exercised by the pull-request security gate.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
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

// The only accepted legacy EXIF blobs are two unchanged, previously reviewed
// public JPEGs containing resolution/orientation/processing information, not
// GPS, device identity or capture timestamps. Any replacement with EXIF fails.
const legacySafeExifBlobs = new Map([
  ['images/travel-amalfi-positano-aerial.jpg','a88bb62f238301a069a900ab49e66d76b4bc1ba95a0dfa4b1320a042b180afba'],
  ['images/travel-amalfi-church-dusk.jpg','fe716c95ea57ea378785ad264915133ad3c298df876b999e709430a929aa9bf8']
]);
function blobHash(data) {
  return createHash('sha256').update(data).digest('hex');
}


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

// Inspect EXIF field names and directory pointers without logging actual values.
// A few historical public images carry non-location Apple HDR processing tags;
// safe image-rendering tags are tolerated, while private EXIF fields are rejected.
function inspectExif(payload, issues) {
  if (payload.subarray(0,6).toString('latin1')!=='Exif\u0000\u0000') return;
  const b=payload.subarray(6);
  try {
    const order=b.toString('ascii',0,2);
    if (!['II','MM'].includes(order)) throw new Error('invalid byte order');
    const little=order==='II';
    const u16=i=>{if(i<0||i+2>b.length)throw new Error('truncated EXIF field');return little?b.readUInt16LE(i):b.readUInt16BE(i);};
    const u32=i=>{if(i<0||i+4>b.length)throw new Error('truncated EXIF field');return little?b.readUInt32LE(i):b.readUInt32BE(i);};
    if(u16(2)!==42)throw new Error('invalid TIFF header');
    const sensitive=new Map([
      [0x010f,'camera make'],[0x0110,'camera model'],[0x0132,'capture timestamp'],
      [0x013b,'artist name'],[0x8298,'copyright attribution'],[0x9003,'capture timestamp'],
      [0x9004,'digitized timestamp'],[0x9010,'time offset'],[0x9011,'time offset'],
      [0x9012,'time offset'],[0x927c,'proprietary maker note'],
      [0x9290,'subsecond timestamp'],[0x9291,'subsecond timestamp'],[0x9292,'subsecond timestamp'],
      [0xa420,'image unique identifier'],[0xa430,'camera owner'],
      [0xa431,'body serial number'],[0xa432,'lens specification'],
      [0xa433,'lens make'],[0xa434,'lens model'],[0xa435,'lens serial number'],
      [0x9c9b,'personal title'],[0x9c9c,'personal comment'],[0x9c9d,'personal author'],
      [0x9c9e,'personal keywords'],[0x9c9f,'personal subject']
    ]);
    const seen=new Set(),pending=[u32(4)];
    while(pending.length){
      const offset=pending.pop();
      if(!offset||seen.has(offset))continue;
      seen.add(offset);
      if(seen.size>12)throw new Error('excessive EXIF directories');
      const count=u16(offset);
      if(count>256)throw new Error('oversized EXIF directory');
      for(let j=0;j<count;j++){
        const entry=offset+2+j*12;
        const tag=u16(entry);
        if(tag===0x8825)issues.push('GPS directory');
        if(sensitive.has(tag))issues.push('EXIF '+sensitive.get(tag));
        if(tag===0x8769){ const next=u32(entry+8);if(next)pending.push(next); }
      }
      const next=u32(offset+2+count*12);
      if(next)pending.push(next);
    }
  } catch {
    issues.push('unparseable EXIF');
  }
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
      const text = value.toString('latin1');
      if (text.startsWith('Exif\u0000\u0000')) { inspectExif(value,issues); issues.push('EXIF'); }
      if (/http:\/\/ns\.adobe\.com\/|<x:xmpmeta|<rdf:RDF/i.test(text)) issues.push('XMP');
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
  const found=[...new Set(issues)];
  if (found.length===1 && found[0]==='EXIF' && legacySafeExifBlobs.get(file)===blobHash(data)) return [];
  return found;
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
