import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About Us',
  description: `About ${SITE.name} — ${SITE.tagline}`,
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div data-testid="about-page">
      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">About</p>
          <h1 className="mt-4 font-display font-bold leading-[1.05] tracking-tight text-ink">
            About {SITE.name}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-ink/70 sm:text-lg">
            {SITE.tagline} {SITE.name} is an editorial site dedicated to helping you build the
            skincare routine that actually works for your skin — from cleansers and serums to
            moisturisers, sunscreen and beyond.
          </p>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="font-display font-bold text-ink">Honest reviews</h2>
            <p className="mt-4 text-base leading-7 text-ink/70">
              Hands-on takes on the products people are actually shopping for. We don&apos;t do paid
              placements — every recommendation reflects what we&apos;d use ourselves.
            </p>
          </div>
          <div>
            <h2 className="font-display font-bold text-ink">Side-by-side comparisons</h2>
            <p className="mt-4 text-base leading-7 text-ink/70">
              Ingredient lists, prices and skin-type fits, presented head-to-head. The trade-offs
              are explicit so you can decide in minutes.
            </p>
          </div>
          <div>
            <h2 className="font-display font-bold text-ink">How-to guides</h2>
            <p className="mt-4 text-base leading-7 text-ink/70">
              Step-by-step routines, layering rules, and what to do when something doesn&apos;t work.
            </p>
          </div>
          <div>
            <h2 className="font-display font-bold text-ink">Affiliate disclosure</h2>
            <p className="mt-4 text-base leading-7 text-ink/70">
              When you click through and buy through our links we may earn a small commission — at
              no extra cost to you. As an Amazon Associate we earn from qualifying purchases.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-3xl px-6 text-center">
          <h2 className="font-display font-bold tracking-tight text-ink">Start exploring.</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/best-product-comparisons" className="inline-flex items-center rounded-full bg-primary px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white transition hover:bg-primary-emphasis">
              Browse comparisons
            </Link>
            <Link href="/skincare-reviews-path-to-glowing-skin" className="inline-flex items-center rounded-full border border-ink/15 px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-ink transition hover:border-primary hover:text-primary">
              Read reviews
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
