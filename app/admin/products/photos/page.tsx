import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { requireAdmin } from "@/lib/store";

export const metadata = { title: "Upload photos" };

export default async function PhotosPage() {
  await requireAdmin();
  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-block text-sm font-medium text-steel-500 hover:text-brand-600">← All products</Link>
      <PageHeader title="Bulk photo upload" sub="Match photos to products automatically by product code." />
      <PhotoUploader />
    </>
  );
}
