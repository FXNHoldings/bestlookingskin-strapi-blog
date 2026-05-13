import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProduct, listProducts, mediaUrl, type BlsProduct } from '@/lib/strapi';
import { SITE } from '@/lib/site';
import ProductCard from '@/components/ProductCard';
import AdsenseUnit from '@/components/AdsenseUnit';

export const revalidate = 60;
export const dynamicParams = true;

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug).catch(() => null);
  if (!p) return { title: 'Not found' };

  const cover = mediaUrl(p.primaryImage ?? null);
  const description = p.seoDescription || p.shortDescription || `${p.brand ?? ''} ${p.name}`.trim();

  return {
    title: p.seoTitle || p.name,
    description,
    keywords: p.seoKeywords,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: {
      type: 'website',
      title: p.seoTitle || p.name,
      description,
      url: `${SITE.url}/products/${p.slug}`,
      images: cover ? [{ url: cover }] : undefined,
    },
    twitter: {
      card: cover ? 'summary_large_image' : 'summary',
      title: p.seoTitle || p.name,
      description,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);
  if (!product) notFound();

  // Related: same category, exclude self
  const relatedRes = product.categories?.[0]
    ? await listProducts({ category: product.categories[0].slug, pageSize: 6 }).catch(() => null)
    : null;
  const related = (relatedRes?.data ?? []).filter((p) => p.id !== product.id).slice(0, 5);

  const cover = mediaUrl(product.primaryImage ?? null);
  const galleryImgs = (product.gallery ?? []).slice(0, 6);
  const cat = product.categories?.[0];

  // Resolve ASIN for the Keepa price-history graph: prefer the explicit
  // `asin` field, otherwise fall back to extracting it from the affiliate
  // URL (e.g. https://www.amazon.com/dp/B00KHO5464/?tag=...).
  const asinFromUrl = product.primaryAffiliateUrl?.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i)?.[1];
  const asin = product.asin || asinFromUrl;

  const hasDiscount =
    product.originalPrice && product.currentPrice && product.originalPrice > product.currentPrice;

  // Build the offer-panel rows from the direct fields on the product. Adding
  // bls-product-offer rows in Strapi later will fold in additional rows.
  type OfferRow = { merchant: string; price?: number; url: string; available: boolean };
  const offerRows: OfferRow[] = [];
  if (product.primaryAffiliateUrl) {
    offerRows.push({
      merchant: merchantLabel(product.sourceMerchant) || 'Amazon.com',
      price: product.currentPrice,
      url: product.primaryAffiliateUrl,
      available: product.available !== false,
    });
  }
  if (product.walmartUrl) {
    offerRows.push({
      merchant: 'Walmart.com',
      price: product.walmartPrice,
      url: product.walmartUrl,
      available: true,
    });
  }
  if (product.ebayUrl) {
    offerRows.push({
      merchant: 'eBay',
      price: product.ebayPrice,
      url: product.ebayUrl,
      available: true,
    });
  }
  // "Best deal" = lowest-priced available offer
  const bestOffer = offerRows
    .filter((r) => r.available && r.price !== undefined)
    .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))[0];

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: cover ? [cover] : undefined,
    description: product.shortDescription || product.description,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    sku: product.skuOrModel,
    offers: product.currentPrice
      ? {
          '@type': 'Offer',
          price: product.currentPrice,
          priceCurrency: product.currency || 'USD',
          availability: product.available
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url: product.primaryAffiliateUrl || `${SITE.url}/products/${product.slug}`,
        }
      : undefined,
    aggregateRating:
      product.rating && product.ratingCount
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            ratingCount: product.ratingCount,
          }
        : undefined,
  };

  return (
    <article className="mx-auto max-w-7xl px-6 py-12" data-testid={`product-${product.slug}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <nav className="flex items-center gap-2 text-xs text-ink/55" aria-label="Breadcrumb">
        <Link href="/" className="shrink-0 hover:text-primary">Home</Link>
        <span>/</span>
        <Link href="/products" className="shrink-0 hover:text-primary">Products</Link>
        {cat && (
          <>
            <span>/</span>
            <Link href={`/products?category=${cat.slug}`} className="shrink-0 hover:text-primary">
              {cat.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="min-w-0 truncate text-ink/75" aria-current="page">{product.name}</span>
      </nav>

      {/* ─── Title bar — full width across the top ─── */}
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(280px,1.2fr)_minmax(0,2fr)] lg:gap-10">
        {/* Image column (spans the full top-section height) */}
        <div className="lg:row-span-2">
          <div className="relative overflow-hidden rounded-md bg-white">
            {hasDiscount && (
              <span className="absolute right-3 top-3 z-10 rounded bg-primary px-2 py-1 text-xs font-bold text-white">
                -{Math.round((1 - product.currentPrice! / product.originalPrice!) * 100)}%
              </span>
            )}
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt={product.name} className="aspect-square w-full object-contain mix-blend-multiply p-6" />
            ) : (
              <div className="aspect-square w-full bg-gradient-to-br from-primary-hover to-primary" />
            )}
          </div>
          {galleryImgs.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {galleryImgs.map((g, i) => {
                const u = mediaUrl(g);
                if (!u) return null;
                return (
                  <div key={i} className="overflow-hidden rounded-md bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt={`${product.name} ${i + 1}`} className="aspect-square w-full object-contain mix-blend-multiply p-1.5" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right side — full-width title row, then 2-col below (description / offers panel) */}
        <div>
          {product.brand && (
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              {product.brand}
            </p>
          )}
          <h1 className="font-display font-semibold leading-snug tracking-tight text-ink" style={{ fontSize: '1.5rem' }}>
            {product.name}
          </h1>

          {/* Social share icons under product title */}
          <div className="mt-3 flex items-center gap-2" data-testid="product-share">
            <ShareLink href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${SITE.url}/products/${product.slug}`)}`} bg="bg-[#1877f2]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99h-2.5V12h2.5V9.83c0-2.47 1.47-3.84 3.73-3.84 1.08 0 2.21.19 2.21.19v2.43h-1.25c-1.23 0-1.61.76-1.61 1.55V12h2.74l-.44 2.89h-2.3v6.99A10 10 0 0 0 22 12Z" /></svg>
            </ShareLink>
            <ShareLink href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${SITE.url}/products/${product.slug}`)}&text=${encodeURIComponent(product.name)}`} bg="bg-black">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M18.244 2H21.5l-7.55 8.63L22.75 22h-6.96l-5.45-7.13L4.04 22H.78l8.08-9.23L1.25 2h7.13l4.93 6.52L18.244 2Zm-1.22 18h1.93L7.06 4H5.04l11.984 16Z" /></svg>
            </ShareLink>
            <ShareLink href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(`${SITE.url}/products/${product.slug}`)}&description=${encodeURIComponent(product.name)}${cover ? `&media=${encodeURIComponent(cover)}` : ''}`} bg="bg-[#e60023]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 0a12 12 0 0 0-4.37 23.18c-.1-.93-.2-2.36.04-3.38.21-.91 1.4-5.79 1.4-5.79s-.36-.72-.36-1.78c0-1.67 1-2.91 2.18-2.91 1.03 0 1.53.78 1.53 1.71 0 1.04-.66 2.6-1 4.05-.29 1.21.61 2.2 1.8 2.2 2.16 0 3.83-2.28 3.83-5.58 0-2.92-2.1-4.96-5.1-4.96-3.47 0-5.51 2.6-5.51 5.29 0 1.05.4 2.17.91 2.78.1.12.11.23.08.36-.09.36-.28 1.16-.32 1.32-.05.21-.17.26-.39.16-1.45-.68-2.36-2.79-2.36-4.5 0-3.66 2.66-7.02 7.67-7.02 4.03 0 7.16 2.87 7.16 6.7 0 4-2.52 7.21-6.02 7.21-1.18 0-2.28-.61-2.66-1.34l-.72 2.75c-.26 1-.96 2.26-1.43 3.03A12 12 0 1 0 12 0z" /></svg>
            </ShareLink>
            <ShareLink href={`mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(`${SITE.url}/products/${product.slug}`)}`} bg="bg-[#3b5998]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            </ShareLink>
          </div>

          {/* 2-col layout: description block on left, offers panel on right */}
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,1fr)]">
            {/* Description + price + BUY */}
            <div>
              <div className="p-5 text-[14px] leading-6 text-ink/80">
                {product.keyFeatures && product.keyFeatures.length > 0 ? (
                  <>
                    <p className="text-xs font-bold uppercase tracking-wider text-ink/50">Key Features</p>
                    <ul className="mt-3 list-disc space-y-2 pl-5">
                      {product.keyFeatures.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </>
                ) : product.shortDescription ? (
                  <p>{product.shortDescription}</p>
                ) : (
                  <p className="italic text-ink/50">No key features yet — add them in Strapi → Commerce · Product → Specs → keyFeatures.</p>
                )}
              </div>

              {product.currentPrice !== undefined && (
                <div className="mt-6 flex items-baseline gap-3">
                  {hasDiscount && (
                    <span className="text-base text-ink/45 line-through">
                      {formatPrice(product.originalPrice!, product.currency)}
                    </span>
                  )}
                  <span className="font-display text-3xl font-bold text-ink">
                    {formatPrice(product.currentPrice, product.currency)}
                  </span>
                </div>
              )}

              {bestOffer && (
                <p className="mt-3 text-sm text-ink/70">
                  <span className="text-ink/55">Best deal at: </span>
                  <span className="font-medium text-ink">{bestOffer.merchant}</span>
                </p>
              )}

              {bestOffer?.url && (
                <a
                  href={bestOffer.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3.5 font-display text-base font-bold uppercase tracking-wider text-white transition hover:bg-primary-emphasis"
                >
                  Buy For Best Price
                </a>
              )}

              <p className="mt-3 text-[12px] text-ink/45">
                <strong>Affiliate disclosure</strong>
                <span className="group relative ml-1 inline-flex align-middle">
                  <button
                    type="button"
                    aria-label="Affiliate disclosure details"
                    className="inline-flex h-4 w-4 cursor-help items-center justify-center text-ink/55 hover:text-primary focus:outline-none"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                      <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                    </svg>
                  </button>
                  <span
                    role="tooltip"
                    className="pointer-events-none invisible absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-md bg-ink px-3 py-2 text-[11px] leading-snug text-white opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
                  >
                    {SITE.name} earns a commission when you buy through links on this page, at no extra cost to you. Prices and availability subject to change.
                  </span>
                </span>
              </p>
            </div>

            {/* Offers panel — Amazon + Walmart + eBay rows */}
            <div>
              <div className="overflow-hidden rounded-md border border-ink/10">
                {offerRows.length > 0 ? (
                  offerRows.map((row, i) => (
                    <OfferRow
                      key={i}
                      merchant={row.merchant}
                      price={row.price}
                      currency={product.currency}
                      url={row.url}
                      outOfStock={!row.available}
                    />
                  ))
                ) : (
                  <p className="px-4 py-6 text-center text-sm text-ink/55">
                    No offers yet — add an Amazon, Walmart or eBay URL in Strapi.
                  </p>
                )}
              </div>

              {product.lastPriceSyncAt && (
                <p className="mt-2 text-[11px] text-ink/55">
                  Last price update was:{' '}
                  {new Date(product.lastPriceSyncAt).toLocaleString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                  })}
                </p>
              )}

              {/* Price comparison bar chart — directly under the
                  "Last price update" line for at-a-glance merchant comparison.
                  Renders whenever at least one offer has a price; with a single
                  offer this is a one-bar reference. */}
              {offerRows.filter((r) => r.price !== undefined).length >= 1 && (
                <div className="mt-4" data-testid="price-comparison">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink/50">Price comparison</p>
                  <div className="mt-2">
                    <PriceComparisonChart
                      rows={offerRows.filter((r) => r.price !== undefined)}
                      currency={product.currency}
                    />
                  </div>
                </div>
              )}

              {/* Wishlist + share */}
              <div className="mt-6 hidden items-center justify-end">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm text-ink/65 transition hover:text-primary"
                  aria-label="Add to wishlist"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  Add to wishlist
                </button>
              </div>

            </div>{/* offers col */}
          </div>{/* 2-col wrapper */}
        </div>{/* right side */}
      </div>{/* top section */}

      <AdsenseUnit slot="3958661572" className="mt-12" />

      {/* Skin types tags (key features moved up next to the title/prices). */}
      {product.skinTypes && product.skinTypes.length > 0 && (
        <div className="mt-12">
          <p className="text-xs font-bold uppercase tracking-wider text-ink/50">Skin types</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {product.skinTypes.map((s) => (
              <li key={s} className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize text-ink/75">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {product.description && (
        <section className="mt-16">
          <h3 className="font-display font-bold tracking-tight text-ink">About this product</h3>
          <div className="mt-6 text-base leading-7 text-ink/80">
            <ProductDescription markdown={product.description} />
          </div>
        </section>
      )}

      {product.ingredients && (
        <section className="mt-12">
          <h2 className="font-display font-bold tracking-tight text-ink">Ingredients</h2>
          <p className="mt-4 text-sm leading-7 text-ink/75">{product.ingredients}</p>
        </section>
      )}

      {/* Amazon price history (Keepa) — only renders when we have an ASIN.
          Uses Keepa's free graph PNG endpoint (no API key required); the
          image is generated server-side by Keepa from years of price
          tracking data, so the chart is meaningful from day one. */}
      {asin && (
        <section className="mt-16" data-testid="price-history">
          <h3 className="font-display font-bold tracking-tight text-ink">Amazon price history</h3>
          <p className="mt-2 text-sm text-ink/55">
            Track pricing trends for {product.name} on Amazon over the last year.
            Data courtesy of <a href={`https://keepa.com/#!product/1-${asin}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Keepa</a>.
          </p>
          <div className="mt-6 rounded-md border border-ink/10 bg-paper p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://graph.keepa.com/pricehistory.png?asin=${asin}&domain=com&amazon=1&new=1&used=0&range=365`}
              alt={`${product.name} — Amazon price history (last 12 months)`}
              loading="lazy"
              className="mx-auto w-full max-w-[900px]"
            />
            <p className="mt-3 text-center text-[11px] text-ink/45">
              Click the chart or visit{' '}
              <a href={`https://keepa.com/#!product/1-${asin}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                Keepa
              </a>
              {' '}for an interactive view, longer date ranges, and price-drop alerts.
            </p>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <aside className="mt-16" data-testid="related-products">
          <h3 className="font-display font-bold tracking-tight text-ink">More in {cat?.name ?? 'this category'}</h3>
          <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} variant="tile" />
            ))}
          </div>
        </aside>
      )}
    </article>
  );
}

function formatPrice(amount: number, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

const MERCHANT_LABELS: Record<string, string> = {
  amazon: 'Amazon.com',
  'amazon-uk': 'Amazon.co.uk',
  'amazon-au': 'Amazon.com.au',
  ebay: 'eBay',
  walmart: 'Walmart.com',
  target: 'Target',
  sephora: 'Sephora',
  ulta: 'Ulta',
  manufacturer: 'Manufacturer',
  other: 'Visit store',
};

function merchantLabel(slug?: string | null): string {
  if (!slug) return '';
  return MERCHANT_LABELS[slug] ?? slug;
}

function ShareLink({ href, bg, children }: { href: string; bg: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex h-9 w-10 items-center justify-center rounded-md text-white transition hover:opacity-90 ${bg}`}
    >
      {children}
    </a>
  );
}

// Merchant glyphs sourced from /public/brand/merchants/ (downloaded locally
// so we don't depend on third-party CDNs and avoid CORS).
function MerchantLogo({ merchant }: { merchant: string }) {
  const m = merchant.toLowerCase();
  let src: string | null = null;
  if (m.includes('walmart')) src = '/brand/merchants/walmart.png';
  else if (m.includes('ebay')) src = '/brand/merchants/ebay.png';
  else if (m.includes('amazon')) src = '/brand/merchants/amazon.ico';
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${merchant} logo`}
      width={16}
      height={16}
      className="h-4 w-4 shrink-0 object-contain"
    />
  );
}

function OfferRow({
  merchant, price, currency, url, outOfStock,
}: {
  merchant: string;
  price?: number;
  currency?: string;
  url: string;
  outOfStock?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-ink/10 px-4 py-3 last:border-b-0 odd:bg-paper">
      <span className="flex items-center gap-2 text-sm font-medium text-ink">
        <MerchantLogo merchant={merchant} />
        {merchant}
      </span>
      <span className="text-right">
        {price !== undefined && (
          <span className="block font-bold text-ink">{formatPrice(price, currency)}</span>
        )}
        {outOfStock && (
          <span className="block text-xs text-primary">out of stock</span>
        )}
      </span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-emphasis"
      >
        See it
      </a>
    </div>
  );
}

/* Tiny markdown renderer for the product description format we generate
   (### headings + "- " bullets + paragraphs separated by blank lines).
   No external dependency; format is constrained so a hand-rolled parser
   is shorter than wiring up `marked` and safer than dangerouslySetInnerHTML. */
function ProductDescription({ markdown }: { markdown: string }) {
  // Inline emphasis: **bold** and *italic*. Returns a React fragment.
  function inline(text: string): React.ReactNode {
    const parts: React.ReactNode[] = [];
    const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let key = 0;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      const tok = m[0];
      if (tok.startsWith('**')) {
        parts.push(<strong key={key++}>{tok.slice(2, -2)}</strong>);
      } else {
        parts.push(<em key={key++}>{tok.slice(1, -1)}</em>);
      }
      last = m.index + tok.length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  }

  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }
    if (line.startsWith('### ')) {
      blocks.push(
        <h4 key={key++} className="mt-5 first:mt-0 text-base font-semibold text-ink">
          {inline(line.slice(4).trim())}
        </h4>,
      );
      i += 1;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={key++} className="mt-5 first:mt-0 text-lg font-semibold text-ink">
          {inline(line.slice(3).trim())}
        </h2>,
      );
      i += 1;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i += 1;
      }
      blocks.push(
        <ul key={key++} className="mt-2 list-disc space-y-1 pl-5">
          {items.map((it, idx) => <li key={idx}>{inline(it)}</li>)}
        </ul>,
      );
      continue;
    }
    // Paragraph: collect consecutive non-blank, non-special lines.
    const para: string[] = [];
    while (
      i < lines.length
      && lines[i].trim()
      && !lines[i].startsWith('### ')
      && !lines[i].startsWith('## ')
      && !/^\s*[-*]\s+/.test(lines[i])
    ) {
      para.push(lines[i]);
      i += 1;
    }
    blocks.push(<p key={key++} className="mt-2 first:mt-0">{inline(para.join(' '))}</p>);
  }
  return <div className="space-y-1">{blocks}</div>;
}

/* Price comparison bar chart — pure SVG-free CSS implementation. Each row
   shows merchant logo + a bar whose width is proportional to its price
   relative to the most expensive offer. The cheapest available row gets
   a "Best deal" badge. */
function PriceComparisonChart({
  rows,
  currency,
}: {
  rows: { merchant: string; price?: number; available: boolean }[];
  currency?: string;
}) {
  const prices = rows.map((r) => r.price as number);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...rows.filter((r) => r.available).map((r) => r.price as number));
  return (
    <div
      className="rounded-md border border-ink/10 bg-paper p-6"
      data-testid="price-comparison-chart"
    >
      <ul className="space-y-5">
        {rows.map((r, i) => {
          const pct = maxPrice > 0 ? ((r.price as number) / maxPrice) * 100 : 0;
          const isBest = r.available && r.price === minPrice;
          return (
            <li key={i} className="grid grid-cols-[140px_minmax(0,1fr)_120px] items-center gap-4">
              <span className="flex items-center gap-2 text-sm font-medium text-ink/80">
                <MerchantLogo merchant={r.merchant} />
                <span className="truncate">{r.merchant.replace(/\.com$/, '')}</span>
              </span>
              <span className="relative h-5 overflow-hidden rounded-full bg-ink/5">
                <span
                  className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ${isBest ? 'bg-primary' : 'bg-ink/30'}`}
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="flex items-center justify-end gap-2 text-right text-sm">
                <span className="font-bold text-ink">{formatPrice(r.price as number, currency)}</span>
                {isBest && (
                  <span className="rounded-sm bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    best
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
