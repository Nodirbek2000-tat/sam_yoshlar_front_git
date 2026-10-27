import { notFound } from "next/navigation";

import { PollApplicationsView } from "@/components/panel/poll-applications";
import { panelFetch } from "@/lib/panel";
import type { PollApplicationList } from "@/lib/types";

export const metadata = { title: "Nomzod arizalari" };

export default async function PanelPollApplicationsPage({
    params,
}: PageProps<"/nazorat/elonlar/sorovnomalar/[id]/arizalar">) {
    const { id } = await params;
    if (!/^\d+$/.test(id)) notFound();

    const data = await panelFetch<PollApplicationList>(`/polls/${id}/arizalar/`);
    return <PollApplicationsView initial={data} />;
}
