const words = ["Porcelain", "Marble", "Terrazzo", "Zellige", "Herringbone", "Heritage Cement", "Slate", "Oak", "Mosaic", "Hexagon"];

export function Marquee() {
  const row = [...words, ...words];
  return (
    <div className="overflow-hidden border-y border-steel-100 py-7" aria-hidden>
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {[...row, ...row].map((w, i) => (
          <span key={i} className="flex items-center gap-10 text-[clamp(2rem,5vw,3.75rem)] font-bold tracking-[-0.04em] text-steel-200">
            {w}
            <span className="size-2.5 rounded-full bg-brand-600" />
          </span>
        ))}
      </div>
    </div>
  );
}
