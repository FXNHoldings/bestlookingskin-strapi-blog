import Link from 'next/link';
import type { Metadata } from 'next';
import { listPosts } from '@/lib/strapi';
import PostCard from '@/components/PostCard';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Search',
  alternates: { canonical: '/search' },
};

type SearchParams = { q?: string; page?: string };

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q, page: pageRaw } = await searchParams;
  const query = (q ?? '').trim();
  const page = Math.max(1, Number(pageRaw) || 1);
  const PAGE_SIZE = 12;

  const res = query
    ? await listPosts({ q: query, page, pageSize: PAGE_SIZE }).catch(() => null)
    : null;
  const posts = res?.data ?? [];
  const total = res?.meta?.pagination?.total ?? 0;
  const pageCount = res?.meta?.pagination?.pageCount ?? 1;

  return (
    <section className="mx-auto max-w-7xl px-6 py-12" data-testid="search-page">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Search</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {query ? <>Results for “{query}”</> : 'Search'}
        </h1>

        <form action="/search" method="get" className="mt-6 flex h-12 max-w-xl items-center gap-2 rounded-full border border-ink/15 bg-white px-5 transition focus-within:border-primary">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search products, brands, guides…"
            className="h-full w-full bg-transparent text-base text-ink outline-none placeholder:text-ink/45"
            aria-label="Search"
          />
          <button type="submit" className="text-sm font-bold uppercase tracking-wider text-primary">
            Search
          </button>
        </form>

        {query && (
          <p className="mt-4 text-sm text-ink/55">
            {total === 0 ? 'No results' : `${total} result${total === 1 ? '' : 's'}`}
          </p>
        )}
      </header>

      {posts.length > 0 && (
        <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} variant="tile" />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-3 text-sm">
          {page > 1 && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}${page - 1 > 1 ? `&page=${page - 1}` : ''}`}
              className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 font-medium text-ink transition hover:border-primary hover:text-primary"
            >
              ← Previous
            </Link>
          )}
          <span className="text-ink/55">Page {page} of {pageCount}</span>
          {page < pageCount && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
              className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 font-medium text-ink transition hover:border-primary hover:text-primary"
            >
              Next →
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
