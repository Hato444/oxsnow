"use client";

export default function HoverVideo({ src, className = "", poster }) {
  return (
    <video
      src={src}
      poster={poster || undefined}
      className={className}
      muted
      loop
      playsInline
      preload="metadata"
      onMouseEnter={(e) => {
        try {
          e.currentTarget.currentTime = 0;
          e.currentTarget.play().catch(() => {});
        } catch {}
      }}
      onMouseLeave={(e) => {
        try {
          e.currentTarget.pause();
        } catch {}
      }}
    />
  );
}
