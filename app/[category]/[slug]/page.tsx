import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPost, listPosts, mediaUrl, type BlsPost } from '@/lib/strapi';
import { SECTIONS, SITE } from '@/lib/site';
import { fmtDate, primaryCategorySlug, postPath } from '@/lib/format';
import PostContent from '@/components/PostContent';
import PostCard from '@/components/PostCard';

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

  // Pull a few related posts from the same category, excluding this one.
  const related = await listPosts({ category, pageSize: 5 })
    .then((r) => r.data.filter((p) => p.id !== post.id).slice(0, 4))
    .catch(() => [] as BlsPost[]);

  const cover = mediaUrl(post.coverImage ?? null);
  const cat = post.categories?.[0];

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
      className="mx-auto max-w-7xl px-6 py-12"
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

      <header className="mt-4">
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

      <div className="mt-10">
        <PostContent html={post.content} />
      </div>

      <div className="mt-12 rounded-2xl border border-ink/10 bg-muted/40 p-5 text-xs leading-5 text-ink/60">
        <strong className="text-ink/80">Affiliate disclosure.</strong> {SITE.name} earns a
        commission when you buy through links on this page, at no extra cost to you.
        Prices and availability are accurate as of {fmtDate(post.updatedAt)} and subject to change.
      </div>

      {related.length > 0 && (
        <aside className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">More in {cat?.name ?? categoryName(category)}</h2>
          <div className="mt-6 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <PostCard key={r.id} post={r} variant="tile" />
            ))}
          </div>
        </aside>
      )}
    </article>
  );
}
