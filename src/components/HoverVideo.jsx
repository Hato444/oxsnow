"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function HoverVideo({ src, poster, className = "" }) {
  const ref = useRef(null);
  const [armed, setArmed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);

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
      { rootMargin: "600px 0px" },
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

  const cover = poster ? (
    <Image
      src={poster}
      alt=""
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="object-cover"
    />
  ) : null;

  if (!src || failed) return cover;

  return (
    <>
      {cover}
      <video
        ref={ref}
        src={src}
        className={`${className} transition-opacity duration-500 ease-out ${
          playing ? "opacity-100" : "opacity-0"
        }`}
        muted
        loop
        playsInline
        preload={armed ? "auto" : "metadata"}
        disablePictureInPicture
        onPlaying={() => setPlaying(true)}
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
          setPlaying(false);
        }}
        onError={() => setFailed(true)}
      />
    </>
  );
}
