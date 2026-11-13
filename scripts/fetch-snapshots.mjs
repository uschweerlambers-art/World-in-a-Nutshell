// Fetches the data snapshots that the browser cannot (or should not) load directly.
// Runs inside the "Data & Deploy" GitHub Action. Node 20+, no dependencies.
//
// Usage: node scripts/fetch-snapshots.mjs <cacheDir> <outDir>
//   cacheDir  survives between runs (actions/cache), holds the last good file per source
//   outDir    becomes site/data/live/ in the deployed Pages artifact
//
// Every source is independent: if one fails, the last good snapshot is kept and
// meta.json records the error. The run itself only fails if nothing is usable.

import { mkdir, readFile, writeFile, stat, copyFile } from 'node:fs/promises';
import { join } from 'node:path';

const [cacheDir = '.cache/live', outDir = 'site/data/live'] = process.argv.slice(2);
const UA = 'WorldInANutshell/0.1 (+https://github.com/uschweerlambers-art/World-in-a-Nutshell)';
const MIN = 60 * 1000;

// maxAge: how old a cached snapshot may be before we fetch again (respects the providers' rules)
const SOURCES = {
  satellites: {
    maxAge: 120 * MIN, // CelesTrak asks for at most one download per group every 2 h
    async fetch() {
      const groups = ['stations', 'visual', 'weather', 'gnss']; // curated set, well under 2 000 objects (F-05.4)
      const seen = new Set();
      const sats = [];
      for (const g of groups) {
        const res = await get(`https://celestrak.org/NORAD/elements/gp.php?GROUP=${g}&FORMAT=json`);
        for (const s of await res.json()) {
          if (seen.has(s.NORAD_CAT_ID)) continue;
          seen.add(s.NORAD_CAT_ID);
          sats.push({ ...s, GROUP: g });
        }
      }
      if (!sats.length) throw new Error('CelesTrak returned no satellites');
      return { source: 'CelesTrak GP (OMM JSON)', sourceUrl: 'https://celestrak.org', count: sats.length, items: sats };
    },
  },
  radio: {
    maxAge: 24 * 60 * MIN, // daily is plenty, station lists change slowly
    async fetch() {
      const hosts = ['de1', 'de2', 'nl1', 'at1', 'fi1'];
      let lastErr;
      for (const h of hosts) {
        try {
          const url = `https://${h}.api.radio-browser.info/json/stations/search?has_geo_info=true&hidebroken=true&order=clickcount&reverse=true&limit=6000`;
          const list = await (await get(url)).json();
          // only https streams: the site runs on https and browsers block mixed content
          const rows = list
            .filter((s) => s.url_resolved?.startsWith('https://') && Number.isFinite(s.geo_lat) && Number.isFinite(s.geo_long))
            .map((s) => [s.stationuuid, s.name.trim(), +s.geo_lat.toFixed(3), +s.geo_long.toFixed(3), s.countrycode, s.url_resolved, s.homepage || '', s.codec, s.bitrate, s.tags.split(',').slice(0, 3).join(',')]);
          if (!rows.length) throw new Error('no stations');
          return { source: 'Radio Browser', sourceUrl: 'https://www.radio-browser.info', license: 'Public Domain (database)', fields: ['id', 'name', 'lat', 'lon', 'cc', 'stream', 'homepage', 'codec', 'kbps', 'tags'], count: rows.length, rows };
        } catch (e) { lastErr = e; }
      }
      throw lastErr;
    },
  },
  quakes: {
    maxAge: 5 * MIN, // fallback only: the browser loads USGS directly
    async fetch() {
      const geo = await (await get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson')).json();
      const rows = geo.features.map((f) => [f.id, f.properties.mag, f.geometry.coordinates[1], f.geometry.coordinates[0], f.geometry.coordinates[2], f.properties.time, f.properties.place, f.properties.url]);
      return { source: 'USGS Earthquake Hazards Program', sourceUrl: 'https://earthquake.usgs.gov', license: 'Public Domain', fields: ['id', 'mag', 'lat', 'lon', 'depthKm', 'time', 'place', 'url'], count: rows.length, rows };
    },
  },
  aircraft: {
    maxAge: 5 * MIN,
    async fetch() {
      // OpenSky anonymous: one global request costs 4 of 400 daily credits, so every 15 min fits.
      const j = await (await get('https://opensky-network.org/api/states/all', 45000)).json();
      const rows = (j.states || [])
        .filter((s) => s[5] != null && s[6] != null && !s[8]) // has position, not on ground
        .map((s) => [s[0], (s[1] || '').trim(), +s[6].toFixed(3), +s[5].toFixed(3), Math.round(s[13] ?? s[7] ?? 0), Math.round(s[10] ?? 0), Math.round(s[9] ?? 0), s[2], s[11] == null ? null : +s[11].toFixed(1), s[14] || null]);
      if (!rows.length) throw new Error('OpenSky returned no aircraft');
      return { source: 'The OpenSky Network', sourceUrl: 'https://opensky-network.org', license: 'OpenSky terms (non-commercial)', time: j.time, fields: ['icao24', 'callsign', 'lat', 'lon', 'altM', 'heading', 'speedMs', 'country', 'vRateMs', 'squawk'], count: rows.length, rows };
    },
  },
  satcat: {
    maxAge: 24 * 60 * MIN, // owner, launch date and site change rarely
    async fetch() {
      const seen = new Set(), rows = [];
      for (const g of ['stations', 'visual', 'weather', 'gnss']) {
        const list = await (await get(`https://celestrak.org/satcat/records.php?GROUP=${g}&FORMAT=json`)).json();
        for (const s of list) {
          if (seen.has(s.NORAD_CAT_ID)) continue;
          seen.add(s.NORAD_CAT_ID);
          rows.push([s.NORAD_CAT_ID, s.OWNER || '', s.LAUNCH_DATE || '', s.LAUNCH_SITE || '', s.OBJECT_TYPE || '', s.OPS_STATUS_CODE || '', s.RCS ?? null]);
        }
      }
      if (!rows.length) throw new Error('SATCAT returned nothing');
      return { source: 'CelesTrak SATCAT', sourceUrl: 'https://celestrak.org/satcat/', fields: ['norad', 'owner', 'launchDate', 'launchSite', 'type', 'status', 'rcsM2'], count: rows.length, rows };
    },
  },
  events: {
    maxAge: 60 * MIN, // NASA EONET: wildfires, storms, volcanoes, ice, floods … still open
    async fetch() {
      const j = await (await get('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=60', 60000)).json();
      const centroid = (ring) => { let x = 0, y = 0; for (const c of ring) { x += c[0]; y += c[1]; } return [x / ring.length, y / ring.length]; };
      const rows = [];
      for (const e of j.events || []) {
        const cat = e.categories?.[0]?.id;
        if (!cat || cat === 'earthquakes') continue; // USGS layer covers those
        const pts = (e.geometry || []).map((g) => {
          const c = g.type === 'Point' ? g.coordinates : centroid(g.coordinates?.[0] || []);
          return [+(+c[0]).toFixed(3), +(+c[1]).toFixed(3), Date.parse(g.date), g.magnitudeValue ?? null];
        }).filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]));
        if (!pts.length) continue;
        pts.sort((a, b) => a[2] - b[2]);
        const unit = (e.geometry || []).find((g) => g.magnitudeUnit)?.magnitudeUnit || '';
        rows.push([e.id, e.title, cat, e.sources?.[0]?.url || e.link || '', unit, pts]);
      }
      return { source: 'NASA EONET', sourceUrl: 'https://eonet.gsfc.nasa.gov', license: 'Public Domain (NASA)', fields: ['id', 'title', 'category', 'url', 'magnitudeUnit', 'points[lon,lat,time,magnitude]'], count: rows.length, rows };
    },
  },
  volcanoes: {
    maxAge: 7 * 24 * 60 * MIN, // the Holocene volcano list changes a few times a year
    async fetch() {
      const url = 'https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=GVP-VOTW:Smithsonian_VOTW_Holocene_Volcanoes&outputFormat=application%2Fjson';
      const j = await (await get(url, 90000)).json();
      const pick = (o, ...keys) => { for (const k of keys) { const hit = Object.keys(o).find((x) => x.toLowerCase() === k.toLowerCase()); if (hit && o[hit] != null && o[hit] !== '') return o[hit]; } return null; };
      const rows = (j.features || []).map((f) => {
        const p = f.properties || {}, c = f.geometry?.coordinates || [];
        const lat = +(pick(p, 'Latitude') ?? c[1]), lon = +(pick(p, 'Longitude') ?? c[0]);
        return [pick(p, 'Volcano_Number', 'VolcanoNumber'), pick(p, 'Volcano_Name', 'VolcanoName'), pick(p, 'Country'), pick(p, 'Primary_Volcano_Type', 'PrimaryVolcanoType'), pick(p, 'Last_Eruption_Year', 'LastEruptionYear'), pick(p, 'Elevation'), +lat.toFixed(3), +lon.toFixed(3)];
      }).filter((r) => r[1] && Number.isFinite(r[6]) && Number.isFinite(r[7]));
      if (rows.length < 500) throw new Error(`only ${rows.length} volcanoes (keys: ${Object.keys(j.features?.[0]?.properties || {}).join(',')})`);
      return { source: 'Smithsonian Global Volcanism Program, Volcanoes of the World', sourceUrl: 'https://volcano.si.edu', license: 'Free use with citation (Global Volcanism Program, Smithsonian Institution)', fields: ['number', 'name', 'country', 'type', 'lastEruption', 'elevationM', 'lat', 'lon'], count: rows.length, rows };
    },
  },
};

async function get(url, timeout = 30000) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(timeout) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${new URL(url).host}`);
  return res;
}

async function exists(file) {
  try { await stat(file); return true; } catch { return false; }
}

await mkdir(cacheDir, { recursive: true });
await mkdir(outDir, { recursive: true });

let previousMeta = {};
try { previousMeta = JSON.parse(await readFile(join(cacheDir, 'meta.json'), 'utf8')); } catch {}

const meta = { generated: new Date().toISOString(), sources: {} };
let usable = 0;

for (const [name, src] of Object.entries(SOURCES)) {
  const cached = join(cacheDir, `${name}.json`);
  const prev = previousMeta.sources?.[name] || {};
  // age comes from meta.json, file mtimes are not reliable after a cache restore
  const age = (await exists(cached)) && prev.fetched ? Date.now() - Date.parse(prev.fetched) : Infinity;
  const entry = { ...prev };
  if (age >= src.maxAge) {
    try {
      const data = await src.fetch();
      data.fetched = new Date().toISOString();
      await writeFile(cached, JSON.stringify(data));
      Object.assign(entry, { status: 'ok', fetched: data.fetched, count: data.count, error: null });
      console.log(`✓ ${name}: ${data.count} items`);
    } catch (e) {
      Object.assign(entry, { status: age === Infinity ? 'missing' : 'stale', error: String(e.message || e) });
      console.warn(`✗ ${name}: ${entry.error}${age === Infinity ? '' : ' (keeping last snapshot)'}`);
    }
  } else {
    console.log(`· ${name}: cached, ${Math.round(age / MIN)} min old`);
  }
  if (await exists(cached)) {
    await copyFile(cached, join(outDir, `${name}.json`));
    usable++;
  }
  meta.sources[name] = entry;
}

await writeFile(join(cacheDir, 'meta.json'), JSON.stringify(meta));
await writeFile(join(outDir, 'meta.json'), JSON.stringify(meta, null, 1));
if (!usable) { console.error('No snapshot could be produced.'); process.exit(1); }
