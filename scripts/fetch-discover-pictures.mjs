// Photos for the "Discover here" tips in the place popup (F-25). Runs in the "Data & Deploy" Action.
//
// Usage: node scripts/fetch-discover-pictures.mjs <cacheDir> <outDir>
//
// For each tip in site/data/discover.json, one photo from the English Wikipedia article of the place
// itself, only files on Wikimedia Commons with a free licence (author and licence go along). A tip may
// name a Commons file in "photo" to pick it by hand. The photos are resized here and served from our
// own site, so visitors' browsers never contact Wikimedia. Kept in the Action cache for 30 days.

import sharp from 'sharp';
import { mkdir, readFile, writeFile, copyFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { get, pictures } from './commons-pictures.mjs';

const [cacheDir = '.cache/live', outDir = 'site/data/live'] = process.argv.slice(2);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CITIES = JSON.parse(await readFile(join(root, 'site/data/discover.json'), 'utf8')).cities;
const dCache = join(cacheDir, 'discover'), dOut = join(outDir, 'discover');
await mkdir(dCache, { recursive: true });
await mkdir(dOut, { recursive: true });
const VERSION = 2, MAX_AGE = 30 * 864e5;
const exists = async (f) => { try { await stat(f); return true; } catch { return false; } };

// the article's own lead picture (its infobox photo) goes first; a title that is not found is looked up once
async function article(title) {
  try { const j = await get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`); return { title: j.titles?.canonical || title, lead: j.originalimage?.source }; }
  catch {
    const q = new URLSearchParams({ action: 'opensearch', format: 'json', limit: '1', redirects: 'resolve', search: title.replace(/_/g, ' ') });
    const hit = (await get('https://en.wikipedia.org/w/api.php?' + q))?.[1]?.[0];
    if (!hit) throw new Error('no article for ' + title);
    const j = await get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.replace(/ /g, '_'))}`);
    return { title: j.titles?.canonical || hit, lead: j.originalimage?.source };
  }
}
async function build(t) {
  const metaFile = join(dCache, `${t.id}.json`), prefer = t.photo ? [t.photo] : [];
  try {
    const old = JSON.parse(await readFile(metaFile, 'utf8'));
    const fresh = Date.now() - Date.parse(old.built) < (old.image ? MAX_AGE : 6 * 3600e3);
    if (old.v === VERSION && old.wiki === t.wiki && old.prefer === String(prefer) && fresh && (!old.image || await exists(join(dCache, old.image.src)))) return old;
  } catch {}
  const entry = { id: t.id, wiki: t.wiki, prefer: String(prefer), image: null, built: new Date().toISOString(), v: VERSION };
  try {
    const art = await article(t.wiki.replace(/ /g, '_'));
    entry.title = art.title;
    const lead = art.lead && /upload\.wikimedia\.org\/wikipedia\/commons\//.test(art.lead) ? decodeURIComponent(art.lead.split('/').pop()) : null;
    for (const pic of await pictures(art.title, 3, { prefer: [...prefer, ...(lead && !prefer.length ? [lead] : [])], photos: true })) {
      try {
        const buf = await get(pic.url, 'buf', 45000);
        const jpg = await sharp(buf).rotate().resize(720, 405, { fit: 'cover', position: 'attention' }).jpeg({ quality: 78, mozjpeg: true }).toBuffer();
        const src = `${t.id}.jpg`;
        await writeFile(join(dCache, src), jpg);
        entry.image = { src, file: pic.file, author: pic.author, license: pic.license, licenseUrl: pic.licenseUrl, page: pic.page };
        break;
      } catch (e) { console.log(`  tip ${t.id}: ${pic.file}: ${e.message}`); }
    }
  } catch (e) { console.log(`  tip ${t.id}: ${t.wiki}: ${e.message}`); }
  await writeFile(metaFile, JSON.stringify(entry));
  return entry;
}

const out = [];
let ok = 0, n = 0;
for (const c of CITIES) for (const t of c.tips) {
  n++;
  const e = await build(t);
  // the log lists every chosen file, so a reviewer can check that each photo shows the place
  console.log(`${e.image ? '✓' : '✗'} ${t.id} ${t.title}${e.title && e.title !== t.wiki.replace(/ /g, '_') ? ` [${e.title}]` : ''}: ${e.image ? `${e.image.file} · ${e.image.license} · ${e.image.author}` : 'no photo'}`);
  if (!e.image) continue;
  ok++;
  await copyFile(join(dCache, e.image.src), join(dOut, e.image.src));
  const { file, ...im } = e.image;
  out.push({ id: t.id, ...im, src: 'discover/' + im.src, ...(e.title ? { wiki: e.title } : {}) });
}
await writeFile(join(outDir, 'discover-pictures.json'), JSON.stringify({ generated: new Date().toISOString(), imageSource: 'Wikimedia Commons', items: out }, null, 1));
console.log(`${ok} of ${n} tips have a photo`);
// never fails the run: a tip without a photo is shown with text only
