export const SITE = {
  name: "Agyapa Tiles",
  tagline: "We serve our customers best",
  phone: "+233 24 000 0000",
  email: "hello@agyapatiles.com",
  address: "Showroom & warehouse, Accra, Ghana",
};

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/** Demo mode: no Supabase credentials, so the catalogue + orders live in memory. Never open in production. */
export const isDemo = !isSupabaseConfigured;
export const demoAdminAllowed = process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_ADMIN === "true";
