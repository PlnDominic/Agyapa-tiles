import { getCategories, getProducts, getSettings } from "@/lib/store";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { Story } from "@/components/home/Story";
import { Bento } from "@/components/home/Bento";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { Calculator } from "@/components/home/Calculator";
import { Stats } from "@/components/home/Stats";
import { TrackingPreview } from "@/components/home/TrackingPreview";
import { FinalCTA } from "@/components/home/FinalCTA";

export default async function Home() {
  const [categories, all, settings] = await Promise.all([getCategories(), getProducts(), getSettings()]);
  const featured = all.filter((p) => p.featured);
  const hero = featured.length >= 6 ? featured : all;
  return (
    <>
      <Hero />
      <Marquee />
      <FeaturedCarousel products={(featured.length ? featured : all).slice(0, 8)} />
      <Story products={hero} />
      <Bento categories={categories} products={all} />
      <Calculator products={all.slice(0, 12)} />
      <TrackingPreview />
      <Stats stats={[
        { value: all.length, label: "Finishes in the collection" },
        { value: categories.length, label: "Curated categories" },
        { value: settings.free_delivery_threshold, prefix: "GH₵ ", label: "Free delivery from" },
        { value: 6, label: "Tracking milestones per order" },
      ]} />
      <FinalCTA />
    </>
  );
}
