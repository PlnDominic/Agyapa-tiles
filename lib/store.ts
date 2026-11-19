import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { isDemo, demoAdminAllowed } from "./config";
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from "./demo-data";
import { deliveryFee } from "./format";
import type {
  Address, Category, Order, OrderDetail, OrderItem, OrderStatus, PaymentMethod, Product,
} from "./types";

/* ───────────────────────── Demo state (in memory) ───────────────────────── */

interface DemoState {
  products: Product[];
  orders: OrderDetail[];
  seq: number;
}

function seedOrders(products: Product[]): OrderDetail[] {
  const people = [
    ["Kwame Mensah", "kwame@example.com", "Accra", "Greater Accra"],
    ["Ama Serwaa", "ama@example.com", "Kumasi", "Ashanti"],
    ["Efua Boateng", "efua@example.com", "Takoradi", "Western"],
    ["Yaw Owusu", "yaw@example.com", "Tema", "Greater Accra"],
    ["Abena Quartey", "abena@example.com", "Cape Coast", "Central"],
    ["Kofi Annan Jr", "kofi@example.com", "Accra", "Greater Accra"],
    ["Nana Adjei", "nana@example.com", "Kumasi", "Ashanti"],
    ["Akosua Frimpong", "akosua@example.com", "Tamale", "Northern"],
  ];
  const statuses: OrderStatus[] = ["delivered", "delivered", "out_for_delivery", "shipped", "processing", "confirmed", "pending", "delivered"];
  const flow: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
  return people.map((p, i): OrderDetail => {
    const created = Date.now() - (i * 1.7 + 0.3) * 86_400_000;
    const picks = [products[(i * 3) % products.length], products[(i * 5 + 2) % products.length]];
    const items: OrderItem[] = picks.map((pr, j) => ({
      id: `oi-${i}-${j}`, product_id: pr.id, name: pr.name, sku: pr.sku, pattern_key: pr.pattern_key,
      color_hex: pr.color_hex, accent_hex: pr.accent_hex, unit: pr.unit, unit_price: pr.price, quantity: 12 + ((i * 7 + j * 11) % 40),
    }));
    const subtotal = items.reduce((s, it) => s + it.unit_price * it.quantity, 0);
    const fee = deliveryFee(subtotal);
    const status = statuses[i];
    const upto = flow.indexOf(status);
    return {
      order: {
        id: `ord-${i + 1}`, order_number: `AGY-${100241 + i}`, user_id: null, email: p[1], full_name: p[0], phone: "+233 24 555 01" + (10 + i),
        shipping_address: { line1: `${12 + i} Ring Road`, city: p[2], region: p[3] }, status,
        payment_method: (["momo", "cod", "bank"] as const)[i % 3], payment_status: status === "delivered" ? "paid" : "unpaid",
        subtotal, shipping_fee: fee, total: subtotal + fee, notes: null, created_at: new Date(created).toISOString(),
      },
      items,
      events: flow.slice(0, upto + 1).map((st, k) => ({
        id: `ev-${i}-${k}`, status: st, message: null, created_at: new Date(created + k * 6 * 3_600_000).toISOString(),
      })),
    };
  }).reverse();
}

const g = globalThis as unknown as { __agyapaDemo?: DemoState };
function demo(): DemoState {
  if (!g.__agyapaDemo) {
    const products = structuredClone(DEMO_PRODUCTS);
    g.__agyapaDemo = { products, orders: seedOrders(products), seq: 100250 };
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

/** Throws a redirect unless the caller is an admin. Use at the top of every admin page and action. */
export async function requireAdmin(): Promise<SessionUser> {
  if (isDemo) {
    if (!demoAdminAllowed) redirect("/");
    return { id: "demo", email: "demo@agyapatiles.com", full_name: "Demo Admin", role: "admin" };
  }
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/");
  return user;
}

/* ───────────────────────── Catalogue ───────────────────────── */

export interface ProductQuery {
  category?: string; q?: string; sort?: string; finish?: string; featured?: boolean; limit?: number; min?: number; max?: number;
}

const PRODUCT_SELECT = "*, category:categories(id, slug, name)";

function sortProducts(list: Product[], sort?: string) {
  const s = [...list];
  switch (sort) {
    case "price-asc": return s.sort((a, b) => a.price - b.price);
    case "price-desc": return s.sort((a, b) => b.price - a.price);
    case "newest": return s.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    default: return s.sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));
  }
}

export async function getCategories(): Promise<Category[]> {
  if (isDemo) return DEMO_CATEGORIES;
  const sb = await createClient();
  const { data } = await sb.from("categories").select("*").order("sort_order");
  return (data ?? []) as Category[];
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  if (isDemo) {
    let list = demo().products.filter((p) => p.active);
    if (query.category) list = list.filter((p) => p.category?.slug === query.category);
    if (query.finish) list = list.filter((p) => p.finish?.toLowerCase() === query.finish!.toLowerCase());
    if (query.featured) list = list.filter((p) => p.featured);
    if (query.min != null) list = list.filter((p) => p.price >= query.min!);
    if (query.max != null) list = list.filter((p) => p.price <= query.max!);
    if (query.q) {
      const n = query.q.toLowerCase();
      list = list.filter((p) => [p.name, p.description, p.material, p.finish, p.category?.name].join(" ").toLowerCase().includes(n));
    }
    list = sortProducts(list, query.sort);
    return query.limit ? list.slice(0, query.limit) : list;
  }
  const sb = await createClient();
  let req = sb.from("products").select(PRODUCT_SELECT).eq("active", true);
  if (query.featured) req = req.eq("featured", true);
  if (query.finish) req = req.ilike("finish", query.finish);
  if (query.min != null) req = req.gte("price", query.min);
  if (query.max != null) req = req.lte("price", query.max);
  if (query.q) {
    const safe = query.q.replace(/[%,()]/g, " ");
    req = req.or(`name.ilike.%${safe}%,description.ilike.%${safe}%,material.ilike.%${safe}%`);
  }
  const { data } = await req;
  let list = (data ?? []) as Product[];
  if (query.category) list = list.filter((p) => p.category?.slug === query.category);
  list = sortProducts(list, query.sort);
  return query.limit ? list.slice(0, query.limit) : list;
}

export async function getProduct(slug: string): Promise<Product | null> {
  if (isDemo) return demo().products.find((p) => p.slug === slug && p.active) ?? null;
  const sb = await createClient();
  const { data } = await sb.from("products").select(PRODUCT_SELECT).eq("slug", slug).eq("active", true).maybeSingle();
  return (data as Product) ?? null;
}

export async function getRelated(product: Product, limit = 4): Promise<Product[]> {
  const all = await getProducts({ category: product.category?.slug });
  const same = all.filter((p) => p.id !== product.id);
  if (same.length >= limit) return same.slice(0, limit);
  const rest = (await getProducts({ limit: 12 })).filter((p) => p.id !== product.id && !same.some((s) => s.id === p.id));
  return [...same, ...rest].slice(0, limit);
}

/* ───────────────────────── Orders (customer) ───────────────────────── */

export interface CreateOrderInput {
  email: string; full_name: string; phone: string; address: Address;
  payment_method: PaymentMethod; notes?: string; items: { product_id: string; quantity: number }[];
}

export async function createOrder(input: CreateOrderInput): Promise<{ order_number: string; total: number }> {
  if (isDemo) {
    const d = demo();
    let subtotal = 0;
    const lines: OrderItem[] = [];
    for (const it of input.items) {
      const p = d.products.find((x) => x.id === it.product_id && x.active);
      if (!p) throw new Error("A product in your bag is no longer available");
      if (p.stock < it.quantity) throw new Error(`Only ${p.stock} left of ${p.name}`);
      subtotal += p.price * it.quantity;
      lines.push({ id: crypto.randomUUID(), product_id: p.id, name: p.name, sku: p.sku, pattern_key: p.pattern_key, color_hex: p.color_hex, accent_hex: p.accent_hex, unit: p.unit, unit_price: p.price, quantity: it.quantity });
    }
    lines.forEach((l) => { d.products.find((x) => x.id === l.product_id)!.stock -= l.quantity; });
    const fee = deliveryFee(subtotal);
    const number = `AGY-${++d.seq}`;
    const now = new Date().toISOString();
    d.orders.unshift({
      order: {
        id: crypto.randomUUID(), order_number: number, user_id: null, email: input.email.toLowerCase(), full_name: input.full_name, phone: input.phone,
        shipping_address: input.address, status: "pending", payment_method: input.payment_method, payment_status: "unpaid",
        subtotal, shipping_fee: fee, total: subtotal + fee, notes: input.notes ?? null, created_at: now,
      },
      items: lines,
      events: [{ id: crypto.randomUUID(), status: "pending", message: "Order received. We will confirm it shortly.", created_at: now }],
    });
    return { order_number: number, total: subtotal + fee };
  }
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

export async function adminListProducts(): Promise<Product[]> {
  await requireAdmin();
  if (isDemo) return [...demo().products].sort((a, b) => a.name.localeCompare(b.name));
  const sb = await createClient();
  const { data } = await sb.from("products").select(PRODUCT_SELECT).order("name");
  return (data ?? []) as Product[];
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
  const products = await adminListProducts();
  return {
    revenue,
    orderCount: orders.length,
    pending: orders.filter((o) => ["pending", "confirmed", "processing"].includes(o.order.status)).length,
    customers: new Set(orders.map((o) => o.order.email.toLowerCase())).size,
    avgOrder: live.length ? revenue / live.length : 0,
    days,
    topProducts: [...sold.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    byStatus,
    lowStock: products.filter((p) => p.active && p.stock <= 200).sort((a, b) => a.stock - b.stock).slice(0, 6),
    recent: orders.slice(0, 6),
  };
}
