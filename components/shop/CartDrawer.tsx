"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useCart } from "./CartProvider";
import { Thumb } from "./Thumb";
import { btn } from "@/components/ui/Button";
import { BagIcon, CloseIcon, MinusIcon, PlusIcon, TruckIcon } from "@/components/ui/icons";
import { FREE_DELIVERY_THRESHOLD, money } from "@/lib/format";

export function CartDrawer() {
  const { open, setOpen, lines, subtotal, delivery, total, setQty, remove } = useCart();
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progress = Math.min(1, subtotal / FREE_DELIVERY_THRESHOLD);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim" className="fixed inset-0 z-[80] bg-black/35 backdrop-blur-[3px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}
          />
          <motion.aside
            key="panel" role="dialog" aria-modal="true" aria-label="Shopping bag"
            className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-[440px] flex-col bg-white shadow-lift sm:inset-y-3 sm:right-3 sm:rounded-[32px]"
            initial={{ x: "105%" }} animate={{ x: 0 }} exit={{ x: "105%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
          >
            <header className="flex items-center justify-between px-6 pb-3 pt-6">
              <h2 className="text-xl font-semibold tracking-[-0.03em]">Your bag</h2>
              <button onClick={() => setOpen(false)} aria-label="Close bag" className="grid size-10 place-items-center rounded-full bg-steel-50 transition hover:bg-steel-100"><CloseIcon /></button>
            </header>

            {lines.length > 0 && (
              <div className="mx-6 mb-2 rounded-2xl bg-steel-50 p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-steel-800">
                  <TruckIcon className="text-brand-600" />
                  {remaining > 0 ? <>Add <b>{money(remaining)}</b> more for free delivery</> : <>You&rsquo;ve unlocked <b>free delivery</b></>}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-steel-200">
                  <motion.div className="h-full rounded-full bg-brand-600" initial={false} animate={{ width: `${progress * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-2">
              {lines.length === 0 ? (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <div className="mx-auto grid size-20 place-items-center rounded-full bg-steel-50 text-steel-400"><BagIcon width={34} height={34} /></div>
                    <p className="mt-5 text-lg font-semibold tracking-tight">Your bag is empty</p>
                    <p className="mt-1 text-sm text-steel-500">Find something beautiful for your floors.</p>
                    <Link href="/shop" onClick={() => setOpen(false)} className={btn("primary", "md", "mt-6")}>Explore tiles</Link>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-steel-100">
                  <AnimatePresence initial={false}>
                    {lines.map((l) => (
                      <motion.li key={l.productId} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex gap-4 overflow-hidden py-4">
                        <Link href={`/product/${l.slug}`} onClick={() => setOpen(false)} className="shrink-0">
                          <Thumb pattern={l.pattern} base={l.base} accent={l.accent} imageUrl={l.imageUrl} seed={l.slug} alt={l.name} className="size-24 rounded-2xl" sizes="96px" />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex justify-between gap-2">
                            <p className="truncate font-semibold tracking-[-0.015em]">{l.name}</p>
                            <button onClick={() => remove(l.productId)} className="text-xs text-steel-500 underline-offset-2 hover:text-brand-600 hover:underline">Remove</button>
                          </div>
                          <p className="text-sm text-steel-500">{l.size} · {money(l.price)}/{l.unit}</p>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center rounded-full bg-steel-50">
                              <button aria-label="Decrease" onClick={() => setQty(l.productId, l.qty - 1)} className="grid size-9 place-items-center rounded-full hover:bg-steel-100"><MinusIcon width={16} height={16} /></button>
                              <span className="w-10 text-center text-sm font-semibold tabular-nums">{l.qty}</span>
                              <button aria-label="Increase" onClick={() => setQty(l.productId, l.qty + 1)} className="grid size-9 place-items-center rounded-full hover:bg-steel-100"><PlusIcon width={16} height={16} /></button>
                            </div>
                            <p className="font-semibold tabular-nums">{money(l.price * l.qty)}</p>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <footer className="space-y-3 border-t border-steel-100 px-6 pb-6 pt-5">
                <div className="flex justify-between text-sm text-steel-600"><span>Subtotal</span><span className="tabular-nums">{money(subtotal)}</span></div>
                <div className="flex justify-between text-sm text-steel-600"><span>Delivery</span><span className="tabular-nums">{delivery === 0 ? "Free" : money(delivery)}</span></div>
                <div className="flex justify-between text-lg font-semibold tracking-tight"><span>Total</span><span className="tabular-nums">{money(total)}</span></div>
                <Link href="/checkout" onClick={() => setOpen(false)} className={btn("primary", "lg", "w-full")}>Check out</Link>
                <Link href="/cart" onClick={() => setOpen(false)} className="block text-center text-sm font-medium text-steel-600 hover:text-brand-600">View full bag</Link>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
