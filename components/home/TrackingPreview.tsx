"use client";

import { motion } from "motion/react";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/motion";
import { CheckIcon, PackageIcon, TruckIcon } from "@/components/ui/icons";

const steps = [
  { t: "Order placed", d: "Today, 09:12" },
  { t: "Confirmed", d: "Today, 09:40" },
  { t: "Preparing your tiles", d: "Today, 11:05" },
  { t: "Out for delivery", d: "Tomorrow" },
];

export function TrackingPreview() {
  return (
    <section id="delivery" className="container-x pt-28 md:pt-40" aria-label="Order tracking">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow">Delivery &amp; tracking</p>
          <h2 className="t-1 mt-3">Always know<br />where your tiles are.</h2>
          <p className="lead mt-5 max-w-md">No account needed. Use your order number and email to follow every milestone, from our warehouse to your doorstep.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/track">Track an order</ButtonLink>
            <ButtonLink href="/shop" variant="secondary">Start shopping</ButtonLink>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative rounded-[36px] bg-white p-6 shadow-lift ring-1 ring-black/5 md:p-8">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-medium uppercase tracking-[0.12em] text-steel-500">Order</p><p className="text-lg font-bold tracking-tight">AGY-100241</p></div>
              <span className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700"><TruckIcon width={15} height={15} />In progress</span>
            </div>
            <ol className="relative mt-8 space-y-7 pl-10">
              <span aria-hidden className="absolute bottom-3 left-[15px] top-3 w-0.5 bg-steel-100" />
              <motion.span aria-hidden className="absolute left-[15px] top-3 w-0.5 origin-top bg-brand-600" style={{ height: "calc(100% - 3.5rem)" }} initial={{ scaleY: 0 }} whileInView={{ scaleY: 0.66 }} viewport={{ once: true }} transition={{ duration: 1.8, delay: 0.3, ease: [0.28, 0.11, 0.32, 1] }} />
              {steps.map((s, i) => {
                const done = i < 3;
                return (
                  <motion.li key={s.t} className="relative" initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 + i * 0.35 }}>
                    <span className={`absolute -left-10 top-0 grid size-8 place-items-center rounded-full ${done ? "bg-brand-600 text-white" : "bg-steel-100 text-steel-400"} ${i === 2 ? "pulse-ring" : ""}`}>
                      {done ? <CheckIcon width={16} height={16} /> : <PackageIcon width={15} height={15} />}
                    </span>
                    <p className={`font-semibold tracking-tight ${done ? "text-steel-900" : "text-steel-400"}`}>{s.t}</p>
                    <p className="text-sm text-steel-500">{s.d}</p>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
