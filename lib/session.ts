import "server-only";

import { cookies } from "next/headers";

import { apiFetch } from "./api";
import type { User } from "./types";

/**
 * Sessiya — tokenlar `httpOnly` cookie'da.
 *
 * Nega localStorage emas: u JavaScript'ga ochiq, ya'ni sahifaga tushgan
 * begona skript tokenni o'g'irlab keta oladi. httpOnly cookie'ni brauzer
 * faqat serverga yuboradi, JS uni ko'ra olmaydi.
 */

export const ACCESS_COOKIE = "sy_access";
export const REFRESH_COOKIE = "sy_refresh";

const IS_PROD = process.env.NODE_ENV === "production";

export const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: IS_PROD,
    path: "/",
};

/** Django `SIMPLE_JWT` sozlamalari bilan bir xil bo'lsin. */
export const ACCESS_MAX_AGE = 60 * 60 * 12; // 12 soat
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 kun

export async function getAccessToken() {
    const store = await cookies();
    return store.get(ACCESS_COOKIE)?.value;
}

/**
 * Joriy foydalanuvchi yoki `null`.
 * Server komponentlarda chaqiriladi — sahifa allaqachon kim kirganini biladi.
 */
export async function getCurrentUser(): Promise<User | null> {
    const token = await getAccessToken();
    if (!token) return null;

    try {
        return await apiFetch<User>("/auth/me/", { token, revalidate: 0 });
    } catch {
        // Token eskirgan yoki yaroqsiz — mehmon sifatida davom etamiz
        return null;
    }
}
