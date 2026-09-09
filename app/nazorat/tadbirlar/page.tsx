import { EventsPanel, type PanelEvent } from "@/components/panel/events-panel";
import { getReference } from "@/lib/api";
import { panelFetch } from "@/lib/panel";

export default async function PanelEventsPage() {
    const [data, reference] = await Promise.all([
        panelFetch<{ count: number; results: PanelEvent[] }>("/events/"),
        getReference(),
    ]);

    return <EventsPanel events={data.results} regions={reference.regions} />;
}
