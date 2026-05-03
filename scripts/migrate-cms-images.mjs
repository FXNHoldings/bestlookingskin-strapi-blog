#!/usr/bin/env node
/**
 * Migrate Strapi media into the bestlooking-skin frontend.
 *
 * Walks every bls-post / bls-product / bls-product-brand entry, collects all
 * Strapi-hosted media URLs (cover/og/gallery/primary fields + <img src> tags
 * inside post HTML), and downloads each unique file into
 * `public/cms-uploads/`. Idempotent — files that already exist on disk are
 * skipped, so re-running picks up newly uploaded images.
 *
 * Pair this script with the runtime URL rewrite in `lib/strapi.ts` (mediaUrl
 * + post-content rewriter) so the frontend serves the local copy.
 *
 * Required env:
 *   none — defaults to https://cms.fxnstudio.com (public read access).
 *
 * Optional env:
 *   NEXT_PUBLIC_STRAPI_URL     default: https://cms.fxnstudio.com
 *   STRAPI_API_TOKEN           required only if your collections aren't public
 *   CONCURRENCY                default: 6
 *   DRY_RUN=1                  list URLs only, don't write
 *
 * Run:
 *   node scripts/migrate-cms-images.mjs
 */

import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');
const OUT_DIR = path.join(PROJECT_ROOT, 'public', 'cms-uploads');

const STRAPI = (process.env.NEXT_PUBLIC_STRAPI_URL || 'https://cms.fxnstudio.com').replace(/\/$/, '');
const TOKEN = process.env.STRAPI_API_TOKEN || '';
const CONCURRENCY = Number(process.env.CONCURRENCY) || 6;
const DRY_RUN = process.env.DRY_RUN === '1';

const HEADERS = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};

// --- helpers ---------------------------------------------------------------

function isStrapiUrl(url) {
  if (!url) return false;
  if (url.startsWith('/')) return true; // relative path served by Strapi
  try {
    const u = new URL(url);
    return u.host === new URL(STRAPI).host;
  } catch {
    return false;
  }
}

function absolutize(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${STRAPI}${url.startsWith('/') ? url : `/${url}`}`;
}

/** Walk an arbitrary tree and yield every Strapi URL found in `url` keys
 *  (Strapi v5 media fields use `{ url, formats: { large: { url }, ... } }`). */
function* collectMediaUrls(node) {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const item of node) yield* collectMediaUrls(item);
    return;
  }
  if (typeof node !== 'object') return;
  for (const [k, v] of Object.entries(node)) {
    if (k === 'url' && typeof v === 'string' && isStrapiUrl(v)) {
      yield absolutize(v);
    } else if (typeof v === 'object') {
      yield* collectMediaUrls(v);
    }
  }
}

/** Pull every <img src=...> from raw HTML and keep only Strapi-hosted ones. */
function* collectInlineImageUrls(html) {
  if (typeof html !== 'string' || !html) return;
  const re = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const src = m[1];
    if (isStrapiUrl(src)) yield absolutize(src);
  }
}

async function fetchAll(collection, populate) {
  const pageSize = 100;
  let page = 1;
  const all = [];
  for (;;) {
    const params = new URLSearchParams();
    params.set('pagination[page]', String(page));
    params.set('pagination[pageSize]', String(pageSize));
    params.set('publicationState', 'live');
    populate.forEach((p, i) => params.set(`populate[${i}]`, p));
    const url = `${STRAPI}/api/${collection}?${params}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`${collection} page ${page}: ${res.status} ${await res.text().catch(() => '')}`);
    const json = await res.json();
    const data = json.data ?? [];
    all.push(...data);
    const total = json.meta?.pagination?.pageCount ?? 1;
    if (page >= total || data.length === 0) break;
    page += 1;
  }
  return all;
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function downloadOne(url) {
  const u = new URL(url);
  // Preserve the path under /uploads/ (Strapi puts media there).
  const relPath = u.pathname.replace(/^\/+/, '').replace(/^uploads\//, '');
  const outPath = path.join(OUT_DIR, relPath);
  if (await exists(outPath)) return { url, status: 'skip' };
  if (DRY_RUN) return { url, status: 'would-download', outPath };

  const res = await fetch(url);
  if (!res.ok) return { url, status: 'fail', error: `${res.status}` };
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, buf);
  return { url, status: 'ok', bytes: buf.length };
}

async function withConcurrency(items, n, fn) {
  const out = [];
  let i = 0;
  const workers = Array.from({ length: n }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]).catch((e) => ({ url: items[idx], status: 'fail', error: String(e) }));
    }
  });
  await Promise.all(workers);
  return out;
}

// --- main ------------------------------------------------------------------

async function main() {
  console.log(`[migrate] strapi=${STRAPI}  out=${OUT_DIR}  dry=${DRY_RUN}`);

  console.log('[migrate] fetching bls-posts…');
  const posts = await fetchAll('bls-posts', ['coverImage', 'ogImage', 'gallery']);
  console.log(`           ${posts.length} posts`);

  console.log('[migrate] fetching bls-products…');
  const products = await fetchAll('bls-products', ['primaryImage', 'gallery']);
  console.log(`           ${products.length} products`);

  console.log('[migrate] fetching bls-product-brands…');
  const brands = await fetchAll('bls-product-brands', ['logo']).catch(() => []);
  console.log(`           ${brands.length} brands`);

  const urls = new Set();

  for (const p of posts) {
    for (const u of collectMediaUrls(p)) urls.add(u);
    if (typeof p.content === 'string') {
      for (const u of collectInlineImageUrls(p.content)) urls.add(u);
    }
  }
  for (const p of products) {
    for (const u of collectMediaUrls(p)) urls.add(u);
  }
  for (const b of brands) {
    for (const u of collectMediaUrls(b)) urls.add(u);
  }

  console.log(`[migrate] ${urls.size} unique image URLs`);
  if (urls.size === 0) return;

  if (!DRY_RUN) await mkdir(OUT_DIR, { recursive: true });

  const results = await withConcurrency([...urls], CONCURRENCY, downloadOne);

  const counts = results.reduce(
    (acc, r) => ((acc[r.status] = (acc[r.status] || 0) + 1), acc),
    {},
  );
  console.log('[migrate] done', counts);

  const fails = results.filter((r) => r.status === 'fail');
  if (fails.length) {
    console.warn(`[migrate] ${fails.length} failures:`);
    for (const f of fails.slice(0, 20)) console.warn('  ', f.url, '→', f.error);
    if (fails.length > 20) console.warn(`  …and ${fails.length - 20} more`);
  }
}

main().catch((e) => {
  console.error('[migrate] fatal', e);
  process.exit(1);
});
