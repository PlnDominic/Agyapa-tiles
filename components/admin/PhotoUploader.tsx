"use client";

import { useState } from "react";
import { attachPhotosAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** Downscale to max 1600px JPEG so a phone photo doesn't cost 8 MB of storage. */
async function shrink(file: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej()), "image/jpeg", 0.86));
  } catch { return file; }
}

export function PhotoUploader() {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<{ matched: number; unmatched: string[]; error?: string } | null>(null);

  async function run(files: FileList) {
    setBusy(true); setResult(null);
    const sb = createClient(); const entries: { sku: string; url: string }[] = []; const failed: string[] = [];
    const list = [...files];
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      setProgress(`Uploading ${i + 1} of ${list.length}…`);
      const sku = f.name.replace(/\.[^.]+$/, "").trim();
      try {
        const blob = await shrink(f);
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${sku.replace(/[^a-z0-9._-]+/gi, "-")}.jpg`;
        const { error } = await sb.storage.from("product-images").upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
        if (error) throw error;
        entries.push({ sku, url: sb.storage.from("product-images").getPublicUrl(path).data.publicUrl });
      } catch { failed.push(sku); }
    }
    setProgress("Matching photos to products…");
    let matched = 0; const unmatched: string[] = [...failed]; let error: string | undefined;
    for (let i = 0; i < entries.length; i += 100) {
      const r = await attachPhotosAction(entries.slice(i, i + 100));
      matched += r.matched; unmatched.push(...r.unmatched); error = r.error ?? error;
    }
    setResult({ matched, unmatched, error }); setProgress(""); setBusy(false);
  }

  if (!configured) return <p className="rounded-2xl bg-brand-50 px-5 py-4 text-sm font-medium text-brand-800">Photo upload needs Supabase to be connected.</p>;
  return (
    <div className="max-w-2xl space-y-5">
      <div className="rounded-[28px] bg-steel-50 p-6">
        <h2 className="font-semibold tracking-tight">How it works</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-steel-600">
          <li>Name each photo after the <b>product code</b>, for example <code className="rounded bg-white px-1.5">FGC66205G.jpg</code> or <code className="rounded bg-white px-1.5">WC-409S.jpg</code>.</li>
          <li>Select as many photos as you like (up to 100 at a time works best).</li>
          <li>Each photo replaces the generated preview on the product with the matching code.</li>
        </ol>
      </div>
      <label className={`block rounded-[28px] border-2 border-dashed border-steel-200 p-10 text-center transition ${busy ? "opacity-60" : "cursor-pointer hover:border-brand-600 hover:bg-brand-50/40"}`}>
        <span className="block text-lg font-semibold tracking-tight">{busy ? progress || "Working…" : "Choose photos"}</span>
        <span className="mt-1 block text-sm text-steel-500">JPG or PNG, named by product code</span>
        <input type="file" accept="image/*" multiple disabled={busy} className="sr-only" onChange={(e) => e.target.files?.length && run(e.target.files)} />
      </label>
      {result && (
        <div role="status" className="space-y-3 rounded-[28px] bg-steel-50 p-6">
          {result.error && <p className="font-medium text-brand-800">{result.error}</p>}
          <p className="font-semibold text-green-800">{result.matched} photo{result.matched === 1 ? "" : "s"} attached to products.</p>
          {result.unmatched.length > 0 && (<div><p className="text-sm font-medium text-steel-700">No product found for {result.unmatched.length} file{result.unmatched.length === 1 ? "" : "s"} (check the name matches the product code):</p>
            <p className="mt-1 break-words text-sm text-steel-500">{result.unmatched.join(", ")}</p></div>)}
        </div>
      )}
      <Button variant="secondary" onClick={() => setResult(null)} className={result ? "" : "hidden"}>Clear</Button>
    </div>
  );
}
