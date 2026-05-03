import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { listProductBrands } from '@/lib/strapi';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Skincare Brands',
  description: `Browse skincare brands covered by ${SITE.name}.`,
  alternates: { canonical: '/brands' },
};

export default async function BrandsPage() {
  const brands = await listProductBrands().catch(() => []);
  const groups = groupBrands(brands);

  return (
    <section className="bg-paper py-12 sm:py-16" data-testid="brands-page">
      <div className="mx-auto max-w-7xl px-6">
        <header className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Brands</p>
          <h1 className="mt-3 font-display font-bold tracking-tight text-ink">
            Skincare Brands
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-ink/70 sm:text-lg">
            Browse every brand in the product catalog and jump straight to matching products.
          </p>
        </header>

        {brands.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-ink/15 bg-white px-6 py-16 text-center text-ink/55">
            <p className="text-base">No product brands are available yet.</p>
          </div>
        ) : (
          <div className="mt-10 space-y-8">
            {groups.map((group) => (
              <section key={group.letter} className="grid gap-4 border-t border-ink/10 pt-6 sm:grid-cols-[4rem_minmax(0,1fr)]">
                <h2 className="font-display text-2xl font-semibold text-primary">
                  {group.letter}
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {group.brands.map((brand) => (
                    <li key={brand.slug}>
                      <Link
                        href={`/products?brand=${encodeURIComponent(brand.slug)}`}
                        className="block rounded-md bg-white px-4 py-3 text-sm font-medium text-ink transition hover:bg-forest-100 hover:text-primary"
                      >
                        {brand.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function groupBrands(brands: Awaited<ReturnType<typeof listProductBrands>>) {
  const map = new Map<string, typeof brands>();

  for (const brand of brands) {
    const first = brand.name[0]?.toUpperCase() ?? '#';
    const letter = /^[A-Z]$/.test(first) ? first : '#';
    map.set(letter, [...(map.get(letter) ?? []), brand]);
  }

  return Array.from(map.entries()).map(([letter, groupedBrands]) => ({
    letter,
    brands: groupedBrands,
  }));
}
