import { PageHeader } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { requireAdmin } from "@/lib/store";

export const metadata = { title: "New category" };

export default async function NewCategory() {
  await requireAdmin();
  return (<><PageHeader title="New category" /><CategoryForm /></>);
}
