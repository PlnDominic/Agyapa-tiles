import { Providers } from "@/components/shop/Providers";
import { Navbar } from "@/components/shop/Navbar";
import { Footer } from "@/components/shop/Footer";
import { getCurrentUser, getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);
  return (
    <Providers settings={settings} nav={<Navbar user={user ? { name: user.full_name, admin: user.role === "admin" } : null} />}>
      <main className="min-h-screen pt-[60px]">{children}</main>
      <Footer settings={settings} />
    </Providers>
  );
}
