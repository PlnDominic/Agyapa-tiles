import Link from "next/link";
import { Suspense } from "react";
import clsx from "clsx";
import { adminListProducts, getCategories } from "@/lib/store";
import { PageHeader } from "@/components/admin/ui";
import { ProductFilters } from "@/components/admin/ProductFilters";
import { Thumb } from "@/components/shop/Thumb";
import { btn } from "@/components/ui/Button";
import { money } from "@/lib/format";

export const metadata = { title: "Products" };
const PAGE = 40;
const stockTabs = [["", "All"], ["out", "Sold out"], ["low", "Low stock"], ["hidden", "Hidden"]] as const;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; stock?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const stock = (["out", "low", "hidden"] as const).find((s) => s === sp.stock);
  const [{ items: products, total }, categories] = await Promise.all([
    adminListProducts({ q: sp.q, category: sp.category, stock, page, pageSize: PAGE }), getCategories(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const href = (patch: Record<string, string | undefined>) => {
    const u = new URLSearchParams(Object.entries({ q: sp.q, category: sp.category, stock: sp.stock, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/admin/products${u.toString() ? `?${u}` : ""}`;
  };
  const stockBadge = (p: (typeof products)[number]) => p.stock === 0 ? "bg-brand-100 text-brand-800" : p.stock <= 10 ? "bg-amber-100 text-amber-800" : "bg-white text-steel-700";

  return (
    <>
      <PageHeader title="Products" sub={`${total.toLocaleString("en-GB")} ${stock ? "matching" : "in catalogue"}`}
        action={<div className="flex gap-2"><Link href="/admin/products/photos" className={btn("secondary", "md")}>Upload photos</Link><Link href="/admin/products/new" className={btn("primary", "md")}>Add product</Link></div>} />

      <Suspense fallback={<div className="mb-4 h-[3.25rem]" />}><ProductFilters categories={categories} /></Suspense>
      <div className="hide-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {stockTabs.map(([v, l]) => (<Link key={v} href={href({ stock: v || undefined, page: undefined })} className={clsx("shrink-0 rounded-full px-4 py-2 text-sm font-medium", (sp.stock ?? "") === v ? "bg-steel-900 text-white" : "bg-steel-50 text-steel-700 hover:bg-steel-100")}>{l}</Link>))}
      </div>

      <div className="hidden overflow-x-auto rounded-[28px] bg-steel-50 md:block">
        <table className="w-full min-w-[720px] text-sm">
          <thead><tr className="text-left text-xs uppercase tracking-wider text-steel-500"><th className="px-6 py-4 font-semibold">Product</th><th className="font-semibold">Category</th><th className="font-semibold">Price</th><th className="font-semibold">Stock</th><th className="font-semibold">Status</th><th /></tr></thead>
          <tbody className="divide-y divide-steel-200">
            {products.length === 0 && <tr><td colSpan={6} className="px-6 py-16 text-center text-steel-500">No products found.</td></tr>}
            {products.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-white">
                <td className="px-6 py-3"><div className="flex items-center gap-3"><Thumb pattern={p.pattern_key} base={p.color_hex} accent={p.accent_hex} imageUrl={p.image_url} seed={p.slug} alt="" className="size-12 shrink-0" sizes="48px" /><div><Link href={`/admin/products/${p.id}`} className="font-semibold hover:text-brand-600">{p.name}</Link><p className="text-xs text-steel-500">{p.sku}</p></div></div></td>
                <td className="text-steel-600">{p.category?.name ?? "—"}</td>
                <td className="tabular-nums">{money(p.price)} <span className="text-xs text-steel-400">/ {p.unit}</span></td>
                <td><span className={`rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${stockBadge(p)}`}>{p.stock}</span></td>
                <td><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.active ? "bg-green-100 text-green-800" : "bg-steel-200 text-steel-700"}`}>{p.active ? "Live" : "Hidden"}</span>{p.featured && <span className="ml-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">Featured</span>}</td>
                <td className="px-6 text-right"><Link href={`/admin/products/${p.id}`} className="font-medium text-brand-600 hover:underline">Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {products.length === 0 && <li className="rounded-3xl bg-steel-50 py-14 text-center text-steel-500">No products found.</li>}
        {products.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/products/${p.id}`} className="flex items-center gap-4 rounded-3xl bg-steel-50 p-3 transition active:scale-[0.985]">
              <Thumb pattern={p.pattern_key} base={p.color_hex} accent={p.accent_hex} imageUrl={p.image_url} seed={p.slug} alt="" className="size-16 shrink-0" sizes="64px" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold tracking-tight">{p.name}</p>
                <p className="text-sm text-steel-600 tabular-nums">{money(p.price)} <span className="text-steel-400">/ {p.unit}</span></p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${stockBadge(p)}`}>{p.stock === 0 ? "Sold out" : `${p.stock} in stock`}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.active ? "bg-green-100 text-green-800" : "bg-steel-200 text-steel-700"}`}>{p.active ? "Live" : "Hidden"}</span>
                  {p.featured && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">Featured</span>}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-3">
          {page > 1 ? <Link href={href({ page: String(page - 1) })} className={btn("secondary", "sm")}>← Previous</Link> : <span />}
          <span className="text-sm text-steel-500">Page {page} of {pages}</span>
          {page < pages ? <Link href={href({ page: String(page + 1) })} className={btn("secondary", "sm")}>Next →</Link> : <span />}
        </nav>
      )}
    </>
  );
}
