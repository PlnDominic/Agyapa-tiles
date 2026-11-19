"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { ArrowRight, LockIcon } from "@/components/ui/icons";
import { createClient } from "@/lib/supabase/client";
import { HERO_BACKGROUND, SITE } from "@/lib/config";

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const ease = [0.28, 0.11, 0.32, 1] as const;

function AuthForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "ok"; text: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null); setBusy(true);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")), password = String(f.get("password"));
    const sb = createClient();
    try {
      if (mode === "up") {
        const { data, error } = await sb.auth.signUp({ email, password, options: { data: { full_name: String(f.get("name")), phone: String(f.get("phone")) } } });
        if (error) throw error;
        if (!data.session) { setMsg({ type: "ok", text: "Check your email to confirm your account, then sign in." }); setBusy(false); return; }
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      let dest = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      if (!dest) {
        const { data: { user } } = await sb.auth.getUser();
        const { data: profile } = user ? await sb.from("profiles").select("role").eq("id", user.id).maybeSingle() : { data: null };
        dest = profile?.role === "admin" ? "/admin" : "/account";
      }
      router.replace(dest);
      router.refresh();
    } catch (err) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Something went wrong" });
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <div className="rounded-[28px] bg-steel-50 p-8 text-center">
        <p className="font-semibold">Sign-in isn&rsquo;t connected yet</p>
        <p className="mt-2 text-sm text-steel-600">Add your Supabase keys to <code className="rounded bg-white px-1.5 py-0.5">.env.local</code> (or Vercel environment variables) to enable accounts and admin sign-in.</p>
        <Link href="/admin" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline">Open demo admin <ArrowRight width={16} height={16} /></Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 grid grid-cols-2 rounded-full bg-steel-100 p-1" role="tablist">
        {(["in", "up"] as const).map((m) => (
          <button key={m} role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setMsg(null); }} className={`rounded-full py-2.5 text-sm font-semibold transition-all ${mode === m ? "bg-white shadow-soft" : "text-steel-600"}`}>{m === "in" ? "Sign in" : "Create account"}</button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-4">
        {mode === "up" && (<><div><label className="label" htmlFor="name">Full name</label><input id="name" name="name" required className="field" autoComplete="name" /></div>
          <div><label className="label" htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" className="field" autoComplete="tel" /></div></>)}
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required className="field" autoComplete="email" /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" required minLength={8} className="field" autoComplete={mode === "in" ? "current-password" : "new-password"} /></div>
        {msg && <p role="alert" className={`rounded-xl px-4 py-3 text-sm font-medium ${msg.type === "error" ? "bg-brand-50 text-brand-800" : "bg-green-50 text-green-800"}`}>{msg.text}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</Button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-[#111114] text-white lg:block">
        <div aria-hidden className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_BACKGROUND})` }} />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }} className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-4">
            <Image src="/brand/logo-mark.png" alt="" width={110} height={100} priority className="h-14 w-auto" />
            <span aria-hidden className="h-14 w-px bg-white/40" />
            <span className="leading-none"><span className="block text-3xl tracking-[-0.035em]"><b className="font-extrabold">AGYAPA</b> <span className="font-light">TILES</span></span>
              <span className="mt-2 block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/70">We serve our customers best</span></span>
          </div>
          <div>
            <p className="max-w-md text-4xl font-bold leading-[1.05] tracking-[-0.04em] xl:text-5xl">Run your showroom <span className="text-[#e3171e]">from anywhere.</span></p>
            <p className="mt-4 max-w-sm text-lg font-light text-white/80">Orders, products and customers, all in one place.</p>
          </div>
        </motion.div>
      </aside>

      {/* Form */}
      <main className="flex flex-col px-5 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
            <Image src="/brand/logo-full.jpg" alt="Agyapa Tiles — we serve our customers best" width={260} height={167} priority className="mx-auto mb-8 h-auto w-44 mix-blend-multiply sm:w-52 lg:mx-0" />
            <h1 className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Welcome back.</h1>
            <p className="mb-8 mt-2 text-steel-600">Sign in to manage orders and products, or to track your own orders.</p>
            <Suspense><AuthForm /></Suspense>
            <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-steel-500 lg:justify-start"><LockIcon width={14} height={14} />Secure sign-in</p>
          </motion.div>
        </div>
        <p className="mt-8 text-center text-xs text-steel-400 lg:text-left">© {new Date().getFullYear()} {SITE.name}. <Link href="/" className="font-medium text-steel-600 hover:text-brand-600">Back to store</Link></p>
      </main>
    </div>
  );
}
