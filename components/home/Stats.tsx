"use client";

import { CountUp, Reveal } from "@/components/ui/motion";

export function Stats({ stats }: { stats: { value: number; label: string; prefix?: string; suffix?: string }[] }) {
  return (
    <section className="container-x pt-28 md:pt-40" aria-label="At a glance">
      <div className="grid gap-px overflow-hidden rounded-[36px] bg-steel-100 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="bg-white p-8 text-center md:p-10">
            <p className="text-[clamp(2.75rem,6vw,4.5rem)] font-bold leading-none tracking-[-0.05em] text-gradient-red"><CountUp to={s.value} prefix={s.prefix} suffix={s.suffix} /></p>
            <p className="mt-3 text-sm font-medium text-steel-600">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
