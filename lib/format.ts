import { format, parseISO } from 'date-fns';

export function fmtDate(iso?: string): string {
  if (!iso) return '';
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return '';
  }
}

// Pick the canonical primary category for a post — the first one that's not "uncategorized".
export function primaryCategorySlug(post: { categories?: { slug: string }[] }): string {
  const cats = post.categories ?? [];
  const real = cats.find((c) => c.slug !== 'uncategorized');
  return real?.slug ?? cats[0]?.slug ?? 'uncategorized';
}

export function postPath(post: { slug: string; categories?: { slug: string }[] }): string {
  return `/${primaryCategorySlug(post)}/${post.slug}`;
}

// First inline <img src="..."> in post body HTML — used as a thumbnail fallback
// when a post has no coverImage (e.g., when the WP featured_media reference
// was orphaned, but the body still has Amazon product images).
export function firstImageUrl(html?: string): string | null {
  if (!html) return null;
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1] ?? null;
}
