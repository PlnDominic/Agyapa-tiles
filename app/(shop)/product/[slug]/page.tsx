import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getRelated } from "@/lib/store";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductBuy } from "@/components/shop/ProductBuy";
import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal } from "@/components/ui/motion";
import { money } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  return p ? { title: p.name, description: p.description } : {};
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const related = await getRelated(p);
  const specs = [["Size", p.size], ["Finish", p.finish], ["Material", p.material], [p.unit === "carton" ? "Approx. coverage per carton" : "Coverage per box", p.coverage_per_box > 0 ? `≈ ${p.coverage_per_box} m²` : null], ["Sold per", p.unit], ["Product code", p.sku], ["Availability", p.stock > 0 ? (p.stock <= 10 ? `Low stock (${p.stock} left)` : "In stock") : "Sold out"]].filter(([, v]) => v);
  const off = p.compare_at_price && p.compare_at_price > p.price;

  return (
    <div className="container-x pb-10 pt-8 md:pt-12">
      <nav aria-label="Breadcrumb" className="text-sm text-steel-500">
        <Link href="/shop" className="hover:text-brand-600">Shop</Link> <span aria-hidden>/</span>{" "}
        {p.category && <><Link href={`/shop?category=${p.category.slug}`} className="hover:text-brand-600">{p.category.name}</Link> <span aria-hidden>/</span> </>}
        <span className="text-steel-800">{p.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <Reveal y={20}><ProductGallery product={p} /></Reveal>
        <div className="lg:sticky lg:top-[100px] lg:self-start">
          <Reveal y={20} delay={0.08}>
            <p className="eyebrow">{p.category?.name ?? "Tiles"}</p>
            <h1 className="t-1 mt-3">{p.name}</h1>
            <p className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-bold tracking-[-0.04em]">{money(p.price)}</span>
              <span className="text-steel-500">per {p.unit}</span>
              {off && <span className="text-lg text-steel-400 line-through">{money(p.compare_at_price!)}</span>}
            </p>
            <p className="lead mt-6 text-[1.0625rem]">{p.description}</p>
            <div className="mt-8 rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5"><ProductBuy product={p} /></div>
          </Reveal>
        </div>
      </div>

      <Reveal className="mt-20 grid gap-10 md:grid-cols-[1fr_2fr]">
        <h2 className="t-2">Specifications</h2>
        <dl className="divide-y divide-steel-100 border-y border-steel-100">
          {specs.map(([k, v]) => (<div key={k as string} className="flex justify-between gap-6 py-4 text-[0.9375rem]"><dt className="text-steel-500">{k}</dt><dd className="text-right font-medium">{v}</dd></div>))}
        </dl>
      </Reveal>

      <section className="mt-28" aria-label="You may also like">
        <Reveal><h2 className="t-2">You may also like</h2></Reveal>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {related.map((r, i) => <ProductCard key={r.id} product={r} index={i} />)}
        </div>
      </section>
    </div>
  );
}
