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

const [cacheDir = '.cache/live', outDir = 'site/data/live'] = process.argv.slice(2);
const UA = 'WorldInANutshell/0.1 (+https://github.com/uschweerlambers-art/World-in-a-Nutshell)';
const LIST = JSON.parse(await readFile(join(dirname(fileURLToPath(import.meta.url)), 'places-of-the-day.json'), 'utf8'));
const podCache = join(cacheDir, 'pod'), podOut = join(outDir, 'pod');
await mkdir(podCache, { recursive: true });
await mkdir(podOut, { recursive: true });
const MAX_PICS = 5;

const berlinDate = (t) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(t);
const addDays = (ymd, n) => new Date(Date.parse(ymd + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10);
function placeFor(ymd) {
  const n = LIST.places.length, days = Math.round((Date.parse(ymd + 'T12:00:00Z') - Date.parse(LIST.start + 'T12:00:00Z')) / 864e5);
  return LIST.places[((days % n) + n) % n];
}
async function get(url, as = 'json', timeout = 30000) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Api-User-Agent': UA }, signal: AbortSignal.timeout(timeout) });
  if (!res.ok) throw new Error(`${res.status} for ${new URL(url).host}`);
  return as === 'json' ? res.json() : Buffer.from(await res.arrayBuffer());
}
const exists = async (f) => { try { await stat(f); return true; } catch { return false; } };
const plain = (html) => String(html || '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const SKIP = /\.svg$|map|locator|location|flag|coat[_ ]of[_ ]arms|logo|icon|diagram|plan\b|seal|signature|chart|graph|stamp|banknote|coin/i;

async function pictures(wiki) {
  // files in article order (lead image first)
  const ml = await get(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(wiki)}`);
  const files = [...new Set((ml.items || []).filter((it) => it.type === 'image' && it.title).map((it) => it.title.replace(/^File:/, '')))]
    .filter((f) => /\.(jpe?g|png|webp|tiff?)$/i.test(f) && !SKIP.test(f)).slice(0, 16);
  if (!files.length) return [];
  // only files hosted on Wikimedia Commons, which only takes freely licensed works
  const q = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', prop: 'imageinfo', iiprop: 'url|size|extmetadata', iiurlwidth: '1280', titles: files.map((f) => 'File:' + f).join('|') });
  const j = await get('https://commons.wikimedia.org/w/api.php?' + q);
  const byTitle = new Map((j.query?.pages || []).map((p) => [p.title.replace(/^File:/, '').replace(/ /g, '_'), p]));
  const out = [];
  for (const f of files) {
    const p = byTitle.get(f.replace(/ /g, '_')); const ii = p?.imageinfo?.[0];
    if (!p || p.missing || !ii?.thumburl) continue;
    const m = ii.extmetadata || {}, lic = plain(m.LicenseShortName?.value);
    if (m.NonFree?.value || !/^(cc|public domain|pd|cc0|attribution|no restrictions)/i.test(lic)) continue;
    if (ii.width < 800 || ii.width / ii.height < 1.05) continue; // landscape pictures only, they fit the slider
    out.push({ file: f, url: ii.thumburl, author: plain(m.Artist?.value).slice(0, 90) || 'Unknown author', license: lic, licenseUrl: m.LicenseUrl?.value || '', page: ii.descriptionurl });
    if (out.length >= MAX_PICS) break;
  }
  return out;
}

async function build(ymd) {
  const metaFile = join(podCache, `${ymd}.json`);
  try {
    const old = JSON.parse(await readFile(metaFile, 'utf8'));
    const files = await Promise.all(old.images.map((im) => exists(join(podCache, im.src))));
    if (old.complete && files.every(Boolean)) return old;
    if (!old.complete && Date.now() - Date.parse(old.built) < 3600e3 && files.every(Boolean)) return old; // retry incomplete days hourly
  } catch {}
  const p = placeFor(ymd);
  const entry = { date: ymd, id: p.id, name: p.name, where: p.where, lat: p.lat, lon: p.lon, text: p.text, wiki: `https://en.wikipedia.org/wiki/${encodeURIComponent(p.wiki)}`, images: [], built: new Date().toISOString(), complete: false };
  try {
    const pics = await pictures(p.wiki);
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
  days: days.map(({ built, complete, ...d }) => ({ ...d, images: d.images.map((im) => ({ ...im, src: 'pod/' + im.src })) })),
}, null, 1));
// never fails the run: without the file the start screen simply has no place of the day
