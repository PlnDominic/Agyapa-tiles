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

/** Demo mode: no Supabase credentials, so the catalogue + orders live in memory. Never open in production. */
export const isDemo = !isSupabaseConfigured;
export const demoAdminAllowed = process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_ADMIN === "true";

/** Hero background photo. Place your image at public/brand/hero-bg.jpg (landscape, ~2400px wide, dark works best). */
export const HERO_BACKGROUND = "/brand/hero-bg.jpg";

/**
 * Preview mode: while true, every link that leads away from the homepage is inert
 * (nav, buttons, cards, footer, bag). Set NEXT_PUBLIC_HOME_ONLY=false in the environment to go fully live.
 */
export const HOME_ONLY = process.env.NEXT_PUBLIC_HOME_ONLY !== "false";
