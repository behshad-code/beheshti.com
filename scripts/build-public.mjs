// Prepare an owner-reviewed static preview only. This does not deploy.
import path from 'node:path';
import {buildPublic} from './publication.mjs';

const root = process.cwd();
const out = path.resolve(root,'dist');
const published = await buildPublic(root,out);
console.log('Public-only preview prepared: ' + published.length + ' files in dist/');
console.log('Not a GitHub Pages deployment. Publishing source must not be changed without approval.');
