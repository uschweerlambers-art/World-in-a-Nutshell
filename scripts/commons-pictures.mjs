// Pictures from Wikimedia Commons for an English Wikipedia article, shared by the place of the day
// (F-16) and the wonders cards. Only files on Commons with a free licence; author and licence go along.

export const UA = 'WorldInANutshell/0.1 (+https://github.com/uschweerlambers-art/World-in-a-Nutshell)';
export async function get(url, as = 'json', timeout = 30000) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Api-User-Agent': UA }, signal: AbortSignal.timeout(timeout) });
  if (!res.ok) throw new Error(`${res.status} for ${new URL(url).host}`);
  return as === 'json' ? res.json() : Buffer.from(await res.arrayBuffer());
}
export const plain = (html) => String(html || '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const SKIP = /\.svg$|map|locator|location|flag|coat[_ ]of[_ ]arms|logo|icon|diagram|plan\b|seal|signature|chart|graph|stamp|banknote|coin/i;

// photos only: no PNG (mostly maps and diagrams), no old engravings, fossils or reconstructions
const NOT_PHOTO = /\.png$|fossil|rainforest|painting|engraving|drawing|illustration|reconstruction|vegetation|(?<!\d)1[0-8]\d\d(?!\d)/i;

// true when a file name looks like a photo (not a map, logo, painting or old print)
export const isPhoto = (f) => /\.(jpe?g|webp|tiff?)$/i.test(f) && !SKIP.test(f) && !NOT_PHOTO.test(f);

// prefer: Commons file names picked by hand, used first (still only with a free licence)
// photos: skip files that are rarely photos of the place itself; avoid: file names never to use
export async function pictures(wiki, MAX_PICS = 5, { prefer = [], photos = false, avoid = [] } = {}) {
  // files in article order (lead image first)
  const ml = await get(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(wiki)}`);
  const auto = [...new Set((ml.items || []).filter((it) => it.type === 'image' && it.title).map((it) => it.title.replace(/^File:/, '')))]
    .filter((f) => /\.(jpe?g|png|webp|tiff?)$/i.test(f) && !SKIP.test(f) && !(photos && NOT_PHOTO.test(f)));
  const no = new Set(avoid.map((f) => f.replace(/ /g, '_')));
  const chosen = new Set(prefer.map((f) => f.replace(/ /g, '_')));
  const files = [...new Set([...chosen, ...auto.map((f) => f.replace(/ /g, '_'))])].filter((f) => !no.has(f)).slice(0, 30);
  if (!files.length) return [];
  // only files hosted on Wikimedia Commons, which only takes freely licensed works
  const q = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', prop: 'imageinfo', iiprop: 'url|size|extmetadata', iiurlwidth: '1280', titles: files.map((f) => 'File:' + f).join('|') });
  const j = await get('https://commons.wikimedia.org/w/api.php?' + q);
  const byTitle = new Map((j.query?.pages || []).map((p) => [p.title.replace(/^File:/, '').replace(/ /g, '_'), p]));
  const first = [], wide = [], tall = [];
  for (const f of files) {
    const p = byTitle.get(f.replace(/ /g, '_')); const ii = p?.imageinfo?.[0];
    if (!p || p.missing || !ii?.thumburl) continue;
    const m = ii.extmetadata || {}, lic = plain(m.LicenseShortName?.value);
    if (m.NonFree?.value || !/^(cc|public domain|pd|cc0|attribution|no restrictions)/i.test(lic)) continue;
    if (Math.max(ii.width, ii.height) < 800) continue;
    const author = plain(m.Artist?.value).replace(/^(.{3,}?)(?:\s+\1)+$/, '$1').slice(0, 90) || 'Unknown author';
    // landscape pictures fit the slider best; upright ones (towers) only fill up
    if (!chosen.has(f) && photos && /^public domain$/i.test(lic) && /^unknown/i.test(plain(m.Artist?.value) || 'unknown')) continue;
    (chosen.has(f) ? first : ii.width / ii.height >= 1.05 ? wide : tall).push({ file: f, url: ii.thumburl, author, license: lic, licenseUrl: m.LicenseUrl?.value || '', page: ii.descriptionurl });
  }
  return [...first, ...wide, ...tall].slice(0, MAX_PICS);
}

