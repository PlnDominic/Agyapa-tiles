import { notFound } from "next/navigation";
import { adminGetCategory, adminListCategories } from "@/lib/store";
import { PageHeader } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default async function EditCategory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await adminGetCategory(id);
  if (!category) notFound();
  const count = (await adminListCategories()).find((c) => c.id === id)?.productCount ?? 0;
  return (<><PageHeader title={category.name} sub={`${count} product${count === 1 ? "" : "s"}`} /><CategoryForm key={category.id} category={category} productCount={count} /></>);
}
