"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Product } from "@/lib/types";
import { money, unitLabel } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { useCart } from "./CartProvider";
import { CheckIcon, MinusIcon, PlusIcon, TruckIcon, ShieldIcon } from "@/components/ui/icons";

export function ProductBuy({ product: p }: { product: Product }) {
  const { add, settings } = useCart();
  const [qty, setQty] = useState(Math.min(p.stock, p.unit === "sqm" ? Math.max(1, Math.ceil(p.coverage_per_box * 5)) : 1));
  const [done, setDone] = useState(false);
  const sold = p.stock <= 0;
  const boxes = Math.ceil(qty / (p.coverage_per_box || 1));
  const carton = p.unit === "carton" && p.coverage_per_box > 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-steel-700">Quantity ({unitLabel(p.unit, 2)})</span>
        <div className="flex items-center rounded-full bg-steel-50">
          <button aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-11 place-items-center rounded-full hover:bg-steel-100"><MinusIcon /></button>
          <input aria-label="Quantity" inputMode="numeric" value={qty} onChange={(e) => setQty(Math.max(1, Math.min(p.stock, Number(e.target.value.replace(/\D/g, "")) || 1)))} className="w-16 bg-transparent text-center text-lg font-semibold tabular-nums outline-none" />
          <button aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(p.stock, q + 1))} className="grid size-11 place-items-center rounded-full hover:bg-steel-100"><PlusIcon /></button>
        </div>
      </div>
      {carton ? (
        <p className="mt-2 text-right text-xs text-steel-500">≈ {(qty * p.coverage_per_box).toFixed(2)} m² in total · about {p.coverage_per_box} m² per carton</p>
      ) : p.unit === "sqm" && p.coverage_per_box > 0 ? (
        <p className="mt-2 text-right text-xs text-steel-500">≈ {boxes} {boxes === 1 ? "box" : "boxes"} · {p.coverage_per_box} m² per box</p>
      ) : null}

      <div className="mt-6 flex items-end justify-between border-t border-steel-100 pt-6">
        <span className="text-sm text-steel-500">Subtotal</span>
        <motion.span key={qty} initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-3xl font-bold tracking-[-0.04em] tabular-nums">{money(p.price * qty)}</motion.span>
      </div>

      <Button size="lg" className="mt-5 w-full" disabled={sold} onClick={() => { add(p, qty); setDone(true); setTimeout(() => setDone(false), 1600); }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={String(done)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-2">
            {sold ? "Sold out" : done ? <><CheckIcon />Added to bag</> : "Add to bag"}
          </motion.span>
        </AnimatePresence>
      </Button>

      <ul className="mt-6 space-y-3 text-sm text-steel-600">
        <li className="flex items-center gap-3"><TruckIcon className="text-brand-600" />Free delivery on orders over {money(settings.free_delivery_threshold)}</li>
        <li className="flex items-center gap-3"><ShieldIcon className="text-brand-600" />Inspected for shade and size before dispatch</li>
      </ul>
    </div>
  );
}
