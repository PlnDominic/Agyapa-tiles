"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { moneyShort } from "@/lib/format";

export function RevenueChart({ data }: { data: { label: string; revenue: number; orders: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const [hover, setHover] = useState<number | null>(null);
  const h = hover !== null ? data[hover] : null;
  return (
    <div>
      <div className="mb-4 flex min-h-10 items-baseline justify-between">
        <p className="text-sm text-steel-500">{h ? h.label : "Last 14 days"}</p>
        <p className="text-right font-semibold tabular-nums">{h ? <>{moneyShort(h.revenue)} <span className="text-sm font-normal text-steel-500">· {h.orders} orders</span></> : moneyShort(data.reduce((s, d) => s + d.revenue, 0))}</p>
      </div>
      <div className="flex h-48 items-end gap-1.5 sm:gap-2" role="img" aria-label="Revenue over the last 14 days">
        {data.map((d, i) => (
          <div key={d.label} className="flex h-full flex-1 items-end" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <motion.div
              className={`w-full rounded-t-lg ${hover === i ? "bg-brand-600" : "bg-brand-300"}`}
              initial={{ height: 0 }} animate={{ height: `${Math.max(3, (d.revenue / max) * 100)}%` }}
              transition={{ duration: 0.9, delay: i * 0.04, ease: [0.28, 0.11, 0.32, 1] }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-steel-400"><span>{data[0].label}</span><span>{data[data.length - 1].label}</span></div>
    </div>
  );
}
