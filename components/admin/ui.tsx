import clsx from "clsx";
import type { OrderStatus } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 md:mb-8 md:gap-4">
      <div><h1 className="text-[1.75rem] font-bold leading-tight tracking-[-0.04em] md:text-4xl">{title}</h1>{sub && <p className="mt-1 text-steel-500">{sub}</p>}</div>
      {action}
    </div>
  );
}

export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={clsx("rounded-[28px] bg-steel-50 p-6", className)}>{children}</div>
);

const tone: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800", confirmed: "bg-sky-100 text-sky-800", processing: "bg-violet-100 text-violet-800",
  shipped: "bg-indigo-100 text-indigo-800", out_for_delivery: "bg-brand-100 text-brand-800", delivered: "bg-green-100 text-green-800", cancelled: "bg-steel-200 text-steel-700",
};
export const StatusBadge = ({ status }: { status: OrderStatus }) => (
  <span className={clsx("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", tone[status])}>{STATUS_LABEL[status]}</span>
);
export const PayBadge = ({ s }: { s: string }) => (
  <span className={clsx("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", s === "paid" ? "bg-green-100 text-green-800" : s === "refunded" ? "bg-steel-200 text-steel-700" : "bg-amber-100 text-amber-800")}>{s === "paid" ? "Paid" : s === "refunded" ? "Refunded" : "Unpaid"}</span>
);
