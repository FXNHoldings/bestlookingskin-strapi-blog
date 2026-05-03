import { ImageResponse } from 'next/og';

// Apple-touch-icon for iOS home-screen pin / Safari pinned tabs.
// Same monogram as app/icon.svg but rendered as a 180x180 PNG via
// Next.js's ImageResponse so we don't need a binary asset in the repo.

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#014fd3',
          borderRadius: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <span
          style={{
            color: '#ffffff',
            fontSize: 120,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1,
          }}
        >
          B
        </span>
        <span
          style={{
            position: 'absolute',
            right: 38,
            bottom: 50,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#e33333',
          }}
        />
      </div>
    ),
    { ...size },
  );
}
