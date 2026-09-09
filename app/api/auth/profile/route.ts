import { NextResponse } from "next/server";

import { API_BASE } from "@/lib/api";
import { getAccessToken } from "@/lib/session";

/** Profilni to'ldirish (rol tanlash) — token cookie'dan olinadi. */
export async function PATCH(request: Request) {
    const token = await getAccessToken();
    if (!token) {
        return NextResponse.json({ detail: "Avval tizimga kiring." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    const upstream = await fetch(API_BASE + "/auth/me/", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
    });

    const data = await upstream.json().catch(() => null);

    if (!upstream.ok) {
        const detail =
            data?.detail ??
            (data && typeof data === "object"
                ? Object.values(data).flat().join(" ")
                : "Saqlab bo'lmadi.");
        return NextResponse.json({ detail }, { status: upstream.status });
    }

    return NextResponse.json(data);
}
