import Image from "next/image";
import { TileArt } from "@/components/ui/TileArt";
import type { PatternKey } from "@/lib/types";

/** Product visual: uploaded photo if present, otherwise the generative tile surface. */
export function Thumb({
  pattern, base, accent, imageUrl, seed, className = "", alt, grout, sizes = "(min-width: 1024px) 25vw, 50vw", priority,
}: {
  pattern: PatternKey; base: string; accent: string; imageUrl?: string | null; seed?: string | number;
  className?: string; alt: string; grout?: boolean; sizes?: string; priority?: boolean;
}) {
  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={imageUrl} alt={alt} fill sizes={sizes} className="object-cover" priority={priority} />
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <TileArt pattern={pattern} base={base} accent={accent} seed={seed} grout={grout} title={alt} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
