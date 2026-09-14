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
    "businesses",
    "reference",
]);

/**
 * Oddiy foydalanuvchi ham tozalay oladigan yorliqlar: chet eldagi yosh
 * anketasini saqlasa, u ro'yxatda darhol (kesh eskirishini kutmasdan) chiqadi.
 */
const SELF_SERVICE = new Set(["peers"]);

export async function POST(request: Request) {
    const user = await getCurrentUser();
    const { tag } = (await request.json().catch(() => ({}))) as { tag?: string };

    const allowed = user?.is_panel_admin || (user && tag && SELF_SERVICE.has(tag));
    if (!allowed) {
        return NextResponse.json({ detail: "Ruxsat yo'q." }, { status: 404 });
    }

    if (!tag || !ALLOWED.has(tag)) {
        return NextResponse.json({ detail: "Noma'lum yorliq." }, { status: 400 });
    }

    // `expire: 0` — eskirgan nusxa umuman berilmaydi: admin xabar qo'shsa,
    // keyingi so'rov darhol yangi ma'lumotni oladi.
    revalidateTag(tag, { expire: 0 });
    return NextResponse.json({ revalidated: tag });
}
