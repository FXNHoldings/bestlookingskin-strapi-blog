import Link from 'next/link';
import { listPosts, type BlsPost } from '@/lib/strapi';
import { SECTIONS, SITE } from '@/lib/site';
import { fmtDate, firstImageUrl, postPath } from '@/lib/format';
import PostCard from '@/components/PostCard';
import ArticlesCarousel from '@/components/ArticlesCarousel';

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
      <CategoryShowcase />
      <WelcomeIntro />
      <LatestArrivals posts={latest.slice(0, 8)} />
      <CommitmentBlock />
      {/* Render Moisturizer / Serum / Eye Cream first (indexes 0-2)… */}
      {SKINCARE_TYPES.slice(0, 3).map((type, i) => (
        <SkincareTypeSection key={type.label} label={type.label} query={type.query} posts={perSkincareType[i] ?? []} alt={i % 2 === 1} />
      ))}
      {/* …then the "Our Goal" article-list block… */}
      <OurGoalSection posts={latest.slice(0, 12)} />
      {/* …then Anti-Aging (index 3) and the rest. */}
      {SKINCARE_TYPES.slice(3).map((type, i) => {
        const idx = i + 3;
        return (
          <SkincareTypeSection key={type.label} label={type.label} query={type.query} posts={perSkincareType[idx] ?? []} alt={idx % 2 === 1} />
        );
      })}
      {reviews.length > 0 && <ProductReviews posts={reviews.slice(0, 6)} />}
      <FirstStepSection />
      {articles.length > 0 && <ArticlesGrid posts={articles.slice(0, 8)} />}
      <ContactStrip />
    </div>
  );
}

/* ---------- HERO ---------- */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper" data-testid="home-hero">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
        {/* Left column — heading + intro */}
        <div>
          <h1 className="font-display font-bold tracking-tight text-ink">
            Your Guide to the Best Skincare.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-ink/70 sm:text-lg">
            {SITE.name} is your go-to destination for comprehensive guidance on achieving healthy,
            radiant, glowing skin. Our mission is to provide you with the most current and accurate
            information about top-tier skincare products available today.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
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
        {/* Right column — hero product banner */}
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-banner-products.png"
            alt="Curated skincare products"
            width={900}
            height={675}
            className="mx-auto h-auto w-full max-w-xl object-contain mix-blend-multiply"
          />
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

/* ---------- CATEGORY SHOWCASE — bento grid (Moisturizer / Reviews / Serum / Eye Cream) ---------- */

const SHOWCASE: { label: string; href: string; img: string; span: string }[] = [
  {
    label: 'Moisturizer',
    href: '/search?q=moisturizer',
    img: '/showcase-moisturizer.jpg',
    span: 'col-span-12 lg:col-span-6 row-span-2 aspect-[4/5] lg:aspect-auto lg:min-h-[600px]',
  },
  {
    label: 'Product Reviews',
    href: '/skincare-reviews-path-to-glowing-skin',
    img: '/showcase-reviews.jpg',
    span: 'col-span-12 lg:col-span-6 aspect-[16/8] lg:aspect-auto lg:min-h-[290px]',
  },
  {
    label: 'Serum',
    href: '/search?q=serum',
    img: '/showcase-serum.jpg',
    span: 'col-span-6 lg:col-span-3 aspect-square lg:aspect-auto lg:min-h-[290px]',
  },
  {
    label: 'Eye Cream',
    href: '/search?q=eye+cream',
    img: '/showcase-eyecream.jpg',
    span: 'col-span-6 lg:col-span-3 aspect-square lg:aspect-auto lg:min-h-[290px]',
  },
];

function CategoryShowcase() {
  return (
    <section className="bg-paper py-14" data-testid="category-showcase">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-12 gap-4">
          {SHOWCASE.map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              className={`group relative overflow-hidden rounded-2xl ${tile.span}`}
              data-testid={`showcase-${tile.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tile.img}
                alt={tile.label}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              {/* Subtle dark gradient at the bottom for label legibility */}
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" aria-hidden />
              <span className="absolute bottom-5 left-6 font-display text-2xl font-bold text-white drop-shadow-md transition group-hover:translate-x-1">
                {tile.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- WELCOME INTRO (mission block, copy from bestlooking.skin) ---------- */

function WelcomeIntro() {
  return (
    <section className="bg-paper py-16 sm:py-20" data-testid="welcome-intro">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <div>
          <h2 className="font-display font-extrabold leading-[1.05] tracking-tight text-ink">
            Welcome to<br />bestlooking.skin
          </h2>
        </div>
        <div className="space-y-6 text-base leading-7 text-ink/75 sm:text-lg sm:leading-8">
          <p>
            Welcome to BestLooking.Skin — your go-to destination for comprehensive guidance on
            achieving healthy, radiant and glowing skin. Our mission is to provide you with the most
            current and accurate information about top-tier skincare products available today. We
            are committed to helping you discover high-quality skincare products at affordable
            prices.
          </p>
          <p>
            Our team, comprised of seasoned skincare experts, diligently conducts rigorous research,
            comprehensive product comparisons and detailed reviews. Our aim is to empower you with
            the knowledge you need to make informed decisions about your skincare routine. We
            recognize that skincare is a personal journey, not a one-size-fits-all approach.
            Therefore, we strive to cover a diverse range of products to cater to various skin types
            and concerns.
          </p>
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

/* ---------- COMMITMENT BLOCK (editorial copy from bestlooking.skin) ---------- */

function CommitmentBlock() {
  return (
    <section className="bg-paper py-16 sm:py-20" data-testid="commitment-block">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="font-display font-extrabold tracking-tight text-ink">
          Our Commitment
        </h2>
        <div className="mt-8 space-y-6 text-base leading-7 text-ink/80 sm:text-lg sm:leading-8">
          <p>
            At BestLooking.Skin, we are committed to inclusivity. In addition to product reviews and
            recommendations, we offer informative articles and easy-to-follow how-to guides. Whether
            you’re a skincare novice or an expert, we have something for everyone, ensuring no one
            is left out in their skincare journey.
          </p>
          <p>
            We regularly update our ‘Top Rated Products’ section, showcasing the best skincare
            products as recommended by our readers and expert team. Thank you for choosing
            BestLooking.Skin. BestLooking.Skin is your trusted ally in your skincare journey. We
            hope you find our content helpful, enjoyable and inspiring as you work towards achieving
            the best-looking skin. Welcome to BestLooking.Skin — your premier destination and
            comprehensive guide to achieving healthy, radiant and glowing skin. Our mission, our
            commitment, is to provide you with the most exhaustive, current and accurate
            information about the finest skincare products available on the market today. We are
            unwavering in our dedication to helping you discover the highest quality skincare
            products at the most affordable prices, ensuring you do not have to compromise on your
            skincare regimen.
          </p>
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

/* ---------- OUR GOAL — research blurb + 2-column article links ---------- */

function OurGoalSection({ posts }: { posts: BlsPost[] }) {
  // Two even columns of links — split posts in half
  const half = Math.ceil(posts.length / 2);
  const colA = posts.slice(0, half);
  const colB = posts.slice(half, half * 2);
  return (
    <section className="bg-paper py-16 sm:py-20" data-testid="our-goal">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-12">
          {/* Left — heading + body */}
          <div>
            <h2 className="font-display font-extrabold tracking-tight text-ink">Our Goal</h2>
            <p className="mt-5 text-base leading-7 text-ink/75 sm:text-lg sm:leading-8">
              We conduct rigorous and thorough research, comprehensive product comparisons, and
              detailed reviews.
            </p>
            <p className="mt-5 text-base leading-7 text-ink/75">
              Our goal is to equip you with all the necessary information you need to make an
              informed and wise decision about your skincare routine. We fully understand that
              skincare is not a ‘one-size-fits-all’ scenario — what might work for one individual
              may not work for another. This is precisely why we endeavor to cover a wide array of
              products, ensuring we cater to a multitude of skin types and address various skin
              concerns so everyone can find something suitable.
            </p>
          </div>

          {/* Right — intro paragraph above two columns of post links */}
          <div>
            <p className="text-base leading-7 text-ink/75 sm:text-lg sm:leading-8">
              In addition to our product reviews and recommendations, we offer a plethora of
              informative articles and easy-to-follow how-to guides. These resources are designed to
              help you understand the intricacies of skincare, learn how to effectively use
              different products, and address specific skin issues. Whether you’re a skincare novice
              just beginning your journey or a seasoned expert in search of new insights, we have a
              little something for everyone at BestLooking.Skin.
            </p>
            <div className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2">
              <GoalLinkColumn posts={colA} />
              <GoalLinkColumn posts={colB} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GoalLinkColumn({ posts }: { posts: BlsPost[] }) {
  if (posts.length === 0) return <div />;
  return (
    <ul className="space-y-4 text-base leading-snug">
      {posts.map((p) => (
        <li key={p.id} className="flex items-start gap-3">
          <span aria-hidden className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold leading-none text-primary">+</span>
          <Link
            href={postPath(p)}
            className="font-medium text-[#1556ee] transition hover:text-primary hover:underline"
          >
            {p.title}
          </Link>
        </li>
      ))}
    </ul>
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

/* ---------- FIRST STEP TO GREAT SKIN — editorial closer ---------- */

function FirstStepSection() {
  return (
    <section className="bg-paper py-16 sm:py-20" data-testid="first-step">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="font-display font-extrabold tracking-tight text-ink">First Step to Great Skin</h2>
        <div className="mt-8 space-y-6 text-base leading-7 text-ink/80 sm:text-lg sm:leading-8">
          <p>
            Moreover, we regularly refresh our ‘Top Rated Products’ section, where we showcase the
            absolute crème de la crème in skincare as voted by our dedicated readers and our expert
            team. This section acts as a quick reference guide for anyone looking for the best
            skincare products as per our recommendations.
          </p>
          <p>
            We want to express our heartfelt gratitude for choosing BestLooking.Skin. BestLooking.Skin
            is your trusted ally and resource in your skincare journey. We hope that you find our
            content not only helpful but also enjoyable and inspiring. We’re truly honored to be a
            part of your journey towards achieving the best-looking skin.
          </p>
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
        <div className="mt-10">
          <ArticlesCarousel posts={posts} />
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
