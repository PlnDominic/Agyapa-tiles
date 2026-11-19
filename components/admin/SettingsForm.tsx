"use client";

import { startTransition, useActionState } from "react";
import { saveSettingsAction, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import type { Settings } from "@/lib/settings";

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveSettingsAction, {});
  return (
    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }} className="max-w-2xl space-y-4">
      <section className="space-y-4 rounded-[28px] bg-steel-50 p-6">
        <h2 className="font-semibold tracking-tight">Store details</h2>
        <p className="-mt-2 text-sm text-steel-500">Shown in the website footer and on the login page.</p>
        <div><label className="label" htmlFor="store_name">Store name</label><input id="store_name" name="store_name" required defaultValue={settings.store_name} className="field bg-white" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" required defaultValue={settings.phone} className="field bg-white" /></div>
          <div><label className="label" htmlFor="email">Email (optional)</label><input id="email" name="email" type="email" defaultValue={settings.email ?? ""} className="field bg-white" /></div>
        </div>
        <div><label className="label" htmlFor="address">Address / location</label><input id="address" name="address" required defaultValue={settings.address} className="field bg-white" /></div>
      </section>
      <section className="space-y-4 rounded-[28px] bg-steel-50 p-6">
        <h2 className="font-semibold tracking-tight">Delivery</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="delivery_fee">Delivery fee (GH₵)</label><input id="delivery_fee" name="delivery_fee" type="number" step="0.01" min="0" required defaultValue={settings.delivery_fee} className="field bg-white" /></div>
          <div><label className="label" htmlFor="free_delivery_threshold">Free delivery from (GH₵)</label><input id="free_delivery_threshold" name="free_delivery_threshold" type="number" step="0.01" min="0" required defaultValue={settings.free_delivery_threshold} className="field bg-white" /></div>
        </div>
        <p className="text-xs text-steel-500">Applies to new orders immediately. Orders already placed keep the fee they were charged.</p>
      </section>
      {state.error && <p role="alert" className="rounded-2xl bg-brand-50 px-5 py-4 text-sm font-medium text-brand-800">{state.error}</p>}
      {state.ok && <p role="status" className="rounded-2xl bg-green-50 px-5 py-4 text-sm font-medium text-green-800">Settings saved. The website is updated.</p>}
      <Button type="submit" size="lg" disabled={pending}>{pending ? "Saving…" : "Save settings"}</Button>
    </form>
  );
}
