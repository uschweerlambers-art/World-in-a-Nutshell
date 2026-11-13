// Builds the orientation layers: country borders + label points, and capital cities.
// Run once when the sources change:
//   npm i --no-save world-atlas@2 topojson-client@3 polylabel@2 all-the-cities@3
//   node tools/build-geo.mjs
// Sources: Natural Earth 1:50m via world-atlas (public domain), GeoNames via all-the-cities (CC BY 4.0).
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as topo from 'topojson-client';
import polylabel from 'polylabel';

const require = createRequire(import.meta.url);
const out = new URL('../site/data/', import.meta.url).pathname;
const world = require('world-atlas/countries-50m.json');
const cities = require('all-the-cities');

const r2 = (v) => Math.round(v * 100) / 100;

// shared borders only (coastlines are visible in the texture already)
const mesh = topo.mesh(world, world.objects.countries, (a, b) => a !== b);
const lines = mesh.coordinates.map((line) => line.flatMap(([x, y]) => [r2(x), r2(y)]));

// label point = pole of inaccessibility of the largest polygon; priority by its area
const NAME_FIX = { 'United States of America': 'United States', 'Dem. Rep. Congo': 'DR Congo', 'Central African Rep.': 'Central African Rep.', 'Bosnia and Herz.': 'Bosnia and Herzegovina', 'Dominican Rep.': 'Dominican Rep.', 'S. Sudan': 'South Sudan', 'Eq. Guinea': 'Equatorial Guinea', 'W. Sahara': 'Western Sahara', 'Fr. S. Antarctic Lands': 'French Southern Lands', 'Solomon Is.': 'Solomon Islands', 'Falkland Is.': 'Falkland Islands', 'N. Cyprus': 'Northern Cyprus', 'Macedonia': 'North Macedonia', 'eSwatini': 'Eswatini', 'Côte d\'Ivoire': 'Côte d’Ivoire' };
// hand-placed where the largest polygon gives an odd spot
const LABEL_AT = { 'Russia': [62, 95], 'Canada': [60, -105], 'United States': [39, -99], 'Norway': [62, 9], 'Chile': [-30, -71], 'Indonesia': [-2, 115], 'Japan': [36.5, 138.5], 'Malaysia': [3.8, 102.3] };
function ringArea(ring, lat) { let a = 0; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]); return Math.abs(a / 2) * Math.cos(lat * Math.PI / 180); }
const labels = [];
for (const f of topo.feature(world, world.objects.countries).features) {
  if (!f.geometry) continue;
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  let best = null, bestA = -1, total = 0;
  for (const p of polys) {
    const lat = p[0].reduce((s, c) => s + c[1], 0) / p[0].length;
    const a = ringArea(p[0], lat); total += a;
    if (a > bestA) { bestA = a; best = p; }
  }
  if (!best || total < 0.05) continue; // skip specks
  let [lon, lat] = polylabel(best, 0.05);
  const name = NAME_FIX[f.properties.name] || f.properties.name;
  if (LABEL_AT[name]) [lat, lon] = LABEL_AT[name];
  labels.push({ name, lat: r2(lat), lon: r2(lon), area: Math.round(total * 10) / 10 });
}
labels.sort((a, b) => b.area - a.area);
writeFileSync(out + 'countries.json', JSON.stringify({ source: 'Natural Earth 1:50m via world-atlas 2', license: 'Public domain', borders: lines, labels }));

// capitals (GeoNames feature code PPLC), English display names as in places.json
const EN = { 'Roma': 'Rome', 'Praha': 'Prague', 'Warszawa': 'Warsaw', 'København': 'Copenhagen', 'Bruxelles': 'Brussels', 'Moskva': 'Moscow', 'Athína': 'Athens', 'Lisboa': 'Lisbon', 'Wien': 'Vienna', 'Bucureşti': 'Bucharest', 'Beograd': 'Belgrade', 'Kyiv': 'Kyiv', 'Den Haag': 'The Hague', 'Ciudad de México': 'Mexico City', 'Al Qāhirah': 'Cairo' };
const caps = cities.filter((c) => c.featureCode === 'PPLC').map((c) => {
  const [lon, lat] = c.loc.coordinates;
  return [EN[c.name] || c.name, r2(lat), r2(lon), c.country, Math.round(c.population / 1000)];
}).sort((a, b) => b[4] - a[4]);
writeFileSync(out + 'capitals.json', JSON.stringify({ source: 'GeoNames via all-the-cities 3', license: 'CC BY 4.0', fields: ['name', 'lat', 'lon', 'cc', 'popK'], rows: caps }));
console.log(`countries: ${lines.length} border lines, ${labels.length} labels · capitals: ${caps.length}`);
