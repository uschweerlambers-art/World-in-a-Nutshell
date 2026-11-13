// Builds a global cloud layer from NASA GIBS daily satellite imagery (PRD F-03.4).
// Runs in the "Data & Deploy" Action, at most every 3 hours.
//
// Usage: node scripts/fetch-clouds.mjs <cacheDir> <outDir> [--from <dir>]
//   --from <dir>  read local test images instead of fetching (name: <date>_<layer>.jpg)
//
// How: true-colour mosaics of four polar orbiters (MODIS Terra/Aqua, VIIRS SNPP/NOAA-20)
// are turned into a cloud mask (bright and grey = cloud, colourful or dark = ground).
// Today's passes win where they have data, yesterday's fill the gaps.
// Output: clouds.jpg (grey = cloud cover, 2048×1024 equirectangular) + clouds.json.

import sharp from 'sharp';
import { mkdir, readFile, writeFile, copyFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const args = process.argv.slice(2);
const fromIdx = args.indexOf('--from');
const fromDir = fromIdx >= 0 ? args.splice(fromIdx, 2)[1] : null;
const [cacheDir = '.cache/live', outDir = 'site/data/live'] = args;
const W = 2048, H = 1024;
const MAX_AGE_MS = 3 * 3600 * 1000;
const LAYERS = [
  'VIIRS_NOAA20_CorrectedReflectance_TrueColor',
  'VIIRS_SNPP_CorrectedReflectance_TrueColor',
  'MODIS_Aqua_CorrectedReflectance_TrueColor',
  'MODIS_Terra_CorrectedReflectance_TrueColor',
];
const UA = 'WorldInANutshell/0.1 (+https://github.com/uschweerlambers-art/World-in-a-Nutshell)';

const day = (offset) => new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10);

async function image(date, layer) {
  if (fromDir) return readFile(join(fromDir, `${date}_${layer}.jpg`));
  const url = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?' + new URLSearchParams({
    SERVICE: 'WMS', REQUEST: 'GetMap', VERSION: '1.3.0', LAYERS: layer, STYLES: '',
    CRS: 'EPSG:4326', BBOX: '-90,-180,90,180', WIDTH: W, HEIGHT: H, FORMAT: 'image/jpeg', TIME: date,
  });
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`${res.status} for ${layer} ${date}`);
  const type = res.headers.get('content-type') || '';
  if (!type.startsWith('image/')) throw new Error(`no image for ${layer} ${date} (${type})`);
  return Buffer.from(await res.arrayBuffer());
}

// cloud value 0..255 per pixel, or -1 where the satellite has no data
export function cloudMask(rgb) {
  const n = W * H, out = new Int16Array(n);
  for (let i = 0; i < n; i++) {
    const r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx < 12) { out[i] = -1; continue; } // black = outside the swath
    const bright = Math.min(1, Math.max(0, (mn - 95) / 115)); // white-ish
    const grey = Math.min(1, Math.max(0, 1 - (mx - mn - 22) / 38)); // low saturation
    out[i] = Math.round(255 * bright * grey);
  }
  return out;
}

async function build() {
  const days = [day(0), day(1)];
  const used = [];
  const result = new Int16Array(W * H).fill(-1);
  for (const date of days) {
    const todayMask = new Int16Array(W * H).fill(-1);
    let any = false;
    for (const layer of LAYERS) {
      try {
        const { data } = await sharp(await image(date, layer)).resize(W, H, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
        const m = cloudMask(data);
        for (let i = 0; i < m.length; i++) if (m[i] > todayMask[i]) todayMask[i] = m[i];
        used.push(`${layer.split('_').slice(0, 2).join(' ')} ${date}`);
        any = true;
      } catch (e) { console.warn(`  skip ${layer} ${date}: ${e.message}`); }
    }
    if (!any) continue;
    for (let i = 0; i < result.length; i++) if (result[i] < 0 && todayMask[i] >= 0) result[i] = todayMask[i];
  }
  if (!used.length) throw new Error('no GIBS imagery available');
  // ice sheets, snow and salt flats look like clouds: damp everything that is
  // already bright in the cloud-free Blue Marble mosaic
  try {
    const { data } = await sharp(new URL('../site/img/earth-blue-marble.jpg', import.meta.url).pathname).resize(W, H, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const ground = cloudMask(data);
    for (let i = 0; i < result.length; i++) if (result[i] > 0 && ground[i] > 0) result[i] = Math.round(result[i] * (1 - 0.9 * ground[i] / 255));
  } catch (e) { console.warn(`  no ground mask: ${e.message}`); }
  const covered = result.reduce((s, v) => s + (v >= 0 ? 1 : 0), 0) / result.length;
  const cloudy = result.reduce((s, v) => s + (v > 128 ? 1 : 0), 0) / Math.max(1, result.reduce((s, v) => s + (v >= 0 ? 1 : 0), 0));
  const grey = Buffer.alloc(W * H);
  for (let i = 0; i < grey.length; i++) grey[i] = Math.max(0, result[i]);
  const png = await sharp(grey, { raw: { width: W, height: H, channels: 1 } }).blur(1.2).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return { png, meta: { source: 'NASA GIBS (EOSDIS), corrected reflectance', sourceUrl: 'https://www.earthdata.nasa.gov/gibs', license: 'NASA imagery, no copyright', date: days[0], used, coverage: +covered.toFixed(3), cloudy: +cloudy.toFixed(3), fetched: new Date().toISOString() } };
}

await mkdir(cacheDir, { recursive: true });
await mkdir(outDir, { recursive: true });
const cPng = join(cacheDir, 'clouds.jpg'), cJson = join(cacheDir, 'clouds.json');
let prev = null;
try { prev = JSON.parse(await readFile(cJson, 'utf8')); await stat(cPng); } catch { prev = null; }

if (!prev || Date.now() - Date.parse(prev.fetched) > MAX_AGE_MS || fromDir) {
  try {
    const { png, meta } = await build();
    await writeFile(cPng, png); await writeFile(cJson, JSON.stringify(meta));
    prev = meta;
    console.log(`✓ clouds: ${meta.used.length} passes, ${(meta.coverage * 100).toFixed(0)} % covered, ${(meta.cloudy * 100).toFixed(0)} % cloudy, ${(png.length / 1024).toFixed(0)} KB`);
  } catch (e) {
    console.warn(`✗ clouds: ${e.message}${prev ? ' (keeping last image)' : ''}`);
  }
} else {
  console.log(`· clouds: cached, ${Math.round((Date.now() - Date.parse(prev.fetched)) / 60000)} min old`);
}
if (prev) { await copyFile(cPng, join(outDir, 'clouds.jpg')); await copyFile(cJson, join(outDir, 'clouds.json')); }
// never fails the run: the site falls back to its placeholder clouds
