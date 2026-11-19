"use client";

import { MotionConfig } from "motion/react";
import { CartProvider } from "./CartProvider";
import { CartDrawer } from "./CartDrawer";
import { ScrollProgress } from "@/components/ui/motion";

export function Providers({ children, nav }: { children: React.ReactNode; nav: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <CartProvider>
        <ScrollProgress />
        {nav}
        {children}
        <CartDrawer />
      </CartProvider>
    </MotionConfig>
  );
}
