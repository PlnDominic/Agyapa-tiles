import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { PAGE_SIZE, getProductsPage, getSizes, getStoreCategories } from "@/lib/store";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopToolbar } from "@/components/shop/ShopToolbar";
import { Reveal } from "@/components/ui/motion";
import { btn } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Shop tiles" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const [categories, sizes, { items: products, total }] = await Promise.all([
    getStoreCategories(),
    getSizes(),
    getProductsPage({ category: sp.category, q: sp.q, sort: sp.sort, finish: sp.finish, size: sp.size }, page),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (n: number) => {
    const u = new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && k !== "page" && k !== "focus") as [string, string][]);
    if (n > 1) u.set("page", String(n));
    return `/shop${u.toString() ? `?${u}` : ""}`;
  };
  const windowPages = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 2);
  const current = categories.find((c) => c.slug === sp.category);

  return (
    <div className="container-x pb-10 pt-14 md:pt-20">
      <Reveal className="max-w-3xl">
        <p className="eyebrow">{current ? "Collection" : "The catalogue"}</p>
        <h1 className="t-1 mt-3">{current ? current.name : "Shop all products."}</h1>
        <p className="lead mt-4">{current?.description ?? "Floor and wall tiles, bathroom ware, doors, taps and building supplies. Search by name, code or size."}</p>
      </Reveal>

      <div className="mt-10">
        <Suspense fallback={<div className="h-14" />}><ShopToolbar categories={categories} sizes={sizes} /></Suspense>
      </div>

      <p className="mt-6 text-sm text-steel-500" aria-live="polite">{total.toLocaleString("en-GB")} {total === 1 ? "product" : "products"}{pages > 1 && <> · page {page} of {pages}</>}</p>

      {products.length === 0 ? (
        <div className="mt-10 rounded-[32px] bg-steel-50 py-24 text-center">
          <p className="t-3">Nothing matches that search.</p>
          <p className="mt-2 text-steel-500">Try a different keyword or clear your filters.</p>
          <Link href="/shop" className={btn("primary", "md", "mt-6")}>Clear filters</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
          {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-14 flex flex-wrap items-center justify-center gap-2">
          {page > 1 && <Link href={href(page - 1)} className={btn("secondary", "sm")}>← Previous</Link>}
          {windowPages.map((n, i) => (
            <span key={n} className="flex items-center gap-2">
              {i > 0 && n - windowPages[i - 1] > 1 && <span className="text-steel-400">…</span>}
              <Link href={href(n)} aria-current={n === page ? "page" : undefined} className={n === page ? btn("dark", "sm", "min-w-9 px-3") : btn("secondary", "sm", "min-w-9 px-3")}>{n}</Link>
            </span>
          ))}
          {page < pages && <Link href={href(page + 1)} className={btn("secondary", "sm")}>Next →</Link>}
        </nav>
      )}
    </div>
  );
}
