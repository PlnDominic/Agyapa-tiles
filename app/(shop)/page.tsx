import { getCategories, getProducts } from "@/lib/store";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { Story } from "@/components/home/Story";
import { Bento } from "@/components/home/Bento";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { Calculator } from "@/components/home/Calculator";
import { Stats } from "@/components/home/Stats";
import { PromiseSection } from "@/components/home/PromiseSection";
import { TrackingPreview } from "@/components/home/TrackingPreview";
import { FinalCTA } from "@/components/home/FinalCTA";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/format";

export default async function Home() {
  const [categories, all] = await Promise.all([getCategories(), getProducts()]);
  const featured = all.filter((p) => p.featured);
  const hero = featured.length >= 6 ? featured : all;
  return (
    <>
      <Hero />
      <Marquee />
      <Story products={hero} />
      <Bento categories={categories} products={all} />
      <FeaturedCarousel products={(featured.length ? featured : all).slice(0, 8)} />
      <Calculator products={all.slice(0, 12)} />
      <PromiseSection />
      <TrackingPreview />
      <Stats stats={[
        { value: all.length, label: "Finishes in the collection" },
        { value: categories.length, label: "Curated categories" },
        { value: FREE_DELIVERY_THRESHOLD, prefix: "GH₵ ", label: "Free delivery from" },
        { value: 6, label: "Tracking milestones per order" },
      ]} />
      <FinalCTA />
    </>
  );
}
