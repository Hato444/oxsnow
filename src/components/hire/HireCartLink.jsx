"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CART_EVENT, cartCount, readCart } from "@/lib/hire/cart";

export default function HireCartLink({ className = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(cartCount(readCart()));
    sync();
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <Link
      href="/hire/checkout"
      className={`relative inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-silver transition-colors hover:border-ember hover:text-ember ${className}`}
    >
      Booking list
      {count > 0 && (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1.5 text-[0.6rem] font-black text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
