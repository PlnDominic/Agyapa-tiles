import { adminListCustomers } from "@/lib/store";
import { PageHeader } from "@/components/admin/ui";
import { dateShort, money } from "@/lib/format";

export const metadata = { title: "Customers" };

export default async function CustomersPage() {
  const customers = await adminListCustomers();
  return (
    <>
      <PageHeader title="Customers" sub={`${customers.length} customers, ranked by lifetime spend`} />
      <div className="overflow-x-auto rounded-[28px] bg-steel-50">
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
    </>
  );
}
