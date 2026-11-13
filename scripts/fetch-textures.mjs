// Builds sharper Earth textures (8192×4096) for large screens from NASA GIBS.
// Runs in the "Data & Deploy" Action only when the Actions cache has no copy yet,
// so NASA is asked once, not every 15 minutes.
//
// Usage: node scripts/fetch-textures.mjs <cacheDir> <outDir>
// Output: earth-day-8k.jpg (Blue Marble Next Generation, topography and bathymetry)
//         earth-night-8k.jpg (VIIRS Black Marble 2016 city lights)
// The site keeps its 4k textures and only loads these where the GPU allows 8k textures.

import sharp from 'sharp';
import { mkdir, copyFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const [cacheDir = '.cache/textures', outDir = 'site/img/hi'] = process.argv.slice(2);
const W = 8192, H = 4096, TW = 4096, TH = 2048;
const UA = 'WorldInANutshell/0.1 (+https://github.com/uschweerlambers-art/World-in-a-Nutshell)';
const TEXTURES = [
  { file: 'earth-day-8k.jpg', layers: ['BlueMarble_NextGeneration', 'BlueMarble_ShadedRelief_Bathymetry'], quality: 86 },
  { file: 'earth-night-8k.jpg', layers: ['VIIRS_Black_Marble', 'VIIRS_CityLights_2012'], quality: 88 },
];

async function tile(layer, bbox) {
  const url = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?' + new URLSearchParams({
    SERVICE: 'WMS', REQUEST: 'GetMap', VERSION: '1.3.0', LAYERS: layer, STYLES: '',
    CRS: 'EPSG:4326', BBOX: bbox.join(','), WIDTH: TW, HEIGHT: TH, FORMAT: 'image/jpeg',
  });
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(120000) });
  const type = res.headers.get('content-type') || '';
  if (!res.ok || !type.startsWith('image/')) throw new Error(`${layer}: ${res.status} ${type}`);
  return Buffer.from(await res.arrayBuffer());
}

async function build(t) {
  let lastErr;
  for (const layer of t.layers) {
    try {
      // four quadrants, BBOX in lat,lon order for WMS 1.3.0 + EPSG:4326
      const quads = [
        { bbox: [0, -180, 90, 0], left: 0, top: 0 }, { bbox: [0, 0, 90, 180], left: TW, top: 0 },
        { bbox: [-90, -180, 0, 0], left: 0, top: TH }, { bbox: [-90, 0, 0, 180], left: TW, top: TH },
      ];
      const parts = [];
      for (const q of quads) parts.push({ input: await tile(layer, q.bbox), left: q.left, top: q.top });
      const img = await sharp({ create: { width: W, height: H, channels: 3, background: '#000' } })
        .composite(parts).jpeg({ quality: t.quality, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer();
      const st = await sharp(img).stats();
      const mean = st.channels.reduce((s, c) => s + c.mean, 0) / st.channels.length;
      if (mean < 3) throw new Error(`${layer}: image is black`);
      return { img, layer };
    } catch (e) { lastErr = e; console.warn(`  ${e.message}`); }
  }
  throw lastErr;
}

await mkdir(cacheDir, { recursive: true });
await mkdir(outDir, { recursive: true });
for (const t of TEXTURES) {
  const cached = join(cacheDir, t.file);
  let have = false;
  try { await stat(cached); have = true; } catch {}
  if (!have) {
    try {
      const { img, layer } = await build(t);
      await writeFile(cached, img); have = true;
      console.log(`✓ ${t.file}: ${layer}, ${(img.length / 1048576).toFixed(1)} MB`);
    } catch (e) { console.warn(`✗ ${t.file}: ${e.message} (site keeps 4k)`); }
  } else console.log(`· ${t.file}: cached`);
  if (have) await copyFile(cached, join(outDir, t.file));
}
