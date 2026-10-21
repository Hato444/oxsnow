"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import PaymentPanel from "@/components/watch/PaymentPanel";

export default function PassCheckout({ className = "", children }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={className}
      >
        {children}
      </button>
      <AnimatePresence>
        {open && (
          <PaymentPanel
            key="pass-checkout"
            item={{ title: "__cultural_pass__", meta: "SVOD · 30 days" }}
            movieId="__cultural_pass__"
            priceLabel="M 99.00 LSL"
            passMode
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
