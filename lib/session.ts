import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

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

/**
 * Django `SIMPLE_JWT` sozlamalari bilan bir xil bo'lsin.
 * Kirish 24 soat amal qiladi — keyin cookie o'chadi va qayta kirish so'raladi.
 */
export const ACCESS_MAX_AGE = 60 * 60 * 24; // 24 soat
export const REFRESH_MAX_AGE = 60 * 60 * 24; // 24 soat

export async function getAccessToken() {
    const store = await cookies();
    return store.get(ACCESS_COOKIE)?.value;
}

/**
 * Joriy foydalanuvchi yoki `null`.
 * Server komponentlarda chaqiriladi — sahifa allaqachon kim kirganini biladi.
 *
 * `cache` — bitta so'rov ichida (sayt qobig'i + kabinet qobig'i + sahifa)
 * Django'ga faqat bir marta boriladi. Oldin har bir sahifa ochilganda
 * shu so'rov 2–3 marta ketardi.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
    const token = await getAccessToken();
    if (!token) return null;

    try {
        return await apiFetch<User>("/auth/me/", { token, revalidate: 0 });
    } catch {
        // Token eskirgan yoki yaroqsiz — mehmon sifatida davom etamiz
        return null;
    }
});

/** Kirish tokenlarini httpOnly cookie'ga yozadi (faqat route handler ichida). */
export async function saveTokens(access: string, refresh: string) {
    const store = await cookies();
    store.set(ACCESS_COOKIE, access, { ...cookieOptions, maxAge: ACCESS_MAX_AGE });
    store.set(REFRESH_COOKIE, refresh, { ...cookieOptions, maxAge: REFRESH_MAX_AGE });
}

/**
 * Foydalanuvchining haqiqiy manzili Django'ga ham yetib borsin.
 *
 * Next Django'ga ichki tarmoqdan murojaat qiladi — sarlavhasiz hamma so'rov
 * bitta (front konteyneri) manzildan kelgandek ko'rinadi va kirishdagi
 * cheklovlar butun sayt uchun umumiy bo'lib qoladi.
 */
export function forwardedFor(request: Request): Record<string, string> {
    const value = request.headers.get("x-forwarded-for");
    return value ? { "X-Forwarded-For": value } : {};
}
