import Link from "next/link";
import { adminListProducts } from "@/lib/store";
import { PageHeader } from "@/components/admin/ui";
import { Thumb } from "@/components/shop/Thumb";
import { btn } from "@/components/ui/Button";
import { money } from "@/lib/format";

export const metadata = { title: "Products" };

export default async function ProductsPage() {
  const products = await adminListProducts();
  return (
    <>
      <PageHeader title="Products" sub={`${products.length} in catalogue`} action={<Link href="/admin/products/new" className={btn("primary", "md")}>Add product</Link>} />
      <div className="hidden overflow-x-auto rounded-[28px] bg-steel-50 md:block">
        <table className="w-full min-w-[720px] text-sm">
          <thead><tr className="text-left text-xs uppercase tracking-wider text-steel-500"><th className="px-6 py-4 font-semibold">Product</th><th className="font-semibold">Category</th><th className="font-semibold">Price</th><th className="font-semibold">Stock</th><th className="font-semibold">Status</th><th /></tr></thead>
          <tbody className="divide-y divide-steel-200">
            {products.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-white">
                <td className="px-6 py-3"><div className="flex items-center gap-3"><Thumb pattern={p.pattern_key} base={p.color_hex} accent={p.accent_hex} imageUrl={p.image_url} seed={p.slug} alt="" className="size-12 shrink-0" sizes="48px" /><div><Link href={`/admin/products/${p.id}`} className="font-semibold hover:text-brand-600">{p.name}</Link><p className="text-xs text-steel-500">{p.sku}</p></div></div></td>
                <td className="text-steel-600">{p.category?.name ?? "—"}</td>
                <td className="tabular-nums">{money(p.price)}</td>
                <td><span className={`rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${p.stock === 0 ? "bg-brand-100 text-brand-800" : p.stock <= 100 ? "bg-amber-100 text-amber-800" : "bg-white text-steel-700"}`}>{p.stock} {p.unit}</span></td>
                <td><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.active ? "bg-green-100 text-green-800" : "bg-steel-200 text-steel-700"}`}>{p.active ? "Live" : "Hidden"}</span>{p.featured && <span className="ml-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">Featured</span>}</td>
                <td className="px-6 text-right"><Link href={`/admin/products/${p.id}`} className="font-medium text-brand-600 hover:underline">Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {products.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/products/${p.id}`} className="flex items-center gap-4 rounded-3xl bg-steel-50 p-3 transition active:scale-[0.985]">
              <Thumb pattern={p.pattern_key} base={p.color_hex} accent={p.accent_hex} imageUrl={p.image_url} seed={p.slug} alt="" className="size-16 shrink-0" sizes="64px" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold tracking-tight">{p.name}</p>
                <p className="text-sm text-steel-600 tabular-nums">{money(p.price)} <span className="text-steel-400">/ {p.unit}</span></p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${p.stock === 0 ? "bg-brand-100 text-brand-800" : p.stock <= 100 ? "bg-amber-100 text-amber-800" : "bg-white text-steel-700"}`}>{p.stock} {p.unit}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.active ? "bg-green-100 text-green-800" : "bg-steel-200 text-steel-700"}`}>{p.active ? "Live" : "Hidden"}</span>
                  {p.featured && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">Featured</span>}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
