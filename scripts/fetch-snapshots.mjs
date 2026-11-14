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
  volcanoWeek: {
    maxAge: 12 * 60 * MIN, // the Weekly Volcanic Activity Report comes out on Wednesdays
    async fetch() {
      const xml = await (await get('https://volcano.si.edu/news/WeeklyVolcanoRSS.xml', 60000, 'application/rss+xml, application/xml, text/xml, */*')).text();
      const tag = (block, t) => (block.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)) || [])[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() || '';
      const rows = [];
      for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
        const title = tag(m[1], 'title'), link = tag(m[1], 'link'), date = tag(m[1], 'pubDate');
        const vn = (link.match(/(?:vn=|-)(\d{6})\b/) || tag(m[1], 'description').match(/vn=(\d{6})/) || [])[1] || null;
        const name = title.split(/\s*\(/)[0].trim();
        if (name) rows.push([vn, name, title, link, Date.parse(date) || null]);
      }
      if (!rows.length) throw new Error('no items in the weekly report feed');
      return { source: 'Smithsonian / USGS Weekly Volcanic Activity Report', sourceUrl: 'https://volcano.si.edu/reports_weekly.cfm', fields: ['volcanoNumber', 'name', 'title', 'link', 'date'], count: rows.length, rows };
    },
  },
  cables: {
    maxAge: 7 * 24 * 60 * MIN, // submarine cables change a few times a year; Overpass is a shared, free service
    async fetch() {
      // OpenStreetMap: telecom and power cables on the sea floor
      const q = `[out:json][timeout:240];
(
  way["seamark:type"="cable_submarine"];
  way["communication"~"^(line|cable)$"]["location"~"^(underwater|submarine)$"];
  way["telecom"~"^(line|cable)$"]["location"~"^(underwater|submarine)$"];
  way["power"="cable"]["location"~"^(underwater|submarine)$"];
  way["power"="cable"]["submarine"="yes"];
  way["communication"]["submarine"="yes"];
  way["telecom"]["submarine"="yes"];
);
out tags geom qt;`;
      const hosts = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter'];
      let j, err;
      for (const host of hosts) {
        try {
          const res = await fetch(host, { method: 'POST', headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(q), signal: AbortSignal.timeout(280000) });
          if (!res.ok) throw new Error(`${res.status} for ${new URL(host).host}`);
          j = await res.json(); break;
        } catch (e) { err = e; console.log(`  cables: ${e.message}`); }
      }
      if (!j) throw err;
      // Douglas-Peucker in degrees, about 1.5 km
      const simplify = (pts, tol = 0.015) => {
        if (pts.length < 3) return pts;
        const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
        const stack = [[0, pts.length - 1]];
        while (stack.length) {
          const [a, b] = stack.pop(); const [x1, y1] = pts[a], [x2, y2] = pts[b];
          const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1e-9;
          let best = -1, bi = -1;
          for (let i = a + 1; i < b; i++) { const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / len; if (d > best) { best = d; bi = i; } }
          if (best > tol) { keep[bi] = 1; stack.push([a, bi], [bi, b]); }
        }
        return pts.filter((_, i) => keep[i]);
      };
      const rows = [];
      let power = 0, telecom = 0, pts = 0;
      for (const w of j.elements || []) {
        if (w.type !== 'way' || !w.geometry?.length) continue;
        const t = w.tags || {};
        const cat = t['seamark:cable_submarine:category'] || '';
        const isPower = t.power === 'cable' || /power/i.test(cat) || /power/i.test(t['seamark:cable_submarine:product'] || '');
        const line = simplify(w.geometry.map((g) => [+g.lon.toFixed(3), +g.lat.toFixed(3)]));
        if (line.length < 2) continue;
        isPower ? power++ : telecom++; pts += line.length;
        const name = t.name || t['seamark:name'] || t.ref || '';
        rows.push([w.id, isPower ? 1 : 0, name, t.operator || '', t.voltage || '', line.flat()]);
      }
      if (rows.length < 50) throw new Error(`only ${rows.length} cables`);
      console.log(`  cables: ${telecom} telecom, ${power} power ways, ${pts} points`);
      return { source: 'OpenStreetMap contributors (Overpass API)', sourceUrl: 'https://www.openstreetmap.org/copyright', license: 'ODbL 1.0', fields: ['osmWay', 'kind(0 telecom,1 power)', 'name', 'operator', 'voltage', 'lonlat[]'], count: rows.length, rows };
    },
  },
  conflicts: {
    maxAge: 3 * 24 * 60 * MIN, // UCDP publishes candidate events once a month
    async fetch() {
      // UCDP Candidate Events Dataset (CC BY 4.0): every event of organised violence with at least one death
      const base = 'https://ucdp.uu.se/downloads/';
      const html = await (await get(base + 'index.html', 60000, 'text/html')).text();
      const monthly = [...html.matchAll(/candidateged\/GEDEvent_v(\d{2})_0_(\d{1,2})\.csv/gi)].map((m) => [+m[1], +m[2]]);
      if (!monthly.length) throw new Error('no candidate event file listed');
      const [yy, mm] = monthly.sort((a, b) => b[0] - a[0] || b[1] - a[1])[0];
      // the latest month and the eleven before it; the year-to-date file stands in for missing months of this year
      const want = []; for (let k = 0; k < 12; k++) { const d = new Date(Date.UTC(2000 + yy, mm - 1 - k, 1)); want.push([d.getUTCFullYear() % 100, d.getUTCMonth() + 1]); }
      const parse = (text) => {
        const rows = []; let row = [], cell = '', q = false;
        for (let i = 0; i < text.length; i++) {
          const c = text[i];
          if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
          else if (c === '"') q = true; else if (c === ',') { row.push(cell); cell = ''; }
          else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; } else if (c !== '\r') cell += c;
        }
        if (cell || row.length) { row.push(cell); rows.push(row); }
        return rows;
      };
      const events = new Map(), used = [];
      const take = (text, label) => {
        const [head, ...data] = parse(text); const col = Object.fromEntries(head.map((h, i) => [h.trim(), i]));
        for (const k of ['id', 'type_of_violence', 'conflict_name', 'country', 'latitude', 'longitude', 'date_start', 'best']) if (!(k in col)) throw new Error(`${label}: no column ${k}`);
        let n = 0;
        for (const r of data) { if (r.length < 10) continue; events.set(r[col.id], [+r[col.latitude], +r[col.longitude], +r[col.best] || 0, +r[col.type_of_violence], r[col.date_start].slice(0, 10), r[col.country], r[col.conflict_name]]); n++; }
        used.push(`${label} (${n})`);
      };
      const missing = [];
      for (const [y, m] of want) {
        try { take(await (await get(`${base}candidateged/GEDEvent_v${y}_0_${m}.csv`, 90000, 'text/csv,*/*')).text(), `${y}-${m}`); }
        catch { missing.push([y, m]); }
      }
      if (missing.some(([y]) => y === yy)) {
        try { take(await (await get(`${base}candidateged/GEDEvent_v${yy}_01_${yy}_${String(mm).padStart(2, '0')}.csv`, 120000, 'text/csv,*/*')).text(), `${yy} year to date`); } catch (e) { console.log(`  conflicts: year file ${e.message}`); }
      }
      if (!events.size) throw new Error('no events');
      const dates = [...events.values()].map((e) => e[4]).sort(), to = dates.at(-1);
      const from = new Date(Date.parse(to) - 365 * 864e5).toISOString().slice(0, 10);
      // half-degree cells; each cell belongs to the country with the most deaths in it
      const cells = new Map(), countries = new Map();
      for (const [lat, lon, deaths, type, date, country, conflict] of events.values()) {
        if (date < from || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
        const r = Math.min(359, Math.floor((90 - lat) * 2)), c = Math.min(719, Math.floor((lon + 180) * 2)), key = r * 720 + c;
        let x = cells.get(key); if (!x) cells.set(key, x = { r, c, deaths: 0, events: 0, by: {} });
        x.deaths += deaths; x.events++; x.by[country] = (x.by[country] || 0) + deaths + 0.01;
        let k = countries.get(country); if (!k) countries.set(country, k = { deaths: 0, events: 0, mask: 0, last: '', conflicts: {} });
        k.deaths += deaths; k.events++; k.mask |= 1 << (type - 1); if (date > k.last) k.last = date;
        k.conflicts[conflict] = (k.conflicts[conflict] || 0) + deaths;
      }
      const names = [...countries.keys()].sort();
      const countryRows = names.map((n) => { const k = countries.get(n); return [n, k.deaths, k.events, k.mask, k.last, Object.entries(k.conflicts).sort((a, b) => b[1] - a[1]).slice(0, 5)]; });
      const rows = [...cells.values()].map((x) => [x.r, x.c, x.deaths, x.events, names.indexOf(Object.entries(x.by).sort((a, b) => b[1] - a[1])[0][0])]);
      console.log(`  conflicts: ${used.join(', ')}; ${events.size} events, ${rows.length} cells, ${names.length} countries, ${from} to ${to}`);
      return { source: 'UCDP Candidate Events Dataset, Uppsala Conflict Data Program', sourceUrl: 'https://ucdp.uu.se', license: 'CC BY 4.0', from, to, grid: '0.5 degree, row 0 = 90..89.5 N, col 0 = 180..179.5 W', countryFields: ['country', 'deaths', 'events', 'typeMask(1 state-based,2 non-state,4 one-sided)', 'lastEvent', 'topConflicts[name,deaths]'], countries: countryRows, fields: ['row', 'col', 'deaths', 'events', 'countryIndex'], count: rows.length, rows };
    },
  },
};

async function get(url, timeout = 30000, accept = 'application/json') {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: accept }, signal: AbortSignal.timeout(timeout) });
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
