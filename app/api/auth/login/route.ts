import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { API_BASE } from "@/lib/api";
import {
    ACCESS_COOKIE,
    ACCESS_MAX_AGE,
    REFRESH_COOKIE,
    REFRESH_MAX_AGE,
    cookieOptions,
} from "@/lib/session";

/**
 * Kirish — brauzer shu yerga murojaat qiladi, Django'ga emas.
 *
 * Shunda token brauzerga JavaScript orqali umuman ko'rinmaydi:
 * biz uni `httpOnly` cookie'ga yozamiz.
 */
export async function POST(request: Request) {
    let body: { mode?: string; code?: string; email?: string; password?: string };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ detail: "So'rov noto'g'ri." }, { status: 400 });
    }

    const isTelegram = body.mode !== "password";

    const endpoint = isTelegram ? "/auth/telegram/" : "/auth/login/";
    const payload = isTelegram
        ? { code: body.code ?? "" }
        : { email: body.email ?? "", password: body.password ?? "" };

    let upstream: Response;
    try {
        upstream = await fetch(API_BASE + endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            cache: "no-store",
        });
    } catch {
        return NextResponse.json(
            { detail: "Server bilan bog'lanib bo'lmadi. Keyinroq urinib ko'ring." },
            { status: 503 },
        );
    }

    const data = await upstream.json().catch(() => null);

    if (!upstream.ok) {
        return NextResponse.json(
            { detail: data?.detail ?? "Kirib bo'lmadi." },
            { status: upstream.status },
        );
    }

    const store = await cookies();
    store.set(ACCESS_COOKIE, data.access, { ...cookieOptions, maxAge: ACCESS_MAX_AGE });
    store.set(REFRESH_COOKIE, data.refresh, { ...cookieOptions, maxAge: REFRESH_MAX_AGE });

    // Tokenni brauzerga qaytarmaymiz — faqat foydalanuvchi ma'lumoti
    return NextResponse.json({
        user: data.user,
        needs_profile: data.needs_profile ?? false,
    });
}
