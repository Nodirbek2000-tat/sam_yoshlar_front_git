import { NextResponse } from "next/server";

import { API_BASE } from "@/lib/api";
import { forwardedFor, getAccessToken } from "@/lib/session";

/**
 * Django API ga autentifikatsiyalangan proksi.
 *
 * Brauzer tokenni ko'rmaydi: u `httpOnly` cookie'da yotadi, biz uni
 * shu yerda sarlavhaga qo'shamiz. Ruxsatni Django o'zi tekshiradi —
 * bu qatlam faqat tokenni yetkazadi.
 */
async function forward(request: Request, path: string[], method: string) {
    const token = await getAccessToken();

    const search = new URL(request.url).search;
    const target = `${API_BASE}/${path.join("/")}/${search}`;

    const hasBody = method !== "GET" && method !== "DELETE";

    // Rasm yuborishda tana `multipart/form-data` bo'ladi — uni o'zgartirmasdan
    // uzatamiz, chegara (boundary) sarlavhada saqlanib qolishi shart.
    const contentType = request.headers.get("content-type") ?? "application/json";
    let body: BodyInit | undefined;

    if (hasBody) {
        body = contentType.startsWith("multipart/")
            ? await request.arrayBuffer()
            : await request.text();
    }

    let upstream: Response;
    try {
        upstream = await fetch(target, {
            method,
            headers: {
                Accept: "application/json",
                ...(hasBody ? { "Content-Type": contentType } : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                // Foydalanuvchining haqiqiy manzili — Django cheklovlari shunga qaraydi
                ...forwardedFor(request),
            },
            body,
            cache: "no-store",
        });
    } catch {
        return NextResponse.json(
            { detail: "Server bilan bog'lanib bo'lmadi." },
            { status: 503 },
        );
    }

    // Tanasiz javoblar (204 — o'chirildi) JSON qilib bo'lmaydi — o'zini qaytaramiz
    if (upstream.status === 204 || upstream.status === 205 || upstream.status === 304) {
        return new NextResponse(null, { status: upstream.status });
    }

    const text = await upstream.text();
    let data: unknown = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        // Django yoki nginx HTML qaytardi (413, 502, ...) — tushunarli xabarga aylantiramiz
        data = {
            detail:
                upstream.status === 413
                    ? "Yuborilgan fayllar juda katta."
                    : upstream.status >= 500
                      ? "Serverda xatolik. Birozdan keyin qayta urinib ko'ring."
                      : `So'rov bajarilmadi (${upstream.status}).`,
        };
    }

    return NextResponse.json(data, { status: upstream.status });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, ctx: Ctx) {
    return forward(request, (await ctx.params).path, "GET");
}

export async function POST(request: Request, ctx: Ctx) {
    return forward(request, (await ctx.params).path, "POST");
}

export async function PATCH(request: Request, ctx: Ctx) {
    return forward(request, (await ctx.params).path, "PATCH");
}

export async function DELETE(request: Request, ctx: Ctx) {
    return forward(request, (await ctx.params).path, "DELETE");
}
