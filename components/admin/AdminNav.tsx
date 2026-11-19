"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { signOut } from "@/app/auth/actions";
import {
  ChartIcon, CloseIcon, GridIcon, LayersIcon, LogoutIcon, MoreIcon, PackageIcon, SettingsIcon, StoreIcon, UsersIcon,
} from "@/components/ui/icons";

const primary = [
  { href: "/admin", label: "Overview", icon: ChartIcon, exact: true },
  { href: "/admin/orders", label: "Orders", icon: PackageIcon },
  { href: "/admin/products", label: "Products", icon: GridIcon },
  { href: "/admin/customers", label: "Customers", icon: UsersIcon },
];
const more = [
  { href: "/admin/categories", label: "Categories", icon: LayersIcon },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];
const all = [...primary, ...more];

export function AdminNav({ name }: { name: string }) {
  const path = usePathname();
  const [sheet, setSheet] = useState(false);
  const isActive = (it: { href: string; exact?: boolean }) => (it.exact ? path === it.href : path.startsWith(it.href));
  const current = all.find(isActive)?.label ?? "Admin";
  const moreActive = more.some(isActive);

  // Close the sheet whenever the route changes.
  const [seenPath, setSeenPath] = useState(path);
  if (seenPath !== path) { setSeenPath(path); setSheet(false); }
  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [sheet]);

  return (
    <>
      {/* ───────── Desktop sidebar ───────── */}
      <aside className="hidden border-r border-steel-100 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:gap-8 lg:px-5 lg:py-7">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image src="/brand/logo-mark.png" alt="" width={44} height={40} className="h-8 w-auto" />
          <span className="leading-tight"><b className="block text-[0.9375rem] font-extrabold tracking-[-0.03em]">AGYAPA</b><span className="text-[11px] font-medium uppercase tracking-[0.14em] text-steel-500">Admin</span></span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1" aria-label="Admin">
          {all.map((it) => (
            <Link key={it.href} href={it.href} aria-current={isActive(it) ? "page" : undefined} className={clsx("flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors", isActive(it) ? "bg-brand-50 text-brand-700" : "text-steel-600 hover:bg-steel-50 hover:text-steel-900")}>
              <it.icon width={18} height={18} />{it.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 border-t border-steel-100 pt-4">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-steel-600 hover:bg-steel-50"><StoreIcon width={18} height={18} />View storefront</Link>
          <form action={signOut}><button className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-steel-600 hover:bg-steel-50"><LogoutIcon width={18} height={18} />Sign out</button></form>
          <p className="truncate px-3.5 pt-2 text-xs text-steel-500">{name}</p>
        </div>
      </aside>

      {/* ───────── Mobile top bar ───────── */}
      <header className="glass sticky top-0 z-40 border-b border-steel-100 lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4 pt-[env(safe-area-inset-top)] box-content">
          <Link href="/admin" className="flex items-center gap-2.5" aria-label="Admin home">
            <Image src="/brand/logo-mark.png" alt="" width={44} height={40} className="h-8 w-auto" />
            <span aria-hidden className="h-5 w-px bg-steel-200" />
            <motion.span key={current} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-[1.0625rem] font-semibold tracking-[-0.025em]">{current}</motion.span>
          </Link>
          <Link href="/" aria-label="View storefront" className="grid size-10 place-items-center rounded-full bg-steel-50 text-steel-700 transition active:scale-95"><StoreIcon width={19} height={19} /></Link>
        </div>
      </header>

      {/* ───────── Mobile bottom tab bar ───────── */}
      <nav aria-label="Admin" className="glass fixed inset-x-0 bottom-0 z-50 border-t border-steel-100 pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ul className="grid grid-cols-5 px-1.5 pt-1.5">
          {primary.map((it) => {
            const active = isActive(it);
            return (
              <li key={it.href}>
                <Link href={it.href} aria-current={active ? "page" : undefined} className={clsx("relative flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[10.5px] font-semibold tracking-tight transition-colors active:scale-95", active ? "text-brand-600" : "text-steel-500")}>
                  {active && <motion.span layoutId="tab-pill" className="absolute inset-x-2 inset-y-0.5 -z-10 rounded-2xl bg-brand-50" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <it.icon width={22} height={22} strokeWidth={active ? 2 : 1.7} />{it.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button onClick={() => setSheet(true)} aria-haspopup="dialog" aria-expanded={sheet} className={clsx("relative flex w-full flex-col items-center gap-0.5 rounded-2xl py-2 text-[10.5px] font-semibold tracking-tight transition-colors active:scale-95", moreActive ? "text-brand-600" : "text-steel-500")}>
              {moreActive && <span className="absolute inset-x-2 inset-y-0.5 -z-10 rounded-2xl bg-brand-50" />}
              <MoreIcon width={22} height={22} />More
            </button>
          </li>
        </ul>
      </nav>

      {/* ───────── "More" sheet ───────── */}
      <AnimatePresence>
        {sheet && (
          <>
            <motion.div key="scrim" className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />
            <motion.div
              key="sheet" role="dialog" aria-modal="true" aria-label="More"
              className="fixed inset-x-0 bottom-0 z-[70] rounded-t-[32px] bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-lift lg:hidden"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }}
              drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }} onDragEnd={(_, i) => { if (i.offset.y > 80 || i.velocity.y > 500) setSheet(false); }}
            >
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-steel-200" />
              <div className="mb-4 flex items-center justify-between">
                <div className="min-w-0"><p className="text-lg font-semibold tracking-[-0.025em]">More</p><p className="truncate text-xs text-steel-500">Signed in as {name}</p></div>
                <button onClick={() => setSheet(false)} aria-label="Close" className="grid size-10 place-items-center rounded-full bg-steel-50"><CloseIcon width={18} height={18} /></button>
              </div>
              <ul className="grid grid-cols-2 gap-3">
                {more.map((it) => (
                  <li key={it.href}>
                    <Link href={it.href} className={clsx("flex flex-col gap-3 rounded-3xl p-4 transition active:scale-[0.97]", isActive(it) ? "bg-brand-50 text-brand-700" : "bg-steel-50 text-steel-900")}>
                      <span className="grid size-10 place-items-center rounded-2xl bg-white text-brand-600 shadow-soft"><it.icon width={20} height={20} /></span>
                      <span className="font-semibold tracking-tight">{it.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-3 space-y-2">
                <Link href="/" className="flex items-center gap-3 rounded-2xl bg-steel-50 px-4 py-3.5 font-medium"><StoreIcon width={20} height={20} className="text-steel-600" />View storefront</Link>
                <form action={signOut}><button className="flex w-full items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3.5 font-medium text-brand-700"><LogoutIcon width={20} height={20} />Sign out</button></form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
