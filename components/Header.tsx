import Link from 'next/link';
import { SECTIONS, SITE } from '@/lib/site';
import { listProductCategories } from '@/lib/strapi';

type NavItem = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};

export default async function Header() {
  const productCategories = await listProductCategories().catch(() => []);
  const nav: NavItem[] = [
    {
      label: 'Products',
      href: '/products',
      children: [
        { label: 'All Products', href: '/products' },
        ...productCategories.map((category) => ({
          label: category.name,
          href: `/products?category=${encodeURIComponent(category.slug)}`,
        })),
      ],
    },
    { label: 'Brands', href: '/brands' },
    {
      label: 'Articles',
      href: '/informative-articles',
      children: [
        { label: 'All Articles', href: '/informative-articles' },
        ...SECTIONS.map((section) => ({
          label: section.title,
          href: `/${section.slug}`,
        })),
      ],
    },
    { label: 'Get in Touch', href: '/contact' },
  ];

  return (
    <header
      className="sticky top-0 z-50 border-b border-ink/10 bg-white backdrop-blur"
      data-testid="site-header"
    >
      {/* Single row: logo + search (next to logo) + nav (right-aligned). On
          smaller screens (< lg) the nav drops to a second row underneath so
          everything stays usable on tablet/mobile. */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-3">
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
            width={320}
            height={100}
            className="h-12 w-auto sm:h-14"
          />
        </Link>

        <form
          action="/search"
          method="get"
          role="search"
          className="hidden md:flex h-10 w-full max-w-sm items-center gap-2 rounded-full border border-ink/15 bg-white px-4 transition focus-within:border-primary"
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

        {/* Category nav: dropdowns are visible on desktop; smaller screens keep
            horizontal scrolling so the top bar remains usable. */}
        <nav
          className="order-3 ml-auto w-full overflow-x-auto lg:order-none lg:w-auto lg:overflow-visible"
          data-testid="primary-nav"
          aria-label="Categories"
        >
          <ul className="flex min-w-max items-center justify-end gap-x-8 !text-[16px] !font-semibold capitalize tracking-normal">
            {nav.map((item) => {
              const testId = `nav-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
              const linkClass =
                'inline-flex items-center gap-1 whitespace-nowrap rounded-md px-0 py-2 text-ink/85 transition-colors hover:text-primary';
              if (!item.children) {
                return (
                  <li key={item.label}>
                    <Link href={item.href!} className={linkClass} data-testid={testId}>
                      {item.label}
                    </Link>
                  </li>
                );
              }
              // Dropdown — open on hover or keyboard focus-within. Pure CSS,
              // no client component needed.
              return (
                <li key={item.label} className="group relative">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    className={linkClass}
                    data-testid={testId}
                  >
                    {item.label}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                      className="transition-transform group-hover:rotate-180 group-focus-within:rotate-180"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <span className="absolute left-0 right-0 top-full hidden h-2 lg:block" aria-hidden />
                  <ul
                    role="menu"
                    className="invisible absolute right-0 top-[calc(100%+0.5rem)] z-20 min-w-[14rem] rounded-md border border-ink/10 bg-paper py-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
                    data-testid={`${testId}-dropdown`}
                  >
                    {item.children.map((child) => (
                      <li key={child.label} role="none">
                        <Link
                          href={child.href}
                          role="menuitem"
                          className="block whitespace-nowrap px-4 py-2 text-base !font-medium text-ink/85 transition-colors hover:bg-muted hover:text-primary"
                          data-testid={`nav-${child.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
