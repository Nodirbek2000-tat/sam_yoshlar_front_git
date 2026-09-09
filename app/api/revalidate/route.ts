import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/session";

/**
 * Panel biror narsani o'zgartirgach keshni tozalash.
 *
 * Ochiq sahifalar keshlangan (yangiliklar ro'yxati, bosh sahifa), shuning
 * uchun admin xabar qo'shsa yoki qoralamaga olsa — o'sha yorliq tozalanadi
 * va o'zgarish saytda darhol ko'rinadi.
 *
 * Faqat panel admini chaqira oladi.
 */
const ALLOWED = new Set([
    "news",
    "events",
    "announcements",
    "initiatives",
    "problems",
    "peers",
    "startups",
    "reference",
]);

export async function POST(request: Request) {
    const user = await getCurrentUser();
    if (!user?.is_panel_admin) {
        return NextResponse.json({ detail: "Ruxsat yo'q." }, { status: 404 });
    }

    const { tag } = (await request.json().catch(() => ({}))) as { tag?: string };
    if (!tag || !ALLOWED.has(tag)) {
        return NextResponse.json({ detail: "Noma'lum yorliq." }, { status: 400 });
    }

    // `expire: 0` — eskirgan nusxa umuman berilmaydi: admin xabar qo'shsa,
    // keyingi so'rov darhol yangi ma'lumotni oladi.
    revalidateTag(tag, { expire: 0 });
    return NextResponse.json({ revalidated: tag });
}
