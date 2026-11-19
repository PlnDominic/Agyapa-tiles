"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TileArt } from "@/components/ui/TileArt";
import type { Product } from "@/lib/types";
import Image from "next/image";
import clsx from "clsx";

function ViewArt({ p, view }: { p: Product; view: "tile" | "laid" | "detail" }) {
  if (view === "laid") {
    return (
      <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-[3px] bg-steel-300 p-[3px]">
        {Array.from({ length: 9 }, (_, k) => (
          <div key={k} className="relative overflow-hidden"><TileArt pattern={p.pattern_key} base={p.color_hex} accent={p.accent_hex} seed={`${p.slug}-${k}`} className="absolute inset-0 h-full w-full" /></div>
        ))}
      </div>
    );
  }
  return (
    <div className="h-full w-full" style={{ transform: view === "detail" ? "scale(2.4)" : undefined, transformOrigin: "30% 30%" }}>
      <TileArt pattern={p.pattern_key} base={p.color_hex} accent={p.accent_hex} seed={p.slug} className="h-full w-full" title={view === "tile" ? p.name : undefined} />
    </div>
  );
}

export function ProductGallery({ product: p }: { product: Product }) {
  const views = [
    { key: "tile", label: "Surface" },
    { key: "laid", label: "Laid" },
    { key: "detail", label: "Detail" },
  ] as const;
  const [i, setI] = useState(0);
  const v = views[i];
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-[36px] bg-steel-50 shadow-soft md:aspect-[4/4.4]">
        <AnimatePresence mode="popLayout">
          <motion.div key={v.key} className="absolute inset-0" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: [0.28, 0.11, 0.32, 1] }}>
            {p.image_url && i === 0 ? (
              <Image src={p.image_url} alt={p.name} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" priority />
            ) : (
              <div className="absolute inset-0 overflow-hidden"><ViewArt p={p} view={v.key} /></div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {views.map((x, k) => (
          <button key={x.key} onClick={() => setI(k)} aria-label={`Show ${x.label} view`} aria-pressed={i === k} className={clsx("relative aspect-[4/3] overflow-hidden rounded-2xl ring-offset-2 transition-all", i === k ? "ring-2 ring-brand-600" : "opacity-70 hover:opacity-100")}>
            <div className="absolute inset-0 overflow-hidden"><ViewArt p={p} view={x.key} /></div>
            <span className="glass absolute inset-x-2 bottom-2 rounded-full py-0.5 text-center text-[11px] font-semibold">{x.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
