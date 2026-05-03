import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: `Get in touch with the ${SITE.name} editorial team — story tips, partnership questions, corrections.`,
  alternates: { canonical: '/contact' },
};

const CONTACT_EMAIL = 'hello@bestlooking.skin';

export default function ContactPage() {
  return (
    <div data-testid="contact-page">
      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Contact</p>
          <h1 className="mt-4 font-display font-bold leading-[1.05] tracking-tight text-ink">
            Get in touch.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-ink/70 sm:text-lg">
            Story tips, partnership questions, corrections, or just hello — we read everything that
            comes through. Pick the channel that fits.
          </p>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Send a message</p>
            <h2 className="mt-3 font-display font-bold tracking-tight text-ink">
              Tell us what’s on your mind.
            </h2>
            <p className="mt-4 text-base leading-7 text-ink/70">
              Fill in the form and we’ll get back to you. Submitting opens your default email client
              with the message pre-filled — no data is sent to a server.
            </p>
            <p className="mt-6 text-sm text-ink/55">
              Prefer email?{' '}
              <a href="mailto:hello@bestlooking.skin" className="font-medium text-primary hover:underline">
                hello@bestlooking.skin
              </a>
            </p>
          </div>
          <div className="rounded border border-ink/10 bg-white p-6 sm:p-10">
            <ContactForm />
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-3xl px-6 text-center">
          <h2 className="font-display font-bold tracking-tight text-ink">Looking for something specific?</h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-ink/70">
            Browse the full archive or jump to a section.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/" className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wider text-white transition hover:bg-primary-emphasis">
              Home
            </Link>
            <Link href="/sitemap" className="inline-flex items-center rounded-full border border-ink/15 px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wider text-ink transition hover:border-primary hover:text-primary">
              Site map
            </Link>
            <Link href="/about" className="inline-flex items-center rounded-full border border-ink/15 px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wider text-ink transition hover:border-primary hover:text-primary">
              About us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
