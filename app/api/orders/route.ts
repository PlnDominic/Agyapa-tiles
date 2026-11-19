import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrder } from "@/lib/store";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(200),
  full_name: z.string().trim().min(2, "Please enter your full name").max(120),
  phone: z.string().trim().min(7, "Please enter a valid phone number").max(30),
  payment_method: z.enum(["cod", "momo", "bank"]),
  notes: z.string().trim().max(500).optional(),
  address: z.object({
    line1: z.string().trim().min(3, "Please enter your street address").max(200),
    line2: z.string().trim().max(200).optional(),
    city: z.string().trim().min(2, "Please enter your city").max(100),
    region: z.string().trim().min(2).max(100),
    landmark: z.string().trim().max(200).optional(),
  }),
  items: z.array(z.object({ product_id: z.string().min(1).max(64), quantity: z.number().int().min(1).max(10000) })).min(1, "Your bag is empty").max(50),
});

export async function POST(req: Request) {
  let json: unknown;
  try { json = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid details" }, { status: 400 });
  try {
    const result = await createOrder(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    // Messages from create_order() are written to be customer-safe (stock, availability).
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not place order" }, { status: 409 });
  }
}
