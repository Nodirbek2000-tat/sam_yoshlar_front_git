import { NextResponse } from "next/server";

import { API_BASE } from "@/lib/api";
import { getAccessToken } from "@/lib/session";

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

    const text = await upstream.text();
    const data = text ? JSON.parse(text) : null;

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
