"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { useCart } from "@/components/shop/CartProvider";
import { Thumb } from "@/components/shop/Thumb";
import { Button, btn } from "@/components/ui/Button";
import { LockIcon } from "@/components/ui/icons";
import { money } from "@/lib/format";
import { PAYMENT_LABEL, type PaymentMethod } from "@/lib/types";

const regions = ["Greater Accra", "Ashanti", "Western", "Central", "Eastern", "Volta", "Northern", "Upper East", "Upper West", "Bono", "Bono East", "Ahafo", "Oti", "Savannah", "North East", "Western North"];
const payInfo: Record<PaymentMethod, string> = {
  cod: "Pay with cash or Mobile Money when your tiles arrive.",
  momo: "We will send Mobile Money payment details once your order is confirmed.",
  bank: "We will email our bank details once your order is confirmed.",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, delivery, total, clear, ready } = useCart();
  const [pay, setPay] = useState<PaymentMethod>("cod");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: get("email"), full_name: get("name"), phone: get("phone"), payment_method: pay, notes: get("notes"),
          address: { line1: get("line1"), line2: get("line2"), city: get("city"), region: get("region"), landmark: get("landmark") },
          items: lines.map((l) => ({ product_id: l.productId, quantity: l.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
      clear();
      router.push(`/track?number=${encodeURIComponent(data.order_number)}&email=${encodeURIComponent(get("email"))}&placed=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  if (ready && lines.length === 0) {
    return (
      <div className="container-x grid min-h-[60vh] place-items-center text-center">
        <div><h1 className="t-1">Your bag is empty.</h1><Link href="/shop" className={btn("primary", "lg", "mt-8")}>Explore tiles</Link></div>
      </div>
    );
  }

  return (
    <div className="container-x pb-10 pt-14 md:pt-20">
      <h1 className="t-1">Checkout</h1>
      <form onSubmit={submit} className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-12">
          <fieldset className="space-y-4">
            <legend className="t-3 mb-4">Contact</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label" htmlFor="name">Full name</label><input id="name" name="name" required autoComplete="name" className="field" /></div>
              <div><label className="label" htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="024 000 0000" className="field" /></div>
              <div className="sm:col-span-2"><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" className="field" /><p className="mt-1.5 text-xs text-steel-500">We use this to confirm your order and let you track it.</p></div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="t-3 mb-4">Delivery address</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className="label" htmlFor="line1">Street address</label><input id="line1" name="line1" required autoComplete="address-line1" className="field" /></div>
              <div className="sm:col-span-2"><label className="label" htmlFor="line2">Apartment, suite (optional)</label><input id="line2" name="line2" autoComplete="address-line2" className="field" /></div>
              <div><label className="label" htmlFor="city">City / town</label><input id="city" name="city" required autoComplete="address-level2" className="field" /></div>
              <div><label className="label" htmlFor="region">Region</label><select id="region" name="region" required defaultValue="Greater Accra" className="field">{regions.map((r) => <option key={r}>{r}</option>)}</select></div>
              <div className="sm:col-span-2"><label className="label" htmlFor="landmark">Nearest landmark (optional)</label><input id="landmark" name="landmark" className="field" placeholder="Helps our driver find you" /></div>
              <div className="sm:col-span-2"><label className="label" htmlFor="notes">Delivery notes (optional)</label><textarea id="notes" name="notes" rows={3} className="field resize-none" /></div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="t-3 mb-4">Payment</legend>
            <div className="grid gap-3">
              {(Object.keys(PAYMENT_LABEL) as PaymentMethod[]).map((m) => (
                <label key={m} className={clsx("flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-all", pay === m ? "border-brand-600 bg-brand-50/50 ring-2 ring-brand-600/20" : "border-steel-200 hover:border-steel-400")}>
                  <input type="radio" name="pay" value={m} checked={pay === m} onChange={() => setPay(m)} className="mt-1 size-4 accent-[var(--color-brand-600)]" />
                  <span><span className="block font-semibold">{PAYMENT_LABEL[m]}</span><span className="mt-0.5 block text-sm text-steel-600">{payInfo[m]}</span></span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <aside className="h-fit rounded-[32px] bg-steel-50 p-7 lg:sticky lg:top-[100px]">
          <h2 className="t-3">Order summary</h2>
          <ul className="mt-5 space-y-4">
            {lines.map((l) => (
              <li key={l.productId} className="flex items-center gap-3">
                <Thumb pattern={l.pattern} base={l.base} accent={l.accent} imageUrl={l.imageUrl} seed={l.slug} alt={l.name} className="size-14 shrink-0" sizes="56px" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{l.name}</p><p className="text-xs text-steel-500">{l.qty} {l.unit}</p></div>
                <p className="text-sm font-semibold tabular-nums">{money(l.price * l.qty)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2.5 border-t border-steel-200 pt-5 text-sm">
            <div className="flex justify-between text-steel-600"><dt>Subtotal</dt><dd className="tabular-nums">{money(subtotal)}</dd></div>
            <div className="flex justify-between text-steel-600"><dt>Delivery</dt><dd className="tabular-nums">{delivery === 0 ? "Free" : money(delivery)}</dd></div>
            <div className="flex justify-between pt-2 text-xl font-semibold tracking-tight"><dt>Total</dt><dd className="tabular-nums">{money(total)}</dd></div>
          </dl>
          {error && <p role="alert" className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800">{error}</p>}
          <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy || !ready}>{busy ? "Placing order…" : `Place order · ${money(total)}`}</Button>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-steel-500"><LockIcon width={14} height={14} />Prices are confirmed securely at checkout</p>
        </aside>
      </form>
    </div>
  );
}
