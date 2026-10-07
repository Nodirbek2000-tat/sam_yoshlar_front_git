import { AnnouncementTabs } from "@/components/panel/announcement-tabs";
import {
    AnnouncementsPanel,
    type PanelAnnouncement,
} from "@/components/panel/announcements-panel";
import { getReference } from "@/lib/api";
import { panelFetch } from "@/lib/panel";

export default async function PanelAnnouncementsPage() {
    const [data, reference] = await Promise.all([
        panelFetch<{ count: number; results: PanelAnnouncement[] }>("/announcements/"),
        getReference(),
    ]);

    return (
        <>
            <AnnouncementTabs active="elonlar" />
            <AnnouncementsPanel
                announcements={data.results}
                types={reference.announcement_types}
            />
        </>
    );
}
