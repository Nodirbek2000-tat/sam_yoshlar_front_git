import "server-only";

import { notFound } from "next/navigation";

import { ApiError, apiFetch } from "./api";
import { getAccessToken, getCurrentUser } from "./session";

/**
 * Panel ma'lumotini oladi. Ruxsat yo'q bo'lsa **404** ko'rsatamiz —
 * panel bor-yo'qligi begonaga bilinmasin.
 */
export async function panelFetch<T>(path: string): Promise<T> {
    const token = await getAccessToken();
    if (!token) notFound();

    try {
        return await apiFetch<T>(`/panel${path}`, { token, revalidate: 0 });
    } catch (error) {
        if (error instanceof ApiError) notFound();
        throw error;
    }
}

/** Panel sahifalari uchun: admin bo'lmasa 404. */
export async function requirePanelAdmin() {
    const user = await getCurrentUser();
    if (!user || !user.is_panel_admin) notFound();
    return user;
}
