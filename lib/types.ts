export type PatternKey =
  | "marble" | "terrazzo" | "wood" | "geometric" | "hex" | "subway"
  | "slate" | "cement" | "herringbone" | "zellige";

export const PATTERNS: PatternKey[] = [
  "marble", "terrazzo", "wood", "geometric", "hex", "subway", "slate", "cement", "herringbone", "zellige",
];

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  pattern_key: PatternKey;
  sort_order: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category_id: string | null;
  category?: Pick<Category, "id" | "slug" | "name"> | null;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  stock: number;
  unit: string;
  size: string | null;
  finish: string | null;
  material: string | null;
  coverage_per_box: number;
  pattern_key: PatternKey;
  color_hex: string;
  accent_hex: string;
  image_url: string | null;
  featured: boolean;
  active: boolean;
  created_at: string;
}

export const ORDER_STATUSES = [
  "pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number] | "cancelled";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Order placed",
  confirmed: "Confirmed",
  processing: "Preparing",
  shipped: "Dispatched",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_HELP: Record<OrderStatus, string> = {
  pending: "We have your order and will confirm it shortly.",
  confirmed: "Your order is confirmed and reserved for you.",
  processing: "Your tiles are being inspected and carefully packed.",
  shipped: "Your order has left our warehouse.",
  out_for_delivery: "Our driver is on the way to you today.",
  delivered: "Delivered. Enjoy your new space.",
  cancelled: "This order was cancelled.",
};

export type PaymentMethod = "cod" | "momo" | "bank";
export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cod: "Pay on delivery",
  momo: "Mobile Money",
  bank: "Bank transfer",
};

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  region: string;
  landmark?: string;
}

export interface OrderItem {
  id: string;
  product_id: string | null;
  name: string;
  sku: string | null;
  pattern_key: PatternKey | null;
  color_hex: string | null;
  accent_hex: string | null;
  unit: string | null;
  unit_price: number;
  quantity: number;
}

export interface OrderEvent {
  id: string;
  status: OrderStatus;
  message: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  full_name: string;
  phone: string;
  shipping_address: Address;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: "unpaid" | "paid" | "refunded";
  subtotal: number;
  shipping_fee: number;
  total: number;
  notes: string | null;
  created_at: string;
}

export interface OrderDetail {
  order: Order;
  items: OrderItem[];
  events: OrderEvent[];
}
