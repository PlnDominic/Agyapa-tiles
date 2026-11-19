"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { PatternKey, Product } from "@/lib/types";
import { deliveryFeeFor, type Settings } from "@/lib/settings";

export interface CartLine {
  productId: string; slug: string; name: string; price: number; qty: number; unit: string;
  pattern: PatternKey; base: string; accent: string; stock: number; imageUrl: string | null; size: string | null;
}

interface CartCtx {
  lines: CartLine[]; count: number; subtotal: number; delivery: number; total: number;
  settings: Settings;
  open: boolean; setOpen: (v: boolean) => void; ready: boolean;
  add: (p: Product, qty?: number, openDrawer?: boolean) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "agyapa-bag-v1";

export function CartProvider({ children, settings }: { children: ReactNode; settings: Settings }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Hydrating from localStorage (an external store) can only happen after mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setLines(JSON.parse(raw));
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* ignore */ }
  }, [lines, ready]);

  const add = useCallback((p: Product, qty = 1, openDrawer = true) => {
    setLines((prev) => {
      const found = prev.find((l) => l.productId === p.id);
      if (found) return prev.map((l) => (l.productId === p.id ? { ...l, qty: Math.min(p.stock, l.qty + qty), stock: p.stock, price: p.price } : l));
      return [...prev, {
        productId: p.id, slug: p.slug, name: p.name, price: p.price, qty: Math.min(p.stock, qty), unit: p.unit,
        pattern: p.pattern_key, base: p.color_hex, accent: p.accent_hex, stock: p.stock, imageUrl: p.image_url, size: p.size,
      }];
    });
    if (openDrawer) setOpen(true);
  }, []);

  const setQty = useCallback((id: string, qty: number) =>
    setLines((prev) => prev.map((l) => (l.productId === id ? { ...l, qty: Math.max(1, Math.min(l.stock, qty)) } : l))), []);
  const remove = useCallback((id: string) => setLines((prev) => prev.filter((l) => l.productId !== id)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartCtx>(() => {
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const delivery = deliveryFeeFor(subtotal, settings);
    return { lines, count: lines.reduce((s, l) => s + l.qty, 0), subtotal, delivery, total: subtotal + delivery, settings, open, setOpen, ready, add, setQty, remove, clear };
  }, [lines, open, ready, add, setQty, remove, clear, settings]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside <CartProvider>");
  return c;
}
