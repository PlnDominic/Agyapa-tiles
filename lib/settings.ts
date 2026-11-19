export interface Settings {
  store_name: string;
  phone: string;
  email: string | null;
  address: string;
  delivery_fee: number;
  free_delivery_threshold: number;
}

export const DEFAULT_SETTINGS: Settings = {
  store_name: "Agyapa Tiles",
  phone: "024 596 7229",
  email: null,
  address: "Afari, off Abuakwa – Bibiani Road, Ghana",
  delivery_fee: 120,
  free_delivery_threshold: 3000,
};

/** "024 596 7229" -> "+233245967229" for tel: links. */
export function telHref(phone: string) {
  const d = phone.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) return d;
  return d.startsWith("0") ? `+233${d.slice(1)}` : d;
}

export const deliveryFeeFor = (subtotal: number, s: Pick<Settings, "delivery_fee" | "free_delivery_threshold">) =>
  subtotal === 0 || subtotal >= s.free_delivery_threshold ? 0 : s.delivery_fee;
