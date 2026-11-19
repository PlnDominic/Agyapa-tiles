"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { TileArt } from "@/components/ui/TileArt";
import { ArrowRight } from "@/components/ui/icons";

export function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.92, 1]);
  const radius = useTransform(scrollYProgress, [0, 0.5], [64, 44]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  return (
    <section className="container-x pt-28 md:pt-40" aria-label="Get started">
      <motion.div ref={ref} style={{ scale, borderRadius: radius }} className="relative overflow-hidden bg-brand-600 px-6 py-24 text-center text-white md:py-36">
        <motion.div aria-hidden style={{ y: bgY }} className="absolute inset-[-10%] opacity-[0.13] mix-blend-luminosity">
          <TileArt pattern="geometric" base="#ffffff" accent="#ffffff" seed="cta" className="h-full w-full" />
        </motion.div>
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,rgb(255_255_255/0.18),transparent)]" />
        <div className="relative">
          <h2 className="t-1 mx-auto max-w-[18ch]">Ready to transform your space?</h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-white/80">Browse the collection, order online and watch it arrive.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/shop" variant="light" size="lg">Shop tiles <ArrowRight width={18} height={18} /></ButtonLink>
            <ButtonLink href="/track" size="lg" className="bg-white/15 text-white shadow-none hover:bg-white/25">Track an order</ButtonLink>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
