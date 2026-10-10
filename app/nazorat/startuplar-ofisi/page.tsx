import { OfficePanel, type PanelOfficeStartup } from "@/components/panel/office-panel";
import { getReference } from "@/lib/api";
import { panelFetch } from "@/lib/panel";

export default async function PanelOfficePage() {
    const [data, reference] = await Promise.all([
        panelFetch<{ count: number; results: PanelOfficeStartup[] }>("/office-startups/"),
        getReference(),
    ]);

    return <OfficePanel items={data.results} districts={reference.districts} />;
}
