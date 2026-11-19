import { getCategories, requireAdmin } from "@/lib/store";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "New product" };

export default async function NewProduct() {
  await requireAdmin();
  return (<><PageHeader title="New product" /><ProductForm categories={await getCategories()} /></>);
}
