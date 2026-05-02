import Link from 'next/link';
import { SITE } from '@/lib/site';

/* Top-bar nav modeled on https://bestlooking.skin/.
   The 4 editorial category links go to our real /<slug>/ pages.
   The 13 product-type links don't have a Strapi taxonomy yet, so they
   route to /search?q=<term> (returns relevant articles). Swap to real
   product-category routes when that taxonomy lands. */
type NavItem = { label: string; href: string };

const NAV: NavItem[] = [
  { label: 'Acne Treatment',      href: '/search?q=acne+treatment' },
  { label: 'Moisturizer',         href: '/search?q=moisturizer' },
  { label: 'Eye & Lip Care',      href: '/search?q=eye+lip+care' },
  { label: 'Vitamin C',           href: '/search?q=vitamin+c' },
  { label: 'Treatments & Serums', href: '/search?q=serum' },
  { label: 'Hyaluronic Acid',     href: '/search?q=hyaluronic+acid' },
  { label: 'Anti-Aging',          href: '/search?q=anti-aging' },
  { label: 'Salicylic Acid',      href: '/search?q=salicylic+acid' },
  { label: 'Cleanser',            href: '/search?q=cleanser' },
  { label: 'Exfoliant',           href: '/search?q=exfoliant' },
  { label: 'Toner',               href: '/search?q=toner' },
  { label: 'Sunscreen',           href: '/search?q=sunscreen' },
  { label: 'Retinol',             href: '/search?q=retinol' },
  { label: 'How-to Guides',       href: '/skincare-how-to-guides' },
  { label: 'Product Reviews',     href: '/skincare-reviews-path-to-glowing-skin' },
  { label: 'Product Comparisons', href: '/best-product-comparisons' },
  { label: 'Informative Articles',href: '/essential-guide-to-informative-articles' },
];

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-ink/10 bg-paper/95 backdrop-blur"
      data-testid="site-header"
    >
      {/* Top row: logo + search */}
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
        <Link
          href="/"
          className="block shrink-0 text-ink"
          data-testid="logo-link"
          aria-label={`${SITE.name} home`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/bestlookingskin_logo.svg"
            alt={SITE.name}
            width={580}
            height={235}
            className="h-12 w-auto sm:h-14"
          />
        </Link>

        <form
          action="/search"
          method="get"
          role="search"
          className="ml-auto hidden md:flex h-10 w-full max-w-md items-center gap-2 rounded-full border border-ink/15 bg-white px-4 transition focus-within:border-primary"
          data-testid="header-search"
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
          <label htmlFor="header-search-input" className="sr-only">Search {SITE.name}</label>
          <input
            id="header-search-input"
            type="search"
            name="q"
            placeholder="Search products, ingredients, guides…"
            className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/45"
            data-testid="header-search-input"
          />
        </form>
      </div>

      {/* Bottom row: full category nav (mirrors source bestlooking.skin) */}
      <nav
        className="border-t border-ink/10 bg-paper/95"
        data-testid="primary-nav"
        aria-label="Categories"
      >
        <div className="mx-auto max-w-7xl overflow-x-auto px-6">
          <ul className="flex min-w-max items-center gap-x-1 py-2 text-[13px] font-semibold uppercase tracking-[0.04em]">
            {NAV.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="inline-flex items-center whitespace-nowrap rounded-md px-3 py-2 text-ink/85 transition-colors hover:text-primary"
                  data-testid={`nav-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
