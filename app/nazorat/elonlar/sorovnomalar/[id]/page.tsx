import { notFound } from "next/navigation";

import { PollResultsView } from "@/components/panel/poll-results";
import { panelFetch } from "@/lib/panel";
import type { PollResults } from "@/lib/types";

export const metadata = { title: "So'rovnoma natijalari" };

export default async function PanelPollResultsPage({
    params,
}: PageProps<"/nazorat/elonlar/sorovnomalar/[id]">) {
    const { id } = await params;
    if (!/^\d+$/.test(id)) notFound();

    const results = await panelFetch<PollResults>(`/polls/${id}/natijalar/`);
    return <PollResultsView initial={results} />;
}
