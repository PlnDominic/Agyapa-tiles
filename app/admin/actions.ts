"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminDeleteProduct, adminSaveProduct, adminUpdateOrder, requireAdmin, type ProductInput } from "@/lib/store";
import { slugify } from "@/lib/format";
import { PATTERNS } from "@/lib/types";

export interface ActionState { ok?: boolean; error?: string }

const orderSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"]),
  message: z.string().trim().max(300).default(""),
  payment_status: z.enum(["unpaid", "paid", "refunded"]),
});

export async function updateOrderAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = orderSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: "Invalid update" };
  try {
    await adminUpdateOrder(parsed.data.id, parsed.data.status, parsed.data.message, parsed.data.payment_status);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not update order" };
  }
  revalidatePath("/admin", "layout");
  return { ok: true };
}

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex colour");
const productSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  slug: z.string().trim().max(140).optional(),
  description: z.string().trim().max(2000).default(""),
  category_id: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive").max(1_000_000),
  compare_at_price: z.string().optional(),
  sku: z.string().trim().max(60).optional(),
  stock: z.coerce.number().int().min(0).max(1_000_000),
  unit: z.string().trim().min(1).max(20).default("sqm"),
  size: z.string().trim().max(60).optional(),
  finish: z.string().trim().max(60).optional(),
  material: z.string().trim().max(60).optional(),
  coverage_per_box: z.coerce.number().min(0.01).max(100),
  pattern_key: z.enum(PATTERNS as [string, ...string[]]),
  color_hex: hex,
  accent_hex: hex,
  image_url: z.string().trim().url("Image must be a valid URL").optional().or(z.literal("")),
});

export async function saveProductAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "") || null;
  const parsed = productSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid product" };
  const d = parsed.data;
  const compare = d.compare_at_price ? Number(d.compare_at_price) : null;
  if (compare !== null && (Number.isNaN(compare) || compare < 0)) return { error: "Compare-at price is invalid" };
  const input: ProductInput = {
    name: d.name, slug: slugify(d.slug || d.name), description: d.description,
    category_id: d.category_id || null, price: d.price, compare_at_price: compare, sku: d.sku || null,
    stock: d.stock, unit: d.unit, size: d.size || null, finish: d.finish || null, material: d.material || null,
    coverage_per_box: d.coverage_per_box, pattern_key: d.pattern_key as ProductInput["pattern_key"],
    color_hex: d.color_hex, accent_hex: d.accent_hex, image_url: d.image_url || null,
    featured: fd.get("featured") === "on", active: fd.get("active") === "on",
  };
  try {
    await adminSaveProduct(id, input);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    return { error: /duplicate|unique/i.test(msg) ? "That slug or SKU is already used by another product" : msg || "Could not save product" };
  }
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function deleteProductAction(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (id) await adminDeleteProduct(id);
  revalidatePath("/", "layout");
  redirect("/admin/products");
}
