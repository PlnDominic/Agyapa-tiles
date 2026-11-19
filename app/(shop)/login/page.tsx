"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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
      router.replace(next && next.startsWith("/") ? next : "/account");
      router.refresh();
    } catch (err) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Something went wrong" });
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <div className="rounded-[28px] bg-steel-50 p-8 text-center">
        <p className="font-semibold">Accounts are not connected yet</p>
        <p className="mt-2 text-sm text-steel-600">Add your Supabase keys to <code className="rounded bg-white px-1.5 py-0.5">.env.local</code> to enable sign in. Guests can already place and track orders.</p>
        <div className="mt-5 flex justify-center gap-3 text-sm font-medium"><Link href="/track" className="text-brand-600 hover:underline">Track an order</Link><Link href="/admin" className="text-brand-600 hover:underline">Open demo admin</Link></div>
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
    <div className="container-x grid min-h-[70vh] place-items-center py-16">
      <div className="w-full max-w-md">
        <h1 className="t-2 mb-8 text-center">Welcome to Agyapa.</h1>
        <Suspense><AuthForm /></Suspense>
      </div>
    </div>
  );
}
