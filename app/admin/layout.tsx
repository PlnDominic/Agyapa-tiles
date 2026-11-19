import type { Metadata } from "next";
import { MotionConfig } from "motion/react";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/store";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Agyapa Admin" }, robots: { index: false } };

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-white lg:flex">
        <AdminNav name={user.full_name ?? user.email} />
        <div className="min-w-0 flex-1 pb-28 lg:pb-0">
          <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 md:px-10 md:py-12">{children}</div>
        </div>
      </div>
    </MotionConfig>
  );
}
