import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/config";
import { MapPinIcon, PhoneIcon } from "@/components/ui/icons";

const cols = [
  { title: "Shop", links: [["All tiles", "/shop"], ["Marble look", "/shop?category=marble-look"], ["Wood look", "/shop?category=wood-look"], ["Terrazzo", "/shop?category=terrazzo"], ["Outdoor", "/shop?category=outdoor"]] },
  { title: "Support", links: [["Track your order", "/track"], ["Delivery & returns", "/#delivery"], ["Tile calculator", "/#calculator"], ["Contact us", "/#contact"]] },
  { title: "Account", links: [["Sign in", "/login"], ["My orders", "/account"], ["Your bag", "/cart"]] },
];

export function Footer() {
  return (
    <footer id="contact" className="mt-32 border-t border-steel-100 bg-steel-50">
      <div className="container-x grid gap-14 py-20 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Image src="/brand/logo-full.jpg" alt="Agyapa Tiles — we serve our customers best" width={260} height={167} className="h-auto w-56 mix-blend-multiply" />
          <ul className="mt-6 space-y-2 text-sm text-steel-600">
            <li className="flex items-center gap-2"><MapPinIcon width={16} height={16} className="text-brand-600" />{SITE.address}</li>
            <li className="flex items-center gap-2"><PhoneIcon width={16} height={16} className="text-brand-600" />{SITE.phone}</li>
          </ul>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h3 className="text-sm font-semibold tracking-tight text-steel-900">{c.title}</h3>
            <ul className="mt-4 space-y-3">
              {c.links.map(([label, href]) => (
                <li key={label}><Link href={href} className="text-sm text-steel-600 transition-colors hover:text-brand-600">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-steel-200">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-steel-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Agyapa Tiles. All rights reserved.</p>
          <p>{SITE.tagline}.</p>
        </div>
      </div>
    </footer>
  );
}
