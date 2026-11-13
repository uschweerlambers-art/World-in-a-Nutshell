// Weather maps for the globe (PRD F-14). Runs in the "Data & Deploy" Action.
//
// Usage: node scripts/fetch-weather.mjs <cacheDir> <outDir>
//
// wind.bin + weather.json  GFS 1° 10 m wind (NOAA NOMADS), Int8 u then v in 0.5 m/s, 360×181, lat 90…-90, lon -180…179
// temp.jpg                 GFS 2 m temperature as a colour map (1024×512 equirectangular)
// rain.png                 NASA GIBS IMERG precipitation rate (satellite, ~5 h delay), transparent where dry
// aerosol.png              NASA GIBS aerosol optical depth (daily), haze, smoke and dust
// GFS needs a GRIB2 decoder: the script installs eccodes on the runner when it is missing.
// Every part is optional: on failure the last good file is kept and the site hides that layer.

import sharp from 'sharp';
import { mkdir, readFile, writeFile, copyFile, stat, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const [cacheDir = '.cache/live', outDir = 'site/data/live'] = process.argv.slice(2);
const UA = 'WorldInANutshell/0.1 (+https://github.com/uschweerlambers-art/World-in-a-Nutshell)';
const H = 3600 * 1000;
const metaFile = join(cacheDir, 'weather.json');
let meta = {};
try { meta = JSON.parse(await readFile(metaFile, 'utf8')); } catch {}
await mkdir(cacheDir, { recursive: true });
await mkdir(outDir, { recursive: true });

async function get(url, timeout = 90000) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(timeout) });
  if (!res.ok) throw new Error(`${res.status} for ${new URL(url).host}`);
  return Buffer.from(await res.arrayBuffer());
}
const exists = async f => { try { await stat(f); return true; } catch { return false; } };
const stale = (key, maxAge) => !meta[key]?.fetched || Date.now() - Date.parse(meta[key].fetched) > maxAge;
const ymd = d => d.toISOString().slice(0, 10).replace(/-/g, '');

/* ---------- GFS: wind and temperature ---------- */
function decoder() {
  try { execFileSync('grib_get_data', ['-V'], { stdio: 'ignore' }); return; } catch {}
  console.log('  installing eccodes …');
  execFileSync('sudo', ['apt-get', 'install', '-y', '-qq', 'libeccodes-tools'], { stdio: 'ignore', timeout: 240000 });
}
function field(file, shortName) {
  const txt = execFileSync('grib_get_data', ['-w', `shortName=${shortName}`, file], { maxBuffer: 64 * 1024 * 1024 }).toString();
  const out = new Float32Array(360 * 181).fill(NaN);
  for (const line of txt.split('\n')) {
    const p = line.trim().split(/\s+/); if (p.length < 3) continue;
    const lat = +p[0], lon = +p[1], v = +p[2]; if (!Number.isFinite(lat) || !Number.isFinite(v)) continue;
    const row = Math.round(90 - lat), col = (Math.round(lon) + 180 + 360) % 360; // shift to lon -180…179
    if (row >= 0 && row < 181) out[row * 360 + col] = v;
  }
  if (out.some(Number.isNaN)) throw new Error(`incomplete field ${shortName}`);
  return out;
}
// temperature colours (°C) for the map and the legend
const TEMP_STOPS = [[-45, [112, 40, 160]], [-30, [60, 70, 200]], [-15, [40, 140, 230]], [0, [170, 225, 245]], [10, [120, 210, 120]], [20, [245, 220, 80]], [30, [245, 130, 40]], [40, [200, 30, 40]], [50, [120, 10, 30]]];
function tempColour(c) {
  if (c <= TEMP_STOPS[0][0]) return TEMP_STOPS[0][1];
  for (let i = 1; i < TEMP_STOPS.length; i++) {
    const [t1, c1] = TEMP_STOPS[i]; const [t0, c0] = TEMP_STOPS[i - 1];
    if (c <= t1) { const f = (c - t0) / (t1 - t0); return c0.map((x, k) => Math.round(x + (c1[k] - x) * f)); }
  }
  return TEMP_STOPS.at(-1)[1];
}
async function gfs() {
  // newest cycle that is complete: cycles every 6 h, available about 4 h later
  const now = Date.now();
  for (let back = 4; back <= 22; back += 6) {
    const t = new Date(now - back * H), cyc = Math.floor(t.getUTCHours() / 6) * 6;
    const cycTime = Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate(), cyc);
    const fh = Math.min(12, Math.max(0, Math.round((now - cycTime) / (3 * H)) * 3)); // forecast hour closest to now
    const hh = String(cyc).padStart(2, '0'), f = String(fh).padStart(3, '0');
    const url = `https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_1p00.pl?dir=%2Fgfs.${ymd(t)}%2F${hh}%2Fatmos&file=gfs.t${hh}z.pgrb2.1p00.f${f}&var_UGRD=on&var_VGRD=on&var_TMP=on&lev_10_m_above_ground=on&lev_2_m_above_ground=on`;
    let buf;
    try { buf = await get(url); } catch (e) { console.log(`  GFS ${ymd(t)} ${hh}z f${f}: ${e.message}`); continue; }
    if (buf.length < 50000 || buf.subarray(0, 4).toString() !== 'GRIB') { console.log(`  GFS ${ymd(t)} ${hh}z f${f}: not ready`); continue; }
    decoder();
    const tmp = join(cacheDir, 'gfs.grb2'); await writeFile(tmp, buf);
    const u = field(tmp, '10u'), v = field(tmp, '10v'), t2 = field(tmp, '2t');
    await rm(tmp, { force: true });
    const bin = new Int8Array(360 * 181 * 2);
    for (let i = 0; i < u.length; i++) { bin[i] = Math.max(-127, Math.min(127, Math.round(u[i] * 2))); bin[u.length + i] = Math.max(-127, Math.min(127, Math.round(v[i] * 2))); }
    await writeFile(join(cacheDir, 'wind.bin'), Buffer.from(bin.buffer));
    const rgb = Buffer.alloc(360 * 181 * 3);
    for (let i = 0; i < t2.length; i++) rgb.set(tempColour(t2[i] - 273.15), i * 3);
    const jpg = await sharp(rgb, { raw: { width: 360, height: 181, channels: 3 } }).resize(1024, 512, { kernel: 'cubic' }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    await writeFile(join(cacheDir, 'temp.jpg'), jpg);
    const valid = new Date(cycTime + fh * H).toISOString();
    meta.gfs = { fetched: new Date().toISOString(), valid, cycle: `${ymd(t)} ${hh}z +${fh} h`, source: 'NOAA GFS 1° (NOMADS)', license: 'Public Domain (US government)', tempStops: TEMP_STOPS };
    console.log(`✓ GFS ${ymd(t)} ${hh}z +${fh} h: wind ${(bin.length / 1024).toFixed(0)} KB, temperature ${(jpg.length / 1024).toFixed(0)} KB`);
    return;
  }
  throw new Error('no GFS cycle available');
}

/* ---------- NASA GIBS overlays ---------- */
const gibs = (layer, time, w, h, fmt = 'image/png') => 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?' + new URLSearchParams({
  SERVICE: 'WMS', REQUEST: 'GetMap', VERSION: '1.3.0', LAYERS: layer, STYLES: '', CRS: 'EPSG:4326', BBOX: '-90,-180,90,180', WIDTH: w, HEIGHT: h, FORMAT: fmt, TRANSPARENT: 'TRUE', TIME: time,
});
async function covered(png) { const { channels } = await sharp(png).stats(); return channels[3] ? channels[3].mean / 255 : 1; }
async function rain() {
  // IMERG early run, half-hourly; step back until a slot with data shows up
  const slot = 30 * 60 * 1000;
  for (let back = 4 * H; back <= 14 * H; back += slot) {
    const t = new Date(Math.floor((Date.now() - back) / slot) * slot), time = t.toISOString().slice(0, 19) + 'Z';
    let png;
    try { png = await get(gibs('IMERG_Precipitation_Rate', time, 2048, 1024)); } catch (e) { console.log(`  rain ${time}: ${e.message}`); continue; }
    const cov = await covered(png);
    if (cov < 0.01) continue; // empty slot, not processed yet
    const out = await sharp(png).png({ compressionLevel: 9, palette: true }).toBuffer();
    await writeFile(join(cacheDir, 'rain.png'), out);
    meta.rain = { fetched: new Date().toISOString(), valid: time, source: 'NASA GIBS, GPM IMERG precipitation rate (early run)', license: 'Public Domain (NASA)', coverage: +cov.toFixed(3) };
    console.log(`✓ rain ${time}: ${(cov * 100).toFixed(1)} % with rain, ${(out.length / 1024).toFixed(0)} KB`);
    return;
  }
  throw new Error('no IMERG slot with data in the last 14 h');
}
async function aerosol() {
  const layers = ['MODIS_Combined_Value_Added_AOD', 'MODIS_Terra_Aerosol_Optical_Depth_3km', 'MODIS_Aqua_Aerosol_Optical_Depth_3km', 'VIIRS_NOAA20_Aerosol_Optical_Thickness_Deep_Blue_Over_Land', 'MODIS_Terra_Aerosol'];
  for (const days of [1, 2]) {
    const date = new Date(Date.now() - days * 24 * H).toISOString().slice(0, 10);
    for (const layer of layers) {
      let png;
      try { png = await get(gibs(layer, date, 2048, 1024)); } catch (e) { console.log(`  aerosol ${layer} ${date}: ${e.message}`); continue; }
      const cov = await covered(png);
      if (cov < 0.05) { console.log(`  aerosol ${layer} ${date}: ${(cov * 100).toFixed(1)} % covered`); continue; }
      const out = await sharp(png).png({ compressionLevel: 9, palette: true }).toBuffer();
      await writeFile(join(cacheDir, 'aerosol.png'), out);
      meta.aerosol = { fetched: new Date().toISOString(), valid: date, layer, source: `NASA GIBS, ${layer.replace(/_/g, ' ')}`, license: 'Public Domain (NASA)', coverage: +cov.toFixed(3) };
      console.log(`✓ aerosol ${layer} ${date}: ${(cov * 100).toFixed(0)} % covered, ${(out.length / 1024).toFixed(0)} KB`);
      return;
    }
  }
  throw new Error('no aerosol layer with data');
}

for (const [key, maxAge, run] of [['gfs', 3 * H, gfs], ['rain', 1 * H, rain], ['aerosol', 6 * H, aerosol]]) {
  if (!stale(key, maxAge)) { console.log(`· ${key}: cached, ${Math.round((Date.now() - Date.parse(meta[key].fetched)) / 60000)} min old`); continue; }
  try { await run(); } catch (e) { console.warn(`✗ ${key}: ${e.message}${meta[key] ? ' (keeping last)' : ''}`); }
}
await writeFile(metaFile, JSON.stringify(meta));
for (const f of ['wind.bin', 'temp.jpg', 'rain.png', 'aerosol.png']) if (await exists(join(cacheDir, f))) await copyFile(join(cacheDir, f), join(outDir, f));
await writeFile(join(outDir, 'weather.json'), JSON.stringify(meta, null, 1));
// never fails the run: the site hides weather layers it has no file for
