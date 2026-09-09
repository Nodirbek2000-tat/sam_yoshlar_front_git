import { NewsManager, type PanelNews } from "@/components/panel/news-manager";
import { getReference } from "@/lib/api";
import { panelFetch } from "@/lib/panel";

export default async function PanelNewsPage() {
    const [data, reference] = await Promise.all([
        panelFetch<{ count: number; results: PanelNews[] }>("/news/"),
        getReference(),
    ]);

    return <NewsManager news={data.results} categories={reference.news_categories} />;
}
