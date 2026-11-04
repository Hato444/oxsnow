export const STATUS_STYLES = {
  pending: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  approved: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  checked_out: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  returned: "border-white/20 bg-white/5 text-silver-2",
  rejected: "border-red-400/40 bg-red-400/10 text-red-200",
  cancelled: "border-red-400/40 bg-red-400/10 text-red-200",
};

export const PAYMENT_STYLES = {
  unpaid: "border-white/20 bg-white/5 text-steel",
  reported: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  partial: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  paid: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  refunded: "border-white/20 bg-white/5 text-steel",
};

export function statusLabel(status) {
  return String(status || "").replaceAll("_", " ");
}

export function money(minor, currency = "LSL") {
  return `${currency === "LSL" ? "M " : ""}${(Number(minor || 0) / 100).toFixed(2)}`;
}

export function dateLabel(iso) {
  if (!iso) return "—";
  try {
    return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function timeLabel(ts) {
  if (!ts) return "—";
  try {
    return new Date(Number(ts)).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}
