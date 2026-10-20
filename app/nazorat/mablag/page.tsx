import { FundedPanel, type PanelFundedStartup } from "@/components/panel/funded-panel";
import { panelFetch } from "@/lib/panel";

export default async function PanelFundedPage() {
    const data = await panelFetch<{ count: number; results: PanelFundedStartup[] }>("/funded/");

    return <FundedPanel items={data.results} />;
}
