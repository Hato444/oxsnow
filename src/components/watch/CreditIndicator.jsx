import { Ticket } from "lucide-react";
import { creditLabel } from "@/lib/vod/rules.mjs";

export default function CreditIndicator({ remaining = 0 }) {
  return <div className="flex items-center gap-2 text-sm text-silver-2">
    <span className="flex gap-1" aria-hidden="true">{[0, 1].map((index) => <Ticket key={index} size={17} strokeWidth={1.8} className={index < remaining ? "text-ember drop-shadow-[0_0_5px_rgba(255,69,0,0.55)]" : "text-steel/50"} />)}</span>
    <span>{creditLabel(remaining)}</span>
  </div>;
}
