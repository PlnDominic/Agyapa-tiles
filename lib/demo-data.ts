import type { Category, PatternKey, Product } from "./types";
import inventory from "./inventory.json";

/**
 * Fallback catalogue (built from the company inventory by scripts/build-inventory.py).
 * Used only when Supabase isn't configured, so the storefront never renders empty.
 */
type Row = (typeof inventory.products)[number];

export const DEMO_CATEGORIES: Category[] = inventory.categories.map((c) => ({
  id: `cat-${c.slug}`, slug: c.slug, name: c.name, description: c.description, pattern_key: c.pattern_key as PatternKey, sort_order: c.sort_order,
}));

const catBySlug = new Map(DEMO_CATEGORIES.map((c) => [c.slug, c]));
const day = 86_400_000;

export const DEMO_PRODUCTS: Product[] = (inventory.products as Row[]).map((p, i) => {
  const c = catBySlug.get(p.cat)!;
  return {
    id: `prod-${i + 1}`, slug: p.slug, name: p.name, description: p.desc,
    category_id: c.id, category: { id: c.id, slug: c.slug, name: c.name },
    price: p.price, compare_at_price: null, sku: p.sku, stock: p.stock, unit: p.unit, size: p.size, finish: p.finish, material: null,
    coverage_per_box: p.cov, pattern_key: p.pat as PatternKey, color_hex: p.c1, accent_hex: p.c2, image_url: null,
    featured: p.feat, active: p.active, created_at: new Date(Date.now() - i * day / 6).toISOString(),
  };
});
