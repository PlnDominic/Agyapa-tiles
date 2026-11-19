"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { money } from "@/lib/format";
import { Thumb } from "./Thumb";
import { useCart } from "./CartProvider";
import { CheckIcon, PlusIcon } from "@/components/ui/icons";

export function ProductCard({ product: p, index = 0 }: { product: Product; index?: number }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const sold = p.stock <= 0;
  const low = !sold && p.stock <= 100;
  const off = p.compare_at_price && p.compare_at_price > p.price ? Math.round((1 - p.price / p.compare_at_price) * 100) : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, delay: (index % 4) * 0.07, ease: [0.28, 0.11, 0.32, 1] }}
      className="group relative flex flex-col"
    >
      <div className="relative">
      <Link href={`/product/${p.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-steel-50 shadow-soft transition-shadow duration-500 group-hover:shadow-lift">
        <div className="absolute inset-0 transition-transform duration-[900ms] ease-[var(--ease-apple)] group-hover:scale-[1.07]">
          <Thumb pattern={p.pattern_key} base={p.color_hex} accent={p.accent_hex} imageUrl={p.image_url} seed={p.slug} alt={p.name} className="h-full w-full" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute left-4 top-4 flex gap-2">
          {off > 0 && <span className="glass rounded-full px-3 py-1 text-xs font-semibold text-brand-700">−{off}%</span>}
          {low && <span className="glass rounded-full px-3 py-1 text-xs font-semibold text-steel-800">Only {p.stock} left</span>}
          {sold && <span className="rounded-full bg-steel-900 px-3 py-1 text-xs font-semibold text-white">Sold out</span>}
        </div>
      </Link>

      <button
        type="button"
        disabled={sold}
        aria-label={`Add ${p.name} to bag`}
        onClick={() => { add(p, 1); setAdded(true); setTimeout(() => setAdded(false), 1400); }}
        className="glass absolute bottom-4 right-4 z-10 grid size-11 translate-y-2 place-items-center rounded-full text-steel-900 opacity-0 shadow-soft transition-all duration-300 hover:bg-brand-600 hover:text-white focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 disabled:hidden max-md:translate-y-0 max-md:opacity-100"
      >
        <motion.span key={String(added)} initial={{ scale: 0.4, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} className="grid place-items-center">
          {added ? <CheckIcon /> : <PlusIcon />}
        </motion.span>
      </button>
      </div>

      <div className="px-1 pt-4">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-steel-500">{p.category?.name ?? "Tiles"}</p>
        <Link href={`/product/${p.slug}`} className="mt-1 block text-[1.0625rem] font-semibold tracking-[-0.02em] text-steel-900 hover:text-brand-600">{p.name}</Link>
        <p className="mt-0.5 text-sm text-steel-500">{[p.size, p.finish].filter(Boolean).join(" · ")}</p>
        <p className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-semibold tracking-tight">{money(p.price)}</span>
          <span className="text-xs text-steel-500">/ {p.unit}</span>
          {p.compare_at_price && p.compare_at_price > p.price && <span className="text-sm text-steel-400 line-through">{money(p.compare_at_price)}</span>}
        </p>
      </div>
    </motion.article>
  );
}
