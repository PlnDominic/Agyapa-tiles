import Link from "next/link";
import clsx from "clsx";
import { adminListOrders } from "@/lib/store";
import { PageHeader, PayBadge, StatusBadge } from "@/components/admin/ui";
import { dateTime, money } from "@/lib/format";
import { PAYMENT_LABEL, STATUS_LABEL, type OrderStatus } from "@/lib/types";

export const metadata = { title: "Orders" };
const tabs = ["all", "pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"] as const;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status = "all", q } = await searchParams;
  const orders = await adminListOrders({ status, q });
  const href = (s: string) => `/admin/orders?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
  return (
    <>
      <PageHeader title="Orders" sub={`${orders.length} ${status === "all" ? "total" : STATUS_LABEL[status as OrderStatus]?.toLowerCase()}`} />
      <form className="mb-5 flex gap-2"><input type="hidden" name="status" value={status} /><input name="q" defaultValue={q} placeholder="Search by order number, name, email or phone" className="field max-w-md" /><button className="rounded-full bg-steel-900 px-6 text-sm font-medium text-white">Search</button></form>
      <div className="hide-scrollbar mb-5 flex gap-2 overflow-x-auto">
        {tabs.map((t) => (<Link key={t} href={href(t)} className={clsx("shrink-0 rounded-full px-4 py-2 text-sm font-medium", status === t ? "bg-steel-900 text-white" : "bg-steel-50 text-steel-700 hover:bg-steel-100")}>{t === "all" ? "All" : STATUS_LABEL[t]}</Link>))}
      </div>
      <div className="overflow-x-auto rounded-[28px] bg-steel-50">
        <table className="w-full min-w-[760px] text-sm">
          <thead><tr className="text-left text-xs uppercase tracking-wider text-steel-500"><th className="px-6 py-4 font-semibold">Order</th><th className="font-semibold">Customer</th><th className="font-semibold">Date</th><th className="font-semibold">Payment</th><th className="font-semibold">Status</th><th className="px-6 text-right font-semibold">Total</th></tr></thead>
          <tbody className="divide-y divide-steel-200">
            {orders.length === 0 && <tr><td colSpan={6} className="px-6 py-16 text-center text-steel-500">No orders found.</td></tr>}
            {orders.map(({ order: o }) => (
              <tr key={o.id} className="transition-colors hover:bg-white">
                <td className="px-6 py-4"><Link href={`/admin/orders/${o.id}`} className="font-semibold hover:text-brand-600">{o.order_number}</Link></td>
                <td><p className="font-medium">{o.full_name}</p><p className="text-xs text-steel-500">{o.email}</p></td>
                <td className="text-steel-600">{dateTime(o.created_at)}</td>
                <td><p className="mb-1 text-xs text-steel-500">{PAYMENT_LABEL[o.payment_method]}</p><PayBadge s={o.payment_status} /></td>
                <td><StatusBadge status={o.status} /></td>
                <td className="px-6 text-right font-semibold tabular-nums">{money(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
