"use client";

import { startTransition, useActionState } from "react";
import { deleteCategoryAction, saveCategoryAction, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { PATTERNS, type Category } from "@/lib/types";

export function CategoryForm({ category, productCount = 0 }: { category?: Category; productCount?: number }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveCategoryAction, {});
  return (
    <div className="max-w-2xl space-y-4">
      <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }} className="space-y-4 rounded-[28px] bg-steel-50 p-6">
        <input type="hidden" name="id" value={category?.id ?? ""} />
        <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" required defaultValue={category?.name} className="field bg-white" /></div>
        <div><label className="label" htmlFor="slug">URL slug <span className="font-normal text-steel-400">(auto from name if empty)</span></label><input id="slug" name="slug" defaultValue={category?.slug} className="field bg-white" /></div>
        <div><label className="label" htmlFor="description">Short description</label><textarea id="description" name="description" rows={2} maxLength={300} defaultValue={category?.description ?? ""} className="field resize-none bg-white" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="pattern_key">Default pattern</label><select id="pattern_key" name="pattern_key" defaultValue={category?.pattern_key ?? "marble"} className="field bg-white">{PATTERNS.map((p) => <option key={p}>{p}</option>)}</select></div>
          <div><label className="label" htmlFor="sort_order">Display order</label><input id="sort_order" name="sort_order" type="number" min="0" required defaultValue={category?.sort_order ?? 0} className="field bg-white" /></div>
        </div>
        {state.error && <p role="alert" className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800">{state.error}</p>}
        <Button type="submit" size="lg" disabled={pending}>{pending ? "Saving…" : category ? "Save changes" : "Create category"}</Button>
      </form>
      {category && (
        <form action={deleteCategoryAction} onSubmit={(e) => { if (!confirm(`Delete “${category.name}”? Its ${productCount} product(s) will become uncategorised but stay in the shop.`)) e.preventDefault(); }}>
          <input type="hidden" name="id" value={category.id} />
          <button className="rounded-full border border-brand-200 px-6 py-3 text-sm font-medium text-brand-700 transition hover:bg-brand-50">Delete category</button>
        </form>
      )}
    </div>
  );
}
