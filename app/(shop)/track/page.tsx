import type { Metadata } from "next";
import { trackOrder } from "@/lib/store";
import { OrderTimeline } from "@/components/shop/OrderTimeline";
import { OrderSummary } from "@/components/shop/OrderSummary";
import { Reveal } from "@/components/ui/motion";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/icons";
import { dateTime } from "@/lib/format";
import { STATUS_HELP, STATUS_LABEL } from "@/lib/types";

export const metadata: Metadata = { title: "Track your order" };

export default async function TrackPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const number = sp.number?.trim(), email = sp.email?.trim();
  const detail = number && email ? await trackOrder(number, email) : null;
  const searched = Boolean(number && email);

  return (
    <div className="container-narrow pb-10 pt-14 md:pt-20">
      {sp.placed && detail && (
        <Reveal className="mb-10 rounded-[32px] bg-brand-600 p-8 text-center text-white md:p-12">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-white/20"><CheckIcon width={28} height={28} /></span>
          <h1 className="t-1 mt-5">Thank you, {detail.order.full_name.split(" ")[0]}.</h1>
          <p className="mx-auto mt-3 max-w-md text-lg text-white/85">Your order <b>{detail.order.order_number}</b> is in. Save this page or your order number to follow it.</p>
        </Reveal>
      )}

      {!(sp.placed && detail) && (
        <Reveal>
          <p className="eyebrow">Order tracking</p>
          <h1 className="t-1 mt-3">Where is my order?</h1>
          <p className="lead mt-4 max-w-xl">Enter your order number and the email you used at checkout.</p>
        </Reveal>
      )}

      <form method="GET" className="mt-8 grid gap-3 rounded-[28px] bg-steel-50 p-4 sm:grid-cols-[1fr_1fr_auto]">
        <div><label className="label sr-only" htmlFor="number">Order number</label><input id="number" name="number" defaultValue={number} required placeholder="AGY-100241" className="field bg-white" /></div>
        <div><label className="label sr-only" htmlFor="email">Email</label><input id="email" name="email" type="email" defaultValue={email} required placeholder="you@example.com" className="field bg-white" /></div>
        <Button type="submit" size="lg">Track</Button>
      </form>

      {searched && !detail && (
        <p role="alert" className="mt-6 rounded-2xl bg-brand-50 px-5 py-4 text-sm font-medium text-brand-800">We couldn&rsquo;t find an order with those details. Check the order number and email, then try again.</p>
      )}

      {detail && (
        <div className="mt-12 grid gap-12 md:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <p className="text-sm text-steel-500">Order {detail.order.order_number} · placed {dateTime(detail.order.created_at)}</p>
            <h2 className="t-2 mt-2">{STATUS_LABEL[detail.order.status]}</h2>
            <p className="mt-2 text-steel-600">{STATUS_HELP[detail.order.status]}</p>
            <div className="mt-10"><OrderTimeline status={detail.order.status} events={detail.events} /></div>
          </Reveal>
          <Reveal delay={0.1}><div className="rounded-[32px] bg-white p-6 shadow-soft ring-1 ring-black/5 md:p-8"><OrderSummary detail={detail} /></div></Reveal>
        </div>
      )}
    </div>
  );
}
