import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getMyOrders } from "@/lib/store";
import { signOut } from "@/app/auth/actions";
import { OrderTimeline } from "@/components/shop/OrderTimeline";
import { OrderSummary } from "@/components/shop/OrderSummary";
import { btn } from "@/components/ui/Button";
import { dateShort, money } from "@/lib/format";
import { STATUS_LABEL } from "@/lib/types";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const orders = await getMyOrders();

  return (
    <div className="container-narrow pb-10 pt-14 md:pt-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">My account</p><h1 className="t-1 mt-3">Hello{user.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}.</h1><p className="mt-2 text-steel-500">{user.email}</p></div>
        <div className="flex gap-2">
          {user.role === "admin" && <Link href="/admin" className={btn("dark", "md")}>Admin</Link>}
          <form action={signOut}><button className={btn("secondary", "md")}>Sign out</button></form>
        </div>
      </div>

      <h2 className="t-3 mt-14">Your orders</h2>
      {orders.length === 0 ? (
        <div className="mt-6 rounded-[32px] bg-steel-50 py-20 text-center"><p className="text-steel-600">You haven&rsquo;t placed an order yet.</p><Link href="/shop" className={btn("primary", "md", "mt-5")}>Start shopping</Link></div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((d) => (
            <details key={d.order.id} className="group rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5 open:shadow-lift">
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                <div><p className="font-semibold tracking-tight">{d.order.order_number}</p><p className="text-sm text-steel-500">{dateShort(d.order.created_at)} · {d.items.length} {d.items.length === 1 ? "item" : "items"}</p></div>
                <div className="flex items-center gap-4"><span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{STATUS_LABEL[d.order.status]}</span><span className="font-semibold tabular-nums">{money(d.order.total)}</span></div>
              </summary>
              <div className="mt-8 grid gap-10 border-t border-steel-100 pt-8 md:grid-cols-2">
                <OrderTimeline status={d.order.status} events={d.events} />
                <OrderSummary detail={d} />
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
