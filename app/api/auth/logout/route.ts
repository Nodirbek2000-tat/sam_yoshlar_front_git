import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/session";

/** Chiqish — cookie'larni o'chiramiz. */
export async function POST() {
    const store = await cookies();
    store.delete(ACCESS_COOKIE);
    store.delete(REFRESH_COOKIE);
    return NextResponse.json({ ok: true });
}
