'use client';

import { useEffect, useState } from 'react';
import type { BlsProduct } from '@/lib/strapi';
import ProductCard from '@/components/ProductCard';

/**
 * Products auto-sliding carousel.
 * Renders up to 10 products in 2 pages of 5 (lg). Auto-advances every 5s.
 * Pauses on hover/focus. Falls back to a single grid below `lg`.
 */
const PER_PAGE = 5;
const MAX = 10;
const INTERVAL_MS = 5000;

export default function ProductsCarousel({
  products,
  thumbBg = 'bg-white',
}: {
  products: BlsProduct[];
  thumbBg?: string;
}) {
  const items = products.slice(0, MAX);
  const pageCount = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (pageCount < 2 || paused) return;
    const id = setInterval(() => {
      setPage((p) => (p + 1) % pageCount);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [pageCount, paused]);

  return (
    <div
      className="relative"
      data-testid="products-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${page * 100}%)` }}
          aria-live="polite"
        >
          {Array.from({ length: pageCount }).map((_, i) => {
            const slice = items.slice(i * PER_PAGE, (i + 1) * PER_PAGE);
            return (
              <div
                key={i}
                className="grid w-full shrink-0 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-5"
                aria-hidden={i !== page}
              >
                {slice.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    variant="tile"
                    thumbBg={thumbBg}
                    showCategory={false}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {pageCount > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2" role="tablist" aria-label="Product slides">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === page}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setPage(i)}
              className={
                i === page
                  ? 'h-2 w-8 rounded-full bg-primary transition-all'
                  : 'h-2 w-2 rounded-full bg-ink/20 transition-all hover:bg-ink/40'
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
