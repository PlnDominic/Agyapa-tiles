"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { TileArt } from "@/components/ui/TileArt";
import { ButtonLink } from "@/components/ui/Button";
import { WordReveal } from "@/components/ui/motion";
import { ArrowRight } from "@/components/ui/icons";
import type { Product } from "@/lib/types";

export function Hero({ products }: { products: Product[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setMobile(mq.matches);
    on(); mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const rotateX = useTransform(p, [0, 0.6], [62, 0]);
  const scale = useTransform(p, [0, 0.6], [1.0, 1.15]);
  const planeY = useTransform(p, [0, 0.6], [mobile ? "80svh" : "66svh", "0svh"]);
  const textOpacity = useTransform(p, [0, 0.22], [1, 0]);
  const textY = useTransform(p, [0, 0.3], [0, -90]);
  const textScale = useTransform(p, [0, 0.3], [1, 0.94]);
  const cardOpacity = useTransform(p, [0.58, 0.74], [0, 1]);
  const cardY = useTransform(p, [0.58, 0.74], [40, 0]);
  const cardScale = useTransform(p, [0.58, 0.74], [0.94, 1]);
  const fade = useTransform(p, [0, 0.32], [1, 0]);

  const tiles = Array.from({ length: 24 }, (_, i) => products[(i * 5 + (i >> 2)) % products.length]);

  return (
    <section ref={ref} className="relative h-[260vh]" aria-label="Introduction">
      <div className="sticky top-[60px] h-[calc(100svh-60px)] overflow-hidden">
        {/* The floor */}
        <motion.div
          aria-hidden
          className="absolute left-1/2 top-0 w-[170vw] -translate-x-1/2 md:w-[125vw]"
          style={{ perspective: 1400, y: planeY }}
        >
          <motion.div style={{ rotateX, scale, transformOrigin: "50% 0%" }} className="grid grid-cols-4 gap-[6px] rounded-xl bg-steel-200 p-[6px] shadow-lift md:grid-cols-6">
            {tiles.map((t, i) => (
              <div key={i} className={`relative aspect-square overflow-hidden rounded-[4px] ${i >= 16 ? "max-md:hidden" : ""}`}>
                <TileArt pattern={t.pattern_key} base={t.color_hex} accent={t.accent_hex} seed={`${t.slug}-${i}`} className="absolute inset-0 h-full w-full" />
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* fade from white into the floor */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[75%] bg-gradient-to-b from-white via-white/95 to-transparent" style={{ opacity: fade }} />

        {/* Headline */}
        <motion.div style={{ opacity: textOpacity, y: textY, scale: textScale }} className="container-x relative z-10 flex flex-col items-center pt-[7vh] text-center md:pt-[9vh]">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="eyebrow mb-5">Agyapa Tiles</motion.p>
          <h1 className="t-display max-w-[16ch]">
            <WordReveal text="Floors that feel like home." gradientFrom={3} delay={0.15} />
          </h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.7 }} className="lead mt-6 max-w-[34rem]">
            Premium porcelain, marble-look and outdoor tiles. Delivered to your door and tracked every step of the way.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.85 }} className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/shop" size="lg">Shop the collection <ArrowRight width={18} height={18} /></ButtonLink>
            <ButtonLink href="/#calculator" size="lg" variant="secondary">Calculate your room</ButtonLink>
          </motion.div>
        </motion.div>

        {/* Reveal card once the floor is flat */}
        <motion.div style={{ opacity: cardOpacity, y: cardY, scale: cardScale }} className="absolute inset-0 z-10 grid place-items-center px-5">
          <div className="max-w-xl rounded-[36px] bg-white/90 p-8 text-center shadow-lift ring-1 ring-black/5 backdrop-blur-2xl md:p-12">
            <p className="eyebrow">Crafted for living</p>
            <p className="t-2 mt-3">Every surface, considered.</p>
            <p className="lead mt-4 text-[1.0625rem]">From the first sample to the last tile on your floor, we obsess over the details so you never have to.</p>
            <div className="mt-6 flex justify-center"><ButtonLink href="/shop" variant="dark">Explore all tiles</ButtonLink></div>
          </div>
        </motion.div>

        <motion.div aria-hidden style={{ opacity: textOpacity }} className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-medium text-steel-500 md:flex">
          Scroll
          <span className="relative block h-9 w-[22px] rounded-full border border-steel-300">
            <motion.span className="absolute left-1/2 top-1.5 size-1.5 -translate-x-1/2 rounded-full bg-brand-600" animate={{ y: [0, 14, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
          </span>
        </motion.div>
      </div>
    </section>
  );
}
