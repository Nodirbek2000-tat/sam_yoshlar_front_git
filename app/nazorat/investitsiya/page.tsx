import {
    OffersPanel,
    type OfferFilters,
    type OfferStats,
    type PanelOffer,
} from "@/components/panel/offers-panel";
import { panelFetch } from "@/lib/panel";

type OffersPage = {
    stats: OfferStats;
    count: number;
    page: number;
    pages: number;
    results: PanelOffer[];
};

const FILTERS = ["holat", "fikr", "natija", "q"] as const;

export default async function PanelOffersPage({
    searchParams,
}: PageProps<"/nazorat/investitsiya">) {
    const params = await searchParams;

    const filters: OfferFilters = {};
    for (const key of FILTERS) {
        const value = params[key];
        if (typeof value === "string" && value) filters[key] = value;
    }

    const query = new URLSearchParams(filters);
    query.set("page", typeof params.sahifa === "string" ? params.sahifa : "1");

    const data = await panelFetch<OffersPage>(`/investitsiya/?${query.toString()}`);

    return (
        <OffersPanel
            // Filtr o'zgarsa qidiruv maydoni ham yangilansin
            key={filters.q ?? ""}
            offers={data.results}
            stats={data.stats}
            count={data.count}
            page={data.page}
            pages={data.pages}
            filters={filters}
        />
    );
}
