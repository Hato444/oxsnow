"use client";

import { useWatchlist } from "./WatchlistProvider";

export default function WatchlistButton({ item, className = "" }) {
  const { has, toggle } = useWatchlist();
  const saved = has(item.title);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggle(item);
      }}
      aria-label={saved ? `Remove ${item.title} from watchlist` : `Add ${item.title} to watchlist`}
      title={saved ? "On your watchlist — tap to remove" : "Add to watchlist"}
      className={`grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition-all ${
        saved
          ? "border-ember bg-ember/20 text-ember shadow-[0_0_18px_-4px_rgba(255,69,0,0.8)]"
          : "border-white/25 bg-black/50 text-silver hover:border-ember hover:text-ember"
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
