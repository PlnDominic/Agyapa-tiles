import Image from "next/image";
import { NavLink as Link } from "@/components/ui/NavLink";
import { telHref, type Settings } from "@/lib/settings";
import { MapPinIcon, PhoneIcon } from "@/components/ui/icons";

const cols = [
  { title: "Shop", links: [["All products", "/shop"], ["Polished tiles", "/shop?category=polished-tiles"], ["Rustic tiles", "/shop?category=rustic-tiles"], ["Wall tiles", "/shop?category=wall-tiles"], ["Toilets & basins", "/shop?category=toilets-basins"], ["Doors", "/shop?category=doors"]] },
  { title: "Support", links: [["Track your order", "/track"], ["Delivery & returns", "/#delivery"], ["Tile calculator", "/#calculator"], ["Contact us", "/#contact"]] },
  { title: "Account", links: [["Sign in", "/login"], ["My orders", "/account"], ["Your bag", "/cart"]] },
];

export function Footer({ settings }: { settings: Settings }) {
  return (
    <footer id="contact" className="mt-32 border-t border-steel-100 bg-steel-50">
      <div className="container-x grid gap-14 py-20 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Image src="/brand/logo-full.jpg" alt="Agyapa Tiles — we serve our customers best" width={260} height={167} className="h-auto w-56 mix-blend-multiply" />
          <ul className="mt-6 space-y-2 text-sm text-steel-600">
            <li className="flex items-center gap-2"><MapPinIcon width={16} height={16} className="text-brand-600" />{settings.address}</li>
            <li className="flex items-center gap-2"><PhoneIcon width={16} height={16} className="text-brand-600" /><a href={`tel:${telHref(settings.phone)}`} className="hover:text-brand-600">{settings.phone}</a></li>
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
          <p>© {new Date().getFullYear()} {settings.store_name}. All rights reserved.</p>
          <p>
            Developed By:{" "}
            <a href="https://www.ecstasytechnologies.com" target="_blank" rel="noopener noreferrer" className="font-medium text-steel-700 transition-colors hover:text-brand-600">Ecstasy Technologies</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
