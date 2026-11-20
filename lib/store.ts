import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { isDemo, PHOTOS_ONLY } from "./config";
import { cache } from "react";
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from "./demo-data";
import { DEFAULT_SETTINGS, type Settings } from "./settings";
import type {
  Address, Category, Order, OrderDetail, OrderItem, OrderStatus, PaymentMethod, Product,
} from "./types";

/* ───────────────────────── Fallback sample catalogue (in memory; read-only for shoppers) ───────────────────────── */

interface DemoState {
  categories: Category[];
  settings: Settings;
  products: Product[];
  orders: OrderDetail[];
  seq: number;
}

const g = globalThis as unknown as { __agyapaDemo?: DemoState };
function demo(): DemoState {
  if (!g.__agyapaDemo) {
    const products = structuredClone(DEMO_PRODUCTS);
    g.__agyapaDemo = { categories: structuredClone(DEMO_CATEGORIES), settings: { ...DEFAULT_SETTINGS }, products, orders: [], seq: 100250 };
  }
  return g.__agyapaDemo;
}

/* ───────────────────────── Auth helpers ───────────────────────── */

export interface SessionUser { id: string; email: string; full_name: string | null; role: "customer" | "admin" }

export async function getCurrentUser(): Promise<SessionUser | null> {
  if (isDemo) return null;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();
  return { id: user.id, email: user.email ?? "", full_name: profile?.full_name ?? null, role: (profile?.role as "customer" | "admin") ?? "customer" };
}

/** Throws a redirect unless the caller is a signed-in admin (there is no demo/bypass account). Call at the top of every admin page and action. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/");
  return user;
}

/* ───────────────────────── Catalogue ───────────────────────── */

export interface ProductQuery {
  category?: string; q?: string; sort?: string; finish?: string; size?: string; featured?: boolean;
  inStock?: boolean; tilesOnly?: boolean; min?: number; max?: number; limit?: number;
}
export const PAGE_SIZE = 24;

const PRODUCT_SELECT = "*, category:categories(id, slug, name)";
const PRODUCT_SELECT_INNER = "*, category:categories!inner(id, slug, name)";

/** "60x60" / "60*60" / "60 X 60" all become "60 × 60", matching how sizes are written in product names. */
const normalizeQuery = (q: string) => q.trim().replace(/(\d)\s*[x×*]\s*(\d)/gi, "$1 × $2");

function sortProducts(list: Product[], sort?: string) {
  const s = [...list];
  switch (sort) {
    case "price-asc": return s.sort((a, b) => a.price - b.price);
    case "price-desc": return s.sort((a, b) => b.price - a.price);
    case "newest": return s.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    default: // featured first, then what's in stock, then A–Z
      return s.sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.stock > 0) - Number(a.stock > 0) || a.name.localeCompare(b.name));
  }
}

function filterDemo(list: Product[], query: ProductQuery) {
  let out = PHOTOS_ONLY ? list.filter((p) => Boolean(p.image_url)) : list;
  if (query.category) out = out.filter((p) => p.category?.slug === query.category);
  if (query.finish) out = out.filter((p) => p.finish?.toLowerCase() === query.finish!.toLowerCase());
  if (query.size) out = out.filter((p) => p.size === query.size);
  if (query.featured) out = out.filter((p) => p.featured);
  if (query.inStock) out = out.filter((p) => p.stock > 0);
  if (query.tilesOnly) out = out.filter((p) => p.coverage_per_box > 0);
  if (query.min != null) out = out.filter((p) => p.price >= query.min!);
  if (query.max != null) out = out.filter((p) => p.price <= query.max!);
  if (query.q) {
    const n = normalizeQuery(query.q).toLowerCase();
    out = out.filter((p) => [p.name, p.sku, p.description, p.finish, p.size, p.category?.name].join(" ").toLowerCase().includes(n));
  }
  return out;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyDb(req: any, query: ProductQuery) {
  if (PHOTOS_ONLY) req = req.not("image_url", "is", null);
  if (query.category) req = req.eq("category.slug", query.category);
  if (query.featured) req = req.eq("featured", true);
  if (query.finish) req = req.ilike("finish", query.finish);
  if (query.size) req = req.eq("size", query.size);
  if (query.inStock) req = req.gt("stock", 0);
  if (query.tilesOnly) req = req.gt("coverage_per_box", 0);
  if (query.min != null) req = req.gte("price", query.min);
  if (query.max != null) req = req.lte("price", query.max);
  if (query.q) {
    const safe = normalizeQuery(query.q).replace(/[%,()]/g, " ");
    req = req.or(`name.ilike.%${safe}%,sku.ilike.%${safe}%,description.ilike.%${safe}%`);
  }
  switch (query.sort) {
    case "price-asc": return req.order("price");
    case "price-desc": return req.order("price", { ascending: false });
    case "newest": return req.order("created_at", { ascending: false });
    default: return req.order("featured", { ascending: false }).order("stock", { ascending: false }).order("name");
  }
}

export async function getCategories(): Promise<Category[]> {
  if (isDemo) return [...demo().categories].sort((a, b) => a.sort_order - b.sort_order);
  const sb = await createClient();
  const { data } = await sb.from("categories").select("*").order("sort_order");
  return (data ?? []) as Category[];
}

/** One page of the shop listing, plus the total number of matches. */
export async function getProductsPage(query: ProductQuery, page = 1, pageSize = PAGE_SIZE): Promise<{ items: Product[]; total: number }> {
  const from = (Math.max(1, page) - 1) * pageSize;
  if (isDemo) {
    const list = sortProducts(filterDemo(demo().products.filter((p) => p.active), query), query.sort);
    return { items: list.slice(from, from + pageSize), total: list.length };
  }
  const sb = await createClient();
  const req = sb.from("products").select(query.category ? PRODUCT_SELECT_INNER : PRODUCT_SELECT, { count: "exact" }).eq("active", true);
  const { data, count } = await applyDb(req, query).range(from, from + pageSize - 1);
  return { items: (data ?? []) as unknown as Product[], total: count ?? 0 };
}

/** Categories to show on the storefront: while PHOTOS_ONLY is on, only those that have at least one visible product. */
export async function getStoreCategories(): Promise<Category[]> {
  const cats = await getCategories();
  if (!PHOTOS_ONLY) return cats;
  const ids = new Set<string>();
  if (isDemo) demo().products.forEach((p) => p.active && p.image_url && p.category_id && ids.add(p.category_id));
  else {
    const sb = await createClient();
    const { data } = await sb.from("products").select("category_id").eq("active", true).not("image_url", "is", null).limit(1000);
    (data ?? []).forEach((r) => r.category_id && ids.add(r.category_id));
  }
  return cats.filter((c) => ids.has(c.id));
}

/** A short list (home page, related items, calculator). Always bounded. */
export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  const limit = Math.min(query.limit ?? 100, 500);
  if (isDemo) return sortProducts(filterDemo(demo().products.filter((p) => p.active), query), query.sort).slice(0, limit);
  const sb = await createClient();
  const req = sb.from("products").select(query.category ? PRODUCT_SELECT_INNER : PRODUCT_SELECT).eq("active", true);
  const { data } = await applyDb(req, query).limit(limit);
  return (data ?? []) as unknown as Product[];
}

export async function countProducts(): Promise<number> {
  if (isDemo) return demo().products.filter((p) => p.active && (!PHOTOS_ONLY || p.image_url)).length;
  const sb = await createClient();
  const base = sb.from("products").select("id", { count: "exact", head: true }).eq("active", true);
  const { count } = PHOTOS_ONLY ? await base.not("image_url", "is", null) : await base;
  return count ?? 0;
}

/** One representative product per category (used to colour the homepage collection cards). */
export async function getCategorySamples(): Promise<Record<string, Product>> {
  const list = await getProducts({ limit: 500, inStock: true });
  const out: Record<string, Product> = {};
  for (const p of list) if (p.category_id && !out[p.category_id]) out[p.category_id] = p;
  return out;
}

export async function getProduct(slug: string): Promise<Product | null> {
  if (isDemo) return demo().products.find((p) => p.slug === slug && p.active) ?? null;
  const sb = await createClient();
  const { data } = await sb.from("products").select(PRODUCT_SELECT).eq("slug", slug).eq("active", true).maybeSingle();
  return (data as Product) ?? null;
}

export async function getRelated(product: Product, limit = 4): Promise<Product[]> {
  const same = (await getProducts({ category: product.category?.slug, inStock: true, limit: limit + 1 })).filter((p) => p.id !== product.id);
  if (same.length >= limit) return same.slice(0, limit);
  const rest = (await getProducts({ inStock: true, limit: 12 })).filter((p) => p.id !== product.id && !same.some((s) => s.id === p.id));
  return [...same, ...rest].slice(0, limit);
}

/** Sizes that exist in the catalogue (for the shop filter). */
export async function getSizes(): Promise<string[]> {
  const base = isDemo ? demo().products.filter((p) => p.active && p.coverage_per_box > 0 && (!PHOTOS_ONLY || p.image_url)).map((p) => p.size) : null;
  if (base) return [...new Set(base.filter(Boolean) as string[])].sort();
  const sb = await createClient();
  const { data } = await sb.from("products").select("size, image_url").eq("active", true).gt("coverage_per_box", 0).not("size", "is", null).limit(1000);
  if (PHOTOS_ONLY) return [...new Set((data ?? []).filter((r) => r.image_url).map((r) => r.size as string))].sort();
  return [...new Set((data ?? []).map((r) => r.size as string))].sort();
}

/* ───────────────────────── Orders (customer) ───────────────────────── */

export interface CreateOrderInput {
  email: string; full_name: string; phone: string; address: Address;
  payment_method: PaymentMethod; notes?: string; items: { product_id: string; quantity: number }[];
}

export async function createOrder(input: CreateOrderInput): Promise<{ order_number: string; total: number }> {
  if (isDemo) throw new Error("Online ordering is temporarily unavailable. Please call us to place your order.");
  const sb = await createClient();
  const { data, error } = await sb.rpc("create_order", {
    p_email: input.email, p_full_name: input.full_name, p_phone: input.phone, p_address: input.address,
    p_payment_method: input.payment_method, p_notes: input.notes ?? null, p_items: input.items,
  });
  if (error) {
    // P0001 = raise exception inside create_order(): written to be customer-safe. Anything else stays generic.
    throw new Error(error.code === "P0001" ? error.message : "We could not place your order. Please try again.");
  }
  return data as { order_number: string; total: number };
}

export async function trackOrder(number: string, email: string): Promise<OrderDetail | null> {
  if (isDemo) {
    return demo().orders.find((o) => o.order.order_number.toUpperCase() === number.trim().toUpperCase() && o.order.email.toLowerCase() === email.trim().toLowerCase()) ?? null;
  }
  const sb = await createClient();
  const { data } = await sb.rpc("track_order", { p_number: number, p_email: email });
  return (data as OrderDetail) ?? null;
}

export async function getMyOrders(): Promise<OrderDetail[]> {
  if (isDemo) return [];
  const sb = await createClient();
  const { data } = await sb.from("orders").select("*, items:order_items(*), events:order_events(*)").order("created_at", { ascending: false });
  return ((data ?? []) as (Order & { items: OrderItem[]; events: OrderDetail["events"] })[]).map(({ items, events, ...order }) => ({
    order, items, events: events.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at)),
  }));
}

/* ───────────────────────── Admin ───────────────────────── */

async function allOrders(): Promise<OrderDetail[]> {
  if (isDemo) return demo().orders;
  const sb = await createClient();
  const { data } = await sb.from("orders").select("*, items:order_items(*), events:order_events(*)").order("created_at", { ascending: false }).limit(1000);
  return ((data ?? []) as (Order & { items: OrderItem[]; events: OrderDetail["events"] })[]).map(({ items, events, ...order }) => ({
    order, items, events: events.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at)),
  }));
}

export async function adminListOrders(opts: { status?: string; q?: string } = {}): Promise<OrderDetail[]> {
  await requireAdmin();
  let list = await allOrders();
  if (opts.status && opts.status !== "all") list = list.filter((o) => o.order.status === opts.status);
  if (opts.q) {
    const n = opts.q.toLowerCase();
    list = list.filter((o) => [o.order.order_number, o.order.full_name, o.order.email, o.order.phone].join(" ").toLowerCase().includes(n));
  }
  return list;
}

export async function adminGetOrder(id: string): Promise<OrderDetail | null> {
  await requireAdmin();
  return (await allOrders()).find((o) => o.order.id === id) ?? null;
}

export async function adminUpdateOrder(id: string, status: OrderStatus, message: string, paymentStatus?: Order["payment_status"]) {
  await requireAdmin();
  if (isDemo) {
    const o = demo().orders.find((x) => x.order.id === id);
    if (!o) throw new Error("Order not found");
    if (status === "cancelled" && o.order.status !== "cancelled") {
      o.items.forEach((i) => { const p = demo().products.find((x) => x.id === i.product_id); if (p) p.stock += i.quantity; });
    }
    const changed = o.order.status !== status;
    o.order.status = status;
    if (paymentStatus) o.order.payment_status = paymentStatus;
    if (changed || message.trim()) o.events.push({ id: crypto.randomUUID(), status, message: message.trim() || null, created_at: new Date().toISOString() });
    return;
  }
  const sb = await createClient();
  const { error } = await sb.rpc("admin_update_order", { p_order_id: id, p_status: status, p_message: message, p_payment_status: paymentStatus ?? null });
  if (error) throw new Error(error.message);
}

export interface AdminProductQuery { q?: string; category?: string; stock?: "out" | "low" | "hidden"; page?: number; pageSize?: number }

export async function adminListProducts(opts: AdminProductQuery = {}): Promise<{ items: Product[]; total: number }> {
  await requireAdmin();
  const pageSize = opts.pageSize ?? 40, from = (Math.max(1, opts.page ?? 1) - 1) * pageSize;
  if (isDemo) {
    let list = demo().products;
    if (opts.category) list = list.filter((p) => p.category?.slug === opts.category);
    if (opts.stock === "out") list = list.filter((p) => p.active && p.stock === 0);
    if (opts.stock === "low") list = list.filter((p) => p.active && p.stock > 0 && p.stock <= 10);
    if (opts.stock === "hidden") list = list.filter((p) => !p.active);
    if (opts.q) { const n = normalizeQuery(opts.q).toLowerCase(); list = list.filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(n)); }
    list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return { items: list.slice(from, from + pageSize), total: list.length };
  }
  const sb = await createClient();
  let req = sb.from("products").select(opts.category ? PRODUCT_SELECT_INNER : PRODUCT_SELECT, { count: "exact" });
  if (opts.category) req = req.eq("category.slug", opts.category);
  if (opts.stock === "out") req = req.eq("active", true).eq("stock", 0);
  if (opts.stock === "low") req = req.eq("active", true).gt("stock", 0).lte("stock", 10);
  if (opts.stock === "hidden") req = req.eq("active", false);
  if (opts.q) { const safe = normalizeQuery(opts.q).replace(/[%,()]/g, " "); req = req.or(`name.ilike.%${safe}%,sku.ilike.%${safe}%`); }
  const { data, count } = await req.order("name").range(from, from + pageSize - 1);
  return { items: (data ?? []) as unknown as Product[], total: count ?? 0 };
}

export async function adminGetProduct(id: string): Promise<Product | null> {
  await requireAdmin();
  if (isDemo) return demo().products.find((p) => p.id === id) ?? null;
  const sb = await createClient();
  const { data } = await sb.from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle();
  return (data as Product) ?? null;
}

export type ProductInput = Omit<Product, "id" | "category" | "created_at">;

export async function adminSaveProduct(id: string | null, input: ProductInput): Promise<string> {
  await requireAdmin();
  if (isDemo) {
    const d = demo();
    const category = DEMO_CATEGORIES.find((c) => c.id === input.category_id);
    const cat = category ? { id: category.id, slug: category.slug, name: category.name } : null;
    if (id) {
      const p = d.products.find((x) => x.id === id);
      if (!p) throw new Error("Product not found");
      Object.assign(p, input, { category: cat });
      return id;
    }
    const created: Product = { ...input, id: `prod-${crypto.randomUUID().slice(0, 8)}`, category: cat, created_at: new Date().toISOString() };
    d.products.unshift(created);
    return created.id;
  }
  const sb = await createClient();
  if (id) {
    const { error } = await sb.from("products").update(input).eq("id", id);
    if (error) throw new Error(error.message);
    return id;
  }
  const { data, error } = await sb.from("products").insert(input).select("id").single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function adminDeleteProduct(id: string) {
  await requireAdmin();
  if (isDemo) { const d = demo(); d.products = d.products.filter((p) => p.id !== id); return; }
  const sb = await createClient();
  const { error } = await sb.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export interface Customer { email: string; name: string; phone: string; orders: number; spent: number; last: string }

export async function adminListCustomers(): Promise<Customer[]> {
  await requireAdmin();
  const map = new Map<string, Customer>();
  for (const { order } of await allOrders()) {
    const key = order.email.toLowerCase();
    const c = map.get(key) ?? { email: key, name: order.full_name, phone: order.phone, orders: 0, spent: 0, last: order.created_at };
    c.orders += 1;
    if (order.status !== "cancelled") c.spent += order.total;
    if (+new Date(order.created_at) > +new Date(c.last)) c.last = order.created_at;
    map.set(key, c);
  }
  return [...map.values()].sort((a, b) => b.spent - a.spent);
}

export async function adminStats() {
  await requireAdmin();
  const orders = await allOrders();
  const live = orders.filter((o) => o.order.status !== "cancelled");
  const revenue = live.reduce((s, o) => s + o.order.total, 0);
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (13 - i));
    return { key: d.toISOString().slice(0, 10), label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), revenue: 0, orders: 0 };
  });
  for (const o of live) {
    const k = new Date(o.order.created_at).toISOString().slice(0, 10);
    const bucket = days.find((d) => d.key === k);
    if (bucket) { bucket.revenue += o.order.total; bucket.orders += 1; }
  }
  const sold = new Map<string, { name: string; qty: number; revenue: number; pattern_key: Product["pattern_key"] | null; color_hex: string | null; accent_hex: string | null }>();
  for (const o of live) for (const i of o.items) {
    const s = sold.get(i.name) ?? { name: i.name, qty: 0, revenue: 0, pattern_key: i.pattern_key, color_hex: i.color_hex, accent_hex: i.accent_hex };
    s.qty += i.quantity; s.revenue += i.quantity * i.unit_price; sold.set(i.name, s);
  }
  const byStatus: Record<string, number> = {};
  orders.forEach((o) => { byStatus[o.order.status] = (byStatus[o.order.status] ?? 0) + 1; });
  const [low, out, hidden, total] = await Promise.all([
    adminListProducts({ stock: "low", pageSize: 6 }), adminListProducts({ stock: "out", pageSize: 1 }),
    adminListProducts({ stock: "hidden", pageSize: 1 }), adminListProducts({ pageSize: 1 }),
  ]);
  return {
    revenue,
    orderCount: orders.length,
    pending: orders.filter((o) => ["pending", "confirmed", "processing"].includes(o.order.status)).length,
    customers: new Set(orders.map((o) => o.order.email.toLowerCase())).size,
    avgOrder: live.length ? revenue / live.length : 0,
    days,
    topProducts: [...sold.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    byStatus,
    lowStock: [...low.items].sort((a, b) => a.stock - b.stock),
    soldOutCount: out.total, hiddenCount: hidden.total, productCount: total.total,
    recent: orders.slice(0, 6),
  };
}

/* ───────────────────────── Settings & categories ───────────────────────── */

export const getSettings = cache(async (): Promise<Settings> => {
  if (isDemo) return demo().settings;
  try {
    const sb = await createClient();
    const { data } = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (!data) return DEFAULT_SETTINGS;
    return {
      store_name: data.store_name, phone: data.phone, email: data.email, address: data.address,
      delivery_fee: Number(data.delivery_fee), free_delivery_threshold: Number(data.free_delivery_threshold),
    };
  } catch {
    return DEFAULT_SETTINGS; // table not created yet: never break the storefront
  }
});

export async function adminSaveSettings(input: Settings) {
  await requireAdmin();
  if (isDemo) { demo().settings = { ...input }; return; }
  const sb = await createClient();
  const { error } = await sb.from("site_settings").upsert({ id: 1, ...input, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

export type CategoryInput = Pick<Category, "slug" | "name" | "description" | "pattern_key" | "sort_order">;

export async function adminListCategories(): Promise<(Category & { productCount: number })[]> {
  await requireAdmin();
  const cats = await getCategories();
  const counts = new Map<string, number>();
  if (isDemo) demo().products.forEach((p) => p.category_id && counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1));
  else {
    const sb = await createClient();
    for (let from = 0; ; from += 1000) { // PostgREST returns at most 1000 rows per request
      const { data } = await sb.from("products").select("category_id").range(from, from + 999);
      (data ?? []).forEach((r) => r.category_id && counts.set(r.category_id, (counts.get(r.category_id) ?? 0) + 1));
      if (!data || data.length < 1000) break;
    }
  }
  return cats.map((c) => ({ ...c, productCount: counts.get(c.id) ?? 0 }));
}

export async function adminGetCategory(id: string): Promise<Category | null> {
  await requireAdmin();
  return (await getCategories()).find((c) => c.id === id) ?? null;
}

export async function adminSaveCategory(id: string | null, input: CategoryInput) {
  await requireAdmin();
  if (isDemo) {
    const d = demo();
    if (id) {
      const c = d.categories.find((x) => x.id === id);
      if (!c) throw new Error("Category not found");
      Object.assign(c, input);
      d.products.forEach((p) => { if (p.category_id === id) p.category = { id, slug: c.slug, name: c.name }; });
    } else {
      d.categories.push({ id: `cat-${crypto.randomUUID().slice(0, 8)}`, ...input });
    }
    return;
  }
  const sb = await createClient();
  const { error } = id ? await sb.from("categories").update(input).eq("id", id) : await sb.from("categories").insert(input);
  if (error) throw new Error(error.message);
}

export async function adminDeleteCategory(id: string) {
  await requireAdmin();
  if (isDemo) {
    const d = demo();
    d.categories = d.categories.filter((c) => c.id !== id);
    d.products.forEach((p) => { if (p.category_id === id) { p.category_id = null; p.category = null; } });
    return;
  }
  const sb = await createClient();
  const { error } = await sb.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Attach photos to products by product code (SKU). Returns how many matched and which codes did not. */
export async function adminAttachImages(entries: { sku: string; url: string }[]): Promise<{ matched: number; unmatched: string[] }> {
  await requireAdmin();
  let matched = 0; const unmatched: string[] = [];
  for (const { sku, url } of entries) {
    const code = sku.trim().toUpperCase();
    if (isDemo) {
      const p = demo().products.find((x) => (x.sku ?? "").toUpperCase() === code);
      if (p) { p.image_url = url; matched++; } else unmatched.push(sku);
      continue;
    }
    const sb = await createClient();
    const { data, error } = await sb.from("products").update({ image_url: url }).eq("sku", code).select("id");
    if (error) throw new Error(error.message);
    if (data && data.length) matched += data.length; else unmatched.push(sku);
  }
  return { matched, unmatched };
}
