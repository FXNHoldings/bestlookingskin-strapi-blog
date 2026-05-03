import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn how BestLooking.Skin researches skincare products, compares formulas, reviews ingredients, and helps readers build confident routines.',
  alternates: { canonical: '/about' },
};

const METHOD = [
  {
    title: 'Formula-first research',
    text: 'We look at ingredients, product claims, use case, skin-type fit, texture, price, availability, and where a product belongs in a real routine.',
  },
  {
    title: 'Clear product comparisons',
    text: 'Our guides are written to make trade-offs visible, so you can compare similar cleansers, serums, moisturisers, toners, and treatments quickly.',
  },
  {
    title: 'Practical routine advice',
    text: 'We focus on how products work together: what to start with, what to layer carefully, and when a simpler routine may be the smarter choice.',
  },
];

const VALUES = ['Clarity over hype', 'Inclusive skincare education', 'Budget-aware recommendations', 'Transparent affiliate disclosure'];

export default function AboutPage() {
  return (
    <div data-testid="about-page">
      <section className="bg-paper">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">About Us</p>
            <h1 className="mt-4 max-w-4xl font-display font-bold leading-[1.05] tracking-tight text-ink">
              Skincare research made easier to understand.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-ink/70 sm:text-lg">
              BestLooking.Skin helps readers compare skincare products, understand ingredients,
              and build routines with more confidence. We translate product pages, ingredient
              lists, reviews, and price details into practical editorial guidance for everyday
              skincare decisions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="inline-flex items-center rounded-full bg-primary px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white transition hover:bg-primary-emphasis">
                Browse products
              </Link>
              <Link href="/informative-articles" className="inline-flex items-center rounded-full border border-ink/15 bg-white px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-ink transition hover:border-primary hover:text-primary">
                Read articles
              </Link>
            </div>
          </div>
          <ImagePlaceholder label="Editorial skincare research image placeholder" />
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Our purpose</p>
            <h2 className="mt-3 font-display font-bold tracking-tight text-ink">
              Helping you choose skincare with less confusion.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-7 text-ink/72">
            <p>
              The skincare market is crowded with bold claims, trending ingredients, and product
              launches that can make a simple routine feel complicated. Our job is to slow that down.
              We organize information so you can see what a product is designed to do, who it may
              suit, and whether it makes sense for your skin goals.
            </p>
            <p>
              We cover product reviews, side-by-side comparisons, how-to guides, and ingredient-led
              explainers. The goal is not to tell every reader to buy the same thing. It is to give
              you enough context to make a choice that fits your skin, your preferences, and your
              budget.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">How we work</p>
            <h2 className="mt-3 font-display font-bold tracking-tight text-ink">
              A practical review process for real routines.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {METHOD.map((item) => (
              <article key={item.title} className="rounded border border-ink/10 bg-white p-6">
                <h3 className="font-display font-bold text-ink">{item.title}</h3>
                <p className="mt-4 text-base leading-7 text-ink/70">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:gap-16">
          <ImagePlaceholder label="Skincare products flat-lay image placeholder" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">What we value</p>
            <h2 className="mt-3 font-display font-bold tracking-tight text-ink">
              Useful guidance, not skincare noise.
            </h2>
            <p className="mt-5 text-base leading-7 text-ink/70">
              Every article is built for readers who want skincare information they can actually use.
              We prefer clear explanations, honest limitations, and recommendations that acknowledge
              different skin types, sensitivities, budgets, and levels of experience.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {VALUES.map((value) => (
                <li key={value} className="rounded border border-ink/10 bg-paper px-4 py-3 text-sm font-medium text-ink/75">
                  {value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Disclosure</p>
            <h2 className="mt-3 font-display font-bold tracking-tight text-white">
              Reader trust comes first.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-7 text-white/72">
            <p>
              BestLooking.Skin may earn a commission when readers buy through affiliate links,
              including qualifying purchases as an Amazon Associate. This does not add extra cost
              for you, and it helps support our research, publishing, and site maintenance.
            </p>
            <p>
              Affiliate relationships do not change the goal of our content: to make skincare
              shopping easier to understand. We aim to explain why a product may be worth considering,
              where it may fall short, and what kind of routine it fits best.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded border border-dashed border-ink/20 bg-[#f0f2f4] px-6 text-center text-sm font-medium uppercase tracking-[0.18em] text-ink/45">
      {label}
    </div>
  );
}
