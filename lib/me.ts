import "server-only";

import { redirect } from "next/navigation";

import { apiFetch } from "./api";
import { getAccessToken } from "./session";

/**
 * Kabinet ma'lumotini oladi. Token bo'lmasa kirish sahifasiga yuboradi.
 */
export async function meFetch<T>(path: string, next = "/kabinet"): Promise<T> {
    const token = await getAccessToken();
    if (!token) redirect(`/kirish?next=${next}`);

    return apiFetch<T>(`/me${path}`, { token, revalidate: 0 });
}

export type CabinetCounts = {
    initiatives: number;
    events: number;
    comments: number;
    solutions: number;
    appeals: number;
    suggestions: number;
    unread: number;
};

export type CabinetOverview = {
    counts: CabinetCounts;
    total_votes: number;
};

export const getCabinetOverview = () => meFetch<CabinetOverview>("/overview/");
