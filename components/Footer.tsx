import Link from 'next/link';
import { SITE, SECTIONS } from '@/lib/site';
import { listCategories, listProductCategories, type BlsCategory, type BlsProductCategory } from '@/lib/strapi';

const CONNECT_TAGLINE =
  'We believe in demystifying the science behind the products, breaking down complex ' +
  'terminologies and processes into understandable information that our readers can ' +
  'apply in their skincare journey.';

const CONTACT_EMAIL = 'hello@bestlooking.skin';

export default async function Footer() {
  const year = new Date().getFullYear();
  const [postCategories, productCategories] = await Promise.all([
    listCategories().catch(() =>
      SECTIONS.map((section, index) => ({
        id: index,
        name: section.title,
        slug: section.slug,
      })) as BlsCategory[],
    ),
    listProductCategories().catch(() => [] as BlsProductCategory[]),
  ]);

  return (
    <footer className="bg-white pt-16" data-testid="site-footer">
      <div className="border-t border-ink/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[35%_20%_15%_15%_15%]">

          {/* Col 1 — Connect (no heading). */}
          <div>
            <p className="text-base font-medium leading-6 text-ink/70">{CONNECT_TAGLINE}</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="my-8 inline-block break-all font-display text-2xl font-bold text-ink transition hover:text-primary"
            >
              {CONTACT_EMAIL}
            </a>
            <div className="flex items-center gap-3" data-testid="social-links">
              <a
                href={SITE.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${SITE.name} on Facebook`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition hover:border-primary hover:text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
                  <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99h-2.5V12h2.5V9.83c0-2.47 1.47-3.84 3.73-3.84 1.08 0 2.21.19 2.21.19v2.43h-1.25c-1.23 0-1.61.76-1.61 1.55V12h2.74l-.44 2.89h-2.3v6.99A10 10 0 0 0 22 12Z" />
                </svg>
              </a>
              <a
                href={SITE.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${SITE.name} on X (Twitter)`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition hover:border-primary hover:text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
                  <path d="M18.244 2H21.5l-7.55 8.63L22.75 22h-6.96l-5.45-7.13L4.04 22H.78l8.08-9.23L1.25 2h7.13l4.93 6.52L18.244 2Zm-1.22 18h1.93L7.06 4H5.04l11.984 16Z" />
                </svg>
              </a>
              <a
                href="/feed.xml"
                aria-label={`${SITE.name} RSS feed`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition hover:border-primary hover:text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
                  <path d="M4 4v3a13 13 0 0 1 13 13h3A16 16 0 0 0 4 4Zm0 6v3a7 7 0 0 1 7 7h3a10 10 0 0 0-10-10Zm2.25 7.25a1.75 1.75 0 1 0 .001 3.501A1.75 1.75 0 0 0 6.25 17.25Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2 — About. */}
          <div className="lg:col-start-3">
            <h4 className="font-display !text-[18px] font-bold text-ink">About Us</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/"        className="text-ink/80 transition hover:text-primary">Home</Link></li>
              <li><Link href="/about"   className="text-ink/80 transition hover:text-primary">About</Link></li>
              <li><Link href="/sitemap" className="text-ink/80 transition hover:text-primary">Sitemap</Link></li>
              <li><Link href="/contact" className="text-ink/80 transition hover:text-primary">Contact</Link></li>
            </ul>
          </div>

          {/* Col 3 — Post categories */}
          <div>
            <h4 className="font-display !text-[18px] font-bold text-ink">Categories</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {postCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/${category.slug}`}
                    className="text-ink/80 transition hover:text-primary"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Product categories */}
          <div>
            <h4 className="font-display !text-[18px] font-bold text-ink">Products</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {productCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="text-ink/80 transition hover:text-primary"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom strip — legal + copyright */}
      <div className="border-t border-ink/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 px-6 py-5 text-xs text-ink/55 sm:flex-row sm:items-center sm:justify-between">
          <p className="!text-[14px] !font-normal">© {year} {SITE.name}. All Rights Reserved.</p>
          <ul className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 self-end sm:self-auto">
            <li><Link href="/legal/terms"   className="text-ink/65 transition hover:text-primary">Terms and Conditions</Link></li>
            <li><Link href="/legal/privacy" className="text-ink/65 transition hover:text-primary">Privacy Policy</Link></li>
            <li><Link href="/legal/cookies" className="text-ink/65 transition hover:text-primary">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
