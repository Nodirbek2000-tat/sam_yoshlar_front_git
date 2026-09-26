import { ErrorsPanel, type ServerErrorRow } from "@/components/panel/errors-panel";
import { panelFetch } from "@/lib/panel";

export default async function PanelErrorsPage() {
    const data = await panelFetch<{ count: number; last_day: number; results: ServerErrorRow[] }>(
        "/xatolar/",
    );

    return <ErrorsPanel errors={data.results} total={data.count} lastDay={data.last_day} />;
}
