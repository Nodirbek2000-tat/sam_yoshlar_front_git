import { NextResponse } from "next/server";

import { API_BASE } from "@/lib/api";
import { forwardedFor, saveTokens } from "@/lib/session";

/**
 * Tashkilot Telegram'ni ulaganmi — kirish sahifasi har 1–2 soniyada so'raydi.
 *
 * Holatlar: `waiting` (bot hali ochilmagan), `phone` (bot ochildi, raqam
 * kutilmoqda), `linked` (ulandi — shu javobda tizimga kiritamiz),
 * `expired`, `used`, `invalid`.
 */
export async function POST(request: Request) {
    let ticket = "";
    try {
        const body = (await request.json()) as { ticket?: unknown };
        ticket = typeof body.ticket === "string" ? body.ticket : "";
    } catch {
        // pastda «invalid» qaytadi
    }

    if (!ticket) {
        return NextResponse.json({ status: "invalid" }, { status: 400 });
    }

    let upstream: Response;
    try {
        upstream = await fetch(`${API_BASE}/auth/telegram-link/`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...forwardedFor(request) },
            body: JSON.stringify({ ticket }),
            cache: "no-store",
        });
    } catch {
        // Tarmoq uzilishi — brauzer so'rashda davom etadi
        return NextResponse.json({ status: "offline" }, { status: 503 });
    }

    const data = await upstream.json().catch(() => null);

    if (!upstream.ok) {
        return NextResponse.json(
            { status: data?.status ?? "invalid" },
            { status: upstream.status },
        );
    }

    if (data?.status === "linked" && data.access) {
        await saveTokens(data.access, data.refresh);
        return NextResponse.json({
            status: "linked",
            user: data.user,
            onboarding: data.onboarding ?? null,
        });
    }

    return NextResponse.json({ status: data?.status ?? "waiting" });
}
