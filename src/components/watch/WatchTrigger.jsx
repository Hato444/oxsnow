"use client";

import { useWatch } from "./WatchProvider";

export default function WatchTrigger({ item, className = "", children }) {
  const { open } = useWatch();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => open(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(item);
        }
      }}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </div>
  );
}
