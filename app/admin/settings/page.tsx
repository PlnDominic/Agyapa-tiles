import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings, requireAdmin } from "@/lib/store";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireAdmin();
  return (<><PageHeader title="Settings" sub="Contact details and delivery rules for the whole website." /><SettingsForm settings={await getSettings()} /></>);
}
