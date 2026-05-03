import Link from 'next/link';
import { mediaUrl, type BlsProduct } from '@/lib/strapi';

type Variant = 'tile' | 'compact';

export default function ProductCard({
  product,
  variant = 'tile',
  thumbBg = 'bg-white',
}: {
  product: BlsProduct;
  variant?: Variant;
  thumbBg?: string;
}) {
  const img = mediaUrl(product.primaryImage ?? null);
  const href = `/products/${product.slug}`;
  const cat = product.categories?.[0];
  const hasDiscount =
    product.originalPrice && product.currentPrice && product.originalPrice > product.currentPrice;

  if (variant === 'compact') {
    return (
      <article className="group" data-testid={`product-${product.slug}`}>
        <Link href={href} className="grid grid-cols-[112px_minmax(0,1fr)] gap-4">
          <div className={`overflow-hidden rounded-xl ${thumbBg}`}>
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img} alt={product.name} className="aspect-square h-full w-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-105" />
            ) : (
              <div className="aspect-square bg-gradient-to-br from-primary-hover to-primary" />
            )}
          </div>
          <div className="min-w-0">
            {product.brand && <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{product.brand}</p>}
            <h3 className="mt-1 line-clamp-2 font-display text-base font-bold leading-snug text-ink transition group-hover:text-primary">
              {product.name}
            </h3>
            {product.currentPrice !== undefined && (
              <p className="mt-2 text-sm font-semibold text-ink">
                {formatPrice(product.currentPrice, product.currency)}
              </p>
            )}
          </div>
        </Link>
      </article>
    );
  }

  // tile (default)
  return (
    <article className="group flex flex-col" data-testid={`product-${product.slug}`}>
      <Link href={href} className={`block overflow-hidden rounded-3xl ${thumbBg}`}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={product.name} className="aspect-square w-full object-contain mix-blend-multiply p-4 transition duration-500 group-hover:scale-[1.02]" />
        ) : (
          <div className="aspect-square w-full bg-gradient-to-br from-primary-hover to-primary" />
        )}
      </Link>
      <div className="mt-4">
        <div className="flex items-center justify-between gap-3">
          {product.brand && <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{product.brand}</p>}
          {cat && <p className="text-[11px] text-ink/45">{cat.name}</p>}
        </div>
        <Link href={href}>
          <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold leading-snug text-ink transition group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        {product.shortDescription && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/70">{product.shortDescription}</p>
        )}
        <div className="mt-3 flex items-baseline gap-2">
          {product.currentPrice !== undefined && (
            <span className="font-display text-lg font-bold text-ink">
              {formatPrice(product.currentPrice, product.currency)}
            </span>
          )}
          {hasDiscount && (
            <span className="text-sm text-ink/45 line-through">
              {formatPrice(product.originalPrice!, product.currency)}
            </span>
          )}
          {hasDiscount && (
            <span className="text-xs font-bold text-primary">
              -{Math.round((1 - product.currentPrice! / product.originalPrice!) * 100)}%
            </span>
          )}
        </div>
        {product.rating !== undefined && product.rating > 0 && (
          <p className="mt-2 text-xs text-ink/55">
            ★ {product.rating.toFixed(1)}
            {product.ratingCount ? ` · ${product.ratingCount} reviews` : ''}
          </p>
        )}
      </div>
    </article>
  );
}

function formatPrice(amount: number, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
