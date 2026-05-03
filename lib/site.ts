export const SITE = {
  name: 'BestLooking.Skin',
  tagline: 'Your trusted partner on the journey to radiant, healthy skin.',
  description:
    'Honest skincare reviews, side-by-side product comparisons, best-of roundups and how-to guides for the products people are actually shopping for.',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bestlooking.skin').replace(/\/$/, ''),
  amazonAffiliateTag: process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || '',
  social: {
    facebook: 'https://www.facebook.com/bestlookingskin',
    twitter: 'https://x.com/bestlookingskin',
  },
};

// Section slugs match the source WP categories on bestlooking.skin so URLs stay
// 1:1 with the migrated content (preserves SEO).
export type SectionKey =
  | 'product-comparisons'
  | 'product-reviews'
  | 'top-rated-products'
  | 'how-to-guides'
  | 'informative-articles';

export type Section = {
  slug: SectionKey;
  title: string;
  short: string;
  subtitle: string;
  blurb: string;
};

export const SECTIONS: Section[] = [
  {
    slug: 'product-comparisons',
    title: 'Product Comparisons',
    short: 'Comparisons',
    subtitle: 'Two formulas, head to head — pick the one that wins for your skin.',
    blurb:
      'Side-by-side skincare product comparisons that cut through the marketing. Each guide weighs cleansers, serums, moisturisers and sunscreens on the things that matter — ingredient profile, price per ounce and skin-type fit — so you can pick the right formula before you spend.',
  },
  {
    slug: 'product-reviews',
    title: 'Product Reviews',
    short: 'Reviews',
    subtitle: 'Tested in real routines. Honest verdicts. No sponsored gushing.',
    blurb:
      'Honest, hands-on skincare product reviews from BestLooking.Skin. We test cleansers, serums, moisturisers and masks the way readers actually use them — daily, over weeks — and report what works, what flops and whether the price tag is justified.',
  },
  {
    slug: 'top-rated-products',
    title: 'Top-Rated Products',
    short: 'Top Rated',
    subtitle: 'The best skincare products across every category, ranked.',
    blurb:
      'The standouts — top-rated skincare products across cleansers, serums, moisturisers, sunscreens and targeted treatments. Editor-picked and ranked on the criteria that matter: ingredient quality, value for money and visible results in real use.',
  },
  {
    slug: 'how-to-guides',
    title: 'How-to Guides',
    short: 'How-to',
    subtitle: 'Step-by-step routines that build better skin from the basics up.',
    blurb:
      'Step-by-step skincare guides that turn good products into a routine that actually works. Layering rules, troubleshooting tips and clear instructions for introducing actives like retinol, vitamin C and AHAs without a flare-up.',
  },
  {
    slug: 'informative-articles',
    title: 'Informative Articles',
    short: 'Explainers',
    subtitle: 'The science behind the bottle, explained in plain English.',
    blurb:
      'Background reading for anyone who wants to make smarter skincare choices. Plain-English explainers on how active ingredients like retinol, niacinamide, hyaluronic acid and AHAs/BHAs work on skin — and which marketing claims are worth trusting.',
  },
];
