"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Reveal } from "@/components/ui/motion";
import { Button } from "@/components/ui/Button";
import { Thumb } from "@/components/shop/Thumb";
import { useCart } from "@/components/shop/CartProvider";
import { money } from "@/lib/format";
import { HOME_ONLY } from "@/lib/config";
import type { Product } from "@/lib/types";

export function Calculator({ products }: { products: Product[] }) {
  const { add } = useCart();
  const [w, setW] = useState(4);
  const [l, setL] = useState(5);
  const [waste, setWaste] = useState(10);
  const [pid, setPid] = useState(products[0]?.id);
  const p = products.find((x) => x.id === pid) ?? products[0];

  const r = useMemo(() => {
    const area = Math.max(0, w) * Math.max(0, l);
    const need = area * (1 + waste / 100);
    const boxes = p ? Math.ceil(need / p.coverage_per_box) : 0;
    const sqm = p ? Math.round(boxes * p.coverage_per_box * 100) / 100 : 0;
    return { area, need, boxes, sqm, cost: p ? Math.ceil(sqm) * p.price : 0 };
  }, [w, l, waste, p]);

  if (!p) return null;
  return (
    <section id="calculator" className="container-x pt-28 md:pt-40" aria-label="Tile calculator">
      <div className="overflow-hidden rounded-[44px] bg-steel-50 p-6 md:p-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <Reveal>
            <p className="eyebrow">Tile calculator</p>
            <h2 className="t-1 mt-3">Measure once.<br />Order with confidence.</h2>
            <p className="lead mt-5 max-w-md">Enter your room size and we will work out the area, the allowance for cuts and how many boxes to order.</p>
            <div className="mt-8 grid max-w-md grid-cols-2 gap-4">
              <div><label className="label" htmlFor="calc-w">Width (m)</label><input id="calc-w" className="field bg-white" type="number" min="0" step="0.1" value={w} onChange={(e) => setW(+e.target.value)} /></div>
              <div><label className="label" htmlFor="calc-l">Length (m)</label><input id="calc-l" className="field bg-white" type="number" min="0" step="0.1" value={l} onChange={(e) => setL(+e.target.value)} /></div>
              <div className="col-span-2"><label className="label" htmlFor="calc-p">Tile</label>
                <select id="calc-p" className="field bg-white" value={pid} onChange={(e) => setPid(e.target.value)}>{products.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.size}</option>)}</select></div>
              <div className="col-span-2">
                <label className="label" htmlFor="calc-waste">Allowance for cuts &amp; breakage: <b className="text-brand-600">{waste}%</b></label>
                <input id="calc-waste" type="range" min="0" max="20" value={waste} onChange={(e) => setWaste(+e.target.value)} className="w-full accent-[var(--color-brand-600)]" />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-[32px] bg-white p-6 shadow-soft md:p-8">
              <div className="flex items-center gap-4">
                <Thumb pattern={p.pattern_key} base={p.color_hex} accent={p.accent_hex} imageUrl={p.image_url} seed={p.slug} alt={p.name} className="size-20 shrink-0" sizes="80px" />
                <div><p className="font-semibold tracking-tight">{p.name}</p><p className="text-sm text-steel-500">{p.size} · {p.coverage_per_box} m² per box</p></div>
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-3">
                {[["Room area", `${r.area.toFixed(1)} m²`], ["With allowance", `${r.need.toFixed(1)} m²`], ["Boxes to order", String(r.boxes)], ["You will receive", `${r.sqm} m²`]].map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-steel-50 p-4"><dt className="text-xs font-medium text-steel-500">{k}</dt>
                    <motion.dd key={v} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-2xl font-bold tracking-[-0.03em] tabular-nums">{v}</motion.dd></div>
                ))}
              </dl>
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-brand-50 px-5 py-4">
                <span className="text-sm font-medium text-brand-800">Estimated total</span>
                <motion.span key={r.cost} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-2xl font-bold tracking-[-0.03em] text-brand-700 tabular-nums">{money(r.cost)}</motion.span>
              </div>
              <Button className="mt-5 w-full" size="lg" disabled={r.boxes === 0 || p.stock <= 0} onClick={() => { if (!HOME_ONLY) add(p, Math.min(p.stock, Math.ceil(r.sqm))); }}>Add {Math.ceil(r.sqm)} {p.unit} to bag</Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
