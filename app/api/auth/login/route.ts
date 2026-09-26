import { NextResponse } from "next/server";

import { API_BASE } from "@/lib/api";
import { forwardedFor, saveTokens } from "@/lib/session";

/**
 * Kirish — brauzer shu yerga murojaat qiladi, Django'ga emas.
 *
 * Shunda token brauzerga JavaScript orqali umuman ko'rinmaydi:
 * biz uni `httpOnly` cookie'ga yozamiz.
 *
 * Tashkilot birinchi marta login-parol bilan kirganda token kelmaydi —
 * Django Telegram'ni ulash havolasini beradi. U holda cookie yozilmaydi,
 * brauzer esa `/api/auth/org-link` orqali ulanishni kutadi.
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
            headers: { "Content-Type": "application/json", ...forwardedFor(request) },
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

    // Tashkilot: avval Telegram'ni ulash kerak — token hali yo'q
    if (data?.telegram_required) {
        return NextResponse.json({
            telegram_required: true,
            ticket: data.ticket,
            bot_url: data.bot_url,
            organization: data.organization ?? "",
            first_login: Boolean(data.first_login),
            expires_in: data.expires_in ?? 900,
        });
    }

    await saveTokens(data.access, data.refresh);

    // Tokenni brauzerga qaytarmaymiz — faqat foydalanuvchi ma'lumoti
    return NextResponse.json({
        user: data.user,
        needs_profile: data.needs_profile ?? false,
        // Qaysi qadam qolgani: "role" | "business" | "startup" | null
        onboarding: data.onboarding ?? null,
    });
}
