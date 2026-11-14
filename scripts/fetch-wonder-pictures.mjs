// Pictures for the "Wonders & records" cards. Runs in the "Data & Deploy" Action.
//
// Usage: node scripts/fetch-wonder-pictures.mjs <cacheDir> <outDir>
//
// For each wonder in site/data/wonders.json, up to three pictures from its English Wikipedia article,
// only files on Wikimedia Commons with a free licence. They are resized here and served from our
// own site, so visitors' browsers never contact Wikimedia. Author and licence go with each picture.
// The pictures are kept in the Action cache and fetched again only after 30 days or when the list changes.

import sharp from 'sharp';
import { mkdir, readFile, writeFile, copyFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { get, pictures } from './commons-pictures.mjs';

const [cacheDir = '.cache/live', outDir = 'site/data/live'] = process.argv.slice(2);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const WONDERS = JSON.parse(await readFile(join(root, 'site/data/wonders.json'), 'utf8')).items;
const wCache = join(cacheDir, 'wonders'), wOut = join(outDir, 'wonders');
await mkdir(wCache, { recursive: true });
await mkdir(wOut, { recursive: true });
const MAX_PICS = 3, VERSION = 1, MAX_AGE = 30 * 864e5;
const exists = async (f) => { try { await stat(f); return true; } catch { return false; } };

async function build(w) {
  const wiki = decodeURIComponent(new URL(w.wiki).pathname.split('/').pop());
  const metaFile = join(wCache, `${w.id}.json`);
  try {
    const old = JSON.parse(await readFile(metaFile, 'utf8'));
    const files = await Promise.all(old.images.map((im) => exists(join(wCache, im.src))));
    const fresh = Date.now() - Date.parse(old.built) < (old.images.length ? MAX_AGE : 6 * 3600e3);
    if (old.v === VERSION && old.wiki === wiki && fresh && files.every(Boolean)) return old;
  } catch {}
  const entry = { id: w.id, wiki, images: [], built: new Date().toISOString(), v: VERSION };
  try {
    let k = 0;
    for (const pic of await pictures(wiki, MAX_PICS)) {
      try {
        const buf = await get(pic.url, 'buf', 45000);
        const jpg = await sharp(buf).rotate().resize(840, 472, { fit: 'cover', position: 'attention' }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
        const src = `${w.id}-${++k}.jpg`;
        await writeFile(join(wCache, src), jpg);
        entry.images.push({ src, author: pic.author, license: pic.license, licenseUrl: pic.licenseUrl, page: pic.page });
      } catch (e) { console.log(`  wonder ${w.id}: ${pic.file}: ${e.message}`); }
    }
  } catch (e) { console.log(`  wonder ${w.id}: ${e.message}`); }
  await writeFile(metaFile, JSON.stringify(entry));
  console.log(`${entry.images.length ? '✓' : '✗'} wonder ${w.id}: ${entry.images.length} pictures`);
  return entry;
}

const out = [];
for (const w of WONDERS) {
  const e = await build(w);
  for (const im of e.images) await copyFile(join(wCache, im.src), join(wOut, im.src));
  out.push({ id: e.id, images: e.images.map((im) => ({ ...im, src: 'wonders/' + im.src })) });
}
await writeFile(join(outDir, 'wonders-pictures.json'), JSON.stringify({ generated: new Date().toISOString(), imageSource: 'Wikimedia Commons', items: out }, null, 1));
// never fails the run: without the file the cards simply have no pictures
