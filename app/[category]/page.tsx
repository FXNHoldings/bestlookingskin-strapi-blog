import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCategory, listPosts } from '@/lib/strapi';
import { SECTIONS, SITE } from '@/lib/site';
import { postPath } from '@/lib/format';
import PostCard from '@/components/PostCard';

export const revalidate = 60;
export const dynamicParams = true;

const PAGE_SIZE = 12;

// Reserved top-level routes that aren't categories — keep them out of this segment.
const RESERVED = new Set(['about', 'search', 'feed.xml', 'sitemap.xml', 'robots.txt']);

type Params = { category: string };
type SearchParams = { page?: string };

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

  const { page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);

  const [name, res, recentRes] = await Promise.all([
    resolveCategoryName(category),
    listPosts({ category, page, pageSize: PAGE_SIZE }).catch(() => null),
    // Sidebar: 5 most recent posts across all categories
    listPosts({ pageSize: 5 }).catch(() => null),
  ]);

  const posts = res?.data ?? [];
  const recentPosts = recentRes?.data ?? [];
  const pageCount = res?.meta?.pagination?.pageCount ?? 1;

  if (page > 1 && posts.length === 0) notFound();

  const sectionMeta = SECTIONS.find((s) => s.slug === category);

  return (
    <section className="mx-auto max-w-7xl px-6 py-12" data-testid={`category-${category}`}>
      <header className="mb-10">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Category</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">{name}</h1>
        {sectionMeta && (
          <p className="mt-3 max-w-2xl text-ink/70">{sectionMeta.blurb}</p>
        )}
      </header>

      {/* 2-col layout: 20% sidebar (categories + recent posts) / 80% posts grid */}
      <div className="grid gap-10 lg:grid-cols-[1fr_4fr] lg:gap-12">
        {/* Left sidebar */}
        <aside className="space-y-10">
          {/* Categories */}
          <div className="border border-[#ddd] p-4">
            <h2 className="font-bold capitalize !text-[1.2rem] !tracking-normal !text-[#444444]">Categories</h2>
            <ul className="mt-4 space-y-1 border-t border-ink/10 pt-2">
              {SECTIONS.map((s) => {
                const active = s.slug === category;
                return (
                  <li key={s.slug}>
                    <Link
                      href={`/${s.slug}`}
                      className={`block border-b border-ink/10 py-2 text-sm transition-colors ${
                        active
                          ? 'font-semibold text-primary'
                          : 'text-ink/80 hover:text-primary'
                      }`}
                    >
                      {s.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Recent posts */}
          {recentPosts.length > 0 && (
            <div className="border border-[#ddd] p-4">
              <h2 className="font-bold capitalize !text-[1.2rem] !tracking-normal !text-[#444444]">Recent Posts</h2>
              <ul className="mt-4 space-y-3 border-t border-ink/10 pt-2">
                {recentPosts.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={postPath(p)}
                      className="block text-sm leading-snug text-ink/85 transition-colors hover:text-primary"
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Right main column */}
        <div>
          {posts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-ink/15 px-6 py-16 text-center text-ink/55">
              No posts here yet.
            </div>
          ) : (
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} variant="tile" />
              ))}
            </div>
          )}

          {pageCount > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-2 text-sm" data-testid="pagination">
              {page > 1 && (
                <Link
                  href={`/${category}${page - 1 > 1 ? `?page=${page - 1}` : ''}`}
                  className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 font-medium text-ink transition hover:border-primary hover:text-primary"
                >
                  ← Previous
                </Link>
              )}
              <span className="text-ink/55">
                Page {page} of {pageCount}
              </span>
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
  );
}
