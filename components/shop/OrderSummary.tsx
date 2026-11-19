import type { OrderDetail } from "@/lib/types";
import { PAYMENT_LABEL } from "@/lib/types";
import { money, unitLabel } from "@/lib/format";
import { Thumb } from "./Thumb";

export function OrderSummary({ detail }: { detail: OrderDetail }) {
  const { order, items } = detail;
  const a = order.shipping_address;
  return (
    <div className="space-y-6">
      <ul className="divide-y divide-steel-100">
        {items.map((it) => (
          <li key={it.id} className="flex items-center gap-4 py-3">
            <Thumb pattern={it.pattern_key ?? "marble"} base={it.color_hex ?? "#eee"} accent={it.accent_hex ?? "#999"} seed={it.name} alt={it.name} className="size-16 shrink-0" sizes="64px" />
            <div className="min-w-0 flex-1"><p className="truncate font-medium">{it.name}</p><p className="text-sm text-steel-500">{it.quantity} {unitLabel(it.unit, it.quantity)} × {money(it.unit_price)}</p></div>
            <p className="font-semibold tabular-nums">{money(it.quantity * it.unit_price)}</p>
          </li>
        ))}
      </ul>
      <dl className="space-y-2 border-t border-steel-100 pt-4 text-sm">
        <div className="flex justify-between text-steel-600"><dt>Subtotal</dt><dd className="tabular-nums">{money(order.subtotal)}</dd></div>
        <div className="flex justify-between text-steel-600"><dt>Delivery</dt><dd className="tabular-nums">{order.shipping_fee === 0 ? "Free" : money(order.shipping_fee)}</dd></div>
        <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{money(order.total)}</dd></div>
      </dl>
      <div className="grid gap-4 rounded-2xl bg-steel-50 p-5 text-sm sm:grid-cols-2">
        <div><p className="font-semibold">Delivering to</p><p className="mt-1 text-steel-600">{order.full_name}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />{a.city}, {a.region}{a.landmark ? <><br />Near {a.landmark}</> : null}</p></div>
        <div><p className="font-semibold">Payment</p><p className="mt-1 text-steel-600">{PAYMENT_LABEL[order.payment_method]}<br /><span className={order.payment_status === "paid" ? "font-medium text-green-700" : ""}>{order.payment_status === "paid" ? "Paid" : order.payment_status === "refunded" ? "Refunded" : "Awaiting payment"}</span></p></div>
      </div>
    </div>
  );
}
