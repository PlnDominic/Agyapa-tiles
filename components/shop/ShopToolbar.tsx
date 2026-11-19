"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import clsx from "clsx";
import type { Category } from "@/lib/types";
import { SearchIcon } from "@/components/ui/icons";

const sorts = [["featured", "Featured"], ["newest", "Newest"], ["price-asc", "Price: low to high"], ["price-desc", "Price: high to low"]];
const finishes = ["Polished", "Rustic", "Anti-slip"];

export function ShopToolbar({ categories, sizes }: { categories: Category[]; sizes: string[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const input = useRef<HTMLInputElement>(null);
  const category = sp.get("category") ?? "";
  const finish = sp.get("finish") ?? "";
  const size = sp.get("size") ?? "";

  useEffect(() => { if (sp.get("focus") === "search") input.current?.focus(); }, [sp]);

  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(sp.toString());
    next.delete("focus");
    next.delete("page");
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    start(() => router.replace(`/shop${next.toString() ? `?${next}` : ""}`, { scroll: false }));
  };

  useEffect(() => {
    const t = setTimeout(() => { if ((sp.get("q") ?? "") !== q.trim()) set({ q: q.trim() }); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const pill = (active: boolean) => clsx("shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300", active ? "bg-steel-900 text-white" : "bg-steel-50 text-steel-700 hover:bg-steel-100");

  return (
    <div className={clsx("sticky top-[60px] z-30 -mx-5 border-b border-steel-100 glass px-5 py-3 transition-opacity sm:mx-0 sm:rounded-[28px] sm:border sm:px-4", pending && "opacity-80")}>
      <div className="flex flex-col gap-3">
        <div className="hide-scrollbar flex gap-2 overflow-x-auto" role="tablist" aria-label="Categories">
          <button className={pill(!category)} onClick={() => set({ category: "" })}>All</button>
          {categories.map((c) => <button key={c.id} className={pill(category === c.slug)} onClick={() => set({ category: c.slug })}>{c.name}</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-0 basis-full sm:basis-0 sm:flex-1">
            <span className="sr-only">Search tiles</span>
            <SearchIcon width={16} height={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel-400" />
            <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, code or size (e.g. 60x60)" className="h-10 w-full rounded-full bg-steel-50 pl-10 pr-4 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-brand-600/30" />
          </label>
          {sizes.length > 0 && <select aria-label="Size" value={size} onChange={(e) => set({ size: e.target.value })} className="h-10 min-w-0 flex-1 rounded-full bg-steel-50 px-4 text-sm outline-none focus:ring-2 focus:ring-brand-600/30 sm:w-auto sm:flex-none">
            <option value="">All sizes</option>{sizes.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>}
          <select aria-label="Finish" value={finish} onChange={(e) => set({ finish: e.target.value })} className="h-10 min-w-0 flex-1 rounded-full bg-steel-50 px-4 text-sm outline-none focus:ring-2 focus:ring-brand-600/30 sm:w-auto sm:flex-none">
            <option value="">All finishes</option>{finishes.map((f) => <option key={f}>{f}</option>)}
          </select>
          <select aria-label="Sort" value={sp.get("sort") ?? "featured"} onChange={(e) => set({ sort: e.target.value === "featured" ? "" : e.target.value })} className="h-10 min-w-0 flex-1 rounded-full bg-steel-50 px-4 text-sm outline-none focus:ring-2 focus:ring-brand-600/30 sm:flex-none">
            {sorts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
