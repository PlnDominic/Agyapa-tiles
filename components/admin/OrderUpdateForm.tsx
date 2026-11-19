"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { updateOrderAction, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { STATUS_LABEL, type Order } from "@/lib/types";

const statuses = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"] as const;

export function OrderUpdateForm({ order }: { order: Order }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateOrderAction, {});
  const msg = useRef<HTMLTextAreaElement>(null);
  // Controlled so React's post-action form reset never snaps the selects back to stale values.
  const [status, setStatus] = useState(order.status);
  const [payment, setPayment] = useState(order.payment_status);
  const [seen, setSeen] = useState(`${order.status}|${order.payment_status}`);
  if (seen !== `${order.status}|${order.payment_status}`) {
    setSeen(`${order.status}|${order.payment_status}`);
    setStatus(order.status);
    setPayment(order.payment_status);
  }
  useEffect(() => { if (state.ok && msg.current) msg.current.value = ""; }, [state]);
  return (
    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }} className="space-y-4">
      <input type="hidden" name="id" value={order.id} />
      <div><label className="label" htmlFor="status">Order status</label>
        <select id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="field bg-white">{statuses.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></div>
      <div><label className="label" htmlFor="payment_status">Payment</label>
        <select id="payment_status" name="payment_status" value={payment} onChange={(e) => setPayment(e.target.value as typeof payment)} className="field bg-white"><option value="unpaid">Unpaid</option><option value="paid">Paid</option><option value="refunded">Refunded</option></select></div>
      <div><label className="label" htmlFor="message">Message to customer (shown in tracking)</label>
        <textarea ref={msg} id="message" name="message" rows={3} maxLength={300} className="field resize-none bg-white" placeholder="e.g. Driver Kojo is on the way. Call 024 000 0000" /></div>
      {state.error && <p role="alert" className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800">{state.error}</p>}
      {state.ok && <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800">Order updated. The customer can see it now.</p>}
      <Button type="submit" className="w-full" disabled={pending}>{pending ? "Saving…" : "Save update"}</Button>
      <p className="text-xs text-steel-500">Cancelling an order returns its items to stock.</p>
    </form>
  );
}
