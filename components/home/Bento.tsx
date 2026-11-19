"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { TileArt } from "@/components/ui/TileArt";
import { ArrowUpRight } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/motion";
import type { Category, Product } from "@/lib/types";
import clsx from "clsx";

const spans = [
  "md:col-span-7 md:row-span-2 min-h-[22rem] md:min-h-[34rem]",
  "md:col-span-5 min-h-[16rem]",
  "md:col-span-5 min-h-[16rem]",
  "md:col-span-4 min-h-[16rem]",
  "md:col-span-4 min-h-[16rem]",
  "md:col-span-4 min-h-[16rem]",
];

export function Bento({ categories, products }: { categories: Category[]; products: Product[] }) {
  return (
    <section className="container-x pt-28 md:pt-40" aria-label="Collections">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Collections</p>
        <h2 className="t-1 mt-3">Six ways to <span className="text-gradient-red">transform</span> a room.</h2>
      </Reveal>
      <div className="mt-14 grid gap-4 md:grid-cols-12">
        {categories.slice(0, 6).map((c, i) => {
          const sample = products.find((p) => p.category?.slug === c.slug) ?? products[i % products.length];
          return (
            <Reveal key={c.id} delay={(i % 3) * 0.08} className={clsx("group relative", spans[i])}>
              <Link href={`/shop?category=${c.slug}`} className="absolute inset-0 block overflow-hidden rounded-[32px] shadow-soft transition-shadow duration-500 hover:shadow-lift">
                <motion.div className="absolute inset-0" whileHover={{ scale: 1.06 }} transition={{ duration: 1.1, ease: [0.28, 0.11, 0.32, 1] }}>
                  <TileArt pattern={sample.pattern_key} base={sample.color_hex} accent={sample.accent_hex} seed={c.slug} className="h-full w-full" />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white md:p-8">
                  <div>
                    <h3 className={clsx("font-bold tracking-[-0.035em]", i === 0 ? "text-3xl md:text-5xl" : "text-2xl")}>{c.name}</h3>
                    <p className="mt-1.5 max-w-[26ch] text-sm text-white/85">{c.description}</p>
                  </div>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-steel-900 shadow-soft transition-all duration-500 group-hover:rotate-45 group-hover:bg-brand-600 group-hover:text-white"><ArrowUpRight /></span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
