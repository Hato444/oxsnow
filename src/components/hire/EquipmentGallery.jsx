"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function Chevron({ direction }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

function ArrowButton({ direction, onClick, label, className = "", overlay = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 bg-ink/80 text-silver shadow-lg backdrop-blur transition-colors hover:border-ember hover:text-ember focus-visible:border-ember focus-visible:outline-none ${
        overlay ? "absolute top-1/2 z-20 -translate-y-1/2" : ""
      } ${className}`}
    >
      <Chevron direction={direction} />
    </button>
  );
}

function Dots({ count, index, onSelect, label }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Show image ${i + 1} of ${label}`}
          aria-current={i === index ? "true" : undefined}
          className={`h-2 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${
            i === index ? "w-6 bg-ember" : "w-2 bg-white/30 hover:bg-white/60"
          }`}
        />
      ))}
    </div>
  );
}

export default function EquipmentGallery({ name, images = [], variant = "card" }) {
  const photos = images.filter((src) => typeof src === "string" && src);
  const count = photos.length;
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const touch = useRef({ x: 0, y: 0 });
  const swiped = useRef(false);
  const activeIndex = count > 0 ? Math.min(index, count - 1) : 0;

  function go(delta) {
    if (count < 2) return;
    setIndex((current) => {
      const base = Math.min(current, count - 1);
      return (base + delta + count) % count;
    });
  }

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        setIndex((current) => {
          const base = Math.min(current, count - 1);
          return (base + (event.key === "ArrowLeft" ? -1 : 1) + count) % count;
        });
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, count]);

  function startTouch(event) {
    const point = event.changedTouches[0];
    touch.current = { x: point.clientX, y: point.clientY };
    swiped.current = false;
  }

  function endTouch(event) {
    const point = event.changedTouches[0];
    const dx = point.clientX - touch.current.x;
    const dy = point.clientY - touch.current.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      swiped.current = true;
      go(dx < 0 ? 1 : -1);
    }
  }

  function openGallery() {
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    setOpen(true);
  }

  if (count === 0) {
    return (
      <div
        className={`relative grid w-full place-items-center overflow-hidden border-b border-white/8 bg-ink-3 ${
          variant === "detail" ? "aspect-[3/2] rounded-xl border" : "aspect-[4/3]"
        }`}
      >
        <div className="px-6 text-center">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-ember">
            Photo pending
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-steel">
            {name} is listed as model to confirm. A standalone product photo will be added once the
            exact model is verified.
          </p>
        </div>
      </div>
    );
  }

  const frameClass =
    variant === "detail"
      ? "aspect-[3/2] rounded-xl border border-white/10 bg-ink-3"
      : "aspect-[4/3] border-b border-white/8 bg-ink-3";

  return (
    <>
      <div
        className={`relative w-full overflow-hidden ${frameClass}`}
        onTouchStart={startTouch}
        onTouchEnd={endTouch}
      >
        <button
          type="button"
          onClick={openGallery}
          className="group/photo absolute inset-0 flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ember"
          aria-label={`Open larger gallery for ${name}, image ${activeIndex + 1} of ${count}`}
        >
          <img
            src={photos[activeIndex]}
            alt={`${name} - view ${activeIndex + 1} of ${count}`}
            loading={activeIndex === 0 ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover/photo:scale-[1.02] sm:p-5"
          />
        </button>
      </div>

      {count > 1 && (
        <div className={variant === "detail" ? "mt-4 space-y-4" : "px-5 py-3"}>
          <div className="flex items-center justify-between gap-3">
            <ArrowButton
              direction="left"
              onClick={() => go(-1)}
              label={`Previous image of ${name}`}
            />
            <div className="flex flex-col items-center gap-1.5">
              <Dots count={count} index={activeIndex} onSelect={setIndex} label={name} />
              <span className="text-[0.55rem] font-bold uppercase tracking-[0.14em] text-ash">
                {activeIndex + 1} / {count}
              </span>
            </div>
            <ArrowButton direction="right" onClick={() => go(1)} label={`Next image of ${name}`} />
          </div>
          {variant === "detail" && (
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {photos.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show image ${i + 1} of ${name}`}
                  aria-current={i === activeIndex ? "true" : undefined}
                  className={`overflow-hidden rounded-lg border bg-ink-3 p-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${
                    i === activeIndex ? "border-ember" : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-8"
              role="dialog"
              aria-modal="true"
              aria-label={`${name} image gallery`}
              onClick={() => setOpen(false)}
            >
              <div
                className="relative flex h-full w-full max-w-6xl flex-col"
                onClick={(event) => event.stopPropagation()}
                onTouchStart={startTouch}
                onTouchEnd={endTouch}
              >
                <div className="flex items-center justify-between gap-4 pb-4">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-silver">{name}</p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/5 text-xl leading-none text-silver transition-colors hover:border-ember hover:text-ember"
                    aria-label={`Close ${name} gallery`}
                  >
                    ×
                  </button>
                </div>

                <div className="relative flex min-h-0 flex-1 items-center justify-center">
                  <img
                    src={photos[activeIndex]}
                    alt={`${name} - view ${activeIndex + 1} of ${count}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 pt-5">
                  {count > 1 ? (
                    <ArrowButton
                      direction="left"
                      onClick={() => go(-1)}
                      label={`Previous image of ${name}`}
                    />
                  ) : (
                    <span className="h-9 w-9" />
                  )}
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-[0.65rem] uppercase tracking-[0.18em] text-ash">
                      Image {activeIndex + 1} of {count}
                    </p>
                    {count > 1 && (
                      <Dots count={count} index={activeIndex} onSelect={setIndex} label={name} />
                    )}
                  </div>
                  {count > 1 ? (
                    <ArrowButton
                      direction="right"
                      onClick={() => go(1)}
                      label={`Next image of ${name}`}
                    />
                  ) : (
                    <span className="h-9 w-9" />
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

