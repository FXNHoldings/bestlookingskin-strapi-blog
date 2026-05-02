import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center" data-testid="not-found">
      <p className="text-xs font-bold uppercase tracking-wider text-primary">404</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink">
        That page wandered off
      </h1>
      <p className="mt-4 text-ink/70">
        The post you’re looking for doesn’t exist, or has been moved. Try the homepage or browse a section below.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-emphasis"
        >
          Home
        </Link>
        <Link
          href="/product-comparisons"
          className="inline-flex items-center rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary"
        >
          Browse comparisons
        </Link>
      </div>
    </section>
  );
}
