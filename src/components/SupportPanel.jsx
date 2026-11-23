"use client";

import { useRef, useState } from "react";

const amounts = [10, 25, 50, 100];

export default function SupportPanel() {
  const dialog = useRef(null);
  const [amount, setAmount] = useState("25");
  const [method, setMethod] = useState("M-PESA");
  return (
    <>
      <button type="button" className="btn btn-primary !px-7 !py-4" onClick={() => dialog.current?.showModal()}>Support the stories <span aria-hidden>↗</span></button>
      <dialog ref={dialog} aria-labelledby="support-title" className="m-0 h-[100dvh] max-h-none w-screen max-w-none overflow-y-auto border-0 bg-[#101010] p-0 text-silver shadow-2xl backdrop:bg-black/85 sm:m-auto sm:h-auto sm:max-h-[90dvh] sm:w-[min(92vw,520px)] sm:rounded-2xl sm:border sm:border-white/15">
        <div className="relative overflow-hidden px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:p-8">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-ember/15 blur-[80px]" />
          <div className="relative flex items-start justify-between gap-4"><div><p className="eyebrow">A future worth sharing</p><h2 id="support-title" className="mt-3 text-3xl font-black tracking-tight text-metal">Back the stories.</h2><p className="mt-3 max-w-sm text-sm leading-relaxed text-steel">Help make space for more Basotho voices, on screen and beyond.</p></div><button type="button" onClick={() => dialog.current?.close()} aria-label="Close donation panel" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-xl transition-colors hover:border-ember hover:text-ember">×</button></div>
          <div className="relative mt-7 border-t border-white/10 pt-5"><p className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-ember">01 / Choose an amount</p>
          <div className="mt-3 grid grid-cols-4 gap-2" role="group" aria-label="Suggested amounts">{amounts.map((value) => <button type="button" key={value} onClick={() => setAmount(String(value))} aria-pressed={amount === String(value)} className={`rounded-lg border px-2 py-4 text-sm font-bold transition-colors ${amount === String(value) ? "border-ember bg-ember/10 text-white" : "border-white/10 bg-white/[0.025] text-silver-2 hover:border-white/30"}`}>M{value}</button>)}</div>
          <label className="mt-4 block text-xs text-steel">Or enter an amount in maloti<input type="number" min="1" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-ink px-4 py-3 text-silver outline-none focus:border-ember" /></label></div>
          <fieldset className="relative mt-6"><legend className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-ember">02 / Payment method</legend><div className="mt-3 grid grid-cols-2 gap-2">{["M-PESA", "EcoCash"].map((name) => <label key={name} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold ${method === name ? "border-ember/60 bg-ember/5 text-white" : "border-white/10 text-steel"}`}><input type="radio" name="donation-method" checked={method === name} onChange={() => setMethod(name)} className="accent-[#ff4500]" />{name}</label>)}</div></fieldset>
          <div className="relative mt-6 rounded-lg border border-white/10 bg-white/[0.025] p-4 text-sm text-silver-2"><div className="flex justify-between gap-4"><span>Selected contribution</span><span className="font-bold text-white">{Number(amount) > 0 ? `M${Number(amount).toFixed(2)}` : "—"}</span></div><p className="mt-3 text-xs leading-relaxed text-steel">Online donations are coming soon. No payment will be requested or taken here yet.</p></div>
          <a href="/contact" className="btn btn-primary relative mt-5 w-full">Talk to us about supporting Oxsnow <span aria-hidden>↗</span></a>
        </div>
      </dialog>
    </>
  );
}
