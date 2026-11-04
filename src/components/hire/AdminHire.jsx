"use client";

import { useCallback, useEffect, useState } from "react";
import {
  dateLabel,
  money,
  PAYMENT_STYLES,
  STATUS_STYLES,
  statusLabel,
  timeLabel,
} from "@/lib/hire/ui";

const inputClass =
  "mt-2 h-10 w-full rounded-lg border border-white/15 bg-ink px-3 text-sm text-silver outline-none transition-colors placeholder:text-ash focus:border-ember";
const areaClass =
  "mt-2 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-silver outline-none transition-colors placeholder:text-ash focus:border-ember";
const labelClass = "text-[0.6rem] uppercase tracking-[0.18em] text-ash";

const EMPTY_EQUIPMENT = {
  id: "",
  name: "",
  slug: "",
  category: "cameras",
  description: "",
  dailyRate: "",
  deposit: "",
  quantityTotal: 1,
  ownership: "oxsnow",
  isDemo: true,
  active: true,
  imagesText: "",
  specsText: "",
  accessoriesText: "",
};

function toMinor(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function Badge({ status, map }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-[0.12em] ${map?.[status] || "border-white/15 text-steel"}`}
    >
      {statusLabel(status)}
    </span>
  );
}

function Panel({ title, children, action }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-metal">{title}</h3>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function AdminHire() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [bookingFilter, setBookingFilter] = useState("all");
  const [selectedId, setSelectedId] = useState("");
  const [staffInstructions, setStaffInstructions] = useState("");
  const [returnForm, setReturnForm] = useState({
    conditionNotes: "",
    damageNotes: "",
    missingAccessories: "",
  });
  const [payment, setPayment] = useState({
    kind: "rental",
    method: "bank_transfer",
    amount: "",
    reference: "",
    note: "",
    verify: true,
  });
  const [equipmentForm, setEquipmentForm] = useState(EMPTY_EQUIPMENT);
  const [maintenanceForm, setMaintenanceForm] = useState({
    equipmentId: "",
    startsOn: "",
    endsOn: "",
    reason: "",
  });
  const [settingsForm, setSettingsForm] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/hire");
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.error || "Could not load hire dashboard.");
      setData(d);
      if (!settingsForm) {
        setSettingsForm({
          paymentInstructions: { ...d.settings.paymentInstructions },
          terms: { ...d.settings.terms },
        });
      }
    } catch (err) {
      setError(err.message || "Could not load hire dashboard.");
    } finally {
      setLoading(false);
    }
  }, [settingsForm]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function act(payload, success) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const r = await fetch("/api/admin/hire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.error || "Action failed.");
      if (success) setNotice(success);
      await load();
      return d;
    } catch (err) {
      setError(err.message || "Action failed.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  function editEquipment(item) {
    setEquipmentForm({
      id: item.id,
      name: item.name,
      slug: item.slug,
      category: item.category,
      description: item.description,
      dailyRate: (item.dailyRateMinor / 100).toFixed(2),
      deposit: (item.depositMinor / 100).toFixed(2),
      quantityTotal: item.quantityTotal,
      ownership: item.ownership,
      isDemo: item.isDemo,
      active: item.active,
      imagesText: item.images.join("\n"),
      specsText: item.specs.map((s) => `${s.label}: ${s.value}`).join("\n"),
      accessoriesText: item.accessories.join("\n"),
    });
    setTab("equipment");
    window.scrollTo({ top: 180, behavior: "smooth" });
  }

  async function saveEquipment(e) {
    e.preventDefault();
    const specs = equipmentForm.specsText
      .split("\n")
      .map((line) => {
        const idx = line.indexOf(":");
        if (idx === -1) return { label: line.trim(), value: "" };
        return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
      })
      .filter((s) => s.label || s.value);
    const images = equipmentForm.imagesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const accessories = equipmentForm.accessoriesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const result = await act(
      {
        action: "equipment-save",
        equipment: {
          id: equipmentForm.id || undefined,
          name: equipmentForm.name,
          slug: equipmentForm.slug,
          category: equipmentForm.category,
          description: equipmentForm.description,
          dailyRateMinor: toMinor(equipmentForm.dailyRate),
          depositMinor: toMinor(equipmentForm.deposit),
          quantityTotal: Number(equipmentForm.quantityTotal) || 0,
          ownership: equipmentForm.ownership,
          isDemo: equipmentForm.isDemo,
          active: equipmentForm.active,
          specs,
          images,
          accessories,
        },
      },
      equipmentForm.id ? "Equipment updated." : "Equipment created."
    );
    if (result?.result?.id) {
      setEquipmentForm({ ...EMPTY_EQUIPMENT });
    }
  }

  async function uploadImage(file) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const r = await fetch("/api/admin/hire/upload", { method: "POST", body });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.error || "Upload failed.");
      setEquipmentForm((f) => ({
        ...f,
        imagesText: [f.imagesText, d.url].filter(Boolean).join("\n"),
      }));
      setNotice("Image uploaded.");
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-16">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-ember" />
      </div>
    );
  }

  if (!data) {
    return (
      <p className="rounded-lg border border-red-400/30 bg-red-400/5 px-4 py-3 text-sm text-red-200">
        {error || "Could not load hire dashboard."}
      </p>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "bookings", label: `Bookings (${data.bookings.length})` },
    { id: "equipment", label: `Equipment (${data.equipment.length})` },
    { id: "maintenance", label: `Maintenance (${data.maintenance.length})` },
    { id: "quotes", label: `Quotes (${data.quotes.length})` },
    { id: "settings", label: "Settings" },
  ];
  const selected = data.bookings.find((b) => b.id === selectedId);
  const filteredBookings =
    bookingFilter === "all"
      ? data.bookings
      : data.bookings.filter((b) => b.status === bookingFilter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 cursor-pointer rounded-full border px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
                tab === t.id
                  ? "border-ember bg-ember/10 text-white"
                  : "border-white/12 text-steel hover:border-white/25"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-full border border-white/12 px-4 py-2 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-steel hover:border-ember hover:text-ember"
        >
          Refresh
        </button>
      </div>

      {!data.emailConfigured && (
        <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/5 px-4 py-3 text-[0.78rem] text-amber-200">
          Email is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD to send booking
          notifications. Bookings are still saved and visible here.
        </p>
      )}
      {notice && (
        <p className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-200">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-400/30 bg-red-400/5 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {tab === "overview" && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 md:grid-cols-6">
            {[
              ["Bookings", data.reports.totals.bookings],
              ["Pending", data.reports.statusCounts.pending || 0],
              ["Approved", data.reports.statusCounts.approved || 0],
              ["Checked out", data.reports.statusCounts.checked_out || 0],
              ["Overdue", data.reports.overdue.length],
              ["Equipment", data.reports.totals.activeEquipment],
            ].map(([label, value]) => (
              <div key={label} className="bg-ink-2 px-4 py-6 text-center">
                <p className="text-2xl font-black text-metal">{value}</p>
                <p className="mt-1 text-[0.55rem] uppercase tracking-[0.2em] text-ash">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Panel title="Verified money">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-steel">Rental verified</dt>
                  <dd className="font-bold text-emerald-300">
                    {money(data.reports.money.verifiedRentalMinor)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-steel">Deposits verified</dt>
                  <dd className="font-bold text-emerald-300">
                    {money(data.reports.money.verifiedDepositMinor)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-white/10 pt-3">
                  <dt className="text-steel">Reported, unverified</dt>
                  <dd className="font-bold text-amber-300">
                    {money(data.reports.money.reportedMinor)}
                  </dd>
                </div>
              </dl>
            </Panel>
            <Panel title={`Upcoming collections (${data.reports.upcomingCollections.length})`}>
              <ul className="space-y-2 text-sm">
                {data.reports.upcomingCollections.slice(0, 6).map((b) => (
                  <li key={b.id} className="flex justify-between gap-3 border-b border-white/6 pb-2">
                    <span className="truncate text-silver-2">{b.customerName}</span>
                    <span className="shrink-0 text-ash">{dateLabel(b.startsOn)}</span>
                  </li>
                ))}
                {data.reports.upcomingCollections.length === 0 && (
                  <li className="text-ash">None scheduled.</li>
                )}
              </ul>
            </Panel>
            <Panel title={`Overdue returns (${data.reports.overdue.length})`}>
              <ul className="space-y-2 text-sm">
                {data.reports.overdue.slice(0, 6).map((b) => (
                  <li key={b.id} className="flex justify-between gap-3 border-b border-white/6 pb-2">
                    <span className="truncate text-silver-2">{b.customerName}</span>
                    <span className="shrink-0 text-red-300">{dateLabel(b.endsOn)}</span>
                  </li>
                ))}
                {data.reports.overdue.length === 0 && (
                  <li className="text-ash">Nothing overdue.</li>
                )}
              </ul>
            </Panel>
          </div>
        </div>
      )}

      {tab === "bookings" && (
        <div className="mt-6 space-y-5">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {["all", "pending", "approved", "checked_out", "returned", "rejected", "cancelled"].map(
              (s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setBookingFilter(s)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] ${
                    bookingFilter === s
                      ? "border-ember bg-ember/10 text-white"
                      : "border-white/12 text-steel"
                  }`}
                >
                  {s === "all" ? "All" : statusLabel(s)}
                </button>
              )
            )}
          </div>

          <div className="card overflow-x-auto p-0">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[0.55rem] uppercase tracking-[0.18em] text-ash">
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => {
                      setSelectedId(b.id);
                      setStaffInstructions(b.staffInstructions || "");
                      setReturnForm({
                        conditionNotes: b.conditionNotes || "",
                        damageNotes: b.damageNotes || "",
                        missingAccessories: b.missingAccessories || "",
                      });
                    }}
                    className={`cursor-pointer border-b border-white/6 last:border-0 hover:bg-white/[0.03] ${
                      selectedId === b.id ? "bg-ember/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-[0.68rem] text-ash">{b.reference}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-silver-2">{b.customerName}</p>
                      <p className="text-[0.68rem] text-ash">{b.email}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-steel">
                      {dateLabel(b.startsOn)} → {dateLabel(b.endsOn)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={b.status} map={STATUS_STYLES} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={b.paymentStatus} map={PAYMENT_STYLES} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-metal">
                      {money(b.totalMinor)}
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-ash">
                      No bookings in this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {selected && (
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[0.68rem] text-ash">{selected.reference}</p>
                    <h3 className="mt-1 text-lg font-bold text-metal">{selected.customerName}</h3>
                    <p className="text-[0.72rem] text-steel">
                      {selected.email} · {selected.phone}
                    </p>
                    <p className="mt-1 text-[0.72rem] text-steel">
                      {dateLabel(selected.startsOn)} → {dateLabel(selected.endsOn)} ·{" "}
                      {selected.rentalDays} day{selected.rentalDays === 1 ? "" : "s"}
                    </p>
                    {(selected.company || selected.productionLocation) && (
                      <p className="mt-1 text-[0.72rem] text-ash">
                        {[selected.company, selected.productionLocation].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge status={selected.status} map={STATUS_STYLES} />
                    <Badge status={selected.paymentStatus} map={PAYMENT_STYLES} />
                  </div>
                </div>

                <ul className="mt-4 space-y-2 border-t border-white/8 pt-4 text-sm">
                  {selected.items.map((i) => (
                    <li key={i.id} className="flex justify-between gap-3">
                      <span className="text-silver-2">
                        {i.name} <span className="text-ash">× {i.quantity}</span>
                      </span>
                      <span className="text-metal">{money(i.lineRentalMinor)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="mt-4 space-y-2 border-t border-white/8 pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-steel">Rental</dt>
                    <dd className="text-silver-2">{money(selected.rentalSubtotalMinor)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-steel">Refundable deposit</dt>
                    <dd className="text-silver-2">{money(selected.depositTotalMinor)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-white/8 pt-2">
                    <dt className="font-semibold text-metal">Total</dt>
                    <dd className="font-black text-fire">{money(selected.totalMinor)}</dd>
                  </div>
                </dl>
                {(selected.intendedUse || selected.notes) && (
                  <div className="mt-4 space-y-2 text-[0.75rem] leading-relaxed text-steel">
                    {selected.intendedUse && <p>Use: {selected.intendedUse}</p>}
                    {selected.notes && <p>Notes: {selected.notes}</p>}
                  </div>
                )}

                <label className="mt-4 block">
                  <span className={labelClass}>Staff instructions (sent to customer)</span>
                  <textarea
                    rows={3}
                    value={staffInstructions}
                    onChange={(e) => setStaffInstructions(e.target.value)}
                    className={areaClass}
                    placeholder="Collection time, location, payment details…"
                  />
                </label>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selected.status === "pending" && (
                    <>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          act(
                            {
                              action: "booking-transition",
                              bookingId: selected.id,
                              transition: "approve",
                              extra: { staffInstructions },
                            },
                            "Booking approved."
                          )
                        }
                        className="btn btn-primary"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          act(
                            {
                              action: "booking-transition",
                              bookingId: selected.id,
                              transition: "reject",
                              extra: { staffInstructions, detail: "Rejected by staff" },
                            },
                            "Booking rejected."
                          )
                        }
                        className="btn btn-ghost"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {selected.status === "approved" && (
                    <>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          act(
                            {
                              action: "booking-transition",
                              bookingId: selected.id,
                              transition: "checkout",
                              extra: { staffInstructions },
                            },
                            "Marked checked out."
                          )
                        }
                        className="btn btn-primary"
                      >
                        Check out
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          act(
                            {
                              action: "booking-transition",
                              bookingId: selected.id,
                              transition: "cancel",
                              extra: { staffInstructions, detail: "Cancelled by staff" },
                            },
                            "Booking cancelled."
                          )
                        }
                        className="btn btn-ghost"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {selected.status === "checked_out" && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        act(
                          {
                            action: "booking-transition",
                            bookingId: selected.id,
                            transition: "return",
                            extra: { ...returnForm, staffInstructions },
                          },
                          "Marked returned."
                        )
                      }
                      className="btn btn-primary"
                    >
                      Mark returned
                    </button>
                  )}
                </div>

                {selected.status === "checked_out" && (
                  <div className="mt-4 grid gap-3">
                    <label className="block">
                      <span className={labelClass}>Condition notes</span>
                      <input
                        value={returnForm.conditionNotes}
                        onChange={(e) =>
                          setReturnForm((f) => ({ ...f, conditionNotes: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className={labelClass}>Damage notes</span>
                      <input
                        value={returnForm.damageNotes}
                        onChange={(e) =>
                          setReturnForm((f) => ({ ...f, damageNotes: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className={labelClass}>Missing accessories</span>
                      <input
                        value={returnForm.missingAccessories}
                        onChange={(e) =>
                          setReturnForm((f) => ({ ...f, missingAccessories: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <Panel title="Payments">
                  {selected.payments.length === 0 ? (
                    <p className="text-sm text-ash">No payments recorded.</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {selected.payments.map((p) => (
                        <li key={p.id} className="border-b border-white/6 pb-2 last:border-0">
                          <div className="flex justify-between gap-3">
                            <span className="capitalize text-silver-2">
                              {p.kind} · {p.method.replaceAll("_", " ")}
                            </span>
                            <span className="font-bold text-metal">{money(p.amountMinor)}</span>
                          </div>
                          <div className="flex justify-between gap-3 text-[0.68rem] text-ash">
                            <span>
                              {p.status} · {timeLabel(p.createdAt)}
                              {p.reference ? ` · ${p.reference}` : ""}
                            </span>
                            <Badge status={p.status} map={PAYMENT_STYLES} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    act(
                      {
                        action: "payment-record",
                        payment: {
                          bookingId: selected.id,
                          kind: payment.kind,
                          method: payment.method,
                          amountMinor: toMinor(payment.amount),
                          reference: payment.reference,
                          note: payment.note,
                          verify: payment.verify,
                        },
                      },
                      payment.verify ? "Payment verified." : "Payment recorded."
                    ).then((res) => {
                      if (res) setPayment((p) => ({ ...p, amount: "", reference: "", note: "" }));
                    });
                  }}
                  className="card space-y-3 p-5"
                >
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-metal">
                    Record payment
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className={labelClass}>Type</span>
                      <select
                        value={payment.kind}
                        onChange={(e) => setPayment((p) => ({ ...p, kind: e.target.value }))}
                        className={inputClass}
                      >
                        <option value="rental">Rental</option>
                        <option value="deposit">Deposit</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className={labelClass}>Method</span>
                      <select
                        value={payment.method}
                        onChange={(e) => setPayment((p) => ({ ...p, method: e.target.value }))}
                        className={inputClass}
                      >
                        <option value="bank_transfer">Bank transfer</option>
                        <option value="mpesa">M-Pesa</option>
                        <option value="ecocash">EcoCash</option>
                        <option value="other">Other</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className={labelClass}>Amount (M)</span>
                      <input
                        required
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={payment.amount}
                        onChange={(e) => setPayment((p) => ({ ...p, amount: e.target.value }))}
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className={labelClass}>Reference</span>
                      <input
                        value={payment.reference}
                        onChange={(e) => setPayment((p) => ({ ...p, reference: e.target.value }))}
                        className={inputClass}
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className={labelClass}>Note</span>
                    <input
                      value={payment.note}
                      onChange={(e) => setPayment((p) => ({ ...p, note: e.target.value }))}
                      className={inputClass}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-[0.75rem] text-steel">
                    <input
                      type="checkbox"
                      checked={payment.verify}
                      onChange={(e) => setPayment((p) => ({ ...p, verify: e.target.checked }))}
                    />
                    Verified by staff (marks paid when totals match)
                  </label>
                  <button type="submit" disabled={busy} className="btn btn-ghost w-full">
                    Record payment
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "equipment" && (
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-metal">
                Catalogue
              </h3>
              <button
                type="button"
                onClick={() => setEquipmentForm({ ...EMPTY_EQUIPMENT })}
                className="rounded-full border border-white/12 px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-steel hover:border-ember hover:text-ember"
              >
                + New item
              </button>
            </div>
            {data.equipment.map((item) => (
              <div key={item.id} className="card flex gap-3 p-3">
                <img
                  src={item.images?.[0] || "/equipment/demo-card.svg"}
                  alt=""
                  className="h-16 w-20 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-silver-2">{item.name}</p>
                    {item.archived && (
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[0.5rem] uppercase text-ash">
                        archived
                      </span>
                    )}
                    {!item.active && !item.archived && (
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[0.5rem] uppercase text-ash">
                        inactive
                      </span>
                    )}
                  </div>
                  <p className="text-[0.68rem] text-ash">
                    {item.categoryLabel} · {money(item.dailyRateMinor)}/day · {item.quantityTotal} units
                  </p>
                  <div className="mt-1.5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => editEquipment(item)}
                      className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-ember"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        act(
                          {
                            action: "equipment-archive",
                            id: item.id,
                            archived: !item.archived,
                          },
                          item.archived ? "Equipment restored." : "Equipment archived."
                        )
                      }
                      className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-ash hover:text-red-300"
                    >
                      {item.archived ? "Restore" : "Archive"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={saveEquipment} className="card space-y-4 p-5">
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-metal">
              {equipmentForm.id ? "Edit equipment" : "New equipment"}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className={labelClass}>Name *</span>
                <input
                  required
                  value={equipmentForm.name}
                  onChange={(e) => setEquipmentForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Slug</span>
                <input
                  value={equipmentForm.slug}
                  onChange={(e) => setEquipmentForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="auto from name"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Category *</span>
                <select
                  value={equipmentForm.category}
                  onChange={(e) => setEquipmentForm((f) => ({ ...f, category: e.target.value }))}
                  className={inputClass}
                >
                  {data.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Daily rate (M) *</span>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={equipmentForm.dailyRate}
                  onChange={(e) => setEquipmentForm((f) => ({ ...f, dailyRate: e.target.value }))}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Deposit (M)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={equipmentForm.deposit}
                  onChange={(e) => setEquipmentForm((f) => ({ ...f, deposit: e.target.value }))}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Units in stock *</span>
                <input
                  required
                  type="number"
                  min="0"
                  value={equipmentForm.quantityTotal}
                  onChange={(e) =>
                    setEquipmentForm((f) => ({ ...f, quantityTotal: e.target.value }))
                  }
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Ownership</span>
                <select
                  value={equipmentForm.ownership}
                  onChange={(e) => setEquipmentForm((f) => ({ ...f, ownership: e.target.value }))}
                  className={inputClass}
                >
                  <option value="oxsnow">Oxsnow-owned</option>
                  <option value="partner">Partner-owned</option>
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className={labelClass}>Description</span>
                <textarea
                  rows={3}
                  value={equipmentForm.description}
                  onChange={(e) => setEquipmentForm((f) => ({ ...f, description: e.target.value }))}
                  className={areaClass}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className={labelClass}>Specs (one per line, &quot;Label: value&quot;)</span>
                <textarea
                  rows={4}
                  value={equipmentForm.specsText}
                  onChange={(e) => setEquipmentForm((f) => ({ ...f, specsText: e.target.value }))}
                  className={areaClass}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className={labelClass}>Accessories (one per line)</span>
                <textarea
                  rows={3}
                  value={equipmentForm.accessoriesText}
                  onChange={(e) =>
                    setEquipmentForm((f) => ({ ...f, accessoriesText: e.target.value }))
                  }
                  className={areaClass}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className={labelClass}>Image URLs (one per line)</span>
                <textarea
                  rows={3}
                  value={equipmentForm.imagesText}
                  onChange={(e) => setEquipmentForm((f) => ({ ...f, imagesText: e.target.value }))}
                  className={areaClass}
                />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-[0.75rem] text-steel">
                <input
                  type="checkbox"
                  checked={equipmentForm.active}
                  onChange={(e) => setEquipmentForm((f) => ({ ...f, active: e.target.checked }))}
                />
                Active
              </label>
              <label className="flex items-center gap-2 text-[0.75rem] text-steel">
                <input
                  type="checkbox"
                  checked={equipmentForm.isDemo}
                  onChange={(e) => setEquipmentForm((f) => ({ ...f, isDemo: e.target.checked }))}
                />
                Demo item
              </label>
              <label className="cursor-pointer rounded-full border border-white/12 px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-steel hover:border-ember hover:text-ember">
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => uploadImage(e.target.files?.[0])}
                />
              </label>
            </div>
            <button type="submit" disabled={busy} className="btn btn-primary w-full">
              {equipmentForm.id ? "Save changes" : "Create equipment"}
            </button>
          </form>
        </div>
      )}

      {tab === "maintenance" && (
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              act(
                { action: "maintenance-add", maintenance: maintenanceForm },
                "Maintenance block added."
              ).then((res) => {
                if (res) setMaintenanceForm({ equipmentId: "", startsOn: "", endsOn: "", reason: "" });
              });
            }}
            className="card space-y-3 p-5"
          >
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-metal">
              Block equipment
            </h3>
            <label className="block">
              <span className={labelClass}>Equipment *</span>
              <select
                required
                value={maintenanceForm.equipmentId}
                onChange={(e) =>
                  setMaintenanceForm((f) => ({ ...f, equipmentId: e.target.value }))
                }
                className={inputClass}
              >
                <option value="">Choose equipment</option>
                {data.equipment
                  .filter((e) => !e.archived)
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>From *</span>
                <input
                  required
                  type="date"
                  min={data.today}
                  value={maintenanceForm.startsOn}
                  onChange={(e) =>
                    setMaintenanceForm((f) => ({ ...f, startsOn: e.target.value }))
                  }
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>To *</span>
                <input
                  required
                  type="date"
                  min={maintenanceForm.startsOn || data.today}
                  value={maintenanceForm.endsOn}
                  onChange={(e) => setMaintenanceForm((f) => ({ ...f, endsOn: e.target.value }))}
                  className={inputClass}
                />
              </label>
            </div>
            <label className="block">
              <span className={labelClass}>Reason</span>
              <input
                value={maintenanceForm.reason}
                onChange={(e) => setMaintenanceForm((f) => ({ ...f, reason: e.target.value }))}
                className={inputClass}
              />
            </label>
            <button type="submit" disabled={busy} className="btn btn-primary w-full">
              Add block
            </button>
            <p className="text-[0.7rem] leading-relaxed text-ash">
              A maintenance block makes the whole unit unavailable for overlapping dates.
            </p>
          </form>

          <Panel title={`Maintenance blocks (${data.maintenance.length})`}>
            <ul className="space-y-2 text-sm">
              {data.maintenance.map((m) => {
                const eq = data.equipment.find((e) => e.id === m.equipmentId);
                return (
                  <li key={m.id} className="border-b border-white/6 pb-2 last:border-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-silver-2">{eq?.name || m.equipmentId}</p>
                        <p className="text-[0.7rem] text-ash">
                          {dateLabel(m.startsOn)} → {dateLabel(m.endsOn)}
                          {m.reason ? ` · ${m.reason}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => act({ action: "maintenance-delete", id: m.id }, "Block removed.")}
                        className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-ash hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
              {data.maintenance.length === 0 && <li className="text-ash">No blocks.</li>}
            </ul>
          </Panel>
        </div>
      )}

      {tab === "quotes" && (
        <div className="card mt-6 overflow-x-auto p-0">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[0.55rem] uppercase tracking-[0.18em] text-ash">
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Request</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.quotes.map((q) => (
                <tr key={q.id} className="border-b border-white/6 last:border-0">
                  <td className="px-4 py-3 font-mono text-[0.68rem] text-ash">
                    {q.reference}
                    <p className="mt-1 text-[0.65rem]">{timeLabel(q.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-silver-2">{q.name}</p>
                    <p className="text-[0.68rem] text-ash">
                      {q.email} · {q.phone}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-steel">
                    {q.startsOn ? `${dateLabel(q.startsOn)} → ${dateLabel(q.endsOn)}` : "—"}
                  </td>
                  <td className="max-w-[320px] px-4 py-3 text-[0.75rem] text-steel">
                    <p className="line-clamp-2">{q.requestedEquipment}</p>
                    {q.budget && <p className="mt-1 text-[0.68rem] text-ash">Budget: {q.budget}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={q.status}
                      onChange={(e) =>
                        act(
                          { action: "quote-status", id: q.id, status: e.target.value },
                          "Quote updated."
                        )
                      }
                      className="h-9 rounded-lg border border-white/15 bg-ink px-2 text-[0.7rem] text-silver"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="quoted">Quoted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
              {data.quotes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ash">
                    No quote requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "settings" && settingsForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            act(
              {
                action: "settings-save",
                paymentInstructions: settingsForm.paymentInstructions,
                terms: settingsForm.terms,
              },
              "Settings saved."
            );
          }}
          className="mt-6 grid gap-5 lg:grid-cols-2"
        >
          <div className="card space-y-3 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-metal">
                Payment instructions
              </h3>
              <select
                value={settingsForm.paymentInstructions.status || "draft"}
                onChange={(e) =>
                  setSettingsForm((f) => ({
                    ...f,
                    paymentInstructions: {
                      ...f.paymentInstructions,
                      status: e.target.value,
                    },
                  }))
                }
                className="h-9 rounded-lg border border-white/15 bg-ink px-2 text-[0.7rem] text-silver"
              >
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
              </select>
            </div>
            <label className="block">
              <span className={labelClass}>Note</span>
              <textarea
                rows={3}
                value={settingsForm.paymentInstructions.note || ""}
                onChange={(e) =>
                  setSettingsForm((f) => ({
                    ...f,
                    paymentInstructions: { ...f.paymentInstructions, note: e.target.value },
                  }))
                }
                className={areaClass}
              />
            </label>
            {[
              ["bank_transfer", "Bank transfer"],
              ["mpesa", "M-Pesa"],
              ["ecocash", "EcoCash"],
            ].map(([key, label]) => (
              <label key={key} className="block">
                <span className={labelClass}>{label}</span>
                <input
                  value={settingsForm.paymentInstructions[key] || ""}
                  onChange={(e) =>
                    setSettingsForm((f) => ({
                      ...f,
                      paymentInstructions: {
                        ...f.paymentInstructions,
                        [key]: e.target.value,
                      },
                    }))
                  }
                  className={inputClass}
                />
              </label>
            ))}
            <p className="text-[0.7rem] leading-relaxed text-ash">
              Draft instructions stay visibly marked as drafts on the customer terms page.
            </p>
          </div>

          <div className="card space-y-3 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-metal">
                Hire terms
              </h3>
              <select
                value={settingsForm.terms.status || "draft"}
                onChange={(e) =>
                  setSettingsForm((f) => ({
                    ...f,
                    terms: { ...f.terms, status: e.target.value },
                  }))
                }
                className="h-9 rounded-lg border border-white/15 bg-ink px-2 text-[0.7rem] text-silver"
              >
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
              </select>
            </div>
            <label className="block">
              <span className={labelClass}>Note</span>
              <textarea
                rows={2}
                value={settingsForm.terms.note || ""}
                onChange={(e) =>
                  setSettingsForm((f) => ({
                    ...f,
                    terms: { ...f.terms, note: e.target.value },
                  }))
                }
                className={areaClass}
              />
            </label>
            {[
              ["collection_return", "Collection & return"],
              ["deposits", "Deposits"],
              ["inspection", "Inspection"],
              ["damage", "Damage & missing items"],
              ["cancellation", "Cancellation"],
              ["late_returns", "Late returns"],
            ].map(([key, label]) => (
              <label key={key} className="block">
                <span className={labelClass}>{label}</span>
                <textarea
                  rows={2}
                  value={settingsForm.terms[key] || ""}
                  onChange={(e) =>
                    setSettingsForm((f) => ({
                      ...f,
                      terms: { ...f.terms, [key]: e.target.value },
                    }))
                  }
                  className={areaClass}
                />
              </label>
            ))}
          </div>

          <div className="lg:col-span-2">
            <button type="submit" disabled={busy} className="btn btn-primary">
              Save settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
