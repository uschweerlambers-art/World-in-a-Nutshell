// Builds site/data/powerplants.json from the WRI Global Power Plant Database (v1.3.0, CC BY 4.0).
// The database is no longer updated, so the file is built once and committed.
//
// Usage: node tools/build-power.mjs <global_power_plant_database.csv> [site/data/powerplants.json]
// Source: https://github.com/wri/global-power-plant-database (output_database/global_power_plant_database.csv)

import { readFile, writeFile } from 'node:fs/promises';

const [src, out = 'site/data/powerplants.json'] = process.argv.slice(2);
if (!src) { console.error('usage: node tools/build-power.mjs <csv> [out]'); process.exit(1); }

function parseCSV(text) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const [head, ...data] = parseCSV(await readFile(src, 'utf8'));
const col = Object.fromEntries(head.map((h, i) => [h, i]));
const FUELS = ['Solar', 'Wind', 'Hydro', 'Gas', 'Coal', 'Oil', 'Nuclear', 'Biomass', 'Waste', 'Geothermal', 'Storage', 'Cogeneration', 'Petcoke', 'Wave and Tidal', 'Other'];
const rows = [], countries = [];
for (const r of data) {
  if (r.length < head.length - 5) continue;
  const lat = +r[col.latitude], lon = +r[col.longitude], mw = +r[col.capacity_mw];
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !(mw > 0)) continue;
  let f = FUELS.indexOf(r[col.primary_fuel]); if (f < 0) f = FUELS.length - 1;
  const year = Math.round(+r[col.commissioning_year]) || 0;
  let c = countries.indexOf(r[col.country_long]); if (c < 0) c = countries.push(r[col.country_long]) - 1;
  // latest reported (not estimated) yearly generation, if any
  let gen = 0, genYear = 0;
  for (let y = 2019; y >= 2013 && !genYear; y--) { const g = +r[col[`generation_gwh_${y}`]]; if (r[col[`generation_gwh_${y}`]] !== '' && Number.isFinite(g) && g > 0) { gen = g >= 100 ? Math.round(g) : +g.toFixed(1); genYear = y; } }
  rows.push([r[col.name].trim(), +lat.toFixed(3), +lon.toFixed(3), mw >= 100 ? Math.round(mw) : +mw.toFixed(1), f, year, (r[col.owner] || '').trim(), c, gen, genYear]);
}
rows.sort((a, b) => a[3] - b[3]); // small first, so big plants are drawn on top
const json = { source: 'Global Power Plant Database v1.3.0, World Resources Institute', sourceUrl: 'https://datasets.wri.org/dataset/globalpowerplantdatabase', license: 'CC BY 4.0', note: 'Last updated by WRI in 2021', fuels: FUELS, countries, fields: ['name', 'lat', 'lon', 'capacityMW', 'fuel', 'commissioned', 'owner', 'countryIndex', 'generationGWh', 'generationYear'], count: rows.length, rows };
await writeFile(out, JSON.stringify(json));
console.log(`${rows.length} plants → ${out}`);
