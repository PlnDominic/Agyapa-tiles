import Link from "next/link";
import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "dark" | "ghost" | "outline" | "light";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-[0_6px_20px_-6px_rgb(184_52_48/0.6)]",
  secondary: "bg-steel-100 text-steel-900 hover:bg-steel-200",
  dark: "bg-steel-900 text-white hover:bg-steel-800",
  light: "bg-white text-steel-900 hover:bg-steel-50",
  outline: "border border-steel-200 text-steel-900 hover:border-steel-900 bg-white",
  ghost: "text-brand-600 hover:bg-brand-50",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[0.9375rem]",
  lg: "h-14 px-8 text-[1.0625rem]",
};

export const btn = (variant: Variant = "primary", size: Size = "md", extra?: string) =>
  clsx(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.01em] whitespace-nowrap",
    "transition-[background,transform,box-shadow,color,border-color] duration-300 ease-[var(--ease-apple)]",
    "active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none select-none",
    variants[variant], sizes[size], extra,
  );

interface Common { variant?: Variant; size?: Size; className?: string; children: ReactNode }

export function Button({ variant, size, className, children, ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={btn(variant, size, className)} {...rest}>{children}</button>;
}

export function ButtonLink({ href, variant, size, className, children }: Common & { href: string }) {
  return <Link href={href} className={btn(variant, size, className)}>{children}</Link>;
}
