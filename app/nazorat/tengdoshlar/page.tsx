import { PeersPanel } from "@/components/panel/simple-panels";
import { panelFetch } from "@/lib/panel";
import type { Peer } from "@/lib/types";

type Row = Peer & { status: string | null; visible: boolean };

export default async function PanelPeersPage() {
    const data = await panelFetch<{ count: number; results: Row[] }>("/peers/");

    return <PeersPanel items={data.results} />;
}
