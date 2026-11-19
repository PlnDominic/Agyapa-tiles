"use client";

import Image from "next/image";
import { NavLink as Link } from "@/components/ui/NavLink";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { TileArt } from "@/components/ui/TileArt";
import { ArrowRight } from "@/components/ui/icons";
import { HERO_BACKGROUND } from "@/lib/config";

const ease = [0.28, 0.11, 0.32, 1] as const;

/**
 * Full-bleed hero. Drop your photo at public/brand/hero-bg.jpg (see lib/config.ts) and it appears
 * automatically; until then a dark generated marble is shown.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgScale = useTransform(p, [0, 1], [1, 1.12]);
  const contentY = useTransform(p, [0, 0.7], [0, -60]);
  const contentOpacity = useTransform(p, [0, 0.55], [1, 0]);

  return (
    <section ref={ref} className="relative -mt-[60px] h-[100svh] min-h-[620px] overflow-hidden bg-[#111114] text-white" aria-label="Introduction">
      {/* Background */}
      <motion.div aria-hidden className="absolute inset-0" style={{ scale: bgScale }}>
        <TileArt pattern="marble" base="#17171a" accent="#d9d9dc" seed="hero" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-cover bg-[position:75%_center] md:bg-center" style={{ backgroundImage: `url(${HERO_BACKGROUND})` }} />
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent max-md:from-black/55 max-md:via-black/30" />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 flex h-full flex-col justify-center px-[clamp(20px,9.1vw,260px)] pt-[60px] md:justify-start md:pt-[13svh]">
        {/* Logo lockup */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }} className="flex items-center gap-[clamp(14px,2.4vw,44px)]">
          <Image src="/brand/logo-mark.png" alt="" width={160} height={145} priority className="h-[clamp(3.5rem,7.6vw,8.5rem)] w-auto" />
          <span aria-hidden className="h-[clamp(3.5rem,7.6vw,8.5rem)] w-px bg-white/45" />
          <span className="leading-none">
            <span className="block text-[clamp(1.5rem,3vw,3.4rem)] tracking-[-0.035em]"><b className="font-extrabold">AGYAPA</b> <span className="font-light">TILES</span></span>
            <span className="mt-[0.9vw] block text-[clamp(0.58rem,0.98vw,1.1rem)] font-semibold uppercase tracking-[0.13em] text-white/75">We serve our customers best</span>
          </span>
        </motion.div>

        {/* Headline */}
        <h1 className="mt-[clamp(2.5rem,4.2vw,5rem)] text-[clamp(2.4rem,6.65vw,7.5rem)] font-bold leading-[0.95] tracking-[-0.04em]">
          {[["Premium Tiles"], ["for ", "Every Space"]].map((line, i) => (
            <span key={i} className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
              <motion.span className="block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.2 + i * 0.12, ease }}>
                {line[0]}{line[1] && <span className="text-[#e3171e]">{line[1]}</span>}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.6, ease }} className="mt-[clamp(1.25rem,1.9vw,2.5rem)] text-[clamp(1.125rem,2.3vw,2.75rem)] font-light leading-[1.08] tracking-[-0.02em] text-white/90">
          Quality tiles. Elegant designs.<br />Lasting value.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.75, ease }} className="mt-[clamp(1.75rem,3.1vw,3.75rem)]">
          <Link href="/shop" className="inline-flex h-[clamp(3.25rem,3.95vw,4.5rem)] items-center gap-[0.9vw] rounded-full bg-[#e3171e] px-[clamp(1.75rem,1.85vw,2.5rem)] text-[clamp(1rem,1.3vw,1.5rem)] font-semibold tracking-[-0.01em] text-white shadow-[0_12px_36px_-8px_rgb(227_23_30/0.6)] transition-all duration-300 ease-[var(--ease-apple)] hover:bg-[#c9121a] active:scale-[0.97]">
            Explore Our Tiles <ArrowRight className="size-[1.2em]" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
