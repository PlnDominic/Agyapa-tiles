import Link from "next/link";
import { adminListCategories } from "@/lib/store";
import { PageHeader } from "@/components/admin/ui";
import { btn } from "@/components/ui/Button";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await adminListCategories();
  return (
    <>
      <PageHeader title="Categories" sub="Collections shown on the shop and homepage." action={<Link href="/admin/categories/new" className={btn("primary", "md")}>Add category</Link>} />
      <div className="overflow-x-auto rounded-[28px] bg-steel-50">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs uppercase tracking-wider text-steel-500"><th className="hidden px-6 py-4 font-semibold sm:table-cell">Order</th><th className="font-semibold">Category</th><th className="font-semibold">Products</th><th /></tr></thead>
          <tbody className="divide-y divide-steel-200">
            {categories.length === 0 && <tr><td colSpan={4} className="px-6 py-16 text-center text-steel-500">No categories yet.</td></tr>}
            {categories.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-white">
                <td className="hidden px-6 py-4 tabular-nums text-steel-500 sm:table-cell">{c.sort_order}</td>
                <td className="px-4 py-4 sm:px-0"><Link href={`/admin/categories/${c.id}`} className="font-semibold hover:text-brand-600">{c.name}</Link><p className="text-xs text-steel-500">/{c.slug}</p></td>
                <td className="tabular-nums">{c.productCount}</td>
                <td className="px-6 text-right"><Link href={`/admin/categories/${c.id}`} className="font-medium text-brand-600 hover:underline">Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
