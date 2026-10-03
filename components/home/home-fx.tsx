import type { ReactNode } from "react";

import { CursorRing } from "@/components/home/cursor";

/**
 * Bosh sahifaning harakat qatlami.
 *
 * Aylantirishdagi animatsiyalar CSS'da (`globals.css` → «Chiqish
 * animatsiyalari») va umumiy `FxScript` bilan ishlaydi — kutubxonasiz:
 *
 *   data-fx="heading"  sarlavha so'zma-so'z (yoki harfma-harf) pastdan chiqadi
 *   data-fx="rise"     blok yumshoq ko'tarilib chiqadi
 *   data-fx="cards"    ichidagi kartalar to'lqin bo'lib kiradi
 *   data-fx="rows"     qatorlar chapdan sirg'alib kiradi
 *   data-fx="fill"     matn o'qilgan sari to'ladi (brauzer qo'llasa)
 *   data-speed         parallaks (brauzer qo'llasa)
 *
 * Aylantirish brauzerning o'zida — JS bilan «yumshatilgan» aylantirish
 * (Lenis) olib tashlandi: sekin kompyuterda u sahifani qotirardi.
 */
export function HomeFx({ children }: { children: ReactNode }) {
    return (
        <div>
            {children}
            <CursorRing />
        </div>
    );
}
