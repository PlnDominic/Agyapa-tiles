import { notFound } from "next/navigation";
import { adminGetProduct, getCategories } from "@/lib/store";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([adminGetProduct(id), getCategories()]);
  if (!product) notFound();
  return (<><PageHeader title={product.name} sub={product.sku ?? undefined} /><ProductForm key={product.id} product={product} categories={categories} /></>);
}
