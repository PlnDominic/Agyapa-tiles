#!/usr/bin/env python3
"""
Builds the catalogue from the company's inventory spreadsheet.

  python3 scripts/build-inventory.py path/to/AGYAPA.xlsx

Writes:
  lib/inventory.json        (used by the storefront's fallback catalogue)
  supabase/seed.sql         (run in the Supabase SQL Editor after setup.sql)
Columns expected: Product Name | Retail(₵) | Quantity.   Prices are per carton for tiles, per piece otherwise.
"""
import json, re, sys, zlib
import openpyxl

SRC = sys.argv[1] if len(sys.argv) > 1 else "AGYAPA.xlsx"

CATS = [  # slug, name, description, pattern glyph, sort
    ("polished-tiles", "Polished Tiles", "High-gloss polished floor tiles in a wide range of marble and stone looks.", "marble"),
    ("rustic-tiles", "Rustic Tiles", "Textured rustic and anti-slip floor tiles for floors that work hard.", "slate"),
    ("wall-tiles", "Wall Tiles", "Glazed wall tiles for kitchens, bathrooms and feature walls.", "zellige"),
    ("floor-tiles", "Floor Tiles", "More floor tiles: wood-effect, matt and everyday ranges.", "cement"),
    ("toilets-basins", "Toilets & Basins", "Toilets, tanks, seats, basins and pedestals.", "sanitary"),
    ("taps-showers", "Taps & Showers", "Basin and kitchen taps, showers, mixers and sinks.", "tap"),
    ("mirrors-cabinets", "Mirrors & Cabinets", "Bathroom mirrors, smart mirrors and cabinets.", "mirror"),
    ("doors", "Doors", "Security, bathroom and wooden doors.", "door"),
    ("tile-accessories", "Tile Accessories", "Spacers, grout, strips and finishing products.", "accessory"),
    ("paint-tools", "Paint & Tools", "Paint, brushes, rollers and decorating tools.", "paint"),
    ("hardware", "Hardware", "Locks, keys, screws, hinges, handles and fittings.", "hardware"),
]
CAT_PATTERN = {c[0]: c[3] for c in CATS}

EXCLUDE = re.compile(r"^(ADVANCE PAYMENT|DEPOSIT|WALK IN OLD DEBT PAYMENT|TRANSPORTATION|RETURNED GOODS)", re.I)
TYPOS = {"MIRROW": "MIRROR", "MUDIUM": "MEDIUM", "SECULITY": "SECURITY", "STRENGHT": "STRENGTH", "ACCESSORIS": "ACCESSORIES",
         "CHORME": "CHROME", "SCRIPPER": "SCRAPER", "MORDEN": "MODERN", "PICS": "PCS", "KIRSITE": "ZINC"}
CODE_SIZE = {"44": "40 × 40", "66": "60 × 60", "33": "30 × 30", "36": "30 × 60", "612": "60 × 120", "212": "20 × 120", "24": "25 × 40", "46": "25 × 40", "40": "25 × 40"}
COVER = {"60 × 60": 1.44, "40 × 40": 1.6, "25 × 40": 1.5, "30 × 30": 0.99, "30 × 60": 1.44, "60 × 120": 1.44, "20 × 120": 1.2}
COLORS = [("WHITE", ("#f2f1ee", "#c9c6bf")), ("BLACK", ("#2a2a2e", "#d9d9dc")), ("GREY", ("#b9babd", "#6e6e73")), ("GRAY", ("#b9babd", "#6e6e73")),
          ("ASH", ("#c6c6c8", "#8a8a8f")), ("CREAM", ("#eee3cf", "#b9a37a")), ("BEIGE", ("#e3d5bd", "#a98f6a")), ("BROWN", ("#8a6a52", "#4d3a2c")),
          ("BLUE", ("#9fb8cf", "#5e7e9c")), ("PINK", ("#ecc9cf", "#b58a92")), ("RED", ("#b83430", "#7d2523")), ("CHAMPAGNE", ("#e6d7b8", "#b79f6a")),
          ("GOLD", ("#e8d9a8", "#b8963e")), ("SILVER", ("#d4d5d8", "#8b8d92"))]
MARBLE = [("#f1efe9", "#b9a37a"), ("#e6e6e8", "#8b8d94"), ("#d9d2c5", "#9c8a6b"), ("#2b2b2f", "#d9d9dc"), ("#cfc7bb", "#7d6f5c"), ("#f4f1ea", "#b5ada0"), ("#bdbdc0", "#6e6e73"), ("#e8d9c4", "#a98f6a")]
RUSTIC = [("#a99f92", "#7a7064"), ("#8b8f94", "#5d6166"), ("#c2b59e", "#9a8b6e"), ("#b3a08c", "#85735f"), ("#6f6e6c", "#444444"), ("#c9b79c", "#a58a63"), ("#9a6f55", "#6b4a38")]
WALL = [("#f3f1ec", "#cfc8ba"), ("#e9eef0", "#b9c6cc"), ("#efe6dc", "#c9b79f"), ("#dfe5de", "#aab7a8"), ("#ecdfe0", "#c9a9ab")]
WOOD = [("#c9a074", "#8a6238"), ("#6b4a34", "#3d2a1d"), ("#d8c7ad", "#a68e6a")]
GLYPH_BASE = "#efeff2"
GLYPH_ACCENT = {"door": "#6e6e73", "sanitary": "#8a8a8f", "tap": "#8a8a8f", "mirror": "#7d8a94", "paint": "#b83430", "hardware": "#6e6e73", "accessory": "#8a7f6a"}

h = lambda s: zlib.crc32(s.encode()) & 0xFFFFFFFF
def pick(lst, key): return lst[h(key) % len(lst)]
def slugify(s): return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

def clean(raw):
    s = re.sub(r"\s+", " ", raw.strip())
    for k, v in TYPOS.items(): s = re.sub(rf"\b{k}\b", v, s, flags=re.I)
    s = re.sub(r"(\d)(BATHROOM|BASIN|MIRROR|CABINET|DOOR)\b", r"\1 \2", s, flags=re.I)
    s = re.sub(r"\bDOOR(\d)", r"DOOR \1", s, flags=re.I)
    s = re.sub(r"(\d)\s*INCH\b", r"\1 INCH", s, flags=re.I)
    s = re.sub(r"\b(30)\s*[Xx]\s*0\b", r"30 × 30", s)
    s = re.sub(r"\bWOODRUSTIC\b", "WOOD RUSTIC", s, flags=re.I)
    s = re.sub(r"\bGY\b", "GREY", s, flags=re.I)
    s = re.sub(r"(\d+)\s*[Xx]\s*(\d+)\s*[Xx]\s*(\d+)(?:\s*CM)?", r"\1 × \2 × \3", s)
    s = re.sub(r"(?<![\d.])(\d{2,4})\s*[Xx]\s*(\d{1,4})(?![\d])", r"\1 × \2", s)
    s = re.sub(r"(?<![\d.])(20|25|30|40|60|120)\s*/\s*(20|30|40|60|120)(?![\d])", r"\1 × \2", s)
    out = []
    for tok in s.split(" "):
        if tok in ("×", "&", "-", "/") or re.search(r"\d", tok) or re.fullmatch(r"[A-Z]{1,3}", tok) and tok in ("WC", "SD", "BD", "PB", "LED", "TV", "MF", "MMG", "G1", "PVC", "H&C"):
            out.append(tok if not tok.isalpha() or tok in ("WC", "SD", "BD", "PB", "LED", "TV", "MF", "MMG", "PVC") else tok.title())
        elif "-" in tok and re.search(r"\d", tok): out.append(tok)
        else: out.append(tok[:1] + tok[1:].lower() if tok.isalpha() else tok.title() if tok.isupper() else tok)
    return " ".join(out)

def code_of(raw):
    first = re.split(r"[\s]", raw.strip())[0].strip("-").upper()
    first = re.sub(r"-+$", "", first)
    return first if re.search(r"\d", first) and re.fullmatch(r"[A-Z0-9][A-Z0-9\-_.]*", first) and len(first) >= 3 else None

def size_of(raw, code):
    m = re.search(r"(?<![\d.])(\d{2,3})\s*[Xx/*]\s*(\d{2,3})(?![\d])", raw)
    if m and not re.search(r"MIRROR|DOOR", raw, re.I):
        a, b = m.group(1).lstrip("0"), m.group(2)
        return f"{a} × {b}" if a != "50" or b != "120" else "60 × 120"
    if re.search(r"\b60\s?120\b|\b6012\b", raw): return "60 × 120"
    if re.search(r"2540|25\s?X\s?40|2X40", raw, re.I): return "25 × 40"
    if code:
        m = re.match(r"^[A-Z]{2,4}(\d{2,3})\d{3}", code)
        if m:
            for k in (m.group(1), m.group(1)[:2]):
                if k in CODE_SIZE: return CODE_SIZE[k]
    return None

def classify(raw):
    u = raw.upper()
    if re.search(r"\b(HANDLE|ENGINE|LOCKS?|KEY)\b", u) and "DOOR" in u or re.search(r"DOOR LOCK|PIN DOOR", u): return "hardware"
    if re.match(r"^(SD|BD)[- ]\d", u) or re.search(r"\bDOORS?\b|BATHDOOR|^BD-\d+ BATHROOM$", u): return "doors"
    if re.match(r"^(WC|PB|HB|WB)[- ]?\w", u) or re.search(r"\b(TOILET|WASHDOWN|SEAT COVERS|REDUCED (BASIN|PEDESTAL|WC)|REDUCED$)", u) and not re.search(r"CABINET|MIRROR", u):
        if re.match(r"^(CABINET)", u): return "mirrors-cabinets"
        return "toilets-basins"
    if re.search(r"MIRROR|CABINET|PICTURE FRAME|^BM-\d|^SM-\d", u): return "mirrors-cabinets"
    if re.search(r"FAUCET|SHOWER|^(BF|KF|KS|MX|SW|HSW)[- ]|SINK ACC|TV-003", u): return "taps-showers"
    if re.search(r"SPACER|GROUT|STRIPS?\b|CHEMICAL|FILLER", u): return "tile-accessories"
    if re.search(r"PAINT|ACRYLIC|COPPEN|BRUSH|ROLLER|SCRAPER|SCRIPPER|MASKING TAPE|SAW", u): return "paint-tools"
    isTile = (re.search(r"WALL TILE|RUSTIC|POLISH|TILE|ANTISLIP|WEAR RESISTANT|BABY SKIN|WOOD", u)
              or re.match(r"^[A-Z]{2,4}\d{2,3}\d{3,}[A-Z]*\b", u))
    if isTile:
        if "WALL" in u: return "wall-tiles"
        if re.search(r"POLISH|^YMP|^MBP", u): return "polished-tiles"
        if re.search(r"RUSTIC|ANTISLIP|ANTI-SLIP|INKJET|^FGC|^FGP", u): return "rustic-tiles"
        if re.match(r"^(CP[A-Z]|PM[A-Z]*)\d", u) or re.search(r"25\s?[X×]\s?40|2540|2X40", u): return "wall-tiles"
        return "floor-tiles"
    return "hardware"

def colors_for(name, cat, key):
    u = name.upper()
    named = next((c for k, c in COLORS if re.search(rf"\b{k}\b", u)), None)
    if cat in ("toilets-basins", "mirrors-cabinets", "taps-showers", "doors", "tile-accessories", "paint-tools", "hardware"):
        word = next((k for k, c in COLORS if c == named), None) if named else None
        if word == "BLACK": return ("#e4e4e8", "#2a2a2e")
        if word in ("BLUE", "PINK", "RED", "GOLD", "CHAMPAGNE", "BROWN"): return (GLYPH_BASE, named[1])
        return (GLYPH_BASE, GLYPH_ACCENT[CAT_PATTERN[cat]])
    if "WOOD" in u: return pick(WOOD, key)
    if named and cat != "rustic-tiles": return named
    if cat == "polished-tiles": return pick(MARBLE, key)
    if cat == "rustic-tiles": return pick(RUSTIC, key)
    if cat == "wall-tiles": return pick(WALL, key)
    return pick(MARBLE + RUSTIC, key)

def pattern_for(name, cat, key):
    if "WOOD" in name.upper(): return "wood"
    if cat in ("polished-tiles",): return "marble"
    if cat == "rustic-tiles": return "slate" if h(key) % 2 else "cement"
    if cat == "wall-tiles": return "zellige" if h(key) % 2 else "subway"
    if cat == "floor-tiles": return "cement" if h(key) % 2 else "marble"
    if cat == "toilets-basins" and re.search(r"BASIN|PEDESTAL", name.upper()): return "basin"
    return CAT_PATTERN[cat]

wb = openpyxl.load_workbook(SRC, data_only=True)
rows = [(str(r[0]).strip(), r[1], r[2]) for r in wb.active.iter_rows(min_row=2, values_only=True) if r[0]]
products, used_slug, used_sku, skipped, hidden = [], set(), set(), [], []
for raw, price, qty in rows:
    if EXCLUDE.match(raw): skipped.append(raw); continue
    price = float(price or 0); stock = max(0, int(qty or 0))
    cat = classify(raw)
    code = code_of(raw); size = size_of(raw, code)
    is_tile = cat in ("polished-tiles", "rustic-tiles", "wall-tiles", "floor-tiles")
    name = clean(raw)
    if is_tile and size and size.replace(" ", "") not in name.replace(" ", ""): name = f"{name} {size}"
    base = slugify(name) or "item"; slug = base; n = 2
    while slug in used_slug: slug = f"{base}-{n}"; n += 1
    used_slug.add(slug)
    sku = code or slug.upper()[:24]; s0 = sku; n = 2
    while sku in used_sku: sku = f"{s0}-{n}"; n += 1
    used_sku.add(sku)
    u = raw.upper()
    finish = ("Polished" if cat == "polished-tiles" else "Anti-slip" if re.search(r"ANTISLIP", u) else "Rustic" if cat == "rustic-tiles" else None)
    c1, c2 = colors_for(name, cat, slug)
    active = price > 10 or cat in ("paint-tools", "hardware", "tile-accessories")
    if not active: hidden.append((raw, price))
    unit = "carton" if is_tile else "piece"
    label = {"polished-tiles": "Polished floor tile", "rustic-tiles": "Rustic floor tile", "wall-tiles": "Wall tile", "floor-tiles": "Floor tile"}.get(cat)
    desc = (f"{label}{f', {size} cm' if size else ''}. Product code {code or sku}. Priced per carton." if is_tile
            else f"{dict((c[0], c[1]) for c in CATS)[cat].rstrip('s') if False else ''}Product code {code or sku}. Call us or visit the showroom to confirm availability.")
    products.append(dict(name=name, slug=slug, sku=sku, cat=cat, price=price, stock=stock, unit=unit, size=(size + " cm") if size else None,
                         finish=finish, pat=pattern_for(name, cat, slug), c1=c1, c2=c2, cov=COVER.get(size, 0) if is_tile else 0,
                         desc=desc, active=active, feat=False))
# featured: well-stocked tiles across the tile categories
pool = {k: sorted([p for p in products if p["cat"] == k and p["stock"] > 30 and p["active"]], key=lambda p: -p["stock"]) for k in ("polished-tiles", "rustic-tiles", "wall-tiles", "floor-tiles")}
for k, n in (("polished-tiles", 3), ("rustic-tiles", 2), ("wall-tiles", 2), ("floor-tiles", 1)):
    for p in pool[k][:n]: p["feat"] = True

json.dump({"categories": [dict(slug=s, name=n, description=d, pattern_key=p, sort_order=i + 1) for i, (s, n, d, p) in enumerate(CATS)], "products": products},
          open("lib/inventory.json", "w"), ensure_ascii=False, separators=(",", ":"))

q = lambda v: "null" if v is None else ("true" if v is True else "false" if v is False else str(v) if isinstance(v, (int, float)) else "'" + str(v).replace("'", "''") + "'")
sql = ["-- Agyapa Tiles inventory (generated by scripts/build-inventory.py). Safe to re-run: existing products are left untouched.",
       "-- Run AFTER setup.sql.", "",
       "insert into public.categories (slug, name, description, pattern_key, sort_order) values"]
sql.append(",\n".join(f"  ({q(s)}, {q(n)}, {q(d)}, {q(p)}, {i + 1})" for i, (s, n, d, p) in enumerate(CATS)))
sql.append("on conflict (slug) do update set name = excluded.name, description = excluded.description, pattern_key = excluded.pattern_key, sort_order = excluded.sort_order;\n")
cols = "name, slug, sku, cat, price, stock, unit, size, finish, pattern_key, color_hex, accent_hex, coverage_per_box, description, active, featured"
sql.append(f"insert into public.products (name, slug, sku, category_id, price, stock, unit, size, finish, pattern_key, color_hex, accent_hex, coverage_per_box, description, active, featured)")
sql.append("select v.name, v.slug, v.sku, c.id, v.price, v.stock, v.unit, v.size, v.finish, v.pattern_key, v.color_hex, v.accent_hex, v.coverage_per_box, v.description, v.active, v.featured")
sql.append("from (values")
vals = [f"  ({q(p['name'])}, {q(p['slug'])}, {q(p['sku'])}, {q(p['cat'])}, {p['price']:g}::numeric, {p['stock']}::int, {q(p['unit'])}, {q(p['size'])}::text, {q(p['finish'])}::text, {q(p['pat'])}, {q(p['c1'])}, {q(p['c2'])}, {p['cov']:g}::numeric, {q(p['desc'])}, {q(p['active'])}::boolean, {q(p['feat'])}::boolean)" for p in products]
sql.append(",\n".join(vals))
sql.append(") as v(name, slug, sku, cat, price, stock, unit, size, finish, pattern_key, color_hex, accent_hex, coverage_per_box, description, active, featured)")
sql.append("join public.categories c on c.slug = v.cat\non conflict (slug) do nothing;")
open("supabase/seed.sql", "w").write("\n".join(sql) + "\n")

import collections
print("products:", len(products), "| skipped (not products):", skipped)
print("hidden (price <= 10):", hidden)
print("by category:", collections.Counter(p["cat"] for p in products).most_common())
print("in stock:", sum(1 for p in products if p["stock"] > 0), "sold out:", sum(1 for p in products if p["stock"] == 0))
print("featured:", [p["name"] for p in products if p["feat"]])
