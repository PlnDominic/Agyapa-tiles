"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { signOut } from "@/app/auth/actions";
import { ChartIcon, GridIcon, LayersIcon, PackageIcon, SettingsIcon, StoreIcon, UsersIcon } from "@/components/ui/icons";

const items = [
  { href: "/admin", label: "Overview", icon: ChartIcon, exact: true },
  { href: "/admin/orders", label: "Orders", icon: PackageIcon },
  { href: "/admin/products", label: "Products", icon: GridIcon },
  { href: "/admin/categories", label: "Categories", icon: LayersIcon },
  { href: "/admin/customers", label: "Customers", icon: UsersIcon },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export function AdminNav({ name }: { name: string }) {
  const path = usePathname();
  return (
    <aside className="border-b border-steel-100 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-3 px-5 py-4 lg:flex-col lg:items-stretch lg:gap-8 lg:px-5 lg:py-7">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image src="/brand/logo-mark.png" alt="" width={44} height={40} className="h-8 w-auto" />
          <span className="leading-tight"><b className="block text-[0.9375rem] font-extrabold tracking-[-0.03em]">AGYAPA</b><span className="text-[11px] font-medium uppercase tracking-[0.14em] text-steel-500">Admin</span></span>
        </Link>
        <nav className="hide-scrollbar flex flex-1 gap-1 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Admin">
          {items.map((it) => {
            const active = it.exact ? path === it.href : path.startsWith(it.href);
            return (
              <Link key={it.href} href={it.href} className={clsx("flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors", active ? "bg-brand-50 text-brand-700" : "text-steel-600 hover:bg-steel-50 hover:text-steel-900")}>
                <it.icon width={18} height={18} />{it.label}
              </Link>
            );
          })}
          <form action={signOut} className="shrink-0 lg:hidden"><button className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-steel-600 hover:bg-steel-50">Sign out</button></form>
        </nav>
        <div className="hidden space-y-1 border-t border-steel-100 pt-4 lg:block">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-steel-600 hover:bg-steel-50"><StoreIcon width={18} height={18} />View storefront</Link>
          <form action={signOut}><button className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-steel-600 hover:bg-steel-50"><UsersIcon width={18} height={18} />Sign out</button></form>
          <p className="truncate px-3.5 pt-2 text-xs text-steel-500">{name}</p>
        </div>
      </div>
    </aside>
  );
}
