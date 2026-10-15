"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

function fmt(t) {
  if (!isFinite(t) || t < 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function Icon({ name }) {
  const common = { viewBox: "0 0 24 24", className: "h-5 w-5", fill: "currentColor" };
  if (name === "play")
    return (
      <svg {...common} aria-hidden>
        <path d="M8 5v14l11-7z" />
      </svg>
    );
  if (name === "pause")
    return (
      <svg {...common} aria-hidden>
        <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
      </svg>
    );
  if (name === "volume")
    return (
      <svg {...common} aria-hidden>
        <path d="M11 5 6 9H3v6h3l5 4V5zM15.5 8.5a5 5 0 0 1 0 7l-1.2-1.2a3.3 3.3 0 0 0 0-4.6l1.2-1.2zM18 6a8.5 8.5 0 0 1 0 12l-1.2-1.2a6.8 6.8 0 0 0 0-9.6L18 6z" />
      </svg>
    );
  if (name === "mute")
    return (
      <svg {...common} aria-hidden>
        <path d="M11 5 6 9H3v6h3l5 4V5z" />
        <path
          d="m16 9.5 5 5m0-5-5 5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  if (name === "expand")
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (name === "collapse")
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return null;
}

export default function VideoPlayer({ src, poster, title = "", autoPlay = false, onPlay }) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const hideTimer = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const bump = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      const v = videoRef.current;
      if (v && !v.paused) setShowControls(false);
    }, 2600);
  }, []);

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.volume = volume;
  }, [volume]);

  const seek = (e) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    v.currentTime = ratio * duration;
    setCurrent(ratio * duration);
  };

  const toggleFs = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else if (el.requestFullscreen) el.requestFullscreen();
  };

  const pct = duration ? (current / duration) * 100 : 0;

  return (
    <div
      ref={wrapRef}
      onMouseMove={bump}
      onMouseLeave={() => setShowControls(false)}
      className="group relative aspect-video w-full overflow-hidden bg-black"
    >
      {src ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster || undefined}
          playsInline
          preload="metadata"
          autoPlay={autoPlay}
          className="h-full w-full object-contain"
          onClick={toggle}
          onPlay={() => {
            setPlaying(true);
            bump();
            if (onPlay) onPlay();
          }}
          onPause={() => {
            setPlaying(false);
            setShowControls(true);
          }}
          onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => setPlaying(false)}
        />
      ) : (
        <div className="relative h-full w-full">
          {poster && (
            <Image
              src={poster}
              alt={title}
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover opacity-55"
            />
          )}
          <div className="absolute inset-0 grid place-items-center bg-black/30">
            <p className="text-xs uppercase tracking-[0.3em] text-ash">
              Trailer coming soon
            </p>
          </div>
        </div>
      )}

      {src && !playing && (
        <button
          type="button"
          onClick={toggle}
          aria-label="Play"
          className="absolute inset-0 grid place-items-center"
        >
          <span className="grid h-20 w-20 place-items-center rounded-full border border-white/25 bg-black/40 backdrop-blur transition-all hover:border-ember hover:shadow-[0_0_44px_-4px_rgba(255,69,0,0.85)]">
            <span className="ml-1 block h-0 w-0 border-y-[13px] border-l-[20px] border-y-transparent border-l-ember" />
          </span>
        </button>
      )}

      {src && (
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="px-4 pt-6">
            <div onClick={seek} className="group/bar relative h-1.5 cursor-pointer">
              <div className="absolute inset-0 rounded-full bg-white/20" />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber via-ember to-glow shadow-[0_0_12px_rgba(255,69,0,0.7)]"
                style={{ width: `${pct}%` }}
              />
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember opacity-0 shadow-[0_0_12px_rgba(255,69,0,0.9)] transition-opacity group-hover/bar:opacity-100"
                style={{ left: `${pct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 text-silver">
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause" : "Play"}
              className="transition-colors hover:text-ember"
            >
              <Icon name={playing ? "pause" : "play"} />
            </button>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                aria-label={muted ? "Unmute" : "Mute"}
                onClick={() => {
                  const v = videoRef.current;
                  if (!v) return;
                  v.muted = !v.muted;
                  setMuted(v.muted);
                }}
                className="transition-colors hover:text-ember"
              >
                <Icon name={muted ? "mute" : "volume"} />
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setVolume(val);
                  setMuted(val === 0);
                  const v = videoRef.current;
                  if (v) {
                    v.volume = val;
                    v.muted = val === 0;
                  }
                }}
                aria-label="Volume"
                className="h-1 w-20 cursor-pointer accent-[#ff4500]"
              />
            </div>

            <span className="text-xs tabular-nums text-silver-2">
              {fmt(current)} <span className="text-ash">/</span> {fmt(duration)}
            </span>

            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-[0.6rem] uppercase tracking-[0.3em] text-ash sm:block">
                Oxsnow · HD
              </span>
              <button
                type="button"
                onClick={toggleFs}
                aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                className="transition-colors hover:text-ember"
              >
                <Icon name={fullscreen ? "collapse" : "expand"} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
