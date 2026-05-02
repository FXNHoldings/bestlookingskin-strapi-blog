import Link from 'next/link';
import type { Metadata } from 'next';
import { listAllPostSlugs, listCategories, type BlsCategory } from '@/lib/strapi';
import { SECTIONS, SITE } from '@/lib/site';
import { fmtDate } from '@/lib/format';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Site Map',
  description: `Browse every page on ${SITE.name} — categories, posts, about, contact and the XML feed.`,
  alternates: { canonical: '/sitemap' },
};

type PostSlug = { slug: string; category: string; updatedAt: string };

export default async function HtmlSitemapPage() {
  const [posts, cmsCats]: [PostSlug[], BlsCategory[]] = await Promise.all([
    listAllPostSlugs().catch(() => [] as PostSlug[]),
    listCategories().catch(() => [] as BlsCategory[]),
  ]);

  // Group posts by their primary category slug for the listing
  const byCat = new Map<string, PostSlug[]>();
  for (const p of posts) {
    if (!byCat.has(p.category)) byCat.set(p.category, []);
    byCat.get(p.category)!.push(p);
  }

  // Use config sections for stable display order; fall back to whatever else
  // came from the CMS or got tagged with an unknown slug.
  const orderedCats = [
    ...SECTIONS.map((s) => ({ slug: s.slug, name: s.title })),
    ...cmsCats
      .filter((c) => !SECTIONS.some((s) => s.slug === c.slug))
      .map((c) => ({ slug: c.slug, name: c.name })),
  ];

  return (
    <div data-testid="sitemap-page">
      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Site map</p>
          <h1 className="mt-4 font-display font-bold leading-tight tracking-tight text-ink">
            Everything on {SITE.name}.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ink/70 sm:text-lg">
            A human-readable index of every page. For machines see{' '}
            <Link href="/sitemap.xml" className="text-primary underline-offset-2 hover:underline">
              /sitemap.xml
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6">
          {/* Top-level pages */}
          <div className="grid gap-10 lg:grid-cols-[1fr_3fr] lg:gap-16">
            <h2 className="font-display font-bold text-ink">Pages</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SiteLink href="/">Home</SiteLink>
              <SiteLink href="/about">About us</SiteLink>
              <SiteLink href="/contact">Contact us</SiteLink>
              <SiteLink href="/search">Search</SiteLink>
              <SiteLink href="/feed.xml">RSS feed</SiteLink>
              <SiteLink href="/sitemap.xml">XML sitemap</SiteLink>
            </ul>
          </div>

          <hr className="my-12 border-ink/10" />

          {/* Categories + posts */}
          <div className="grid gap-10 lg:grid-cols-[1fr_3fr] lg:gap-16">
            <div>
              <h2 className="font-display font-bold text-ink">Categories &amp; posts</h2>
              <p className="mt-2 text-sm text-ink/55">
                {posts.length} posts across {orderedCats.filter((c) => byCat.get(c.slug)?.length).length} categories.
              </p>
            </div>
            <div className="space-y-10">
              {orderedCats.map(({ slug, name }) => {
                const items = byCat.get(slug) ?? [];
                if (items.length === 0) return null;
                return (
                  <div key={slug} data-testid={`sitemap-cat-${slug}`}>
                    <Link
                      href={`/${slug}`}
                      className="group inline-flex items-baseline gap-3 font-display font-bold text-ink hover:text-primary"
                    >
                      {name}
                      <span className="text-xs font-medium text-ink/45">{items.length} posts</span>
                    </Link>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {items.map((p) => (
                        <li key={p.slug}>
                          <Link
                            href={`/${slug}/${p.slug}`}
                            className="group flex items-baseline justify-between gap-4 rounded-lg px-3 py-2 transition hover:bg-paper"
                          >
                            <span className="truncate text-sm text-ink/80 group-hover:text-primary">
                              {humanizeSlug(p.slug)}
                            </span>
                            <span className="shrink-0 text-[11px] text-ink/40">
                              {fmtDate(p.updatedAt)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SiteLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper/40 px-4 py-2 text-sm text-ink transition hover:border-primary hover:text-primary"
      >
        {children}
      </Link>
    </li>
  );
}

function humanizeSlug(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
