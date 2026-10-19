"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function HoverVideo({ src, poster, className = "" }) {
  const ref = useRef(null);
  const [armed, setArmed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [touch, setTouch] = useState(false);

  // Touch devices have no hover — previews auto-play while in view instead.
  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => {
      const saveData = navigator.connection && navigator.connection.saveData;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setTouch(mq.matches && !saveData && !reduced);
    };
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Warm the clip (buffer it) as soon as the card nears the viewport, so the
  // first hover (or in-view autoplay) starts instantly instead of downloading.
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

  // Mobile/tablet: play when mostly visible, pause when scrolled away.
  useEffect(() => {
    if (!touch || !armed || failed) return;
    const v = ref.current;
    if (!v) return;

    if (typeof IntersectionObserver === "undefined") {
      play(v);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            play(v);
          } else {
            pause(v);
            setPlaying(false);
          }
        }
      },
      { threshold: 0.6 },
    );
    io.observe(v);

    const onVisibility = () => {
      if (document.hidden) {
        pause(v);
        setPlaying(false);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [touch, armed, failed]);

  function play(v) {
    try {
      v.muted = true;
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    } catch {}
  }

  function pause(v) {
    try {
      v.pause();
    } catch {}
  }

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
          if (e.pointerType === "touch" || touch) return;
          const v = ref.current;
          if (!v) return;
          try {
            v.currentTime = 0;
            play(v);
          } catch {}
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "touch" || touch) return;
          const v = ref.current;
          if (!v) return;
          try {
            pause(v);
            v.currentTime = 0;
          } catch {}
          setPlaying(false);
        }}
        onError={() => setFailed(true)}
      />
    </>
  );
}
