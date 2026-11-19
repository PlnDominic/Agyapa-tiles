import { adminListCustomers } from "@/lib/store";
import { PageHeader } from "@/components/admin/ui";
import { dateShort, money } from "@/lib/format";

export const metadata = { title: "Customers" };

export default async function CustomersPage() {
  const customers = await adminListCustomers();
  return (
    <>
      <PageHeader title="Customers" sub={`${customers.length} customers, ranked by lifetime spend`} />
      <div className="hidden overflow-x-auto rounded-[28px] bg-steel-50 md:block">
        <table className="w-full min-w-[640px] text-sm">
          <thead><tr className="text-left text-xs uppercase tracking-wider text-steel-500"><th className="px-6 py-4 font-semibold">Customer</th><th className="font-semibold">Phone</th><th className="font-semibold">Orders</th><th className="font-semibold">Last order</th><th className="px-6 text-right font-semibold">Lifetime spend</th></tr></thead>
          <tbody className="divide-y divide-steel-200">
            {customers.length === 0 && <tr><td colSpan={5} className="px-6 py-16 text-center text-steel-500">No customers yet.</td></tr>}
            {customers.map((c) => (
              <tr key={c.email} className="hover:bg-white"><td className="px-6 py-4"><p className="font-semibold">{c.name}</p><p className="text-xs text-steel-500">{c.email}</p></td><td className="text-steel-600">{c.phone}</td><td className="tabular-nums">{c.orders}</td><td className="text-steel-600">{dateShort(c.last)}</td><td className="px-6 text-right font-semibold tabular-nums">{money(c.spent)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {customers.length === 0 && <li className="rounded-3xl bg-steel-50 py-14 text-center text-steel-500">No customers yet.</li>}
        {customers.map((c) => (
          <li key={c.email} className="rounded-3xl bg-steel-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><p className="truncate font-semibold tracking-tight">{c.name}</p><p className="truncate text-xs text-steel-500">{c.email}</p></div>
              <p className="font-bold tabular-nums">{money(c.spent)}</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-steel-600">
              <a href={`tel:${c.phone}`} className="font-medium text-brand-600">{c.phone}</a>
              <span>{c.orders} order{c.orders === 1 ? "" : "s"} · last {dateShort(c.last)}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
