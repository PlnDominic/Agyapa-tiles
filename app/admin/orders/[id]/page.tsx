import Link from "next/link";
import { notFound } from "next/navigation";
import { adminGetOrder } from "@/lib/store";
import { Card, PageHeader, PayBadge, StatusBadge } from "@/components/admin/ui";
import { OrderUpdateForm } from "@/components/admin/OrderUpdateForm";
import { OrderTimeline } from "@/components/shop/OrderTimeline";
import { OrderSummary } from "@/components/shop/OrderSummary";
import { dateTime } from "@/lib/format";

export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await adminGetOrder(id);
  if (!detail) notFound();
  const { order: o } = detail;
  return (
    <>
      <Link href="/admin/orders" className="mb-4 inline-block text-sm font-medium text-steel-500 hover:text-brand-600">← All orders</Link>
      <PageHeader title={o.order_number} sub={`Placed ${dateTime(o.created_at)}`} action={<div className="flex gap-2"><StatusBadge status={o.status} /><PayBadge s={o.payment_status} /></div>} />
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <Card className="bg-white ring-1 ring-black/5"><h2 className="mb-5 font-semibold tracking-tight">Items &amp; delivery</h2><OrderSummary detail={detail} /></Card>
          <Card><h2 className="mb-5 font-semibold tracking-tight">Customer</h2>
            <dl className="grid gap-4 text-sm sm:grid-cols-3"><div><dt className="text-steel-500">Name</dt><dd className="mt-1 font-medium">{o.full_name}</dd></div><div><dt className="text-steel-500">Email</dt><dd className="mt-1 font-medium"><a className="hover:text-brand-600" href={`mailto:${o.email}`}>{o.email}</a></dd></div><div><dt className="text-steel-500">Phone</dt><dd className="mt-1 font-medium"><a className="hover:text-brand-600" href={`tel:${o.phone}`}>{o.phone}</a></dd></div></dl>
            {o.notes && <p className="mt-5 rounded-2xl bg-white p-4 text-sm"><b>Note:</b> {o.notes}</p>}
          </Card>
          <Card><h2 className="mb-6 font-semibold tracking-tight">Tracking timeline</h2><OrderTimeline status={o.status} events={detail.events} /></Card>
        </div>
        <Card className="h-fit lg:sticky lg:top-8"><h2 className="mb-5 font-semibold tracking-tight">Update order</h2><OrderUpdateForm order={o} /></Card>
      </div>
    </>
  );
}
