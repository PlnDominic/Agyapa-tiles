"use client";

import { MotionConfig } from "motion/react";
import { CartProvider } from "./CartProvider";
import { CartDrawer } from "./CartDrawer";
import { ScrollProgress } from "@/components/ui/motion";
import type { Settings } from "@/lib/settings";

export function Providers({ children, nav, settings }: { children: React.ReactNode; nav: React.ReactNode; settings: Settings }) {
  return (
    <MotionConfig reducedMotion="user">
      <CartProvider settings={settings}>
        <ScrollProgress />
        {nav}
        {children}
        <CartDrawer />
      </CartProvider>
    </MotionConfig>
  );
}
