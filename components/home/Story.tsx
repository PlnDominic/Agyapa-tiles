"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import Image from "next/image";
import { TileArt } from "@/components/ui/TileArt";
import type { Product } from "@/lib/types";

const steps = [
  { n: "01", title: "Find the look.", body: "Browse curated collections of porcelain, marble-look, wood-look and outdoor tiles, with true-to-life colour and clear specifications." },
  { n: "02", title: "Know exactly how much.", body: "Use the tile calculator to measure your room, add the right allowance for cuts, and order the right number of boxes. No guesswork." },
  { n: "03", title: "Delivered and tracked.", body: "Order in minutes and follow each milestone, from confirmed to preparing to out for delivery, until it lands at your door." },
];

export function Story({ products }: { products: Product[] }) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(steps.length - 1, Math.floor(v * steps.length * 0.999))));
  // Three products from different collections (real photos where available), falling back to the first three.
  const byCat = new Map<string, Product>();
  for (const p of products) if (!byCat.has(p.category_id ?? p.id)) byCat.set(p.category_id ?? p.id, p);
  const shown = [...byCat.values(), ...products.filter((p) => ![...byCat.values()].includes(p))].slice(0, 3);

  return (
    <section ref={ref} className="relative h-[330vh]" aria-label="How it works">
      <div className="sticky top-[60px] flex h-[calc(100svh-60px)] items-center">
        <div className="container-x grid items-center gap-10 md:grid-cols-2 md:gap-20">
          <div className="relative order-2 md:order-1">
            <p className="eyebrow">How it works</p>
            <div className="relative mt-5 min-h-[17rem]">
              <AnimatePresence mode="wait">
                <motion.div key={active} initial={{ opacity: 0, y: 28, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -20, filter: "blur(6px)" }} transition={{ duration: 0.55, ease: [0.28, 0.11, 0.32, 1] }}>
                  <p className="text-[clamp(4rem,10vw,7rem)] font-bold leading-none tracking-[-0.06em] text-steel-100">{steps[active].n}</p>
                  <h2 className="t-1 -mt-3">{steps[active].title}</h2>
                  <p className="lead mt-5 max-w-md">{steps[active].body}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-8 flex gap-2" aria-hidden>
              {steps.map((_, i) => (
                <span key={i} className="h-1 w-12 overflow-hidden rounded-full bg-steel-100">
                  <motion.span className="block h-full rounded-full bg-brand-600" initial={false} animate={{ width: i <= active ? "100%" : "0%" }} transition={{ duration: 0.6, ease: [0.28, 0.11, 0.32, 1] }} />
                </span>
              ))}
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[460px] max-md:max-h-[34vh] max-md:aspect-[16/10]">
              <AnimatePresence>
                <motion.div key={active} className="absolute inset-0 overflow-hidden shadow-lift"
                  initial={{ opacity: 0, scale: 0.92, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 1.06, rotate: 2 }} transition={{ duration: 0.8, ease: [0.28, 0.11, 0.32, 1] }}>
                  {shown[active].image_url ? (
                    <Image src={shown[active].image_url!} alt={shown[active].name} fill sizes="(min-width: 768px) 460px, 100vw" className="object-cover" priority={active === 0} />
                  ) : (
                    <TileArt pattern={shown[active].pattern_key} base={shown[active].color_hex} accent={shown[active].accent_hex} seed={shown[active].slug} className="h-full w-full" grout />
                  )}
                  <div className="glass absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl px-4 py-3">
                    <span className="text-sm font-semibold tracking-tight">{shown[active].name}</span>
                    <span className="text-xs text-steel-600">{shown[active].size}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
