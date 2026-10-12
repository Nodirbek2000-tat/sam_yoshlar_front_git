import { RegionStatsPanel, type RegionStats } from "@/components/panel/region-stats";
import { panelFetch } from "@/lib/panel";

export default async function PanelRegionsPage() {
    const data = await panelFetch<RegionStats>("/hududlar/");

    return <RegionStatsPanel data={data} />;
}
