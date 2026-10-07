import { AnnouncementTabs } from "@/components/panel/announcement-tabs";
import { PollsPanel } from "@/components/panel/polls-panel";
import { getReference } from "@/lib/api";
import { panelFetch } from "@/lib/panel";
import type { PanelPoll } from "@/lib/types";

export const metadata = { title: "So'rovnomalar" };

export default async function PanelPollsPage() {
    const [data, reference] = await Promise.all([
        panelFetch<{ count: number; results: PanelPoll[] }>("/polls/"),
        getReference(),
    ]);

    return (
        <>
            <AnnouncementTabs active="sorovnomalar" />
            <PollsPanel polls={data.results} districts={reference.districts} />
        </>
    );
}
