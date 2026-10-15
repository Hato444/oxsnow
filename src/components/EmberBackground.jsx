"use client";

import { useEffect, useRef } from "react";

export default function EmberBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf;
    let width = 0;
    let height = 0;
    let embers = [];

    const makeEmber = (seeded) => ({
      x: Math.random() * width,
      y: seeded ? Math.random() * height : height + 10,
      r: Math.random() * 1.8 + 0.4,
      vy: Math.random() * 0.5 + 0.25,
      vx: (Math.random() - 0.5) * 0.25,
      life: 0,
      max: Math.random() * 400 + 300,
      hue: Math.random() > 0.5 ? "255,69,0" : "226,88,34",
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(46, Math.floor(width / 34));
      embers = Array.from({ length: count }, () => makeEmber(true));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const e of embers) {
        e.life += 1;
        e.y -= e.vy;
        e.x += e.vx + Math.sin((e.life + e.x) * 0.01) * 0.2;
        const alpha = Math.max(0, 1 - e.life / e.max) * 0.7;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${e.hue},${alpha})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = `rgba(${e.hue},0.6)`;
        ctx.fill();
        if (e.y < -20 || e.life > e.max) {
          embers[embers.indexOf(e)] = makeEmber(false);
        }
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reduce) raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Controlled fire glow — ambient radial washes */}
      <div
        aria-hidden
        className="ember-wash pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(60% 45% at 82% 8%, rgba(255,69,0,0.12), transparent 60%)," +
            "radial-gradient(45% 40% at 10% 100%, rgba(226,88,34,0.10), transparent 65%)," +
            "radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,0.03), transparent 55%)",
        }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className="ember-canvas pointer-events-none fixed inset-0 z-0"
      />
    </>
  );
}
