import Link from 'next/link';
import type { Metadata } from 'next';
import { listProducts, listProductCategories, listProductBrands, type BlsProduct } from '@/lib/strapi';
import ProductCard from '@/components/ProductCard';
import { SITE } from '@/lib/site';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Skincare Products',
  description: `Browse skincare products on ${SITE.name} — search by category, brand, skin type or price.`,
  alternates: { canonical: '/products' },
};

type SearchParams = {
  q?: string;
  category?: string;
  brand?: string;
  skinType?: string;
  sort?: string;
  page?: string;
  view?: string;
};

const PAGE_SIZE = 24;
const VALID_SORTS = ['newest', 'price-asc', 'price-desc', 'rating-desc'] as const;
type Sort = (typeof VALID_SORTS)[number];
const VALID_VIEWS = ['2', '3', '4'] as const;
type View = (typeof VALID_VIEWS)[number];
const VIEW_GRID: Record<View, string> = {
  '2': 'sm:grid-cols-2 lg:grid-cols-2',
  '3': 'sm:grid-cols-2 lg:grid-cols-3',
  '4': 'sm:grid-cols-2 lg:grid-cols-4',
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q, category, brand, skinType, sort: sortRaw, page: pageRaw, view: viewRaw } = await searchParams;
  const query = (q ?? '').trim();
  const page = Math.max(1, Number(pageRaw) || 1);
  const sort: Sort = (VALID_SORTS as readonly string[]).includes(sortRaw ?? '')
    ? (sortRaw as Sort)
    : 'newest';
  const view: View = (VALID_VIEWS as readonly string[]).includes(viewRaw ?? '')
    ? (viewRaw as View)
    : '4';

  const [res, categories, brands] = await Promise.all([
    listProducts({
      q: query || undefined,
      category: category || undefined,
      brand: brand || undefined,
      skinType: skinType || undefined,
      sort,
      page,
      pageSize: PAGE_SIZE,
    }).catch(() => null),
    listProductCategories().catch(() => []),
    listProductBrands().catch(() => []),
  ]);

  const products: BlsProduct[] = res?.data ?? [];
  const total = res?.meta?.pagination?.total ?? 0;
  const pageCount = res?.meta?.pagination?.pageCount ?? 1;
  const activeCategory = category ? categories.find((c) => c.slug === category) : null;
  const pageTitle = activeCategory?.name ?? 'Skincare Products';
  const pageDescription = activeCategory
    ? activeCategory.description?.trim() ||
      `Browse our ${activeCategory.name.toLowerCase()} selection — handpicked products our editors trust, with current prices, ingredient notes and routine guidance.`
    : "Searchable catalog of the products we've covered. Filter by category, brand or skin type.";

  // Build query-string preservers for filter links
  const baseQs = new URLSearchParams();
  if (query) baseQs.set('q', query);
  if (sort !== 'newest') baseQs.set('sort', sort);
  if (view !== '4') baseQs.set('view', view);

  return (
    <div data-testid="products-page">
      <section className="bg-paper py-12">
        <div className="mx-auto max-w-7xl px-6">
          <p>
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-normal text-blue-700">
              Product Category
            </span>
          </p>
          <h1 className="mt-3 font-display font-bold tracking-tight text-ink">
            {pageTitle}
          </h1>
          <p className="mt-3 max-w-2xl text-[18px] leading-7 text-ink/70">
            {pageDescription}
          </p>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
          {/* Filters sidebar */}
          <aside className="space-y-8" aria-label="Filters">
            {categories.length > 0 && (
              <div>
                <h6 className="font-display text-base font-bold capitalize tracking-wider text-ink">Category</h6>
                <ul className="mt-3 space-y-1 text-sm">
                  <li>
                    <FilterLink active={!category} href={withoutKey(baseQs, 'category')}>
                      All categories
                    </FilterLink>
                  </li>
                  {categories.map((c) => (
                    <li key={c.id}>
                      <FilterLink
                        active={category === c.slug}
                        href={withParam(baseQs, 'category', c.slug)}
                      >
                        {c.name}
                      </FilterLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {brands.length > 0 && (
              <div>
                <h6 className="font-display text-base font-bold capitalize tracking-wider text-ink">Brand</h6>
                <ul className="mt-3 space-y-1 text-sm">
                  <li>
                    <FilterLink active={!brand} href={withoutKey(baseQs, 'brand')}>
                      All brands
                    </FilterLink>
                  </li>
                  {brands.map((b) => (
                    <li key={b.id}>
                      <FilterLink
                        active={brand === b.slug}
                        href={withParam(baseQs, 'brand', b.slug)}
                      >
                        {b.name}
                      </FilterLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h6 className="font-display text-base font-bold capitalize tracking-wider text-ink">Skin type</h6>
              <ul className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                {['dry', 'oily', 'sensitive', 'combination', 'normal', 'mature'].map((s) => (
                  <li key={s}>
                    <FilterLink
                      pill
                      active={skinType === s}
                      href={skinType === s ? withoutKey(baseQs, 'skinType') : withParam(baseQs, 'skinType', s)}
                    >
                      {s}
                    </FilterLink>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Results */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4">
              <p className="text-sm text-ink/55">
                {total === 0 ? 'No products' : `${total} product${total === 1 ? '' : 's'}`}
                {(category || brand || skinType || query) && (
                  <>
                    {' '}for
                    {query && <span className="ml-1 text-ink">“{query}”</span>}
                    {category && <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs text-ink">category: {category}</span>}
                    {brand && <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs text-ink">brand: {brand}</span>}
                    {skinType && <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs text-ink">skin: {skinType}</span>}
                  </>
                )}
              </p>
              <div className="flex items-center gap-3">
                <ViewSwitcher current={view} baseQs={baseQs} />
                <SortDropdown current={sort} baseQs={baseQs} />
              </div>
            </div>

            {products.length > 0 ? (
              <div className={`mt-8 grid gap-x-6 gap-y-10 ${VIEW_GRID[view]}`}>
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} variant="tile" />
                ))}
              </div>
            ) : (
              <div className="mt-12 rounded-3xl border border-dashed border-ink/15 px-6 py-16 text-center text-ink/55">
                <p className="text-base">No products found.</p>
                <p className="mt-2 text-sm">
                  Try adjusting your filters or{' '}
                  <Link href="/products" className="font-medium text-primary hover:underline">
                    clear all
                  </Link>
                  .
                </p>
              </div>
            )}

            {pageCount > 1 && (
              <nav className="mt-12 flex items-center justify-center gap-3 text-sm">
                {page > 1 && (
                  <Link
                    href={`/products?${withParam(baseQs, 'page', String(page - 1))}`}
                    className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 font-medium text-ink transition hover:border-primary hover:text-primary"
                  >
                    ← Previous
                  </Link>
                )}
                <span className="text-ink/55">Page {page} of {pageCount}</span>
                {page < pageCount && (
                  <Link
                    href={`/products?${withParam(baseQs, 'page', String(page + 1))}`}
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

function FilterLink({
  href,
  active,
  pill,
  children,
}: {
  href: string;
  active: boolean;
  pill?: boolean;
  children: React.ReactNode;
}) {
  if (pill) {
    return (
      <Link
        href={`/products?${href}`}
        className={
          active
            ? 'inline-flex items-center rounded-full bg-primary px-3 py-1.5 text-white capitalize'
            : 'inline-flex items-center rounded-full border border-ink/15 px-3 py-1.5 text-ink/70 capitalize transition hover:border-primary hover:text-primary'
        }
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      href={`/products?${href}`}
      className={
        active
          ? 'block rounded-md bg-primary/10 px-3 py-1.5 font-semibold text-primary'
          : 'block rounded-md px-3 py-1.5 text-ink/75 transition hover:bg-paper/60 hover:text-ink'
      }
    >
      {children}
    </Link>
  );
}

function ViewSwitcher({ current, baseQs }: { current: View; baseQs: URLSearchParams }) {
  const opts: { v: View; label: string }[] = [
    { v: '2', label: '2 cols' },
    { v: '3', label: '3 cols' },
    { v: '4', label: '4 cols' },
  ];
  return (
    <div className="hidden items-center gap-1 lg:flex" role="group" aria-label="Grid columns">
      <span className="mr-1 text-xs text-ink/55">View:</span>
      {opts.map((o) => {
        const next = new URLSearchParams(baseQs.toString());
        if (o.v === '4') next.delete('view');
        else next.set('view', o.v);
        next.delete('page');
        const href = `/products${next.toString() ? `?${next}` : ''}`;
        const active = current === o.v;
        return (
          <Link
            key={o.v}
            href={href}
            aria-pressed={active}
            className={
              active
                ? 'rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-white'
                : 'rounded-md border border-ink/15 px-2.5 py-1 text-xs text-ink/70 hover:border-primary hover:text-primary'
            }
          >
            {o.label}
          </Link>
        );
      })}
    </div>
  );
}

function SortDropdown({ current, baseQs }: { current: Sort; baseQs: URLSearchParams }) {
  const opts: { v: Sort; l: string }[] = [
    { v: 'newest',      l: 'Newest' },
    { v: 'price-asc',   l: 'Price: low to high' },
    { v: 'price-desc',  l: 'Price: high to low' },
    { v: 'rating-desc', l: 'Top rated' },
  ];
  return (
    <form action="/products" method="get" className="flex items-center gap-2 text-sm text-ink/70">
      {/* Preserve other filters */}
      {Array.from(baseQs.entries()).map(([k, v]) =>
        k === 'sort' ? null : <input key={k} type="hidden" name={k} value={v} />,
      )}
      <label htmlFor="sort-select">Sort:</label>
      <select
        id="sort-select"
        name="sort"
        defaultValue={current}
        className="rounded-md border border-ink/15 bg-white px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
      >
        {opts.map((o) => (
          <option key={o.v} value={o.v}>{o.l}</option>
        ))}
      </select>
      <button type="submit" className="inline-flex items-center justify-center rounded-md bg-ink/5 px-3 py-1.5 text-xs font-bold uppercase leading-none tracking-wider text-ink hover:bg-ink/10">
        Apply
      </button>
    </form>
  );
}

function withParam(qs: URLSearchParams, key: string, value: string): string {
  const next = new URLSearchParams(qs.toString());
  next.set(key, value);
  next.delete('page');
  return next.toString();
}

function withoutKey(qs: URLSearchParams, key: string): string {
  const next = new URLSearchParams(qs.toString());
  next.delete(key);
  next.delete('page');
  return next.toString();
}
