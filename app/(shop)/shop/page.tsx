import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/store";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopToolbar } from "@/components/shop/ShopToolbar";
import { Reveal } from "@/components/ui/motion";
import { btn } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Shop tiles" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ category: sp.category, q: sp.q, sort: sp.sort, finish: sp.finish }),
  ]);
  const current = categories.find((c) => c.slug === sp.category);

  return (
    <div className="container-x pb-10 pt-14 md:pt-20">
      <Reveal className="max-w-3xl">
        <p className="eyebrow">{current ? "Collection" : "The collection"}</p>
        <h1 className="t-1 mt-3">{current ? current.name : "Shop all tiles."}</h1>
        <p className="lead mt-4">{current?.description ?? "Porcelain, marble-look, wood-look and outdoor tiles. Filter by look, finish and price."}</p>
      </Reveal>

      <div className="mt-10">
        <Suspense fallback={<div className="h-14" />}><ShopToolbar categories={categories} /></Suspense>
      </div>

      <p className="mt-6 text-sm text-steel-500" aria-live="polite">{products.length} {products.length === 1 ? "tile" : "tiles"}</p>

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
    </div>
  );
}
