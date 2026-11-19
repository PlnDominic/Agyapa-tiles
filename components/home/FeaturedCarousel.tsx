"use client";

import Link from "next/link";
import { useRef } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import { ArrowRight, ChevronRight } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/motion";
import type { Product } from "@/lib/types";

export function FeaturedCarousel({ products }: { products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  return (
    <section className="pt-28 md:pt-40" aria-label="Featured tiles">
      <div className="container-x flex items-end justify-between gap-6">
        <Reveal>
          <p className="eyebrow">Featured</p>
          <h2 className="t-1 mt-3">Hand-picked<br className="hidden sm:block" /> favourites.</h2>
        </Reveal>
        <div className="hidden items-center gap-2 md:flex">
          <button onClick={() => scroll(-1)} aria-label="Previous" className="grid size-12 place-items-center rounded-full bg-steel-100 transition hover:bg-steel-200"><ChevronRight className="rotate-180" /></button>
          <button onClick={() => scroll(1)} aria-label="Next" className="grid size-12 place-items-center rounded-full bg-steel-900 text-white transition hover:bg-steel-800"><ChevronRight /></button>
        </div>
      </div>
      {/* Mobile: slow right-to-left drift (pauses on touch / hover). */}
      <div className="mt-10 overflow-hidden md:hidden motion-reduce:overflow-x-auto">
        <div className="flex w-max animate-slide-left active:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex gap-5 pr-5" aria-hidden={copy === 1}>
              {products.map((p, i) => (
                <div key={p.id} className="w-[72vw] shrink-0"><ProductCard product={p} index={i} /></div>
              ))}
            </div>
          ))}
        </div>
        <div className="container-x mt-6"><Link href="/shop" className="inline-flex items-center gap-2 font-medium text-brand-600">View all tiles <ArrowRight width={18} height={18} /></Link></div>
      </div>
      <div ref={ref} className="hide-scrollbar mt-12 hidden snap-x md:flex snap-mandatory gap-5 overflow-x-auto scroll-smooth px-[max(20px,calc((100vw_-_1240px)/2_+_40px))] pb-6">
        {products.map((p, i) => (
          <div key={p.id} className="w-[72vw] shrink-0 snap-start sm:w-[300px]"><ProductCard product={p} index={i} /></div>
        ))}
        <Link href="/shop" className="group grid w-[72vw] shrink-0 snap-start place-items-center rounded-[28px] bg-steel-50 p-8 text-center transition hover:bg-brand-50 sm:w-[300px]">
          <span>
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-600 text-white shadow-red transition-transform duration-500 group-hover:translate-x-1"><ArrowRight /></span>
            <span className="mt-5 block text-xl font-semibold tracking-tight">View all tiles</span>
          </span>
        </Link>
      </div>
    </section>
  );
}
