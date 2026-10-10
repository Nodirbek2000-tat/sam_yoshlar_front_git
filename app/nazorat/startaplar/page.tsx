import type { SocialCount } from "@/components/panel/social-filter";
import { StartupsPanel } from "@/components/panel/simple-panels";
import { panelFetch } from "@/lib/panel";
import type { Startup } from "@/lib/types";

type Row = Startup & { status: string | null; visible: boolean };

export default async function PanelStartupsPage({ searchParams }: PageProps<"/nazorat/startaplar">) {
    const params = await searchParams;
    const social = typeof params.holat === "string" ? params.holat : undefined;

    const data = await panelFetch<{ count: number; results: Row[]; social_statuses?: SocialCount[] }>(
        social ? `/startups/?holat=${encodeURIComponent(social)}` : "/startups/",
    );

    return <StartupsPanel items={data.results} social={social} socials={data.social_statuses ?? []} />;
}
