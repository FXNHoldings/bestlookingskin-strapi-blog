import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPost, listPosts, mediaUrl, type BlsPost } from '@/lib/strapi';
import { SECTIONS, SITE } from '@/lib/site';
import { fmtDate, firstImageUrl, primaryCategorySlug, postPath } from '@/lib/format';
import PostContent from '@/components/PostContent';
import PostCard from '@/components/PostCard';
import AdsenseUnit from '@/components/AdsenseUnit';

export const revalidate = 60;
export const dynamicParams = true;

type Params = { category: string; slug: string };

function categoryName(slug?: string): string {
  if (!slug) return '';
  return SECTIONS.find((s) => s.slug === slug)?.title ?? slug.replace(/-/g, ' ');
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, category } = await params;
  const post = await getPost(slug).catch(() => null);
  if (!post) return { title: 'Not found' };

  const cover = mediaUrl(post.coverImage ?? null) || mediaUrl(post.ogImage ?? null);
  const description = post.seoDescription || post.excerpt || SITE.description;

  return {
    title: post.seoTitle || post.title,
    description,
    keywords: post.seoKeywords,
    alternates: { canonical: `/${category}/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.seoTitle || post.title,
      description,
      url: `${SITE.url}/${category}/${post.slug}`,
      images: cover ? [{ url: cover }] : undefined,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
    twitter: {
      card: cover ? 'summary_large_image' : 'summary',
      title: post.seoTitle || post.title,
      description,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug, category } = await params;
  const post = await getPost(slug).catch(() => null);
  if (!post) notFound();

  // If the URL category doesn't match the post's primary category, send them to the canonical URL.
  const canonicalCat = primaryCategorySlug(post);
  if (canonicalCat !== category) {
    const { redirect } = await import('next/navigation');
    redirect(postPath(post));
  }

  // Pull related posts (same category, excluding this one) and recent posts
  // across all categories (for the right sidebar) in parallel.
  const [related, recentPosts] = await Promise.all([
    listPosts({ category, pageSize: 5 })
      .then((r) => r.data.filter((p) => p.id !== post.id).slice(0, 4))
      .catch(() => [] as BlsPost[]),
    listPosts({ pageSize: 6 })
      .then((r) => r.data.filter((p) => p.id !== post.id).slice(0, 5))
      .catch(() => [] as BlsPost[]),
  ]);

  const cover = mediaUrl(post.coverImage ?? null);
  const cat = post.categories?.[0];

  // Strip <em> / </em> tags from the post body — text content is kept, only
  // the wrapping element is removed (so italic emphasis no longer renders).
  // \b avoids matching <embed>; [^>]* handles any attributes.
  const postBodyHtml = (post.content ?? '').replace(/<\/?em\b[^>]*>/gi, '');

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': post.postType === 'product-review' ? 'Review' : 'Article',
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: cover ? [cover] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
    mainEntityOfPage: `${SITE.url}/${category}/${post.slug}`,
  };

  return (
    <article
      className="mx-auto max-w-7xl bg-white px-6 py-12"
      data-testid={`post-${post.slug}`}
      data-category={category}
      data-post-type={post.postType}
    >
      {/* Vendor stylesheets used by the imported product-comparison blocks
          (Content Egg + scoped Bootstrap). Only loaded on post pages. */}
      <link rel="stylesheet" href="/vendor/cegg-bootstrap.min.css" />
      <link rel="stylesheet" href="/vendor/cegg-products.min.css" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <nav className="flex items-center gap-2 text-xs text-ink/55" data-testid="breadcrumb" aria-label="Breadcrumb">
        <Link href="/" className="shrink-0 hover:text-primary">Home</Link>
        <span className="shrink-0">/</span>
        <Link href={`/${category}`} className="shrink-0 hover:text-primary">
          {cat?.name ?? categoryName(category)}
        </Link>
        <span className="shrink-0">/</span>
        <span className="min-w-0 truncate text-ink/75" aria-current="page">{post.title}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
        {/* Main article column */}
        <div className="min-w-0">
          <header>
            {cat && (
              <p className="text-xs font-bold uppercase tracking-wider text-primary">{cat.name}</p>
            )}
            <h1 className="mt-3 font-display text-[2rem] font-bold leading-tight tracking-tight text-ink">
              {post.title}
            </h1>
            <p className="mt-4 text-sm text-ink/55">
              Published {fmtDate(post.publishedAt)}
              {post.readingTimeMinutes ? ` · ${post.readingTimeMinutes} min read` : ''}
            </p>
          </header>

          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={post.coverImage?.alternativeText || post.title}
              className="mt-8 aspect-[16/9] w-full rounded-3xl object-cover"
            />
          )}

          <div>
            <AdsenseUnit slot="3958661572" className="mb-8" />
            <PostContent html={postBodyHtml} />
          </div>

          <div className="mt-12 rounded-2xl border border-ink/10 bg-muted/40 p-5 text-xs leading-5 text-ink/60">
            <strong className="text-ink/80">Affiliate disclosure.</strong> {SITE.name} earns a
            commission when you buy through links on this page, at no extra cost to you.
            Prices and availability are accurate as of {fmtDate(post.updatedAt)} and subject to change.
          </div>

          {related.length > 0 && (
            <aside className="mt-16">
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">More in {cat?.name ?? categoryName(category)}</h2>
              <div className="mt-6 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <PostCard key={r.id} post={r} variant="tile" />
                ))}
              </div>
            </aside>
          )}
        </div>

        {/* Right sidebar: post categories + recent posts */}
        <aside className="space-y-8" aria-label="Sidebar">
          <div className="border border-[#ddd] p-4">
            <h6 className="font-display text-base font-bold capitalize tracking-wider text-ink">Post categories</h6>
            <ul className="mt-3 space-y-1 text-sm">
              {SECTIONS.map((s) => {
                const active = s.slug === category;
                return (
                  <li key={s.slug}>
                    <Link
                      href={`/${s.slug}`}
                      className={
                        active
                          ? 'block rounded-md bg-primary/10 px-3 py-1.5 font-semibold text-primary'
                          : 'block rounded-md px-3 py-1.5 text-ink/75 transition hover:bg-paper/60 hover:text-ink'
                      }
                    >
                      {s.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {recentPosts.length > 0 && (
            <div className="border border-[#ddd] p-4">
              <h6 className="font-display text-base font-bold capitalize tracking-wider text-ink">Recent posts</h6>
              <ul className="mt-3 space-y-4">
                {recentPosts.map((p) => {
                  const img = mediaUrl(p.coverImage ?? null) ?? firstImageUrl(p.content);
                  return (
                    <li key={p.id}>
                      <Link
                        href={postPath(p)}
                        className="group grid grid-cols-[64px_minmax(0,1fr)] items-start gap-3 text-sm leading-snug text-ink/85 transition-colors hover:text-primary"
                      >
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt={p.coverImage?.alternativeText || p.title}
                            className="aspect-square w-full rounded object-cover"
                          />
                        ) : (
                          <div className="aspect-square w-full rounded bg-muted" />
                        )}
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-[14px] font-medium">{p.title}</p>
                          <p className="mt-1 text-xs text-ink/55">{fmtDate(p.publishedAt)}</p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
