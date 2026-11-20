"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Category } from "@/lib/types";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";

/** Live product search: results refresh as you type (debounced), no button needed. */
export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(sp.get("q") ?? "");

  const push = (patch: Record<string, string>) => {
    const next = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    next.delete("page");
    start(() => router.replace(`/admin/products${next.toString() ? `?${next}` : ""}`, { scroll: false }));
  };

  useEffect(() => {
    const t = setTimeout(() => { if (q.trim() !== (sp.get("q") ?? "")) push({ q: q.trim() }); }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <form role="search" onSubmit={(e) => e.preventDefault()} className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto]">
      <label className="relative min-w-0">
        <span className="sr-only">Search products</span>
        <SearchIcon width={18} height={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-steel-400" />
        <input
          type="search" autoComplete="off" autoFocus={Boolean(sp.get("q"))} value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or product code" className="field !pl-11 !pr-11 [&::-webkit-search-cancel-button]:hidden"
        />
        <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center">
          {pending ? <span aria-label="Searching" className="size-4 animate-spin rounded-full border-2 border-steel-200 border-t-brand-600" />
            : q && <button type="button" aria-label="Clear search" onClick={() => setQ("")} className="grid size-7 place-items-center rounded-full text-steel-500 hover:bg-steel-200"><CloseIcon width={15} height={15} /></button>}
        </span>
      </label>
      <select aria-label="Category" value={sp.get("category") ?? ""} onChange={(e) => push({ category: e.target.value })} className="field sm:w-auto">
        <option value="">All categories</option>
        {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
      </select>
    </form>
  );
}
