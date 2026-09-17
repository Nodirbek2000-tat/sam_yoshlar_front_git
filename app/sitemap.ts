import type { MetadataRoute } from "next";

import { apiFetch } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";
import type { Announcement, Event, Initiative, News, Paginated, Peer, PublicBusiness, PublicStartup } from "@/lib/types";

/**
 * Sayt xaritasi — Google va Yandex shu ro'yxat bo'yicha sahifalarni topadi.
 *
 * Har bir bo'lim API'dan sahifama-sahifa yig'iladi. Bo'lim javob bermasa
 * xarita baribir chiqadi — faqat o'sha bo'limsiz.
 */

export const revalidate = 3600;

/** DRF sahifalab beradi: `next` tugaguncha yig'amiz (ko'pi bilan 20 sahifa). */
async function collect<T>(path: string): Promise<T[]> {
    const items: T[] = [];

    for (let page = 1; page <= 20; page += 1) {
        try {
            const data = await apiFetch<Paginated<T>>(path, {
                query: { page },
                revalidate: 3600,
            });
            items.push(...data.results);
            if (!data.next) break;
        } catch {
            break;
        }
    }

    return items;
}

function entry(
    path: string,
    date?: string,
    priority = 0.7,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly",
) {
    return {
        url: `${SITE_URL}${path}`,
        lastModified: date ? new Date(date) : new Date(),
        changeFrequency,
        priority,
    };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [news, events, announcements, initiatives, startups, businesses, peers] =
        await Promise.all([
            collect<News>("/news/"),
            collect<Event>("/events/"),
            collect<Announcement>("/announcements/"),
            collect<Initiative>("/initiatives/"),
            collect<PublicStartup>("/startups/"),
            collect<PublicBusiness>("/businesses/"),
            collect<Peer>("/peers/"),
        ]);

    const pages: MetadataRoute.Sitemap = [
        entry("/", undefined, 1, "daily"),
        entry("/yangiliklar", undefined, 0.9, "daily"),
        entry("/tadbirlar", undefined, 0.9, "daily"),
        entry("/elonlar", undefined, 0.9, "daily"),
        entry("/tashabbuslar", undefined, 0.8),
        entry("/tashabbuslar/yoshlar", undefined, 0.8, "daily"),
        entry("/tashabbuslar/muammolar", undefined, 0.7),
        entry("/tadbirkorlar", undefined, 0.8),
        entry("/startaplar", undefined, 0.8),
        entry("/tengdoshlar", undefined, 0.8),
    ];

    return [
        ...pages,
        ...news.map((item) => entry(`/yangiliklar/${item.slug}`, item.published_at, 0.8, "monthly")),
        ...events.map((item) => entry(`/tadbirlar/${item.slug}`, item.starts_at, 0.7, "weekly")),
        ...announcements.map((item) =>
            entry(`/elonlar/${item.slug}`, item.posted_at, 0.8, "weekly"),
        ),
        ...initiatives.map((item) =>
            entry(`/tashabbuslar/${item.id}`, item.created_at, 0.6, "weekly"),
        ),
        ...startups.map((item) => entry(`/startaplar/${item.id}`, item.created_at, 0.6, "monthly")),
        ...businesses.map((item) =>
            entry(`/tadbirkorlar/${item.id}`, item.created_at, 0.6, "monthly"),
        ),
        ...peers.map((item) => entry(`/tengdoshlar/${item.id}`, item.created_at, 0.6, "monthly")),
    ];
}
