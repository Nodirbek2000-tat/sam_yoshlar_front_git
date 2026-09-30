import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/session";

/**
 * Sarlavha uchun: kim kirgan (yoki `null`).
 *
 * Ochiq sahifalar hamma uchun bir xil bo'lib keshlanadi — shuning uchun
 * foydalanuvchining ismi va rasmi sahifaga emas, shu yerdan brauzerga
 * alohida olinadi. Cookie bo'lmasa Django'ga umuman murojaat qilinmaydi.
 */
export async function GET() {
    const user = await getCurrentUser();

    return NextResponse.json(
        {
            user: user
                ? {
                      full_name: user.full_name,
                      initials: user.initials,
                      avatar: user.avatar,
                      is_panel_admin: user.is_panel_admin,
                      unread: user.unread_notifications ?? 0,
                      feedback: user.pending_feedback ?? null,
                  }
                : null,
        },
        // Har kimga o'zi — hech qayerda keshlanmasin
        { headers: { "Cache-Control": "private, no-store" } },
    );
}
