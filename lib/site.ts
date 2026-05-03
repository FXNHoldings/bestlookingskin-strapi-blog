export const SITE = {
  name: 'BestLooking.Skin',
  tagline: 'Your trusted partner on the journey to radiant, healthy skin.',
  description:
    'Honest skincare reviews, side-by-side product comparisons, best-of roundups and how-to guides for the products people are actually shopping for.',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://bestlookingskin.fxnstudio.com').replace(/\/$/, ''),
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
  blurb: string;
};

export const SECTIONS: Section[] = [
  {
    slug: 'product-comparisons',
    title: 'Product Comparisons',
    short: 'Comparisons',
    blurb: 'Side-by-side product breakdowns so you can pick the right routine in minutes.',
  },
  {
    slug: 'product-reviews',
    title: 'Product Reviews',
    short: 'Reviews',
    blurb: 'Hands-on reviews — what works, what doesn’t, what’s worth the money.',
  },
  {
    slug: 'top-rated-products',
    title: 'Top-Rated Products',
    short: 'Top Rated',
    blurb: 'The standouts — highest-rated picks across cleansers, serums, moisturisers and more.',
  },
  {
    slug: 'how-to-guides',
    title: 'How-to Guides',
    short: 'How-to',
    blurb: 'Step-by-step routines, layering rules and troubleshooting tips.',
  },
  {
    slug: 'informative-articles',
    title: 'Informative Articles',
    short: 'Explainers',
    blurb: 'Background reading — ingredients, skin types and the science behind the bottle.',
  },
];
