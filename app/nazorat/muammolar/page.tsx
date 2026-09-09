import { ProblemsPanel } from "@/components/panel/simple-panels";
import { panelFetch } from "@/lib/panel";
import type { Problem } from "@/lib/types";

type Row = Problem & { status: string | null; visible: boolean };

export default async function PanelProblemsPage() {
    const data = await panelFetch<{ count: number; results: Row[] }>("/problems/");

    return <ProblemsPanel items={data.results} />;
}
