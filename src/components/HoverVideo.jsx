"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function HoverVideo({ src, poster, className = "" }) {
  const ref = useRef(null);
  const [armed, setArmed] = useState(false);
  const [failed, setFailed] = useState(false);

  // Warm the clip (buffer it) as soon as the card nears the viewport, so the
  // first hover plays instantly instead of downloading then.
  useEffect(() => {
    const v = ref.current;
    if (!v || !src || failed || armed) return;

    if (typeof IntersectionObserver === "undefined") {
      v.preload = "auto";
      try {
        v.load();
      } catch {}
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setArmed(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src, failed, armed]);

  useEffect(() => {
    if (!armed) return;
    const v = ref.current;
    if (!v) return;
    try {
      v.load();
    } catch {}
  }, [armed]);

  if (!src || failed) {
    return poster ? (
      <Image
        src={poster}
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={className}
      />
    ) : null;
  }

  return (
    <video
      ref={ref}
      src={src}
      poster={poster || undefined}
      className={className}
      muted
      loop
      playsInline
      preload={armed ? "auto" : "none"}
      disablePictureInPicture
      onPointerEnter={(e) => {
        if (e.pointerType === "touch") return;
        const v = ref.current;
        if (!v) return;
        try {
          v.currentTime = 0;
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
        } catch {}
      }}
      onPointerLeave={() => {
        const v = ref.current;
        if (!v) return;
        try {
          v.pause();
          v.currentTime = 0;
        } catch {}
      }}
      onError={() => setFailed(true)}
    />
  );
}
