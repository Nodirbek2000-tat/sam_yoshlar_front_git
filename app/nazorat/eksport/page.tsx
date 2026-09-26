import { ExportsPanel, type ExportSection } from "@/components/panel/exports-panel";
import { panelFetch } from "@/lib/panel";

export default async function PanelExportsPage() {
    const data = await panelFetch<{ results: ExportSection[] }>("/eksport/");

    return <ExportsPanel initial={data.results} />;
}
