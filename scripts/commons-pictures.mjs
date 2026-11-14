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

export async function pictures(wiki, MAX_PICS = 5) {
  // files in article order (lead image first)
  const ml = await get(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(wiki)}`);
  const files = [...new Set((ml.items || []).filter((it) => it.type === 'image' && it.title).map((it) => it.title.replace(/^File:/, '')))]
    .filter((f) => /\.(jpe?g|png|webp|tiff?)$/i.test(f) && !SKIP.test(f)).slice(0, 24);
  if (!files.length) return [];
  // only files hosted on Wikimedia Commons, which only takes freely licensed works
  const q = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', prop: 'imageinfo', iiprop: 'url|size|extmetadata', iiurlwidth: '1280', titles: files.map((f) => 'File:' + f).join('|') });
  const j = await get('https://commons.wikimedia.org/w/api.php?' + q);
  const byTitle = new Map((j.query?.pages || []).map((p) => [p.title.replace(/^File:/, '').replace(/ /g, '_'), p]));
  const wide = [], tall = [];
  for (const f of files) {
    const p = byTitle.get(f.replace(/ /g, '_')); const ii = p?.imageinfo?.[0];
    if (!p || p.missing || !ii?.thumburl) continue;
    const m = ii.extmetadata || {}, lic = plain(m.LicenseShortName?.value);
    if (m.NonFree?.value || !/^(cc|public domain|pd|cc0|attribution|no restrictions)/i.test(lic)) continue;
    if (Math.max(ii.width, ii.height) < 800) continue;
    const author = plain(m.Artist?.value).replace(/^(.{3,}?)(?:\s+\1)+$/, '$1').slice(0, 90) || 'Unknown author';
    // landscape pictures fit the slider best; upright ones (towers) only fill up
    (ii.width / ii.height >= 1.05 ? wide : tall).push({ file: f, url: ii.thumburl, author, license: lic, licenseUrl: m.LicenseUrl?.value || '', page: ii.descriptionurl });
  }
  return [...wide, ...tall].slice(0, MAX_PICS);
}

