'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Props = {
  slot: string;
  client?: string;
  format?: string;
  fullWidthResponsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function AdsenseUnit({
  slot,
  client = 'ca-pub-2867376862905050',
  format = 'auto',
  fullWidthResponsive = true,
  className,
  style,
}: Props) {
  const ref = useRef<HTMLModElement | null>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle not ready yet — it will pick up on next push
    }
  }, []);

  return (
    <ins
      ref={ref}
      className={`adsbygoogle ${className ?? ''}`.trim()}
      style={{ display: 'block', ...style }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
    />
  );
}
