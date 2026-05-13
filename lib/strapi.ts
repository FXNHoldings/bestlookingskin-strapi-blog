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

type CommerceMerchant = {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
};

type CommerceOffer = {
  id: number;
  documentId?: string;
  title?: string;
  price?: number;
  originalPrice?: number;
  currency?: string;
  productUrl?: string;
  affiliateUrl?: string;
  availability?: 'in_stock' | 'out_of_stock' | 'preorder' | 'unknown';
  merchantSku?: string;
  source?: string;
  lastCheckedAt?: string;
  status?: string;
  merchant?: CommerceMerchant | null;
};

type CommerceProduct = Omit<
  BlsProduct,
  | 'brandRef'
  | 'categories'
  | 'keyFeatures'
  | 'skuOrModel'
  | 'skinTypes'
  | 'ingredients'
  | 'primaryAffiliateUrl'
  | 'sourceUrl'
  | 'sourceMerchant'
  | 'currentPrice'
  | 'originalPrice'
  | 'currency'
  | 'lastPriceSyncAt'
  | 'available'
  | 'walmartPrice'
  | 'walmartUrl'
  | 'walmartLastSyncAt'
  | 'ebayPrice'
  | 'ebayUrl'
  | 'ebayLastSyncAt'
  | 'seoTitle'
  | 'seoDescription'
  | 'seoKeywords'
> & {
  brandRef?: BlsProductBrand | null;
  categories?: BlsProductCategory[];
  specs?: {
    keyFeatures?: string[];
    skinTypes?: string[];
    ingredients?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    sourceUrl?: string;
    primaryAffiliateUrl?: string;
  };
  mpn?: string;
  sku?: string;
  offers?: CommerceOffer[];
};

const PRODUCT_POPULATE = {
  primaryImage: true,
  gallery: true,
  categories: { populate: ['parent', 'children', 'image'] },
  brandRef: { populate: ['logo'] },
  offers: { populate: ['merchant'] },
};

function merchantSlug(offer?: CommerceOffer): string {
  return offer?.merchant?.slug || '';
}

function normalizeCommerceProduct(product: CommerceProduct): BlsProduct {
  const offers = product.offers ?? [];
  const availableOffers = offers.filter((offer) => offer.status !== 'expired' && offer.availability !== 'out_of_stock');
  const pricedOffers = availableOffers.filter((offer) => offer.price !== undefined);
  const bestOffer = [...pricedOffers].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))[0] ?? availableOffers[0];
  const amazonOffer = offers.find((offer) => merchantSlug(offer).startsWith('amazon')) ?? bestOffer;
  const walmartOffer = offers.find((offer) => merchantSlug(offer) === 'walmart');
  const ebayOffer = offers.find((offer) => merchantSlug(offer) === 'ebay');
  const lastPriceSyncAt = offers
    .map((offer) => offer.lastCheckedAt)
    .filter(Boolean)
    .sort()
    .at(-1);

  return {
    ...product,
    brand: product.brandRef?.name || product.brand,
    keyFeatures: product.specs?.keyFeatures ?? [],
    skuOrModel: product.mpn || product.sku,
    skinTypes: product.specs?.skinTypes ?? [],
    ingredients: product.specs?.ingredients,
    primaryAffiliateUrl: amazonOffer?.affiliateUrl || amazonOffer?.productUrl || product.specs?.primaryAffiliateUrl,
    sourceUrl: amazonOffer?.productUrl || product.specs?.sourceUrl,
    sourceMerchant: merchantSlug(amazonOffer) || undefined,
    currentPrice: amazonOffer?.price ?? bestOffer?.price,
    originalPrice: amazonOffer?.originalPrice ?? bestOffer?.originalPrice,
    currency: amazonOffer?.currency ?? bestOffer?.currency ?? 'USD',
    lastPriceSyncAt,
    available: bestOffer ? bestOffer.availability !== 'out_of_stock' : undefined,
    walmartPrice: walmartOffer?.price,
    walmartUrl: walmartOffer?.affiliateUrl || walmartOffer?.productUrl,
    walmartLastSyncAt: walmartOffer?.lastCheckedAt,
    ebayPrice: ebayOffer?.price,
    ebayUrl: ebayOffer?.affiliateUrl || ebayOffer?.productUrl,
    ebayLastSyncAt: ebayOffer?.lastCheckedAt,
    seoTitle: product.specs?.seoTitle,
    seoDescription: product.specs?.seoDescription,
    seoKeywords: product.specs?.seoKeywords,
  };
}

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
  if (opts.q?.trim()) {
    const q = opts.q.trim();
    andFilters.push({ $or: [
      { name: { $containsi: q } },
      { brand: { $containsi: q } },
      { shortDescription: { $containsi: q } },
      { description: { $containsi: q } },
      { categories: { name: { $containsi: q } } },
      { brandRef: { name: { $containsi: q } } },
    ] });
  }
  if (andFilters.length > 0) filters.$and = andFilters;

  const sortMap = {
    'newest':      ['publishedAt:desc'],
    'price-asc':   ['publishedAt:desc'],
    'price-desc':  ['publishedAt:desc'],
    'rating-desc': ['rating:desc', 'ratingCount:desc'],
  };

  const res = await strapiFetch<ListResponse<CommerceProduct>>('commerce-products', {
    sort: sortMap[opts.sort ?? 'newest'],
    populate: PRODUCT_POPULATE,
    pagination: { page: opts.page ?? 1, pageSize: opts.pageSize ?? 24 },
    filters,
  });
  let data = res.data.map(normalizeCommerceProduct);

  if (opts.skinType) {
    data = data.filter((product) => product.skinTypes?.some((skinType) => skinType.toLowerCase() === opts.skinType?.toLowerCase()));
  }
  if (opts.minPrice !== undefined) data = data.filter((product) => (product.currentPrice ?? Infinity) >= opts.minPrice!);
  if (opts.maxPrice !== undefined) data = data.filter((product) => (product.currentPrice ?? 0) <= opts.maxPrice!);
  if (opts.sort === 'price-asc') data = [...data].sort((a, b) => (a.currentPrice ?? Infinity) - (b.currentPrice ?? Infinity));
  if (opts.sort === 'price-desc') data = [...data].sort((a, b) => (b.currentPrice ?? 0) - (a.currentPrice ?? 0));

  return { ...res, data };
}

export async function getProduct(slug: string): Promise<BlsProduct | null> {
  const res = await strapiFetch<ListResponse<CommerceProduct>>('commerce-products', {
    filters: { slug: { $eq: slug } },
    populate: PRODUCT_POPULATE,
    pagination: { pageSize: 1 },
  });
  return res.data?.[0] ? normalizeCommerceProduct(res.data[0]) : null;
}

export async function listProductCategories(): Promise<BlsProductCategory[]> {
  const res = await strapiFetch<ListResponse<BlsProductCategory>>('commerce-categories', {
    sort: ['order:asc', 'name:asc'],
    populate: ['parent', 'children', 'image'],
    pagination: { pageSize: 100 },
  });
  return res.data;
}

export async function listProductBrands(): Promise<BlsProductBrand[]> {
  try {
    const res = await strapiFetch<ListResponse<BlsProductBrand>>('commerce-brands', {
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
    const res = await strapiFetch<ListResponse<Pick<BlsProduct, 'brand'>>>('commerce-products', {
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
  const res = await strapiFetch<ListResponse<BlsProductCategory>>('commerce-categories', {
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
    const res = await strapiFetch<ListResponse<BlsProduct>>('commerce-products', {
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
