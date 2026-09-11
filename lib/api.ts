/**
 * Django API bilan ishlash.
 *
 * Server komponentlarda `api.get(...)` to'g'ridan-to'g'ri Django'ga boradi.
 * Brauzerdagi (client) chaqiruvlar uchun `lib/api-client.ts` ishlatiladi —
 * u tokenni qo'shadi.
 */

import type {
    Announcement,
    Direction,
    Event,
    Initiative,
    News,
    Overview,
    Paginated,
    Peer,
    Problem,
    Reference,
    PublicBusiness,
    PublicBusinessDetail,
    PublicStartup,
    PublicStartupDetail,
} from "./types";

/**
 * API manzili.
 *
 * Brauzer uchun — `NEXT_PUBLIC_API_URL` (qurish paytida kodga yoziladi).
 * Server tomonda esa `INTERNAL_API_URL` bo'lsa o'sha ishlatiladi: Docker
 * ichida `http://web:8000/api/v1` orqali to'g'ridan-to'g'ri boradi,
 * tashqariga chiqib nginx orqali qaytmaydi — tezroq va ishonchliroq.
 */
export const API_BASE = (
    (typeof window === "undefined" ? process.env.INTERNAL_API_URL : undefined) ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:8000/api/v1"
).replace(/\/$/, "");

export class ApiError extends Error {
    constructor(
        message: string,
        readonly status: number,
        readonly data?: unknown,
    ) {
        super(message);
        this.name = "ApiError";
    }
}

type Query = Record<string, string | number | undefined | null>;

function buildUrl(path: string, query?: Query) {
    const url = new URL(API_BASE + path);
    if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== null && value !== "") {
                url.searchParams.set(key, String(value));
            }
        }
    }
    return url.toString();
}

export type FetchOptions = RequestInit & {
    query?: Query;
    /** Necha soniya keshda tursin. 0 — keshlanmasin. */
    revalidate?: number;
    /** Kesh yorlig'i — panel o'zgartirganda shu yorliq bo'yicha tozalanadi. */
    tags?: string[];
    token?: string;
};

export async function apiFetch<T>(
    path: string,
    { query, revalidate, tags, token, headers, ...init }: FetchOptions = {},
): Promise<T> {
    const response = await fetch(buildUrl(path, query), {
        ...init,
        headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        // Ma'lumot tez-tez o'zgaradi (ovozlar), shuning uchun qisqa kesh
        next:
            revalidate === undefined && !tags
                ? undefined
                : { ...(revalidate === undefined ? {} : { revalidate }), ...(tags ? { tags } : {}) },
        cache: revalidate === 0 ? "no-store" : undefined,
    });

    if (!response.ok) {
        let data: unknown;
        try {
            data = await response.json();
        } catch {
            data = null;
        }
        const detail =
            (data as { detail?: string } | null)?.detail ??
            `So'rov muvaffaqiyatsiz (${response.status})`;
        throw new ApiError(detail, response.status, data);
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
}

/* --------------------------------------------------------------------------
   Server komponentlar uchun tayyor chaqiruvlar
   -------------------------------------------------------------------------- */

/** Bosh sahifa — hamma bo'limdan parcha, bitta so'rovda. */
export const getOverview = () =>
    apiFetch<Overview>("/overview/", {
        revalidate: 60,
        tags: ["news", "events", "announcements", "initiatives", "peers", "businesses", "startups"],
    });

/**
 * Formalar uchun ro'yxatlar (hududlar, rollar, davlatlar).
 *
 * Javob bir soat keshlanadi. Backendga yangi ro'yxat qo'shilsa, keshdagi
 * eski javobda u bo'lmaydi — shuning uchun har bir maydon bu yerda
 * massiv ekaniga ishonch hosil qilinadi. Aks holda `undefined.map(...)`
 * butun sahifani yiqitadi.
 */
const EMPTY_REFERENCE: Reference = {
    regions: [],
    roles: [],
    all_roles: [],
    initiative_kinds: [],
    news_categories: [],
    problem_questions: [],
    startup_spheres: [],
    startup_stages: [],
    business_spheres: [],
    announcement_types: [],
    organization_spheres: [],
    appeal_categories: [],
    peer_purposes: [],
    countries: [],
};

export async function getReference(): Promise<Reference> {
    const data = await apiFetch<Partial<Reference>>("/reference/", {
        revalidate: 3600,
        tags: ["reference"],
    });

    const merged = { ...EMPTY_REFERENCE };
    for (const key of Object.keys(EMPTY_REFERENCE) as (keyof Reference)[]) {
        const value = data[key];
        if (Array.isArray(value)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (merged as any)[key] = value;
        }
    }
    return merged;
}

/** 14 yo'nalish + jonli statistika. */
export const getDirections = () =>
    apiFetch<Direction[]>("/directions/", { revalidate: 30 });

export const getInitiatives = (query?: Query) =>
    apiFetch<Paginated<Initiative>>("/initiatives/", {
        query,
        revalidate: 15,
        tags: ["initiatives"],
    });

export const getInitiative = (id: number | string) =>
    apiFetch<Initiative>(`/initiatives/${id}/`, { revalidate: 15 });

export const getNewsList = (query?: Query) =>
    apiFetch<Paginated<News>>("/news/", { query, revalidate: 120, tags: ["news"] });

export const getNews = (slug: string) =>
    apiFetch<News>(`/news/${slug}/`, { revalidate: 0 });

export const getEvents = (query?: Query) =>
    apiFetch<Paginated<Event>>("/events/", { query, revalidate: 60, tags: ["events"] });

export const getEvent = (slug: string) =>
    apiFetch<Event>(`/events/${slug}/`, { revalidate: 30, tags: ["events"] });

export const getAnnouncements = (query?: Query) =>
    apiFetch<Paginated<Announcement>>("/announcements/", {
        query,
        revalidate: 120,
        tags: ["announcements"],
    });

export const getAnnouncement = (slug: string) =>
    apiFetch<Announcement>(`/announcements/${slug}/`, {
        revalidate: 120,
        tags: ["announcements"],
    });

export const getProblems = () =>
    apiFetch<Paginated<Problem>>("/problems/", { revalidate: 60, tags: ["problems"] });

export const getProblem = (id: number | string) =>
    apiFetch<Problem>(`/problems/${id}/`, { revalidate: 30 });

export const getPeers = (query?: Query) =>
    apiFetch<Paginated<Peer>>("/peers/", { query, revalidate: 120, tags: ["peers"] });

export const getPeer = (id: number | string) =>
    apiFetch<Peer>(`/peers/${id}/`, { revalidate: 120 });

export const getStartups = (query?: Query) =>
    apiFetch<Paginated<PublicStartup>>("/startups/", {
        query,
        revalidate: 120,
        tags: ["startups"],
    });

export const getStartup = (id: number | string) =>
    apiFetch<PublicStartupDetail>(`/startups/${id}/`, { revalidate: 120, tags: ["startups"] });

export const getBusinesses = (query?: Query) =>
    apiFetch<Paginated<PublicBusiness>>("/businesses/", {
        query,
        revalidate: 120,
        tags: ["businesses"],
    });

export const getBusiness = (id: number | string) =>
    apiFetch<PublicBusinessDetail>(`/businesses/${id}/`, {
        revalidate: 120,
        tags: ["businesses"],
    });
