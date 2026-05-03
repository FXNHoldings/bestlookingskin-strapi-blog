import qs from 'qs';

const BASE = (process.env.NEXT_PUBLIC_STRAPI_URL || 'https://cms.fxnstudio.com').replace(/\/$/, '');
// Reads on /api/bls-* are configured as public in Strapi. Skip the
// Authorization header when the env token is missing OR a known stale
// value, so a rotated token doesn't 401 every fetch and silently empty
// the page.
const RAW_TOKEN = process.env.STRAPI_API_TOKEN || '';
const TOKEN = RAW_TOKEN.startsWith('e7e531759e393ac2') ? '' : RAW_TOKEN;

export type StrapiImage = { url: string; alternativeText?: string; width?: number; height?: number } | null;

export type BlsPostType =
  | 'product-comparison'
  | 'product-review'
  | 'product-roundup'
  | 'how-to-guide'
  | 'informative'
  | 'top-rated'
  | 'other';

export type BlsCategory = {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  icon?: string;
  legacyWpId?: number;
  parent?: { id: number; name: string; slug: string } | null;
  children?: { id: number; name: string; slug: string }[];
};

export type BlsPost = {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  postType?: BlsPostType;
  amazonAffiliateTag?: string;
  sourceUrl?: string;
  legacyWpId?: number;
  readingTimeMinutes?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  publishedAt: string;
  updatedAt: string;
  coverImage?: StrapiImage;
  ogImage?: StrapiImage;
  gallery?: NonNullable<StrapiImage>[];
  categories?: BlsCategory[];
};

type ListResponse<T> = {
  data: T[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
};

async function strapiFetch<T>(path: string, params?: Record<string, unknown>, revalidate = 60): Promise<T> {
  const query = params ? '?' + qs.stringify(params, { encodeValuesOnly: true }) : '';
  const url = `${BASE}/api/${path}${query}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`Strapi ${res.status} on ${url}: ${await res.text().catch(() => '')}`);
  }
  return res.json();
}

// Local mirror of Strapi's `/uploads/*` tree, populated by
// `scripts/migrate-cms-images.mjs`. Frontend always serves the local copy
// so a slow/down CMS host never blocks page loads.
const LOCAL_UPLOADS = '/cms-uploads';

/** Convert a Strapi-hosted media URL (absolute on BASE, or relative
 *  `/uploads/...`) to the locally cached path. Untouched if it isn't
 *  Strapi-hosted (e.g. an Amazon CDN URL). */
function toLocalUploadUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith(LOCAL_UPLOADS)) return url; // already rewritten
  // Absolute URL on the Strapi host
  if (url.startsWith(`${BASE}/uploads/`)) {
    return url.replace(`${BASE}/uploads/`, `${LOCAL_UPLOADS}/`);
  }
  // Relative `/uploads/...`
  if (url.startsWith('/uploads/')) {
    return url.replace(/^\/uploads\//, `${LOCAL_UPLOADS}/`);
  }
  return url;
}

export function mediaUrl(img: StrapiImage): string | null {
  if (!img?.url) return null;
  const absolute = img.url.startsWith('http') ? img.url : `${BASE}${img.url}`;
  return toLocalUploadUrl(absolute);
}

/** Rewrite every `<img src="...cms.fxnstudio.com/uploads/...">` (and the
 *  relative `/uploads/...` form) inside raw HTML so post bodies pull the
 *  locally cached image instead of round-tripping through the CMS host. */
function rewriteContentImages(html: string | undefined): string {
  if (!html) return '';
  return html
    .replace(
      new RegExp(`(<img\\b[^>]*?\\bsrc=["'])${BASE}/uploads/`, 'gi'),
      `$1${LOCAL_UPLOADS}/`,
    )
    .replace(
      /(<img\b[^>]*?\bsrc=["'])\/uploads\//gi,
      `$1${LOCAL_UPLOADS}/`,
    );
}

/** Apply content + media rewrites to a single post. Idempotent. */
function localizePost<T extends BlsPost>(post: T): T {
  return { ...post, content: rewriteContentImages(post.content) };
}

const POST_POPULATE = ['coverImage', 'ogImage', 'categories', 'gallery'];

export async function listPosts(
  opts: { page?: number; pageSize?: number; category?: string; postType?: BlsPostType; q?: string } = {},
) {
  const filters: Record<string, unknown> = {};
  if (opts.category) filters.categories = { slug: { $eqi: opts.category } };
  if (opts.postType) filters.postType = { $eq: opts.postType };
  if (opts.q?.trim()) {
    const q = opts.q.trim();
    filters.$or = [
      { title: { $containsi: q } },
      { excerpt: { $containsi: q } },
      { content: { $containsi: q } },
      { categories: { name: { $containsi: q } } },
    ];
  }

  const res = await strapiFetch<ListResponse<BlsPost>>('bls-posts', {
    sort: ['publishedAt:desc'],
    populate: POST_POPULATE,
    pagination: { page: opts.page ?? 1, pageSize: opts.pageSize ?? 12 },
    filters,
  });
  return { ...res, data: res.data.map(localizePost) };
}

export async function getPost(slug: string): Promise<BlsPost | null> {
  const res = await strapiFetch<ListResponse<BlsPost>>('bls-posts', {
    filters: { slug: { $eq: slug } },
    populate: POST_POPULATE,
    pagination: { pageSize: 1 },
  });
  const post = res.data?.[0];
  return post ? localizePost(post) : null;
}

export async function listCategories(): Promise<BlsCategory[]> {
  const res = await strapiFetch<ListResponse<BlsCategory>>('bls-categories', {
    sort: ['order:asc', 'name:asc'],
    populate: ['parent', 'children'],
    pagination: { pageSize: 100 },
  });
  return res.data;
}

export async function getCategory(slug: string): Promise<BlsCategory | null> {
  const res = await strapiFetch<ListResponse<BlsCategory>>('bls-categories', {
    filters: { slug: { $eqi: slug } },
    populate: ['parent', 'children'],
    pagination: { pageSize: 1 },
  });
  return res.data?.[0] ?? null;
}

// =====================================================================
// PRODUCTS — separate from posts. Products are individual SKUs that can be
// embedded in posts and searched independently.
// =====================================================================

export type BlsProductCategory = {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  icon?: string;
  image?: StrapiImage;
  parent?: { id: number; name: string; slug: string } | null;
  children?: { id: number; name: string; slug: string }[];
};

export type BlsProductBrand = {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
  description?: string;
  websiteUrl?: string;
  logo?: StrapiImage;
  order?: number;
};

export type BlsProduct = {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
  brand?: string;
  brandRef?: BlsProductBrand | null;
  shortDescription?: string;
  description?: string;
  keyFeatures?: string[];
  primaryImage?: StrapiImage;
  gallery?: NonNullable<StrapiImage>[];
  asin?: string;
  skuOrModel?: string;
  skinTypes?: string[];
  ingredients?: string;
  rating?: number;
  ratingCount?: number;
  primaryAffiliateUrl?: string;
  sourceUrl?: string;
  sourceMerchant?: string;
  currentPrice?: number;
  originalPrice?: number;
  currency?: string;
  lastPriceSyncAt?: string;
  available?: boolean;
  walmartPrice?: number;
  walmartUrl?: string;
  walmartLastSyncAt?: string;
  ebayPrice?: number;
  ebayUrl?: string;
  ebayLastSyncAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  publishedAt: string;
  updatedAt: string;
  categories?: BlsProductCategory[];
};

const PRODUCT_POPULATE = ['primaryImage', 'gallery', 'categories', 'brandRef'];

export async function listProducts(
  opts: {
    page?: number;
    pageSize?: number;
    category?: string;
    brand?: string;
    skinType?: string;
    minPrice?: number;
    maxPrice?: number;
    q?: string;
    sort?: 'newest' | 'price-asc' | 'price-desc' | 'rating-desc';
  } = {},
) {
  const filters: Record<string, unknown> = {};
  if (opts.category) filters.categories = { slug: { $eqi: opts.category } };
  const andFilters: Record<string, unknown>[] = [];
  if (opts.brand) {
    andFilters.push({ $or: [
      { brand: { $eqi: opts.brand } },
      { brandRef: { slug: { $eqi: opts.brand } } },
      { brandRef: { name: { $eqi: opts.brand } } },
    ] });
  }
  if (opts.skinType) filters.skinTypes = { $contains: opts.skinType };
  if (opts.minPrice !== undefined) filters.currentPrice = { $gte: opts.minPrice };
  if (opts.maxPrice !== undefined) {
    filters.currentPrice = Object.assign(
      typeof filters.currentPrice === 'object' ? (filters.currentPrice as Record<string, unknown>) : {},
      { $lte: opts.maxPrice },
    );
  }
  if (opts.q?.trim()) {
    const q = opts.q.trim();
    andFilters.push({ $or: [
      { name: { $containsi: q } },
      { brand: { $containsi: q } },
      { shortDescription: { $containsi: q } },
      { description: { $containsi: q } },
      { ingredients: { $containsi: q } },
      { categories: { name: { $containsi: q } } },
      { brandRef: { name: { $containsi: q } } },
    ] });
  }
  if (andFilters.length > 0) filters.$and = andFilters;

  const sortMap = {
    'newest':      ['publishedAt:desc'],
    'price-asc':   ['currentPrice:asc'],
    'price-desc':  ['currentPrice:desc'],
    'rating-desc': ['rating:desc', 'ratingCount:desc'],
  };

  return strapiFetch<ListResponse<BlsProduct>>('bls-products', {
    sort: sortMap[opts.sort ?? 'newest'],
    populate: PRODUCT_POPULATE,
    pagination: { page: opts.page ?? 1, pageSize: opts.pageSize ?? 24 },
    filters,
  });
}

export async function getProduct(slug: string): Promise<BlsProduct | null> {
  const res = await strapiFetch<ListResponse<BlsProduct>>('bls-products', {
    filters: { slug: { $eq: slug } },
    populate: PRODUCT_POPULATE,
    pagination: { pageSize: 1 },
  });
  return res.data?.[0] ?? null;
}

export async function listProductCategories(): Promise<BlsProductCategory[]> {
  const res = await strapiFetch<ListResponse<BlsProductCategory>>('bls-product-categories', {
    sort: ['order:asc', 'name:asc'],
    populate: ['parent', 'children', 'image'],
    pagination: { pageSize: 100 },
  });
  return res.data;
}

export async function listProductBrands(): Promise<BlsProductBrand[]> {
  try {
    const res = await strapiFetch<ListResponse<BlsProductBrand>>('bls-product-brands', {
      sort: ['order:asc', 'name:asc'],
      populate: ['logo'],
      pagination: { pageSize: 200 },
    });
    return res.data;
  } catch {
    return listLegacyProductBrands();
  }
}

async function listLegacyProductBrands(): Promise<BlsProductBrand[]> {
  const brands = new Set<string>();
  let page = 1;

  while (true) {
    const res = await strapiFetch<ListResponse<Pick<BlsProduct, 'brand'>>>('bls-products', {
      fields: ['brand'],
      sort: ['brand:asc'],
      pagination: { page, pageSize: 100 },
    });

    for (const product of res.data) {
      const brand = product.brand?.trim();
      if (brand) brands.add(brand);
    }

    const pageCount = res.meta?.pagination?.pageCount ?? 1;
    if (page >= pageCount) break;
    page++;
  }

  return Array.from(brands)
    .sort((a, b) => a.localeCompare(b))
    .map((name, index) => ({
      id: index + 1,
      name,
      slug: name,
    }));
}

export async function getProductCategory(slug: string): Promise<BlsProductCategory | null> {
  const res = await strapiFetch<ListResponse<BlsProductCategory>>('bls-product-categories', {
    filters: { slug: { $eqi: slug } },
    populate: ['parent', 'children', 'image'],
    pagination: { pageSize: 1 },
  });
  return res.data?.[0] ?? null;
}


// =====================================================================

// Slug→category lookup for sitemap, etc.
export async function listAllPostSlugs(): Promise<{ slug: string; category: string; updatedAt: string }[]> {
  const all: { slug: string; category: string; updatedAt: string }[] = [];
  let page = 1;
  while (true) {
    const res = await strapiFetch<ListResponse<BlsPost>>('bls-posts', {
      fields: ['slug', 'updatedAt'],
      populate: { categories: { fields: ['slug'] } },
      sort: ['publishedAt:desc'],
      pagination: { page, pageSize: 100 },
    });
    for (const p of res.data) {
      const cat = p.categories?.[0]?.slug ?? 'uncategorized';
      all.push({ slug: p.slug, category: cat, updatedAt: p.updatedAt });
    }
    const pageCount = res.meta?.pagination?.pageCount ?? 1;
    if (page >= pageCount) break;
    page++;
  }
  return all;
}

export async function listAllProductSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  const all: { slug: string; updatedAt: string }[] = [];
  let page = 1;
  while (true) {
    const res = await strapiFetch<ListResponse<BlsProduct>>('bls-products', {
      fields: ['slug', 'updatedAt'],
      sort: ['publishedAt:desc'],
      pagination: { page, pageSize: 100 },
    });
    for (const p of res.data) {
      all.push({ slug: p.slug, updatedAt: p.updatedAt });
    }
    const pageCount = res.meta?.pagination?.pageCount ?? 1;
    if (page >= pageCount) break;
    page++;
  }
  return all;
}
