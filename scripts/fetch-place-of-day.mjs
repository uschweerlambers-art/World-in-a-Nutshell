// Place of the day for the start screen (PRD F-16). Runs in the "Data & Deploy" Action.
//
// Usage: node scripts/fetch-place-of-day.mjs <cacheDir> <outDir>
//
// The place changes at midnight Berlin time and follows the order of scripts/places-of-the-day.json.
// The file always holds today and tomorrow, so an open page can switch at midnight on its own.
// Pictures come only from Wikimedia Commons (free licences), are resized here and served from
// our own site, so visitors' browsers never contact Wikimedia. Author and licence go with each picture.

import sharp from 'sharp';
import { mkdir, readFile, writeFile, copyFile, readdir, rm, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { get, pictures } from './commons-pictures.mjs';

const [cacheDir = '.cache/live', outDir = 'site/data/live'] = process.argv.slice(2);
const LIST = JSON.parse(await readFile(join(dirname(fileURLToPath(import.meta.url)), 'places-of-the-day.json'), 'utf8'));
const podCache = join(cacheDir, 'pod'), podOut = join(outDir, 'pod');
await mkdir(podCache, { recursive: true });
await mkdir(podOut, { recursive: true });
const MAX_PICS = 5, VERSION = 2; // bump VERSION to rebuild cached days after changing the picture rules

const berlinDate = (t) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(t);
const addDays = (ymd, n) => new Date(Date.parse(ymd + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10);
function placeFor(ymd) {
  const n = LIST.places.length, days = Math.round((Date.parse(ymd + 'T12:00:00Z') - Date.parse(LIST.start + 'T12:00:00Z')) / 864e5);
  return LIST.places[((days % n) + n) % n];
}
const exists = async (f) => { try { await stat(f); return true; } catch { return false; } };

async function build(ymd) {
  const metaFile = join(podCache, `${ymd}.json`);
  try {
    const old = JSON.parse(await readFile(metaFile, 'utf8'));
    const files = await Promise.all(old.images.map((im) => exists(join(podCache, im.src))));
    if (old.v === VERSION && old.complete && files.every(Boolean)) return old;
    if (old.v === VERSION && !old.complete && Date.now() - Date.parse(old.built) < 3600e3 && files.every(Boolean)) return old; // retry incomplete days hourly
  } catch {}
  const p = placeFor(ymd);
  const entry = { date: ymd, id: p.id, name: p.name, where: p.where, lat: p.lat, lon: p.lon, text: p.text, wiki: `https://en.wikipedia.org/wiki/${encodeURIComponent(p.wiki)}`, images: [], built: new Date().toISOString(), complete: false, v: VERSION };
  try {
    const pics = await pictures(p.wiki, MAX_PICS);
    let k = 0;
    for (const pic of pics) {
      try {
        const buf = await get(pic.url, 'buf', 45000);
        const jpg = await sharp(buf).rotate().resize(960, 600, { fit: 'cover', position: 'attention' }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
        const src = `${ymd}-${++k}.jpg`;
        await writeFile(join(podCache, src), jpg);
        entry.images.push({ src, author: pic.author, license: pic.license, licenseUrl: pic.licenseUrl, page: pic.page });
      } catch (e) { console.log(`  place of the day ${p.id}: ${pic.file}: ${e.message}`); }
    }
    entry.complete = entry.images.length >= Math.min(2, pics.length) && pics.length > 0;
  } catch (e) { console.log(`  place of the day ${p.id}: ${e.message}`); }
  await writeFile(metaFile, JSON.stringify(entry));
  console.log(`${entry.images.length ? '✓' : '✗'} place of the day ${ymd}: ${p.name}, ${entry.images.length} pictures`);
  return entry;
}

const today = berlinDate(new Date());
const days = [];
for (const ymd of [today, addDays(today, 1)]) days.push(await build(ymd));

// forget days before yesterday
for (const f of await readdir(podCache)) if (f.slice(0, 10) < addDays(today, -1)) await rm(join(podCache, f), { force: true });
for (const d of days) for (const im of d.images) await copyFile(join(podCache, im.src), join(podOut, im.src));
await writeFile(join(outDir, 'placeofday.json'), JSON.stringify({
  generated: new Date().toISOString(), timeZone: 'Europe/Berlin',
  imageSource: 'Wikimedia Commons', textNote: 'Short texts in our own words',
  days: days.map(({ built, complete, v, ...d }) => ({ ...d, images: d.images.map((im) => ({ ...im, src: 'pod/' + im.src })) })),
}, null, 1));
// never fails the run: without the file the start screen simply has no place of the day
