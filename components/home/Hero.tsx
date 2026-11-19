"use client";

import Image from "next/image";
import Link from "next/link";
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
  const bgY = useTransform(p, [0, 1], ["0%", "14%"]);
  const bgScale = useTransform(p, [0, 1], [1.02, 1.14]);
  const contentY = useTransform(p, [0, 0.7], [0, -70]);
  const contentOpacity = useTransform(p, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative -mt-[60px] h-[100svh] min-h-[620px] overflow-hidden bg-[#111114] text-white" aria-label="Introduction">
      {/* Background */}
      <motion.div aria-hidden className="absolute inset-[-2%]" style={{ y: bgY, scale: bgScale }}>
        <TileArt pattern="marble" base="#17171a" accent="#d9d9dc" seed="hero" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-cover bg-[position:75%_center] md:bg-center" style={{ backgroundImage: `url(${HERO_BACKGROUND})` }} />
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 mx-auto flex h-full w-full max-w-[1500px] px-[clamp(20px,6vw,150px)] [&]:flex-col justify-center pt-[60px]">
        {/* Logo lockup */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }} className="flex items-center gap-4 sm:gap-6">
          <Image src="/brand/logo-mark.png" alt="" width={110} height={100} priority className="h-14 w-auto sm:h-[4.5rem]" />
          <span aria-hidden className="h-14 w-px bg-white/40 sm:h-[4.5rem]" />
          <span className="leading-none">
            <span className="block text-[clamp(1.5rem,3.2vw,2.5rem)] tracking-[-0.035em]"><b className="font-extrabold">AGYAPA</b> <span className="font-light">TILES</span></span>
            <span className="mt-2 block text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/70 sm:text-xs">We serve our customers best</span>
          </span>
        </motion.div>

        {/* Headline */}
        <h1 className="mt-10 max-w-[14ch] text-[clamp(2.9rem,7.4vw,6.25rem)] font-bold leading-[1.02] tracking-[-0.045em] sm:mt-14">
          {[["Premium Tiles"], ["for ", "Every Space"]].map((line, i) => (
            <span key={i} className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
              <motion.span className="block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.2 + i * 0.12, ease }}>
                {line[0]}{line[1] && <span className="text-[#e3171e]">{line[1]}</span>}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.6, ease }} className="mt-6 text-[clamp(1.125rem,2vw,1.625rem)] font-light leading-snug tracking-[-0.015em] text-white/85">
          Quality tiles. Elegant designs.<br />Lasting value.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.75, ease }} className="mt-9">
          <Link href="/shop" className="inline-flex h-14 items-center gap-3 rounded-full bg-[#e3171e] px-8 text-[1.0625rem] font-semibold tracking-[-0.01em] text-white shadow-[0_12px_36px_-8px_rgb(227_23_30/0.7)] transition-all duration-300 ease-[var(--ease-apple)] hover:bg-[#c9121a] active:scale-[0.97]">
            Explore Our Tiles <ArrowRight width={20} height={20} />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
