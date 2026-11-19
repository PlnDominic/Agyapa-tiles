"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import clsx from "clsx";
import { useCart } from "./CartProvider";
import { BagIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from "@/components/ui/icons";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=marble-look", label: "Marble" },
  { href: "/shop?category=wood-look", label: "Wood" },
  { href: "/shop?category=outdoor", label: "Outdoor" },
  { href: "/track", label: "Track order" },
];

export function Navbar({ user }: { user: { name: string | null; admin: boolean } | null }) {
  const pathname = usePathname();
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 12));
  // On the home page the nav floats over the dark hero (which carries its own logo lockup).
  const onHero = pathname === "/" && !scrolled && !menu;
  const icon = clsx("grid size-10 place-items-center rounded-full transition", onHero ? "text-white hover:bg-white/15" : "text-steel-800 hover:bg-steel-100");

  return (
    <>
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-[60] transition-[background,box-shadow] duration-500 ease-[var(--ease-apple)]",
          scrolled || menu ? "glass shadow-[0_1px_0_rgb(0_0_0/0.06)]" : "bg-transparent",
        )}
      >
        <div className="container-x flex h-[60px] items-center justify-between gap-6">
          <Link href="/" className={clsx("flex items-center gap-2.5 transition-opacity duration-300", onHero && "pointer-events-none opacity-0")} aria-label="Agyapa Tiles home" onClick={() => setMenu(false)}>
            <Image src="/brand/logo-mark.png" alt="" width={44} height={40} className="h-9 w-auto" priority />
            <span className="whitespace-nowrap text-[0.9375rem] tracking-[-0.03em] sm:text-[1.0625rem]"><b className="font-extrabold">AGYAPA</b> <span className="font-light">TILES</span></span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {links.map((l) => {
              const active = l.href === "/shop" ? pathname === "/shop" : pathname === l.href.split("?")[0] && l.href !== "/shop";
              return (
                <Link key={l.href} href={l.href} className={clsx("relative rounded-full px-4 py-2 text-[0.875rem] font-medium tracking-[-0.01em] transition-colors", onHero ? "text-white/80 hover:text-white" : active ? "text-steel-900" : "text-steel-600 hover:text-steel-900")}>
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <Link href="/shop?focus=search" aria-label="Search tiles" className={clsx(icon, "hidden sm:grid")}><SearchIcon /></Link>
            <Link href={user ? (user.admin ? "/admin" : "/account") : "/login"} aria-label={user ? "Account" : "Sign in"} className={icon}><UserIcon /></Link>
            <button onClick={() => setOpen(true)} aria-label={`Open bag, ${count} items`} className={clsx(icon, "relative")}>
              <BagIcon />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span key={count} initial={{ scale: 0.3 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold leading-[18px] text-white">
                    {count > 99 ? "99+" : count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button onClick={() => setMenu((v) => !v)} aria-label="Menu" aria-expanded={menu} className={clsx(icon, "lg:hidden")}>
              {menu ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            className="fixed inset-0 z-[55] overflow-y-auto bg-white pt-[60px] lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          >
            <nav className="container-x flex flex-col py-8" aria-label="Mobile">
              {[{ href: "/", label: "Home" }, ...links, { href: user ? (user.admin ? "/admin" : "/account") : "/login", label: user ? (user.admin ? "Admin" : "My account") : "Sign in" }].map((l, i) => (
                <motion.div key={l.href + l.label} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.05, duration: 0.6, ease: [0.28, 0.11, 0.32, 1] }}>
                  <Link href={l.href} onClick={() => setMenu(false)} className="block border-b border-steel-100 py-4 text-[1.75rem] font-semibold tracking-[-0.035em] text-steel-900">{l.label}</Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
