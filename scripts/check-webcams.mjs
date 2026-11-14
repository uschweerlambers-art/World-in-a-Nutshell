// Checks the webcam players of the place popup (F-26). Runs in the "Data & Deploy" Action.
//
// Usage: node scripts/check-webcams.mjs <cacheDir> <outDir>
//
// For every camera in site/data/webcams.json with a player: a YouTube embed is checked with YouTube's
// oEmbed endpoint (401/403 = the owner switched embedding off, 404 = the video is gone), an image must
// answer as an image, and an iframe page must answer and must not forbid framing. A camera whose player
// fails is shown with "Watch on provider site" only. The result goes to <outDir>/webcams-status.json and
// is kept for 3 hours, so the sources are asked at most eight times a day. Never fails the job.

import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [cacheDir = '.cache/live', outDir = 'site/data/live'] = process.argv.slice(2);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CAMS = JSON.parse(await readFile(join(root, 'site/data/webcams.json'), 'utf8')).cams;
const cacheFile = join(cacheDir, 'webcams-status.json'), outFile = join(outDir, 'webcams-status.json');
const MAX_AGE = 3 * 3600e3, UA = 'WorldInANutshell/1.0 (+https://github.com/uschweerlambers-art/World-in-a-Nutshell)';
await mkdir(cacheDir, { recursive: true });
await mkdir(outDir, { recursive: true });

const key = CAMS.map(c => c.id + '|' + (c.embed || '') + '|' + c.page).join(',');
try {
  const old = JSON.parse(await readFile(cacheFile, 'utf8'));
  if (old.key === key && Date.now() - Date.parse(old.checked) < MAX_AGE && !process.env.WEBCAMS_FORCE) {
    await copyFile(cacheFile, outFile);
    console.log('webcams: status from', old.checked);
    process.exit(0);
  }
} catch {}

async function req(url, method = 'GET') {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 15000);
  try { return await fetch(url, { method, redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': UA, 'accept-language': 'en' } }); }
  finally { clearTimeout(t); }
}
async function checkPlayer(c) {
  if (c.player === 'youtube') {
    const id = c.embed.split('/embed/')[1]?.split(/[?&#]/)[0];
    const r = await req(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent('https://www.youtube.com/watch?v=' + id)}`);
    if (!r.ok) return { ok: false, why: `YouTube oEmbed ${r.status}` };
    const j = await r.json();
    return { ok: true, why: `YouTube oEmbed 200 · ${j.title} · ${j.author_name}` };
  }
  if (c.player === 'image') {
    const r = await req(c.embed), type = r.headers.get('content-type') || '';
    await r.arrayBuffer().catch(() => {});
    return r.ok && type.startsWith('image/') ? { ok: true, why: `${r.status} ${type} · ${r.headers.get('last-modified') || 'no date'}` } : { ok: false, why: `${r.status} ${type}` };
  }
  if (c.player === 'iframe') {
    const r = await req(c.embed);
    await r.arrayBuffer().catch(() => {});
    const xfo = (r.headers.get('x-frame-options') || '').toLowerCase(), csp = r.headers.get('content-security-policy') || '';
    const fa = /frame-ancestors([^;]*)/i.exec(csp)?.[1]?.trim() || '';
    const blocked = /deny|sameorigin/.test(xfo) || (fa && !/\*|github\.io/.test(fa));
    return !r.ok ? { ok: false, why: `HTTP ${r.status}` } : blocked ? { ok: false, why: `framing forbidden (${xfo || 'frame-ancestors ' + fa})` } : { ok: true, why: `HTTP ${r.status}, framing allowed` };
  }
  return null;
}

const out = { checked: new Date().toISOString(), key, cams: {} };
for (const c of CAMS) {
  const e = {};
  try { const p = await checkPlayer(c); if (p) { e.player = p.ok; e.why = p.why; } } catch (err) { e.player = false; e.why = String(err.message || err); }
  try { const r = await req(c.page); await r.arrayBuffer().catch(() => {}); e.page = r.status; } catch (err) { e.page = 0; }
  out.cams[c.id] = e;
  console.log(`${e.player === false ? '✗' : '✓'} ${c.id}: ${c.player ? (e.player ? 'player ok' : 'player FAILED') + ' (' + e.why + ')' : 'link only'} · provider page ${e.page}`);
}
await writeFile(cacheFile, JSON.stringify(out));
await writeFile(outFile, JSON.stringify(out));
