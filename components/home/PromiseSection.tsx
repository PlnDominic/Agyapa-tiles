"use client";

import { Reveal } from "@/components/ui/motion";
import { LayersIcon, PackageIcon, ShieldIcon, TruckIcon } from "@/components/ui/icons";

const items = [
  { icon: ShieldIcon, t: "Quality you can trust", d: "Every batch is inspected for shade, size and surface before it leaves our warehouse." },
  { icon: TruckIcon, t: "Delivery, handled", d: "Free delivery on orders over GH₵ 3,000. Careful handling from warehouse to doorstep." },
  { icon: LayersIcon, t: "Expert guidance", d: "Not sure what to choose? Our team helps with finishes, quantities and laying." },
  { icon: PackageIcon, t: "Straightforward ordering", d: "Order online in minutes, pay the way that suits you, and track it all the way." },
];

export function PromiseSection() {
  return (
    <section className="container-x pt-28 md:pt-40" aria-label="Our promise">
      <Reveal className="max-w-2xl">
        <p className="eyebrow">The Agyapa promise</p>
        <h2 className="t-1 mt-3">We serve our customers best.</h2>
      </Reveal>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <Reveal key={it.t} delay={i * 0.08}>
            <div className="group h-full rounded-[28px] bg-steel-50 p-7 transition-all duration-500 hover:-translate-y-1 hover:bg-white hover:shadow-lift">
              <span className="grid size-12 place-items-center rounded-2xl bg-white text-brand-600 shadow-soft transition-colors duration-500 group-hover:bg-brand-600 group-hover:text-white"><it.icon /></span>
              <h3 className="t-3 mt-6">{it.t}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-steel-600">{it.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
