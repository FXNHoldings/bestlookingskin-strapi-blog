'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export type ToolCard = {
  title: string;
  href: string;
  blurb: string;
  emoji: string;
};

const INTERVAL_MS = 4500;

export default function ToolsCarousel({ tools }: { tools: ToolCard[] }) {
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(4);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    function updatePerView() {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        setPerView(4);
      } else if (window.matchMedia('(min-width: 640px)').matches) {
        setPerView(2);
      } else {
        setPerView(1);
      }
    }

    updatePerView();
    window.addEventListener('resize', updatePerView);
    return () => window.removeEventListener('resize', updatePerView);
  }, []);

  const maxIndex = Math.max(0, tools.length - perView);

  useEffect(() => {
    setIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (maxIndex === 0 || paused) return;
    const id = setInterval(() => {
      setIndex((current) => (current >= maxIndex ? 0 : current + 1));
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [maxIndex, paused]);

  return (
    <div
      className="relative mt-10"
      data-testid="tools-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * (100 / perView)}%)` }}
          aria-live="polite"
        >
          {tools.map((tool, toolIndex) => (
            <div key={tool.title} className="w-full shrink-0 px-2 sm:w-1/2 lg:w-1/4">
              <Link
                href={tool.href}
                className="group relative flex min-h-[220px] flex-col justify-between rounded bg-white px-6 py-7 shadow-[0_18px_45px_rgba(7,20,43,0.08)] transition hover:-translate-y-1 hover:bg-forest-100 hover:shadow-[0_24px_60px_rgba(7,20,43,0.13)]"
                data-testid={`tool-${tool.href}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-inter text-xs font-semibold uppercase tracking-[0.26em] text-ink/35">
                      0{toolIndex + 1}
                    </span>
                    <span className="text-2xl" aria-hidden>{tool.emoji}</span>
                  </div>
                  <h5 className="mt-8 max-w-[12rem] font-display font-bold leading-tight text-ink">
                    {tool.title}
                  </h5>
                  <p className="mt-4 max-w-[15rem] text-sm font-normal leading-6 text-ink/65">
                    {tool.blurb}
                  </p>
                </div>
                <span className="mt-7 inline-flex items-center gap-2 font-inter text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  Explore <span className="transition group-hover:translate-x-1" aria-hidden>→</span>
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {maxIndex > 0 && (
        <div className="mt-8 flex items-center justify-center gap-2" role="tablist" aria-label="Product Selection Tools slides">
          {Array.from({ length: maxIndex + 1 }).map((_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              role="tab"
              aria-selected={dotIndex === index}
              aria-label={`Go to slide ${dotIndex + 1}`}
              onClick={() => setIndex(dotIndex)}
              className={
                dotIndex === index
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
