import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Agyapa Tiles — Premium tiles, delivered", template: "%s · Agyapa Tiles" },
  description: "Premium porcelain, marble-look, wood-look and outdoor tiles. Order online and track every step to your door.",
  icons: { icon: "/brand/logo-mark.png", apple: "/brand/logo-mark.png" },
  openGraph: { title: "Agyapa Tiles", description: "We serve our customers best.", type: "website" },
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
