'use client';

import { useEffect, useRef } from 'react';

/**
 * Renders post body HTML.
 *
 * Source posts come from a WordPress site that bakes a "GreenShift / GSPB" block
 * into the markup — inline <style> chunks, .gspb_* class names and a flex column
 * layout. Tailwind's `prose` class fights GSPB's layout (forces block images,
 * adds vertical margins between siblings, etc.), so we render plain HTML and
 * style only the non-GSPB elements via globals.css scoped to `.post-content`.
 *
 * Also wires GreenShift FAQ accordions: the source's vanilla JS isn't running
 * here, so on mount we collapse every `.gs-accordion-item` (add `.gsclose`)
 * and attach a click handler on its title that toggles the class. CSS in
 * globals.css hides `.gsclose > .gs-accordion-item__content`.
 *
 * Affiliate-tag rewriting happens at import time (server-side, in the importer)
 * — not here.
 */
export default function PostContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const items = root.querySelectorAll<HTMLElement>('.gs-accordion-item');
    const cleanups: Array<() => void> = [];

    items.forEach((item) => {
      item.classList.add('gsclose');
      const title = item.querySelector<HTMLElement>('.gs-accordion-item__title');
      if (!title) return;
      title.setAttribute('role', 'button');
      title.setAttribute('tabindex', '0');
      const onActivate = (e: Event) => {
        if (e instanceof KeyboardEvent && e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        item.classList.toggle('gsclose');
        title.setAttribute('aria-expanded', String(!item.classList.contains('gsclose')));
      };
      title.setAttribute('aria-expanded', 'false');
      title.addEventListener('click', onActivate);
      title.addEventListener('keydown', onActivate);
      cleanups.push(() => {
        title.removeEventListener('click', onActivate);
        title.removeEventListener('keydown', onActivate);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [html]);

  return (
    <div
      ref={ref}
      className="post-content"
      data-testid="post-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
