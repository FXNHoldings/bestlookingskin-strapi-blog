import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCategory, listPosts, mediaUrl } from '@/lib/strapi';
import { SECTIONS, SITE } from '@/lib/site';
import { firstImageUrl, fmtDate, postPath } from '@/lib/format';
import PostCard from '@/components/PostCard';

export const revalidate = 60;
export const dynamicParams = true;

const PAGE_SIZE = 12;

// Reserved top-level routes that aren't categories — keep them out of this segment.
const RESERVED = new Set(['about', 'brands', 'search', 'newhome', 'feed.xml', 'sitemap.xml', 'robots.txt']);

type Params = { category: string };
type SearchParams = { page?: string; sort?: string };

function isReserved(slug: string) {
  return RESERVED.has(slug);
}

async function resolveCategoryName(slug: string): Promise<string> {
  const fromCms = await getCategory(slug).catch(() => null);
  if (fromCms?.name) return fromCms.name;
  const fromConfig = SECTIONS.find((s) => s.slug === slug);
  return fromConfig?.title ?? slug.replace(/-/g, ' ');
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category } = await params;
  if (isReserved(category)) return {};
  const name = await resolveCategoryName(category);
  return {
    title: name,
    description: `${name} from ${SITE.name} — ${SITE.tagline}`,
    alternates: { canonical: `/${category}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { category } = await params;
  if (isReserved(category)) notFound();

  const { page: pageRaw, sort: sortRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const sort: 'newest' | 'oldest' = sortRaw === 'oldest' ? 'oldest' : 'newest';

  const [name, res, recentRes] = await Promise.all([
    resolveCategoryName(category),
    listPosts({ category, page, pageSize: PAGE_SIZE }).catch(() => null),
    // Sidebar: 5 most recent posts across all categories
    listPosts({ pageSize: 5 }).catch(() => null),
  ]);

  const allPosts = res?.data ?? [];
  // Client-side sort flip — listPosts always returns newest-first; reverse for oldest.
  const posts = sort === 'oldest' ? [...allPosts].reverse() : allPosts;
  const recentPosts = recentRes?.data ?? [];
  const pageCount = res?.meta?.pagination?.pageCount ?? 1;
  const totalPosts = res?.meta?.pagination?.total ?? posts.length;

  if (page > 1 && posts.length === 0) notFound();

  const sectionMeta = SECTIONS.find((s) => s.slug === category);

  return (
    <div data-testid={`category-${category}`}>
      <section className="bg-paper py-12">
        <div className="mx-auto max-w-7xl px-6">
          <p>
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-normal text-blue-700">
              Category
            </span>
          </p>
          <h1 className="mt-3 font-display font-bold tracking-tight text-ink">
            {name}
          </h1>
          {sectionMeta && (
            <>
              <p className="mt-2 max-w-3xl font-display text-[18px] font-medium leading-7 text-ink/85">
                {sectionMeta.subtitle}
              </p>
              <p className="mt-3 text-[20px] leading-8 text-ink/70">
                {sectionMeta.blurb}
              </p>
            </>
          )}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
          {/* Left sidebar: categories + recent posts */}
          <aside className="space-y-8" aria-label="Filters">
            <div className="border border-[#ddd] p-4">
              <h6 className="font-display text-base font-bold capitalize tracking-wider text-ink">Category</h6>
              <ul className="mt-3 space-y-1 text-sm">
                {SECTIONS.map((s) => {
                  const active = s.slug === category;
                  return (
                    <li key={s.slug}>
                      <Link
                        href={`/${s.slug}`}
                        className={
                          active
                            ? 'block rounded-md bg-primary/10 px-3 py-1.5 font-semibold text-primary'
                            : 'block rounded-md px-3 py-1.5 text-ink/75 transition hover:bg-paper/60 hover:text-ink'
                        }
                      >
                        {s.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {recentPosts.length > 0 && (
              <div className="border border-[#ddd] p-4">
                <h6 className="font-display text-base font-bold capitalize tracking-wider text-ink">Recent posts</h6>
                <ul className="mt-3 space-y-4">
                  {recentPosts.map((p) => {
                    const img = mediaUrl(p.coverImage ?? null) ?? firstImageUrl(p.content);
                    return (
                      <li key={p.id}>
                        <Link
                          href={postPath(p)}
                          className="group grid grid-cols-[64px_minmax(0,1fr)] items-start gap-3 text-sm leading-snug text-ink/85 transition-colors hover:text-primary"
                        >
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={img}
                              alt={p.coverImage?.alternativeText || p.title}
                              className="aspect-square w-full rounded object-cover"
                            />
                          ) : (
                            <div className="aspect-square w-full rounded bg-muted" />
                          )}
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-[14px] font-medium">{p.title}</p>
                            <p className="mt-1 text-xs text-ink/55">{fmtDate(p.publishedAt)}</p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </aside>

          {/* Results */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4" data-testid="filters-bar">
              <p className="text-sm text-ink/55">
                {totalPosts === 0 ? 'No posts' : `${totalPosts} post${totalPosts === 1 ? '' : 's'}`}
              </p>
              <div className="flex items-center gap-2 text-sm text-ink/70">
                <span>Sort:</span>
                <Link
                  href={`/${category}${page > 1 ? `?page=${page}` : ''}`}
                  className={
                    sort === 'newest'
                      ? 'rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-white'
                      : 'rounded-md border border-ink/15 px-2.5 py-1 text-xs text-ink/70 hover:border-primary hover:text-primary'
                  }
                >
                  Newest
                </Link>
                <Link
                  href={`/${category}?sort=oldest${page > 1 ? `&page=${page}` : ''}`}
                  className={
                    sort === 'oldest'
                      ? 'rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-white'
                      : 'rounded-md border border-ink/15 px-2.5 py-1 text-xs text-ink/70 hover:border-primary hover:text-primary'
                  }
                >
                  Oldest
                </Link>
              </div>
            </div>

            {posts.length === 0 ? (
              <div className="mt-12 rounded-3xl border border-dashed border-ink/15 px-6 py-16 text-center text-ink/55">
                <p className="text-base">No posts here yet.</p>
              </div>
            ) : (
              <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {posts.map((p) => (
                  <PostCard key={p.id} post={p} variant="tile" />
                ))}
              </div>
            )}

            {pageCount > 1 && (
              <nav className="mt-12 flex items-center justify-center gap-3 text-sm" data-testid="pagination">
                {page > 1 && (
                  <Link
                    href={`/${category}${page - 1 > 1 ? `?page=${page - 1}` : ''}`}
                    className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 font-medium text-ink transition hover:border-primary hover:text-primary"
                  >
                    ← Previous
                  </Link>
                )}
                <span className="text-ink/55">Page {page} of {pageCount}</span>
                {page < pageCount && (
                  <Link
                    href={`/${category}?page=${page + 1}`}
                    className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 font-medium text-ink transition hover:border-primary hover:text-primary"
                  >
                    Next →
                  </Link>
                )}
              </nav>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
