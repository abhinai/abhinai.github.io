// One-off importer for the old Blogger and Medium posts.
// Usage: node scripts/import-legacy.mjs <raw-dir>
//   <raw-dir>/blogger.json   Blogger feed (?alt=json&max-results=500)
//   <raw-dir>/medium.xml     Medium RSS feed (latest 10 posts)
//   <raw-dir>/medium/*.html  Saved Medium post pages (older posts not in the feed)
// Writes src/content/blog/<slug>.md and public/images/<slug>/N.ext, keeping original publish dates.
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

const raw = process.argv[2];
if (!raw) throw new Error('usage: node scripts/import-legacy.mjs <raw-dir>');
const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'src/content/blog');
const imgDir = path.join(root, 'public/images');
fs.mkdirSync(outDir, { recursive: true });

// First-pass categorisation (edit freely afterwards; the front matter is the source of truth)
const CATEGORY = {
  'the-beauty-of-genetic-algorithms': 'Technology',
  'the-beauty-of-cosine': 'Technology',
  'controlling-the-money-supply': 'Economics',
  'modern-money-is-pure-fiction': 'Economics',
  'why-are-ufos-round': 'Technology',
  'sharing-and-dawn-of-modern-civilization': 'Reflections',
  'linearity-of-consciousness': 'Reflections',
  'failing-is-important': 'Reflections',
  'how-to-get-good-at-failing': 'Reflections',
  'do-kids-have-an-advantage-when-it-comes-to-learning-new-things': 'Reflections',
  'obstacle-is-the-way': 'Reflections',
  'one-shot-writing': 'Reflections',
  'maturity-the-frontal-lobe-and-the-magic-age-of-25': 'Reflections',
  'what-impresses-me-in-a-job-interview': 'Reflections',
  'revival': 'Personal',
  'growing-up-in-barabanki': 'Personal',
  'first-summer-vacation-in-barabanki': 'Personal',
  'memories-from-time-immemorial': 'Personal',
  'came-across-a-very-old-picture': 'Photos',
  'my-first-modeling-assignment': 'Photos',
  'an-artist-made-this-for-me': 'Photos',
};
const FEATURED = 'the-beauty-of-genetic-algorithms';
const DRAFT = new Set(['hello-world', 'my-other-blog']); // housekeeping posts, kept but unpublished
const SKIP = new Set(['what-if-i-lived-200-years-ago']); // duplicate of an-artist-made-this-for-me, not imported

const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-', emDelimiter: '*' });

function largestFromSrcset(srcset) {
  return srcset.split(',').map((s) => s.trim().split(/\s+/)).sort((a, b) => parseInt(b[1]) - parseInt(a[1]))[0]?.[0];
}

function fullSizeUrl(url) {
  if (url.includes('googleusercontent.com') || url.includes('bp.blogspot.com')) {
    return url.replace(/\/s\d+(-[a-z0-9-]+)?\//, '/s1600/').replace(/=[swh]\d+[^/]*$/, '=s1600');
  }
  return url;
}

async function download(url, slug, n) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const type = res.headers.get('content-type') || '';
  const ext = type.includes('png') ? 'png' : type.includes('gif') ? 'gif' : type.includes('webp') ? 'webp' : 'jpg';
  fs.mkdirSync(path.join(imgDir, slug), { recursive: true });
  const file = `${n}.${ext}`;
  fs.writeFileSync(path.join(imgDir, slug, file), Buffer.from(await res.arrayBuffer()));
  return `/images/${slug}/${file}`;
}

// Clean post HTML, download its images, return { markdown, cover, words }
async function convert(html, slug) {
  const $ = cheerio.load(html, null, false);
  $('img[src*="/_/stat"], img[width="1"]').remove(); // Medium tracking pixel
  $('script, style').remove();
  // Blogger wraps images in links to the full-size file: keep the image, drop the link
  $('a:has(img)').each((_, a) => {
    const href = $(a).attr('href') || '';
    const img = $(a).find('img').first();
    if (/\.(jpe?g|png|gif|webp)$|googleusercontent|bp\.blogspot/i.test(href)) img.attr('data-full', href);
    $(a).replaceWith(img);
  });
  // Links between my own posts point at this site; other Medium-relative links get the full domain
  $('a[href]').each((_, a) => {
    const href = $(a).attr('href');
    const medium = href.match(/^(?:https?:\/\/medium\.com)?\/@abhinai\/([a-z0-9-]+?)-[0-9a-f]{10,12}(?:[?#].*)?$/);
    const blogger = href.match(/^https?:\/\/abhinaisrivastava\.blogspot\.com\/\d{4}\/\d{2}\/([a-z0-9-]+)\.html/);
    if (medium || blogger) $(a).attr('href', `/writing/${(medium || blogger)[1]}/`);
    else if (href.startsWith('/')) $(a).attr('href', `https://medium.com${href}`);
  });
  let n = 0;
  let cover;
  for (const el of $('img').toArray()) {
    const img = $(el);
    const src = img.attr('data-full') || (img.attr('srcset') && largestFromSrcset(img.attr('srcset'))) || img.attr('src');
    if (!src) { img.remove(); continue; }
    const local = await download(fullSizeUrl(src), slug, ++n);
    cover ??= local;
    $(el).replaceWith(`<img src="${local}" alt="${(img.attr('alt') || '').replace(/"/g, '&quot;')}">`);
  }
  let md = td.turndown($.html());
  md = md.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  const words = $.root().text().split(/\s+/).filter(Boolean).length;
  return { markdown: md, cover, words };
}

function describe(markdown) {
  const text = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= 160) return text;
  return text.slice(0, 160).replace(/\s+\S*$/, '') + '…';
}

async function writePost({ slug, title, date, html, source, sourceName }) {
  if (SKIP.has(slug)) return;
  const { markdown, cover, words } = await convert(html, slug);
  const category = CATEGORY[slug] ?? 'Personal';
  const fm = {
    title,
    date,
    category,
    description: describe(markdown),
    ...(cover && { cover }),
    ...(slug === FEATURED && { featured: true }),
    ...(DRAFT.has(slug) && { draft: true }),
    source,
    sourceName,
  };
  const yaml = Object.entries(fm).map(([k, v]) => `${k}: ${typeof v === 'string' ? JSON.stringify(v) : v}`).join('\n');
  fs.writeFileSync(path.join(outDir, `${slug}.md`), `---\n${yaml}\n---\n\n${markdown}\n`);
  console.log(`${date.slice(0, 10)}  ${sourceName.padEnd(7)} ${category.padEnd(11)} ${String(words).padStart(4)}w  ${slug}`);
}

// Blogger: complete feed
const blogger = JSON.parse(fs.readFileSync(path.join(raw, 'blogger.json'), 'utf8')).feed.entry;
for (const e of blogger) {
  const url = e.link.find((l) => l.rel === 'alternate').href;
  await writePost({
    slug: path.basename(url, '.html'),
    title: e.title.$t,
    date: e.published.$t,
    html: e.content.$t,
    source: url,
    sourceName: 'Blogger',
  });
}

// Medium RSS: the 10 most recent posts, full HTML
const rss = cheerio.load(fs.readFileSync(path.join(raw, 'medium.xml'), 'utf8'), { xmlMode: true });
for (const item of rss('item').toArray()) {
  const it = rss(item);
  const url = it.find('link').text().split('?')[0];
  await writePost({
    slug: path.basename(url).replace(/-[0-9a-f]{10,12}$/, ''),
    title: it.find('title').text(),
    date: new Date(it.find('pubDate').text()).toISOString(),
    html: it.find('content\\:encoded').text(),
    source: url,
    sourceName: 'Medium',
  });
}

// Medium saved pages: body elements carry short hex ids; the first h1 is the title
for (const f of fs.readdirSync(path.join(raw, 'medium')).filter((f) => f.endsWith('.html'))) {
  const $ = cheerio.load(fs.readFileSync(path.join(raw, 'medium', f), 'utf8'));
  const article = $('article');
  const title = article.find('h1').first().text().trim();
  const parts = [];
  const seenLists = new Set();
  article.find('[id]').each((_, el) => {
    if (!/^[0-9a-f]{4}$/.test(el.attribs.id) || $(el).text().trim() === title) return;
    if ($(el).parents('[id]').toArray().some((p) => /^[0-9a-f]{4}$/.test(p.attribs.id))) return;
    if (el.tagName === 'li') {
      const list = $(el).parent()[0];
      if (seenLists.has(list)) return;
      seenLists.add(list);
      parts.push(`<${list.tagName}>${$(list).children('li').toArray().map((li) => `<li>${$(li).html()}</li>`).join('')}</${list.tagName}>`);
    } else {
      parts.push(`<${el.tagName}>${$(el).html()}</${el.tagName}>`);
    }
  });
  const slugWithId = path.basename(f, '.html');
  await writePost({
    slug: slugWithId.replace(/-[0-9a-f]{10,12}$/, ''),
    title,
    date: $('script[type="application/ld+json"]').text().match(/"datePublished":"([^"]+)"/)?.[1] ?? $.html().match(/"datePublished":"([^"]+)"/)[1],
    html: parts.join('\n'),
    source: `https://medium.com/@abhinai/${slugWithId}`,
    sourceName: 'Medium',
  });
}
