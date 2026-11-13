# World in a Nutshell

A free, interactive 3D globe built from open live and archive data: day and night, clouds,
aircraft, satellites and the ISS, earthquakes of the last 24 hours, radio stations, and a
handful of "world record" places with a short note and a link to Wikipedia.

No login, no tracking, no ads. Running costs: 0 €.

## How it runs

```
GitHub repo ──push / every 15 min──▶ Action "Data & Deploy" ──▶ GitHub Pages
                                        │  fetches snapshots:
                                        │   • CelesTrak orbits (at most every 2 h)
                                        │   • Radio Browser stations (daily)
                                        │   • OpenSky aircraft, USGS quakes (each run)
                                        │   • NASA GIBS clouds (at most every 3 h)
                                        ▼
                                   site/data/live/*.json  (in the Pages artifact, never committed)

Browser ──▶ site/  (three.js globe)
        ├─▶ data/live/*.json         snapshots from the Action
        ├─▶ USGS feed                 live, directly
        └─▶ radio streams             directly, only when you press play
Satellite positions are computed live in the browser from the orbit data.
```

## Layout

| Path | What |
| --- | --- |
| `site/` | The published website (`index.html`, textures in `img/`, static data in `data/`) |
| `scripts/fetch-snapshots.mjs` | Snapshot fetcher used by the Action, no dependencies |
| `scripts/fetch-clouds.mjs` | Builds the cloud layer from NASA GIBS imagery (needs `npm ci`, uses sharp) |
| `tools/build-data.js` | Rebuilds `places.json` and `regions.json` (`npm i all-the-cities topojson-client world-atlas`) |
| `docs/PRD.md` | Requirements with acceptance criteria, the basis for QA |
| `docs/qa/` | QA protocols |

## Run locally

```sh
node scripts/fetch-snapshots.mjs .cache/live site/data/live   # optional, needs internet
npx serve site                                               # or: python3 -m http.server -d site
```

## Data sources and licences

- Earth textures: NASA Blue Marble / Black Marble (public domain)
- Clouds: NASA GIBS / EOSDIS, MODIS and VIIRS corrected reflectance
- Places: GeoNames, CC BY 4.0
- Region outlines: Natural Earth, public domain
- Satellites: CelesTrak
- Earthquakes: USGS, public domain
- Aircraft: The OpenSky Network
- Radio: Radio Browser
