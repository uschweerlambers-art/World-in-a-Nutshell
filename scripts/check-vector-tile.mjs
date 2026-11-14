// CI smoke test (F-22): the vector tile decoder in site/index.html must read a real OpenFreeMap tile.
// The decoder is taken from the page itself, so the test always checks the code that ships.
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const code = html.slice(html.indexOf('const MVT_TD'), html.indexOf('const mercLatJS'));
const { mvtDecode, mvtProps } = new Function(`${code}; return { mvtDecode, mvtProps };`)();

const tj = await (await fetch('https://tiles.openfreemap.org/planet', { signal: AbortSignal.timeout(30000) })).json();
// zoom 10 around Bielefeld
const url = tj.tiles[0].replace('{z}', 10).replace('{x}', 536).replace('{y}', 338);
const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
let buf = await res.arrayBuffer();
if (new Uint8Array(buf, 0, 2).join() === '31,139') buf = await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
const t = mvtDecode(buf);
const count = Object.fromEntries(Object.entries(t).map(([k, l]) => [k, l.feats.length]));
console.log(url, buf.byteLength, 'bytes', JSON.stringify(count));
const places = (t.place?.feats || []).map((f) => mvtProps(t.place, f)).filter((o) => o.name);
console.log('places:', places.slice(0, 12).map((o) => `${o.name} (${o.class})`).join(', '));
const roads = (t.transportation?.feats || []).map((f) => mvtProps(t.transportation, f).class);
console.log('road classes:', [...new Set(roads)].join(', '));
if (!places.some((o) => /Bielefeld/.test(o.name))) throw new Error('Bielefeld not found in the place layer');
if (!roads.includes('motorway')) throw new Error('no motorway in the transportation layer');
console.log('vector tile decodes');
