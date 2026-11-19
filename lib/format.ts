export const money = (n: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 2 })
    .format(n)
    .replace(/ /g, " ");

export const moneyShort = (n: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 0 })
    .format(n)
    .replace(/ /g, " ");

export const dateShort = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

export const dateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");


/** "carton" -> "cartons" (not for sqm). Used with a quantity. */
export const unitLabel = (unit: string | null | undefined, qty: number) => {
  const u = unit || "piece";
  return u === "sqm" || qty === 1 ? u : `${u}s`;
};
