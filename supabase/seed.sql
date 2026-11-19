-- Seed data for Agyapa Tiles (generated from lib/demo-data.ts). Safe to re-run.

insert into public.categories (slug, name, description, pattern_key, sort_order) values
  ('marble-look', 'Marble Look', 'The drama of natural stone, none of the upkeep.', 'marble', 1),
  ('wood-look', 'Wood Look', 'Warm timber character with porcelain durability.', 'wood', 2),
  ('terrazzo', 'Terrazzo', 'Playful chips and timeless composition.', 'terrazzo', 3),
  ('geometric', 'Geometric & Cement', 'Bold patterns that make a statement.', 'geometric', 4),
  ('wall-and-mosaic', 'Wall & Mosaic', 'Zellige, subway and hex for walls that glow.', 'zellige', 5),
  ('outdoor', 'Outdoor & Anti-slip', 'Built for terraces, pools and heavy footfall.', 'slate', 6)
on conflict (slug) do update set name = excluded.name, description = excluded.description, pattern_key = excluded.pattern_key, sort_order = excluded.sort_order;

insert into public.products (slug, name, description, category_id, price, compare_at_price, sku, stock, unit, size, finish, material, coverage_per_box, pattern_key, color_hex, accent_hex, featured, active) values
  ('calacatta-oro-polished', 'Calacatta Oro', 'Luminous white ground with sweeping gold-grey veining. A polished porcelain slab that turns any hall into a gallery.', (select id from public.categories where slug = 'marble-look'), 485, 560, 'AGY-MB-001', 640, 'sqm', '60 × 120 cm', 'Polished', 'Porcelain', 1.44, 'marble', '#f4f2ee', '#b9a37a', true, true),
  ('nero-marquina-matt', 'Nero Marquina', 'Deep black with crisp white veins. Matt finish keeps it quiet, confident and easy to live with.', (select id from public.categories where slug = 'marble-look'), 520, null, 'AGY-MB-002', 410, 'sqm', '60 × 60 cm', 'Matt', 'Porcelain', 1.44, 'marble', '#26262a', '#e6e6e8', true, true),
  ('carrara-grey', 'Carrara Grey', 'Soft cloud-grey with fine silver veining. Calm, bright and endlessly versatile.', (select id from public.categories where slug = 'marble-look'), 395, null, 'AGY-MB-003', 880, 'sqm', '80 × 80 cm', 'Satin', 'Porcelain', 1.28, 'marble', '#dcdde0', '#8b8d94', false, true),
  ('oak-natural-plank', 'Natural Oak Plank', 'Honey oak grain captured in rectified porcelain. Barefoot warm, scratch-proof, water-proof.', (select id from public.categories where slug = 'wood-look'), 340, null, 'AGY-WD-001', 720, 'sqm', '20 × 120 cm', 'Textured', 'Porcelain', 1.2, 'wood', '#c9a074', '#8a6238', true, true),
  ('walnut-smoke', 'Smoked Walnut', 'Rich chocolate-brown planks with subtle smoked tonal shifts for a refined, enveloping feel.', (select id from public.categories where slug = 'wood-look'), 365, null, 'AGY-WD-002', 530, 'sqm', '20 × 120 cm', 'Textured', 'Porcelain', 1.2, 'wood', '#6b4a34', '#3d2a1d', false, true),
  ('terrazzo-graphite', 'Terrazzo Graphite', 'Dark graphite ground with bright mineral chips. High-contrast and unapologetically modern.', (select id from public.categories where slug = 'terrazzo'), 470, null, 'AGY-TZ-002', 190, 'sqm', '60 × 60 cm', 'Matt', 'Porcelain', 1.44, 'terrazzo', '#3c3c41', '#d9d9dc', false, true),
  ('cement-slate-grey', 'Studio Cement', 'Seamless micro-cement look in soft slate. Industrial calm for living spaces and offices.', (select id from public.categories where slug = 'geometric'), 310, null, 'AGY-GM-002', 960, 'sqm', '80 × 80 cm', 'Matt', 'Porcelain', 1.28, 'cement', '#b8b9bc', '#909195', false, true),
  ('zellige-bone', 'Zellige Bone', 'Handmade-look glazed relief with beautiful irregular light. Perfect for kitchens and bathrooms.', (select id from public.categories where slug = 'wall-and-mosaic'), 260, null, 'AGY-WL-001', 700, 'sqm', '10 × 10 cm', 'Glossy', 'Ceramic', 0.5, 'zellige', '#ede8de', '#c9c1b0', false, true),
  ('metro-white', 'Metro White', 'The perfect subway tile. Bevelled edges, gloss white, clean lines.', (select id from public.categories where slug = 'wall-and-mosaic'), 190, null, 'AGY-WL-003', 1500, 'sqm', '7.5 × 15 cm', 'Glossy', 'Ceramic', 1, 'subway', '#f7f7f7', '#d6d6d8', false, true),
  ('hex-charcoal', 'Hex Charcoal', 'Honeycomb hexagons in deep charcoal for bold floors and feature walls.', (select id from public.categories where slug = 'wall-and-mosaic'), 330, null, 'AGY-WL-004', 380, 'sqm', '20 × 23 cm', 'Matt', 'Porcelain', 0.92, 'hex', '#45454a', '#2b2b2f', false, true),
  ('slate-terrace', 'Slate Terrace R11', 'Natural slate texture with R11 anti-slip rating. Rated for pools, patios and driveways.', (select id from public.categories where slug = 'outdoor'), 360, null, 'AGY-OT-001', 820, 'sqm', '60 × 60 cm', 'Anti-slip', 'Porcelain 20mm', 0.72, 'slate', '#7a7b80', '#56575c', true, true),
  ('stone-sand-r11', 'Sand Stone R11', 'Warm sandstone tone that stays cool underfoot in full sun. Frost and UV resistant.', (select id from public.categories where slug = 'outdoor'), 345, null, 'AGY-OT-002', 610, 'sqm', '60 × 90 cm', 'Anti-slip', 'Porcelain 20mm', 1.08, 'slate', '#cbbba4', '#a89577', false, true)
on conflict (slug) do nothing;

