import Link from "next/link";
import { adminStats } from "@/lib/store";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { Thumb } from "@/components/shop/Thumb";
import { dateTime, money, moneyShort } from "@/lib/format";
import { STATUS_LABEL, type OrderStatus } from "@/lib/types";

export default async function AdminHome() {
  const s = await adminStats();
  const kpis = [
    { label: "Revenue", value: moneyShort(s.revenue), sub: "excluding cancelled" },
    { label: "Orders", value: String(s.orderCount), sub: `${s.customers} customers` },
    { label: "To fulfil", value: String(s.pending), sub: "pending · confirmed · preparing" },
    { label: "Average order", value: moneyShort(s.avgOrder), sub: "per completed order" },
  ];
  return (
    <>
      <PageHeader title="Overview" sub="How the store is performing." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (<Card key={k.label}><p className="text-sm font-medium text-steel-500">{k.label}</p><p className="mt-2 text-3xl font-bold tracking-[-0.04em] tabular-nums">{k.value}</p><p className="mt-1 text-xs text-steel-500">{k.sub}</p></Card>))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <Card><h2 className="mb-5 font-semibold tracking-tight">Revenue</h2><RevenueChart data={s.days} /></Card>
        <Card>
          <h2 className="mb-5 font-semibold tracking-tight">Order pipeline</h2>
          <ul className="space-y-3">
            {(["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"] as OrderStatus[]).map((st) => (
              <li key={st} className="flex items-center justify-between text-sm"><span className="text-steel-600">{STATUS_LABEL[st]}</span><span className="rounded-full bg-white px-2.5 py-0.5 font-semibold tabular-nums">{s.byStatus[st] ?? 0}</span></li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold tracking-tight">Top products</h2>
          <ul className="space-y-3">
            {s.topProducts.length === 0 && <li className="text-sm text-steel-500">No sales yet.</li>}
            {s.topProducts.map((p) => (
              <li key={p.name} className="flex items-center gap-3">
                <Thumb pattern={p.pattern_key ?? "marble"} base={p.color_hex ?? "#eee"} accent={p.accent_hex ?? "#999"} seed={p.name} alt="" className="size-11 shrink-0 rounded-xl" sizes="44px" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{p.name}</p><p className="text-xs text-steel-500">{p.qty} sold</p></div>
                <p className="text-sm font-semibold tabular-nums">{moneyShort(p.revenue)}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold tracking-tight">Low stock</h2><Link href="/admin/products" className="text-sm font-medium text-brand-600 hover:underline">Manage</Link></div>
          <ul className="space-y-3">
            {s.lowStock.length === 0 && <li className="text-sm text-steel-500">All products are well stocked.</li>}
            {s.lowStock.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <Thumb pattern={p.pattern_key} base={p.color_hex} accent={p.accent_hex} imageUrl={p.image_url} seed={p.slug} alt="" className="size-11 shrink-0 rounded-xl" sizes="44px" />
                <Link href={`/admin/products/${p.id}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-brand-600">{p.name}</Link>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${p.stock === 0 ? "bg-brand-100 text-brand-800" : "bg-amber-100 text-amber-800"}`}>{p.stock} {p.unit}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-4">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold tracking-tight">Recent orders</h2><Link href="/admin/orders" className="text-sm font-medium text-brand-600 hover:underline">View all</Link></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-sm">
          <tbody className="divide-y divide-steel-200">
            {s.recent.map(({ order: o }) => (
              <tr key={o.id}><td className="py-3 pr-3"><Link href={`/admin/orders/${o.id}`} className="font-semibold hover:text-brand-600">{o.order_number}</Link></td><td className="pr-3 text-steel-600">{o.full_name}</td><td className="pr-3 text-steel-500">{dateTime(o.created_at)}</td><td className="pr-3"><StatusBadge status={o.status} /></td><td className="text-right font-semibold tabular-nums">{money(o.total)}</td></tr>
            ))}
          </tbody></table></div>
      </Card>
    </>
  );
}
