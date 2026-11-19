"use client";

import Link from "next/link";
import { useCart } from "@/components/shop/CartProvider";
import { Thumb } from "@/components/shop/Thumb";
import { btn } from "@/components/ui/Button";
import { MinusIcon, PlusIcon } from "@/components/ui/icons";
import { money } from "@/lib/format";

export default function CartPage() {
  const { lines, subtotal, delivery, total, setQty, remove, ready, settings } = useCart();
  return (
    <div className="container-x pb-10 pt-14 md:pt-20">
      <h1 className="t-1">Your bag</h1>
      {!ready ? <div className="mt-10 h-64 animate-pulse rounded-[32px] bg-steel-50" /> : lines.length === 0 ? (
        <div className="mt-10 rounded-[36px] bg-steel-50 py-28 text-center">
          <p className="t-3">Your bag is empty.</p>
          <p className="mt-2 text-steel-500">Find something beautiful for your floors.</p>
          <Link href="/shop" className={btn("primary", "lg", "mt-8")}>Explore tiles</Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <ul className="divide-y divide-steel-100 border-y border-steel-100">
            {lines.map((l) => (
              <li key={l.productId} className="flex gap-5 py-6">
                <Link href={`/product/${l.slug}`}><Thumb pattern={l.pattern} base={l.base} accent={l.accent} imageUrl={l.imageUrl} seed={l.slug} alt={l.name} className="size-28 md:size-36" sizes="144px" /></Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4"><Link href={`/product/${l.slug}`} className="text-lg font-semibold tracking-[-0.02em] hover:text-brand-600">{l.name}</Link><p className="text-lg font-semibold tabular-nums">{money(l.price * l.qty)}</p></div>
                  <p className="text-sm text-steel-500">{l.size} · {money(l.price)} per {l.unit}</p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center rounded-full bg-steel-50">
                      <button aria-label="Decrease" onClick={() => setQty(l.productId, l.qty - 1)} className="grid size-10 place-items-center rounded-full hover:bg-steel-100"><MinusIcon width={16} height={16} /></button>
                      <span className="w-12 text-center font-semibold tabular-nums">{l.qty}</span>
                      <button aria-label="Increase" onClick={() => setQty(l.productId, l.qty + 1)} className="grid size-10 place-items-center rounded-full hover:bg-steel-100"><PlusIcon width={16} height={16} /></button>
                    </div>
                    <button onClick={() => remove(l.productId)} className="text-sm text-steel-500 underline-offset-2 hover:text-brand-600 hover:underline">Remove</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="h-fit rounded-[32px] bg-steel-50 p-7 lg:sticky lg:top-[100px]">
            <h2 className="t-3">Summary</h2>
            <dl className="mt-5 space-y-3 text-[0.9375rem]">
              <div className="flex justify-between text-steel-600"><dt>Subtotal</dt><dd className="tabular-nums">{money(subtotal)}</dd></div>
              <div className="flex justify-between text-steel-600"><dt>Delivery</dt><dd className="tabular-nums">{delivery === 0 ? "Free" : money(delivery)}</dd></div>
              {delivery > 0 && <p className="text-xs text-steel-500">Add {money(settings.free_delivery_threshold - subtotal)} more for free delivery.</p>}
              <div className="flex justify-between border-t border-steel-200 pt-4 text-xl font-semibold tracking-tight"><dt>Total</dt><dd className="tabular-nums">{money(total)}</dd></div>
            </dl>
            <Link href="/checkout" className={btn("primary", "lg", "mt-6 w-full")}>Check out</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
