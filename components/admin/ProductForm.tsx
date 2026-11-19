"use client";

import { startTransition, useActionState, useState } from "react";
import { saveProductAction, deleteProductAction, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { TileArt } from "@/components/ui/TileArt";
import { createClient } from "@/lib/supabase/client";
import { PATTERNS, type Category, type Product } from "@/lib/types";

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveProductAction, {});
  const [pattern, setPattern] = useState(product?.pattern_key ?? "marble");
  const [base, setBase] = useState(product?.color_hex ?? "#e9e7e4");
  const [accent, setAccent] = useState(product?.accent_hex ?? "#9a9a9f");
  const [image, setImage] = useState(product?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [upErr, setUpErr] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true); setUpErr(null);
    try {
      const sb = createClient();
      const path = `${Date.now()}-${file.name.replace(/[^a-z0-9.]+/gi, "-")}`;
      const { error } = await sb.storage.from("product-images").upload(path, file, { cacheControl: "31536000", upsert: false });
      if (error) throw error;
      setImage(sb.storage.from("product-images").getPublicUrl(path).data.publicUrl);
    } catch (e) { setUpErr(e instanceof Error ? e.message : "Upload failed"); }
    setUploading(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }} className="space-y-4">
        <input type="hidden" name="id" value={product?.id ?? ""} />
        <section className="space-y-4 rounded-[28px] bg-steel-50 p-6">
          <h2 className="font-semibold tracking-tight">Details</h2>
          <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" required defaultValue={product?.name} className="field bg-white" /></div>
          <div><label className="label" htmlFor="slug">URL slug <span className="font-normal text-steel-400">(auto from name if empty)</span></label><input id="slug" name="slug" defaultValue={product?.slug} className="field bg-white" /></div>
          <div><label className="label" htmlFor="description">Description</label><textarea id="description" name="description" rows={4} defaultValue={product?.description} className="field resize-none bg-white" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="category_id">Category</label><select id="category_id" name="category_id" defaultValue={product?.category_id ?? ""} className="field bg-white"><option value="">None</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="label" htmlFor="sku">SKU</label><input id="sku" name="sku" defaultValue={product?.sku ?? ""} className="field bg-white" /></div>
          </div>
        </section>

        <section className="space-y-4 rounded-[28px] bg-steel-50 p-6">
          <h2 className="font-semibold tracking-tight">Pricing &amp; stock</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div><label className="label" htmlFor="price">Price (GH₵)</label><input id="price" name="price" type="number" step="0.01" min="0" required defaultValue={product?.price} className="field bg-white" /></div>
            <div><label className="label" htmlFor="compare_at_price">Was price</label><input id="compare_at_price" name="compare_at_price" type="number" step="0.01" min="0" defaultValue={product?.compare_at_price ?? ""} className="field bg-white" /></div>
            <div><label className="label" htmlFor="stock">Stock</label><input id="stock" name="stock" type="number" min="0" required defaultValue={product?.stock ?? 0} className="field bg-white" /></div>
            <div><label className="label" htmlFor="unit">Unit</label><input id="unit" name="unit" required defaultValue={product?.unit ?? "sqm"} className="field bg-white" /></div>
          </div>
        </section>

        <section className="space-y-4 rounded-[28px] bg-steel-50 p-6">
          <h2 className="font-semibold tracking-tight">Specifications</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="size">Size</label><input id="size" name="size" placeholder="60 × 120 cm" defaultValue={product?.size ?? ""} className="field bg-white" /></div>
            <div><label className="label" htmlFor="finish">Finish</label><input id="finish" name="finish" placeholder="Polished" defaultValue={product?.finish ?? ""} className="field bg-white" /></div>
            <div><label className="label" htmlFor="material">Material</label><input id="material" name="material" placeholder="Porcelain" defaultValue={product?.material ?? ""} className="field bg-white" /></div>
            <div><label className="label" htmlFor="coverage_per_box">Coverage per box (m²)</label><input id="coverage_per_box" name="coverage_per_box" type="number" step="0.01" min="0.01" required defaultValue={product?.coverage_per_box ?? 1.44} className="field bg-white" /></div>
          </div>
        </section>

        <section className="space-y-4 rounded-[28px] bg-steel-50 p-6">
          <h2 className="font-semibold tracking-tight">Visual</h2>
          <p className="text-sm text-steel-500">Upload a photo, or leave empty to use the generated tile surface.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className="label" htmlFor="pattern_key">Pattern</label><select id="pattern_key" name="pattern_key" value={pattern} onChange={(e) => setPattern(e.target.value as typeof pattern)} className="field bg-white">{PATTERNS.map((p) => <option key={p}>{p}</option>)}</select></div>
            <div><label className="label" htmlFor="color_hex">Base colour</label><input id="color_hex" name="color_hex" type="color" value={base} onChange={(e) => setBase(e.target.value)} className="h-[3.25rem] w-full cursor-pointer rounded-2xl bg-white p-1.5" /></div>
            <div><label className="label" htmlFor="accent_hex">Accent colour</label><input id="accent_hex" name="accent_hex" type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-[3.25rem] w-full cursor-pointer rounded-2xl bg-white p-1.5" /></div>
          </div>
          <div><label className="label" htmlFor="image_url">Photo URL</label><input id="image_url" name="image_url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" className="field bg-white" /></div>
          {configured && (<div><label className="label" htmlFor="file">Or upload a photo</label><input id="file" type="file" accept="image/*" disabled={uploading} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-steel-900 file:px-5 file:py-2.5 file:text-sm file:font-medium file:text-white" />{uploading && <p className="mt-1 text-xs text-steel-500">Uploading…</p>}{upErr && <p className="mt-1 text-xs text-brand-700">{upErr}</p>}</div>)}
        </section>

        <section className="flex flex-wrap gap-6 rounded-[28px] bg-steel-50 p-6">
          <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="size-5 accent-[var(--color-brand-600)]" />Visible in store</label>
          <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} className="size-5 accent-[var(--color-brand-600)]" />Featured on homepage</label>
        </section>

        {state.error && <p role="alert" className="rounded-2xl bg-brand-50 px-5 py-4 text-sm font-medium text-brand-800">{state.error}</p>}
        <div className="flex gap-3"><Button type="submit" size="lg" disabled={pending}>{pending ? "Saving…" : product ? "Save changes" : "Create product"}</Button></div>
      </form>

      <aside className="space-y-4 lg:sticky lg:top-8 lg:h-fit">
        <div className="rounded-[28px] bg-steel-50 p-6">
          <h2 className="mb-4 font-semibold tracking-tight">Preview</h2>
          <div className="relative aspect-[4/5] overflow-hidden shadow-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {image ? <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <TileArt pattern={pattern} base={base} accent={accent} seed={product?.slug ?? "new"} className="absolute inset-0 h-full w-full" />}
          </div>
        </div>
        {product && (
          <form action={deleteProductAction} onSubmit={(e) => { if (!confirm(`Delete “${product.name}”? Past orders keep their line items.`)) e.preventDefault(); }}>
            <input type="hidden" name="id" value={product.id} />
            <button className="w-full rounded-full border border-brand-200 py-3 text-sm font-medium text-brand-700 transition hover:bg-brand-50">Delete product</button>
          </form>
        )}
      </aside>
    </div>
  );
}
