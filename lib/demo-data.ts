import type { Category, Product, PatternKey } from "./types";

const cat = (i: number, slug: string, name: string, description: string, pattern_key: PatternKey): Category => ({
  id: `cat-${slug}`, slug, name, description, pattern_key, sort_order: i,
});

export const DEMO_CATEGORIES: Category[] = [
  cat(1, "marble-look", "Marble Look", "The drama of natural stone, none of the upkeep.", "marble"),
  cat(2, "wood-look", "Wood Look", "Warm timber character with porcelain durability.", "wood"),
  cat(3, "terrazzo", "Terrazzo", "Playful chips and timeless composition.", "terrazzo"),
  cat(4, "geometric", "Geometric & Cement", "Bold patterns that make a statement.", "geometric"),
  cat(5, "wall-and-mosaic", "Wall & Mosaic", "Zellige, subway and hex for walls that glow.", "zellige"),
  cat(6, "outdoor", "Outdoor & Anti-slip", "Built for terraces, pools and heavy footfall.", "slate"),
];

type Seed = Omit<Product, "id" | "category" | "category_id" | "image_url" | "active" | "created_at" | "compare_at_price" | "coverage_per_box"> &
  { cat: string; was?: number; box?: number };

const seeds: Seed[] = [
  { cat: "marble-look", slug: "calacatta-oro-polished", name: "Calacatta Oro", description: "Luminous white ground with sweeping gold-grey veining. A polished porcelain slab that turns any hall into a gallery.", price: 485, was: 560, sku: "AGY-MB-001", stock: 640, unit: "sqm", size: "60 × 120 cm", finish: "Polished", material: "Porcelain", pattern_key: "marble", color_hex: "#f4f2ee", accent_hex: "#b9a37a", featured: true, box: 1.44 },
  { cat: "marble-look", slug: "nero-marquina-matt", name: "Nero Marquina", description: "Deep black with crisp white veins. Matt finish keeps it quiet, confident and easy to live with.", price: 520, sku: "AGY-MB-002", stock: 410, unit: "sqm", size: "60 × 60 cm", finish: "Matt", material: "Porcelain", pattern_key: "marble", color_hex: "#26262a", accent_hex: "#e6e6e8", featured: true, box: 1.44 },
  { cat: "marble-look", slug: "carrara-grey", name: "Carrara Grey", description: "Soft cloud-grey with fine silver veining. Calm, bright and endlessly versatile.", price: 395, sku: "AGY-MB-003", stock: 880, unit: "sqm", size: "80 × 80 cm", finish: "Satin", material: "Porcelain", pattern_key: "marble", color_hex: "#dcdde0", accent_hex: "#8b8d94", featured: false, box: 1.28 },
  { cat: "wood-look", slug: "oak-natural-plank", name: "Natural Oak Plank", description: "Honey oak grain captured in rectified porcelain. Barefoot warm, scratch-proof, water-proof.", price: 340, sku: "AGY-WD-001", stock: 720, unit: "sqm", size: "20 × 120 cm", finish: "Textured", material: "Porcelain", pattern_key: "wood", color_hex: "#c9a074", accent_hex: "#8a6238", featured: true, box: 1.2 },
  { cat: "wood-look", slug: "walnut-smoke", name: "Smoked Walnut", description: "Rich chocolate-brown planks with subtle smoked tonal shifts for a refined, enveloping feel.", price: 365, sku: "AGY-WD-002", stock: 530, unit: "sqm", size: "20 × 120 cm", finish: "Textured", material: "Porcelain", pattern_key: "wood", color_hex: "#6b4a34", accent_hex: "#3d2a1d", featured: false, box: 1.2 },
  { cat: "terrazzo", slug: "terrazzo-graphite", name: "Terrazzo Graphite", description: "Dark graphite ground with bright mineral chips. High-contrast and unapologetically modern.", price: 470, sku: "AGY-TZ-002", stock: 190, unit: "sqm", size: "60 × 60 cm", finish: "Matt", material: "Porcelain", pattern_key: "terrazzo", color_hex: "#3c3c41", accent_hex: "#d9d9dc", featured: false, box: 1.44 },
  { cat: "geometric", slug: "cement-slate-grey", name: "Studio Cement", description: "Seamless micro-cement look in soft slate. Industrial calm for living spaces and offices.", price: 310, sku: "AGY-GM-002", stock: 960, unit: "sqm", size: "80 × 80 cm", finish: "Matt", material: "Porcelain", pattern_key: "cement", color_hex: "#b8b9bc", accent_hex: "#909195", featured: false, box: 1.28 },
  { cat: "wall-and-mosaic", slug: "zellige-bone", name: "Zellige Bone", description: "Handmade-look glazed relief with beautiful irregular light. Perfect for kitchens and bathrooms.", price: 260, sku: "AGY-WL-001", stock: 700, unit: "sqm", size: "10 × 10 cm", finish: "Glossy", material: "Ceramic", pattern_key: "zellige", color_hex: "#ede8de", accent_hex: "#c9c1b0", featured: false, box: 0.5 },
  { cat: "wall-and-mosaic", slug: "metro-white", name: "Metro White", description: "The perfect subway tile. Bevelled edges, gloss white, clean lines.", price: 190, sku: "AGY-WL-003", stock: 1500, unit: "sqm", size: "7.5 × 15 cm", finish: "Glossy", material: "Ceramic", pattern_key: "subway", color_hex: "#f7f7f7", accent_hex: "#d6d6d8", featured: false, box: 1.0 },
  { cat: "wall-and-mosaic", slug: "hex-charcoal", name: "Hex Charcoal", description: "Honeycomb hexagons in deep charcoal for bold floors and feature walls.", price: 330, sku: "AGY-WL-004", stock: 380, unit: "sqm", size: "20 × 23 cm", finish: "Matt", material: "Porcelain", pattern_key: "hex", color_hex: "#45454a", accent_hex: "#2b2b2f", featured: false, box: 0.92 },
  { cat: "outdoor", slug: "slate-terrace", name: "Slate Terrace R11", description: "Natural slate texture with R11 anti-slip rating. Rated for pools, patios and driveways.", price: 360, sku: "AGY-OT-001", stock: 820, unit: "sqm", size: "60 × 60 cm", finish: "Anti-slip", material: "Porcelain 20mm", pattern_key: "slate", color_hex: "#7a7b80", accent_hex: "#56575c", featured: true, box: 0.72 },
  { cat: "outdoor", slug: "stone-sand-r11", name: "Sand Stone R11", description: "Warm sandstone tone that stays cool underfoot in full sun. Frost and UV resistant.", price: 345, sku: "AGY-OT-002", stock: 610, unit: "sqm", size: "60 × 90 cm", finish: "Anti-slip", material: "Porcelain 20mm", pattern_key: "slate", color_hex: "#cbbba4", accent_hex: "#a89577", featured: false, box: 1.08 },
];

const day = 86_400_000;
export const DEMO_PRODUCTS: Product[] = seeds.map((s, i) => {
  const { cat: c, was, box, ...rest } = s;
  const category = DEMO_CATEGORIES.find((x) => x.slug === c)!;
  return {
    ...rest,
    id: `prod-${i + 1}`,
    category_id: category.id,
    category: { id: category.id, slug: category.slug, name: category.name },
    compare_at_price: was ?? null,
    coverage_per_box: box ?? 1.44,
    image_url: null,
    active: true,
    created_at: new Date(Date.now() - (seeds.length - i) * day * 3).toISOString(),
  };
});
