import { Providers } from "@/components/shop/Providers";
import { Navbar } from "@/components/shop/Navbar";
import { Footer } from "@/components/shop/Footer";
import { getCurrentUser } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <Providers nav={<Navbar user={user ? { name: user.full_name, admin: user.role === "admin" } : null} />}>
      <main className="min-h-screen pt-[60px]">{children}</main>
      <Footer />
    </Providers>
  );
}
