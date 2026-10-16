import { LaureatesPanel, type PanelLaureate } from "@/components/panel/laureates-panel";
import { getReference } from "@/lib/api";
import { panelFetch } from "@/lib/panel";

export default async function PanelLaureatesPage() {
    const [data, reference] = await Promise.all([
        panelFetch<{ count: number; results: PanelLaureate[] }>("/laureates/"),
        getReference(),
    ]);

    return <LaureatesPanel items={data.results} districts={reference.districts} />;
}
