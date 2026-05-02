import type { MetadataRoute } from 'next';
import { listAllPostSlugs, listCategories } from '@/lib/strapi';
import { SECTIONS, SITE } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [posts, cmsCategories] = await Promise.all([
    listAllPostSlugs().catch(() => []),
    listCategories().catch(() => []),
  ]);

  const cmsCatSlugs = new Set(cmsCategories.map((c) => c.slug));
  const sectionCatSlugs = SECTIONS.map((s) => s.slug);
  const categorySlugs = Array.from(new Set([...cmsCatSlugs, ...sectionCatSlugs]));

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE.url}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE.url}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE.url}/sitemap`, lastModified: now, changeFrequency: 'weekly', priority: 0.3 },
    { url: `${SITE.url}/legal/terms`,   lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE.url}/legal/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE.url}/legal/cookies`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const categoryEntries: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${SITE.url}/${slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE.url}/${p.category}/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticEntries, ...categoryEntries, ...postEntries];
}
