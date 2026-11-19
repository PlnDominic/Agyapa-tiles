"use client";

import { motion } from "motion/react";
import { CheckIcon } from "@/components/ui/icons";
import { dateTime } from "@/lib/format";
import { ORDER_STATUSES, STATUS_HELP, STATUS_LABEL, type OrderEvent, type OrderStatus } from "@/lib/types";

export function OrderTimeline({ status, events }: { status: OrderStatus; events: OrderEvent[] }) {
  if (status === "cancelled") {
    const ev = [...events].reverse().find((e) => e.status === "cancelled");
    return (
      <div className="rounded-3xl bg-steel-50 p-6">
        <p className="font-semibold">Order cancelled</p>
        <p className="mt-1 text-sm text-steel-600">{ev?.message ?? STATUS_HELP.cancelled}{ev && <> · {dateTime(ev.created_at)}</>}</p>
      </div>
    );
  }
  const idx = ORDER_STATUSES.indexOf(status as (typeof ORDER_STATUSES)[number]);
  const at = (s: string) => [...events].reverse().find((e) => e.status === s);
  return (
    <ol className="relative space-y-8 pl-12" aria-label="Order progress">
      <span aria-hidden className="absolute bottom-4 left-[19px] top-4 w-0.5 bg-steel-100" />
      <motion.span aria-hidden className="absolute left-[19px] top-4 w-0.5 origin-top bg-brand-600" style={{ height: "calc(100% - 2rem)" }} initial={{ scaleY: 0 }} animate={{ scaleY: idx / (ORDER_STATUSES.length - 1) }} transition={{ duration: 1.4, ease: [0.28, 0.11, 0.32, 1] }} />
      {ORDER_STATUSES.map((s, i) => {
        const done = i <= idx, current = i === idx, ev = at(s);
        return (
          <motion.li key={s} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08, duration: 0.5 }} className="relative" aria-current={current ? "step" : undefined}>
            <span className={`absolute -left-12 top-0 grid size-10 place-items-center rounded-full transition-colors ${done ? "bg-brand-600 text-white" : "bg-steel-100 text-steel-400"} ${current && s !== "delivered" ? "pulse-ring" : ""}`}>
              {done ? <CheckIcon width={18} height={18} /> : <span className="text-xs font-bold">{i + 1}</span>}
            </span>
            <p className={`font-semibold tracking-tight ${done ? "text-steel-900" : "text-steel-400"}`}>{STATUS_LABEL[s]}</p>
            {done ? (
              <p className="mt-0.5 text-sm text-steel-500">{ev?.message ?? STATUS_HELP[s]}{ev && <span className="text-steel-400"> · {dateTime(ev.created_at)}</span>}</p>
            ) : (<p className="mt-0.5 text-sm text-steel-300">{STATUS_HELP[s]}</p>)}
          </motion.li>
        );
      })}
    </ol>
  );
}
