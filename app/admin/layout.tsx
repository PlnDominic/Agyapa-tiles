import type { Metadata } from "next";
import { MotionConfig } from "motion/react";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/store";
import { isDemo } from "@/lib/config";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Agyapa Admin" }, robots: { index: false } };

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-white lg:flex">
        <AdminNav name={user.full_name ?? user.email} />
        <div className="min-w-0 flex-1">
          {isDemo && (
            <div className="bg-steel-900 px-5 py-2 text-center text-xs font-medium text-white">
              Demo mode: data lives in memory and resets on restart. Add Supabase keys to <code className="rounded bg-white/10 px-1">.env.local</code> to go live.
            </div>
          )}
          <div className="mx-auto max-w-[1180px] px-5 py-8 md:px-10 md:py-12">{children}</div>
        </div>
      </div>
    </MotionConfig>
  );
}
