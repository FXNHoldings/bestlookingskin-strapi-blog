import Link from 'next/link';
import { listPosts, type BlsPost } from '@/lib/strapi';
import { SECTIONS, SITE } from '@/lib/site';
import { fmtDate, firstImageUrl, postPath } from '@/lib/format';
import PostCard from '@/components/PostCard';

export const revalidate = 60;

/* Homepage modeled on https://bestlooking.skin/ — same flow:
   1. Hero (welcome banner + tagline + intro)
   2. Product Selection Tools (4 cards: How-to / Top-Rated / Informative / Comparisons)
   3. Latest Arrivals (recent posts grid)
   4. Skincare-type sections (Moisturizer / Serum / Eye Cream / Anti-Aging) — show
      posts whose title or content mentions the term, since we don't yet have a
      product-type taxonomy
   5. Product Reviews — feature + grid pulled from reviews category
   6. Our Commitment (mission blurb)
   7. Articles (latest editorial)
   8. Contact strip                                                              */

const SKINCARE_TYPES: { label: string; query: string }[] = [
  { label: 'Moisturizer', query: 'moisturizer' },
  { label: 'Serum',       query: 'serum' },
  { label: 'Eye Cream',   query: 'eye cream' },
  { label: 'Anti-Aging',  query: 'anti-aging' },
];

const TOOLS: { title: string; href: string; blurb: string; emoji: string }[] = [
  { title: 'How-To Guides',         href: '/skincare-how-to-guides',                   blurb: 'Step-by-step routines and layering rules.',     emoji: '📖' },
  { title: 'Top-Rated Products',    href: '/top-rated-skincare-for-glowing-skin',      blurb: 'The standouts across cleansers, serums, SPF.',  emoji: '⭐' },
  { title: 'Informative Articles',  href: '/essential-guide-to-informative-articles',  blurb: 'Ingredients, skin types, the science behind it.', emoji: '🧪' },
  { title: 'Product Comparisons',   href: '/best-product-comparisons',                 blurb: 'Side-by-side breakdowns to pick a routine.',    emoji: '⚖️' },
];

export default async function HomePage() {
  // Fetch all editorial sections in parallel
  const perSection = await Promise.all(
    SECTIONS.map((s) =>
      listPosts({ category: s.slug, pageSize: 8 })
        .then((r) => r.data)
        .catch(() => [] as BlsPost[]),
    ),
  );
  const bySection: Record<string, BlsPost[]> = Object.fromEntries(
    SECTIONS.map((s, i) => [s.slug, perSection[i]]),
  );

  // Skincare-type sections — driven by full-text search of post bodies
  const perSkincareType = await Promise.all(
    SKINCARE_TYPES.map((t) =>
      listPosts({ q: t.query, pageSize: 4 })
        .then((r) => r.data)
        .catch(() => [] as BlsPost[]),
    ),
  );

  // Latest across all sections (de-duped)
  const latest: BlsPost[] = [];
  const seen = new Set<number>();
  for (const p of perSection
    .flat()
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    latest.push(p);
  }

  const reviews = bySection['skincare-reviews-path-to-glowing-skin'] ?? [];
  const articles = bySection['essential-guide-to-informative-articles'] ?? [];

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div data-testid="home-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <Hero />
      <ProductSelectionTools />
      <LatestArrivals posts={latest.slice(0, 8)} />
      {SKINCARE_TYPES.map((type, i) => (
        <SkincareTypeSection key={type.label} label={type.label} query={type.query} posts={perSkincareType[i] ?? []} alt={i % 2 === 1} />
      ))}
      {reviews.length > 0 && <ProductReviews posts={reviews.slice(0, 6)} />}
      <OurCommitment />
      {articles.length > 0 && <ArticlesGrid posts={articles.slice(0, 6)} />}
      <ContactStrip />
    </div>
  );
}

/* ---------- HERO ---------- */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper" data-testid="home-hero">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Welcome to</p>
          <h1 className="mt-4 font-display font-black tracking-tight text-ink">
            {SITE.name}
          </h1>
          <h2 className="mx-auto mt-6 max-w-3xl text-balance font-display font-bold tracking-tight text-ink">
            Your Guide to the Best Skincare Products on the Market.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-ink/70 sm:text-lg">
            {SITE.name} is your go-to destination for comprehensive guidance on achieving healthy,
            radiant, glowing skin. Our mission is to provide you with the most current and accurate
            information about top-tier skincare products available today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/best-product-comparisons"
              className="inline-flex items-center rounded-full bg-primary px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white transition hover:bg-primary-emphasis"
            >
              Browse comparisons
            </Link>
            <Link
              href="/skincare-reviews-path-to-glowing-skin"
              className="inline-flex items-center rounded-full border border-ink/15 px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-ink transition hover:border-primary hover:text-primary"
            >
              Read reviews
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- PRODUCT SELECTION TOOLS — 4 large cards ---------- */

function ProductSelectionTools() {
  return (
    <section className="bg-muted py-16" data-testid="selection-tools">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Editorial picks"
          title="Product Selection Tools"
          subtitle="Four ways to find the right product — pick the one that matches what you're shopping for."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((t) => (
            <Link
              key={t.title}
              href={t.href}
              className="group relative flex flex-col rounded-3xl bg-white p-6 transition hover:bg-primary hover:text-white"
              data-testid={`tool-${t.href}`}
            >
              <span className="text-3xl">{t.emoji}</span>
              <h3 className="mt-4 font-display font-bold leading-tight text-ink group-hover:text-white">
                {t.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-ink/65 group-hover:text-white/85">{t.blurb}</p>
              <span className="mt-6 inline-flex items-center gap-1 font-display text-sm font-bold uppercase tracking-wider text-primary group-hover:text-white">
                Explore
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14" /><polyline points="13 6 19 12 13 18" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- LATEST ARRIVALS ---------- */

function LatestArrivals({ posts }: { posts: BlsPost[] }) {
  if (posts.length === 0) {
    return (
      <section className="bg-paper py-16" data-testid="latest-arrivals-empty">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader eyebrow="Just in" title="Latest Arrivals" subtitle="Fresh posts will appear here once content is imported." />
        </div>
      </section>
    );
  }
  return (
    <section className="bg-paper py-16" data-testid="latest-arrivals">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="Just in" title="Latest Arrivals" subtitle="The newest reviews, comparisons and guides — fresh from the editorial team." />
        <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {posts.slice(0, 4).map((p) => (
            <PostCard key={p.id} post={p} variant="tile" />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- SKINCARE-TYPE SECTIONS ---------- */

function SkincareTypeSection({
  label,
  query,
  posts,
  alt,
}: {
  label: string;
  query: string;
  posts: BlsPost[];
  alt?: boolean;
}) {
  return (
    <section
      className={alt ? 'bg-muted py-14' : 'bg-paper py-14'}
      data-testid={`skincare-type-${query}`}
    >
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Shop the category"
          title={label}
          subtitle={`Latest editorial covering ${label.toLowerCase()} — picks, comparisons and how-to.`}
          viewAll={`/search?q=${encodeURIComponent(query)}`}
        />
        {posts.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-ink/15 px-6 py-12 text-center text-sm text-ink/55">
            No posts mention {label} yet — check back after content is imported.
          </div>
        ) : (
          <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {posts.slice(0, 4).map((p) => (
              <PostCard key={p.id} post={p} variant="tile" thumbBg="bg-white" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- PRODUCT REVIEWS — feature + 4-up ---------- */

function ProductReviews({ posts }: { posts: BlsPost[] }) {
  const [feature, ...rest] = posts;
  return (
    <section className="bg-white py-16" data-testid="product-reviews">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Hands-on"
          title="Product Reviews"
          subtitle="Honest takes on the products people are actually shopping for."
          viewAll="/skincare-reviews-path-to-glowing-skin"
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <PostCard post={feature} variant="feature" thumbBg="bg-white" />
          <div className="grid gap-6 sm:grid-cols-2">
            {rest.slice(0, 4).map((p) => (
              <PostCard key={p.id} post={p} variant="tile" thumbBg="bg-white" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- OUR COMMITMENT — mission block ---------- */

function OurCommitment() {
  return (
    <section className="bg-[#111111] py-20 text-white" data-testid="our-commitment">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary/90">Our Commitment</p>
          <h2 className="mt-4 font-display font-bold tracking-tight">Our Goal</h2>
          <p className="mt-6 text-base leading-7 text-white/80 sm:text-lg">
            Our team — seasoned skincare experts — diligently conducts rigorous research, comprehensive
            product comparisons and detailed reviews. The aim is to empower you with the knowledge
            you need to make informed decisions about your skincare routine. Skincare is a personal
            journey, not a one-size-fits-all approach, so we strive to cover a diverse range of
            products to cater to various skin types and concerns.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/about"
              className="inline-flex items-center rounded-full bg-primary px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white transition hover:bg-primary-emphasis"
            >
              About us
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white transition hover:border-primary"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- ARTICLES ---------- */

function ArticlesGrid({ posts }: { posts: BlsPost[] }) {
  return (
    <section className="bg-paper py-16" data-testid="articles">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Read more"
          title="Articles"
          subtitle="Background reading — ingredients, skin types and the science behind the bottle."
          viewAll="/essential-guide-to-informative-articles"
        />
        <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 6).map((p) => (
            <PostCard key={p.id} post={p} variant="tile" thumbBg="bg-white" />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- CONTACT STRIP ---------- */

function ContactStrip() {
  return (
    <section className="bg-muted py-12" data-testid="contact-strip">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Get in touch</p>
          <a href="mailto:contact@bestlooking.skin" className="mt-2 block font-display text-2xl font-bold text-ink hover:text-primary">
            contact@bestlooking.skin
          </a>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center rounded-full bg-primary px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white transition hover:bg-primary-emphasis"
        >
          Contact form
        </Link>
      </div>
    </section>
  );
}

/* ---------- shared section header ---------- */

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  viewAll,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  viewAll?: string;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{eyebrow}</p>
        <h2 className="mt-3 font-display font-bold tracking-tight text-ink">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-ink/65 sm:text-base">{subtitle}</p>
      </div>
      {viewAll && (
        <Link
          href={viewAll}
          className="inline-flex w-fit items-center gap-1 rounded-full border border-ink/15 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-ink transition hover:border-primary hover:text-primary"
        >
          See all
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14" /><polyline points="13 6 19 12 13 18" />
          </svg>
        </Link>
      )}
    </div>
  );
}
