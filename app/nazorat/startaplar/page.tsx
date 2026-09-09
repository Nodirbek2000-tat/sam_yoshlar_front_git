import { StartupsPanel } from "@/components/panel/simple-panels";
import { panelFetch } from "@/lib/panel";
import type { Startup } from "@/lib/types";

type Row = Startup & { status: string | null; visible: boolean };

export default async function PanelStartupsPage() {
    const data = await panelFetch<{ count: number; results: Row[] }>("/startups/");

    return <StartupsPanel items={data.results} />;
}
