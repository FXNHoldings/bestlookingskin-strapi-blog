import Link from 'next/link';
import type { Metadata } from 'next';
import { listPosts, mediaUrl } from '@/lib/strapi';
import { SECTIONS, SITE } from '@/lib/site';
import { fmtDate, firstImageUrl, postPath } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Page not found',
  description: `The page you're looking for doesn't exist on ${SITE.name}. Browse our skincare guides, reviews and top-rated products instead.`,
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  // Pull a few recent posts so a 404 isn't a dead end.
  const recent = await listPosts({ pageSize: 4 })
    .then((r) => r.data ?? [])
    .catch(() => []);

  return (
    <div data-testid="not-found">
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="font-display text-[120px] font-bold leading-none tracking-tight text-primary sm:text-[160px]">
            404
          </p>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            That page wandered off
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/70 sm:text-lg">
            The page you’re looking for doesn’t exist, has been moved, or never made it past the editor’s desk. Use the search below — or pick a section to keep browsing.
          </p>

          <form
            action="/search"
            method="get"
            role="search"
            className="mx-auto mt-8 flex h-12 w-full max-w-md items-center gap-2 rounded-full border border-ink/15 bg-white px-5 transition focus-within:border-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 shrink-0 text-ink/50"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <label htmlFor="not-found-search" className="sr-only">
              Search {SITE.name}
            </label>
            <input
              id="not-found-search"
              type="search"
              name="q"
              placeholder="Search products, ingredients, guides…"
              className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/45"
            />
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-emphasis"
            >
              Search
            </button>
          </form>

          <div className="mt-8 flex flex-wrap justify-center gap-2 text-sm">
            <Link
              href="/"
              className="inline-flex items-center rounded-full bg-ink px-4 py-2 font-semibold text-white transition hover:bg-ink/85"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 font-semibold text-ink transition hover:border-primary hover:text-primary"
            >
              All products
            </Link>
            {SECTIONS.map((s) => (
              <Link
                key={s.slug}
                href={`/${s.slug}`}
                className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 font-medium text-ink/85 transition hover:border-primary hover:text-primary"
              >
                {s.short}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Read instead</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
              Latest from {SITE.name}
            </h2>
            <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {recent.map((p) => {
                const img = mediaUrl(p.coverImage ?? null) ?? firstImageUrl(p.content);
                const cat = p.categories?.[0];
                return (
                  <article key={p.id} className="group">
                    <Link href={postPath(p)} className="block">
                      <div className="overflow-hidden rounded-md bg-[#f7f7f7]">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt={p.coverImage?.alternativeText || p.title}
                            className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="aspect-[4/3] w-full" />
                        )}
                      </div>
                      <div className="mt-3">
                        {cat && (
                          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                            {cat.name}
                          </p>
                        )}
                        <h6 className="mt-1 line-clamp-2 font-display text-base font-semibold leading-snug text-ink transition group-hover:text-primary">
                          {p.title}
                        </h6>
                        <p className="mt-1 text-xs text-ink/55">{fmtDate(p.publishedAt)}</p>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
