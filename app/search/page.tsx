import Link from 'next/link';
import type { Metadata } from 'next';
import { listPosts, listProducts, type BlsPost, type BlsProduct } from '@/lib/strapi';
import PostCard from '@/components/PostCard';
import ProductCard from '@/components/ProductCard';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Search',
  alternates: { canonical: '/search' },
};

type SearchParams = { q?: string; page?: string; type?: 'all' | 'posts' | 'products' };

const PAGE_SIZE = 12;

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q, page: pageRaw, type: typeRaw } = await searchParams;
  const query = (q ?? '').trim();
  const page = Math.max(1, Number(pageRaw) || 1);
  const type: 'all' | 'posts' | 'products' = typeRaw === 'posts' || typeRaw === 'products' ? typeRaw : 'all';

  // Fetch in parallel; on the "all" tab fetch a small slice of each, on a
  // tab-specific tab paginate that one type fully.
  const wantPosts    = type === 'all' || type === 'posts';
  const wantProducts = type === 'all' || type === 'products';

  const [postsRes, productsRes] = await Promise.all([
    wantPosts
      ? listPosts({ q: query, page, pageSize: type === 'posts' ? PAGE_SIZE : 6 })
          .catch(() => null)
      : Promise.resolve(null),
    wantProducts
      ? listProducts({ q: query, page, pageSize: type === 'products' ? PAGE_SIZE : 8 })
          .catch(() => null)
      : Promise.resolve(null),
  ]);

  const posts: BlsPost[] = postsRes?.data ?? [];
  const products: BlsProduct[] = productsRes?.data ?? [];
  const postsTotal = postsRes?.meta?.pagination?.total ?? 0;
  const productsTotal = productsRes?.meta?.pagination?.total ?? 0;
  const totalAll = postsTotal + productsTotal;

  // Pagination is only meaningful on type-specific tabs
  const pageCount =
    type === 'posts'
      ? postsRes?.meta?.pagination?.pageCount ?? 1
      : type === 'products'
        ? productsRes?.meta?.pagination?.pageCount ?? 1
        : 1;

  const tabs = [
    { key: 'all',      label: `All (${totalAll})` },
    { key: 'posts',    label: `Articles (${postsTotal})` },
    { key: 'products', label: `Products (${productsTotal})` },
  ] as const;

  return (
    <section className="mx-auto max-w-7xl px-6 py-12" data-testid="search-page">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Search</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {query ? <>Results for “{query}”</> : 'Search'}
        </h1>

        <form
          action="/search"
          method="get"
          className="mt-6 flex h-12 max-w-xl items-center gap-2 rounded-full border border-ink/15 bg-white px-5 transition focus-within:border-primary"
        >
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search articles, products, brands, ingredients…"
            className="h-full w-full bg-transparent text-base text-ink outline-none placeholder:text-ink/45"
            aria-label="Search"
          />
          {/* Preserve current tab when re-submitting */}
          {type !== 'all' && <input type="hidden" name="type" value={type} />}
          <button type="submit" className="text-sm font-bold uppercase tracking-wider text-primary">
            Search
          </button>
        </form>

        {/* Type tabs */}
        {query && (
          <nav
            className="mt-6 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider"
            aria-label="Search filters"
          >
            {tabs.map((t) => {
              const active = t.key === type;
              const href =
                t.key === 'all'
                  ? `/search?q=${encodeURIComponent(query)}`
                  : `/search?q=${encodeURIComponent(query)}&type=${t.key}`;
              return (
                <Link
                  key={t.key}
                  href={href}
                  className={
                    active
                      ? 'rounded-full bg-primary px-4 py-2 text-white'
                      : 'rounded-full border border-ink/15 px-4 py-2 text-ink transition hover:border-primary hover:text-primary'
                  }
                  aria-current={active ? 'page' : undefined}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* PRODUCTS — shown on All tab and on the dedicated products tab */}
      {wantProducts && products.length > 0 && (
        <section className="mt-12" data-testid="search-products">
          {type === 'all' && (
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Products</h2>
              {productsTotal > products.length && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&type=products`}
                  className="text-sm font-bold uppercase tracking-wider text-primary hover:underline"
                >
                  See all {productsTotal} →
                </Link>
              )}
            </div>
          )}
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} variant="tile" />
            ))}
          </div>
        </section>
      )}

      {/* ARTICLES */}
      {wantPosts && posts.length > 0 && (
        <section className="mt-12" data-testid="search-posts">
          {type === 'all' && (
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Articles</h2>
              {postsTotal > posts.length && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&type=posts`}
                  className="text-sm font-bold uppercase tracking-wider text-primary hover:underline"
                >
                  See all {postsTotal} →
                </Link>
              )}
            </div>
          )}
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} variant="tile" />
            ))}
          </div>
        </section>
      )}

      {/* No-results state */}
      {query && totalAll === 0 && (
        <div className="mt-16 rounded-3xl border border-dashed border-ink/15 px-6 py-16 text-center text-ink/55">
          <p className="text-base">No results for <span className="font-semibold text-ink">“{query}”</span>.</p>
          <p className="mt-2 text-sm">Try different keywords or browse from the home page.</p>
        </div>
      )}

      {/* Pagination — only on type-specific tabs */}
      {type !== 'all' && pageCount > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-3 text-sm">
          {page > 1 && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}&type=${type}${page - 1 > 1 ? `&page=${page - 1}` : ''}`}
              className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 font-medium text-ink transition hover:border-primary hover:text-primary"
            >
              ← Previous
            </Link>
          )}
          <span className="text-ink/55">Page {page} of {pageCount}</span>
          {page < pageCount && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}&type=${type}&page=${page + 1}`}
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
