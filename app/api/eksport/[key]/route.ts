import { NextResponse } from "next/server";

import { API_BASE } from "@/lib/api";
import { getAccessToken } from "@/lib/session";

/**
 * Panel: bo'limning Excel faylini yuklab berish.
 *
 * Umumiy proksi (`/api/proxy`) javobni JSON deb o'qiydi — fayl uchun alohida
 * yo'l kerak: Django tayyorlagan baytlar va fayl nomi o'zgarishsiz brauzerga
 * uzatiladi. Ruxsatni (faqat panel adminlari) Django o'zi tekshiradi.
 */
export async function GET(request: Request, { params }: { params: Promise<{ key: string }> }) {
    const { key } = await params;
    const token = await getAccessToken();
    if (!token) {
        return NextResponse.json({ detail: "Qaytadan tizimga kiring." }, { status: 401 });
    }

    const search = new URL(request.url).search;
    let upstream: Response;
    try {
        upstream = await fetch(`${API_BASE}/panel/eksport/${encodeURIComponent(key)}/${search}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
    } catch {
        return NextResponse.json({ detail: "Server bilan bog'lanib bo'lmadi." }, { status: 503 });
    }

    if (!upstream.ok) {
        const data = await upstream.json().catch(() => null);
        return NextResponse.json(data ?? { detail: "Faylni tayyorlab bo'lmadi." }, {
            status: upstream.status,
        });
    }

    return new Response(upstream.body, {
        headers: {
            "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
            "Content-Disposition":
                upstream.headers.get("content-disposition") ?? `attachment; filename="${key}.xlsx"`,
            "Cache-Control": "no-store",
        },
    });
}
