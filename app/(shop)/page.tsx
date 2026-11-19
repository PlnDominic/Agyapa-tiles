import { countProducts, getCategories, getCategorySamples, getProducts, getSettings } from "@/lib/store";
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
  const [categories, featuredList, tiles, samples, total, settings] = await Promise.all([
    getCategories(), getProducts({ featured: true, inStock: true, limit: 12 }), getProducts({ tilesOnly: true, inStock: true, sort: "price-asc", limit: 400 }),
    getCategorySamples(), countProducts(), getSettings(),
  ]);
  const featured = featuredList.length ? featuredList : tiles.slice(0, 8);
  const hero = featured;
  return (
    <>
      <Hero />
      <Marquee />
      <FeaturedCarousel products={featured.slice(0, 8)} />
      <Story products={hero} />
      <Bento categories={categories} samples={samples} />
      <Calculator products={tiles} />
      <TrackingPreview />
      <Stats stats={[
        { value: total, label: "Products in the catalogue" },
        { value: categories.length, label: "Collections to browse" },
        { value: settings.free_delivery_threshold, prefix: "GH₵ ", label: "Free delivery from" },
        { value: 6, label: "Tracking milestones per order" },
      ]} />
      <FinalCTA />
    </>
  );
}
