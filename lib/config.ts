export const SITE = {
  name: "Agyapa Tiles",
  tagline: "We serve our customers best",
  phone: "024 596 7229",
  phoneTel: "+233245967229",
  email: "hello@agyapatiles.com",
  address: "Afari, off Abuakwa – Bibiani Road, Ghana",
};

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/** No Supabase credentials: the storefront falls back to the built-in sample catalogue. Admin and accounts are never available in this state. */
export const isDemo = !isSupabaseConfigured;

/** Hero background photo. Place your image at public/brand/hero-bg.jpg (landscape, ~2400px wide, dark works best). */
export const HERO_BACKGROUND = "/brand/hero-bg.jpg";

/**
 * Preview mode: while true, every link that leads away from the homepage is inert
 * (nav, buttons, cards, footer, bag). Off by default; set NEXT_PUBLIC_HOME_ONLY=true in the environment to turn it on.
 */
export const HOME_ONLY = process.env.NEXT_PUBLIC_HOME_ONLY === "true";

/**
 * While true (default), the public storefront lists only products that have a real photo.
 * The admin still shows everything. Set NEXT_PUBLIC_SHOW_ALL_PRODUCTS=true to list the whole catalogue.
 */
export const PHOTOS_ONLY = process.env.NEXT_PUBLIC_SHOW_ALL_PRODUCTS !== "true";
