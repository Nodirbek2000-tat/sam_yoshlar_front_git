import { InitiativesPanel } from "@/components/panel/initiatives-panel";
import { panelFetch } from "@/lib/panel";
import type { Initiative } from "@/lib/types";

type Row = Initiative & { status: string | null; visible: boolean };

export default async function PanelInitiativesPage() {
    const data = await panelFetch<{ count: number; results: Row[] }>("/initiatives/");

    return <InitiativesPanel items={data.results} />;
}
