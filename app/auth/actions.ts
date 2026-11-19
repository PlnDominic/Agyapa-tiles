"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isDemo } from "@/lib/config";

export async function signOut() {
  if (!isDemo) {
    const sb = await createClient();
    await sb.auth.signOut();
  }
  redirect("/");
}
