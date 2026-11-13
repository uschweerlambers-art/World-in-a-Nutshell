// Ships for the globe (PRD F-15). Runs in the "Data & Deploy" Action. Node 22+ (built-in WebSocket).
//
// Usage: AISSTREAM_API_KEY=… node scripts/fetch-ships.mjs <cacheDir> <outDir>
//
// Listens to the aisstream.io live feed for about a minute, then merges what it heard with
// the state of earlier runs (positions up to 2 h old, ship details up to 14 days old).
// AIS only carries what ships broadcast: name, call sign, type, size, draught, destination, ETA.
// Cargo, passengers and crew are not in AIS, so they are not shown. The flag comes from the MMSI.
// Without the key, or on any failure, the run goes on and the site keeps the last file (or hides ships).

import { readFile, writeFile, mkdir, copyFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [cacheDir = '.cache/live', outDir = 'site/data/live'] = process.argv.slice(2);
const KEY = process.env.AISSTREAM_API_KEY || '';
const LISTEN_MS = +(process.env.AIS_LISTEN_SECONDS || 70) * 1000;
const POS_MAX_AGE = 2 * 3600, STATIC_MAX_AGE = 14 * 86400; // seconds
const stateFile = join(cacheDir, 'ships-state.json');
const outFile = join(cacheDir, 'ships.json');
const MIDS = JSON.parse(await readFile(join(dirname(fileURLToPath(import.meta.url)), 'mids.json'), 'utf8'));
await mkdir(cacheDir, { recursive: true });
await mkdir(outDir, { recursive: true });
const exists = async (f) => { try { await stat(f); return true; } catch { return false; } };

async function publishLast(reason) {
  console.warn(`✗ ships: ${reason}`);
  if (await exists(outFile)) { await copyFile(outFile, join(outDir, 'ships.json')); console.log('  keeping last ships.json'); }
}

if (!KEY) { await publishLast('no AISSTREAM_API_KEY secret set'); process.exit(0); }

let state = { pos: {}, stat: {} };
try { state = JSON.parse(await readFile(stateFile, 'utf8')); } catch {}

const clean = (s) => String(s || '').replace(/@+/g, ' ').replace(/\s+/g, ' ').trim();
const now = () => Math.floor(Date.now() / 1000);
const tsOf = (meta) => { const t = Date.parse(String(meta?.time_utc || '').replace(/ \+0000 UTC$/, 'Z').replace(' ', 'T')); return Number.isFinite(t) ? Math.floor(t / 1000) : now(); };
const validMmsi = (m) => m >= 201000000 && m <= 775999999; // ship stations only (no base stations, buoys or aircraft)

let messages = 0, positions = 0, statics = 0;
function onMessage(text) {
  let m; try { m = JSON.parse(text); } catch { return; }
  if (m.error) throw new Error(`aisstream: ${m.error}`);
  messages++;
  const mmsi = +m.MetaData?.MMSI; if (!validMmsi(mmsi)) return;
  const t = tsOf(m.MetaData), body = m.Message?.[m.MessageType] || {};
  if (m.MessageType === 'PositionReport' || m.MessageType === 'StandardClassBPositionReport' || m.MessageType === 'ExtendedClassBPositionReport') {
    const lat = body.Latitude, lon = body.Longitude;
    if (!(Math.abs(lat) <= 90 && Math.abs(lon) <= 180) || (lat === 0 && lon === 0)) return;
    const sog = body.Sog >= 102.2 ? -1 : +(+body.Sog).toFixed(1);
    const cog = body.Cog >= 360 ? -1 : Math.round(body.Cog);
    const hdg = body.TrueHeading >= 360 ? -1 : body.TrueHeading;
    const nav = m.MessageType === 'PositionReport' ? body.NavigationalStatus ?? 15 : 15;
    state.pos[mmsi] = [+lat.toFixed(4), +lon.toFixed(4), sog, cog, hdg, nav, t];
    if (!state.stat[mmsi] && m.MetaData?.ShipName) state.stat[mmsi] = [clean(m.MetaData.ShipName), 0, '', '', 0, 0, 0, 0, '', t];
    positions++;
  } else if (m.MessageType === 'ShipStaticData') {
    const d = body.Dimension || {}, e = body.Eta || {};
    const eta = e.Month >= 1 && e.Month <= 12 && e.Day >= 1 && e.Day <= 31 ? `${String(e.Month).padStart(2, '0')}-${String(e.Day).padStart(2, '0')} ${String(e.Hour < 24 ? e.Hour : 0).padStart(2, '0')}:${String(e.Minute < 60 ? e.Minute : 0).padStart(2, '0')}` : '';
    state.stat[mmsi] = [clean(body.Name || m.MetaData?.ShipName), body.Type || 0, clean(body.Destination), eta, (d.A || 0) + (d.B || 0), (d.C || 0) + (d.D || 0), body.MaximumStaticDraught || 0, body.ImoNumber || 0, clean(body.CallSign), t];
    statics++;
  } else if (m.MessageType === 'StaticDataReport') {
    const s = state.stat[mmsi] || [clean(m.MetaData?.ShipName), 0, '', '', 0, 0, 0, 0, '', t];
    if (body.ReportA?.Valid && body.ReportA.Name) s[0] = clean(body.ReportA.Name);
    if (body.ReportB?.Valid) { const d = body.ReportB.Dimension || {}; s[1] = body.ReportB.ShipType || s[1]; s[8] = clean(body.ReportB.CallSign) || s[8]; if (d.A || d.B) { s[4] = (d.A || 0) + (d.B || 0); s[5] = (d.C || 0) + (d.D || 0); } }
    s[9] = t; state.stat[mmsi] = s; statics++;
  }
}

async function listen() {
  await new Promise((resolve, reject) => {
    const ws = new WebSocket('wss://stream.aisstream.io/v0/stream');
    ws.binaryType = 'arraybuffer';
    const stop = setTimeout(() => { ws.close(); resolve(); }, LISTEN_MS);
    ws.onopen = () => ws.send(JSON.stringify({ APIKey: KEY, BoundingBoxes: [[[-90, -180], [90, 180]]], FilterMessageTypes: ['PositionReport', 'StandardClassBPositionReport', 'ExtendedClassBPositionReport', 'ShipStaticData', 'StaticDataReport'] }));
    ws.onmessage = (ev) => {
      try { onMessage(typeof ev.data === 'string' ? ev.data : Buffer.from(ev.data).toString('utf8')); }
      catch (e) { clearTimeout(stop); ws.close(); reject(e); }
    };
    ws.onerror = (ev) => { clearTimeout(stop); reject(new Error(`websocket error ${ev?.message || ''}`.trim())); };
    ws.onclose = (ev) => { clearTimeout(stop); if (messages) resolve(); else reject(new Error(`closed before any message (code ${ev.code}${ev.reason ? ', ' + ev.reason : ''})`)); };
  });
}

try {
  await listen();
} catch (e) {
  if (!messages) { await publishLast(e.message); process.exit(0); }
  console.warn(`  ships: ${e.message} after ${messages} messages, using what arrived`);
}

// forget old positions and details
const t0 = now();
for (const [k, p] of Object.entries(state.pos)) if (t0 - p[6] > POS_MAX_AGE) delete state.pos[k];
for (const [k, s] of Object.entries(state.stat)) if (t0 - s[9] > STATIC_MAX_AGE && !state.pos[k]) delete state.stat[k];
await writeFile(stateFile, JSON.stringify(state));

const rows = [];
for (const [k, p] of Object.entries(state.pos)) {
  const s = state.stat[k] || ['', 0, '', '', 0, 0, 0, 0, '', 0];
  rows.push([+k, p[0], p[1], p[2], p[3], p[4], p[5], p[6], s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], s[8], MIDS[String(k).slice(0, 3)] || '']);
}
rows.sort((a, b) => a[12] - b[12]); // small first, so large ships are drawn on top
const data = {
  source: 'aisstream.io (terrestrial AIS, volunteer receivers)', sourceUrl: 'https://aisstream.io', fetched: new Date().toISOString(),
  note: 'Coverage is best near coasts. Cargo, passengers and crew are not part of AIS.',
  fields: ['mmsi', 'lat', 'lon', 'sogKn', 'cogDeg', 'headingDeg', 'navStatus', 'time', 'name', 'shipType', 'destination', 'etaUTC', 'lengthM', 'beamM', 'draughtM', 'imo', 'callSign', 'flag'],
  count: rows.length, rows,
};
await writeFile(outFile, JSON.stringify(data));
await copyFile(outFile, join(outDir, 'ships.json'));
console.log(`✓ ships: ${messages} messages (${positions} positions, ${statics} details) in ${LISTEN_MS / 1000} s → ${rows.length} ships, ${Object.keys(state.stat).length} with details, ${(JSON.stringify(data).length / 1024).toFixed(0)} KB`);
