import { ImportManager } from "@/components/panel/import-manager";
import { requirePanelAdmin } from "@/lib/panel";

export default async function PanelImportPage() {
    await requirePanelAdmin();

    return <ImportManager />;
}
